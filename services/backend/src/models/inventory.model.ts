import { Schema, model, Document } from 'mongoose';
import { softDeletePlugin, SoftDeleteDocument } from './plugins/soft-delete.plugin';

export interface IInventory extends Document, SoftDeleteDocument {
  companyId: Schema.Types.ObjectId;
  branchId: Schema.Types.ObjectId;
  productId: Schema.Types.ObjectId;
  currentStock: number;
  reorderLevel: number;
  batchNumber?: string;
  expiryDate?: Date;
  warehouseLocation?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InventorySchema = new Schema<IInventory>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    currentStock: { type: Number, required: true, default: 0 },
    reorderLevel: { type: Number, default: 10 },
    batchNumber: { type: String },
    expiryDate: { type: Date },
    warehouseLocation: { type: String, default: 'Main Warehouse' },
  },
  { timestamps: true }
);

InventorySchema.plugin(softDeletePlugin);

export const InventoryModel = model<IInventory>('Inventory', InventorySchema);
