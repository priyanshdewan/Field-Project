import { fetchApi } from './api-client';

const handleResponse = (result: any, fallback: any = []) => {
  if (result && result.success) return result.data ?? result;
  return fallback;
};

export const getMessageLogsServer = async () => handleResponse(await fetchApi('/api/comms/logs', { method: 'GET' }));
