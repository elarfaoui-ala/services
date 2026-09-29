import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { StructuredLogger } from '@services/core';

async function bootstrap() {
  const logger = new StructuredLogger(process.env.SERVICE_NAME ?? 'ai-module');
  const app = await NestFactory.create(AppModule, { logger });
  const config = app.get(ConfigService);

  const corsOrigins = (
    config.get<string>('CORS_ORIGINS') ??
    config.get<string>('FRONTEND_URL', 'http://localhost:3000')
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

  try {
    const { SwaggerModule, DocumentBuilder } = await import('@nestjs/swagger');
    const swaggerConfig = new DocumentBuilder()
      .setTitle('AI Module API')
      .setDescription('Claude-powered streaming chat and document summarizer')
      .setVersion('1.0.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document);
    logger.log(`Swagger docs at http://localhost:${config.get('PORT', 4003)}/api/docs`);
  } catch {
    logger.log('Swagger skipped — install @nestjs/swagger to enable');
  }

  app.enableShutdownHooks();

  const port = config.get('PORT', 4003);
  await app.listen(port);
  logger.log(`AI service running on http://localhost:${port}/api`);
}

bootstrap();
