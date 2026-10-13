const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
export function getToken() { return localStorage.getItem('marketnest_token'); }
export function saveSession(data) { if (data?.token) localStorage.setItem('marketnest_token', data.token); if (data?.user) localStorage.setItem('marketnest_user', JSON.stringify(data.user)); }
export function clearSession() { localStorage.removeItem('marketnest_token'); localStorage.removeItem('marketnest_user'); }
export function getUser() { try { return JSON.parse(localStorage.getItem('marketnest_user') || 'null'); } catch { return null; } }
export async function api(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const token = getToken(); if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${BASE}${path}`, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) { if (response.status === 401) clearSession(); throw new Error(data.message || `Request failed (${response.status})`); }
  return data;
}
