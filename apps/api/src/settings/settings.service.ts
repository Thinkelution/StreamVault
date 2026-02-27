import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class SettingsService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  async findAll() {
    return this.prisma.setting.findMany({ orderBy: { key: 'asc' } });
  }

  async findOne(key: string) {
    const setting = await this.prisma.setting.findUnique({ where: { key } });
    if (!setting) throw new NotFoundException(`Setting "${key}" not found`);
    return setting;
  }

  async upsert(
    key: string,
    value: any,
    userId?: string,
    ip?: string,
  ) {
    const setting = await this.prisma.setting.upsert({
      where: { key },
      create: { key, value, updatedBy: userId },
      update: { value, updatedBy: userId },
    });

    await this.audit.log({
      userId,
      action: 'update',
      resourceType: 'setting',
      resourceId: key,
      meta: { value },
      ip,
    });

    return setting;
  }

  async remove(key: string, userId?: string, ip?: string) {
    await this.findOne(key);
    await this.prisma.setting.delete({ where: { key } });

    await this.audit.log({
      userId,
      action: 'delete',
      resourceType: 'setting',
      resourceId: key,
      ip,
    });
  }

  async bulkUpsert(
    settings: Array<{ key: string; value: any }>,
    userId?: string,
    ip?: string,
  ) {
    const results = [];
    for (const s of settings) {
      const result = await this.upsert(s.key, s.value, userId, ip);
      results.push(result);
    }
    return results;
  }
}
