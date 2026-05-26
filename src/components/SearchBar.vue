<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  modelValue: string
  topN: number
  loading: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'update:topN', value: number): void
  (e: 'submit'): void
}>()

// Inline error tracking
const showValidation = ref(false)

const queryText = computed({
  get: () => props.modelValue,
  set: (val) => {
    emit('update:modelValue', val)
    if (val.trim()) {
      showValidation.value = false
    }
  }
})

const localTopN = computed({
  get: () => props.topN,
  set: (val) => {
    let num = Number(val)
    if (num < 1) num = 1
    if (num > 20) num = 20
    emit('update:topN', num)
  }
})

const charCount = computed(() => queryText.value.length)
const isOverLimit = computed(() => charCount.value > 500)
const isEmpty = computed(() => !queryText.value.trim())

const validationMessage = computed(() => {
  if (isEmpty.value && showValidation.value) {
    return 'Question query cannot be empty.'
  }
  if (isOverLimit.value) {
    return `Query is too long. Limit is 500 characters (currently ${charCount.value}).`
  }
  return null
})

// Character counter warning classes
const countClass = computed(() => {
  if (charCount.value > 500) return 'text-danger'
  if (charCount.value > 450) return 'text-warning'
  return 'text-normal'
})

const handleSubmit = () => {
  if (isEmpty.value) {
    showValidation.value = true
    return
  }
  if (isOverLimit.value || props.loading) {
    return
  }
  emit('submit')
}

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
    e.preventDefault()
    handleSubmit()
  }
}
</script>

<template>
  <div class="search-bar-container">
    <form @submit.prevent="handleSubmit" novalidate>
      <div class="textarea-wrapper" :class="{ 'has-error': validationMessage, 'is-focused': false }">
        <textarea
          id="query-input"
          v-model="queryText"
          @keydown="handleKeyDown"
          placeholder="Describe your coding problem... e.g. how to reverse a list in Python"
          rows="4"
          aria-label="Coding question description"
          aria-required="true"
          :aria-invalid="validationMessage ? 'true' : 'false'"
          :aria-describedby="validationMessage ? 'validation-msg' : undefined"
          :disabled="props.loading"
        ></textarea>
        
        <div class="textarea-footer">
          <span class="shortcut-tip" aria-hidden="true">
            Press <kbd>Ctrl</kbd> + <kbd>Enter</kbd> to submit
          </span>
          <span 
            id="char-counter"
            :class="countClass"
            aria-label="Character count"
          >
            {{ charCount }} / 500
          </span>
        </div>
      </div>

      <!-- Inline validation alert -->
      <div 
        v-if="validationMessage" 
        id="validation-msg" 
        class="validation-alert"
        role="alert"
      >
        <i class="fa-solid fa-circle-exclamation" style="font-size: 16px; margin-right: 4px;"></i>
        <span>{{ validationMessage }}</span>
      </div>

      <div class="controls-row">
        <div class="topn-control">
          <label for="topn-slider" class="topn-label">
            Recommendations (<span class="mono">{{ localTopN }}</span>):
          </label>
          <div class="topn-inputs">
            <input
              id="topn-slider"
              type="range"
              min="1"
              max="20"
              v-model="localTopN"
              class="slider"
              aria-label="Number of recommendations slider"
              :disabled="props.loading"
            />
            <input
              id="topn-number"
              type="number"
              min="1"
              max="20"
              v-model="localTopN"
              class="number-input mono"
              aria-label="Number of recommendations input"
              :disabled="props.loading"
            />
          </div>
        </div>

        <button
          type="submit"
          class="submit-button"
          :disabled="props.loading || isOverLimit"
          :aria-label="props.loading ? 'Analyzing your question' : 'Find similar questions'"
        >
          <span v-if="props.loading" class="spinner" aria-hidden="true"></span>
          <span>{{ props.loading ? 'Analyzing...' : 'Find Similar Questions' }}</span>
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.search-bar-container {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1.25rem;
  box-shadow: var(--shadow);
  transition: border-color var(--transition);
}

.search-bar-container:focus-within {
  border-color: rgba(88, 166, 255, 0.4);
}

.textarea-wrapper {
  display: flex;
  flex-direction: column;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 0.5rem;
  transition: border-color var(--transition), box-shadow var(--transition);
}

.textarea-wrapper:focus-within {
  border-color: var(--border-focus);
  box-shadow: 0 0 0 1px var(--border-focus);
}

.textarea-wrapper.has-error {
  border-color: var(--score-low);
}

textarea {
  width: 100%;
  background: transparent;
  border: none;
  color: var(--text-primary);
  font-family: inherit;
  font-size: 0.95rem;
  resize: vertical;
  outline: none;
  padding: 0.5rem;
  line-height: 1.5;
}

.textarea-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  border-top: 1px solid rgba(48, 54, 61, 0.5);
  font-size: 0.75rem;
  color: var(--text-secondary);
  user-select: none;
}

.shortcut-tip kbd {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 3px;
  padding: 0.1rem 0.35rem;
  font-family: var(--font-mono);
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.3);
}

#char-counter {
  font-family: var(--font-mono);
  font-weight: 500;
}

.text-danger {
  color: var(--score-low);
  font-weight: bold;
}

.text-warning {
  color: var(--score-mid);
}

.text-normal {
  color: var(--text-secondary);
}

.validation-alert {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.75rem;
  padding: 0.5rem 0.75rem;
  background-color: var(--score-low-bg);
  border: 1px solid rgba(248, 81, 73, 0.3);
  color: #ff7b72;
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
}

.controls-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.25rem;
  gap: 1rem;
  flex-wrap: wrap;
}

.topn-control {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.topn-label {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.topn-inputs {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.slider {
  -webkit-appearance: none;
  appearance: none;
  width: 140px;
  height: 6px;
  border-radius: 3px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  outline: none;
  cursor: pointer;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--accent);
  transition: transform var(--transition), background-color var(--transition);
}

.slider::-webkit-slider-thumb:hover {
  transform: scale(1.2);
  background: var(--accent-hover);
}

.number-input {
  width: 54px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  color: var(--text-primary);
  border-radius: var(--radius-sm);
  padding: 0.25rem 0.4rem;
  text-align: center;
  font-size: 0.85rem;
}

.number-input::-webkit-inner-spin-button,
.number-input::-webkit-outer-spin-button {
  opacity: 1;
}

.submit-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: var(--accent);
  color: #ffffff;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  padding: 0.6rem 1.25rem;
  font-family: inherit;
  font-weight: 500;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color var(--transition), transform 0.1s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.submit-button:hover:not(:disabled) {
  background: var(--accent-hover);
}

.submit-button:active:not(:disabled) {
  transform: scale(0.98);
}

.submit-button:disabled {
  background: var(--border);
  color: var(--text-secondary);
  cursor: not-allowed;
  box-shadow: none;
}

@media (max-width: 576px) {
  .controls-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .topn-control {
    width: 100%;
  }

  .topn-inputs {
    justify-content: space-between;
  }
  
  .slider {
    flex: 1;
  }

  .submit-button {
    width: 100%;
  }
}
</style>
