// Shared contract between the NestJS API and the Next.js frontend.
// Both sides import these — the API/client contract cannot drift.

// Every successful API response is wrapped by the backend's TransformInterceptor.
export interface ApiResponse<T> {
  data: T;
}

// Standard error shape from the backend's AllExceptionsFilter.
export interface ApiError {
  statusCode: number;
  error: string | { message?: string | string[] };
  timestamp: string;
}

export type Role = 'USER' | 'ADMIN';

// Public user shape (never includes passwordHash) — matches users.service `publicUser`.
export interface User {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

// Auth token pair returned by register/login/refresh.
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// Request bodies
export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface UpdateUserRequest {
  name?: string;
}

// AI chat (endpoint exists on the API even though no UI ships by default)
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
}

export interface ChatResponse {
  reply: string;
}
