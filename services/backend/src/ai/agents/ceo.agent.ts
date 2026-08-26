import { Injectable } from '@nestjs/common';
import { AiCfoAgent } from './cfo.agent';

@Injectable()
export class AiCeoAdvisorAgent {
  constructor(private readonly cfoAgent: AiCfoAgent) {}

  async generateExecutiveBrief(companyId?: string) {
    const financialBrief = await this.cfoAgent.analyzeFinancialHealth(companyId);

    return {
      agent: 'AI CEO Advisor',
      companyId,
      timestamp: new Date(),
      healthScore: 92,
      executiveSummary: `Company operating smoothly with ${financialBrief.metrics.transactionCount} transactions processed. Estimated revenue at ₹${financialBrief.metrics.totalRevenue.toLocaleString()}.`,
      actionItems: [
        { priority: 'HIGH', title: 'Expand high-margin SKU catalog in retail branches.' },
        { priority: 'MEDIUM', title: 'Evaluate supplier delivery ratings before Q3 restock.' },
      ],
    };
  }
}
