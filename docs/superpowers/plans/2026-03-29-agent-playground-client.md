# Agent Playground Client Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Vue 3 dashboard that fetches `/api-spec` from the agent-playground server and renders a plugin card grid with expandable endpoint forms and inline response display.

**Architecture:** App.vue holds global state (baseUrl, apiKey, plugins) and provides baseUrl/apiKey to descendants via Vue's provide/inject. A fetchSpec utility loads the server manifest; a generic client.ts executes any endpoint. Four focused components — ApiKeyBar, PluginGrid, PluginCard, EndpointPanel — each own one slice of the UI.

**Tech Stack:** Vue 3 (Composition API), Vite 5, TypeScript 5, Vitest + @vue/test-utils (jsdom)

---

## File Map

| File | Responsibility |
|------|---------------|
| `package.json` | Dependencies, scripts |
| `vite.config.ts` | Vite + Vue plugin + Vitest config |
| `tsconfig.json` | TS config for src |
| `tsconfig.node.json` | TS config for vite.config.ts |
| `index.html` | Vite entry HTML |
| `src/main.ts` | Mount Vue app |
| `src/App.vue` | Global state, provide, layout shell |
| `src/types/spec.ts` | Shared TS interfaces (ApiSpec, PluginDef, EndpointDef, ParamDef) |
| `src/api/spec.ts` | `fetchSpec(baseUrl)` — fetches /api-spec |
| `src/api/spec.test.ts` | Unit tests for fetchSpec |
| `src/api/client.ts` | `execute(baseUrl, endpoint, values, apiKey)` — generic HTTP call |
| `src/api/client.test.ts` | Unit tests for execute |
| `src/components/ApiKeyBar.vue` | Sticky bar: server URL + API key inputs + status dot |
| `src/components/ApiKeyBar.test.ts` | Component tests for ApiKeyBar |
| `src/components/PluginGrid.vue` | Responsive CSS grid of PluginCards |
| `src/components/PluginGrid.test.ts` | Component tests for PluginGrid |
| `src/components/PluginCard.vue` | Single plugin card, toggles expansion |
| `src/components/PluginCard.test.ts` | Component tests for PluginCard |
| `src/components/EndpointPanel.vue` | Param form + execute button + response display |
| `src/components/EndpointPanel.test.ts` | Component tests for EndpointPanel |
| `src/App.test.ts` | Integration tests for App.vue |

---

## Task 1: Scaffold project

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `index.html`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "agent-playground-client",
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "vue": "^3.4.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.0.0",
    "@vue/test-utils": "^2.4.0",
    "jsdom": "^24.0.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "vitest": "^1.2.0",
    "vue-tsc": "^1.8.0"
  }
}
```

- [ ] **Step 2: Create vite.config.ts**

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    globals: true
  }
})
```

- [ ] **Step 3: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve",
    "strict": true
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.vue"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [ ] **Step 4: Create tsconfig.node.json**

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 5: Create index.html**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Agent Playground</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

- [ ] **Step 6: Install dependencies**

Run: `npm install`

Expected: `node_modules/` populated, no errors. Output ends with something like `added N packages`.

- [ ] **Step 7: Verify tests can run (zero tests is fine)**

Run: `npm test`

Expected: `No test files found` or similar — Vitest starts successfully without errors.

- [ ] **Step 8: Commit scaffold**

```bash
git add package.json vite.config.ts tsconfig.json tsconfig.node.json index.html package-lock.json
git commit -m "feat: scaffold Vue 3 + Vite + Vitest project"
```

---

## Task 2: Types and app entry

**Files:**
- Create: `src/types/spec.ts`
- Create: `src/main.ts`

- [ ] **Step 1: Create src/types/spec.ts**

```typescript
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
```

- [ ] **Step 2: Create src/main.ts**

```typescript
import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')
```

- [ ] **Step 3: Create stub src/App.vue** (will be fully implemented in Task 9)

```vue
<script setup lang="ts">
</script>

<template>
  <div class="app">
    <p>Loading...</p>
  </div>
</template>
```

- [ ] **Step 4: Commit**

```bash
git add src/
git commit -m "feat: add types, app entry, and App stub"
```

---

## Task 3: Implement api/spec.ts (TDD)

**Files:**
- Create: `src/api/spec.ts`
- Create: `src/api/spec.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/api/spec.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchSpec } from './spec'

describe('fetchSpec', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('fetches /api-spec from the given base URL', async () => {
    const mockSpec = { plugins: [] }
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockSpec)
    })

    const result = await fetchSpec('http://localhost:3000')

    expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api-spec')
    expect(result).toEqual(mockSpec)
  })

  it('throws an error when the response is not ok', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 503 })

    await expect(fetchSpec('http://localhost:3000')).rejects.toThrow(
      'Failed to fetch spec: 503'
    )
  })

  it('throws when fetch itself rejects (network error)', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

    await expect(fetchSpec('http://localhost:3000')).rejects.toThrow('Network error')
  })
})
```

- [ ] **Step 2: Run to verify tests fail**

Run: `npm test -- src/api/spec.test.ts`

Expected: FAIL — `Cannot find module './spec'`

- [ ] **Step 3: Implement src/api/spec.ts**

```typescript
import type { ApiSpec } from '../types/spec'

export async function fetchSpec(baseUrl: string): Promise<ApiSpec> {
  const response = await fetch(`${baseUrl}/api-spec`)
  if (!response.ok) {
    throw new Error(`Failed to fetch spec: ${response.status}`)
  }
  return response.json()
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- src/api/spec.test.ts`

Expected: PASS — 3 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/api/spec.ts src/api/spec.test.ts
git commit -m "feat: add fetchSpec utility with tests"
```

---

## Task 4: Implement api/client.ts (TDD)

**Files:**
- Create: `src/api/client.ts`
- Create: `src/api/client.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/api/client.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { execute } from './client'
import type { EndpointDef } from '../types/spec'

const baseEndpoint: EndpointDef = {
  method: 'GET',
  path: '/actions/messages',
  description: 'Fetch messages',
  auth: false,
  params: []
}

describe('execute', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('makes a GET request to the correct URL', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      status: 200,
      json: () => Promise.resolve([])
    })

    await execute('http://localhost:3000', baseEndpoint, {}, '')

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3000/actions/messages',
      expect.objectContaining({ method: 'GET' })
    )
  })

  it('sends body params as JSON for POST requests', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      status: 200,
      json: () => Promise.resolve({ messageId: 'abc' })
    })
    const endpoint: EndpointDef = {
      method: 'POST',
      path: '/actions/message',
      description: 'Send message',
      auth: false,
      params: [{ name: 'text', in: 'body', type: 'string', required: true, description: '' }]
    }

    await execute('http://localhost:3000', endpoint, { text: 'hello' }, '')

    const [, options] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(options.method).toBe('POST')
    expect(JSON.parse(options.body)).toEqual({ text: 'hello' })
  })

  it('appends query params to the URL for GET requests', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      status: 200,
      json: () => Promise.resolve([])
    })
    const endpoint: EndpointDef = {
      method: 'GET',
      path: '/search',
      description: 'Search',
      auth: false,
      params: [{ name: 'q', in: 'query', type: 'string', required: false, description: '' }]
    }

    await execute('http://localhost:3000', endpoint, { q: 'hello' }, '')

    const [url] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(url).toContain('q=hello')
  })

  it('interpolates path params into the URL', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      status: 200,
      json: () => Promise.resolve({})
    })
    const endpoint: EndpointDef = {
      method: 'GET',
      path: '/agents/:id',
      description: 'Get agent',
      auth: false,
      params: [{ name: 'id', in: 'path', type: 'string', required: true, description: '' }]
    }

    await execute('http://localhost:3000', endpoint, { id: 'abc-123' }, '')

    const [url] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(url).toContain('/agents/abc-123')
  })

  it('injects X-API-Key header when endpoint auth is true', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      status: 200,
      json: () => Promise.resolve({})
    })
    const authEndpoint: EndpointDef = { ...baseEndpoint, auth: true }

    await execute('http://localhost:3000', authEndpoint, {}, 'my-secret-key')

    const [, options] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(options.headers['X-API-Key']).toBe('my-secret-key')
  })

  it('does not inject X-API-Key when endpoint auth is false', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      status: 200,
      json: () => Promise.resolve({})
    })

    await execute('http://localhost:3000', baseEndpoint, {}, 'my-secret-key')

    const [, options] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(options.headers['X-API-Key']).toBeUndefined()
  })

  it('returns status and parsed body', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      status: 201,
      json: () => Promise.resolve({ id: '1' })
    })

    const result = await execute('http://localhost:3000', baseEndpoint, {}, '')

    expect(result).toEqual({ status: 201, body: { id: '1' } })
  })

  it('returns null body when response is not JSON', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      status: 204,
      json: () => Promise.reject(new SyntaxError('No content'))
    })

    const result = await execute('http://localhost:3000', baseEndpoint, {}, '')

    expect(result).toEqual({ status: 204, body: null })
  })
})
```

- [ ] **Step 2: Run to verify tests fail**

Run: `npm test -- src/api/client.test.ts`

Expected: FAIL — `Cannot find module './client'`

- [ ] **Step 3: Implement src/api/client.ts**

```typescript
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- src/api/client.test.ts`

Expected: PASS — 8 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/api/client.ts src/api/client.test.ts
git commit -m "feat: add generic endpoint executor with tests"
```

---

## Task 5: Implement ApiKeyBar.vue (TDD)

**Files:**
- Create: `src/components/ApiKeyBar.vue`
- Create: `src/components/ApiKeyBar.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/components/ApiKeyBar.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ApiKeyBar from './ApiKeyBar.vue'

describe('ApiKeyBar', () => {
  it('renders the server URL input with the provided value', () => {
    const wrapper = mount(ApiKeyBar, {
      props: { baseUrl: 'http://localhost:3000', apiKey: '', status: 'unknown' }
    })
    const input = wrapper.find('[data-testid="server-url"]')
    expect((input.element as HTMLInputElement).value).toBe('http://localhost:3000')
  })

  it('renders the API key input with the provided value', () => {
    const wrapper = mount(ApiKeyBar, {
      props: { baseUrl: '', apiKey: 'secret-key', status: 'unknown' }
    })
    const input = wrapper.find('[data-testid="api-key"]')
    expect((input.element as HTMLInputElement).value).toBe('secret-key')
  })

  it('emits update:baseUrl when the URL input changes', async () => {
    const wrapper = mount(ApiKeyBar, {
      props: { baseUrl: 'http://localhost:3000', apiKey: '', status: 'unknown' }
    })
    await wrapper.find('[data-testid="server-url"]').setValue('http://localhost:4000')
    expect(wrapper.emitted('update:baseUrl')?.[0]).toEqual(['http://localhost:4000'])
  })

  it('emits update:apiKey when the API key input changes', async () => {
    const wrapper = mount(ApiKeyBar, {
      props: { baseUrl: '', apiKey: '', status: 'unknown' }
    })
    await wrapper.find('[data-testid="api-key"]').setValue('new-key')
    expect(wrapper.emitted('update:apiKey')?.[0]).toEqual(['new-key'])
  })

  it('shows a status dot with a class matching the status prop', () => {
    const wrapper = mount(ApiKeyBar, {
      props: { baseUrl: '', apiKey: '', status: 'connected' }
    })
    expect(wrapper.find('[data-testid="status-dot"]').classes()).toContain('connected')
  })
})
```

- [ ] **Step 2: Run to verify tests fail**

Run: `npm test -- src/components/ApiKeyBar.test.ts`

Expected: FAIL — `Cannot find module './ApiKeyBar.vue'`

- [ ] **Step 3: Implement src/components/ApiKeyBar.vue**

```vue
<script setup lang="ts">
defineProps<{
  baseUrl: string
  apiKey: string
  status: 'connected' | 'disconnected' | 'loading' | 'unknown'
}>()

defineEmits<{
  'update:baseUrl': [value: string]
  'update:apiKey': [value: string]
}>()
</script>

<template>
  <header class="api-key-bar">
    <div data-testid="status-dot" class="status-dot" :class="status" />
    <label>
      Server URL
      <input
        data-testid="server-url"
        type="text"
        :value="baseUrl"
        @input="$emit('update:baseUrl', ($event.target as HTMLInputElement).value)"
      />
    </label>
    <label>
      API Key
      <input
        data-testid="api-key"
        type="text"
        :value="apiKey"
        @input="$emit('update:apiKey', ($event.target as HTMLInputElement).value)"
      />
    </label>
  </header>
</template>

<style scoped>
.api-key-bar {
  position: sticky;
  top: 0;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1.5rem;
  background: #1a1a2e;
  border-bottom: 1px solid #333;
  z-index: 100;
}
.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}
.status-dot.connected { background: #22c55e; }
.status-dot.disconnected { background: #ef4444; }
.status-dot.loading { background: #f59e0b; }
.status-dot.unknown { background: #6b7280; }
label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #aaa;
  font-size: 0.875rem;
}
input {
  background: #0f0f1a;
  border: 1px solid #333;
  border-radius: 4px;
  color: #fff;
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
  min-width: 200px;
}
</style>
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- src/components/ApiKeyBar.test.ts`

Expected: PASS — 5 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/ApiKeyBar.vue src/components/ApiKeyBar.test.ts
git commit -m "feat: add ApiKeyBar component with tests"
```

---

## Task 6: Implement PluginGrid.vue (TDD)

**Files:**
- Create: `src/components/PluginGrid.vue`
- Create: `src/components/PluginGrid.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/components/PluginGrid.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import PluginGrid from './PluginGrid.vue'
import type { PluginDef } from '../types/spec'

const makePlugin = (name: string): PluginDef => ({
  name,
  description: `${name} description`,
  endpoints: []
})

describe('PluginGrid', () => {
  it('shows empty state message when no plugins are provided', () => {
    const wrapper = shallowMount(PluginGrid, { props: { plugins: [] } })
    expect(wrapper.text()).toContain('No plugins found on this server')
  })

  it('does not show empty state when plugins are present', () => {
    const wrapper = shallowMount(PluginGrid, {
      props: { plugins: [makePlugin('Messaging')] }
    })
    expect(wrapper.text()).not.toContain('No plugins found')
  })

  it('renders one PluginCard stub per plugin', () => {
    const plugins = [makePlugin('Messaging'), makePlugin('Agents')]
    const wrapper = shallowMount(PluginGrid, { props: { plugins } })
    expect(wrapper.findAllComponents({ name: 'PluginCard' })).toHaveLength(2)
  })
})
```

- [ ] **Step 2: Run to verify tests fail**

Run: `npm test -- src/components/PluginGrid.test.ts`

Expected: FAIL — `Cannot find module './PluginGrid.vue'`

- [ ] **Step 3: Implement src/components/PluginGrid.vue**

```vue
<script setup lang="ts">
import type { PluginDef } from '../types/spec'
import PluginCard from './PluginCard.vue'

defineProps<{
  plugins: PluginDef[]
}>()
</script>

<template>
  <main class="plugin-grid">
    <p v-if="plugins.length === 0" class="empty">No plugins found on this server</p>
    <PluginCard v-for="plugin in plugins" :key="plugin.name" :plugin="plugin" />
  </main>
</template>

<style scoped>
.plugin-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 1rem;
  padding: 1.5rem;
}
.empty {
  color: #aaa;
  text-align: center;
  grid-column: 1 / -1;
  padding: 3rem 0;
}
</style>
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- src/components/PluginGrid.test.ts`

Expected: PASS — 3 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/PluginGrid.vue src/components/PluginGrid.test.ts
git commit -m "feat: add PluginGrid component with tests"
```

---

## Task 7: Implement PluginCard.vue (TDD)

**Files:**
- Create: `src/components/PluginCard.vue`
- Create: `src/components/PluginCard.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/components/PluginCard.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import PluginCard from './PluginCard.vue'
import type { PluginDef } from '../types/spec'

const plugin: PluginDef = {
  name: 'Messaging',
  description: 'Send and retrieve messages',
  endpoints: [
    { method: 'POST', path: '/actions/message', description: 'Send', auth: true, params: [] },
    { method: 'GET', path: '/actions/messages', description: 'Fetch', auth: false, params: [] }
  ]
}

describe('PluginCard', () => {
  it('renders plugin name and description', () => {
    const wrapper = shallowMount(PluginCard, { props: { plugin } })
    expect(wrapper.text()).toContain('Messaging')
    expect(wrapper.text()).toContain('Send and retrieve messages')
  })

  it('shows endpoint count in the header', () => {
    const wrapper = shallowMount(PluginCard, { props: { plugin } })
    expect(wrapper.text()).toContain('2 endpoints')
  })

  it('does not show endpoint panels by default', () => {
    const wrapper = shallowMount(PluginCard, { props: { plugin } })
    expect(wrapper.find('[data-testid="endpoints"]').exists()).toBe(false)
  })

  it('shows endpoint panels after clicking the header button', async () => {
    const wrapper = shallowMount(PluginCard, { props: { plugin } })
    await wrapper.find('button').trigger('click')
    expect(wrapper.find('[data-testid="endpoints"]').exists()).toBe(true)
  })

  it('hides endpoint panels when clicked a second time', async () => {
    const wrapper = shallowMount(PluginCard, { props: { plugin } })
    await wrapper.find('button').trigger('click')
    await wrapper.find('button').trigger('click')
    expect(wrapper.find('[data-testid="endpoints"]').exists()).toBe(false)
  })

  it('renders one EndpointPanel stub per endpoint when expanded', async () => {
    const wrapper = shallowMount(PluginCard, { props: { plugin } })
    await wrapper.find('button').trigger('click')
    expect(wrapper.findAllComponents({ name: 'EndpointPanel' })).toHaveLength(2)
  })
})
```

- [ ] **Step 2: Run to verify tests fail**

Run: `npm test -- src/components/PluginCard.test.ts`

Expected: FAIL — `Cannot find module './PluginCard.vue'`

- [ ] **Step 3: Implement src/components/PluginCard.vue**

```vue
<script setup lang="ts">
import { ref } from 'vue'
import type { PluginDef } from '../types/spec'
import EndpointPanel from './EndpointPanel.vue'

const props = defineProps<{
  plugin: PluginDef
}>()

const expanded = ref(false)
const count = props.plugin.endpoints.length
</script>

<template>
  <div class="plugin-card">
    <button class="card-header" @click="expanded = !expanded">
      <div class="card-info">
        <span class="name">{{ plugin.name }}</span>
        <span class="description">{{ plugin.description }}</span>
      </div>
      <span class="count">{{ count }} endpoint{{ count !== 1 ? 's' : '' }}</span>
      <span class="chevron">{{ expanded ? '▼' : '▶' }}</span>
    </button>
    <div v-if="expanded" data-testid="endpoints" class="endpoints">
      <EndpointPanel
        v-for="endpoint in plugin.endpoints"
        :key="`${endpoint.method}:${endpoint.path}`"
        :endpoint="endpoint"
      />
    </div>
  </div>
</template>

<style scoped>
.plugin-card {
  background: #1e1e3a;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #333;
}
.card-header {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: none;
  border: none;
  color: #fff;
  cursor: pointer;
  text-align: left;
}
.card-header:hover { background: #252545; }
.card-info { flex: 1; display: flex; flex-direction: column; gap: 0.25rem; }
.name { font-weight: bold; font-size: 1rem; }
.description { font-size: 0.8rem; color: #aaa; }
.count { font-size: 0.8rem; color: #7c8cf8; white-space: nowrap; }
.chevron { color: #7c8cf8; }
.endpoints { border-top: 1px solid #333; }
</style>
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- src/components/PluginCard.test.ts`

Expected: PASS — 6 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/PluginCard.vue src/components/PluginCard.test.ts
git commit -m "feat: add PluginCard component with expand/collapse and tests"
```

---

## Task 8: Implement EndpointPanel.vue (TDD)

**Files:**
- Create: `src/components/EndpointPanel.vue`
- Create: `src/components/EndpointPanel.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/components/EndpointPanel.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import EndpointPanel from './EndpointPanel.vue'
import type { EndpointDef } from '../types/spec'
import * as clientModule from '../api/client'

const postEndpoint: EndpointDef = {
  method: 'POST',
  path: '/actions/message',
  description: 'Send a message',
  auth: true,
  params: [
    { name: 'text', in: 'body', type: 'string', required: true, description: 'Message text' }
  ]
}

const getEndpoint: EndpointDef = {
  method: 'GET',
  path: '/actions/messages',
  description: 'Fetch messages',
  auth: false,
  params: []
}

const mountWithProvide = (endpoint: EndpointDef) =>
  mount(EndpointPanel, {
    props: { endpoint },
    global: {
      provide: {
        baseUrl: ref('http://localhost:3000'),
        apiKey: ref('test-api-key')
      }
    }
  })

describe('EndpointPanel', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('renders the method badge with the endpoint method', () => {
    const wrapper = mountWithProvide(postEndpoint)
    expect(wrapper.find('[data-testid="method-badge"]').text()).toBe('POST')
  })

  it('renders the endpoint path', () => {
    const wrapper = mountWithProvide(postEndpoint)
    expect(wrapper.text()).toContain('/actions/message')
  })

  it('renders the endpoint description', () => {
    const wrapper = mountWithProvide(postEndpoint)
    expect(wrapper.text()).toContain('Send a message')
  })

  it('renders one input per param', () => {
    const wrapper = mountWithProvide(postEndpoint)
    expect(wrapper.find('[data-testid="param-text"]').exists()).toBe(true)
  })

  it('marks required params with an asterisk', () => {
    const wrapper = mountWithProvide(postEndpoint)
    expect(wrapper.find('[data-testid="required-marker"]').exists()).toBe(true)
  })

  it('does not render an API key field even for auth endpoints', () => {
    const wrapper = mountWithProvide(postEndpoint)
    const inputs = wrapper.findAll('input')
    // Only the 'text' param input — no API key input
    expect(inputs).toHaveLength(1)
  })

  it('labels the execute button with the endpoint method', () => {
    const wrapper = mountWithProvide(postEndpoint)
    expect(wrapper.find('button[type="submit"]').text()).toBe('Send POST')
  })

  it('shows no response area before the button is clicked', () => {
    const wrapper = mountWithProvide(postEndpoint)
    expect(wrapper.find('[data-testid="response-result"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="response-error"]').exists()).toBe(false)
  })

  it('calls execute with correct args and shows the response on success', async () => {
    vi.spyOn(clientModule, 'execute').mockResolvedValue({ status: 200, body: { messageId: 'abc' } })
    const wrapper = mountWithProvide(postEndpoint)

    await wrapper.find('[data-testid="param-text"]').setValue('hello')
    await wrapper.find('form').trigger('submit')
    await wrapper.vm.$nextTick()

    expect(clientModule.execute).toHaveBeenCalledWith(
      'http://localhost:3000',
      postEndpoint,
      { text: 'hello' },
      'test-api-key'
    )
    expect(wrapper.find('[data-testid="response-result"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="response-result"]').text()).toContain('200')
  })

  it('shows an error message when execute throws', async () => {
    vi.spyOn(clientModule, 'execute').mockRejectedValue(new Error('Network error'))
    const wrapper = mountWithProvide(postEndpoint)

    await wrapper.find('form').trigger('submit')
    await wrapper.vm.$nextTick()

    expect(wrapper.find('[data-testid="response-error"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="response-error"]').text()).toContain('Network error')
  })

  it('shows no param inputs for endpoints with no params', () => {
    const wrapper = mountWithProvide(getEndpoint)
    expect(wrapper.findAll('input')).toHaveLength(0)
  })
})
```

- [ ] **Step 2: Run to verify tests fail**

Run: `npm test -- src/components/EndpointPanel.test.ts`

Expected: FAIL — `Cannot find module './EndpointPanel.vue'`

- [ ] **Step 3: Implement src/components/EndpointPanel.vue**

```vue
<script setup lang="ts">
import { ref, inject } from 'vue'
import type { Ref } from 'vue'
import type { EndpointDef } from '../types/spec'
import { execute } from '../api/client'

const props = defineProps<{
  endpoint: EndpointDef
}>()

const baseUrl = inject<Ref<string>>('baseUrl')!
const apiKey = inject<Ref<string>>('apiKey')!

const values = ref<Record<string, string>>(
  Object.fromEntries(props.endpoint.params.map(p => [p.name, '']))
)
const result = ref<{ status: number; body: unknown } | null>(null)
const loading = ref(false)
const errorMsg = ref<string | null>(null)

async function handleSubmit() {
  loading.value = true
  result.value = null
  errorMsg.value = null
  try {
    result.value = await execute(baseUrl.value, props.endpoint, values.value, apiKey.value)
  } catch (e) {
    errorMsg.value = e instanceof Error ? e.message : 'Network error — is the server running?'
  } finally {
    loading.value = false
  }
}

const methodColors: Record<string, string> = {
  GET: '#3b82f6',
  POST: '#22c55e',
  PUT: '#f59e0b',
  PATCH: '#8b5cf6',
  DELETE: '#ef4444'
}
</script>

<template>
  <div class="endpoint-panel">
    <div class="endpoint-header">
      <span
        data-testid="method-badge"
        class="method-badge"
        :style="{ background: methodColors[endpoint.method] ?? '#6b7280' }"
      >
        {{ endpoint.method }}
      </span>
      <span class="path">{{ endpoint.path }}</span>
    </div>
    <p v-if="endpoint.description" class="description">{{ endpoint.description }}</p>

    <form @submit.prevent="handleSubmit">
      <div v-for="param in endpoint.params" :key="param.name" class="field">
        <label>
          {{ param.name }}
          <span v-if="param.required" data-testid="required-marker" class="required">*</span>
        </label>
        <input
          v-model="values[param.name]"
          type="text"
          :placeholder="param.description"
          :data-testid="`param-${param.name}`"
        />
      </div>
      <button type="submit" :disabled="loading" class="send-btn">
        {{ loading ? 'Sending...' : `Send ${endpoint.method}` }}
      </button>
    </form>

    <div v-if="errorMsg" class="response error" data-testid="response-error">
      {{ errorMsg }}
    </div>
    <div
      v-if="result"
      class="response"
      :class="result.status >= 200 && result.status < 300 ? 'success' : 'error'"
      data-testid="response-result"
    >
      <span class="status-code">{{ result.status }}</span>
      <pre>{{ JSON.stringify(result.body, null, 2) }}</pre>
    </div>
  </div>
</template>

<style scoped>
.endpoint-panel {
  padding: 1rem;
  border-bottom: 1px solid #2a2a4e;
}
.endpoint-panel:last-child { border-bottom: none; }
.endpoint-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}
.method-badge {
  padding: 2px 8px;
  border-radius: 3px;
  font-size: 0.75rem;
  font-weight: bold;
  color: #000;
}
.path { color: #ccc; font-family: monospace; font-size: 0.9rem; }
.description { color: #aaa; font-size: 0.8rem; margin-bottom: 0.75rem; }
.field { margin-bottom: 0.75rem; }
.field label { display: block; color: #aaa; font-size: 0.8rem; margin-bottom: 0.25rem; }
.required { color: #ef4444; margin-left: 2px; }
.field input {
  width: 100%;
  background: #0f0f1a;
  border: 1px solid #333;
  border-radius: 4px;
  color: #fff;
  padding: 0.375rem 0.5rem;
  font-size: 0.875rem;
  box-sizing: border-box;
}
.send-btn {
  background: #7c8cf8;
  border: none;
  border-radius: 4px;
  color: #fff;
  padding: 0.4rem 1rem;
  font-size: 0.875rem;
  cursor: pointer;
  margin-top: 0.25rem;
}
.send-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.send-btn:hover:not(:disabled) { background: #6374f0; }
.response {
  margin-top: 0.75rem;
  border-radius: 4px;
  padding: 0.75rem;
  font-size: 0.8rem;
}
.response.success { background: #0f2a1a; border: 1px solid #22c55e; }
.response.error { background: #2a0f0f; border: 1px solid #ef4444; color: #fca5a5; }
.status-code { font-weight: bold; display: block; margin-bottom: 0.25rem; }
pre { margin: 0; font-family: monospace; white-space: pre-wrap; color: #86efac; }
.response.error pre { color: #fca5a5; }
</style>
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- src/components/EndpointPanel.test.ts`

Expected: PASS — 11 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/EndpointPanel.vue src/components/EndpointPanel.test.ts
git commit -m "feat: add EndpointPanel component with param form and response display"
```

---

## Task 9: Wire up App.vue (TDD)

**Files:**
- Modify: `src/App.vue`
- Create: `src/App.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/App.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import App from './App.vue'
import * as specModule from './api/spec'
import type { ApiSpec } from './types/spec'

const mockSpec: ApiSpec = {
  plugins: [
    {
      name: 'Messaging',
      description: 'Send messages',
      endpoints: []
    }
  ]
}

describe('App', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
  })

  it('calls fetchSpec on mount using the default base URL', async () => {
    vi.spyOn(specModule, 'fetchSpec').mockResolvedValue(mockSpec)
    mount(App)
    await flushPromises()
    expect(specModule.fetchSpec).toHaveBeenCalledWith('http://localhost:3000')
  })

  it('renders plugin names returned by fetchSpec', async () => {
    vi.spyOn(specModule, 'fetchSpec').mockResolvedValue(mockSpec)
    const wrapper = mount(App)
    await flushPromises()
    expect(wrapper.text()).toContain('Messaging')
  })

  it('shows a banner error when fetchSpec throws', async () => {
    vi.spyOn(specModule, 'fetchSpec').mockRejectedValue(new Error('refused'))
    const wrapper = mount(App)
    await flushPromises()
    expect(wrapper.find('[data-testid="banner-error"]').exists()).toBe(true)
  })

  it('persists baseUrl to localStorage when it changes', async () => {
    vi.spyOn(specModule, 'fetchSpec').mockResolvedValue(mockSpec)
    const wrapper = mount(App)
    await flushPromises()

    await wrapper.find('[data-testid="server-url"]').setValue('http://localhost:4000')
    await flushPromises()

    expect(localStorage.getItem('agentPlayground.serverUrl')).toBe('http://localhost:4000')
  })

  it('persists apiKey to localStorage when it changes', async () => {
    vi.spyOn(specModule, 'fetchSpec').mockResolvedValue(mockSpec)
    const wrapper = mount(App)
    await flushPromises()

    await wrapper.find('[data-testid="api-key"]').setValue('my-api-key')

    expect(localStorage.getItem('agentPlayground.apiKey')).toBe('my-api-key')
  })

  it('restores baseUrl from localStorage on load', async () => {
    localStorage.setItem('agentPlayground.serverUrl', 'http://saved-server:9000')
    vi.spyOn(specModule, 'fetchSpec').mockResolvedValue(mockSpec)

    mount(App)
    await flushPromises()

    expect(specModule.fetchSpec).toHaveBeenCalledWith('http://saved-server:9000')
  })
})
```

- [ ] **Step 2: Run to verify tests fail**

Run: `npm test -- src/App.test.ts`

Expected: FAIL — tests referencing data-testid attributes that don't exist in the stub App.vue.

- [ ] **Step 3: Implement src/App.vue**

```vue
<script setup lang="ts">
import { ref, watch, provide, onMounted } from 'vue'
import type { PluginDef } from './types/spec'
import { fetchSpec } from './api/spec'
import ApiKeyBar from './components/ApiKeyBar.vue'
import PluginGrid from './components/PluginGrid.vue'

const STORAGE_KEY_URL = 'agentPlayground.serverUrl'
const STORAGE_KEY_API = 'agentPlayground.apiKey'

const baseUrl = ref(localStorage.getItem(STORAGE_KEY_URL) ?? 'http://localhost:3000')
const apiKey = ref(localStorage.getItem(STORAGE_KEY_API) ?? '')
const plugins = ref<PluginDef[]>([])
const status = ref<'connected' | 'disconnected' | 'loading' | 'unknown'>('unknown')
const bannerError = ref<string | null>(null)

provide('baseUrl', baseUrl)
provide('apiKey', apiKey)

watch(baseUrl, (val) => {
  localStorage.setItem(STORAGE_KEY_URL, val)
  loadSpec()
})
watch(apiKey, (val) => localStorage.setItem(STORAGE_KEY_API, val))

async function loadSpec() {
  if (!baseUrl.value) return
  status.value = 'loading'
  bannerError.value = null
  try {
    const spec = await fetchSpec(baseUrl.value)
    plugins.value = spec.plugins
    status.value = 'connected'
  } catch {
    plugins.value = []
    status.value = 'disconnected'
    bannerError.value = `Cannot reach server at ${baseUrl.value}`
  }
}

onMounted(loadSpec)
</script>

<template>
  <div class="app">
    <ApiKeyBar
      :base-url="baseUrl"
      :api-key="apiKey"
      :status="status"
      @update:base-url="baseUrl = $event"
      @update:api-key="apiKey = $event"
    />
    <div v-if="bannerError" class="banner-error" data-testid="banner-error">
      {{ bannerError }}
    </div>
    <div v-else-if="status === 'loading'" class="banner-info">
      Loading plugins...
    </div>
    <div v-else-if="!baseUrl" class="banner-info">
      Enter your server URL above to get started
    </div>
    <PluginGrid :plugins="plugins" />
  </div>
</template>

<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body { background: #0f0f1a; color: #fff; font-family: system-ui, sans-serif; min-height: 100vh; }
</style>

<style scoped>
.banner-error {
  background: #2a0f0f;
  border-bottom: 1px solid #ef4444;
  color: #fca5a5;
  padding: 0.5rem 1.5rem;
  font-size: 0.875rem;
}
.banner-info {
  background: #1a1a2e;
  border-bottom: 1px solid #333;
  color: #aaa;
  padding: 0.5rem 1.5rem;
  font-size: 0.875rem;
}
</style>
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- src/App.test.ts`

Expected: PASS — 6 tests pass.

- [ ] **Step 5: Run the full test suite**

Run: `npm test`

Expected: All tests pass (target: ~33 tests across all files).

- [ ] **Step 6: Commit**

```bash
git add src/App.vue src/App.test.ts
git commit -m "feat: wire up App.vue with global state, provide/inject, and localStorage persistence"
```

---

## Task 10: Verify build and finalize

**Files:**
- Modify: `.gitignore`

- [ ] **Step 1: Update .gitignore**

Add these lines to the existing `.gitignore` (create it if it doesn't exist):

```
node_modules/
dist/
.superpowers/
```

- [ ] **Step 2: Run the production build**

Run: `npm run build`

Expected: Output ends with `dist/index.html` and `dist/assets/...` files. No TypeScript errors.

- [ ] **Step 3: Verify the dev server starts**

Run: `npm run dev`

Expected: Output contains `Local:   http://localhost:5173/` (or similar Vite port). Open that URL in a browser — you should see the API key bar at the top and a grid area. Ctrl+C to stop.

- [ ] **Step 4: Commit**

```bash
git add .gitignore
git commit -m "chore: add .gitignore entries for node_modules, dist, and brainstorm session files"
```
