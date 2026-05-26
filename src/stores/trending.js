import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getTrending } from '../api/index.js'

const CACHE_TTL_MS = 5 * 60 * 1000 // 5 menit

export const useTrendingStore = defineStore('trending', () => {
  // ─── State ──────────────────────────────────────────────────────────────────
  const trendingQueries = ref([]) // [{query, count, tag}]
  const tagDistribution = ref([]) // [{tag, count, percentage}]
  const totalSearchesToday = ref(0)
  const totalSearchesWeek = ref(0)
  const activeUsersToday = ref(0)

  const isLoading = ref(false)
  const error = ref(null)
  const lastFetchedAt = ref(null)

  // ─── Computed ────────────────────────────────────────────────────────────────
  const hasData = computed(
    () => trendingQueries.value.length > 0 || tagDistribution.value.length > 0,
  )
  const isStale = computed(() => {
    if (!lastFetchedAt.value) return true
    return Date.now() - lastFetchedAt.value > CACHE_TTL_MS
  })

  // Top 3 queries, used by the Command Palette
  const topQueries = computed(() => trendingQueries.value.slice(0, 3))

  // ─── Actions ─────────────────────────────────────────────────────────────────
  async function fetchTrending(force = false) {
    if (!force && !isStale.value && hasData.value) return

    isLoading.value = true
    error.value = null

    try {
      const response = await getTrending()
      const data = response.data || {}

      trendingQueries.value = (data.trending_queries || []).slice(0, 5)
      tagDistribution.value = data.tag_distribution || []
      totalSearchesToday.value = data.total_searches_today || 0
      totalSearchesWeek.value = data.total_searches_week || 0
      activeUsersToday.value = data.active_users_today || 0
      lastFetchedAt.value = Date.now()
    } catch (err) {
      console.error('Gagal mengambil data trending:', err)
      error.value = 'Gagal memuat data trending'
    } finally {
      isLoading.value = false
    }
  }

  function $reset() {
    trendingQueries.value = []
    tagDistribution.value = []
    totalSearchesToday.value = 0
    totalSearchesWeek.value = 0
    activeUsersToday.value = 0
    isLoading.value = false
    error.value = null
    lastFetchedAt.value = null
  }

  return {
    trendingQueries,
    tagDistribution,
    totalSearchesToday,
    totalSearchesWeek,
    activeUsersToday,
    isLoading,
    error,
    lastFetchedAt,
    hasData,
    isStale,
    topQueries,
    fetchTrending,
    $reset,
  }
})
