// Bridge module: re-exports from REST API client instead of createServerFn
// This enables static site deployment without server-side rendering

export { getInvestmentsServer, investCorporateCashServer, liquidateInvestmentServer, getLiveMarketDataServer } from './api-investments';

// Type definitions preserved from original server module
export interface InvestmentItem {
  id: string;
  assetName: string;
  symbol: string;
  purchasePrice: number;
  quantity: number;
  totalCost: number;
  currentValue: number;
  status: string;
  purchasedAt: string;
  liquidatedAt?: string | null;
  liquidatedPrice?: number | null;
  liquidatedAmount?: number | null;
}

