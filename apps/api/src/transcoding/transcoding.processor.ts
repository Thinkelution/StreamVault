import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { spawn } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { PrismaService } from '../prisma/prisma.service';

interface TranscodePayload {
  jobId: string;
  videoId: string;
  sourcePath: string;
  baseUrl: string;
}

interface TranscodeProfile {
  name: string;
  width: number;
  height: number;
  bitrate: string;
  bitrateNum: number;
}

const PROFILES: TranscodeProfile[] = [
  { name: '360p', width: 640, height: 360, bitrate: '800k', bitrateNum: 800000 },
  { name: '480p', width: 854, height: 480, bitrate: '1400k', bitrateNum: 1400000 },
  { name: '720p', width: 1280, height: 720, bitrate: '2800k', bitrateNum: 2800000 },
  { name: '1080p', width: 1920, height: 1080, bitrate: '5000k', bitrateNum: 5000000 },
];

@Processor('transcoding')
export class TranscodingProcessor extends WorkerHost {
  private readonly logger = new Logger(TranscodingProcessor.name);
  private readonly ffmpegPath = process.env.FFMPEG_PATH || '/usr/bin/ffmpeg';
  private readonly hlsDir = process.env.HLS_DIR || '/var/www/streamvault/hls';
  private readonly thumbDir = process.env.THUMBNAIL_DIR || '/var/www/streamvault/thumbnails';

  constructor(private prisma: PrismaService) {
    super();
  }

  async process(job: Job<TranscodePayload>): Promise<void> {
    const { jobId, videoId, sourcePath, baseUrl } = job.data;

    this.logger.log(`Starting transcoding for video ${videoId}, job ${jobId}`);

    try {
      await this.prisma.transcodingJob.update({
        where: { id: jobId },
        data: { status: 'processing', startedAt: new Date() },
      });

      await this.prisma.video.update({
        where: { id: videoId },
        data: { status: 'processing' },
      });

      const hlsOutputDir = join(this.hlsDir, videoId);
      if (!existsSync(hlsOutputDir)) {
        mkdirSync(hlsOutputDir, { recursive: true });
      }

      const thumbOutputDir = this.thumbDir;
      if (!existsSync(thumbOutputDir)) {
        mkdirSync(thumbOutputDir, { recursive: true });
      }

      await this.generateThumbnail(sourcePath, videoId);
      await job.updateProgress(10);
      await this.prisma.transcodingJob.update({
        where: { id: jobId },
        data: { progress: 10 },
      });

      const totalProfiles = PROFILES.length;
      for (let i = 0; i < totalProfiles; i++) {
        const profile = PROFILES[i];
        await this.transcodeProfile(sourcePath, videoId, profile, hlsOutputDir);

        await this.prisma.rendition.create({
          data: {
            videoId,
            profileName: profile.name,
            url: `${baseUrl}/hls/${videoId}/${profile.name}/index.m3u8`,
            codec: 'h264',
            bitrate: profile.bitrateNum,
            width: profile.width,
            height: profile.height,
          },
        });

        const progress = 10 + ((i + 1) / totalProfiles) * 80;
        await job.updateProgress(progress);
        await this.prisma.transcodingJob.update({
          where: { id: jobId },
          data: { progress },
        });
      }

      await this.generateMasterPlaylist(videoId, hlsOutputDir);

      const duration = await this.getVideoDuration(sourcePath);

      await this.prisma.video.update({
        where: { id: videoId },
        data: {
          status: 'published',
          hlsUrl: `${baseUrl}/hls/${videoId}/master.m3u8`,
          thumbnailUrl: `${baseUrl}/thumbnails/${videoId}.jpg`,
          duration,
          resolution: '1920x1080',
        },
      });

      await this.prisma.transcodingJob.update({
        where: { id: jobId },
        data: { status: 'completed', progress: 100, completedAt: new Date() },
      });

      this.logger.log(`Transcoding completed for video ${videoId}`);
    } catch (error: any) {
      this.logger.error(`Transcoding failed for video ${videoId}: ${error.message}`);

      await this.prisma.transcodingJob.update({
        where: { id: jobId },
        data: {
          status: 'failed',
          errorMsg: error.message || 'Unknown error',
          completedAt: new Date(),
        },
      });

      await this.prisma.video.update({
        where: { id: videoId },
        data: { status: 'failed' },
      });

      throw error;
    }
  }

  private generateThumbnail(sourcePath: string, videoId: string): Promise<void> {
    const outputPath = join(this.thumbDir, `${videoId}.jpg`);
    const args = [
      '-i', sourcePath,
      '-ss', '10',
      '-vframes', '1',
      '-vf', 'scale=1280:720:force_original_aspect_ratio=decrease',
      '-q:v', '2',
      '-y', outputPath,
    ];

    return this.runFfmpeg(args);
  }

  private transcodeProfile(
    sourcePath: string,
    videoId: string,
    profile: TranscodeProfile,
    hlsOutputDir: string,
  ): Promise<void> {
    const profileDir = join(hlsOutputDir, profile.name);
    if (!existsSync(profileDir)) {
      mkdirSync(profileDir, { recursive: true });
    }

    const args = [
      '-i', sourcePath,
      '-vf', `scale=${profile.width}:${profile.height}:force_original_aspect_ratio=decrease,pad=${profile.width}:${profile.height}:(ow-iw)/2:(oh-ih)/2`,
      '-c:v', 'libx264',
      '-preset', 'medium',
      '-b:v', profile.bitrate,
      '-maxrate', profile.bitrate,
      '-bufsize', `${parseInt(profile.bitrate) * 2}k`,
      '-c:a', 'aac',
      '-b:a', '128k',
      '-ar', '44100',
      '-hls_time', '6',
      '-hls_list_size', '0',
      '-hls_segment_filename', join(profileDir, 'segment_%03d.ts'),
      '-f', 'hls',
      '-y', join(profileDir, 'index.m3u8'),
    ];

    return this.runFfmpeg(args);
  }

  private async generateMasterPlaylist(videoId: string, hlsOutputDir: string): Promise<void> {
    const lines = ['#EXTM3U'];

    for (const profile of PROFILES) {
      lines.push(
        `#EXT-X-STREAM-INF:BANDWIDTH=${profile.bitrateNum},RESOLUTION=${profile.width}x${profile.height}`,
        `${profile.name}/index.m3u8`,
      );
    }

    const { writeFileSync } = await import('fs');
    writeFileSync(join(hlsOutputDir, 'master.m3u8'), lines.join('\n'));
  }

  private getVideoDuration(sourcePath: string): Promise<number> {
    return new Promise((resolve) => {
      const ffprobe = spawn(this.ffmpegPath.replace('ffmpeg', 'ffprobe'), [
        '-v', 'quiet',
        '-print_format', 'json',
        '-show_format',
        sourcePath,
      ]);

      let output = '';
      ffprobe.stdout.on('data', (data) => { output += data; });
      ffprobe.on('close', () => {
        try {
          const info = JSON.parse(output);
          resolve(parseFloat(info.format?.duration || '0'));
        } catch {
          resolve(0);
        }
      });
      ffprobe.on('error', () => resolve(0));
    });
  }

  private runFfmpeg(args: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      const proc = spawn(this.ffmpegPath, args);
      let stderr = '';

      proc.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      proc.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`FFmpeg exited with code ${code}: ${stderr.slice(-500)}`));
        }
      });

      proc.on('error', (err) => {
        reject(new Error(`FFmpeg spawn error: ${err.message}`));
      });
    });
  }
}
