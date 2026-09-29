import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { StructuredLogger, AllExceptionsFilter } from '@services/core';

async function bootstrap() {
  const logger = new StructuredLogger(process.env.SERVICE_NAME ?? 'notification-module');
  const app = await NestFactory.create(AppModule, { logger });

  const corsOrigins = (
    process.env.CORS_ORIGINS ??
    process.env.FRONTEND_URL ??
    'http://localhost:3000'
  )
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());

  try {
    const { SwaggerModule, DocumentBuilder } = await import('@nestjs/swagger');
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Notification Module API')
      .setDescription('Real-time WebSocket notification system with REST API')
      .setVersion('1.0.0')
      .addApiKey({ type: 'apiKey', name: 'x-api-key', in: 'header' }, 'api-key')
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document);
    logger.log(`Swagger docs at http://localhost:${process.env.PORT ?? 4001}/api/docs`);
  } catch {
    logger.log('Swagger skipped — install @nestjs/swagger to enable');
  }

  app.enableShutdownHooks();

  const port = process.env.PORT ?? 4001;
  await app.listen(port);
  logger.log(`Notification service running on http://localhost:${port}/api`);
  logger.log(`WebSocket available at ws://localhost:${port}/notifications`);
}

bootstrap();
