import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';
import { AuthService } from './auth.service';
import { JwtAuthGuard, Public } from './auth.guard';
import { RolesGuard } from './roles.guard';
import { Roles } from './roles.decorator';
import { Request } from 'express';

class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;
}

class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  name!: string;

  @IsString()
  @IsOptional()
  role?: string;
}

class RefreshDto {
  @IsString()
  refreshToken!: string;
}

@ApiTags('Auth')
@Controller('api/v1/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  async login(@Body() dto: LoginDto, @Req() req: Request) {
    const tokens = await this.authService.login(dto.email, dto.password, req.ip);
    return { success: true, data: tokens };
  }

  @Post('register')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Register a new user (admin only)' })
  async register(@Body() dto: RegisterDto, @Req() req: Request) {
    const user = (req as any).user;
    const result = await this.authService.register(dto, user?.id, req.ip);
    return { success: true, data: result };
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  async refresh(@Body() dto: RefreshDto) {
    const tokens = await this.authService.refresh(dto.refreshToken);
    return { success: true, data: tokens };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  async me(@Req() req: Request) {
    const user = (req as any).user;
    const profile = await this.authService.getProfile(user.id);
    return { success: true, data: profile };
  }
}
