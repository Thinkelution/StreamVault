import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, IsBoolean } from 'class-validator';
import { Request } from 'express';
import { WebhooksService } from './webhooks.service';
import { JwtAuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

class CreateWebhookDto {
  @IsString()
  url!: string;

  @IsArray()
  events!: string[];

  @IsString()
  @IsOptional()
  secret?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

class UpdateWebhookDto {
  @IsString()
  @IsOptional()
  url?: string;

  @IsArray()
  @IsOptional()
  events?: string[];

  @IsString()
  @IsOptional()
  secret?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

@ApiTags('Webhooks')
@ApiBearerAuth()
@Controller('api/v1/webhooks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WebhooksController {
  constructor(private webhooksService: WebhooksService) {}

  @Get()
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'List webhooks' })
  async findAll() {
    const data = await this.webhooksService.findAll();
    return { success: true, data };
  }

  @Get(':id')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Get webhook by ID' })
  async findOne(@Param('id') id: string) {
    const data = await this.webhooksService.findOne(id);
    return { success: true, data };
  }

  @Post()
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Create a webhook' })
  async create(@Body() dto: CreateWebhookDto, @Req() req: Request) {
    const user = (req as any).user;
    const data = await this.webhooksService.create(dto, user?.id, req.ip);
    return { success: true, data };
  }

  @Put(':id')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Update a webhook' })
  async update(@Param('id') id: string, @Body() dto: UpdateWebhookDto, @Req() req: Request) {
    const user = (req as any).user;
    const data = await this.webhooksService.update(id, dto, user?.id, req.ip);
    return { success: true, data };
  }

  @Delete(':id')
  @Roles('super_admin', 'admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a webhook' })
  async remove(@Param('id') id: string, @Req() req: Request) {
    const user = (req as any).user;
    await this.webhooksService.remove(id, user?.id, req.ip);
    return { success: true, data: null };
  }
}
