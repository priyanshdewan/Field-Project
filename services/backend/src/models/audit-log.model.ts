import { Schema, model, Document } from 'mongoose';
import { softDeletePlugin, SoftDeleteDocument } from './plugins/soft-delete.plugin';

export interface IAuditLog extends Document, SoftDeleteDocument {
  companyId?: Schema.Types.ObjectId;
  userId?: Schema.Types.ObjectId;
  userEmail?: string;
  action: string;
  module: string;
  ipAddress?: string;
  details?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company' },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    userEmail: { type: String },
    action: { type: String, required: true },
    module: { type: String, required: true },
    ipAddress: { type: String },
    details: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

AuditLogSchema.plugin(softDeletePlugin);

export const AuditLogModel = model<IAuditLog>('AuditLog', AuditLogSchema);
