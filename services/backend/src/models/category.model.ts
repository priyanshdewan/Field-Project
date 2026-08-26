import { Schema, model, Document } from 'mongoose';
import { softDeletePlugin, SoftDeleteDocument } from './plugins/soft-delete.plugin';

export interface ICategory extends Document, SoftDeleteDocument {
  companyId: Schema.Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, lowercase: true, trim: true },
    description: { type: String },
  },
  { timestamps: true }
);

CategorySchema.plugin(softDeletePlugin);

export const CategoryModel = model<ICategory>('Category', CategorySchema);
