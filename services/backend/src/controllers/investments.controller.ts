import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { InvestmentsService } from '../services/investments.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { ResponseUtil } from '../utils/response.util';

@Controller('api/investments')
@UseGuards(JwtAuthGuard)
export class InvestmentsController {
  constructor(private readonly investmentsService: InvestmentsService) {}

  @Get()
  async getInvestments(@Req() req: any) {
    const data = await this.investmentsService.getInvestments(req.user.workspaceId);
    return ResponseUtil.success(data, 'Investments retrieved successfully');
  }

  @Post()
  async investCorporateCash(@Req() req: any, @Body() body: any) {
    const data = await this.investmentsService.investCorporateCash(
      req.user.workspaceId,
      req.user.email,
      req.user.role,
      body
    );
    return ResponseUtil.success(data, 'Investment recorded successfully');
  }

  @Post(':id/liquidate')
  async liquidateInvestment(@Req() req: any, @Param('id') id: string, @Body() body: { liquidatedPrice: number }) {
    const data = await this.investmentsService.liquidateInvestment(
      req.user.workspaceId,
      req.user.email,
      req.user.role,
      id,
      body.liquidatedPrice
    );
    return ResponseUtil.success(data, 'Investment liquidated successfully');
  }

  @Get('market-data')
  async getMarketData() {
    const data = await this.investmentsService.getMarketData();
    return ResponseUtil.success(data, 'Live market data retrieved successfully');
  }
}
