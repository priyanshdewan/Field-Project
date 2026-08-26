import { fetchApi } from './api-client';

const handleResponse = (result: any, fallback: any = []) => {
  if (result && result.success) return result.data ?? result;
  return fallback;
};

export const getStaffServer = async (data?: any) => {
  return handleResponse(await fetchApi('/api/staff', { method: 'GET' }));
};

export const addStaffServer = async (data?: any) => {
  const payload = data?.data ? data.data : data;
  return handleResponse(await fetchApi('/api/staff', { method: 'POST', body: payload ? JSON.stringify(payload) : undefined }));
};

export const editStaffServer = async (data?: any) => {
  const payload = data?.data ? data.data : data;
  const id = payload?.id || payload?.staffId;
  return handleResponse(await fetchApi(`/api/staff/${id || ''}`, { method: 'PUT', body: payload ? JSON.stringify(payload) : undefined }));
};

export const archiveStaffServer = async (data?: any) => {
  const payload = data?.data ? data.data : data;
  const id = typeof payload === 'string' ? payload : (payload?.id || payload?.staffId);
  return handleResponse(await fetchApi(`/api/staff/${id || ''}`, { method: 'DELETE' }));
};

export const updateStaffStatusServer = async (data?: any) => {
  const payload = data?.data ? data.data : data;
  const id = payload?.id || payload?.staffId;
  return handleResponse(await fetchApi(`/api/staff/${id || ''}`, { method: 'PUT', body: payload ? JSON.stringify(payload) : undefined }));
};
