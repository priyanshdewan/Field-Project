import { Schema, model, Document } from 'mongoose';
import { softDeletePlugin, SoftDeleteDocument } from './plugins/soft-delete.plugin';

export interface ICustomer extends Document, SoftDeleteDocument {
  companyId: Schema.Types.ObjectId;
  userId?: Schema.Types.ObjectId;
  name: string;
  phone: string;
  email?: string;
  loyaltyPoints: number;
  walletBalance: number;
  tier: string;
  totalSpent: number;
  lastPurchaseDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CustomerSchema = new Schema<ICustomer>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true },
    loyaltyPoints: { type: Number, default: 0 },
    walletBalance: { type: Number, default: 0 },
    tier: { type: String, enum: ['STANDARD', 'SILVER', 'GOLD', 'PLATINUM', 'VIP'], default: 'STANDARD' },
    totalSpent: { type: Number, default: 0 },
    lastPurchaseDate: { type: Date },
  },
  { timestamps: true }
);

CustomerSchema.plugin(softDeletePlugin);

export const CustomerModel = model<ICustomer>('Customer', CustomerSchema);
