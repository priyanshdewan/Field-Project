import { Injectable, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { LedgerService } from './ledger.service';

@Injectable()
export class InvestmentsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly ledgerService: LedgerService
  ) {}

  async getInvestments(workspaceId: string) {
    try {
      const investments = await this.db.investment.findMany({
        where: { workspaceId },
        orderBy: { purchasedAt: 'desc' },
      });

      return investments.map((inv) => ({
        id: inv.id,
        assetName: inv.assetName,
        symbol: inv.symbol,
        purchasePrice: Number(inv.purchasePrice),
        quantity: Number(inv.quantity),
        totalCost: Number(inv.totalCost),
        currentValue: Number(inv.currentValue),
        status: inv.status,
        purchasedAt: inv.purchasedAt.toISOString(),
        liquidatedAt: inv.liquidatedAt ? inv.liquidatedAt.toISOString() : null,
        liquidatedPrice: inv.liquidatedPrice ? Number(inv.liquidatedPrice) : null,
        liquidatedAmount: inv.liquidatedAmount ? Number(inv.liquidatedAmount) : null,
      }));
    } catch (err) {
      console.warn('[InvestmentsService] getInvestments error:', err);
      return [];
    }
  }

  async investCorporateCash(workspaceId: string, email: string, role: string, data: { assetName: string; symbol: string; purchasePrice: number; quantity: number; totalCost: number }) {
    return this.db.$transaction(async (tx) => {
      await this.ledgerService.seedLedgerAccounts(tx, workspaceId);

      const cashAccount = await tx.ledgerAccount.findFirst({
        where: { code: '1000', workspaceId },
        include: { entries: true },
      });

      const cashBalance = cashAccount
        ? cashAccount.entries.reduce((sum, e) => sum + Number(e.debitAmount) - Number(e.creditAmount), 0)
        : 0;

      if (cashBalance < data.totalCost) {
        throw new BadRequestException(`Insufficient corporate cash balance in General Ledger. Available: ₹${cashBalance.toFixed(0)}, Required: ₹${data.totalCost.toFixed(0)}`);
      }

      const investment = await tx.investment.create({
        data: {
          assetName: data.assetName,
          symbol: data.symbol,
          purchasePrice: data.purchasePrice,
          quantity: data.quantity,
          totalCost: data.totalCost,
          currentValue: data.totalCost,
          status: 'Active',
          workspaceId,
        },
      });

      await this.ledgerService.recordDoubleEntry(tx, workspaceId, {
        journalId: `JNL-INVEST-${investment.id}`,
        referenceType: 'Investment',
        referenceId: investment.id,
        description: `Corporate investment in ${data.assetName} (${data.quantity} units @ ₹${data.purchasePrice}/unit)`,
        debits: [{ code: '1400', amount: data.totalCost }],
        credits: [{ code: '1000', amount: data.totalCost }],
      });

      await tx.businessEvent.create({
        data: {
          eventType: 'INVESTMENT_PURCHASED',
          entityType: 'Investment',
          entityId: investment.id,
          title: `Asset Purchased: ${data.assetName}`,
          description: `Acquired ${data.quantity} units of ${data.symbol} for a total of ₹${data.totalCost.toFixed(0)}.`,
          metadata: JSON.stringify({ asset: data.assetName, cost: data.totalCost, qty: data.quantity }),
          workspaceId,
        },
      });

      await tx.auditLog.create({
        data: {
          userId: email,
          action: 'INVESTMENT_CREATE',
          entityType: 'Investment',
          entityId: investment.id,
          afterData: JSON.stringify(investment),
          workspaceId,
        },
      });

      return investment;
    });
  }

  async liquidateInvestment(workspaceId: string, email: string, role: string, investmentId: string, liquidatedPrice: number) {
    return this.db.$transaction(async (tx) => {
      const investment = await tx.investment.findUnique({
        where: { id: investmentId, workspaceId },
      });

      if (!investment) throw new BadRequestException('Investment not found.');
      if (investment.status !== 'Active') throw new BadRequestException('This investment has already been liquidated.');

      const totalCost = Number(investment.totalCost);
      const quantity = Number(investment.quantity);
      const liquidatedAmount = liquidatedPrice * quantity;
      const gainLoss = liquidatedAmount - totalCost;

      const updatedInvestment = await tx.investment.update({
        where: { id: investmentId, workspaceId },
        data: {
          status: 'Liquidated',
          liquidatedAt: new Date(),
          liquidatedPrice: liquidatedPrice,
          liquidatedAmount: liquidatedAmount,
          currentValue: liquidatedAmount,
        },
      });

      const debits: Array<{ code: string; amount: number }> = [];
      const credits: Array<{ code: string; amount: number }> = [];

      debits.push({ code: '1000', amount: liquidatedAmount });
      credits.push({ code: '1400', amount: totalCost });

      if (gainLoss > 0) {
        credits.push({ code: '4100', amount: gainLoss });
      } else if (gainLoss < 0) {
        debits.push({ code: '5500', amount: Math.abs(gainLoss) });
      }

      await this.ledgerService.recordDoubleEntry(tx, workspaceId, {
        journalId: `JNL-LIQUID-${investment.id}`,
        referenceType: 'Investment',
        referenceId: investment.id,
        description: `Corporate investment liquidation of ${investment.assetName}`,
        debits,
        credits,
      });

      await tx.businessEvent.create({
        data: {
          eventType: 'INVESTMENT_LIQUIDATED',
          entityType: 'Investment',
          entityId: investment.id,
          title: `Asset Liquidated: ${investment.assetName}`,
          description: `Sold ${quantity} units of ${investment.symbol} for ₹${liquidatedAmount.toFixed(0)}, resulting in a ${gainLoss >= 0 ? 'gain' : 'loss'} of ₹${Math.abs(gainLoss).toFixed(0)}.`,
          metadata: JSON.stringify({ asset: investment.assetName, amount: liquidatedAmount, gainLoss }),
          workspaceId,
        },
      });

      await tx.auditLog.create({
        data: {
          userId: email,
          action: 'INVESTMENT_LIQUIDATE',
          entityType: 'Investment',
          entityId: investment.id,
          afterData: JSON.stringify(updatedInvestment),
          workspaceId,
        },
      });

      return updatedInvestment;
    });
  }

  async getMarketData() {
    const commodities = [
      { name: 'Gold (XAU)', symbol: 'XAU', price: 74200, unit: '10g', trend: 1.2, color: '#eab308' },
      { name: 'Silver (XAG)', symbol: 'XAG', price: 89000, unit: 'kg', trend: -0.4, color: '#94a3b8' },
      { name: 'Bitcoin (BTC)', symbol: 'BTC', price: 5500000, unit: 'coin', trend: 2.1, color: '#f7931a' },
      { name: 'Retail Industry Index (RTL)', symbol: 'RTL', price: 12800, unit: 'share', trend: 0.8, color: '#10b981' },
      { name: 'Crude Oil (WTI)', symbol: 'WTI', price: 6450, unit: 'barrel', trend: -1.5, color: '#f97316' },
    ];

    try {
      const res = await fetch('https://goldratetodaylive.in/api/v1/rates/today.json');
      if (res.ok) {
        const data = await res.json();
        const gold999 = data.rates?.gold?.['999'];
        if (gold999) commodities[0].price = Math.round(Number(gold999));
        
        const silver999 = data.rates?.silver?.['999'];
        if (silver999) commodities[1].price = Math.round(Number(silver999));
      }
    } catch (e) {}

    try {
      const btcRes = await fetch('https://api.coindesk.com/v1/bpi/currentprice/INR.json');
      if (btcRes.ok) {
        const data = await btcRes.json();
        const btcInr = data.bpi?.INR?.rate_float;
        if (btcInr) commodities[2].price = Math.round(btcInr);
      }
    } catch (e) {}

    return commodities;
  }
}
