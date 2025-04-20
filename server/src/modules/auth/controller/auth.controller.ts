import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { JwtAuthGuard } from '../jwt/jwt-auth.guard';
import { Request as ExpressRequest } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { userId: string; password: string }) {
    const user = await this.authService.validateUser(
      body.userId,
      body.password
    );
    return this.authService.login(user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Request() req: ExpressRequest) {
    return {
      message: '토큰이 유효합니다.',
      user: req.user,
    };
  }
}
