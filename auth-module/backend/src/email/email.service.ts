import { Injectable, Logger } from '@nestjs/common';
import { ConfigService }      from '@nestjs/config';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: any = null;

  constructor(private config: ConfigService) {}

  private async getTransporter() {
    if (this.transporter) return this.transporter;
    try {
      // @ts-expect-error - nodemailer is optional
      const nodemailer = await import('nodemailer');
      const host = this.config.get('SMTP_HOST', 'localhost');
      const port = this.config.get('SMTP_PORT', 1025);
      const user = this.config.get('SMTP_USER', '');
      const pass = this.config.get('SMTP_PASS', '');
      if (user && pass) {
        this.transporter = nodemailer.default.createTransport({ host, port, auth: { user, pass } });
      } else {
        this.transporter = nodemailer.default.createTransport({ host, port });
      }
    } catch {
      this.logger.warn('Nodemailer not available — install with: npm install nodemailer @types/nodemailer');
      return null;
    }
    return this.transporter;
  }

  async sendMail(to: string, subject: string, html: string): Promise<void> {
    const transporter = await this.getTransporter();
    if (!transporter) {
      this.logger.log(`[EMAIL] To: ${to} | Subject: ${subject} | Body: ${html}`);
      return;
    }
    const from = this.config.get('SMTP_FROM', 'noreply@auth-module.local');
    await transporter.sendMail({ from, to, subject, html });
    this.logger.log(`Email sent to ${to}: ${subject}`);
  }

  async sendVerificationEmail(to: string, token: string): Promise<void> {
    const url = `${this.config.get('FRONTEND_URL', 'http://localhost:3000')}/verify-email?token=${token}`;
    await this.sendMail(
      to,
      'Verify your email',
      `<p>Click <a href="${url}">here</a> to verify your email address.</p><p>Token: ${token}</p>`,
    );
  }

  async sendPasswordResetEmail(to: string, token: string): Promise<void> {
    const url = `${this.config.get('FRONTEND_URL', 'http://localhost:3000')}/reset-password?token=${token}`;
    await this.sendMail(
      to,
      'Reset your password',
      `<p>Click <a href="${url}">here</a> to reset your password.</p><p>Token: ${token}</p>`,
    );
  }
}
