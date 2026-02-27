import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, MinLength } from 'class-validator';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

class UpdateUserDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  avatar?: string;

  @IsString()
  @IsOptional()
  role?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

class ChangePasswordDto {
  @IsString()
  @MinLength(8)
  password!: string;
}

@ApiTags('Users')
@ApiBearerAuth()
@Controller('api/v1/users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'List all users' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'role', required: false })
  @ApiQuery({ name: 'search', required: false })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('role') role?: string,
    @Query('search') search?: string,
  ) {
    const data = await this.usersService.findAll({ page, limit, role, search });
    return { success: true, data };
  }

  @Get(':id')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Get user by ID' })
  async findOne(@Param('id') id: string) {
    const data = await this.usersService.findOne(id);
    return { success: true, data };
  }

  @Put(':id')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Update user' })
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    const data = await this.usersService.update(id, dto);
    return { success: true, data };
  }

  @Put(':id/password')
  @Roles('super_admin', 'admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Change user password' })
  async changePassword(@Param('id') id: string, @Body() dto: ChangePasswordDto) {
    await this.usersService.changePassword(id, dto.password);
  }

  @Delete(':id')
  @Roles('super_admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete user' })
  async remove(@Param('id') id: string) {
    await this.usersService.remove(id);
  }
}
