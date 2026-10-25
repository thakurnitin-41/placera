/**
 * Shared client for the optional deployed Placera API.
 * Set VITE_API_BASE_URL in Vercel. Never put database credentials or private
 * server secrets in VITE_* variables; those values are public in the bundle.
 */
const configuredBase = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim();
export const API_BASE_URL = configuredBase ? configuredBase.replace(/\\/+$/, '') : '';

export class ApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!API_BASE_URL) throw new ApiError('Placera API is not configured. Set VITE_API_BASE_URL in Vercel.', 0);
  const response = await fetch(`${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`, {
    ...init,
    headers: { Accept: 'application/json', ...(init.body ? { 'Content-Type': 'application/json' } : {}), ...init.headers },
  });
  if (!response.ok) {
    const message = await response.text().catch(() => '');
    throw new ApiError(message.slice(0, 300) || `API request failed (${response.status})`, response.status);
  }
  return response.json() as Promise<T>;
}
export const apiHealth = () => apiRequest<{ status: string; database: string }>('/health');
