import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import { randomUUID } from 'crypto';

const REQUEST_ID_HEADER = 'x-request-id';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: () => void) {
    const ctx = req as any;
    const incomingId = req.headers[REQUEST_ID_HEADER];

    if (incomingId && typeof incomingId === 'string') {
      ctx.requestId = incomingId;
    } else {
      ctx.requestId = randomUUID();
    }

    _res.setHeader(REQUEST_ID_HEADER, ctx.requestId);
    next();
  }
}
