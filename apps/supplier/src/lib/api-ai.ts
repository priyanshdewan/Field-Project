import { fetchApi } from './api-client';

const handleResponse = (result: any, fallback: any = []) => {
  if (result && result.success) return result.data ?? result;
  return fallback;
};

export const askBizoraServer = async (data?: any) => {
  const payload = data?.data ? data.data : data;
  return handleResponse(await fetchApi('/api/ai/ask', { method: 'POST', body: payload ? JSON.stringify(payload) : undefined }));
};
