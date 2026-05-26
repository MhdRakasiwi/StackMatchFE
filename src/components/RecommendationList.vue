<script setup lang="ts">
import { ref } from 'vue'
import RecommendationCard from './RecommendationCard.vue'
import SkeletonCard from './SkeletonCard.vue'

const props = defineProps<{
  results: Array<{
    id: number | string
    question: string
    score_fusion: number | null
    score_tfidf: number | null
    score_sbert: number | null
    tag: string
    answer_preview: string
  }>
  loading: boolean
  error: string | null
  lastQuery: string
}>()

const emit = defineEmits<{
  (e: 'select-example', queryText: string): void
  (e: 'retry'): void
}>()

// Preset examples rotation
const EXAMPLES = [
  "how to reverse a list in Python",
  "what is the difference between async and await in JavaScript",
  "how to handle null pointer exception in Java",
  "best way to center a div in CSS"
]

const exampleIndex = ref(0)

const handleTryExample = () => {
  const exampleText = EXAMPLES[exampleIndex.value] ?? ""
  emit('select-example', exampleText)
  // Rotate to next example for the next click
  exampleIndex.value = (exampleIndex.value + 1) % EXAMPLES.length
}
</script>

<template>
  <div class="results-wrapper">
    <!-- Header/Metadata details if questions are loaded -->
    <div v-if="!loading && !error && props.results.length > 0" class="results-header">
      <h2 class="results-title">
        Similar Questions <span class="results-count mono">({{ props.results.length }})</span>
      </h2>
      <p class="results-subtitle">
        Based on query: <span class="mono-query font-mono">"{{ props.lastQuery }}"</span>
      </p>
    </div>

    <!-- Live container for screen reader and styling -->
    <div 
      class="results-content-area" 
      aria-live="polite" 
      :aria-busy="props.loading ? 'true' : 'false'"
    >
      <!-- LOADING STATE -->
      <div v-if="props.loading" class="loading-state">
        <div class="loader-banner">
          <span class="spinner accent-spinner" aria-hidden="true"></span>
          <span class="analyzing-text mono">Analyzing your question...</span>
        </div>
        <div class="cards-grid">
          <SkeletonCard v-for="i in 3" :key="i" />
        </div>
      </div>

      <!-- ERROR STATE -->
      <div 
        v-else-if="props.error" 
        class="error-state"
        role="alert"
      >
        <div class="error-icon">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="48" height="48" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <h3 class="error-title">Recommendation Error</h3>
        <p class="error-msg">{{ props.error }}</p>
        <button 
          @click="emit('retry')" 
          class="retry-button"
          aria-label="Retry recommendation request"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="16" height="16" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          <span>Retry Last Search</span>
        </button>
      </div>

      <!-- EMPTY STATE (No Results & No Loading/Error) -->
      <div v-else-if="props.results.length === 0" class="empty-state">
        <div class="empty-icon">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="64" height="64" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
          </svg>
        </div>
        <h3 class="empty-title">No Recommendations Loaded</h3>
        <p class="empty-msg">No similar questions found or you haven't typed a query yet. Try rephrasing your search or click the button below to load an example question.</p>
        <button 
          @click="handleTryExample" 
          class="example-button"
          aria-label="Insert an example coding question"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="16" height="16" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 21m0 0l-.813-5.096L3 14.187m6 6.813l6.813-6.813M9 21V3m0 0L3.813 8.187M9 3l5.187 5.187" />
          </svg>
          <span>Try an Example Question</span>
        </button>
      </div>

      <!-- RESULTS LIST -->
      <div v-else class="cards-grid">
        <RecommendationCard 
          v-for="item in props.results" 
          :key="item.id"
          :item="item"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.results-wrapper {
  margin-top: 2rem;
}

.results-header {
  margin-bottom: 1.25rem;
  animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.results-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.results-count {
  font-size: 1rem;
  color: var(--accent);
}

.results-subtitle {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-top: 0.15rem;
}

.mono-query {
  color: var(--text-primary);
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  padding: 0.05rem 0.35rem;
  border-radius: 4px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.loader-banner {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  padding: 0.75rem 1rem;
  border-radius: var(--radius-sm);
  align-self: flex-start;
}

.accent-spinner {
  color: var(--accent);
}

.analyzing-text {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text-primary);
  letter-spacing: 0.05em;
}

.cards-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

/* ERROR STATE STYLING */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 3rem 1.5rem;
  background: var(--bg-secondary);
  border: 1px solid rgba(248, 81, 73, 0.2);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.error-icon {
  color: var(--score-low);
  margin-bottom: 1rem;
}

.error-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-primary);
}

.error-msg {
  font-size: 0.9rem;
  color: var(--text-secondary);
  max-width: 420px;
  margin: 0.5rem 0 1.5rem 0;
}

.retry-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(248, 81, 73, 0.1);
  border: 1px solid var(--score-low);
  color: #ff7b72;
  padding: 0.5rem 1.25rem;
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition);
}

.retry-button:hover {
  background: var(--score-low);
  color: #ffffff;
}

/* EMPTY STATE STYLING */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 4rem 1.5rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.empty-icon {
  color: var(--text-secondary);
  opacity: 0.5;
  margin-bottom: 1rem;
}

.empty-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-primary);
}

.empty-msg {
  font-size: 0.9rem;
  color: var(--text-secondary);
  max-width: 480px;
  margin: 0.5rem 0 1.5rem 0;
}

.example-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--bg-card);
  border: 1px solid var(--border);
  color: var(--text-primary);
  padding: 0.55rem 1.25rem;
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition);
}

.example-button:hover {
  border-color: var(--accent);
  background: var(--accent-transparent);
  color: var(--accent-hover);
}
</style>
