export const getApiBaseUrl = () => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof process !== 'undefined' && process.env) {
    if (process.env.VITE_API_URL) return process.env.VITE_API_URL;
    if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  }
  return 'https://bizora-backend-gtoe.onrender.com';
};

export const API_BASE_URL = getApiBaseUrl();

export async function fetchApi<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; message?: string; error?: any }> {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('bizora_access_token') : null;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = 'Bearer ' + token;
    }

    const baseUrl = getApiBaseUrl();
    const response = await fetch(baseUrl + endpoint, {
      ...options,
      headers,
    });

    // Always try to parse the JSON body — the backend sends error details in the body
    let result: any;
    try {
      result = await response.json();
    } catch {
      result = null;
    }

    if (!response.ok) {
      // Return the actual error from the backend response body
      return {
        success: false,
        data: result?.data ?? ([] as any),
        message: result?.message || result?.error || `HTTP ${response.status}`,
        error: result?.error || result?.message || `HTTP ${response.status}`,
      };
    }

    return result || { success: true, data: [] as any };
  } catch (error: any) {
    return { success: false, data: [] as any, error: error?.message || 'Network error', message: error?.message || 'Network error' };
  }
}
