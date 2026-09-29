import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Global exception filter that outputs structured JSON error logs.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly serviceName: string;

  constructor() {
    this.serviceName = process.env.SERVICE_NAME ?? 'unknown';
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let errorName = 'InternalServerError';
    let stack: string | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      message = typeof res === 'string' ? res : (res as any).message ?? message;
      if (Array.isArray(message)) message = message[0];
      errorName = exception.name;
    } else if (exception instanceof Error) {
      errorName = exception.name;
      message = exception.message;
      stack = exception.stack;
    } else {
      errorName = 'UnknownError';
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = String(exception);
    }

    const reqId = (request as any).requestId;
    const user = (request as any).user;

    const entry: Record<string, unknown> = {
      level: status >= 500 ? 'error' : 'warn',
      message: `Exception: ${errorName}`,
      service: this.serviceName,
      method: request.method,
      path: request.url,
      statusCode: status,
      error: errorName,
      errorMessage: message,
      timestamp: new Date().toISOString(),
    };

    if (reqId) entry.requestId = reqId;
    if (user?.id) entry.userId = user.id;

    const line = JSON.stringify(entry);
    if (status >= 500) {
      process.stderr.write(line + '\n');
    } else {
      process.stdout.write(line + '\n');
    }

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
      requestId: reqId,
    });
  }
}
