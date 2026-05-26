import { ref, type Ref } from 'vue'
import * as apiModule from '../api/index'
import { enrichRecommendationIds } from '../utils/recommendationIds'

export interface RecommendationResult {
  id: number | string
  question: string
  score_fusion: number | null
  score_tfidf: number | null
  score_sbert: number | null
  tag: string
  answer_preview: string
}

export function useRecommendations() {
  const query = ref('')
  const topN = ref(5)
  const results: Ref<RecommendationResult[]> = ref([])
  const loading = ref(false)
  const error: Ref<string | null> = ref(null)
  const lastQuery = ref('')
  const apiAlive: Ref<boolean | null> = ref(null) // null = unknown, true = alive, false = down

  const checkHealth = async (): Promise<boolean> => {
    try {
      const response = await apiModule.getHealth()
      if (response.status === 200 && response.data?.status === 'ok') {
        apiAlive.value = true
        return true
      }
      apiAlive.value = false
      return false
    } catch {
      apiAlive.value = false
      return false
    }
  }

  const fetchRecommendations = async (customQuery: string | null = null): Promise<void> => {
    const activeQuery = customQuery !== null ? customQuery : query.value

    // Client-side validations
    if (!activeQuery || activeQuery.trim() === '') {
      error.value = 'Query tidak boleh kosong.'
      return
    }
    if (activeQuery.length > 500) {
      error.value = 'Query melebihi batas 500 karakter.'
      return
    }

    loading.value = true
    error.value = null
    lastQuery.value = activeQuery

    try {
      const response = await apiModule.recommend(activeQuery, topN.value)
      // Backend returns: { results: [...], query_translated: "...", total: n }
      const rawResults = (response.data.results as RecommendationResult[]) || []
      results.value = await enrichRecommendationIds(rawResults)
    } catch (err: unknown) {
      interface AxiosLikeError {
        response?: { status: number }
      }
      const isAxiosError = (e: unknown): e is AxiosLikeError =>
        typeof e === 'object' && e !== null && 'response' in e

      if (isAxiosError(err) && err.response) {
        const status = err.response.status
        if (status === 400) {
          error.value = 'Periksa input dan coba lagi.'
        } else if (status === 422) {
          error.value = 'Format permintaan tidak valid.'
        } else if (status === 503) {
          error.value = 'Model sedang dimuat. Coba lagi beberapa saat.'
        } else if (status === 500) {
          error.value = 'Mesin rekomendasi sedang bermasalah. Coba lagi nanti.'
        } else {
          error.value = `Error: ${status}. Terjadi kesalahan di server.`
        }
      } else {
        error.value = 'Tidak dapat terhubung ke server. Pastikan backend berjalan.'
      }
      results.value = []
    } finally {
      loading.value = false
    }
  }

  const retryLast = async (): Promise<void> => {
    if (lastQuery.value) {
      query.value = lastQuery.value
      await fetchRecommendations(lastQuery.value)
    }
  }

  return {
    query,
    topN,
    results,
    loading,
    error,
    lastQuery,
    apiAlive,
    checkHealth,
    fetchRecommendations,
    retryLast,
  }
}
