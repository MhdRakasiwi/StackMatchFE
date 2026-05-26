<script setup>
import { computed, ref, onMounted } from 'vue'
import * as api from '../api/index.js'

const props = defineProps({
  questionId: {
    type: [Number, String],
    default: null
  },
  query: {
    type: String,
    required: true
  },
  isLoggedIn: {
    type: Boolean,
    default: true
  },
  initialFeedback: {
    type: Object,
    default: null
  }
})

const currentRating = ref(0)
const hoveredRating = ref(0)
const isLoading = ref(false)
const hasRated = ref(false)
const existingRating = ref(null)

const hasValidQuestionId = computed(() => {
  return props.questionId !== '' && props.questionId !== null && props.questionId !== undefined
})

const canSubmit = computed(() => {
  return props.isLoggedIn && hasValidQuestionId.value && !hasRated.value && !isLoading.value
})

const helperText = computed(() => {
  if (hasRated.value) return `Kamu memberi nilai ${existingRating.value}/5`
  if (!props.isLoggedIn) return 'Login untuk memberi nilai'
  if (!hasValidQuestionId.value) return 'Feedback belum tersedia'
  return ''
})

onMounted(async () => {
  if (props.initialFeedback) {
    if (props.initialFeedback.has_rated) {
      hasRated.value = true
      existingRating.value = props.initialFeedback.rating
      currentRating.value = props.initialFeedback.rating
    }
    return
  }

  if (!props.isLoggedIn || !hasValidQuestionId.value) return

  try {
    const response = await api.getFeedback(props.questionId)
    if (response.data && response.data.has_rated) {
      hasRated.value = true
      existingRating.value = response.data.rating
      currentRating.value = response.data.rating
    }
  } catch (error) {
    // Tidak semua pertanyaan sudah punya feedback, jadi error ini tidak perlu ditampilkan.
  }
})

const submitRating = async (rating) => {
  if (!canSubmit.value) return

  isLoading.value = true
  currentRating.value = rating

  try {
    await api.postFeedback(props.questionId, props.query, rating)
    hasRated.value = true
    existingRating.value = rating
  } catch (error) {
    console.error('Gagal mengirim feedback:', error)
    currentRating.value = 0
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="feedback-wrap">
    <span class="feedback-label">Nilai relevansi:</span>
    <div
      class="stars"
      :class="{
        'stars-disabled': !canSubmit,
        'stars-loading': isLoading
      }"
    >
      <span
        v-for="i in 5"
        :key="i"
        class="star"
        :style="{ color: i <= (hoveredRating || currentRating) ? '#f59e0b' : 'var(--color-border)' }"
        @mouseenter="canSubmit && (hoveredRating = i)"
        @mouseleave="canSubmit && (hoveredRating = 0)"
        @click="submitRating(i)"
      >
        &#9733;
      </span>
    </div>
    <span v-if="helperText" class="rated-text">
      {{ helperText }}
    </span>
  </div>
</template>

<style scoped>
.feedback-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
  flex-wrap: wrap;
}

.feedback-label {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 11px;
  color: var(--color-text-secondary);
}

.stars {
  display: flex;
  align-items: center;
}

.stars-disabled {
  cursor: default;
  pointer-events: none;
}

.stars-loading {
  opacity: 0.5;
}

.star {
  font-size: 18px;
  cursor: pointer;
  transition: color 0.1s ease;
  line-height: 1;
  user-select: none;
}

.stars-disabled .star {
  cursor: default;
}

.rated-text {
  font-family: var(--font-body);
  font-size: 11px;
  color: var(--color-text-secondary);
}
</style>
