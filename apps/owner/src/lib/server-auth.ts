// Bridge module: re-exports from REST API client instead of createServerFn
// This enables static site deployment without server-side rendering

export {
  loginServer,
  loginWithGoogleServer,
  getCurrentSessionServer,
  logoutServer,
  impersonateTenantServer,
  stopImpersonatingServer,
  type AuthUser,
} from './api-auth';

// Stub functions for server-only helpers (not needed on static client)
export async function requireAuth(): Promise<any> { return null; }
export async function getSecureSessionUser(): Promise<any> { return null; }
export async function requireSystemAdmin(): Promise<any> { return null; }
