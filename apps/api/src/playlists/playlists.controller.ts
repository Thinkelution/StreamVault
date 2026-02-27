import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsObject,
  IsArray,
  ValidateNested,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Request } from 'express';
import { PlaylistsService } from './playlists.service';
import { JwtAuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

class CreatePlaylistDto {
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
  rules?: any;

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
}

class UpdatePlaylistDto {
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
  rules?: any;

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
}

class PlaylistItemDto {
  @IsString()
  videoId!: string;

  @IsNumber()
  @IsOptional()
  position?: number;
}

class ItemOrder {
  @IsString()
  videoId!: string;

  @IsNumber()
  position!: number;
}

class ReorderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemOrder)
  items!: ItemOrder[];
}

@ApiTags('Playlists')
@ApiBearerAuth()
@Controller('api/v1/playlists')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PlaylistsController {
  constructor(private playlistsService: PlaylistsService) {}

  @Get()
  @Roles('super_admin', 'admin', 'editor', 'viewer')
  @ApiOperation({ summary: 'List playlists' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'isPublic', required: false })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('isPublic') isPublic?: boolean,
  ) {
    const data = await this.playlistsService.findAll({ page, limit, isPublic });
    return { success: true, data };
  }

  @Get(':id')
  @Roles('super_admin', 'admin', 'editor', 'viewer')
  @ApiOperation({ summary: 'Get playlist by ID' })
  async findOne(@Param('id') id: string) {
    const data = await this.playlistsService.findOne(id);
    return { success: true, data };
  }

  @Post()
  @Roles('super_admin', 'admin', 'editor')
  @ApiOperation({ summary: 'Create a playlist' })
  async create(@Body() dto: CreatePlaylistDto, @Req() req: Request) {
    const user = (req as any).user;
    const data = await this.playlistsService.create(dto, user.id, req.ip);
    return { success: true, data };
  }

  @Put(':id')
  @Roles('super_admin', 'admin', 'editor')
  @ApiOperation({ summary: 'Update a playlist' })
  async update(@Param('id') id: string, @Body() dto: UpdatePlaylistDto, @Req() req: Request) {
    const user = (req as any).user;
    const data = await this.playlistsService.update(id, dto, user.id, req.ip);
    return { success: true, data };
  }

  @Delete(':id')
  @Roles('super_admin', 'admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a playlist' })
  async remove(@Param('id') id: string, @Req() req: Request) {
    const user = (req as any).user;
    await this.playlistsService.remove(id, user.id, req.ip);
    return { success: true, data: null };
  }

  @Post(':id/items')
  @Roles('super_admin', 'admin', 'editor')
  @ApiOperation({ summary: 'Add video to playlist' })
  async addItem(@Param('id') id: string, @Body() dto: PlaylistItemDto) {
    const data = await this.playlistsService.addItem(id, dto.videoId, dto.position);
    return { success: true, data };
  }

  @Delete(':id/items/:videoId')
  @Roles('super_admin', 'admin', 'editor')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove video from playlist' })
  async removeItem(@Param('id') id: string, @Param('videoId') videoId: string) {
    await this.playlistsService.removeItem(id, videoId);
    return { success: true, data: null };
  }

  @Put(':id/reorder')
  @Roles('super_admin', 'admin', 'editor')
  @ApiOperation({ summary: 'Reorder playlist items' })
  async reorder(@Param('id') id: string, @Body() dto: ReorderDto) {
    await this.playlistsService.reorderItems(id, dto.items);
    return { success: true, data: null };
  }
}
