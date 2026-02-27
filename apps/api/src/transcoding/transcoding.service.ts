import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TranscodingService {
  private readonly logger = new Logger(TranscodingService.name);

  constructor(
    private prisma: PrismaService,
    @InjectQueue('transcoding') private transcodingQueue: Queue,
  ) {}

  async getJobs(videoId?: string) {
    const where: any = {};
    if (videoId) where.videoId = videoId;

    return this.prisma.transcodingJob.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { video: { select: { id: true, title: true, slug: true } } },
    });
  }

  async getJob(id: string) {
    return this.prisma.transcodingJob.findUnique({
      where: { id },
      include: { video: true },
    });
  }

  async retryJob(jobId: string) {
    const job = await this.prisma.transcodingJob.findUnique({
      where: { id: jobId },
      include: { video: true },
    });
    if (!job) throw new Error('Job not found');

    await this.prisma.transcodingJob.update({
      where: { id: jobId },
      data: { status: 'pending', progress: 0, errorMsg: null },
    });

    await this.transcodingQueue.add('transcode', {
      jobId: job.id,
      videoId: job.videoId,
      sourcePath: job.video.sourceUrl,
      baseUrl: process.env.BASE_URL || '',
    });

    this.logger.log(`Retrying transcoding job ${jobId}`);
  }

  async getQueueStats() {
    const [waiting, active, completed, failed] = await Promise.all([
      this.transcodingQueue.getWaitingCount(),
      this.transcodingQueue.getActiveCount(),
      this.transcodingQueue.getCompletedCount(),
      this.transcodingQueue.getFailedCount(),
    ]);

    return { waiting, active, completed, failed };
  }
}
