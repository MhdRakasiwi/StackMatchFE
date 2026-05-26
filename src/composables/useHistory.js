import { useAuthStore } from '../stores/auth.js'

function getStorageKey() {
  try {
    const authStore = useAuthStore()
    if (authStore && authStore.isLoggedIn && authStore.user && authStore.user.id) {
      return `sm_history_${authStore.user.id}`
    }
  } catch (error) {
    // Fallback jika Pinia belum siap saat inisialisasi awal
  }
  return 'sm_history_guest'
}

export function getHistory() {
  try {
    const key = getStorageKey()
    const data = localStorage.getItem(key)
    if (!data) return []
    const parsed = JSON.parse(data)
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.error('Error reading search history from localStorage:', error)
    return []
  }
}

export function addHistory(query, tag = null) {
  if (!query || !query.trim()) return

  const trimmedQuery = query.trim()
  let history = getHistory()

  // Remove duplicate items: same query (case-insensitive) AND same tag
  history = history.filter(
    (item) =>
      !(item.query.toLowerCase() === trimmedQuery.toLowerCase() &&
        (item.tag ?? null) === (tag ?? null))
  )

  // Insert new item at the beginning
  history.unshift({
    query: trimmedQuery,
    tag,
    timestamp: new Date().toISOString()
  })

  // Limit to 50 items
  if (history.length > 50) {
    history = history.slice(0, 50)
  }

  try {
    const key = getStorageKey()
    localStorage.setItem(key, JSON.stringify(history))
  } catch (error) {
    console.error('Error saving search history to localStorage:', error)
  }
}

export function removeHistory(index) {
  const history = getHistory()
  if (index >= 0 && index < history.length) {
    history.splice(index, 1)
    try {
      const key = getStorageKey()
      localStorage.setItem(key, JSON.stringify(history))
    } catch (error) {
      console.error('Error updating search history in localStorage:', error)
    }
  }
}

export function clearHistory() {
  try {
    const key = getStorageKey()
    localStorage.removeItem(key)
  } catch (error) {
    console.error('Error clearing search history from localStorage:', error)
  }
}

export default function useHistory() {
  return {
    getHistory,
    addHistory,
    removeHistory,
    clearHistory
  }
}
