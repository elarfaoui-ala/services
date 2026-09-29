import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { StructuredLogger } from '@services/core';

async function bootstrap() {
  const logger = new StructuredLogger(process.env.SERVICE_NAME ?? 'dashboard-module');
  const app = await NestFactory.create(AppModule, { logger });

  const helmet = await import('helmet');
  app.use(helmet.default());

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
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  try {
    const { SwaggerModule, DocumentBuilder } = await import('@nestjs/swagger');
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Dashboard Module API')
      .setDescription('Analytics dashboard with KPIs, charts, and date range filters')
      .setVersion('1.0.0')
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document);
    logger.log(`Swagger docs at http://localhost:${process.env.PORT ?? 4002}/api/docs`);
  } catch {
    logger.log('Swagger skipped — install @nestjs/swagger to enable');
  }

  app.enableShutdownHooks();

  const port = process.env.PORT ?? 4002;
  await app.listen(port);
  logger.log(`Dashboard API running on http://localhost:${port}/api`);
}
bootstrap();
