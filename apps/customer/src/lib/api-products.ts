import { fetchApi } from './api-client';

const handleResponse = (result: any, fallback: any = []) => {
  if (result && result.success) return result.data ?? result;
  return fallback;
};

export const getProductsServer = async (data?: any) => {
  return handleResponse(await fetchApi('/api/products', { method: 'GET' }));
};

export const addProductServer = async (data?: any) => {
  const payload = data?.data ? data.data : data;
  return handleResponse(await fetchApi('/api/products', { method: 'POST', body: payload ? JSON.stringify(payload) : undefined }));
};

export const editProductServer = async (data?: any) => {
  const payload = data?.data ? data.data : data;
  const id = payload?.id || payload?.productId;
  return handleResponse(await fetchApi(`/api/products/${id || ''}`, { method: 'PUT', body: payload ? JSON.stringify(payload) : undefined }));
};

export const archiveProductServer = async (data?: any) => {
  const payload = data?.data ? data.data : data;
  const id = typeof payload === 'string' ? payload : (payload?.id || payload?.productId);
  return handleResponse(await fetchApi(`/api/products/${id || ''}`, { method: 'DELETE' }));
};

export const getProduct360Server = async (data?: any) => {
  const payload = data?.data ? data.data : data;
  const id = typeof payload === 'string' ? payload : (payload?.id || payload?.productId);
  return handleResponse(await fetchApi(`/api/products/${id || ''}`, { method: 'GET' }));
};

export const getProductOptionsServer = async (data?: any) => {
  return handleResponse(await fetchApi('/api/products', { method: 'GET' }));
};

export const autoCategorizeProductServer = async (data?: any) => {
  const payload = data?.data ? data.data : data;
  return handleResponse(await fetchApi('/api/products', { method: 'POST', body: payload ? JSON.stringify(payload) : undefined }));
};
