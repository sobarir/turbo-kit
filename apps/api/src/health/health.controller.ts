import { Controller, Get } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { PrismaService } from '../prisma/prisma.service';

// Liveness/readiness endpoint. Public (no auth) so load balancers, container
// orchestrators, and E2E start-up checks can poll it. Returns ok + a quick DB
// check so "up" also means "can reach the database".
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @Get()
  async check() {
    let database = 'up';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      database = 'down';
    }
    return {
      status: 'ok',
      database,
      timestamp: new Date().toISOString(),
    };
  }
}
