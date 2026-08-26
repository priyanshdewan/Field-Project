import { Schema, model, Document } from 'mongoose';
import { softDeletePlugin, SoftDeleteDocument } from './plugins/soft-delete.plugin';

export interface INotification extends Document, SoftDeleteDocument {
  companyId: Schema.Types.ObjectId;
  userId?: Schema.Types.ObjectId;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  actionUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['INFO', 'WARNING', 'CRITICAL', 'AI_INSIGHT'], default: 'INFO' },
    isRead: { type: Boolean, default: false },
    actionUrl: { type: String },
  },
  { timestamps: true }
);

NotificationSchema.plugin(softDeletePlugin);

export const NotificationModel = model<INotification>('Notification', NotificationSchema);
