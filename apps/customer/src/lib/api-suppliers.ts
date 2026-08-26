import { fetchApi } from './api-client';

const handleResponse = (result: any, fallback: any = []) => {
  if (result && result.success) return result.data ?? result;
  return fallback;
};

export const getSuppliersServer = async (data?: any) => {
  return handleResponse(await fetchApi('/api/suppliers', { method: 'GET' }));
};

export const addSupplierServer = async (data?: any) => {
  const payload = data?.data ? data.data : data;
  return handleResponse(await fetchApi('/api/suppliers', { method: 'POST', body: payload ? JSON.stringify(payload) : undefined }));
};

export const editSupplierServer = async (data?: any) => {
  const payload = data?.data ? data.data : data;
  const id = payload?.id || payload?.supplierId;
  return handleResponse(await fetchApi(`/api/suppliers/${id || ''}`, { method: 'PUT', body: payload ? JSON.stringify(payload) : undefined }));
};

export const archiveSupplierServer = async (data?: any) => {
  const payload = data?.data ? data.data : data;
  const id = typeof payload === 'string' ? payload : (payload?.id || payload?.supplierId);
  return handleResponse(await fetchApi(`/api/suppliers/${id || ''}`, { method: 'DELETE' }));
};

export const getPurchaseOrdersServer = async (data?: any) => {
  return handleResponse(await fetchApi('/api/suppliers/purchase-orders', { method: 'GET' }));
};

export const createPurchaseOrderServer = async (data?: any) => {
  const payload = data?.data ? data.data : data;
  return handleResponse(await fetchApi('/api/suppliers/purchase-orders', { method: 'POST', body: payload ? JSON.stringify(payload) : undefined }));
};

export const updatePurchaseOrderStatusServer = async (data?: any) => {
  const payload = data?.data ? data.data : data;
  const id = payload?.id || payload?.poId;
  return handleResponse(await fetchApi(`/api/suppliers/purchase-orders/${id || ''}/status`, { method: 'PUT', body: payload ? JSON.stringify(payload) : undefined }));
};

export const getSuppliers = getSuppliersServer;
export const getPurchaseOrders = getPurchaseOrdersServer;
