import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Structured request logger — emits one JSON line per completed request.
 *
 * Output format:
 * {"level":"info","message":"GET /api/auth/me 200","service":"auth-module","requestId":"...","method":"GET","path":"/api/auth/me","statusCode":200,"duration":45,"timestamp":"..."}
 */
@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  private readonly serviceName: string;

  constructor() {
    this.serviceName = process.env.SERVICE_NAME ?? 'unknown';
  }

  use(req: Request, res: Response, next: () => void) {
    const start = Date.now();
    const method = req.method;
    const path = req.originalUrl;

    res.on('finish', () => {
      const duration = Date.now() - start;
      const statusCode = res.statusCode;
      const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';

      const entry: Record<string, unknown> = {
        level,
        message: `${method} ${path} ${statusCode}`,
        service: this.serviceName,
        method,
        path,
        statusCode,
        duration,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        timestamp: new Date().toISOString(),
      };

      // Attach request ID if present (set by RequestIdMiddleware)
      const reqId = (req as any).requestId;
      if (reqId) entry.requestId = reqId;

      // Attach user ID if JWT auth populated it
      const user = (req as any).user;
      if (user?.id) entry.userId = user.id;

      const line = JSON.stringify(entry);
      if (statusCode >= 500) {
        process.stderr.write(line + '\n');
      } else {
        process.stdout.write(line + '\n');
      }
    });

    next();
  }
}
