// Bridge module: re-exports from REST API client instead of createServerFn
// This enables static site deployment without server-side rendering

export { createTransactionServer, getTransactionsServer } from './api-transactions';

// Type definitions preserved from original server module
export interface TransactionListItem {
  id: string;
  transactionNumber: string;
  customerName: string | null;
  customerId: string | null;
  customerType: string | null;
  dept: string;
  departmentId: string;
  date: string;
  time: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  payment: string;
  status: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
  }>;
}

