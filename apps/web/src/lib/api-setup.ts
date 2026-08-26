import { fetchApi } from './api-client';

const handleResponse = (result: any, fallback: any = []) => {
  if (result && result.success) return result.data ?? result;
  return fallback;
};

export const completeWorkspaceSetupServer = async (data?: any) => {
  const payload = data?.data ? data.data : data;
  return handleResponse(await fetchApi('/api/setup/complete', { method: 'POST', body: payload ? JSON.stringify(payload) : undefined }));
};
