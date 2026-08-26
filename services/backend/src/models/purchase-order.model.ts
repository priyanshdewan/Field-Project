import { Schema, model, Document } from 'mongoose';
import { softDeletePlugin, SoftDeleteDocument } from './plugins/soft-delete.plugin';

export interface IPurchaseOrderItem {
  productId: Schema.Types.ObjectId;
  productName: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

export interface IPurchaseOrder extends Document, SoftDeleteDocument {
  companyId: Schema.Types.ObjectId;
  supplierId: Schema.Types.ObjectId;
  poNumber: string;
  items: IPurchaseOrderItem[];
  totalAmount: number;
  status: string;
  expectedDeliveryDate?: Date;
  actualDeliveryDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PurchaseOrderSchema = new Schema<IPurchaseOrder>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    supplierId: { type: Schema.Types.ObjectId, ref: 'Supplier', required: true },
    poNumber: { type: String, required: true, unique: true, uppercase: true, trim: true },
    items: [
      {
        productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        productName: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        unitCost: { type: Number, required: true },
        totalCost: { type: Number, required: true },
      },
    ],
    totalAmount: { type: Number, required: true, min: 0 },
    status: { 
      type: String, 
      enum: ['DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'],
      default: 'DRAFT' 
    },
    expectedDeliveryDate: { type: Date },
    actualDeliveryDate: { type: Date },
    notes: { type: String },
  },
  { timestamps: true }
);

PurchaseOrderSchema.plugin(softDeletePlugin);

export const PurchaseOrderModel = model<IPurchaseOrder>('PurchaseOrder', PurchaseOrderSchema);
