import { Controller, Post, Get, Body, HttpCode, HttpStatus, UseGuards, Req } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { RegisterUserSchema, LoginUserSchema, RefreshTokenSchema } from '../validators/auth.validator';
import { ResponseUtil } from '../utils/response.util';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() body: any) {
    const validated = RegisterUserSchema.parse(body);
    const result = await this.authService.register(validated as any);
    return ResponseUtil.success(result, 'Registration successful');
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: any) {
    const validated = LoginUserSchema.parse(body);
    const result = await this.authService.login(validated as any);
    return ResponseUtil.success(result, 'Login successful');
  }

  @Post('google')
  @HttpCode(HttpStatus.OK)
  async googleLogin(@Body() body: any) {
    const payload = body?.data || body;
    const result = await this.authService.googleLogin(payload);
    return ResponseUtil.success(result, 'Google login successful');
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() body: any) {
    const validated = RefreshTokenSchema.parse(body);
    const result = await this.authService.refreshToken(validated.refreshToken);
    return ResponseUtil.success(result, 'Access token refreshed successfully');
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Req() req: any) {
    return ResponseUtil.success({ user: req.user }, 'Current user retrieved successfully');
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: any) {
    // In a real app we'd invalidate the refresh token in the DB here
    return ResponseUtil.success(null, 'Logged out successfully');
  }
}
