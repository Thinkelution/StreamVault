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
import { IsString } from 'class-validator';
import { Request } from 'express';
import { TagsService } from './tags.service';
import { JwtAuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

class CreateTagDto {
  @IsString()
  name!: string;
}

class RenameTagDto {
  @IsString()
  name!: string;
}

class MergeTagDto {
  @IsString()
  targetId!: string;
}

@ApiTags('Tags')
@ApiBearerAuth()
@Controller('api/v1/tags')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TagsController {
  constructor(private tagsService: TagsService) {}

  @Get()
  @Roles('super_admin', 'admin', 'editor', 'viewer')
  @ApiOperation({ summary: 'List tags' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    const data = await this.tagsService.findAll({ page, limit, search });
    return { success: true, data };
  }

  @Get(':id')
  @Roles('super_admin', 'admin', 'editor', 'viewer')
  @ApiOperation({ summary: 'Get tag by ID' })
  async findOne(@Param('id') id: string) {
    const data = await this.tagsService.findOne(id);
    return { success: true, data };
  }

  @Post()
  @Roles('super_admin', 'admin', 'editor')
  @ApiOperation({ summary: 'Create a tag' })
  async create(@Body() dto: CreateTagDto, @Req() req: Request) {
    const user = (req as any).user;
    const data = await this.tagsService.create(dto, user?.id, req.ip);
    return { success: true, data };
  }

  @Put(':id')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Rename a tag' })
  async rename(@Param('id') id: string, @Body() dto: RenameTagDto, @Req() req: Request) {
    const user = (req as any).user;
    const data = await this.tagsService.rename(id, dto.name, user?.id, req.ip);
    return { success: true, data };
  }

  @Post(':id/merge')
  @Roles('super_admin', 'admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Merge tag into another' })
  async merge(@Param('id') id: string, @Body() dto: MergeTagDto, @Req() req: Request) {
    const user = (req as any).user;
    await this.tagsService.merge(id, dto.targetId, user?.id, req.ip);
    return { success: true, data: null };
  }

  @Delete(':id')
  @Roles('super_admin', 'admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a tag' })
  async remove(@Param('id') id: string, @Req() req: Request) {
    const user = (req as any).user;
    await this.tagsService.remove(id, user?.id, req.ip);
    return { success: true, data: null };
  }
}
