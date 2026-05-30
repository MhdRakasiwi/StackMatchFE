<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, null],
    default: null
  },
  tags: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue'])

const select = (tag) => {
  emit('update:modelValue', tag)
}

const capitalizeFirst = (str) => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

const totalCount = computed(() =>
  props.tags.reduce((sum, t) => sum + (t.count || 0), 0)
)
</script>

<template>
  <div class="tag-selector-wrap">
    <span class="selector-label">Pilih Bahasa Pemgrograman:</span>
    <div class="pill-container">
      <button
        class="tag-pill"
        :class="{ active: modelValue === null }"
        @click="select(null)"
      >
        Semua
        <span class="tag-count">{{ totalCount }}</span>
      </button>
      
      <button
        v-for="tagObj in tags"
        :key="tagObj.tag"
        class="tag-pill"
        :class="{ active: modelValue === tagObj.tag }"
        @click="select(tagObj.tag)"
      >
        {{ capitalizeFirst(tagObj.tag) }}
        <span v-if="tagObj.count" class="tag-count">{{ tagObj.count }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.tag-selector-wrap {
  margin-bottom: 8px;
}

.selector-label {
  display: block;
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-bottom: 8px;
}

.pill-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  border-radius: 999px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  background-color: transparent;
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
  outline: none;
}

.tag-pill.active {
  background-color: var(--color-primary);
  color: #ffffff;
  border-color: var(--color-primary);
}

.tag-pill:hover:not(.active) {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.tag-count {
  font-size: 10px;
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  padding: 0px 5px;
  border-radius: 999px;
  background-color: rgba(0, 0, 0, 0.12);
  line-height: 1.6;
  letter-spacing: 0;
}

.tag-pill.active .tag-count {
  background-color: rgba(255, 255, 255, 0.25);
}

.tag-pill:hover:not(.active) .tag-count {
  background-color: rgba(37, 99, 235, 0.12);
}
</style>
