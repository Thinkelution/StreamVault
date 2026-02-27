import { Injectable, NotFoundException } from '@nestjs/common';
import slugify from 'slugify';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class PlaylistsService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  async findAll(params: { page?: number; limit?: number; isPublic?: boolean }) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params.isPublic !== undefined) where.isPublic = params.isPublic;

    const [items, total] = await Promise.all([
      this.prisma.playlist.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          createdBy: { select: { id: true, name: true } },
          _count: { select: { items: true } },
        },
      }),
      this.prisma.playlist.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const playlist = await this.prisma.playlist.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, name: true } },
        items: {
          include: { video: true },
          orderBy: { position: 'asc' },
        },
      },
    });
    if (!playlist) throw new NotFoundException('Playlist not found');
    return playlist;
  }

  async create(
    data: {
      name: string;
      description?: string;
      type?: string;
      rules?: any;
      isPublic?: boolean;
    },
    userId: string,
    ip?: string,
  ) {
    const slug = slugify(data.name, { lower: true, strict: true });
    const playlist = await this.prisma.playlist.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        type: data.type || 'manual',
        rules: data.rules,
        isPublic: data.isPublic ?? false,
        createdById: userId,
      },
    });

    await this.audit.log({
      userId,
      action: 'create',
      resourceType: 'playlist',
      resourceId: playlist.id,
      ip,
    });

    return playlist;
  }

  async update(
    id: string,
    data: {
      name?: string;
      description?: string;
      type?: string;
      rules?: any;
      isPublic?: boolean;
    },
    userId: string,
    ip?: string,
  ) {
    await this.findOne(id);
    const playlist = await this.prisma.playlist.update({
      where: { id },
      data,
    });

    await this.audit.log({
      userId,
      action: 'update',
      resourceType: 'playlist',
      resourceId: id,
      ip,
    });

    return playlist;
  }

  async remove(id: string, userId: string, ip?: string) {
    await this.findOne(id);
    await this.prisma.playlist.delete({ where: { id } });

    await this.audit.log({
      userId,
      action: 'delete',
      resourceType: 'playlist',
      resourceId: id,
      ip,
    });
  }

  async addItem(playlistId: string, videoId: string, position?: number) {
    await this.findOne(playlistId);
    const maxPos = await this.prisma.playlistItem.aggregate({
      where: { playlistId },
      _max: { position: true },
    });
    return this.prisma.playlistItem.create({
      data: {
        playlistId,
        videoId,
        position: position ?? (maxPos._max.position || 0) + 1,
      },
      include: { video: true },
    });
  }

  async removeItem(playlistId: string, videoId: string) {
    await this.prisma.playlistItem.deleteMany({
      where: { playlistId, videoId },
    });
  }

  async reorderItems(playlistId: string, itemOrders: Array<{ videoId: string; position: number }>) {
    await this.findOne(playlistId);
    const ops = itemOrders.map((item) =>
      this.prisma.playlistItem.updateMany({
        where: { playlistId, videoId: item.videoId },
        data: { position: item.position },
      }),
    );
    await this.prisma.$transaction(ops);
  }
}
