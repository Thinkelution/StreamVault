import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface AuditLogEntry {
  userId?: string | null;
  action: string;
  resourceType: string;
  resourceId?: string;
  meta?: any;
  ip?: string;
}

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async log(entry: AuditLogEntry) {
    return this.prisma.auditLog.create({
      data: {
        userId: entry.userId || null,
        action: entry.action,
        resourceType: entry.resourceType,
        resourceId: entry.resourceId,
        meta: entry.meta,
        ip: entry.ip,
      },
    });
  }

  async findAll(params: {
    page?: number;
    limit?: number;
    userId?: string;
    action?: string;
    resourceType?: string;
    resourceId?: string;
    from?: Date;
    to?: Date;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 50;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params.userId) where.userId = params.userId;
    if (params.action) where.action = params.action;
    if (params.resourceType) where.resourceType = params.resourceType;
    if (params.resourceId) where.resourceId = params.resourceId;
    if (params.from || params.to) {
      where.createdAt = {};
      if (params.from) where.createdAt.gte = params.from;
      if (params.to) where.createdAt.lte = params.to;
    }

    const [items, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, name: true, email: true } } },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}
