import type {
  ApiResponse,
  AuthTokens,
  ChatRequest,
  ChatResponse,
  LoginRequest,
  RegisterRequest,
  UpdateUserRequest,
  User,
} from '@repo/shared';

// ---------------------------------------------------------------------------
// Token storage
// ---------------------------------------------------------------------------
// Tokens live in localStorage for simplicity. For higher security, move the
// refresh token to an httpOnly cookie set by the API and adapt refresh() below.

const ACCESS_KEY = 'access_token';
const REFRESH_KEY = 'refresh_token';

export const tokenStore = {
  get access() {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(ACCESS_KEY);
  },
  get refresh() {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(REFRESH_KEY);
  },
  set(tokens: AuthTokens) {
    localStorage.setItem(ACCESS_KEY, tokens.accessToken);
    localStorage.setItem(REFRESH_KEY, tokens.refreshToken);
  },
  clear() {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api';

export class ApiClientError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

// ---------------------------------------------------------------------------
// Core request with automatic refresh-on-401
// ---------------------------------------------------------------------------

// Prevents a stampede of refresh calls when several requests 401 at once.
let refreshPromise: Promise<boolean> | null = null;

async function doRefresh(): Promise<boolean> {
  const refreshToken = tokenStore.refresh;
  if (!refreshToken) return false;

  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) {
      tokenStore.clear();
      return false;
    }
    const body = (await res.json()) as ApiResponse<AuthTokens>;
    tokenStore.set(body.data);
    return true;
  } catch {
    tokenStore.clear();
    return false;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  retry = true,
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  const access = tokenStore.access;
  if (access) headers.set('Authorization', `Bearer ${access}`);

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  // Transparent refresh + retry once on 401.
  if (res.status === 401 && retry && tokenStore.refresh) {
    refreshPromise = refreshPromise ?? doRefresh();
    const ok = await refreshPromise;
    refreshPromise = null;
    if (ok) return request<T>(path, options, false);
  }

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const err = await res.json();
      const e = err.error;
      message =
        typeof e === 'string'
          ? e
          : Array.isArray(e?.message)
            ? e.message.join(', ')
            : (e?.message ?? message);
    } catch {
      /* ignore parse error */
    }
    throw new ApiClientError(res.status, message);
  }

  if (res.status === 204) return undefined as T;
  const body = (await res.json()) as ApiResponse<T> | T;
  // Auth endpoints return tokens wrapped in { data }; unwrap consistently.
  return (body as ApiResponse<T>).data ?? (body as T);
}

// ---------------------------------------------------------------------------
// Typed API surface
// ---------------------------------------------------------------------------

export const api = {
  auth: {
    register: (data: RegisterRequest) =>
      request<AuthTokens>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    login: (data: LoginRequest) =>
      request<AuthTokens>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    logout: (refreshToken: string) =>
      request<void>('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      }),
  },
  users: {
    me: () => request<User>('/users/me'),
    updateMe: (data: UpdateUserRequest) =>
      request<User>('/users/me', {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
  },
  ai: {
    chat: (data: ChatRequest) =>
      request<ChatResponse>('/ai/chat', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },
};
