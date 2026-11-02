import { useAuthStore } from '../stores/useAuthStore.js';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

/**
 * Make an authenticated API request.
 * Automatically attaches the Bearer token from the auth store.
 * If a 401 Unauthorized is returned, attempts a silent refresh and retries once.
 */
export async function apiRequest(path, { token, method = 'GET', body } = {}) {
  // Always get the freshest token from store, falling back to passed token
  let accessToken = useAuthStore.getState().accessToken || token;

  const headers = { 'Content-Type': 'application/json' };
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  // Accept either a plain object (will be serialized) or a pre-stringified string
  const rawBody =
    body === undefined
      ? undefined
      : typeof body === 'string'
      ? body
      : JSON.stringify(body);

  console.debug('[apiRequest]', method, path, rawBody ? JSON.parse(rawBody) : '(no body)');

  let res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    credentials: 'include',
    body: rawBody,
  });

  console.debug('[apiRequest] response', res.status, res.statusText);

  // If 401 Unauthorized and not an auth endpoint, attempt silent token refresh and retry once
  if (res.status === 401 && !path.startsWith('/api/auth/')) {
    console.warn('[apiRequest] Received 401 for', path, '– attempting silent refresh…');
    const refreshOk = await useAuthStore.getState().refresh();
    if (refreshOk) {
      accessToken = useAuthStore.getState().accessToken;
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }
      res = await fetch(`${API_URL}${path}`, {
        method,
        headers,
        credentials: 'include',
        body: rawBody,
      });
      console.debug('[apiRequest] retry response', res.status, res.statusText);
    }
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    console.error('[apiRequest] error body', data);
    const err = new Error(data.error || `Request failed: ${res.status}`);
    err.status = res.status;
    throw err;
  }

  // 204 No Content
  if (res.status === 204) return null;
  return res.json();
}
