import { Schema, model, Document } from 'mongoose';
import { softDeletePlugin, SoftDeleteDocument } from './plugins/soft-delete.plugin';

export interface IRole extends Document, SoftDeleteDocument {
  companyId?: Schema.Types.ObjectId;
  name: string;
  code: string;
  permissions: string[];
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RoleSchema = new Schema<IRole>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company' },
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, uppercase: true, trim: true },
    permissions: [{ type: String }],
    description: { type: String },
  },
  { timestamps: true }
);

RoleSchema.plugin(softDeletePlugin);

export const RoleModel = model<IRole>('Role', RoleSchema);
