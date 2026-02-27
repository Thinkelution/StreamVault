import { Injectable, NotFoundException } from '@nestjs/common';
import slugify from 'slugify';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class CategoriesService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  async findAll(params: { parentId?: string | null; includeChildren?: boolean }) {
    const where: any = {};
    if (params.parentId === 'root' || params.parentId === null) {
      where.parentId = null;
    } else if (params.parentId) {
      where.parentId = params.parentId;
    }

    return this.prisma.category.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        children: params.includeChildren
          ? { include: { children: true } }
          : false,
        _count: { select: { videoCategories: true } },
      },
    });
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        parent: true,
        children: true,
        _count: { select: { videoCategories: true } },
      },
    });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async getTree() {
    const all = await this.prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { videoCategories: true } } },
    });

    const map = new Map<string, any>();
    const roots: any[] = [];
    for (const cat of all) {
      map.set(cat.id, { ...cat, children: [] });
    }
    for (const cat of all) {
      const node = map.get(cat.id)!;
      if (cat.parentId && map.has(cat.parentId)) {
        map.get(cat.parentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    }
    return roots;
  }

  async create(
    data: { name: string; parentId?: string },
    userId?: string,
    ip?: string,
  ) {
    let depth = 0;
    if (data.parentId) {
      const parent = await this.prisma.category.findUnique({
        where: { id: data.parentId },
      });
      if (!parent) throw new NotFoundException('Parent category not found');
      depth = parent.depth + 1;
    }

    const slug = slugify(data.name, { lower: true, strict: true });
    const category = await this.prisma.category.create({
      data: { name: data.name, slug, parentId: data.parentId || null, depth },
    });

    await this.audit.log({
      userId,
      action: 'create',
      resourceType: 'category',
      resourceId: category.id,
      ip,
    });

    return category;
  }

  async update(
    id: string,
    data: { name?: string; parentId?: string | null },
    userId?: string,
    ip?: string,
  ) {
    await this.findOne(id);
    const updateData: any = {};
    if (data.name) {
      updateData.name = data.name;
      updateData.slug = slugify(data.name, { lower: true, strict: true });
    }
    if (data.parentId !== undefined) {
      updateData.parentId = data.parentId;
      if (data.parentId) {
        const parent = await this.prisma.category.findUnique({
          where: { id: data.parentId },
        });
        updateData.depth = parent ? parent.depth + 1 : 0;
      } else {
        updateData.depth = 0;
      }
    }

    const category = await this.prisma.category.update({
      where: { id },
      data: updateData,
    });

    await this.audit.log({
      userId,
      action: 'update',
      resourceType: 'category',
      resourceId: id,
      ip,
    });

    return category;
  }

  async remove(id: string, userId?: string, ip?: string) {
    await this.findOne(id);
    await this.prisma.category.delete({ where: { id } });

    await this.audit.log({
      userId,
      action: 'delete',
      resourceType: 'category',
      resourceId: id,
      ip,
    });
  }
}
