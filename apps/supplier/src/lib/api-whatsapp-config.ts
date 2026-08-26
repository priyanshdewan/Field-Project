import { fetchApi } from './api-client';

const handleResponse = (result: any, fallback: any = []) => {
  if (result && result.success) return result.data ?? result;
  return fallback;
};

export const getWhatsAppConfigServer = async () => handleResponse(await fetchApi('/api/comms/whatsapp/config', { method: 'GET' }));
export const updateWhatsAppConfigServer = async (data?: any) => handleResponse(await fetchApi('/api/comms/whatsapp/config', { method: 'POST', body: JSON.stringify(data?.data || data) }));
export const sendWhatsAppMessageServer = async (data?: any) => handleResponse(await fetchApi('/api/comms/whatsapp/send', { method: 'POST', body: JSON.stringify(data?.data || data) }));
