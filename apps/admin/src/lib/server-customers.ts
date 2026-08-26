// Bridge module: re-exports from REST API client instead of createServerFn
// This enables static site deployment without server-side rendering

export { getCustomersServer, addCustomerServer, editCustomerServer, archiveCustomerServer, getCustomer360Server } from './api-customers';

// Type definitions preserved from original server module
export interface CustomerListItem {
  id: string;
  customerCode: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  joined: string;
  customerType: string;
  visits: number;
  spend: number;
  aov: number;
  favDept: string;
  segment: string;
  churn: number;
  status: string;
  lastVisit: string;
}

export interface Customer360Profile {
  id: string;
  customerCode: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phone: string;
  joined: string;
  loyaltyTier: string;
  customerType: string;
  loyaltyPoints: number;
  status: string;
  notes: string | null;
  churnRisk: string;
  churn: number;
  visits: number;
  spend: number;
  aov: number;
  lastVisit: string;
  preferredDept: string;
  transactions: Array<{
    id: string;
    transactionNumber: string;
    date: string;
    totalAmount: number;
    paymentMethod: string;
    status: string;
    itemCount: number;
  }>;
  recentProducts: Array<{
    id: string;
    name: string;
    brand: string;
    qty: number;
    lastPurchased: string;
  }>;
  spendingTrend: Array<{
    month: string;
    spend: number;
  }>;
  paymentPreferences: Array<{
    method: string;
    count: number;
    amount: number;
  }>;
  aiInsight: string;
}

// Stub functions for server-only helpers (not needed on static client)
export const getDepartmentScope = async (data?: any) => { return []; };
