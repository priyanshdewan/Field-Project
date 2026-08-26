import { Schema, model, Document } from 'mongoose';
import { softDeletePlugin, SoftDeleteDocument } from './plugins/soft-delete.plugin';

export interface IExpense extends Document, SoftDeleteDocument {
  companyId: Schema.Types.ObjectId;
  branchId?: Schema.Types.ObjectId;
  category: string;
  amount: number;
  description: string;
  expenseDate: Date;
  paidTo?: string;
  approvedBy?: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema = new Schema<IExpense>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch' },
    category: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    description: { type: String, required: true },
    expenseDate: { type: Date, default: Date.now },
    paidTo: { type: String },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

ExpenseSchema.plugin(softDeletePlugin);

export const ExpenseModel = model<IExpense>('Expense', ExpenseSchema);
