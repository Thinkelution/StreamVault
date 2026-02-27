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
import { IsString, IsOptional } from 'class-validator';
import { Request } from 'express';
import { CategoriesService } from './categories.service';
import { JwtAuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

class CreateCategoryDto {
  @IsString()
  name!: string;

  @IsString()
  @IsOptional()
  parentId?: string;
}

class UpdateCategoryDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  parentId?: string | null;
}

@ApiTags('Categories')
@ApiBearerAuth()
@Controller('api/v1/categories')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CategoriesController {
  constructor(private categoriesService: CategoriesService) {}

  @Get()
  @Roles('super_admin', 'admin', 'editor', 'viewer')
  @ApiOperation({ summary: 'List categories' })
  @ApiQuery({ name: 'parentId', required: false })
  async findAll(@Query('parentId') parentId?: string) {
    const data = await this.categoriesService.findAll({ parentId });
    return { success: true, data };
  }

  @Get('tree')
  @Roles('super_admin', 'admin', 'editor', 'viewer')
  @ApiOperation({ summary: 'Get category tree' })
  async getTree() {
    const data = await this.categoriesService.getTree();
    return { success: true, data };
  }

  @Get(':id')
  @Roles('super_admin', 'admin', 'editor', 'viewer')
  @ApiOperation({ summary: 'Get category by ID' })
  async findOne(@Param('id') id: string) {
    const data = await this.categoriesService.findOne(id);
    return { success: true, data };
  }

  @Post()
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Create a category' })
  async create(@Body() dto: CreateCategoryDto, @Req() req: Request) {
    const user = (req as any).user;
    const data = await this.categoriesService.create(dto, user?.id, req.ip);
    return { success: true, data };
  }

  @Put(':id')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Update a category' })
  async update(@Param('id') id: string, @Body() dto: UpdateCategoryDto, @Req() req: Request) {
    const user = (req as any).user;
    const data = await this.categoriesService.update(id, dto, user?.id, req.ip);
    return { success: true, data };
  }

  @Delete(':id')
  @Roles('super_admin', 'admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a category' })
  async remove(@Param('id') id: string, @Req() req: Request) {
    const user = (req as any).user;
    await this.categoriesService.remove(id, user?.id, req.ip);
    return { success: true, data: null };
  }
}
