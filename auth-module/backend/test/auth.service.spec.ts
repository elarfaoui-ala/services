import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { EventBus } from '@services/core';
import { AuthService } from '../src/auth/auth.service';
import { EmailService } from '../src/email/email.service';
import { db } from '../src/db';

jest.mock('../src/db', () => ({
  db: {
    query: {
      users: { findFirst: jest.fn() },
      refreshTokens: { findFirst: jest.fn() },
      verificationTokens: { findFirst: jest.fn() },
      passwordResetTokens: { findFirst: jest.fn() },
    },
    insert: jest.fn().mockReturnValue({
      values: jest.fn().mockReturnValue({
        returning: jest
          .fn()
          .mockResolvedValue([
            { id: '1', email: 'test@test.com', name: 'Test', role: 'user', emailVerified: false },
          ]),
      }),
    }),
    update: jest.fn().mockReturnValue({
      set: jest.fn().mockReturnValue({
        where: jest.fn().mockResolvedValue(undefined),
      }),
    }),
    delete: jest.fn().mockReturnValue({
      where: jest.fn().mockReturnValue({
        returning: jest.fn().mockResolvedValue([]),
      }),
    }),
  },
}));

const findFirstUserMock = db.query.users.findFirst as jest.Mock;

describe('AuthService', () => {
  let service: AuthService;

  const mockJwtService = {
    signAsync: jest.fn().mockResolvedValue('mock-token'),
  };

  const mockEmailService = {
    sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
    sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: mockJwtService },
        { provide: EmailService, useValue: mockEmailService },
        { provide: EventBus, useValue: { publish: jest.fn().mockResolvedValue(undefined) } },
      ],
    }).compile();
    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('register', () => {
    it('should register a new user', async () => {
      findFirstUserMock.mockResolvedValue(null);
      const result = await service.register({
        email: 'a@b.com',
        password: '12345678',
        name: 'Test',
      });
      expect(result.user.email).toBe('test@test.com');
      expect(mockEmailService.sendVerificationEmail).toHaveBeenCalled();
    });

    it('should throw ConflictException for duplicate email', async () => {
      findFirstUserMock.mockResolvedValue({
        id: '1',
        email: 'a@b.com',
      });
      await expect(
        service.register({ email: 'a@b.com', password: '12345678', name: 'Test' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException for unknown email', async () => {
      findFirstUserMock.mockResolvedValue(null);
      await expect(service.login({ email: 'x@y.com', password: 'p' })).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
