// Bridge module: re-exports from REST API client instead of createServerFn
// This enables static site deployment without server-side rendering

export { getAccountsDataServer, createFixedDepositServer, createCorporateLoanServer, repayLoanServer, payPurchaseOrderServer } from './api-accounts';

// Type definitions preserved from original server module
export interface FixedDepositItem {
  id: string;
  bankName: string;
  principal: number;
  interestRate: number;
  duration: number;
  status: string;
  startDate: string;
  matureDate: string;
}

export interface CorporateLoanItem {
  id: string;
  bankName: string;
  principal: number;
  interestRate: number;
  balance: number;
  duration: number;
  status: string;
  takenDate: string;
}

