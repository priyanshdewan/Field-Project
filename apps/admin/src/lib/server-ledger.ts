// Bridge module: re-exports from REST API client instead of createServerFn
// This enables static site deployment without server-side rendering

export { getLedgerBalancesServer, recordIncomingRevenueServer, getIncomingPaymentsServer, recordTaxPaymentServer, getTaxPaymentsServer } from './api-ledger';

// Stub functions for server-only helpers (not needed on static client)
export const DEFAULT_ACCOUNTS = async (data?: any) => { return {}; };
export const seedLedgerAccounts = async (data?: any) => { return { success: true }; };
export const recordDoubleEntry = async (data?: any) => { return { success: true }; };
