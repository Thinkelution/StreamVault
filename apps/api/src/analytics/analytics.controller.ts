import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard, Public } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

class TrackViewDto {
  @IsString()
  videoId!: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsString()
  @IsOptional()
  device?: string;

  @IsNumber()
  @IsOptional()
  watchTime?: number;

  @IsBoolean()
  @IsOptional()
  completed?: boolean;
}

@ApiTags('Analytics')
@Controller('api/v1/analytics')
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Post('track')
  @Public()
  @ApiOperation({ summary: 'Track a video view' })
  async trackView(@Body() dto: TrackViewDto) {
    const data = await this.analyticsService.trackView(dto);
    return { success: true, data };
  }

  @Get('videos/:videoId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin', 'editor')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get analytics for a video' })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  async getVideoAnalytics(
    @Param('videoId') videoId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const data = await this.analyticsService.getVideoAnalytics(videoId, {
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
    });
    return { success: true, data };
  }

  @Get('dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get analytics dashboard summary' })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  async getDashboard(
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const data = await this.analyticsService.getDashboard({
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
    });
    return { success: true, data };
  }
}
