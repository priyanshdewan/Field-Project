import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: DatabaseService) {}

  async getPaymentReports(workspaceId: string) {
    const suppliers = await this.prisma.supplier.findMany({
      where: { workspaceId },
      include: { purchaseOrders: true },
    });

    const accountsPayable = suppliers
      .map((s) => {
        const pendingPOs = s.purchaseOrders.filter((po) =>
          ['Draft', 'Ordered', 'Sent', 'Approved', 'Submitted'].includes(po.status),
        );
        const amountOwed = pendingPOs.reduce((sum, po) => sum + Number(po.totalAmount), 0);
        return {
          id: s.id,
          name: s.name,
          amountOwed,
          poCount: pendingPOs.length,
        };
      })
      .filter((s) => s.amountOwed > 0)
      .sort((a, b) => b.amountOwed - a.amountOwed);

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
