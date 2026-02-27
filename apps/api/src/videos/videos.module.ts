import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { VideosController } from './videos.controller';
import { VideosService } from './videos.service';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'transcoding' }),
    AuditModule,
  ],
  controllers: [VideosController],
  providers: [VideosService],
  exports: [VideosService],
})
export class VideosModule {}
