import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { Prisma } from '@prisma/client';

export const DEFAULT_ACCOUNTS = [
  { code: '1000', name: 'Cash', type: 'ASSET' },
  { code: '1200', name: 'Accounts Receivable', type: 'ASSET' },
  { code: '1300', name: 'Inventory Asset', type: 'ASSET' },
  { code: '1400', name: 'Investment Assets', type: 'ASSET' },
  { code: '2000', name: 'Accounts Payable', type: 'LIABILITY' },
  { code: '4000', name: 'Sales Revenue', type: 'REVENUE' },
  { code: '4100', name: 'Investment Revenues & Gains', type: 'REVENUE' },
  { code: '4200', name: 'Rent & Lease Revenue', type: 'REVENUE' },
  { code: '4300', name: 'Other Revenue / Parking', type: 'REVENUE' },
  { code: '5000', name: 'Cost of Goods Sold', type: 'EXPENSE' },
  { code: '5100', name: 'Utility Expense', type: 'EXPENSE' },
  { code: '5200', name: 'Salaries Expense', type: 'EXPENSE' },
  { code: '5300', name: 'Rent & Lease Expense', type: 'EXPENSE' },
  { code: '5400', name: 'Procurement Expense', type: 'EXPENSE' },
  { code: '5500', name: 'Investment Losses', type: 'EXPENSE' },
  { code: '5600', name: 'Tax & Compliance Expense', type: 'EXPENSE' },
];

@Injectable()
export class LedgerService {
  constructor(private readonly db: DatabaseService) {}

  async seedLedgerAccounts(tx: Prisma.TransactionClient, workspaceId: string) {
    const existingAccounts = await tx.ledgerAccount.findMany({ where: { workspaceId } });
    const existingCodes = new Set(existingAccounts.map((a) => a.code));

    for (const ac of DEFAULT_ACCOUNTS) {
      if (!existingCodes.has(ac.code)) {
        await tx.ledgerAccount.create({
          data: {
            code: ac.code,
            name: ac.name,
            type: ac.type,
            workspaceId,
          },
        });
      }
    }

    const cashAc =
      existingAccounts.find((a) => a.code === '1000') ||
      (await tx.ledgerAccount.findFirst({ where: { code: '1000', workspaceId } }));

    if (cashAc) {
      const entriesCount = await tx.ledgerEntry.count({
        where: { accountId: cashAc.id, workspaceId },
      });
      if (entriesCount === 0) {
        await tx.ledgerEntry.create({
          data: {
            journalId: 'JNL-INIT-CAPITAL',
            accountId: cashAc.id,
            debitAmount: 5000000,
            creditAmount: 0,
            description: 'Initial owner equity capital deposit for treasury operations',
            workspaceId,
          },
        });
      }
    }
  }

  async recordDoubleEntry(
    tx: Prisma.TransactionClient,
    workspaceId: string,
    data: {
      journalId: string;
      referenceType: string;
      referenceId: string;
      description: string;
      debits: Array<{ code: string; amount: number }>;
      credits: Array<{ code: string; amount: number }>;
    },
  ) {
    const debitsSum = data.debits.reduce((sum, d) => sum + d.amount, 0);
    const creditsSum = data.credits.reduce((sum, c) => sum + c.amount, 0);
    if (Math.abs(debitsSum - creditsSum) > 0.01) {
      throw new Error(`Double-entry balance mismatch! Debits: ₹${debitsSum}, Credits: ₹${creditsSum}`);
    }

    await this.seedLedgerAccounts(tx, workspaceId);

    for (const db of data.debits) {
      const account = await tx.ledgerAccount.findFirst({ where: { code: db.code, workspaceId } });
      if (!account) throw new Error(`Ledger account ${db.code} not found.`);

      await tx.ledgerEntry.create({
        data: {
          accountId: account.id,
          journalId: data.journalId,
          debitAmount: db.amount,
          creditAmount: 0,
          referenceType: data.referenceType,
          referenceId: data.referenceId,
          description: data.description,
          workspaceId,
        },
      });
    }

    for (const cr of data.credits) {
      const account = await tx.ledgerAccount.findFirst({ where: { code: cr.code, workspaceId } });
      if (!account) throw new Error(`Ledger account ${cr.code} not found.`);

      await tx.ledgerEntry.create({
        data: {
          accountId: account.id,
          journalId: data.journalId,
          debitAmount: 0,
          creditAmount: cr.amount,
          referenceType: data.referenceType,
          referenceId: data.referenceId,
          description: data.description,
          workspaceId,
        },
      });
    }
  }

  async getLedgerBalances(workspaceId: string) {
    await this.db.$transaction(async (tx) => {
      await this.seedLedgerAccounts(tx, workspaceId);
    });

    const accounts = await this.db.ledgerAccount.findMany({
      where: { workspaceId },
      include: { entries: true },
    });

    const trialBalance = accounts.map((ac) => {
      const totalDebits = ac.entries.reduce((sum, e) => sum + Number(e.debitAmount), 0);
      const totalCredits = ac.entries.reduce((sum, e) => sum + Number(e.creditAmount), 0);

      let balance = 0;
      if (ac.type === 'ASSET' || ac.type === 'EXPENSE') {
        balance = totalDebits - totalCredits;
      } else {
        balance = totalCredits - totalDebits;
      }

      return {
        id: ac.id,
        code: ac.code,
        name: ac.name,
        type: ac.type,
        debits: totalDebits,
        credits: totalCredits,
        balance,
      };
    });

    const totalDebits = trialBalance.reduce((sum, a) => sum + a.debits, 0);
    const totalCredits = trialBalance.reduce((sum, a) => sum + a.credits, 0);

    return { trialBalance, totalDebits, totalCredits };
  }

  async recordIncomingRevenue(workspaceId: string, data: { amount: number; category: 'Rent' | 'Other'; description: string; role: string; emailUser: string }) {
    return this.db.$transaction(async (tx) => {
      await this.seedLedgerAccounts(tx, workspaceId);

      const revenueCode = data.category === 'Rent' ? '4200' : '4300';
      const journalId = `JNL-REV-${Date.now()}`;

      await this.recordDoubleEntry(tx, workspaceId, {
        journalId,
        referenceType: 'IncomingRevenue',
        referenceId: journalId,
        description: data.description,
        debits: [{ code: '1000', amount: data.amount }],
        credits: [{ code: revenueCode, amount: data.amount }],
      });

      return { success: true };
    });
  }

  async getIncomingPayments(workspaceId: string) {
    const entries = await this.db.ledgerEntry.findMany({
      where: {
        workspaceId,
        account: {
          code: { in: ['4000', '4100', '4200', '4300'] },
        },
        creditAmount: { gt: 0 },
      },
      include: { account: true },
      orderBy: { createdAt: 'desc' },
    });

    return entries.map((e) => ({
      id: e.id,
      journalId: e.journalId,
      accountCode: e.account.code,
      accountName: e.account.name,
      amount: Number(e.creditAmount),
      description: e.description || 'Inflow payment received',
      date: e.createdAt.toISOString(),
      referenceType: e.referenceType,
      referenceId: e.referenceId,
    }));
  }

  async recordTaxPayment(workspaceId: string, data: { amount: number; category: 'GST' | 'Corporate Income Tax' | 'Property Tax' | 'TDS'; description: string; challanNumber: string; role: string; emailUser: string }) {
    return this.db.$transaction(async (tx) => {
      await this.seedLedgerAccounts(tx, workspaceId);

      const journalId = `JNL-TAX-${Date.now()}`;

      await this.recordDoubleEntry(tx, workspaceId, {
        journalId,
        referenceType: 'TaxPayment',
        referenceId: data.challanNumber || journalId,
        description: `${data.category} payment - Challan #${data.challanNumber}: ${data.description}`,
        debits: [{ code: '5600', amount: data.amount }],
        credits: [{ code: '1000', amount: data.amount }],
      });

      return { success: true };
    });
  }

  async getTaxPayments(workspaceId: string) {
    const entries = await this.db.ledgerEntry.findMany({
      where: {
        workspaceId,
        account: { code: '5600' },
        debitAmount: { gt: 0 },
      },
      include: { account: true },
      orderBy: { createdAt: 'desc' },
    });

    return entries.map((e) => ({
      id: e.id,
      journalId: e.journalId,
      amount: Number(e.debitAmount),
      description: e.description || 'Tax payment recorded',
      date: e.createdAt.toISOString(),
      referenceId: e.referenceId,
    }));
  }
}
