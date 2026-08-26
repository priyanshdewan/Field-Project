import { Injectable } from '@nestjs/common';
import { SalesService } from '../../services/sales.service';
import { ProductService } from '../../services/product.service';

@Injectable()
export class AiCfoAgent {
  constructor(
    private readonly salesService: SalesService,
    private readonly productService: ProductService
  ) {}

  async analyzeFinancialHealth(companyId?: string) {
    const salesData = await this.salesService.listSales({ limit: 100 }, companyId);
    const productsData = await this.productService.listProducts({ limit: 100 }, companyId);

    const totalRevenue = salesData.data.reduce((acc, s) => acc + (s.grandTotal || 0), 0);
    const avgMargin = 0.28; // 28% estimated margin

    return {
      agent: 'AI CFO',
      companyId,
      analysisDate: new Date(),
      metrics: {
        totalRevenue,
        estimatedProfit: totalRevenue * avgMargin,
        transactionCount: salesData.meta.total,
        activeProductCount: productsData.meta.total,
      },
      recommendations: [
        'Optimize reorder points for high-cost inventory items to minimize working capital block.',
        'Review supplier payment terms to extend accounts payable settlement cycle by 7 days.',
      ],
    };
  }
}
