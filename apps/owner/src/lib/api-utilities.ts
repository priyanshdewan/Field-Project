import { fetchApi } from './api-client';

const handleResponse = (result: any, fallback: any = []) => {
  if (result && result.success) return result.data ?? result;
  return fallback;
};

export const getUtilitiesServer = async (data?: any) => {
  return handleResponse(await fetchApi('/api/utilities', { method: 'GET' }));
};

export const addUtilityReadingServer = async (data?: any) => {
  const payload = data?.data ? data.data : data;
  return handleResponse(await fetchApi('/api/utilities', { method: 'POST', body: payload ? JSON.stringify(payload) : undefined }));
};

export const editUtilityReadingServer = async (data?: any) => {
  const payload = data?.data ? data.data : data;
  const id = payload?.id;
  return handleResponse(await fetchApi(`/api/utilities/${id || ''}`, { method: 'PUT', body: payload ? JSON.stringify(payload) : undefined }));
};

export const deleteUtilityReadingServer = async (data?: any) => {
  const payload = data?.data ? data.data : data;
  const id = typeof payload === 'string' ? payload : payload?.id;
  return handleResponse(await fetchApi(`/api/utilities/${id || ''}`, { method: 'DELETE' }));
};
