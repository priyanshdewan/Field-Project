import { z } from 'zod';

export const CreateProductSchema = z.object({
  sku: z.string().min(1),
  name: z.string().min(1),
  unitPrice: z.number().min(0),
  costPrice: z.number().min(0),
  taxRatePercent: z.number().min(0).optional(),
  categoryId: z.string().optional(),
  supplierId: z.string().optional(),
  isPerishable: z.boolean().optional(),
});

export const UpdateProductSchema = CreateProductSchema.partial();
