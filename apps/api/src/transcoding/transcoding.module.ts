import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { TranscodingService } from './transcoding.service';
import { TranscodingProcessor } from './transcoding.processor';

@Module({
  imports: [BullModule.registerQueue({ name: 'transcoding' })],
  providers: [TranscodingService, TranscodingProcessor],
  exports: [TranscodingService],
})
export class TranscodingModule {}
