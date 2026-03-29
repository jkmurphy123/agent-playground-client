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
