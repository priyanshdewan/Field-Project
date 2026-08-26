import { fetchApi } from './api-client';

const handleResponse = (result: any, fallback: any = []) => {
  if (result && result.success) return result.data ?? result;
  return fallback;
};

export const getCommandCenterServer = async (data?: any) => {
  return handleResponse(await fetchApi('/api/analytics/command-center', { method: 'GET' }));
};

export const getAnomaliesServer = async (data?: any) => {
  return handleResponse(await fetchApi('/api/analytics/anomalies', { method: 'GET' }));
};

export const getRecommendationsServer = async (data?: any) => {
  return handleResponse(await fetchApi('/api/analytics/recommendations', { method: 'GET' }));
};

export const getForecastingServer = async (data?: any) => {
  return handleResponse(await fetchApi('/api/analytics/forecasting', { method: 'GET' }));
};

export const dispatchEodReportServer = async (data?: any) => {
  const payload = data?.data ? data.data : data;
  return handleResponse(await fetchApi('/api/analytics/eod-report', { method: 'POST', body: payload ? JSON.stringify(payload) : undefined }));
};
