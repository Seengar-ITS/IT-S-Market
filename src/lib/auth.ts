const ITS_ID_URL = import.meta.env.VITE_ITS_ID_URL ?? 'https://it-s-id.vercel.app'
export interface ItsUser { id: string; email: string; profile?: Record<string, unknown> }
export async function getAuthUser(): Promise<ItsUser | null> {
  const token = localStorage.getItem('its-id-token')
  if (!token) return null
  const res = await fetch(`${ITS_ID_URL}/api/user/me`, { headers: { Authorization: `Bearer ${token}` } })
  if (!res.ok) { localStorage.removeItem('its-id-token'); return null }
  return res.json()
}
export function redirectToLogin() {
  window.location.href = `${ITS_ID_URL}/login?return_url=${encodeURIComponent(window.location.href)}`
}
