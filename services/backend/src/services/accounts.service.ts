import { Injectable, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { LedgerService } from './ledger.service';

@Injectable()
export class AccountsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly ledgerService: LedgerService
  ) {}

  async getAccountsData(workspaceId: string) {
    const receivables = await this.db.transaction.findMany({
      where: { workspaceId, paymentStatus: { in: ['Pending', 'Failed'] } },
      include: { customer: true },
      orderBy: { transactionDate: 'desc' },
    });

    const paidEntries = await this.db.ledgerEntry.findMany({
      where: { workspaceId, referenceType: 'PurchaseOrderPayment' },
      select: { referenceId: true },
    });
    const paidPoIds = new Set(paidEntries.map((e) => e.referenceId).filter(Boolean));

    const payables = await this.db.purchaseOrder.findMany({
      where: { workspaceId, status: { in: ['Submitted', 'Ordered', 'Partially_Received', 'Sent', 'Received'] } },
      include: { supplier: true },
      orderBy: { orderDate: 'desc' },
    });

    const unpaidPayables = payables.filter((p) => !paidPoIds.has(p.id));

    const fds = await this.db.fixedDeposit.findMany({
      where: { workspaceId },
      orderBy: { startDate: 'desc' },
    });

    const loans = await this.db.corporateLoan.findMany({
      where: { workspaceId },
      orderBy: { takenDate: 'desc' },
    });

    await this.db.$transaction(async (tx) => {
      await this.ledgerService.seedLedgerAccounts(tx, workspaceId);
    });

    const cashAccount = await this.db.ledgerAccount.findFirst({
      where: { code: '1000', workspaceId },
      include: { entries: true },
    });

    let cashBalance = 0;
    if (cashAccount) {
      const totalDebits = cashAccount.entries.reduce((sum, e) => sum + Number(e.debitAmount), 0);
      const totalCredits = cashAccount.entries.reduce((sum, e) => sum + Number(e.creditAmount), 0);
      cashBalance = totalDebits - totalCredits;
    }

    return {
      cashBalance,
      receivables: receivables.map((r) => ({
        id: r.id,
        transactionNumber: r.transactionNumber,
        date: r.transactionDate.toISOString(),
        amount: Number(r.totalAmount),
        status: r.paymentStatus,
        customerName: r.customer ? `${r.customer.firstName} ${r.customer.lastName}`.trim() : 'Walk-in Customer',
        customerId: r.customerId,
      })),
      payables: unpaidPayables.map((p) => ({
        id: p.id,
        poNumber: p.poNumber,
        date: p.orderDate.toISOString(),
        amount: Number(p.totalAmount),
        status: p.status,
        supplierName: p.supplier ? p.supplier.name : 'Unknown Supplier',
        supplierId: p.supplierId,
        isPaid: false,
      })),
      fds: fds.map((f) => ({
        id: f.id,
        bankName: f.bankName,
        principal: Number(f.principal),
        interestRate: Number(f.interestRate),
        duration: f.duration,
        status: f.status,
        startDate: f.startDate.toISOString(),
        matureDate: f.matureDate.toISOString(),
      })),
      loans: loans.map((l) => ({
        id: l.id,
        bankName: l.bankName,
        principal: Number(l.principal),
        interestRate: Number(l.interestRate),
        balance: Number(l.balance),
        duration: l.duration,
        status: l.status,
        takenDate: l.takenDate.toISOString(),
      })),
    };
  }

  async createFixedDeposit(workspaceId: string, data: { bankName: string; principal: number; interestRate: number; duration: number }) {
    return this.db.$transaction(async (tx) => {
      await this.ledgerService.seedLedgerAccounts(tx, workspaceId);

      const cashAccount = await tx.ledgerAccount.findFirst({
        where: { code: '1000', workspaceId },
        include: { entries: true },
      });
      const cashBalance = cashAccount
        ? cashAccount.entries.reduce((sum, e) => sum + Number(e.debitAmount) - Number(e.creditAmount), 0)
        : 0;

      if (cashBalance < data.principal) {
        throw new BadRequestException(`Insufficient cash balance (₹${cashBalance.toFixed(0)}) to create FD of ₹${data.principal.toFixed(0)}.`);
      }

      const matureDate = new Date(Date.now() + data.duration * 30 * 24 * 3600 * 1000);

      const fd = await tx.fixedDeposit.create({
        data: {
          bankName: data.bankName,
          principal: data.principal,
          interestRate: data.interestRate,
          duration: data.duration,
          status: 'Active',
          matureDate,
          workspaceId,
        },
      });

      await this.ledgerService.recordDoubleEntry(tx, workspaceId, {
        journalId: `JNL-FD-${fd.id}`,
        referenceType: 'FixedDeposit',
        referenceId: fd.id,
        description: `Created Bank Fixed Deposit at ${data.bankName} (Principal: ₹${data.principal.toFixed(0)}, Rate: ${data.interestRate}%)`,
        debits: [{ code: '1400', amount: data.principal }],
        credits: [{ code: '1000', amount: data.principal }],
      });

      return fd;
    });
  }

  async createCorporateLoan(workspaceId: string, data: { bankName: string; principal: number; interestRate: number; duration: number }) {
    return this.db.$transaction(async (tx) => {
      await this.ledgerService.seedLedgerAccounts(tx, workspaceId);

      const loan = await tx.corporateLoan.create({
        data: {
          bankName: data.bankName,
          principal: data.principal,
          interestRate: data.interestRate,
          balance: data.principal,
          duration: data.duration,
          status: 'Active',
          workspaceId,
        },
      });

      await this.ledgerService.recordDoubleEntry(tx, workspaceId, {
        journalId: `JNL-LOAN-${loan.id}`,
        referenceType: 'CorporateLoan',
        referenceId: loan.id,
        description: `Disbursed Corporate Loan from ${data.bankName} (Principal: ₹${data.principal.toFixed(0)}, Rate: ${data.interestRate}%)`,
        debits: [{ code: '1000', amount: data.principal }],
        credits: [{ code: '2000', amount: data.principal }],
      });

      return loan;
    });
  }

  async repayLoan(workspaceId: string, loanId: string, amount: number) {
    return this.db.$transaction(async (tx) => {
      await this.ledgerService.seedLedgerAccounts(tx, workspaceId);

      const loan = await tx.corporateLoan.findUnique({
        where: { id: loanId, workspaceId },
      });
      if (!loan) throw new BadRequestException('Loan record not found.');

      const cashAccount = await tx.ledgerAccount.findFirst({
        where: { code: '1000', workspaceId },
        include: { entries: true },
      });
      const cashBalance = cashAccount
        ? cashAccount.entries.reduce((sum, e) => sum + Number(e.debitAmount) - Number(e.creditAmount), 0)
        : 0;

      if (cashBalance < amount) {
        throw new BadRequestException(`Insufficient cash balance to make repayment of ₹${amount}.`);
      }

      const newBalance = Math.max(0, Number(loan.balance) - amount);
      const newStatus = newBalance <= 0 ? 'Paid' : 'Active';

      const updated = await tx.corporateLoan.update({
        where: { id: loanId, workspaceId },
        data: { balance: newBalance, status: newStatus },
      });

      await this.ledgerService.recordDoubleEntry(tx, workspaceId, {
        journalId: `JNL-REPAY-${loan.id}-${Date.now()}`,
        referenceType: 'CorporateLoan',
        referenceId: loan.id,
        description: `Corporate Loan Repayment to ${loan.bankName}`,
        debits: [{ code: '2000', amount }],
        credits: [{ code: '1000', amount }],
      });

      return updated;
    });
  }

  async payPurchaseOrder(workspaceId: string, poId: string) {
    return this.db.$transaction(async (tx) => {
      await this.ledgerService.seedLedgerAccounts(tx, workspaceId);

      const po = await tx.purchaseOrder.findUnique({
        where: { id: poId, workspaceId },
      });
      if (!po) throw new BadRequestException('Purchase Order not found.');

      const existingPayment = await tx.ledgerEntry.findFirst({
        where: { workspaceId, referenceType: 'PurchaseOrderPayment', referenceId: po.id },
      });
      if (existingPayment) throw new BadRequestException('This Purchase Order has already been paid.');

      const cashAccount = await tx.ledgerAccount.findFirst({
        where: { code: '1000', workspaceId },
        include: { entries: true },
      });
      const cashBalance = cashAccount
        ? cashAccount.entries.reduce((sum, e) => sum + Number(e.debitAmount) - Number(e.creditAmount), 0)
        : 0;

      const poAmount = Number(po.totalAmount);
      if (cashBalance < poAmount) {
        throw new BadRequestException(`Insufficient cash reserves. Requires ₹${poAmount}.`);
      }

      await this.ledgerService.recordDoubleEntry(tx, workspaceId, {
        journalId: `JNL-PAY-PO-${po.id}`,
        referenceType: 'PurchaseOrderPayment',
        referenceId: po.id,
        description: `Paid supplier invoice for PO #${po.poNumber}`,
        debits: [{ code: '5400', amount: poAmount }],
        credits: [{ code: '1000', amount: poAmount }],
      });

      return { poId: po.id };
    });
  }
}
