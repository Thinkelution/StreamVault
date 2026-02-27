import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { AuditService } from './audit.service';

@ApiTags('Audit Log')
@Controller('api/v1/audit-log')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AuditController {
  constructor(private auditService: AuditService) {}

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('search') search?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('action') action?: string,
    @Query('resourceType') resourceType?: string,
  ) {
    const result = await this.auditService.findAll({
      page: page ? parseInt(page, 10) : 1,
      limit: pageSize ? parseInt(pageSize, 10) : 50,
      action: action || undefined,
      resourceType: resourceType || undefined,
      from: dateFrom ? new Date(dateFrom) : undefined,
      to: dateTo ? new Date(dateTo) : undefined,
    });

    const items = result.items.map((item: any) => ({
      id: item.id,
      userId: item.userId,
      userName: item.user?.name ?? 'System',
      action: item.action,
      resource: item.resourceType,
      resourceId: item.resourceId,
      details: item.meta ? JSON.stringify(item.meta) : null,
      ip: item.ip ?? '',
      timestamp: item.createdAt,
    }));

    return {
      success: true,
      data: { items, total: result.total, page: result.page, limit: result.limit, totalPages: result.totalPages },
    };
  }
}
