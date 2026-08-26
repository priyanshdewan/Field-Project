import { Schema, model, Document } from 'mongoose';
import { softDeletePlugin, SoftDeleteDocument } from './plugins/soft-delete.plugin';

export interface IInvoice extends Document, SoftDeleteDocument {
  companyId: Schema.Types.ObjectId;
  saleId?: Schema.Types.ObjectId;
  invoiceNumber: string;
  customerName: string;
  customerPhone?: string;
  gstin?: string;
  amount: number;
  taxAmount: number;
  pdfUrl?: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceSchema = new Schema<IInvoice>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    saleId: { type: Schema.Types.ObjectId, ref: 'Sale' },
    invoiceNumber: { type: String, required: true, unique: true, uppercase: true },
    customerName: { type: String, required: true },
    customerPhone: { type: String },
    gstin: { type: String },
    amount: { type: Number, required: true },
    taxAmount: { type: Number, default: 0 },
    pdfUrl: { type: String },
    status: { type: String, enum: ['ISSUED', 'PAID', 'CANCELLED'], default: 'ISSUED' },
  },
  { timestamps: true }
);

InvoiceSchema.plugin(softDeletePlugin);

export const InvoiceModel = model<IInvoice>('Invoice', InvoiceSchema);
