// Bridge module: re-exports from REST API client instead of createServerFn
// This enables static site deployment without server-side rendering

export { getSystemAdminDashboardServer, approveRegistrationServer, rejectRegistrationServer, suspendRegistrationServer, deleteRegistrationServer, searchCompaniesServer, suspendWorkspaceServer, reactivateWorkspaceServer, deleteWorkspaceServer, resetOwnerPasswordServer, resendWelcomeEmailServer, getAuditLogsServer, exportWorkspaceServer, importWorkspaceServer } from './api-system-admin';

