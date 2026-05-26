/**
 * Format timestamp ISO string into a relative human-readable string.
 * @param {string} isoString 
 * @returns {string}
 */
export function formatTime(isoString) {
  if (!isoString) return ''
  const date = new Date(isoString)
  const now = new Date()
  const diffMs = now - date
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)

  if (diffSecs < 0) {
    return 'Baru saja'
  }

  if (diffSecs < 60) {
    return 'Baru saja'
  } else if (diffMins < 60) {
    return `${diffMins} menit lalu`
  } else if (diffHours < 24) {
    return `${diffHours} jam lalu`
  } else {
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }
}

/**
 * Truncate long strings to a specified limit.
 * @param {string} text 
 * @param {number} maxLength 
 * @returns {string}
 */
export function truncate(text, maxLength = 120) {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trimEnd() + '...'
}

/**
 * Capitalize first letter of a string.
 * @param {string} str 
 * @returns {string}
 */
export function capitalize(str) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Convert score range 0.0 - 1.0 to percentage string.
 * @param {number} value 
 * @returns {string}
 */
export function scoreToPercent(value) {
  const percent = Math.min(Math.max((value || 0) * 100, 0), 100)
  return percent.toFixed(1) + '%'
}
