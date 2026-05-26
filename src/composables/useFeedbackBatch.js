import { ref, provide, inject } from 'vue'
import { fetchFeedbackBatch } from '../api/index.js'

const FEEDBACK_BATCH_KEY = 'feedback-batch'

export function provideFeedbackBatch() {
  const ratingsMap = ref({})

  const loadBatchFeedback = async (questionIds) => {
    if (!questionIds || questionIds.length === 0) return
    try {
      const ratings = await fetchFeedbackBatch(questionIds)
      ratingsMap.value = {
        ...ratingsMap.value,
        ...ratings
      }
    } catch (error) {
      console.error('Failed to load batch feedback:', error)
    }
  }

  const getRating = (questionId) => {
    if (questionId === null || questionId === undefined) {
      return { has_rated: false, rating: null }
    }
    return ratingsMap.value[String(questionId)] || { has_rated: false, rating: null }
  }

  const state = {
    ratingsMap,
    loadBatchFeedback,
    getRating
  }

  provide(FEEDBACK_BATCH_KEY, state)
  return state
}

export function useFeedbackBatch() {
  const state = inject(FEEDBACK_BATCH_KEY, null)
  return state
}
