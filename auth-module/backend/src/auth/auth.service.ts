import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { eq, and, gt, lt } from 'drizzle-orm';
import { randomBytes, createHash } from 'crypto';
import { db } from '../db';
import { users, refreshTokens, verificationTokens, passwordResetTokens } from '../db/schema';
import { EmailService } from '../email/email.service';
import { EventBus, EVENTS } from '@services/core';
import { RegisterDto, LoginDto, JwtPayload, AuthTokens, AuthResponse } from './auth.dto';

const SALT_ROUNDS = 12;
const ACCESS_EXPIRY = '15m';
const REFRESH_EXPIRY = '7d';
const MS_7_DAYS = 7 * 24 * 60 * 60 * 1000;

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private jwtService: JwtService,
    private emailService: EmailService,
    private eventBus: EventBus,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const existing = await db.query.users.findFirst({
      where: eq(users.email, dto.email),
    });
    if (existing) throw new ConflictException('Email already in use');

    const hashed = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const [user] = await db
      .insert(users)
      .values({
        email: dto.email,
        password: hashed,
        name: dto.name,
        role: dto.role ?? 'user',
      })
      .returning();

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.saveRefreshToken(user.id, tokens.refreshToken);
    await this.createAndSendVerificationToken(user);

    this.logger.log(`User registered: ${user.email} (${user.id})`);

    this.eventBus
      .publish(
        EVENTS.USER_REGISTERED,
        {
          userId: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        'auth-module',
      )
      .catch((err) => this.logger.warn(`Failed to publish USER_REGISTERED: ${err}`));

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        emailVerified: false,
      },
    };
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await db.query.users.findFirst({
      where: eq(users.email, dto.email),
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    this.logger.log(`User logged in: ${user.email}`);

    this.eventBus
      .publish(
        EVENTS.USER_LOGGED_IN,
        {
          userId: user.id,
          email: user.email,
        },
        'auth-module',
      )
      .catch((err) => this.logger.warn(`Failed to publish USER_LOGGED_IN: ${err}`));

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        emailVerified: user.emailVerified,
      },
    };
  }

  async refresh(token: string): Promise<AuthTokens> {
    const tokenHash = hashToken(token);
    const stored = await db.query.refreshTokens.findFirst({
      where: and(eq(refreshTokens.token, tokenHash), gt(refreshTokens.expiresAt, new Date())),
    });
    if (!stored) throw new UnauthorizedException('Invalid or expired refresh token');

    const user = await db.query.users.findFirst({
      where: eq(users.id, stored.userId),
    });
    if (!user) throw new NotFoundException('User not found');

    await db.delete(refreshTokens).where(eq(refreshTokens.token, tokenHash));
    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  async logout(token: string): Promise<void> {
    const tokenHash = hashToken(token);
    const result = await db
      .delete(refreshTokens)
      .where(eq(refreshTokens.token, tokenHash))
      .returning({ id: refreshTokens.id });
    if (result.length > 0) {
      this.logger.log(`Refresh token revoked: ${result[0].id}`);
    }
  }

  async verifyEmail(token: string): Promise<void> {
    const stored = await db.query.verificationTokens.findFirst({
      where: and(
        eq(verificationTokens.token, token),
        eq(verificationTokens.type, 'email_verification'),
        gt(verificationTokens.expiresAt, new Date()),
        eq(verificationTokens.usedAt, null as any),
      ),
    });
    if (!stored) throw new BadRequestException('Invalid or expired verification token');

    await db.update(users).set({ emailVerified: true }).where(eq(users.id, stored.userId));
    await db
      .update(verificationTokens)
      .set({ usedAt: new Date() })
      .where(eq(verificationTokens.id, stored.id));
    this.logger.log(`Email verified for user: ${stored.userId}`);
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await db.query.users.findFirst({ where: eq(users.email, email) });
    if (!user) {
      this.logger.warn(`Password reset requested for unknown email: ${email}`);
      return;
    }
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await db.insert(passwordResetTokens).values({ userId: user.id, token, expiresAt });
    await this.emailService.sendPasswordResetEmail(user.email, token);
    this.logger.log(`Password reset email sent to: ${user.email}`);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const stored = await db.query.passwordResetTokens.findFirst({
      where: and(
        eq(passwordResetTokens.token, token),
        gt(passwordResetTokens.expiresAt, new Date()),
        eq(passwordResetTokens.usedAt, null as any),
      ),
    });
    if (!stored) throw new BadRequestException('Invalid or expired reset token');

    const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await db.update(users).set({ password: hashed }).where(eq(users.id, stored.userId));
    await db
      .update(passwordResetTokens)
      .set({ usedAt: new Date() })
      .where(eq(passwordResetTokens.id, stored.id));
    this.logger.log(`Password reset for user: ${stored.userId}`);

    this.eventBus
      .publish(
        EVENTS.USER_PASSWORD_RESET,
        {
          userId: stored.userId,
          email: '',
        },
        'auth-module',
      )
      .catch((err) => this.logger.warn(`Failed to publish USER_PASSWORD_RESET: ${err}`));
  }

  async cleanupExpiredTokens(): Promise<number> {
    const deleted = await db
      .delete(refreshTokens)
      .where(lt(refreshTokens.expiresAt, new Date()))
      .returning({ id: refreshTokens.id });
    await db.delete(verificationTokens).where(lt(verificationTokens.expiresAt, new Date()));
    await db.delete(passwordResetTokens).where(lt(passwordResetTokens.expiresAt, new Date()));
    if (deleted.length > 0) {
      this.logger.log(`Cleaned up ${deleted.length} expired refresh tokens`);
    }
    return deleted.length;
  }

  private async createAndSendVerificationToken(user: { id: string; email: string }): Promise<void> {
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await db.insert(verificationTokens).values({ userId: user.id, token, expiresAt });
    await this.emailService.sendVerificationEmail(user.email, token);
  }

  private async generateTokens(userId: string, email: string, role: string): Promise<AuthTokens> {
    const payload: JwtPayload = { sub: userId, email, role };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, { expiresIn: ACCESS_EXPIRY }),
      this.jwtService.signAsync(payload, { expiresIn: REFRESH_EXPIRY }),
    ]);
    return { accessToken, refreshToken };
  }

  private async saveRefreshToken(userId: string, token: string): Promise<void> {
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + MS_7_DAYS);
    await db.insert(refreshTokens).values({ userId, token: tokenHash, expiresAt });
  }
}
