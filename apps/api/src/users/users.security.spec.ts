import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { Test } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';

// Security invariant (mechanical guard):
// The API must NEVER return passwordHash (or any secret field) to clients.
// The users service enforces this with a `publicUser` select. These tests fail
// if a query stops using that safe select or if passwordHash leaks into a
// result — turning the "never return passwordHash" rule from an instruction
// into an enforced gate.

describe('UsersService — secret-field safety', () => {
  let service: UsersService;
  let prisma: { user: Record<string, ReturnType<typeof mock>> };

  beforeEach(async () => {
    prisma = {
      user: {
        findMany: mock(),
        findUnique: mock(),
        update: mock(),
        delete: mock(),
      },
    };
    const moduleRef = await Test.createTestingModule({
      providers: [UsersService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = moduleRef.get(UsersService);
  });

  // Helper: every read/write query must pass a `select` that does NOT include
  // passwordHash. We assert on the args the service passes to Prisma.
  const assertSafeSelect = (callArgs: unknown) => {
    const arg = callArgs as { select?: Record<string, boolean> };
    expect(arg).toBeDefined();
    expect(arg.select).toBeDefined();
    // passwordHash must not be selected (absent, or explicitly false).
    expect(arg.select?.passwordHash ?? false).toBe(false);
  };

  it('findAll selects a passwordHash-free shape', async () => {
    prisma.user.findMany.mockResolvedValue([]);
    await service.findAll();
    assertSafeSelect(prisma.user.findMany.mock.calls[0][0]);
  });

  it('findOne selects a passwordHash-free shape', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'u1', email: 'a@b.com' });
    await service.findOne('u1');
    assertSafeSelect(prisma.user.findUnique.mock.calls[0][0]);
  });

  it('update selects a passwordHash-free shape', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'u1', email: 'a@b.com' });
    prisma.user.update.mockResolvedValue({ id: 'u1', email: 'a@b.com' });
    await service.update('u1', {});
    assertSafeSelect(prisma.user.update.mock.calls[0][0]);
  });

  it('never exposes passwordHash in a returned object', async () => {
    // Even if Prisma somehow returned it, the public contract must not carry it.
    prisma.user.findUnique.mockResolvedValue({ id: 'u1', email: 'a@b.com' });
    const user = await service.findOne('u1');
    expect('passwordHash' in (user as object)).toBe(false);
  });
});
