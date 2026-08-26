import { fetchApi } from './api-client';

const handleResponse = (result: any, fallback: any = []) => {
  if (result && result.success) return result.data ?? result;
  return fallback;
};

export const getLedgerBalancesServer = async (data?: any) => {
  return handleResponse(await fetchApi('/api/ledger/balances', { method: 'GET' }));
};

export const recordIncomingRevenueServer = async (data?: any) => {
  const payload = data?.data ? data.data : data;
  return handleResponse(await fetchApi('/api/ledger/revenue', { method: 'POST', body: payload ? JSON.stringify(payload) : undefined }));
};

export const getIncomingPaymentsServer = async (data?: any) => {
  return handleResponse(await fetchApi('/api/ledger/incoming-payments', { method: 'GET' }));
};

export const recordTaxPaymentServer = async (data?: any) => {
  const payload = data?.data ? data.data : data;
  return handleResponse(await fetchApi('/api/ledger/tax-payment', { method: 'POST', body: payload ? JSON.stringify(payload) : undefined }));
};

export const getTaxPaymentsServer = async (data?: any) => {
  return handleResponse(await fetchApi('/api/ledger/tax-payments', { method: 'GET' }));
};
