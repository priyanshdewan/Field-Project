import { Schema, model, Document } from 'mongoose';
import { softDeletePlugin, SoftDeleteDocument } from './plugins/soft-delete.plugin';

export interface IPermission extends Document, SoftDeleteDocument {
  code: string;
  name: string;
  module: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PermissionSchema = new Schema<IPermission>(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    name: { type: String, required: true },
    module: { type: String, required: true },
    description: { type: String },
  },
  { timestamps: true }
);

PermissionSchema.plugin(softDeletePlugin);

export const PermissionModel = model<IPermission>('Permission', PermissionSchema);
