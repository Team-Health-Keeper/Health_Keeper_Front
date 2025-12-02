import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// API base helper: reads from VITE_API_BASE, falls back to localhost:3001
export function getApiBase() {
  const base = import.meta.env?.VITE_API_BASE as string | undefined
  return base && base.length > 0 ? base : 'http://localhost:3001'
}

// Unified fetch wrapper with optional verbose debug logging.
// Set VITE_DEBUG_API=1 in .env to enable detailed console output (request + response).
export async function apiFetch<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const debug = (import.meta.env?.VITE_DEBUG_API === '1')
  const base = getApiBase()
  // Accept full URL or relative api path
  const url = path.startsWith('http') ? path : `${base}${path.startsWith('/') ? '' : '/'}${path}`
  const started = performance.now()
  if (debug) {
    // Minimal log to avoid leaking sensitive headers
    console.log('[apiFetch] →', url, options.method || 'GET')
  }
  let res: Response
  try {
    res = await fetch(url, options)
  } catch (e) {
    if (debug) console.error('[apiFetch] network error', url, e)
    throw e
  }
  const timeMs = Math.round(performance.now() - started)
  const text = await res.text()
  let data: any = null
  try { data = text ? JSON.parse(text) : null } catch { data = text }
  if (debug) {
    console.log(`[apiFetch] ← ${res.status} (${timeMs}ms)`, url, data)
  }
  if (!res.ok) {
    const err: any = new Error(`API ${res.status} for ${url}`)
    err.status = res.status
    err.body = data
    throw err
  }
  return data as T
}
