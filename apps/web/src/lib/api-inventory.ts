import { fetchApi } from './api-client';

const handleResponse = (result: any, fallback: any = []) => {
  if (result && result.success) return result.data ?? result;
  return fallback;
};

export const getInventoryStockServer = async (data?: any) => {
  return handleResponse(await fetchApi('/api/inventory/stock', { method: 'GET' }));
};

export const getInventoryMovementsServer = async (data?: any) => {
  return handleResponse(await fetchApi('/api/inventory/movements', { method: 'GET' }));
};

export const mutateInventoryServer = async (data?: any) => {
  const payload = data?.data ? data.data : data;
  return handleResponse(await fetchApi('/api/inventory/mutate', { method: 'POST', body: payload ? JSON.stringify(payload) : undefined }));
};

export const getExpiryIntelligenceServer = async (data?: any) => {
  return handleResponse(await fetchApi('/api/inventory/expiry', { method: 'GET' }));
};
