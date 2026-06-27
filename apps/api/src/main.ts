import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import type { Env } from './config/env.validation';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    { bufferLogs: true }, // buffer until the Pino logger is ready
  );

  // Use Pino as the app-wide logger (structured JSON in prod, pretty in dev).
  app.useLogger(app.get(Logger));

  app.setGlobalPrefix('api');

  const corsOrigin = process.env.CORS_ORIGIN ?? 'http://localhost:3001';
  app.enableCors({ origin: corsOrigin, credentials: true });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strip unknown properties
      forbidNonWhitelisted: true, // 400 on unknown properties
      transform: true, // auto-transform payloads to DTO types
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Pass the shared Logger so exceptions are logged with full context.
  app.useGlobalFilters(new AllExceptionsFilter(app.get(Logger)));
  app.useGlobalInterceptors(new TransformInterceptor());

  const config = app.get(ConfigService<Env, true>);
  const port = config.get('PORT', { infer: true });

  await app.listen(port, '0.0.0.0');
  app.get(Logger).log(`API running on http://localhost:${port}/api`);
}
bootstrap();
