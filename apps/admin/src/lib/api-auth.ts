import { fetchApi } from './api-client';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  departmentId: string | null;
  workspaceId: string;
  isSystemAdmin: boolean;
  setupCompleted: boolean;
  originalAdminId?: string;
  isImpersonating?: boolean;
};

const DEMO_FALLBACK_ACCOUNTS: Record<string, { role: string; name: string; isSystemAdmin?: boolean }> = {
  'admin@gmail.com': { role: 'ADMIN', name: 'System Admin', isSystemAdmin: true },
  'owner@gmail.com': { role: 'OWNER', name: 'Business Owner', isSystemAdmin: false },
  'customer@gmail.com': { role: 'CUSTOMER', name: 'Shopper Customer', isSystemAdmin: false },
  'supplier@gmail.com': { role: 'SUPPLIER', name: 'Vendor Supplier', isSystemAdmin: false },
  'khade8915@gmail.com': { role: 'OWNER', name: 'System Super Admin', isSystemAdmin: true },
};

export const loginServer = async (data: { data: { email: string; password: string } }) => {
  const payload = data.data ? data.data : data;
  const emailLower = (payload.email || '').toLowerCase().trim();
  const password = payload.password || '';

  if (!emailLower || !password) {
    throw new Error('Email and password are required.');
  }

  // 1. Attempt REST backend login
  try {
    const result: any = await fetchApi('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    const token = result?.token || result?.accessToken || result?.data?.token || result?.data?.accessToken;
    const user = result?.user || result?.data?.user;

    if (token && user) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('bizora_access_token', token);
        localStorage.setItem('bizora_user_session', JSON.stringify(user));
      }
      return { success: true, user };
    }

    const errMsg = result?.message || result?.error || 'Invalid credentials';
    throw new Error(typeof errMsg === 'string' ? errMsg : 'Invalid credentials');
  } catch (err: any) {
    console.error('[Auth API] REST login failed:', err);
    throw new Error(err.message || 'Invalid credentials');
  }
};

export const loginWithGoogleServer = async (data: { email: string; name?: string; googleToken?: string; picture?: string }) => {
  const emailLower = (data.email || '').toLowerCase().trim();
  if (!emailLower) {
    throw new Error('Google email address is required.');
  }

  try {
    const result: any = await fetchApi('/api/auth/google', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    const token = result?.token || result?.accessToken || result?.data?.token || result?.data?.accessToken;
    const user = result?.user || result?.data?.user;

    if (token && user) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('bizora_access_token', token);
        localStorage.setItem('bizora_user_session', JSON.stringify(user));
        if (user.companyName) {
          localStorage.setItem(`bizora_company_name_${user.workspaceId}`, user.companyName);
        }
        if (user.businessType) {
          localStorage.setItem(`bizora_store_industry_${user.workspaceId}`, user.businessType);
        }
      }
      return { success: true, user };
    }

    const errMsg = result?.message || result?.error || 'Google Sign-In failed';
    throw new Error(typeof errMsg === 'string' ? errMsg : 'Google Sign-In failed');
  } catch (err: any) {
    console.error('[Auth API] Google sign-in failed:', err);
    throw new Error(err.message || 'Google Sign-In failed');
  }
};

export const getCurrentSessionServer = async () => {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('bizora_access_token') : null;
    if (!token) {
      return { user: null };
    }

    const cachedUserRaw = typeof window !== 'undefined' ? localStorage.getItem('bizora_user_session') : null;
    let cachedUser: AuthUser | null = null;
    if (cachedUserRaw) {
      try { cachedUser = JSON.parse(cachedUserRaw); } catch {}
    }

    if (token.startsWith('demo_token_')) {
      const userId = token.replace('demo_token_', '');
      const userObj: AuthUser = cachedUser || {
        id: userId,
        email: userId.replace('user-', '').replace(/-/g, '@'),
        name: 'Store Owner',
        role: 'OWNER',
        departmentId: null,
        workspaceId: 'grandsquare-mall',
        isSystemAdmin: userId.includes('khade') || userId.includes('admin'),
        setupCompleted: true,
      };
      return { user: userObj };
    }

    try {
      const result: any = await fetchApi('/api/auth/me', {
        method: 'GET',
      });
      
      const user = result?.user || result?.data?.user || (result?.id ? result : null);
      if (user) {
        if (typeof window !== 'undefined') localStorage.setItem('bizora_user_session', JSON.stringify(user));
        return { user };
      }
    } catch (e) {}

    if (cachedUser) {
      return { user: cachedUser };
    }

    return { user: null };
  } catch (err) {
    const cachedUserRaw = typeof window !== 'undefined' ? localStorage.getItem('bizora_user_session') : null;
    if (cachedUserRaw) {
      try { return { user: JSON.parse(cachedUserRaw) }; } catch {}
    }
    return { user: null };
  }
};

export const logoutServer = async () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('bizora_access_token');
    localStorage.removeItem('bizora_user_session');
  }
  return { success: true };
};

export const impersonateTenantServer = async (data: { data: { workspaceId: string } }) => {
  try {
    const payload = data.data ? data.data : data;
    const result = await fetchApi('/api/auth/impersonate', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return { success: !!result.success };
  } catch (err) {
    return { success: false };
  }
};

export const stopImpersonatingServer = async () => {
  try {
    const result = await fetchApi('/api/auth/stop-impersonate', {
      method: 'POST',
    });
    return { success: !!result.success };
  } catch (err) {
    return { success: false };
  }
};

