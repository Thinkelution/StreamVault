import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Res,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsObject,
} from 'class-validator';
import { Response, Request } from 'express';
import { FeedsService } from './feeds.service';
import { JwtAuthGuard, Public } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

class CreateFeedDto {
  @IsString()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsObject()
  @IsOptional()
  filterRules?: any;

  @IsString()
  @IsOptional()
  sortOrder?: string;

  @IsNumber()
  @IsOptional()
  itemLimit?: number;

  @IsNumber()
  @IsOptional()
  cacheTtl?: number;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsString()
  @IsOptional()
  copyright?: string;

  @IsString()
  @IsOptional()
  language?: string;
}

class UpdateFeedDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsObject()
  @IsOptional()
  filterRules?: any;

  @IsString()
  @IsOptional()
  sortOrder?: string;

  @IsNumber()
  @IsOptional()
  itemLimit?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsNumber()
  @IsOptional()
  cacheTtl?: number;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsString()
  @IsOptional()
  copyright?: string;

  @IsString()
  @IsOptional()
  language?: string;
}

class FeedItemDto {
  @IsString()
  videoId!: string;

  @IsNumber()
  @IsOptional()
  position?: number;
}

@ApiTags('Feeds')
@Controller('api/v1/feeds')
export class FeedsController {
  constructor(private feedsService: FeedsService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin', 'editor')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List feeds' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
    const data = await this.feedsService.findAll({ page, limit });
    return { success: true, data };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin', 'editor')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get feed by ID' })
  async findOne(@Param('id') id: string) {
    const data = await this.feedsService.findOne(id);
    return { success: true, data };
  }

  @Get(':id/render')
  @Public()
  @ApiOperation({ summary: 'Render feed as MRSS/JSON/Atom' })
  async render(@Param('id') id: string, @Res() res: Response) {
    const result = await this.feedsService.render(id);
    res.setHeader('Content-Type', result.contentType);
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.send(result.body);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a feed' })
  async create(@Body() dto: CreateFeedDto, @Req() req: Request) {
    const user = (req as any).user;
    const data = await this.feedsService.create(dto, user?.id, req.ip);
    return { success: true, data };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a feed' })
  async update(@Param('id') id: string, @Body() dto: UpdateFeedDto, @Req() req: Request) {
    const user = (req as any).user;
    const data = await this.feedsService.update(id, dto, user?.id, req.ip);
    return { success: true, data };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a feed' })
  async remove(@Param('id') id: string, @Req() req: Request) {
    const user = (req as any).user;
    await this.feedsService.remove(id, user?.id, req.ip);
    return { success: true, data: null };
  }

  @Post(':id/items')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin', 'editor')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add video to feed' })
  async addItem(@Param('id') id: string, @Body() dto: FeedItemDto) {
    const data = await this.feedsService.addItem(id, dto.videoId, dto.position);
    return { success: true, data };
  }

  @Delete(':id/items/:videoId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin', 'editor')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove video from feed' })
  async removeItem(@Param('id') id: string, @Param('videoId') videoId: string) {
    await this.feedsService.removeItem(id, videoId);
    return { success: true, data: null };
  }
}
