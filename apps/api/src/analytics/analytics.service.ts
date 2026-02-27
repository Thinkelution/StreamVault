import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async trackView(data: {
    videoId: string;
    country?: string;
    device?: string;
    watchTime?: number;
    completed?: boolean;
  }) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await this.prisma.videoAnalytics.findUnique({
      where: {
        videoId_date_country_device: {
          videoId: data.videoId,
          date: today,
          country: data.country || 'unknown',
          device: data.device || 'unknown',
        },
      },
    });

    if (existing) {
      return this.prisma.videoAnalytics.update({
        where: { id: existing.id },
        data: {
          views: { increment: 1 },
          uniqueViewers: { increment: 1 },
          watchTime: data.watchTime
            ? { increment: data.watchTime }
            : undefined,
          completionRate: data.completed
            ? {
                set:
                  (existing.completionRate * existing.views + 1) /
                  (existing.views + 1),
              }
            : undefined,
        },
      });
    }

    return this.prisma.videoAnalytics.create({
      data: {
        videoId: data.videoId,
        date: today,
        country: data.country || 'unknown',
        device: data.device || 'unknown',
        views: 1,
        uniqueViewers: 1,
        watchTime: data.watchTime || 0,
        completionRate: data.completed ? 1 : 0,
      },
    });
  }

  async getVideoAnalytics(
    videoId: string,
    params: { from?: Date; to?: Date },
  ) {
    const where: any = { videoId };
    if (params.from || params.to) {
      where.date = {};
      if (params.from) where.date.gte = params.from;
      if (params.to) where.date.lte = params.to;
    }

    const records = await this.prisma.videoAnalytics.findMany({
      where,
      orderBy: { date: 'asc' },
    });

    const totals = await this.prisma.videoAnalytics.aggregate({
      where,
      _sum: { views: true, uniqueViewers: true, watchTime: true },
      _avg: { completionRate: true },
    });

    return {
      daily: records,
      totals: {
        views: totals._sum.views || 0,
        uniqueViewers: totals._sum.uniqueViewers || 0,
        watchTime: totals._sum.watchTime || 0,
        avgCompletionRate: totals._avg.completionRate || 0,
      },
    };
  }

  async getDashboard(params: { from?: Date; to?: Date }) {
    const where: any = {};
    if (params.from || params.to) {
      where.date = {};
      if (params.from) where.date.gte = params.from;
      if (params.to) where.date.lte = params.to;
    }

    const totals = await this.prisma.videoAnalytics.aggregate({
      where,
      _sum: { views: true, uniqueViewers: true, watchTime: true },
    });

    const topVideos = await this.prisma.videoAnalytics.groupBy({
      by: ['videoId'],
      where,
      _sum: { views: true },
      orderBy: { _sum: { views: 'desc' } },
      take: 10,
    });

    const videoIds = topVideos.map((tv) => tv.videoId);
    const videos = await this.prisma.video.findMany({
      where: { id: { in: videoIds } },
      select: { id: true, title: true, slug: true, thumbnailUrl: true },
    });

    const videoMap = new Map(videos.map((v) => [v.id, v]));

    return {
      totals: {
        views: totals._sum.views || 0,
        uniqueViewers: totals._sum.uniqueViewers || 0,
        watchTime: totals._sum.watchTime || 0,
      },
      topVideos: topVideos.map((tv) => ({
        video: videoMap.get(tv.videoId),
        views: tv._sum.views,
      })),
    };
  }
}
