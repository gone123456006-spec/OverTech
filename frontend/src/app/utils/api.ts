const PRODUCTION_API_BASE = 'https://overtech-api.onrender.com';

export function getApiBaseUrl() {
  const envBase = import.meta.env.VITE_API_BASE_URL?.trim();

  if (import.meta.env.PROD) {
    // Prefer same-origin /api on Vercel (proxied to Render via vercel.json rewrites).
    if (!envBase || envBase.includes('localhost')) return '';
    return envBase.replace(/\/$/, '');
  }

  if (envBase) return envBase.replace(/\/$/, '');
  return '';
}

export function apiUrl(path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const base = getApiBaseUrl();
  return base ? `${base}${normalizedPath}` : normalizedPath;
}

export async function parseJsonResponse<T = Record<string, unknown>>(res: Response): Promise<T> {
  const text = await res.text();
  if (!text) {
    throw new Error(
      res.ok
        ? 'Server returned an empty response'
        : `Payment request failed (${res.status}). Check API URL and backend status.`
    );
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`Server returned invalid JSON (${res.status}). API may be misconfigured.`);
  }
}

export async function apiPost<T = Record<string, unknown>>(path: string, body: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(apiUrl(path), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error(`Cannot reach payment server. Try again or use Cash on Delivery.`);
  }

  const data = await parseJsonResponse<T>(res);
  if (!res.ok) {
    throw new Error((data as { message?: string }).message || `Request failed (${res.status})`);
  }
  return data;
}
