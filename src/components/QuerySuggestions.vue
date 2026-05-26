<script setup>
import { computed } from 'vue'

const props = defineProps({
  relatedQueries: {
    type: Array,
    default: () => []
  },
  relatedTags: {
    type: Array,
    default: () => []
  },
  isVisible: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['select-query', 'select-tag'])

const hasQueries = computed(() => props.relatedQueries && props.relatedQueries.length > 0)
const hasTags = computed(() => props.relatedTags && props.relatedTags.length > 0)
const shouldRender = computed(() => (hasQueries.value || hasTags.value) && props.isVisible)

const capitalizeFirst = (str) => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}
</script>

<template>
  <Transition name="slide-fade">
    <div v-if="shouldRender" class="suggestions-container">
      <!-- Section Coba Juga -->
      <div v-if="hasQueries" class="suggestion-section">
        <span class="suggestion-label">Coba juga:</span>
        <div class="chips-container">
          <button
            v-for="(q, idx) in props.relatedQueries"
            :key="'query-' + idx"
            class="query-chip"
            @click="emit('select-query', q)"
          >
            <i class="search-icon-small fa-solid fa-magnifying-glass" style="font-size: 11px;"></i>
            {{ q }}
          </button>
        </div>
      </div>

      <!-- Section Tag Terkait -->
      <div v-if="hasTags" class="suggestion-section">
        <span class="suggestion-label">Tag terkait:</span>
        <div class="chips-container">
          <button
            v-for="(tag, idx) in props.relatedTags"
            :key="'tag-' + idx"
            class="tag-chip"
            @click="emit('select-tag', tag)"
          >
            {{ capitalizeFirst(tag) }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.suggestions-container {
  border: none;
  padding-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.suggestion-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.suggestion-label {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 12px;
  color: var(--color-text-secondary);
}

.chips-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

/* Query Chips */
.query-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background-color: transparent;
  border: 1px solid var(--color-border);
  border-radius: 20px;
  padding: 4px 12px;
  font-size: 13px;
  color: var(--color-text);
  cursor: pointer;
  transition: background-color 0.15s ease;
  font-family: var(--font-body);
}

.query-chip:hover {
  background-color: var(--color-bg-secondary);
}

.search-icon-small {
  color: var(--color-text-secondary);
}

/* Tag Chips - following TagSelector.vue */
.tag-chip {
  display: inline-flex;
  align-items: center;
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

.tag-chip:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

/* Animation: fade + slide-down */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.2s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
