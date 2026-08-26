import { Schema, model, Document } from 'mongoose';
import { softDeletePlugin, SoftDeleteDocument } from './plugins/soft-delete.plugin';

export interface IUser extends Document, SoftDeleteDocument {
  email: string;
  passwordHash: string;
  name: string;
  role: string;
  companyId?: Schema.Types.ObjectId;
  branchId?: Schema.Types.ObjectId;
  departmentId?: string;
  isSystemAdmin: boolean;
  isActive: boolean;
  refreshToken?: string;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    role: { 
      type: String, 
      required: true, 
      enum: ['ADMIN', 'OWNER', 'MANAGER', 'CASHIER', 'SUPPLIER', 'CUSTOMER', 'EMPLOYEE'],
      default: 'OWNER' 
    },
    companyId: { type: Schema.Types.ObjectId, ref: 'Company' },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch' },
    departmentId: { type: String },
    isSystemAdmin: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    refreshToken: { type: String },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

UserSchema.plugin(softDeletePlugin);

export const UserModel = model<IUser>('User', UserSchema);
