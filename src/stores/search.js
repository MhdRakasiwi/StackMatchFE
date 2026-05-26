import { defineStore } from 'pinia'
import * as api from '../api/index.js'
import { addHistory } from '../composables/useHistory.js'
import useToken from '../composables/useToken.js'
import { nextTick } from 'vue'
import { enrichRecommendationIds } from '../utils/recommendationIds.js'

export const useSearchStore = defineStore('search', {
  state: () => ({
    query: '',
    selectedTag: null,
    results: [],
    isLoading: false,
    error: '',
    hasSearched: false,
    historyRefreshTrigger: 0, // Used to trigger history refresh in sidebar
    limit: 5,
    synthesis: null,
    isSynthesizing: false,
    synthesisError: '',
    suggestions: { related_queries: [], related_tags: [] },
  }),

  actions: {
    async handleSearch() {
      const trimmed = this.query.trim()
      if (!trimmed) {
        this.focusSearchInput()
        return
      }

      if (this.query.length > 500) {
        this.error = 'Pertanyaan terlalu panjang (max 500 karakter)'
        return
      }

      this.isLoading = true
      this.error = ''
      this.hasSearched = true
      this.results = []
      this.clearSynthesis()
      this.suggestions = { related_queries: [], related_tags: [] }

      try {
        let response
        if (this.selectedTag) {
          response = await api.search(trimmed, this.selectedTag, this.limit)
        } else {
          response = await api.recommend(trimmed, this.limit)
        }

        const rawResults = response.data.results || response.data || []
        this.results = await enrichRecommendationIds(rawResults)

        // Populate suggestions
        this.suggestions = response.data.suggestions || { related_queries: [], related_tags: [] }

        const accessToken = useToken.getAccessToken()
        if (accessToken) {
          // Trigger synthesis in parallel
          this.isSynthesizing = true
          api
            .synthesizeResults(trimmed, this.results.slice(0, 5), 'id')
            .then((res) => {
              this.synthesis = res.data
              this.isSynthesizing = false
            })
            .catch((err) => {
              console.error('Failed to load synthesis:', err)
              this.synthesisError = 'Gagal memuat ringkasan'
              this.isSynthesizing = false
            })
        } else {
          this.synthesisError = 'Ringkasan AI tersedia untuk pengguna yang login.'
          this.isSynthesizing = false
        }

        // Save to history
        addHistory(trimmed, this.selectedTag)
        this.historyRefreshTrigger++
      } catch (err) {
        console.error('Gagal melakukan pencarian:', err)
        const status = err.response?.status
        const detail = err.response?.data?.detail
        if (status === 400) {
          // Tampilkan pesan spesifik dari backend jika ada
          const msg = (typeof detail === 'object' ? detail?.message : detail) || null
          this.error = msg || 'Input tidak valid. Periksa query dan tag.'
        } else if (status === 422) {
          this.error = 'Format permintaan tidak valid.'
        } else if (status === 500) {
          this.error = 'Server sedang bermasalah, coba lagi nanti.'
        } else if (status === 503) {
          this.error = 'Model sedang dimuat. Coba beberapa saat lagi.'
        } else {
          this.error = 'Gagal terhubung ke server. Periksa koneksi kamu.'
        }
      } finally {
        this.isLoading = false
      }
    },

    newChat() {
      this.query = ''
      this.selectedTag = null
      this.results = []
      this.error = ''
      this.hasSearched = false
      this.suggestions = { related_queries: [], related_tags: [] }
      this.clearSynthesis()
      this.focusSearchInput()
    },

    clearSynthesis() {
      this.synthesis = null
      this.isSynthesizing = false
      this.synthesisError = ''
    },

    triggerSuggestion(query, tag = null) {
      this.query = query
      if (tag !== null) {
        this.selectedTag = tag
      }
      this.handleSearch()
    },

    triggerSearch(q, tag = null) {
      this.query = q
      this.selectedTag = tag
      nextTick(() => {
        this.handleSearch()
      })
    },

    focusSearchInput() {
      nextTick(() => {
        const inputElement = document.querySelector('.search-input')
        if (inputElement) {
          inputElement.focus()
        }
      })
    },
  },
})
