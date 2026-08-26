import { Schema, model, Document } from 'mongoose';
import { softDeletePlugin, SoftDeleteDocument } from './plugins/soft-delete.plugin';

export interface ICompany extends Document, SoftDeleteDocument {
  name: string;
  code: string;
  taxNumber?: string;
  email?: string;
  phone?: string;
  currency: string;
  setupCompleted: boolean;
  subscriptionPlan: string;
  createdAt: Date;
  updatedAt: Date;
}

const CompanySchema = new Schema<ICompany>(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    taxNumber: { type: String },
    email: { type: String },
    phone: { type: String },
    currency: { type: String, default: 'INR' },
    setupCompleted: { type: Boolean, default: false },
    subscriptionPlan: { type: String, default: 'ENTERPRISE_PRO' },
  },
  { timestamps: true }
);

CompanySchema.plugin(softDeletePlugin);

export const CompanyModel = model<ICompany>('Company', CompanySchema);
