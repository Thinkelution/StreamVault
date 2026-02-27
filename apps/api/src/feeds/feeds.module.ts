import { Module } from '@nestjs/common';
import { FeedsController } from './feeds.controller';
import { FeedsService } from './feeds.service';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [AuditModule],
  controllers: [FeedsController],
  providers: [FeedsService],
  exports: [FeedsService],
})
export class FeedsModule {}
