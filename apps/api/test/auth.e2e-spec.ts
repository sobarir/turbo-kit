import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import { Test } from '@nestjs/testing';
import { ValidationPipe } from '@nestjs/common';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import request from 'supertest';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/prisma/prisma.service';

// E2E auth flow. Requires a test database (DATABASE_URL pointing at one).
// Run: docker compose up -d && npm run db:migrate:deploy && npm run test:e2e
describe('Auth (e2e)', () => {
  let app: NestFastifyApplication;
  let prisma: PrismaService;
  const email = `e2e_${Date.now()}@example.com`;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email } });
    await app.close();
  });

  it('registers, then accesses protected route', async () => {
    const server = app.getHttpServer();

    const reg = await request(server)
      .post('/api/auth/register')
      .send({ email, password: 'password123', name: 'E2E' })
      .expect(201);

    const token = reg.body.accessToken;
    expect(token).toBeDefined();

    await request(server)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });

  it('rejects protected route without token', async () => {
    await request(app.getHttpServer()).get('/api/users/me').expect(401);
  });
});
