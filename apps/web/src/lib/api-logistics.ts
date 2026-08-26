import { fetchApi } from './api-client';

const handleResponse = (result: any, fallback: any = []) => {
  if (result && result.success) return result.data ?? result;
  return fallback;
};

export const getLogisticsDispatchesServer = async (data?: any) => {
  return handleResponse(await fetchApi('/api/logistics', { method: 'GET' }));
};

export const createLogisticsDispatchServer = async (data?: any) => {
  const payload = data?.data ? data.data : data;
  return handleResponse(await fetchApi('/api/logistics', { method: 'POST', body: payload ? JSON.stringify(payload) : undefined }));
};

export const updateLogisticsStatusServer = async (data?: any) => {
  const payload = data?.data ? data.data : data;
  const id = payload?.id || payload?.dispatchId;
  return handleResponse(await fetchApi(`/api/logistics/${id || ''}/status`, { method: 'PUT', body: payload ? JSON.stringify(payload) : undefined }));
};
