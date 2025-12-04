export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  const token = sessionStorage.getItem('authToken');
  const userStr = sessionStorage.getItem('user');
  return Boolean(token || userStr);
}
