import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import slugify from 'slugify';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { renderMrss, renderJsonFeed, renderAtom } from './mrss.renderer';

@Injectable()
export class FeedsService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private audit: AuditService,
  ) {}

  async findAll(params: { page?: number; limit?: number }) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.feed.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { items: true } } },
      }),
      this.prisma.feed.count(),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const feed = await this.prisma.feed.findUnique({
      where: { id },
      include: {
        items: {
          include: { video: true },
          orderBy: { position: 'asc' },
        },
      },
    });
    if (!feed) throw new NotFoundException('Feed not found');
    return feed;
  }

  async create(
    data: {
      name: string;
      description?: string;
      type?: string;
      filterRules?: any;
      sortOrder?: string;
      itemLimit?: number;
      cacheTtl?: number;
      imageUrl?: string;
      copyright?: string;
      language?: string;
    },
    userId?: string,
    ip?: string,
  ) {
    const slug = slugify(data.name, { lower: true, strict: true });
    const feed = await this.prisma.feed.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        type: data.type || 'mrss',
        filterRules: data.filterRules,
        sortOrder: data.sortOrder || 'newest',
        itemLimit: data.itemLimit || 50,
        cacheTtl: data.cacheTtl || 300,
        imageUrl: data.imageUrl,
        copyright: data.copyright,
        language: data.language || 'en',
      },
    });

    await this.audit.log({
      userId,
      action: 'create',
      resourceType: 'feed',
      resourceId: feed.id,
      ip,
    });

    return feed;
  }

  async update(
    id: string,
    data: {
      name?: string;
      description?: string;
      type?: string;
      filterRules?: any;
      sortOrder?: string;
      itemLimit?: number;
      isActive?: boolean;
      cacheTtl?: number;
      imageUrl?: string;
      copyright?: string;
      language?: string;
    },
    userId?: string,
    ip?: string,
  ) {
    await this.findOne(id);
    const feed = await this.prisma.feed.update({ where: { id }, data });

    await this.audit.log({
      userId,
      action: 'update',
      resourceType: 'feed',
      resourceId: id,
      ip,
    });

    return feed;
  }

  async remove(id: string, userId?: string, ip?: string) {
    await this.findOne(id);
    await this.prisma.feed.delete({ where: { id } });

    await this.audit.log({
      userId,
      action: 'delete',
      resourceType: 'feed',
      resourceId: id,
      ip,
    });
  }

  async addItem(feedId: string, videoId: string, position?: number) {
    await this.findOne(feedId);
    const maxPos = await this.prisma.feedItem.aggregate({
      where: { feedId },
      _max: { position: true },
    });
    return this.prisma.feedItem.create({
      data: {
        feedId,
        videoId,
        position: position ?? (maxPos._max.position || 0) + 1,
      },
      include: { video: true },
    });
  }

  async removeItem(feedId: string, videoId: string) {
    await this.prisma.feedItem.deleteMany({ where: { feedId, videoId } });
  }

  async render(id: string) {
    const feed = await this.prisma.feed.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            video: {
              include: { renditions: true, captions: true },
            },
          },
          orderBy: { position: 'asc' },
          take: 100,
        },
      },
    });
    if (!feed) throw new NotFoundException('Feed not found');

    const baseUrl = this.config.get<string>('baseUrl') || '';
    const videos = feed.items
      .filter((item) => item.video.status === 'published')
      .map((item) => item.video);

    if (feed.type === 'json') {
      return {
        contentType: 'application/feed+json',
        body: JSON.stringify(renderJsonFeed(feed, videos, baseUrl), null, 2),
      };
    }

    if (feed.type === 'atom') {
      return {
        contentType: 'application/atom+xml',
        body: renderAtom(feed, videos, baseUrl),
      };
    }

    return {
      contentType: 'application/rss+xml',
      body: renderMrss(feed, videos, baseUrl),
    };
  }
}
