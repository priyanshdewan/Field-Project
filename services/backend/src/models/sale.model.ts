import { Schema, model, Document } from 'mongoose';
import { softDeletePlugin, SoftDeleteDocument } from './plugins/soft-delete.plugin';

export interface ISaleItem {
  productId: Schema.Types.ObjectId;
  productName: string;
  quantity: number;
  unitPrice: number;
  taxAmount: number;
  totalPrice: number;
}

export interface ISale extends Document, SoftDeleteDocument {
  companyId: Schema.Types.ObjectId;
  branchId: Schema.Types.ObjectId;
  customerId?: Schema.Types.ObjectId;
  cashierId: Schema.Types.ObjectId;
  saleNumber: string;
  items: ISaleItem[];
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  grandTotal: number;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: Date;
  updatedAt: Date;
}

const SaleSchema = new Schema<ISale>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer' },
    cashierId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    saleNumber: { type: String, required: true, unique: true, uppercase: true, trim: true },
    items: [
      {
        productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        productName: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        unitPrice: { type: Number, required: true },
        taxAmount: { type: Number, default: 0 },
        totalPrice: { type: Number, required: true },
      },
    ],
    subtotal: { type: Number, required: true },
    taxTotal: { type: Number, default: 0 },
    discountTotal: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['CASH', 'CARD', 'UPI', 'WALLET', 'CREDIT'], default: 'UPI' },
    paymentStatus: { type: String, enum: ['PAID', 'PENDING', 'REFUNDED'], default: 'PAID' },
  },
  { timestamps: true }
);

SaleSchema.plugin(softDeletePlugin);

export const SaleModel = model<ISale>('Sale', SaleSchema);
