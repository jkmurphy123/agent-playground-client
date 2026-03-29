import type { EndpointDef } from '../types/spec'

export interface ExecuteResult {
  status: number
  body: unknown
}

export async function execute(
  baseUrl: string,
  endpoint: EndpointDef,
  values: Record<string, string>,
  apiKey: string
): Promise<ExecuteResult> {
  let path = endpoint.path
  const queryParams: Record<string, string> = {}
  const bodyParams: Record<string, string> = {}

  for (const param of endpoint.params) {
    const value = values[param.name]
    if (value === undefined) continue
    if (param.in === 'path') {
      path = path.replace(`:${param.name}`, encodeURIComponent(value))
    } else if (param.in === 'query') {
      queryParams[param.name] = value
    } else {
      bodyParams[param.name] = value
    }
  }

  const url = new URL(`${baseUrl}${path}`)
  for (const [k, v] of Object.entries(queryParams)) {
    url.searchParams.set(k, v)
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  }
  if (endpoint.auth && apiKey) {
    headers['X-API-Key'] = apiKey
  }

  const isBodyMethod = ['POST', 'PUT', 'PATCH'].includes(endpoint.method)
  const response = await fetch(url.toString(), {
    method: endpoint.method,
    headers,
    body: isBodyMethod ? JSON.stringify(bodyParams) : undefined
  })

  let body: unknown = null
  try {
    body = await response.json()
  } catch {
    body = null
  }

  return { status: response.status, body }
}
