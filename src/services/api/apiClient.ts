const TOKEN_KEY = 'pos_access_token';

const getBaseUrl = () => {
  const url = import.meta.env.VITE_API_URL as string | undefined;
  return (url && url.length > 0 ? url : 'https://posbackend-production-438a.up.railway.app').replace(/\/$/, '');
};

export const tokenStorage = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

type ApiErrorShape = {
  message?: string;
  errors?: string[];
};

export type UnauthorizedHandler = () => void;
let unauthorizedHandler: UnauthorizedHandler | null = null;

export const apiClient = {
  onUnauthorized(handler: UnauthorizedHandler) {
    unauthorizedHandler = handler;
  },
  async request<T>(path: string, options?: RequestInit & { json?: unknown; params?: Record<string, any> }): Promise<T> {
    let url = `${getBaseUrl()}${path.startsWith('/') ? '' : '/'}${path}`;

    if (options?.params) {
      const searchParams = new URLSearchParams();
      Object.entries(options.params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url += (url.includes('?') ? '&' : '?') + queryString;
      }
    }

    const headers = new Headers(options?.headers);
    headers.set('Accept', 'application/json');

    if (options?.json !== undefined) {
      headers.set('Content-Type', 'application/json');
    }

    const token = tokenStorage.get();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const res = await fetch(url, {
      ...options,
      headers,
      body: options?.json !== undefined ? JSON.stringify(options.json) : options?.body,
    });

    const text = await res.text();
    const data = text ? (JSON.parse(text) as unknown) : undefined;

    if (!res.ok) {
      if (res.status === 401 && unauthorizedHandler) {
        unauthorizedHandler();
      }

      const err = data as ApiErrorShape | undefined;
      const validationMsgs = Array.isArray(err?.errors) ? err.errors.join(', ') : undefined;
      const msg =
        (err?.message && validationMsgs ? `${err.message}: ${validationMsgs}` : (err?.message || validationMsgs)) ||
        `Request failed (${res.status})`;

      throw new Error(msg);
    }

    return data as T;
  },

  get<T>(path: string, options?: { params?: Record<string, any> }) {
    return this.request<T>(path, options);
  },

  post<T>(path: string, body?: unknown, options?: { params?: Record<string, any> }) {
    return this.request<T>(path, { method: 'POST', json: body, ...options });
  },

  put<T>(path: string, body?: unknown, options?: { params?: Record<string, any> }) {
    return this.request<T>(path, { method: 'PUT', json: body, ...options });
  },

  delete<T>(path: string, options?: { params?: Record<string, any> }) {
    return this.request<T>(path, { method: 'DELETE', ...options });
  },

  patch<T>(path: string, body?: unknown, options?: { params?: Record<string, any> }) {
    return this.request<T>(path, { method: 'PATCH', json: body, ...options });
  },
};

