import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { loggerModule } from './config/logger.config';
import { validateEnv } from './config/env.validation';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AiModule } from './ai/ai.module';
import { HealthModule } from './health/health.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    loggerModule,
    PrismaModule,
    AuthModule,
    UsersModule,
    AiModule,
    HealthModule,
  ],
  providers: [
    // Global auth: every route protected unless @Public()
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    // Global role enforcement for @Roles()
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
