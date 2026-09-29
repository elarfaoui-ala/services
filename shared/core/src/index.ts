// Exception filter & middleware
export { AllExceptionsFilter } from './exception-filter';
export { RequestLoggerMiddleware } from './logger.middleware';
export { RequestIdMiddleware } from './request-id.middleware';

// Structured JSON logger
export { StructuredLogger } from './structured-logger';
export type { LogEntry } from './structured-logger';

// Prometheus metrics
export { MetricsModule } from './metrics.module';
export { MetricsService } from './metrics.service';
export { MetricsController } from './metrics.controller';
export { MetricsMiddleware } from './metrics.middleware';

// Redis & events
export { RedisModule, REDIS_CLIENT } from './redis.module';
export { EventBus, EventPayload } from './event-bus';
export { EVENTS, EventName } from './events';
export type {
  UserRegisteredEvent,
  UserLoggedInEvent,
  UserPasswordResetEvent,
  NotificationSentEvent,
  DashboardDataUpdatedEvent,
} from './events';
