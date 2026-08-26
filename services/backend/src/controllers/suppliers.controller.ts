import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { SuppliersService } from '../services/suppliers.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('api/suppliers')
export class SuppliersController {
  constructor(private readonly service: SuppliersService) {}

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

  @Get('purchase-orders')
  async getOrders(@Req() req: any) {
    const data = await this.service.getOrders(req.user.companyId || req.user.workspaceId);
    return { success: true, data };
  }

  @Post('purchase-orders')
  async createOrder(@Body() body: any, @Req() req: any) {
    const data = await this.service.createOrder({ ...body, createdBy: req.user.userId }, req.user.companyId || req.user.workspaceId);
    return { success: true, data };
  }

  @Get('purchase-orders/:id')
  async getOrder(@Param('id') id: string, @Req() req: any) {
    const data = await this.service.getOrder(id, req.user.companyId || req.user.workspaceId);
    return { success: true, data };
  }

  @Put('purchase-orders/:id/status')
  async updateOrderStatus(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    const data = await this.service.updateOrderStatus(id, body.status, req.user.companyId || req.user.workspaceId);
    return { success: true, data };
  }

  @Post('purchase-orders/:id/receive')
  async receiveOrder(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    const data = await this.service.receiveOrder(id, body, req.user.userId, req.user.companyId || req.user.workspaceId);
    return { success: true, data };
  }
}
