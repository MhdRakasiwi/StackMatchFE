<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  score: number
}>()

// Format the score to 2 decimal places
const formattedScore = computed(() => {
  return props.score.toFixed(2)
})

// Calculate percentage for progress bar (0.0 to 1.0 -> 0% to 100%)
const percentWidth = computed(() => {
  const percentage = Math.min(Math.max(props.score * 100, 0), 100)
  return `${percentage}%`
})

// Get status label based on score value
const scoreStatus = computed(() => {
  if (props.score > 0.7) return 'high'
  if (props.score >= 0.4) return 'mid'
  return 'low'
})

// Text description of the match quality
const matchLabel = computed(() => {
  if (props.score > 0.85) return 'Excellent Match'
  if (props.score > 0.7) return 'High Match'
  if (props.score >= 0.55) return 'Medium Match'
  if (props.score >= 0.4) return 'Fair Match'
  return 'Low Match'
})
</script>

<template>
  <div 
    class="score-container" 
    :class="`score-${scoreStatus}`"
    aria-label="Similarity score indicator"
  >
    <div class="badge-row">
      <span class="match-text" aria-hidden="true">{{ matchLabel }}</span>
      <div 
        class="score-badge mono" 
        :aria-label="`Similarity score is ${formattedScore} out of 1.00, which is a ${matchLabel}`"
      >
        {{ formattedScore }}
      </div>
    </div>
    <div class="progress-track" aria-hidden="true">
      <div class="progress-fill" :style="{ width: percentWidth }"></div>
    </div>
  </div>
</template>

<style scoped>
.score-container {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  min-width: 140px;
}

.badge-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
}

.match-text {
  font-size: 0.75rem;
  color: var(--text-secondary);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.score-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.15rem 0.5rem;
  font-size: 0.8rem;
  font-weight: 700;
  border-radius: 4px;
  border: 1px solid transparent;
}

.progress-track {
  width: 100%;
  height: 3px;
  background: rgba(48, 54, 61, 0.6);
  border-radius: 10px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 10px;
  transition: width 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

/* HIGH SCORE STYLING */
.score-high .score-badge {
  color: var(--score-high);
  background: var(--score-high-bg);
  border-color: rgba(63, 185, 80, 0.3);
}
.score-high .progress-fill {
  background: var(--score-high);
}

/* MID SCORE STYLING */
.score-mid .score-badge {
  color: var(--score-mid);
  background: var(--score-mid-bg);
  border-color: rgba(210, 153, 34, 0.3);
}
.score-mid .progress-fill {
  background: var(--score-mid);
}

/* LOW SCORE STYLING */
.score-low .score-badge {
  color: var(--score-low);
  background: var(--score-low-bg);
  border-color: rgba(248, 81, 73, 0.3);
}
.score-low .progress-fill {
  background: var(--score-low);
}
</style>
