import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule }   from './app.module';
import { ConfigService } from '@nestjs/config';
import { StructuredLogger } from '@services/core';

async function bootstrap() {
  const logger = new StructuredLogger(process.env.SERVICE_NAME ?? 'auth-module');
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
    origin:      corsOrigins,
    credentials: true,
  });

  app.setGlobalPrefix('api');

  app.enableShutdownHooks();

  try {
    const { SwaggerModule, DocumentBuilder } = await import('@nestjs/swagger');
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Auth Module API')
      .setDescription('Authentication service with JWT, email verification & password reset')
      .setVersion('2.0.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document);
    logger.log(`Swagger docs at http://localhost:${config.get('PORT', 4000)}/api/docs`);
  } catch {
    logger.log('Swagger skipped — install @nestjs/swagger to enable');
  }

  const port = config.get('PORT', 4000);
  await app.listen(port);
  logger.log(`Auth service running on http://localhost:${port}/api`);
}

bootstrap();
