import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: DatabaseService) {}

  async getPaymentReports(workspaceId: string) {
    const accountsPayable: any[] = [];

    const transactions = await this.prisma.transaction.findMany({
      where: {
        workspaceId,
        paymentStatus: { in: ['Pending', 'Failed'] },
      },
      include: {
        customer: true,
      },
    });

    const accountsReceivable = transactions
      .map((t) => ({
        id: t.id,
        transactionNumber: t.transactionNumber,
        customerName: t.customer
          ? `${t.customer.firstName} ${t.customer.lastName}`.trim()
          : 'Walk-in Customer',
        amountDue: Number(t.totalAmount),
        date: t.transactionDate.toISOString(),
        status: t.paymentStatus,
      }))
      .sort((a, b) => b.amountDue - a.amountDue);

    return {
      success: true,
      data: {
        accountsPayable,
        accountsReceivable,
        totalPayable: accountsPayable.reduce((sum, s) => sum + s.amountOwed, 0),
        totalReceivable: accountsReceivable.reduce((sum, t) => sum + t.amountDue, 0),
      }
    };
  }

  async sendAllReportsWhatsApp(workspaceId: string) {
    // Mocked for now. In a real scenario, integrate with WhatsApp service
    return { success: true };
  }
}
