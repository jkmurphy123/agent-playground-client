# Agent Playground Client — Design Spec

**Date:** 2026-03-29
**Status:** Approved

## Overview

A Vue 3 dashboard that auto-discovers all plugins loaded on the agent-playground server and renders a friendly UI for each endpoint — parameter forms, execution buttons, and inline response display. No hardcoded plugin knowledge; everything is driven by a `/api-spec` manifest the server exposes.

---

## Server Changes Required (handoff to server team)

The server must expose one new endpoint:

```
GET /api-spec
```

- No authentication required
- Returns a JSON manifest of all loaded plugins and their endpoints
- Must include CORS headers so the browser client can fetch it

### Response schema

```json
{
  "plugins": [
    {
      "name": "Messaging",
      "description": "Send and retrieve messages in the shared world",
      "endpoints": [
        {
          "method": "POST",
          "path": "/actions/message",
          "description": "Send a message as your agent",
          "auth": true,
          "params": [
            {
              "name": "text",
              "in": "body",
              "type": "string",
              "required": true,
              "description": "The message text"
            }
          ]
        },
        {
          "method": "GET",
          "path": "/actions/messages",
          "description": "Fetch recent messages",
          "auth": false,
          "params": []
        }
      ]
    }
  ]
}
```

### Parameter `"in"` values

| Value | Meaning |
|-------|---------|
| `"body"` | JSON request body field |
| `"query"` | URL query string parameter |
| `"path"` | Path segment (e.g. `/agents/:id`) |

### What the server team needs to do

1. Add a `GET /api-spec` route in `src/index.ts` (or a dedicated `src/spec.ts` module)
2. Each plugin should export a metadata object alongside its Router describing its name, description, and endpoint list
3. `index.ts` collects plugin metadata and serves it at `/api-spec`
4. Ensure CORS is enabled for all routes (or at minimum `/api-spec` and all plugin routes)

---

## Client Architecture

**Stack:** Vue 3 (Composition API) + Vite + TypeScript
**State management:** Vue `ref`/`reactive` — no Pinia/Vuex needed at this scope
**Styling:** Plain CSS (scoped per component) — no UI framework

### Project structure

```
src/
├── main.ts                   # App entry, mounts Vue
├── App.vue                   # Root: ApiKeyBar + PluginGrid, holds global state
├── api/
│   ├── spec.ts               # Fetches /api-spec, returns typed manifest
│   └── client.ts             # Generic request executor (GET/POST, injects API key header)
├── components/
│   ├── ApiKeyBar.vue          # Sticky top bar: server URL + API key inputs
│   ├── PluginGrid.vue         # CSS grid of PluginCards
│   ├── PluginCard.vue         # Single plugin card, toggles expansion
│   └── EndpointPanel.vue      # Stacked param form + response display
└── types/
    └── spec.ts               # TypeScript interfaces matching /api-spec schema
```

### TypeScript interfaces (`src/types/spec.ts`)

```typescript
export interface ParamDef {
  name: string;
  in: 'body' | 'query' | 'path';
  type: string;
  required: boolean;
  description: string;
}

export interface EndpointDef {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description: string;
  auth: boolean;
  params: ParamDef[];
}

export interface PluginDef {
  name: string;
  description: string;
  endpoints: EndpointDef[];
}

export interface ApiSpec {
  plugins: PluginDef[];
}
```

---

## Data Flow

1. App loads → `api/spec.ts` fetches `{baseUrl}/api-spec` → stores `ApiSpec` in `App.vue` reactive state
2. `PluginGrid` receives the plugins array, renders one `PluginCard` per plugin
3. Clicking a card toggles its expanded state, revealing one `EndpointPanel` per endpoint
4. `EndpointPanel` renders input fields from `endpoint.params`, calls `api/client.ts` on submit
5. `client.ts` assembles the request: injects `X-API-Key` header if `endpoint.auth === true`, places params in body/query/path as specified
6. Response (status + body) is stored in local component state and displayed inline

---

## Component Details

### `ApiKeyBar.vue`

- Fixed at the top of the page (sticky)
- Two inputs: **Server URL** (default: `http://localhost:3000`) and **API Key**
- Both values persisted to `localStorage` and restored on load
- A status dot shows server reachability: pings `/api-spec` on load and whenever Server URL changes
  - Green = reachable, Red = unreachable, Grey = unknown/loading

### `PluginGrid.vue`

- Responsive CSS grid: 1 column on mobile, 2-3 on wider screens
- Passes each `PluginDef` to a `PluginCard`

### `PluginCard.vue`

- Shows plugin name, description, and endpoint count (e.g. "2 endpoints")
- Clicking the card header toggles expansion
- When expanded, renders one `EndpointPanel` per endpoint stacked vertically

### `EndpointPanel.vue`

- **Header:** Method badge (color-coded) + path + description
  - POST → green badge, GET → blue badge
- **Form:** One `<input>` per param, labeled, required fields marked with `*`
  - Auth endpoints do not show an API key field — it is injected automatically from global state
- **Execute button:** "Send {METHOD}" — e.g. "Send GET", "Send POST", "Send DELETE" (always matches the endpoint's method)
- **Response area** (appears after execution):
  - HTTP status code (green if 2xx, red otherwise)
  - Pretty-printed JSON response body
  - On network error: red error message

### `api/client.ts`

```typescript
// Signature (implementation detail for planning phase)
async function execute(
  baseUrl: string,
  endpoint: EndpointDef,
  values: Record<string, string>,
  apiKey: string
): Promise<{ status: number; body: unknown }>
```

- Constructs URL: interpolates path params, appends query params
- For POST/PUT/PATCH: sends remaining params as JSON body
- Injects `X-API-Key: {apiKey}` header when `endpoint.auth === true`

---

## Empty & Error States

| Situation | UI |
|-----------|-----|
| Server URL not set | Prompt: "Enter your server URL above to get started" |
| Server unreachable | Red banner: "Cannot reach server at {url}" |
| `/api-spec` returns empty plugins array | "No plugins found on this server" |
| Request succeeds (2xx) | Green status badge + JSON response |
| Request fails (4xx/5xx) | Red status badge + error body |
| Network error | Red: "Network error — is the server running?" |

---

## Persistence

- Server URL and API key stored in `localStorage` under keys `agentPlayground.serverUrl` and `agentPlayground.apiKey`
- No other state is persisted — plugin manifest is always fetched fresh on load
