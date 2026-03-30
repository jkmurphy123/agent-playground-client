import type { ApiSpec } from '../types/spec'

export async function fetchSpec(baseUrl: string): Promise<ApiSpec> {
  const base = baseUrl.replace(/\/$/, '')
  const response = await fetch(`${base}/api-spec`)
  if (!response.ok) {
    throw new Error(`Failed to fetch spec: ${response.status}`)
  }
  return response.json()
}
