import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import slugify from 'slugify';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class TagsService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  async findAll(params: { page?: number; limit?: number; search?: string }) {
    const page = params.page || 1;
    const limit = params.limit || 50;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params.search) {
      where.name = { contains: params.search, mode: 'insensitive' };
    }

    const [items, total] = await Promise.all([
      this.prisma.tag.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: { _count: { select: { videoTags: true } } },
      }),
      this.prisma.tag.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const tag = await this.prisma.tag.findUnique({
      where: { id },
      include: { _count: { select: { videoTags: true } } },
    });
    if (!tag) throw new NotFoundException('Tag not found');
    return tag;
  }

  async create(data: { name: string }, userId?: string, ip?: string) {
    const slug = slugify(data.name, { lower: true, strict: true });
    const existing = await this.prisma.tag.findUnique({ where: { slug } });
    if (existing) throw new ConflictException('Tag already exists');

    const tag = await this.prisma.tag.create({
      data: { name: data.name, slug },
    });

    await this.audit.log({
      userId,
      action: 'create',
      resourceType: 'tag',
      resourceId: tag.id,
      ip,
    });

    return tag;
  }

  async rename(id: string, name: string, userId?: string, ip?: string) {
    await this.findOne(id);
    const slug = slugify(name, { lower: true, strict: true });
    const tag = await this.prisma.tag.update({
      where: { id },
      data: { name, slug },
    });

    await this.audit.log({
      userId,
      action: 'rename',
      resourceType: 'tag',
      resourceId: id,
      meta: { newName: name },
      ip,
    });

    return tag;
  }

  async merge(sourceId: string, targetId: string, userId?: string, ip?: string) {
    const source = await this.findOne(sourceId);
    await this.findOne(targetId);

    const sourceVideoTags = await this.prisma.videoTag.findMany({
      where: { tagId: sourceId },
    });

    for (const vt of sourceVideoTags) {
      const existing = await this.prisma.videoTag.findUnique({
        where: { videoId_tagId: { videoId: vt.videoId, tagId: targetId } },
      });
      if (!existing) {
        await this.prisma.videoTag.create({
          data: { videoId: vt.videoId, tagId: targetId },
        });
      }
    }

    await this.prisma.tag.delete({ where: { id: sourceId } });

    await this.audit.log({
      userId,
      action: 'merge',
      resourceType: 'tag',
      resourceId: targetId,
      meta: { mergedFrom: sourceId, mergedName: source.name },
      ip,
    });
  }

  async remove(id: string, userId?: string, ip?: string) {
    await this.findOne(id);
    await this.prisma.tag.delete({ where: { id } });

    await this.audit.log({
      userId,
      action: 'delete',
      resourceType: 'tag',
      resourceId: id,
      ip,
    });
  }
}
