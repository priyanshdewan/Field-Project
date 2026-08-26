import { Schema, model, Document } from 'mongoose';
import { softDeletePlugin, SoftDeleteDocument } from './plugins/soft-delete.plugin';

export interface ISupplier extends Document, SoftDeleteDocument {
  companyId: Schema.Types.ObjectId;
  userId?: Schema.Types.ObjectId;
  name: string;
  code: string;
  contactPerson?: string;
  email: string;
  phone: string;
  gstin?: string;
  address?: string;
  rating: number;
  totalOrdersCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const SupplierSchema = new Schema<ISupplier>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, uppercase: true, trim: true },
    contactPerson: { type: String },
    email: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    gstin: { type: String },
    address: { type: String },
    rating: { type: Number, default: 5.0 },
    totalOrdersCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

SupplierSchema.plugin(softDeletePlugin);

export const SupplierModel = model<ISupplier>('Supplier', SupplierSchema);
