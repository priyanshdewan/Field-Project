import { fetchApi } from './api-client';

const handleResponse = (result: any, fallback: any = []) => {
  if (result && result.success) return result.data ?? result;
  return fallback;
};

export const getCustomersServer = async (data?: any) => {
  return handleResponse(await fetchApi('/api/customers', { method: 'GET' }));
};

export const addCustomerServer = async (data?: any) => {
  const payload = data?.data ? data.data : data;
  return handleResponse(await fetchApi('/api/customers', { method: 'POST', body: payload ? JSON.stringify(payload) : undefined }));
};

export const editCustomerServer = async (data?: any) => {
  const payload = data?.data ? data.data : data;
  const id = payload?.id || payload?.customerId;
  return handleResponse(await fetchApi(`/api/customers/${id || ''}`, { method: 'PUT', body: payload ? JSON.stringify(payload) : undefined }));
};

export const archiveCustomerServer = async (data?: any) => {
  const payload = data?.data ? data.data : data;
  const id = typeof payload === 'string' ? payload : (payload?.id || payload?.customerId);
  return handleResponse(await fetchApi(`/api/customers/${id || ''}`, { method: 'DELETE' }));
};

export const getCustomer360Server = async (data?: any) => {
  const payload = data?.data ? data.data : data;
  const id = typeof payload === 'string' ? payload : (payload?.id || payload?.customerId);
  return handleResponse(await fetchApi(`/api/customers/${id || ''}`, { method: 'GET' }));
};
