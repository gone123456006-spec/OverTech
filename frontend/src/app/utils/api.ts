export function getApiBaseUrl() {
  const base = import.meta.env.VITE_API_BASE_URL?.trim() || '';
  return base.replace(/\/$/, '');
}

export function apiUrl(path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const base = getApiBaseUrl();
  return base ? `${base}${normalizedPath}` : normalizedPath;
}
