import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import configuration from './config/configuration';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { VideosModule } from './videos/videos.module';
import { FeedsModule } from './feeds/feeds.module';
import { CategoriesModule } from './categories/categories.module';
import { TagsModule } from './tags/tags.module';
import { PlaylistsModule } from './playlists/playlists.module';
import { TranscodingModule } from './transcoding/transcoding.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { SettingsModule } from './settings/settings.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { AuditModule } from './audit/audit.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get<string>('redis.host'),
          port: config.get<number>('redis.port'),
        },
      }),
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    VideosModule,
    FeedsModule,
    CategoriesModule,
    TagsModule,
    PlaylistsModule,
    TranscodingModule,
    AnalyticsModule,
    SettingsModule,
    WebhooksModule,
    AuditModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
