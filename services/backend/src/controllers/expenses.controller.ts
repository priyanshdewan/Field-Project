import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ExpensesService } from '../services/expenses.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { ResponseUtil } from '../utils/response.util';

@Controller('api/expenses')
@UseGuards(JwtAuthGuard)
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Get()
  async getExpenses(@Req() req: any) {
    const data = await this.expensesService.getExpenses(req.user.workspaceId);
    return ResponseUtil.success(data, 'Expenses retrieved successfully');
  }

  @Post()
  async addExpense(@Req() req: any, @Body() body: any) {
    const data = await this.expensesService.addExpense(req.user.workspaceId, req.user.email, body);
    return ResponseUtil.success(data, 'Expense added successfully');
  }

  @Put(':id')
  async editExpense(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    const data = await this.expensesService.editExpense(req.user.workspaceId, id, body);
    return ResponseUtil.success(data, 'Expense updated successfully');
  }

  @Delete(':id')
  async archiveExpense(@Req() req: any, @Param('id') id: string) {
    const data = await this.expensesService.archiveExpense(req.user.workspaceId, id);
    return ResponseUtil.success(data, 'Expense voided successfully');
  }
}
