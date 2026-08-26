import { Schema, model, Document } from 'mongoose';
import { softDeletePlugin, SoftDeleteDocument } from './plugins/soft-delete.plugin';

export interface IProduct extends Document, SoftDeleteDocument {
  companyId: Schema.Types.ObjectId;
  categoryId?: Schema.Types.ObjectId;
  supplierId?: Schema.Types.ObjectId;
  sku: string;
  barcode?: string;
  name: string;
  unitPrice: number;
  costPrice: number;
  taxRatePercent: number;
  isPerishable: boolean;
  shelfLifeDays?: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category' },
    supplierId: { type: Schema.Types.ObjectId, ref: 'Supplier' },
    sku: { type: String, required: true, trim: true },
    barcode: { type: String, trim: true },
    name: { type: String, required: true, trim: true },
    unitPrice: { type: Number, required: true, min: 0 },
    costPrice: { type: Number, required: true, min: 0 },
    taxRatePercent: { type: Number, default: 18 },
    isPerishable: { type: Boolean, default: false },
    shelfLifeDays: { type: Number },
  },
  { timestamps: true }
);

ProductSchema.plugin(softDeletePlugin);

export const ProductModel = model<IProduct>('Product', ProductSchema);
