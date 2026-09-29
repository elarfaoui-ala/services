import 'reflect-metadata';
import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { APP_PIPE, APP_GUARD, APP_FILTER } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { EmailModule } from './email/email.module';
import { HealthController } from './health/health.controller';
import {
  AllExceptionsFilter,
  RequestLoggerMiddleware,
  RequestIdMiddleware,
  RedisModule,
  MetricsModule,
  MetricsMiddleware,
} from '@services/core';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 20 }]),
    RedisModule,
    MetricsModule,
    EmailModule,
    AuthModule,
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware, MetricsMiddleware, RequestLoggerMiddleware).forRoutes('*');
  }
}
