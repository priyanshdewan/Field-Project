import { Controller, Get, Post, Body, Query, UseGuards, Req } from '@nestjs/common';
import { AnalyticsService } from '../services/analytics.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('api/analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('command-center')
  async getCommandCenter(@Req() req, @Query('activeDate') activeDate: string, @Query('timeRange') timeRange: string) {
    const user = req.user;
    return await this.analyticsService.getCommandCenter(user?.workspaceId || 'grandsquare-mall', activeDate, timeRange);
  }

  @Get('anomalies')
  async getAnomalies(@Req() req, @Query('activeDate') activeDate: string) {
    const user = req.user;
    return await this.analyticsService.getAnomalies(user?.workspaceId || 'grandsquare-mall', activeDate);
  }

  @Get('recommendations')
  async getRecommendations(@Req() req) {
    const user = req.user;
    return await this.analyticsService.getRecommendations(user?.workspaceId || 'grandsquare-mall');
  }

  @Get('forecasting')
  async getForecasting(@Req() req, @Query('horizon') horizon: string, @Query('scenario') scenario: string) {
    const user = req.user;
    return await this.analyticsService.getForecasting(user?.workspaceId || 'grandsquare-mall', horizon, scenario);
  }

  @Post('eod-report')
  async dispatchEodReport(@Req() req, @Body('activeDate') activeDate: string) {
    const user = req.user;
    return await this.analyticsService.dispatchEodReport(user?.workspaceId || 'grandsquare-mall', activeDate);
  }
}
