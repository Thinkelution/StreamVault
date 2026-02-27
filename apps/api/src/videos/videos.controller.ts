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
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery, ApiConsumes, ApiBody } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsArray,
  IsDateString,
  IsObject,
} from 'class-validator';
import { VideosService } from './videos.service';
import { JwtAuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Request } from 'express';
import { randomUUID } from 'crypto';

class CreateVideoDto {
  @IsString()
  title!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  shortDescription?: string;

  @IsString()
  @IsOptional()
  seoTitle?: string;

  @IsString()
  @IsOptional()
  seoDescription?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsArray()
  @IsOptional()
  categoryIds?: string[];

  @IsArray()
  @IsOptional()
  tagIds?: string[];

  @IsObject()
  @IsOptional()
  customFields?: any;

  @IsDateString()
  @IsOptional()
  scheduledAt?: Date;

  @IsDateString()
  @IsOptional()
  expiresAt?: Date;
}

class UpdateVideoDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  shortDescription?: string;

  @IsString()
  @IsOptional()
  seoTitle?: string;

  @IsString()
  @IsOptional()
  seoDescription?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsArray()
  @IsOptional()
  categoryIds?: string[];

  @IsArray()
  @IsOptional()
  tagIds?: string[];

  @IsObject()
  @IsOptional()
  customFields?: any;

  @IsDateString()
  @IsOptional()
  publishedAt?: Date;

  @IsDateString()
  @IsOptional()
  scheduledAt?: Date;

  @IsDateString()
  @IsOptional()
  expiresAt?: Date;
}

const uploadDir = process.env.UPLOAD_DIR || '/var/www/streamvault/uploads';

@ApiTags('Videos')
@ApiBearerAuth()
@Controller('api/v1/videos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VideosController {
  constructor(private videosService: VideosService) {}

  @Get()
  @Roles('super_admin', 'admin', 'editor', 'viewer')
  @ApiOperation({ summary: 'List videos with pagination and filters' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiQuery({ name: 'tagId', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
    @Query('categoryId') categoryId?: string,
    @Query('tagId') tagId?: string,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string,
  ) {
    const data = await this.videosService.findAll({
      page, limit, status, categoryId, tagId, search, sortBy, sortOrder,
    });
    return { success: true, data };
  }

  @Get(':id')
  @Roles('super_admin', 'admin', 'editor', 'viewer')
  @ApiOperation({ summary: 'Get video by ID' })
  async findOne(@Param('id') id: string) {
    const data = await this.videosService.findOne(id);
    return { success: true, data };
  }

  @Post()
  @Roles('super_admin', 'admin', 'editor')
  @ApiOperation({ summary: 'Create a new video' })
  async create(@Body() dto: CreateVideoDto, @Req() req: Request) {
    const user = (req as any).user;
    const data = await this.videosService.create(dto, user.id, req.ip);
    return { success: true, data };
  }

  @Post('upload')
  @Roles('super_admin', 'admin', 'editor')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: uploadDir,
        filename: (_req, file, cb) => {
          const uniqueName = `${randomUUID()}${extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
      limits: { fileSize: 10 * 1024 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        const allowed = /\.(mp4|mov|avi|mkv|webm|flv|wmv|m4v)$/i;
        if (allowed.test(extname(file.originalname))) {
          cb(null, true);
        } else {
          cb(new Error('Unsupported video format'), false);
        }
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({ description: 'Video file upload', schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' }, title: { type: 'string' } } } })
  @ApiOperation({ summary: 'Upload a video file' })
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body('title') title: string,
    @Req() req: Request,
  ) {
    const user = (req as any).user;
    const data = await this.videosService.upload(file, user.id, title, req.ip);
    return { success: true, data };
  }

  @Put(':id')
  @Roles('super_admin', 'admin', 'editor')
  @ApiOperation({ summary: 'Update a video' })
  async update(@Param('id') id: string, @Body() dto: UpdateVideoDto, @Req() req: Request) {
    const user = (req as any).user;
    const data = await this.videosService.update(id, dto, user.id, req.ip);
    return { success: true, data };
  }

  @Delete(':id')
  @Roles('super_admin', 'admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a video' })
  async remove(@Param('id') id: string, @Req() req: Request) {
    const user = (req as any).user;
    await this.videosService.remove(id, user.id, req.ip);
    return { success: true, data: null };
  }
}
