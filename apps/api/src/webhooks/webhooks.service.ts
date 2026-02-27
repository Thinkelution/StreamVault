import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { createHmac } from 'crypto';

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  async findAll() {
    return this.prisma.webhook.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: string) {
    const webhook = await this.prisma.webhook.findUnique({ where: { id } });
    if (!webhook) throw new NotFoundException('Webhook not found');
    return webhook;
  }

  async create(
    data: { url: string; events: string[]; secret?: string; isActive?: boolean },
    userId?: string,
    ip?: string,
  ) {
    const webhook = await this.prisma.webhook.create({
      data: {
        url: data.url,
        events: data.events,
        secret: data.secret,
        isActive: data.isActive ?? true,
      },
    });

    await this.audit.log({
      userId,
      action: 'create',
      resourceType: 'webhook',
      resourceId: webhook.id,
      ip,
    });

    return webhook;
  }

  async update(
    id: string,
    data: { url?: string; events?: string[]; secret?: string; isActive?: boolean },
    userId?: string,
    ip?: string,
  ) {
    await this.findOne(id);
    const webhook = await this.prisma.webhook.update({ where: { id }, data });

    await this.audit.log({
      userId,
      action: 'update',
      resourceType: 'webhook',
      resourceId: id,
      ip,
    });

    return webhook;
  }

  async remove(id: string, userId?: string, ip?: string) {
    await this.findOne(id);
    await this.prisma.webhook.delete({ where: { id } });

    await this.audit.log({
      userId,
      action: 'delete',
      resourceType: 'webhook',
      resourceId: id,
      ip,
    });
  }

  async dispatch(event: string, payload: any) {
    const webhooks = await this.prisma.webhook.findMany({
      where: { isActive: true },
    });

    const matching = webhooks.filter((wh) => {
      const events = wh.events as string[];
      return events.includes(event) || events.includes('*');
    });

    for (const wh of matching) {
      try {
        const body = JSON.stringify({ event, data: payload, timestamp: new Date().toISOString() });
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };

        if (wh.secret) {
          const signature = createHmac('sha256', wh.secret).update(body).digest('hex');
          headers['X-Webhook-Signature'] = `sha256=${signature}`;
        }

        fetch(wh.url, { method: 'POST', headers, body }).catch((err) => {
          this.logger.warn(`Webhook ${wh.id} delivery failed: ${err.message}`);
        });

        await this.prisma.webhook.update({
          where: { id: wh.id },
          data: { lastTriggeredAt: new Date() },
        });
      } catch (err: any) {
        this.logger.error(`Webhook ${wh.id} error: ${err.message}`);
      }
    }
  }
}
