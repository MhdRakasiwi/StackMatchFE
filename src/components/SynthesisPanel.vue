<script setup>
import { ref } from 'vue'
import SimilarityBadge from './SimilarityBadge.vue'

const props = defineProps({
  synthesis: {
    type: String,
    default: '',
  },
  keyPoints: {
    type: Array,
    default: () => [],
  },
  confidence: {
    type: Number,
    default: null,
  },
  sourcesUsed: {
    type: Number,
    default: 0,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: null,
  },
})

// Persistent collapsed preference
const isCollapsed = ref(localStorage.getItem('sm_synthesis_collapsed') === 'true')

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
  localStorage.setItem('sm_synthesis_collapsed', String(isCollapsed.value))
}
</script>

<template>
  <div class="synthesis-panel" :class="{ 'has-error': props.error }">
    <div class="panel-header" @click="toggleCollapse">
      <div class="header-title">
        <span class="sparkle-icon"><i class="fa-solid fa-wand-magic-sparkles" style="color: var(--color-primary);"></i></span>
        <span class="title-text">Ringkasan AI</span>
        <SimilarityBadge
          v-if="props.confidence !== null && !props.isLoading && !props.error"
          :score="props.confidence"
          class="confidence-badge"
        />
      </div>
      <button class="btn-toggle" aria-label="Toggle panel">
        <i class="chevron-icon fa-solid fa-chevron-up" :class="{ rotated: isCollapsed }"></i>
      </button>
    </div>

    <!-- Collapsible content -->
    <div v-show="!isCollapsed" class="panel-content">
      <!-- Loading state skeleton -->
      <div v-if="props.isLoading" class="skeleton-container">
        <div class="skeleton-line line-1"></div>
        <div class="skeleton-line line-2"></div>
        <div class="skeleton-line line-3"></div>
      </div>

      <!-- Error state -->
      <div v-else-if="props.error" class="error-container">
        <p class="error-text">{{ props.error }}</p>
      </div>

      <!-- Content loaded -->
      <div v-else class="content-container">
        <p v-if="props.synthesis" class="synthesis-text">{{ props.synthesis }}</p>

        <ul v-if="props.keyPoints && props.keyPoints.length > 0" class="key-points-list">
          <li v-for="(point, idx) in props.keyPoints" :key="idx" class="key-point-item">
            {{ point }}
          </li>
        </ul>

        <div v-if="props.sourcesUsed > 0" class="panel-footer">
          Berdasarkan {{ props.sourcesUsed }} pertanyaan teratas
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.synthesis-panel {
  background-color: var(--color-card-bg);
  border: 1px solid var(--color-border);
  border-left: 3px solid var(--color-primary);
  border-radius: var(--radius-lg, 12px);
  padding: 1.25rem;
  margin-bottom: 1.5rem;
  box-shadow: var(--shadow-sm);
  transition: all 0.2s ease;
}

.synthesis-panel.has-error {
  border-left-color: var(--color-text-secondary);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  user-select: none;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sparkle-icon {
  font-size: 16px;
  display: flex;
  align-items: center;
}

.title-text {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
}

.confidence-badge {
  font-size: 11px;
}

.btn-toggle {
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.15s ease;
}

.btn-toggle:hover {
  background-color: var(--color-bg-secondary);
}

.chevron-icon {
  transition: transform 0.2s ease;
}

.chevron-icon.rotated {
  transform: rotate(180deg);
}

.panel-content {
  margin-top: 1rem;
}

/* Skeleton loader */
.skeleton-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skeleton-line {
  background: linear-gradient(
    90deg,
    var(--color-border) 25%,
    var(--color-bg-secondary) 50%,
    var(--color-border) 75%
  );
  background-size: 200% 100%;
  border-radius: 4px;
  animation: shimmer 1.5s infinite linear;
  height: 14px;
}

.line-1 {
  width: 95%;
}

.line-2 {
  width: 85%;
}

.line-3 {
  width: 60%;
}

@keyframes shimmer {
  from {
    background-position: 200% 0;
  }
  to {
    background-position: -200% 0;
  }
}

/* Error style */
.error-container {
  padding: 4px 0;
}

.error-text {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin: 0;
}

/* Content loaded styles */
.synthesis-text {
  font-size: 14px;
  color: var(--color-text);
  line-height: 1.6;
  margin: 0 0 1rem 0;
}

.key-points-list {
  list-style: none;
  padding: 0;
  margin: 0 0 1rem 0;
}

.key-point-item {
  position: relative;
  font-size: 13px;
  color: var(--color-text-secondary);
  line-height: 1.6;
  padding-left: 1.25rem;
  margin-bottom: 8px;
}

.key-point-item:last-child {
  margin-bottom: 0;
}

.key-point-item::before {
  content: '•';
  position: absolute;
  left: 4px;
  color: var(--color-primary);
  font-size: 16px;
  line-height: 1;
}

.panel-footer {
  font-size: 11px;
  color: var(--color-text-secondary);
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
}
</style>
