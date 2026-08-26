import { fetchApi } from './api-client';

const handleResponse = (result: any, fallback: any = []) => {
  if (result && result.success) return result.data ?? result;
  return fallback;
};

export const getVapiConfigServer = async () => handleResponse(await fetchApi('/api/comms/vapi/config', { method: 'GET' }));
export const updateVapiConfigServer = async (data?: any) => handleResponse(await fetchApi('/api/comms/vapi/config', { method: 'POST', body: JSON.stringify(data?.data || data) }));
export const initiateVapiCallServer = async (data?: any) => handleResponse(await fetchApi('/api/comms/vapi/call', { method: 'POST', body: JSON.stringify(data?.data || data) }));
