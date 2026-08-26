import { fetchApi } from './api-client';

const handleResponse = (result: any, fallback: any = []) => {
  if (result && result.success) return result.data ?? result;
  return fallback;
};

export const getWhatsAppConfigServer = async () => handleResponse(await fetchApi('/api/comms/whatsapp/config', { method: 'GET' }));
export const updateWhatsAppConfigServer = async (data?: any) => handleResponse(await fetchApi('/api/comms/whatsapp/config', { method: 'POST', body: JSON.stringify(data?.data || data) }));
// For send, return full response including errors — don't swallow error details
export const sendWhatsAppMessageServer = async (data?: any) => {
  const result = await fetchApi('/api/comms/whatsapp/send', { method: 'POST', body: JSON.stringify(data?.data || data) });
  if (result && result.success) return result.data ?? result;
  // Return error details so the UI can display them
  return { status: result?.data?.status || "FAILED", error: result?.error || result?.message || "Unknown error", ...result?.data };
};
