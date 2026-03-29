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
