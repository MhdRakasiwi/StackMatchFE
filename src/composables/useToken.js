export function getAccessToken() {
  if (typeof window !== 'undefined') {
    return sessionStorage.getItem('sm_access_token') || null
  }
  return null
}

export function getRefreshToken() {
  if (typeof window !== 'undefined') {
    return sessionStorage.getItem('sm_refresh_token') || null
  }
  return null
}

export function saveTokens(accessToken, refreshToken) {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('sm_access_token', accessToken)
    if (refreshToken) {
      sessionStorage.setItem('sm_refresh_token', refreshToken)
    }
  }
}

export function clearTokens() {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('sm_access_token')
    sessionStorage.removeItem('sm_refresh_token')
  }
}

export function isTokenExpiringSoon() {
  try {
    const token = getAccessToken()
    if (!token) return true

    const parts = token.split('.')
    if (parts.length < 2) return true

    // Decode JWT payload (Base64URL to Base64)
    let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    // Pad base64 if needed
    const pad = base64.length % 4
    if (pad) {
      if (pad === 1) return true
      base64 += new Array(5 - pad).join('=')
    }

    const payload = JSON.parse(atob(base64))
    if (!payload.exp) return true

    const expTimeMs = payload.exp * 1000
    const timeRemainingMs = expTimeMs - Date.now()

    // Expiring soon if remaining time is less than 5 minutes
    return timeRemainingMs < 5 * 60 * 1000
  } catch (error) {
    console.error('Error checking if token is expiring soon:', error)
    return true
  }
}

const useToken = {
  getAccessToken,
  getRefreshToken,
  saveTokens,
  clearTokens,
  isTokenExpiringSoon
}

export default useToken
