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
