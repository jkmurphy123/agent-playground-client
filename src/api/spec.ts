import type { ApiSpec } from '../types/spec'

export async function fetchSpec(baseUrl: string): Promise<ApiSpec> {
  const response = await fetch(`${baseUrl}/api-spec`)
  if (!response.ok) {
    throw new Error(`Failed to fetch spec: ${response.status}`)
  }
  return response.json()
}
