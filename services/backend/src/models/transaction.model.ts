import { Schema, model, Document } from 'mongoose';
import { softDeletePlugin, SoftDeleteDocument } from './plugins/soft-delete.plugin';

export interface ITransaction extends Document, SoftDeleteDocument {
  companyId: Schema.Types.ObjectId;
  accountCode: string;
  type: string;
  amount: number;
  referenceId?: string;
  description: string;
  transactionDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    accountCode: { type: String, required: true },
    type: { type: String, enum: ['DEBIT', 'CREDIT'], required: true },
    amount: { type: Number, required: true },
    referenceId: { type: String },
    description: { type: String, required: true },
    transactionDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

TransactionSchema.plugin(softDeletePlugin);

export const TransactionModel = model<ITransaction>('Transaction', TransactionSchema);
