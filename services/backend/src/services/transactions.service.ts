import { Injectable, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { LedgerService } from './ledger.service';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly ledgerService: LedgerService
  ) {}

  async createTransaction(workspaceId: string, email: string, role: string, data: {
    customerId?: string;
    walkinPhone?: string;
    departmentId: string;
    items: Array<{ productId: string; quantity: number; discount: number }>;
    paymentMethod: string;
    cashierId?: string;
    transactionDate?: string;
  }) {
    if (data.items.length === 0) {
      throw new BadRequestException('Cannot create a sale with zero items.');
    }

    return this.db.$transaction(async (tx) => {
      const productIds = data.items.map((item) => item.productId);
      const dbProducts = await tx.product.findMany({
        where: { id: { in: productIds }, workspaceId },
      });

      let subtotal = 0;
      let totalDiscount = 0;
      let totalTax = 0;

      const txItemsData: any[] = [];
      const stockUpdates: any[] = [];
      const movementData: any[] = [];
      const outOfStockAlerts: any[] = [];

      for (const item of data.items) {
        const prod = dbProducts.find((p) => p.id === item.productId);
        if (!prod) throw new BadRequestException(`Product SKU ${item.productId} was not found.`);

        const price = Number(prod.sellingPrice);
        const cost = Number(prod.costPrice);
        const taxRate = Number(prod.taxRate) / 100;

        const stockRecords = await tx.inventoryStock.findMany({
          where: { productId: prod.id, workspaceId },
          orderBy: { locationId: 'asc' },
        });

        const totalStock = stockRecords.reduce((sum, s) => sum + s.quantityOnHand, 0);
        if (totalStock < item.quantity) {
          throw new BadRequestException(`Insufficient total stock for ${prod.name}. Available: ${totalStock}, Requested: ${item.quantity}`);
        }

        const itemSubtotal = price * item.quantity;
        const itemDiscount = item.discount;
        const taxableAmount = itemSubtotal - itemDiscount;
        const itemTax = taxableAmount * taxRate;
        const lineTotal = taxableAmount + itemTax;

        subtotal += itemSubtotal;
        totalDiscount += itemDiscount;
        totalTax += itemTax;

        const productBatches = await tx.productBatch.findMany({
          where: { productId: prod.id, quantityRemaining: { gt: 0 }, workspaceId },
          orderBy: { expiryDate: 'asc' },
        });

        let batchDeductRemaining = item.quantity;
        let assignedBatchId: string | null = null;

        for (const batch of productBatches) {
          if (batchDeductRemaining <= 0) break;
          const qtyToDeduct = Math.min(batch.quantityRemaining, batchDeductRemaining);
          if (qtyToDeduct > 0) {
            await tx.productBatch.update({
              where: { id: batch.id, workspaceId },
              data: { quantityRemaining: { decrement: qtyToDeduct } },
            });
            if (!assignedBatchId) assignedBatchId = batch.id;
            batchDeductRemaining -= qtyToDeduct;
          }
        }

        txItemsData.push({
          productId: prod.id,
          quantity: item.quantity,
          unitPrice: price,
          costPriceSnapshot: cost,
          discountAmount: itemDiscount,
          taxAmount: itemTax,
          lineTotal,
          batchId: assignedBatchId,
        });

        let remainingToDeduct = item.quantity;
        for (const stockRecord of stockRecords) {
          if (remainingToDeduct <= 0) break;
          const qtyToDeduct = Math.min(stockRecord.quantityOnHand, remainingToDeduct);
          if (qtyToDeduct > 0) {
            stockUpdates.push({
              productId: prod.id,
              locationId: stockRecord.locationId,
              qty: qtyToDeduct,
            });

            movementData.push({
              productId: prod.id,
              locationId: stockRecord.locationId,
              movementType: 'SALE',
              quantity: qtyToDeduct,
              reason: 'POS Sale Checkout',
              performedBy: role,
            });
            remainingToDeduct -= qtyToDeduct;
          }
        }

        const newStock = totalStock - item.quantity;
        if (newStock < prod.reorderLevel) {
          outOfStockAlerts.push({
            productName: prod.name,
            sku: prod.sku,
            remainingStock: newStock,
            reorderLevel: prod.reorderLevel,
          });
        }
      }

      const totalAmount = subtotal - totalDiscount + totalTax;
      const transactionId = `TXN-${Date.now().toString().slice(-6)}`;

      const transaction = await tx.transaction.create({
        data: {
          id: transactionId,
          transactionNumber: transactionId,
          customerId: data.customerId || null,
          departmentId: data.departmentId,
          cashierId: data.cashierId || 'cashier-01',
          transactionDate: data.transactionDate ? new Date(data.transactionDate) : new Date(),
          subtotal,
          discountAmount: totalDiscount,
          taxAmount: totalTax,
          totalAmount,
          paymentStatus: 'Paid',
          status: 'Completed',
          workspaceId,
        },
      });

      for (const txi of txItemsData) {
        await tx.transactionItem.create({
          data: {
            transactionId: transaction.id,
            productId: txi.productId,
            batchId: txi.batchId,
            quantity: txi.quantity,
            unitPrice: txi.unitPrice,
            costPriceSnapshot: txi.costPriceSnapshot,
            discountAmount: txi.discountAmount,
            taxAmount: txi.taxAmount,
            lineTotal: txi.lineTotal,
            workspaceId,
          },
        });
      }

      await tx.payment.create({
        data: {
          transactionId: transaction.id,
          method: data.paymentMethod,
          amount: totalAmount,
          status: 'Success',
          paidAt: new Date(),
          workspaceId,
        },
      });

      for (const stUpdate of stockUpdates) {
        await tx.inventoryStock.update({
          where: {
            productId_locationId_workspaceId: {
              productId: stUpdate.productId,
              locationId: stUpdate.locationId,
              workspaceId,
            },
          },
          data: {
            quantityOnHand: { decrement: stUpdate.qty },
            availableQty: { decrement: stUpdate.qty },
          },
        });
      }

      for (const mv of movementData) {
        await tx.inventoryMovement.create({
          data: {
            productId: mv.productId,
            locationId: mv.locationId,
            movementType: mv.movementType,
            quantity: mv.quantity,
            reason: mv.reason,
            performedBy: mv.performedBy,
            referenceType: 'Transaction',
            referenceId: transaction.id,
            workspaceId,
          },
        });
      }

      if (data.customerId) {
        const addedPoints = Math.floor(totalAmount * 0.01);
        await tx.customer.update({
          where: { id: data.customerId, workspaceId },
          data: { loyaltyPoints: { increment: addedPoints } },
        });
      }

      const totalCost = txItemsData.reduce((sum, item) => sum + Number(item.costPriceSnapshot) * item.quantity, 0);
      
      await this.ledgerService.recordDoubleEntry(tx, workspaceId, {
        journalId: `JNL-SALE-${transaction.id}`,
        referenceType: 'Transaction',
        referenceId: transaction.id,
        description: `POS Sale Receipt: ${transaction.transactionNumber}`,
        debits: [
          { code: '1000', amount: totalAmount },
          { code: '5000', amount: totalCost },
        ],
        credits: [
          { code: '4000', amount: totalAmount },
          { code: '1300', amount: totalCost },
        ],
      });

      await tx.businessEvent.create({
        data: {
          eventType: 'SALE_COMPLETED',
          entityType: 'Transaction',
          entityId: transaction.id,
          title: `Sale Completed: ${transaction.transactionNumber}`,
          description: `Total amount ₹${totalAmount.toFixed(0)} processed via ${data.paymentMethod}.`,
          metadata: JSON.stringify({ itemsCount: data.items.length, total: totalAmount }),
          workspaceId,
        },
      });

      await tx.auditLog.create({
        data: {
          userId: email,
          action: 'TRANSACTION_CREATED',
          entityType: 'Transaction',
          entityId: transaction.id,
          afterData: JSON.stringify(transaction),
          workspaceId,
        },
      });

      return {
        ...transaction,
        subtotal: Number(transaction.subtotal),
        discountAmount: Number(transaction.discountAmount),
        taxAmount: Number(transaction.taxAmount),
        totalAmount: Number(transaction.totalAmount),
        outOfStockAlerts,
      };
    });
  }

  async getTransactions(workspaceId: string, role: string, email: string) {
    try {
    // In a real app we might scope by department. Assuming all depts for manager/admin.
    const transactions = await this.db.transaction.findMany({
      where: { workspaceId },
      include: {
        customer: true,
        payments: true,
        items: { include: { product: true } },
      },
      orderBy: { transactionDate: 'desc' },
    });

    const depts = await this.db.department.findMany({ where: { workspaceId } });

    const mappedList = transactions.map((t) => {
      const deptObj = depts.find((d) => d.id === t.departmentId);

      return {
        id: t.id,
        transactionNumber: t.transactionNumber,
        customerName: t.customer ? `${t.customer.firstName} ${t.customer.lastName}`.trim() : 'Walk-in Customer',
        customerId: t.customerId,
        customerType: t.customer?.customerType || null,
        dept: deptObj ? deptObj.name : 'Others',
        departmentId: t.departmentId,
        date: t.transactionDate.toISOString().split('T')[0],
        time: t.transactionDate.toTimeString().split(' ')[0].slice(0, 5),
        subtotal: Number(t.subtotal),
        discount: Number(t.discountAmount),
        tax: Number(t.taxAmount),
        total: Number(t.totalAmount),
        payment: t.payments[0]?.method || 'UPI',
        status: t.status,
        items: t.items.map((item) => ({
          productId: item.productId,
          productName: item.product.name,
          quantity: item.quantity,
          price: Number(item.unitPrice),
        })),
      };
    });

    const investments = await this.db.investment.findMany({
      where: { workspaceId },
      orderBy: { purchasedAt: 'desc' },
    });

    const investmentItems = investments.map((inv) => ({
      id: inv.id,
      transactionNumber: `INV-${inv.id.slice(0, 6).toUpperCase()}`,
      customerName: 'Corporate Treasury',
      customerId: 'TREASURY-01',
      customerType: 'B2B',
      dept: 'Investments',
      departmentId: 'dept-investments',
      date: inv.purchasedAt.toISOString().split('T')[0],
      time: inv.purchasedAt.toTimeString().split(' ')[0].slice(0, 5),
      subtotal: Number(inv.totalCost),
      discount: 0,
      tax: 0,
      total: Number(inv.totalCost),
      payment: 'Ledger 1000',
      status: inv.status === 'Active' ? 'Completed' : 'Refunded',
      items: [
        {
          productId: inv.id,
          productName: `${inv.assetName} (${inv.symbol})`,
          quantity: Number(inv.quantity),
          price: Number(inv.purchasePrice),
        },
      ],
    }));

    const combinedList = [...mappedList, ...investmentItems];

    combinedList.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateB.getTime() - dateA.getTime();
    });

    return combinedList;
    } catch (err) {
      console.warn("[TransactionsService] getTransactions error:", err);
      return [];
    }
  }
}
