import { Controller, Get, Post, Put, Body, Req, Param } from '@nestjs/common';
import { LogisticsService } from '../services/logistics.service';

@Controller('api/logistics')
export class LogisticsController {
  constructor(private readonly logisticsService: LogisticsService) {}

  @Get()
  async getDispatches(@Req() req) {
    const user = req.user;
    return await this.logisticsService.getDispatches(user?.workspaceId || 'grandsquare-mall');
  }

  @Post()
  async createDispatch(@Req() req, @Body() body: any) {
    const user = req.user;
    return await this.logisticsService.createDispatch(user?.workspaceId || 'grandsquare-mall', body);
  }

  @Put(':id/status')
  async updateStatus(@Req() req, @Param('id') id: string, @Body('status') status: string, @Body('delayReason') delayReason?: string) {
    const user = req.user;
    return await this.logisticsService.updateStatus(user?.workspaceId || 'grandsquare-mall', id, status, delayReason);
  }
}
