import { Schema, model, Document } from 'mongoose';
import { softDeletePlugin, SoftDeleteDocument } from './plugins/soft-delete.plugin';

export interface IBranch extends Document, SoftDeleteDocument {
  companyId: Schema.Types.ObjectId;
  name: string;
  code: string;
  address?: string;
  city?: string;
  state?: string;
  phone?: string;
  isMainBranch: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BranchSchema = new Schema<IBranch>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, uppercase: true, trim: true },
    address: { type: String },
    city: { type: String },
    state: { type: String },
    phone: { type: String },
    isMainBranch: { type: Boolean, default: false },
  },
  { timestamps: true }
);

BranchSchema.plugin(softDeletePlugin);

export const BranchModel = model<IBranch>('Branch', BranchSchema);
