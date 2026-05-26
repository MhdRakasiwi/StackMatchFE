<script setup>
import { computed } from 'vue'

const props = defineProps({
  score: {
    type: [Number, null],
    required: true
  }
})

const badge = computed(() => {
  if (props.score === null || props.score === undefined) {
    return {
      label: 'Belum dihitung',
      bg: 'var(--color-bg-secondary)',
      color: 'var(--color-text-secondary)',
      border: 'var(--color-border)'
    }
  }

  if (props.score > 0.7) {
    return {
      label: 'Sangat Relevan',
      bg: '#dcfce7',
      color: '#15803d',
      border: '#86efac'
    }
  } else if (props.score >= 0.4) {
    return {
      label: 'Cukup Relevan',
      bg: '#fef9c3',
      color: '#a16207',
      border: '#fde047'
    }
  } else {
    return {
      label: 'Kurang Relevan',
      bg: '#fee2e2',
      color: '#b91c1c',
      border: '#fca5a5'
    }
  }
})
</script>

<template>
  <span 
    class="badge" 
    :style="{ 
      backgroundColor: badge.bg, 
      color: badge.color, 
      borderColor: badge.border 
    }"
  >
    {{ badge.label }}
  </span>
</template>

<style scoped>
.badge {
  display: inline-block;
  padding: 3px 10px;
  border: 1px solid;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
}
</style>
