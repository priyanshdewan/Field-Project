import { Schema, model, Document } from 'mongoose';
import { softDeletePlugin, SoftDeleteDocument } from './plugins/soft-delete.plugin';

export interface IPayment extends Document, SoftDeleteDocument {
  companyId: Schema.Types.ObjectId;
  saleId?: Schema.Types.ObjectId;
  purchaseOrderId?: Schema.Types.ObjectId;
  transactionRef: string;
  amount: number;
  paymentMethod: string;
  gateway: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    saleId: { type: Schema.Types.ObjectId, ref: 'Sale' },
    purchaseOrderId: { type: Schema.Types.ObjectId, ref: 'PurchaseOrder' },
    transactionRef: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
    paymentMethod: { type: String, required: true },
    gateway: { type: String, default: 'RAZORPAY' },
    status: { type: String, enum: ['SUCCESS', 'PENDING', 'FAILED', 'REFUNDED'], default: 'SUCCESS' },
  },
  { timestamps: true }
);

PaymentSchema.plugin(softDeletePlugin);

export const PaymentModel = model<IPayment>('Payment', PaymentSchema);
