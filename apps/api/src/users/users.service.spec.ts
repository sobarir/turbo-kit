import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from 'src/prisma/prisma.service';

describe('UsersService', () => {
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

  it('findOne returns a user', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'u1', email: 'a@b.com' });
    await expect(service.findOne('u1')).resolves.toEqual({
      id: 'u1',
      email: 'a@b.com',
    });
  });

  it('findOne throws 404 when missing', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    await expect(service.findOne('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('findAll returns list', async () => {
    prisma.user.findMany.mockResolvedValue([{ id: 'u1' }]);
    await expect(service.findAll()).resolves.toHaveLength(1);
  });
});
