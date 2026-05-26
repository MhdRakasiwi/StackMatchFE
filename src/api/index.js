import axios from 'axios'
import useToken from '../composables/useToken.js'

// Ambil BASE_URL secara dinamis dari env (Vite) atau gunakan default backend port 8000
const BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'

// ─── Axios Instance ───────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ─── Request Interceptor ─────────────────────────────────────────────────────
api.interceptors.request.use(
  async (config) => {
    // Sesuaikan pengecekan endpoint auth dengan path baru (/auth/...)
    const isAuthEndpoint =
      config.url?.includes('/auth/refresh') ||
      config.url?.includes('/auth/login')

    if (!isAuthEndpoint && useToken.isTokenExpiringSoon()) {
      const refreshTokenVal = useToken.getRefreshToken()
      if (refreshTokenVal) {
        try {
          // Menggunakan full url dinamis agar tidak terkena interceptor tak terhingga
          const response = await axios.post(`${BASE_URL}/auth/refresh`, { refresh_token: refreshTokenVal })
          const newAccessToken = response.data.access_token
          useToken.saveTokens(newAccessToken)
          config.headers['Authorization'] = `Bearer ${newAccessToken}`
          return config
        } catch (refreshError) {
          useToken.clearTokens()
          window.location.href = '/login'
          return Promise.reject(refreshError)
        }
      }
    }

    const token = useToken.getAccessToken()
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// ─── Response Interceptor ────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (!originalRequest) {
      return Promise.reject(error)
    }

    const isAuthEndpoint =
      originalRequest.url?.includes('/auth/refresh') ||
      originalRequest.url?.includes('/auth/login')

    // Jika 401 dari /auth/login, biarkan error bubble up ke caller
    if (error.response?.status === 401 && originalRequest.url?.includes('/auth/login')) {
      return Promise.reject(error)
    }

    // Jika 401 dan bukan dari endpoint auth
    if (error.response?.status === 401 && !isAuthEndpoint) {
      if (!originalRequest._retry) {
        originalRequest._retry = true
        const refreshTokenVal = useToken.getRefreshToken()

        if (!refreshTokenVal) {
          useToken.clearTokens()
          window.location.href = '/login'
          return Promise.reject(error)
        }

        try {
          // Perbaikan URL endpoint refresh
          const response = await axios.post(`${BASE_URL}/auth/refresh`, { refresh_token: refreshTokenVal })
          const newAccessToken = response.data.access_token
          
          useToken.saveTokens(newAccessToken)
          api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`
          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`

          return api(originalRequest)
        } catch (refreshError) {
          useToken.clearTokens()
          window.location.href = '/login'
          return Promise.reject(refreshError)
        }
      } else {
        useToken.clearTokens()
        window.location.href = '/login'
        return Promise.reject(error)
      }
    }

    return Promise.reject(error)
  },
)

// ─── Auth Endpoints (Prefix: /auth) ──────────────────────────────────────────

/**
 * Login dengan email dan password.
 */
export function login(email, password) {
  return api.post('/auth/login', { email, password })
}

/**
 * Register akun baru.
 */
export function register(username, email, password) {
  return api.post('/auth/register', { username, email, password })
}

/**
 * Logout (token dikirim otomatis via header).
 */
export function logout() {
  return api.post('/auth/logout', {})
}

/**
 * Refresh access token menggunakan refresh token.
 */
export function refreshToken(refresh_token) {
  return api.post('/auth/refresh', { refresh_token })
}

/**
 * Ambil profil user yang sedang login.
 */
export function getMe() {
  return api.get('/auth/me')
}

// ─── Recommendation & Search Endpoints (Prefix: /recommend) ─────────────────

/**
 * Rekomendasikan pertanyaan berdasarkan query.
 */
export function recommend(query, top_n = 5, lang = 'auto') {
  return api.post('/recommend', { query, top_n, lang })
}

/**
 * Cari pertanyaan dengan filter opsional.
 * Catatan: Endpoint ini berjalur /recommend/search di backend.
 */
export function search(query, tag = null, top_n = 5, lang = 'auto', min_score = 0.0) {
  return api.post('/recommend/search', { query, tag, top_n, lang, min_score })
}

/**
 * Sintesis jawaban rekomendasi menggunakan AI.
 */
export function synthesizeResults(query, results, language = 'id') {
  const formattedResults = (results || []).slice(0, 5).map((item) => ({
    question: item.question,
    answer_full: item.answer_full || item.answer_preview || '',
    score_fusion: item.score_fusion ?? 0,
    tag: item.tag || ''
  }))

  return api.post('/recommend/synthesize', {
    query,
    results: formattedResults,
    language
  })
}

// ─── Tag & Question Endpoints (Prefix: /data) ────────────────────────────────

/**
 * Ambil daftar semua tag yang tersedia.
 */
export function getTags() {
  return api.get('/data/tags')
}

/**
 * Ambil daftar pertanyaan dengan pagination dan filter tag opsional.
 */
export function getQuestions(limit = 20, offset = 0, tag = null) {
  const params = { limit, offset }
  if (tag) params.tag = tag
  return api.get('/data/questions', { params })
}

/**
 * Ambil pertanyaan secara acak.
 */
export function getRandom(tag = null, n = 5) {
  const params = { n }
  if (tag) params.tag = tag
  return api.get('/data/random', { params })
}

// ─── Translate Endpoint (Prefix: /data) ───────────────────────────────────────

/**
 * Terjemahkan teks.
 */
export function translate(text, target, source = 'auto') {
  return api.post('/data/translate', { text, target, source })
}

// ─── Feedback Endpoints (Prefix: /analytics) ──────────────────────────────────

/**
 * Kirim feedback untuk sebuah pertanyaan.
 */
export function postFeedback(question_id, query, rating, comment = '') {
  return api.post('/analytics/feedback', { question_id, query, rating, comment })
}

/**
 * Ambil feedback berdasarkan question_id.
 */
export function getFeedback(question_id) {
  return api.get('/analytics/feedback', { params: { question_id } })
}

/**
 * Ambil batch feedback berdasarkan question_ids (maksimal 50).
 */
export async function fetchFeedbackBatch(questionIds) {
  const ids = (questionIds || []).slice(0, 50)
  if (ids.length === 0) {
    return {}
  }
  const response = await api.get('/analytics/feedback/batch', {
    params: {
      question_ids: ids.join(',')
    }
  })
  return response.data?.ratings || {}
}

/**
 * Ambil preferensi pengguna (personalized weights).
 */
export function getPreferences() {
  return api.get('/analytics/preferences')
}

/**
 * Hapus preferensi pencarian/penggunaan pengguna.
 */
export function deletePreferences() {
  return api.delete('/analytics/preferences')
}

/**
 * Ambil daftar semua koleksi.
 */
export function getCollections() {
  return api.get('/collections')
}

/**
 * Buat koleksi baru.
 */
export function createCollection(name) {
  return api.post('/collections', { name })
}

/**
 * Hapus koleksi berdasarkan ID.
 */
export function deleteCollection(collectionId) {
  return api.delete(`/collections/${collectionId}`)
}

/**
 * Tambahkan item ke dalam koleksi.
 */
export function addToCollection(collectionId, item) {
  return api.post(`/collections/${collectionId}/items`, {
    question_id: item.question_id,
    question: item.question,
    answer_preview: item.answer_preview,
    tag: item.tag,
    score_fusion: item.score_fusion,
    note: item.note || ''
  })
}

/**
 * Hapus item dari dalam koleksi.
 */
export function removeFromCollection(collectionId, questionId) {
  return api.delete(`/collections/${collectionId}/items/${questionId}`)
}

/**
 * Ambil detail koleksi termasuk daftar item di dalamnya.
 */
export function getCollectionDetail(collectionId) {
  return api.get(`/collections/${collectionId}`)
}

/**
 * Ambil data trending: query populer, distribusi tag, dan statistik penggunaan.
 * Auth opsional – token dikirim otomatis jika ada via interceptor.
 */
export function getTrending() {
  return api.get('/analytics/trending')
}

// ─── Usage & System Endpoints (Prefix: /analytics & /data) ───────────────────

/**
 * Ambil histori penggunaan API (membutuhkan Auth).
 */
export function getUsage(limit = 20, offset = 0) {
  return api.get('/analytics/usage', { params: { limit, offset } })
}

/**
 * Cek health status API (menggunakan root healthcheck).
 */
export function getHealth() {
  return api.get('/health')
}

/**
 * Ambil health detail dari /data/health (status model ML).
 */
export function getDetailedHealth() {
  return api.get('/data/health')
}

/**
 * Ambil statistik sistem (Prefix: /data).
 */
export function getStats() {
  return api.get('/data/stats')
}

export default api