import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import slugify from 'slugify';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class VideosService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private audit: AuditService,
    @InjectQueue('transcoding') private transcodingQueue: Queue,
  ) {}

  async findAll(params: {
    page?: number;
    limit?: number;
    status?: string;
    categoryId?: string;
    tagId?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params.status) where.status = params.status;
    if (params.search) {
      where.OR = [
        { title: { contains: params.search, mode: 'insensitive' } },
        { description: { contains: params.search, mode: 'insensitive' } },
      ];
    }
    if (params.categoryId) {
      where.videoCategories = { some: { categoryId: params.categoryId } };
    }
    if (params.tagId) {
      where.videoTags = { some: { tagId: params.tagId } };
    }

    const orderBy: any = {};
    const sortField = params.sortBy || 'createdAt';
    orderBy[sortField] = params.sortOrder || 'desc';

    const [items, total] = await Promise.all([
      this.prisma.video.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          createdBy: { select: { id: true, name: true, email: true } },
          videoCategories: { include: { category: true } },
          videoTags: { include: { tag: true } },
          renditions: true,
          _count: { select: { feedItems: true, playlistItems: true } },
        },
      }),
      this.prisma.video.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const video = await this.prisma.video.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        videoCategories: { include: { category: true } },
        videoTags: { include: { tag: true } },
        renditions: true,
        captions: true,
        transcodingJobs: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!video) throw new NotFoundException('Video not found');
    return video;
  }

  async findBySlug(slug: string) {
    const video = await this.prisma.video.findUnique({
      where: { slug },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        videoCategories: { include: { category: true } },
        videoTags: { include: { tag: true } },
        renditions: true,
        captions: true,
      },
    });
    if (!video) throw new NotFoundException('Video not found');
    return video;
  }

  async create(
    data: {
      title: string;
      description?: string;
      shortDescription?: string;
      seoTitle?: string;
      seoDescription?: string;
      status?: string;
      categoryIds?: string[];
      tagIds?: string[];
      customFields?: any;
      scheduledAt?: Date;
      expiresAt?: Date;
    },
    userId: string,
    ip?: string,
  ) {
    const slug = await this.generateUniqueSlug(data.title);
    const video = await this.prisma.video.create({
      data: {
        title: data.title,
        slug,
        description: data.description,
        shortDescription: data.shortDescription,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        status: data.status || 'draft',
        customFields: data.customFields,
        scheduledAt: data.scheduledAt,
        expiresAt: data.expiresAt,
        createdById: userId,
        videoCategories: data.categoryIds?.length
          ? { create: data.categoryIds.map((id) => ({ categoryId: id })) }
          : undefined,
        videoTags: data.tagIds?.length
          ? { create: data.tagIds.map((id) => ({ tagId: id })) }
          : undefined,
      },
      include: {
        videoCategories: { include: { category: true } },
        videoTags: { include: { tag: true } },
      },
    });

    await this.audit.log({
      userId,
      action: 'create',
      resourceType: 'video',
      resourceId: video.id,
      ip,
    });

    return video;
  }

  async upload(file: Express.Multer.File, userId: string, title?: string, ip?: string) {
    const videoTitle = title || file.originalname.replace(/\.[^/.]+$/, '');
    const slug = await this.generateUniqueSlug(videoTitle);
    const baseUrl = this.config.get<string>('baseUrl');

    const video = await this.prisma.video.create({
      data: {
        title: videoTitle,
        slug,
        status: 'processing',
        sourceUrl: file.path,
        fileSize: BigInt(file.size),
        createdById: userId,
      },
    });

    const job = await this.prisma.transcodingJob.create({
      data: {
        videoId: video.id,
        profile: 'default',
        status: 'pending',
      },
    });

    await this.transcodingQueue.add('transcode', {
      jobId: job.id,
      videoId: video.id,
      sourcePath: file.path,
      baseUrl,
    });

    await this.audit.log({
      userId,
      action: 'upload',
      resourceType: 'video',
      resourceId: video.id,
      ip,
    });

    return video;
  }

  async update(
    id: string,
    data: {
      title?: string;
      description?: string;
      shortDescription?: string;
      seoTitle?: string;
      seoDescription?: string;
      status?: string;
      categoryIds?: string[];
      tagIds?: string[];
      customFields?: any;
      publishedAt?: Date;
      scheduledAt?: Date;
      expiresAt?: Date;
    },
    userId: string,
    ip?: string,
  ) {
    await this.findOne(id);

    if (data.categoryIds !== undefined) {
      await this.prisma.videoCategory.deleteMany({ where: { videoId: id } });
    }
    if (data.tagIds !== undefined) {
      await this.prisma.videoTag.deleteMany({ where: { videoId: id } });
    }

    const video = await this.prisma.video.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        shortDescription: data.shortDescription,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        status: data.status,
        customFields: data.customFields,
        publishedAt: data.publishedAt,
        scheduledAt: data.scheduledAt,
        expiresAt: data.expiresAt,
        videoCategories: data.categoryIds?.length
          ? { create: data.categoryIds.map((cid) => ({ categoryId: cid })) }
          : undefined,
        videoTags: data.tagIds?.length
          ? { create: data.tagIds.map((tid) => ({ tagId: tid })) }
          : undefined,
      },
      include: {
        videoCategories: { include: { category: true } },
        videoTags: { include: { tag: true } },
        renditions: true,
      },
    });

    await this.audit.log({
      userId,
      action: 'update',
      resourceType: 'video',
      resourceId: id,
      ip,
    });

    return video;
  }

  async remove(id: string, userId: string, ip?: string) {
    await this.findOne(id);
    await this.prisma.video.delete({ where: { id } });

    await this.audit.log({
      userId,
      action: 'delete',
      resourceType: 'video',
      resourceId: id,
      ip,
    });
  }

  private async generateUniqueSlug(title: string): Promise<string> {
    let slug = slugify(title, { lower: true, strict: true });
    let existing = await this.prisma.video.findUnique({ where: { slug } });
    let counter = 1;
    while (existing) {
      slug = `${slugify(title, { lower: true, strict: true })}-${counter}`;
      existing = await this.prisma.video.findUnique({ where: { slug } });
      counter++;
    }
    return slug;
  }
}
