import {
  Controller,
  Get,
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
import { IsString, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { Request } from 'express';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

class UpsertSettingDto {
  @IsString()
  @IsOptional()
  key?: string;

  value: any;
}

class SettingEntry {
  @IsString()
  key!: string;

  value: any;
}

class BulkUpsertDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SettingEntry)
  settings!: SettingEntry[];
}

@ApiTags('Settings')
@ApiBearerAuth()
@Controller('api/v1/settings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SettingsController {
  constructor(private settingsService: SettingsService) {}

  @Get()
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Get all settings' })
  async findAll() {
    const data = await this.settingsService.findAll();
    return { success: true, data };
  }

  @Get(':key')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Get a setting by key' })
  async findOne(@Param('key') key: string) {
    const data = await this.settingsService.findOne(key);
    return { success: true, data };
  }

  @Put(':key')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Upsert a setting' })
  async upsert(
    @Param('key') key: string,
    @Body() dto: UpsertSettingDto,
    @Req() req: Request,
  ) {
    const user = (req as any).user;
    const data = await this.settingsService.upsert(key, dto.value, user?.id, req.ip);
    return { success: true, data };
  }

  @Put()
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Bulk upsert settings' })
  async bulkUpsert(@Body() dto: BulkUpsertDto, @Req() req: Request) {
    const user = (req as any).user;
    const data = await this.settingsService.bulkUpsert(dto.settings, user?.id, req.ip);
    return { success: true, data };
  }

  @Delete(':key')
  @Roles('super_admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a setting' })
  async remove(@Param('key') key: string, @Req() req: Request) {
    const user = (req as any).user;
    await this.settingsService.remove(key, user?.id, req.ip);
    return { success: true, data: null };
  }
}
