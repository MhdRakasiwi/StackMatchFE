<script setup>
import { computed } from 'vue'

const props = defineProps({
  label: {
    type: String,
    required: true
  },
  value: {
    type: Number,
    required: true
  },
  color: {
    type: String,
    required: true,
    validator: (val) => ['fusion', 'tfidf', 'sbert'].includes(val)
  }
})

const colorVar = computed(() => {
  switch (props.color) {
    case 'fusion':
      return 'var(--color-score-fusion)'
    case 'tfidf':
      return 'var(--color-score-tfidf)'
    case 'sbert':
      return 'var(--color-score-sbert)'
    default:
      return 'var(--color-primary)'
  }
})

const widthPercent = computed(() => {
  const percent = Math.min(Math.max(props.value * 100, 0), 100)
  return percent.toFixed(1) + '%'
})

const displayValue = computed(() => {
  return props.value.toFixed(2)
})
</script>

<template>
  <div class="score-bar-wrap">
    <div class="score-bar-meta">
      <span class="score-label">{{ label }}</span>
      <span class="score-value">{{ displayValue }}</span>
    </div>
    <div class="score-track">
      <div 
        class="score-fill" 
        :style="{ width: widthPercent, background: colorVar }"
      ></div>
    </div>
  </div>
</template>

<style scoped>
.score-bar-wrap {
  margin-bottom: 8px;
}

.score-bar-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.score-label {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 11px;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.score-value {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 11px;
  font-weight: 500;
  color: var(--color-text);
}

.score-track {
  height: 6px;
  background-color: var(--color-border);
  border-radius: 999px;
  overflow: hidden;
}

.score-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.5s ease;
}
</style>
