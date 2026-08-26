import { fetchApi } from './api-client';

const handleResponse = (result: any, fallback: any = []) => {
  if (result && result.success) return result.data ?? result;
  return fallback;
};

export const registerCompanyServer = async (data?: any) => handleResponse(await fetchApi('/api/registration/register', { method: 'POST', body: JSON.stringify(data?.data || data) }));
