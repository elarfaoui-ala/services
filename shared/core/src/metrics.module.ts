import { Module, Global, OnModuleInit } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { MetricsController } from './metrics.controller';
import { MetricsMiddleware } from './metrics.middleware';

@Global()
@Module({
  controllers: [MetricsController],
  providers: [MetricsService, MetricsMiddleware],
  exports: [MetricsService, MetricsMiddleware],
})
export class MetricsModule implements OnModuleInit {
  constructor(private readonly metrics: MetricsService) {}

  onModuleInit() {
    this.metrics.registerDefaults();
  }
}
