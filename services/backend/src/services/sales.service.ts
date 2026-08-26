import { Injectable, NotFoundException } from '@nestjs/common';
import { SaleModel, InvoiceModel } from '../models';
import { PaginationUtil, PaginationQuery } from '../utils/pagination.util';

@Injectable()
export class SalesService {
  async listSales(query: PaginationQuery, companyId?: string) {
    const { page, limit, skip, sort, search } = PaginationUtil.parseQueryParams(query);

    const filter: any = {};
    if (companyId) {
      filter.companyId = companyId;
    }
    if (search) {
      filter.saleNumber = { $regex: search, $options: 'i' };
    }

    const [sales, total] = await Promise.all([
      SaleModel.find(filter).sort(sort).skip(skip).limit(limit),
      SaleModel.countDocuments(filter),
    ]);

    return PaginationUtil.formatResult(sales, total, page, limit);
  }

  async createSale(data: any, cashierId: string, companyId?: string, branchId?: string) {
    const saleNumber = `SALE-${Date.now().toString().slice(-6)}`;
    const sale = await SaleModel.create({
      ...data,
      saleNumber,
      cashierId,
      companyId,
      branchId,
    });

    // Automatically generate corresponding tax invoice record
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
    await InvoiceModel.create({
      companyId,
      saleId: sale._id,
      invoiceNumber,
      customerName: data.customerName || 'Walk-in Customer',
      amount: sale.grandTotal,
      taxAmount: sale.taxTotal,
    });

    return sale;
  }

  async getSaleById(id: string) {
    const sale = await SaleModel.findById(id);
    if (!sale) {
      throw new NotFoundException(`Sale transaction ${id} not found`);
    }
    return sale;
  }
}
