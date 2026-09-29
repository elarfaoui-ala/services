import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const apiKey = request.headers['x-api-key'] as string | undefined;

    if (!process.env.API_KEY) {
      throw new ForbiddenException('API_KEY not configured');
    }

    if (apiKey === process.env.API_KEY) return true;

    throw new ForbiddenException('Invalid or missing API key');
  }
}
