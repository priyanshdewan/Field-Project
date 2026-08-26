import { Schema, model, Document } from 'mongoose';
import { softDeletePlugin, SoftDeleteDocument } from './plugins/soft-delete.plugin';

export interface IEmployee extends Document, SoftDeleteDocument {
  companyId: Schema.Types.ObjectId;
  branchId?: Schema.Types.ObjectId;
  userId?: Schema.Types.ObjectId;
  employeeCode: string;
  name: string;
  email: string;
  phone?: string;
  department: string;
  designation: string;
  salary: number;
  joiningDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const EmployeeSchema = new Schema<IEmployee>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch' },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    employeeCode: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String },
    department: { type: String, required: true },
    designation: { type: String, required: true },
    salary: { type: Number, default: 0 },
    joiningDate: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

EmployeeSchema.plugin(softDeletePlugin);

export const EmployeeModel = model<IEmployee>('Employee', EmployeeSchema);
