import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { StaffService } from '../services/staff.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('api/staff')
export class StaffController {
  constructor(private readonly service: StaffService) {}

  @Get()
  async findAll(@Req() req: any) {
    const data = await this.service.findAll(req.user.companyId || req.user.workspaceId);
    return { success: true, data };
  }

  @Post()
  async create(@Body() body: any, @Req() req: any) {
    const data = await this.service.create(body, req.user.companyId || req.user.workspaceId);
    return { success: true, data };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    const data = await this.service.update(id, body, req.user.companyId || req.user.workspaceId);
    return { success: true, data };
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    const data = await this.service.remove(id, req.user.companyId || req.user.workspaceId);
    return { success: true, data };
  }
}
