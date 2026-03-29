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
