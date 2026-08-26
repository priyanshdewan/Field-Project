// Bridge module: re-exports from REST API client instead of createServerFn
// This enables static site deployment without server-side rendering

export { getProductsServer, addProductServer, editProductServer, archiveProductServer, getProduct360Server, getProductOptionsServer, autoCategorizeProductServer } from './api-products';

// Type definitions preserved from original server module
export interface ProductListItem {
  id: string;
  sku: string;
  barcode: string;
  name: string;
  description: string | null;
  brand: string;
  category: string;
  categoryId: string;
  dept: string;
  departmentId: string;
  price: number;
  cost: number;
  margin: number;
  stock: number;
  reorder: number;
  status: string;
  unit: string;
  expiry: string | null;
  supplier: string;
  sold: number;
  revenue: number;
}

export interface Product360Details {
  id: string;
  sku: string;
  barcode: string;
  name: string;
  brand: string;
  category: string;
  dept: string;
  price: number;
  cost: number;
  margin: number;
  status: string;
  unit: string;
  reorder: number;
  currentStock: number;
  stocksByLocation: Array<{
    locationId: string;
    locationName: string;
    quantity: number;
  }>;
  unitsSold30d: number;
  revenue30d: number;
  profit30d: number;
  batches: Array<{
    id: string;
    batchNumber: string;
    mfgDate: string | null;
    expiryDate: string | null;
    receivedQty: number;
    remainingQty: number;
    status: string;
  }>;
  movements: Array<{
    id: string;
    type: string;
    quantity: number;
    location: string;
    occurredAt: string;
    reason: string | null;
  }>;
  supplier: {
    id: string;
    name: string;
    contact: string;
    email: string;
    phone: string;
  } | null;
  expiryRisk: string; // "Low" | "Medium" | "High" | "Expired"
  reorderRecommendation: string;
}

