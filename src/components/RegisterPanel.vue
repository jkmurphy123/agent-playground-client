<script setup lang="ts">
import { ref, inject } from 'vue'
import type { Ref } from 'vue'

const emit = defineEmits<{
  'api-key-received': [apiKey: string]
}>()

const baseUrl = inject<Ref<string>>('baseUrl')!

type Mode = 'name' | 'email'
const mode = ref<Mode>('name')
const name = ref('')
const description = ref('')
const email = ref('')
const loading = ref(false)
const result = ref<{ agentId: string; apiKey: string } | null>(null)
const error = ref<string | null>(null)

async function register() {
  loading.value = true
  error.value = null
  result.value = null
  try {
    const base = baseUrl.value.replace(/\/$/, '')
    const body = mode.value === 'email'
      ? { email: email.value }
      : { name: name.value, description: description.value }
    const res = await fetch(`${base}/agents/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    const data = await res.json()
    if (!res.ok) {
      error.value = data.error ?? `Error ${res.status}`
    } else {
      result.value = data
    }
  } catch {
    error.value = 'Network error — is the server running?'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="register-panel">
    <div class="mode-tabs">
      <button
        data-testid="mode-name"
        class="tab"
        :class="{ active: mode === 'name' }"
        @click="mode = 'name'"
      >
        Name &amp; Description
      </button>
      <button
        data-testid="mode-email"
        class="tab"
        :class="{ active: mode === 'email' }"
        @click="mode = 'email'"
      >
        Email
      </button>
    </div>

    <div class="form">
      <template v-if="mode === 'name'">
        <label>
          Name *
          <input data-testid="input-name" v-model="name" type="text" placeholder="My Agent" />
        </label>
        <label>
          Description *
          <input data-testid="input-description" v-model="description" type="text" placeholder="What this agent does" />
        </label>
      </template>
      <template v-else>
        <label>
          Email *
          <input data-testid="input-email" v-model="email" type="email" placeholder="agent@example.com" />
        </label>
      </template>

      <button
        data-testid="register-btn"
        class="register-btn"
        :disabled="loading"
        @click="register"
      >
        {{ loading ? 'Registering…' : 'Register' }}
      </button>
    </div>

    <div v-if="error" class="error" data-testid="register-error">{{ error }}</div>

    <div v-if="result" class="result">
      <div class="result-row">
        <span class="label">Agent ID</span>
        <span data-testid="result-agent-id" class="value">{{ result.agentId }}</span>
      </div>
      <div class="result-row">
        <span class="label">API Key</span>
        <span data-testid="result-api-key" class="value">{{ result.apiKey }}</span>
      </div>
      <button
        data-testid="use-api-key-btn"
        class="use-key-btn"
        @click="emit('api-key-received', result.apiKey)"
      >
        Use this API Key
      </button>
    </div>
  </div>
</template>

<style scoped>
.register-panel {
  background: #1a1a2e;
  border: 1px solid #333;
  border-radius: 8px;
  padding: 1rem 1.5rem;
  margin: 1rem 1.5rem;
}
.mode-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}
.tab {
  background: none;
  border: 1px solid #444;
  border-radius: 4px;
  color: #aaa;
  cursor: pointer;
  font-size: 0.8rem;
  padding: 0.25rem 0.75rem;
  transition: all 0.15s;
}
.tab.active {
  background: #2d2d4e;
  border-color: #6366f1;
  color: #a5b4fc;
}
.form {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 0.75rem;
}
label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  color: #aaa;
  font-size: 0.8rem;
}
input {
  background: #0f0f1a;
  border: 1px solid #333;
  border-radius: 4px;
  color: #fff;
  font-size: 0.875rem;
  min-width: 180px;
  padding: 0.3rem 0.5rem;
}
.register-btn {
  background: #4f46e5;
  border: none;
  border-radius: 4px;
  color: #fff;
  cursor: pointer;
  font-size: 0.875rem;
  padding: 0.35rem 1rem;
}
.register-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.error {
  background: #2a0f0f;
  border: 1px solid #ef4444;
  border-radius: 4px;
  color: #fca5a5;
  font-size: 0.8rem;
  margin-top: 0.75rem;
  padding: 0.5rem 0.75rem;
}
.result {
  background: #0f1a0f;
  border: 1px solid #22c55e;
  border-radius: 4px;
  margin-top: 0.75rem;
  padding: 0.75rem;
}
.result-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.4rem;
  font-size: 0.8rem;
}
.result-row .label { color: #aaa; min-width: 70px; }
.result-row .value { color: #86efac; font-family: monospace; word-break: break-all; }
.use-key-btn {
  background: #15803d;
  border: none;
  border-radius: 4px;
  color: #fff;
  cursor: pointer;
  font-size: 0.8rem;
  margin-top: 0.5rem;
  padding: 0.3rem 0.75rem;
}
</style>
