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
