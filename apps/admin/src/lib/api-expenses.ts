import { fetchApi } from './api-client';

const handleResponse = (result: any, fallback: any = []) => {
  if (result && result.success) return result.data ?? result;
  return fallback;
};

export const getExpensesServer = async (data?: any) => {
  return handleResponse(await fetchApi('/api/expenses', { method: 'GET' }));
};

export const addExpenseServer = async (data?: any) => {
  const payload = data?.data ? data.data : data;
  return handleResponse(await fetchApi('/api/expenses', { method: 'POST', body: payload ? JSON.stringify(payload) : undefined }));
};

export const editExpenseServer = async (data?: any) => {
  const payload = data?.data ? data.data : data;
  const id = payload?.id || payload?.expenseId;
  return handleResponse(await fetchApi(`/api/expenses/${id || ''}`, { method: 'PUT', body: payload ? JSON.stringify(payload) : undefined }));
};

export const archiveExpenseServer = async (data?: any) => {
  const payload = data?.data ? data.data : data;
  const id = typeof payload === 'string' ? payload : (payload?.id || payload?.expenseId);
  return handleResponse(await fetchApi(`/api/expenses/${id || ''}`, { method: 'DELETE' }));
};
