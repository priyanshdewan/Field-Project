import { fetchApi } from './api-client';

const handleResponse = (result: any, fallback: any = []) => {
  if (result && result.success) return result.data ?? result;
  return fallback;
};

export const getSettingsServer = async (data?: any) => {
  return handleResponse(await fetchApi('/api/settings', { method: 'GET' }));
};

export const updateSettingsServer = async (data?: any) => {
  const payload = data?.data ? data.data : data;
  return handleResponse(await fetchApi('/api/settings', { method: 'PUT', body: payload ? JSON.stringify(payload) : undefined }));
};

export const getMallSettingsServer = getSettingsServer;
export const updateMallSettingsServer = updateSettingsServer;
