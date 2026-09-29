import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import { MetricsService } from './metrics.service';
import { Counter, Histogram } from 'prom-client';

/** Replace UUIDs, numeric IDs, and other dynamic path segments with :id */
function normalizePath(raw: string): string {
  return raw
    .split('?')[0]                                                        // strip query string
    .replace(
      /\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
      '/:id',
    )
    .replace(/\/\d+/g, '/:id')                                            // numeric IDs
    .replace(
      /\/[A-Za-z0-9_-]{20,}/g,
      '/:id',
    );                                                                    // long opaque slugs
}

/**
 * Automatic HTTP metrics collector.
 *
 * Records:
 *  - http_requests_total (counter) — count by service, method, path, status
 *  - http_request_duration_seconds (histogram) — latency by service, method, path, status
 */
@Injectable()
export class MetricsMiddleware implements NestMiddleware {
  private readonly httpRequestTotal: Counter;
  private readonly httpRequestDuration: Histogram;
  private readonly serviceName: string;

  constructor(private readonly metrics: MetricsService) {
    this.serviceName = (process.env.SERVICE_NAME ?? 'unknown').replace(/-/g, '_');

    this.httpRequestTotal = metrics.createCounter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['service', 'method', 'path', 'status'],
    });

    this.httpRequestDuration = metrics.createHistogram({
      name: 'http_request_duration_seconds',
      help: 'HTTP request duration in seconds',
      labelNames: ['service', 'method', 'path', 'status'],
      buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
    });
  }

  use(req: Request, res: Response, next: () => void) {
    const start = process.hrtime.bigint();
    const method = req.method;
    const path = normalizePath(req.route?.path ?? req.originalUrl);

    res.on('finish', () => {
      const durationNs = Number(process.hrtime.bigint() - start);
      const durationSec = durationNs / 1e9;
      const status = String(res.statusCode);

      this.httpRequestTotal.inc({ service: this.serviceName, method, path, status });
      this.httpRequestDuration.observe({ service: this.serviceName, method, path, status }, durationSec);
    });

    next();
  }
}
