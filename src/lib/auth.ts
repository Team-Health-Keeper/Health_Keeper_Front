export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  const v = sessionStorage.getItem('authToken');
  if (!v) return null;
  const trimmed = v.trim();
  return trimmed && trimmed !== 'null' && trimmed !== 'undefined' ? trimmed : null;
}

export function isAuthenticated(): boolean {
  const token = getAuthToken();
  console.log('isAuthenticated check, token:', token);
  return Boolean(token);
}
