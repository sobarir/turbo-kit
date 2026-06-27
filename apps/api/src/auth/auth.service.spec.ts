import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: {
    user: {
      findUnique: ReturnType<typeof mock>;
      create: ReturnType<typeof mock>;
    };
    refreshToken: { create: ReturnType<typeof mock> };
  };

  beforeEach(async () => {
    prisma = {
      user: { findUnique: mock(), create: mock() },
      refreshToken: { create: mock() },
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        {
          provide: JwtService,
          useValue: { signAsync: mock(async () => 'access.jwt') },
        },
        {
          provide: ConfigService,
          useValue: {
            get: (k: string) =>
              ({
                JWT_SECRET: 'test-secret-at-least-16-chars',
                JWT_EXPIRES_IN: '15m',
                JWT_REFRESH_EXPIRES_IN: '7d',
              })[k],
          },
        },
      ],
    }).compile();

    service = moduleRef.get(AuthService);
  });

  describe('register', () => {
    it('creates a user and returns tokens', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: 'u1',
        email: 'a@b.com',
        role: 'USER',
      });
      prisma.refreshToken.create.mockResolvedValue({});

      const tokens = await service.register({
        email: 'a@b.com',
        password: 'password123',
      });

      expect(tokens.accessToken).toBe('access.jwt');
      expect(typeof tokens.refreshToken).toBe('string');
      expect(prisma.user.create).toHaveBeenCalled();
    });

    it('rejects a duplicate email', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'u1' });
      await expect(
        service.register({ email: 'a@b.com', password: 'password123' }),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('login', () => {
    it('rejects unknown email', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(
        service.login({ email: 'x@y.com', password: 'password123' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('rejects wrong password', async () => {
      const hash = await argon2.hash('correct-password');
      prisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        email: 'a@b.com',
        role: 'USER',
        passwordHash: hash,
      });
      await expect(
        service.login({ email: 'a@b.com', password: 'wrong-password' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('accepts correct password', async () => {
      const hash = await argon2.hash('correct-password');
      prisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        email: 'a@b.com',
        role: 'USER',
        passwordHash: hash,
      });
      prisma.refreshToken.create.mockResolvedValue({});
      const tokens = await service.login({
        email: 'a@b.com',
        password: 'correct-password',
      });
      expect(tokens.accessToken).toBe('access.jwt');
    });
  });
});
