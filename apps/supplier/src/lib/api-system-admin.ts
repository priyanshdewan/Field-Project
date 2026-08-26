import { fetchApi } from './api-client';

const handleResponse = (result: any, fallback: any = []) => {
  if (result && result.success) return result.data ?? result;
  return fallback;
};

export const getSystemAdminDashboardServer = async () => handleResponse(await fetchApi('/api/system-admin/dashboard', { method: 'GET' }));
export const approveRegistrationServer = async (data?: any) => handleResponse(await fetchApi('/api/system-admin/approve', { method: 'POST', body: JSON.stringify(data?.data || data) }));
export const rejectRegistrationServer = async (data?: any) => handleResponse(await fetchApi('/api/system-admin/reject', { method: 'POST', body: JSON.stringify(data?.data || data) }));
export const suspendRegistrationServer = async (data?: any) => handleResponse(await fetchApi('/api/system-admin/suspend', { method: 'POST', body: JSON.stringify(data?.data || data) }));
export const deleteRegistrationServer = async (data?: any) => handleResponse(await fetchApi('/api/system-admin/delete', { method: 'POST', body: JSON.stringify(data?.data || data) }));
export const searchCompaniesServer = async (query?: string) => handleResponse(await fetchApi(`/api/system-admin/companies${query ? `?query=${encodeURIComponent(query)}` : ''}`, { method: 'GET' }));
export const suspendWorkspaceServer = async (data?: any) => handleResponse(await fetchApi('/api/system-admin/suspend-workspace', { method: 'POST', body: JSON.stringify(data?.data || data) }));
export const reactivateWorkspaceServer = async (data?: any) => handleResponse(await fetchApi('/api/system-admin/reactivate-workspace', { method: 'POST', body: JSON.stringify(data?.data || data) }));
export const deleteWorkspaceServer = async (data?: any) => handleResponse(await fetchApi('/api/system-admin/delete-workspace', { method: 'POST', body: JSON.stringify(data?.data || data) }));
export const resetOwnerPasswordServer = async (data?: any) => handleResponse(await fetchApi('/api/system-admin/reset-password', { method: 'POST', body: JSON.stringify(data?.data || data) }));
export const resendWelcomeEmailServer = async (data?: any) => handleResponse(await fetchApi('/api/system-admin/resend-email', { method: 'POST', body: JSON.stringify(data?.data || data) }));
export const getAuditLogsServer = async () => handleResponse(await fetchApi('/api/system-admin/audit-logs', { method: 'GET' }));
export const exportWorkspaceServer = async (data?: any) => handleResponse(await fetchApi('/api/system-admin/export', { method: 'POST', body: JSON.stringify(data?.data || data) }));
export const importWorkspaceServer = async (data?: any) => handleResponse(await fetchApi('/api/system-admin/import', { method: 'POST', body: JSON.stringify(data?.data || data) }));
