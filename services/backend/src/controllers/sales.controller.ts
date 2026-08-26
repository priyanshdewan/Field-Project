import { Controller, Get, Post, Query, Param, Body, UseGuards, Req } from '@nestjs/common';
import { SalesService } from '../services/sales.service';
import { Roles, RolesGuard } from '../middlewares/rbac.middleware';
import { ResponseUtil } from '../utils/response.util';

@Controller('api/sales')
@UseGuards(RolesGuard)
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Get()
  @Roles('ADMIN', 'OWNER', 'MANAGER', 'CASHIER')
  async listSales(@Query() query: any, @Req() req: any) {
    const result = await this.salesService.listSales(query, req.user?.companyId);
    return ResponseUtil.success(result.data, 'Sales transactions retrieved', result.meta);
  }

  @Get(':id')
  @Roles('ADMIN', 'OWNER', 'MANAGER', 'CASHIER')
  async getSale(@Param('id') id: string) {
    const sale = await this.salesService.getSaleById(id);
    return ResponseUtil.success(sale, 'Sale transaction details');
  }

  @Post()
  @Roles('ADMIN', 'OWNER', 'MANAGER', 'CASHIER')
  async createSale(@Body() body: any, @Req() req: any) {
    const sale = await this.salesService.createSale(
      body,
      req.user?.userId || 'system',
      req.user?.companyId,
      req.user?.branchId
    );
    return ResponseUtil.success(sale, 'Sale completed successfully');
  }
}
