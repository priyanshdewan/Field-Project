// Bridge module: re-exports from REST API client instead of createServerFn
// This enables static site deployment without server-side rendering

export { getInventoryStockServer, getInventoryMovementsServer, mutateInventoryServer, getExpiryIntelligenceServer } from './api-inventory';

// Type definitions preserved from original server module
export interface StockListItem {
  productId: string;
  sku: string;
  name: string;
  brand: string;
  category: string;
  dept: string;
  warehouseQty: number;
  retailQty: number;
  totalQty: number;
  reorderLevel: number;
  status: "Safe" | "Low Stock" | "Stockout";
  stockoutRiskDays: number | null; // null if safe or no sales
}

export interface MovementHistoryItem {
  id: string;
  productName: string;
  sku: string;
  locationName: string;
  movementType: string;
  quantity: number;
  reason: string | null;
  occurredAt: string;
  performedBy: string | null;
}

