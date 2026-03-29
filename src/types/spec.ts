export interface ParamDef {
  name: string
  in: 'body' | 'query' | 'path'
  type: string
  required: boolean
  description: string
}

export interface EndpointDef {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  path: string
  description: string
  auth: boolean
  params: ParamDef[]
}

export interface PluginDef {
  name: string
  description: string
  endpoints: EndpointDef[]
}

export interface ApiSpec {
  plugins: PluginDef[]
}
