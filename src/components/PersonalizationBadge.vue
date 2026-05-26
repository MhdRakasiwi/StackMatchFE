<script setup>
import { computed } from 'vue'

const props = defineProps({
  applied: {
    type: Boolean,
    default: false
  },
  boost: {
    type: Number,
    default: null
  }
})

const isVisible = computed(() => {
  return props.applied === true && props.boost !== null && props.boost >= 0.05
})
</script>

<template>
  <span
    v-if="isVisible"
    class="personalization-badge"
    title="Hasil ini diprioritaskan berdasarkan preferensi pencarianmu"
  >
    ✦ Dipersonalisasi
  </span>
</template>

<style scoped>
.personalization-badge {
  display: inline-flex;
  align-items: center;
  background-color: rgba(37, 99, 235, 0.08);
  color: var(--color-primary);
  border: 1px solid rgba(37, 99, 235, 0.2);
  border-radius: 4px;
  font-size: 11px;
  padding: 2px 8px;
  font-weight: 500;
  cursor: help;
  user-select: none;
  font-family: var(--font-body);
}

:global(.dark) .personalization-badge {
  background-color: rgba(59, 130, 246, 0.15);
  border-color: rgba(59, 130, 246, 0.25);
}
</style>
