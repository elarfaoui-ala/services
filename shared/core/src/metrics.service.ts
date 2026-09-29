import { Injectable } from '@nestjs/common';
import {
  Registry,
  Counter,
  Histogram,
  Gauge,
  collectDefaultMetrics,
  CounterConfiguration,
  HistogramConfiguration,
} from 'prom-client';

@Injectable()
export class MetricsService {
  readonly registry: Registry;
  private registered = false;

  constructor() {
    this.registry = new Registry();
  }

  registerDefaults() {
    if (this.registered) return;
    this.registered = true;

    collectDefaultMetrics({
      register: this.registry,
      prefix: process.env.SERVICE_NAME
        ? `${process.env.SERVICE_NAME.replace(/-/g, '_')}_`
        : '',
    });
  }

  /**
   * Create a Counter metric.
   */
  createCounter(config: CounterConfiguration<string>): Counter {
    return new Counter({ ...config, registers: [this.registry] });
  }

  /**
   * Create a Histogram metric (for durations, latencies).
   */
  createHistogram(config: HistogramConfiguration<string>): Histogram {
    return new Histogram({ ...config, registers: [this.registry] });
  }

  /**
   * Create a Gauge metric.
   */
  createGauge(config: { name: string; help: string; labelNames?: string[] }): Gauge {
    return new Gauge({ ...config, registers: [this.registry] } as any);
  }

  /**
   * Export all metrics in Prometheus text format.
   */
  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }

  /**
   * Get content type for Prometheus exposition.
   */
  getContentType(): string {
    return this.registry.contentType;
  }
}
