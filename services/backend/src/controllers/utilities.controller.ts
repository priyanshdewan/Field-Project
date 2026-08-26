import { Controller, Get, Post, Put, Delete, Body, Req, Param, Query } from '@nestjs/common';
import { UtilitiesService } from '../services/utilities.service';

@Controller('api/utilities')
export class UtilitiesController {
  constructor(private readonly utilitiesService: UtilitiesService) {}

  @Get()
  async getUtilities(@Req() req, @Query('activeDate') activeDate: string) {
    const user = req.user;
    return await this.utilitiesService.getUtilities(user?.workspaceId || 'grandsquare-mall', activeDate);
  }

  @Post()
  async addUtilityReading(@Req() req, @Body() body: any) {
    const user = req.user;
    return await this.utilitiesService.addUtilityReading(user?.workspaceId || 'grandsquare-mall', body);
  }

  @Put(':id')
  async editUtilityReading(@Req() req, @Param('id') id: string, @Body() body: any) {
    const user = req.user;
    return await this.utilitiesService.editUtilityReading(user?.workspaceId || 'grandsquare-mall', id, body);
  }

  @Delete(':id')
  async deleteUtilityReading(@Req() req, @Param('id') id: string) {
    const user = req.user;
    return await this.utilitiesService.deleteUtilityReading(user?.workspaceId || 'grandsquare-mall', id);
  }
}
