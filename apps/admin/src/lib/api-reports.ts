import { fetchApi } from './api-client';

const handleResponse = (result: any, fallback: any = []) => {
  if (result && result.success) return result.data ?? result;
  return fallback;
};

export const getPaymentReportsServer = async (data?: any) => {
  return handleResponse(await fetchApi('/api/reports/payments', { method: 'GET' }));
};

export const sendAllReportsWhatsAppServer = async (data?: any) => {
  const payload = data?.data ? data.data : data;
  return handleResponse(await fetchApi('/api/reports/whatsapp', { method: 'POST', body: payload ? JSON.stringify(payload) : undefined }));
};
