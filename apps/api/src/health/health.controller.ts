import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { Public } from '../auth/auth.guard';
import Redis from 'ioredis';

@ApiTags('Health')
@Controller('api/v1/health')
export class HealthController {
  constructor(private prisma: PrismaService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Health check' })
  async check() {
    const result: any = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {},
    };

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      result.services.database = { status: 'up' };
    } catch (err: any) {
      result.services.database = { status: 'down', error: err.message };
      result.status = 'degraded';
    }

    try {
      const redis = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        connectTimeout: 3000,
        lazyConnect: true,
      });
      await redis.connect();
      await redis.ping();
      await redis.quit();
      result.services.redis = { status: 'up' };
    } catch (err: any) {
      result.services.redis = { status: 'down', error: err.message };
      result.status = 'degraded';
    }

    return { success: true, data: result };
  }
}
