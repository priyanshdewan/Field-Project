import { fetchApi } from './api-client';

const handleResponse = (result: any, fallback: any = []) => {
  if (result && result.success) return result.data ?? result;
  return fallback;
};

export const getAccountsDataServer = async (data?: any) => {
  return handleResponse(await fetchApi('/api/accounts', { method: 'GET' }));
};

export const createFixedDepositServer = async (data?: any) => {
  const payload = data?.data ? data.data : data;
  return handleResponse(await fetchApi('/api/accounts/fixed-deposit', { method: 'POST', body: payload ? JSON.stringify(payload) : undefined }));
};

export const createCorporateLoanServer = async (data?: any) => {
  const payload = data?.data ? data.data : data;
  return handleResponse(await fetchApi('/api/accounts/corporate-loan', { method: 'POST', body: payload ? JSON.stringify(payload) : undefined }));
};

export const repayLoanServer = async (data?: any) => {
  const payload = data?.data ? data.data : data;
  return handleResponse(await fetchApi('/api/accounts/repay-loan', { method: 'POST', body: payload ? JSON.stringify(payload) : undefined }));
};

export const payPurchaseOrderServer = async (data?: any) => {
  const payload = data?.data ? data.data : data;
  return handleResponse(await fetchApi('/api/accounts/pay-purchase-order', { method: 'POST', body: payload ? JSON.stringify(payload) : undefined }));
};
