<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth.js'

const authStore = useAuthStore()

const isDark = ref(false)

onMounted(() => {
  const savedTheme = localStorage.getItem('sm_theme')
  
  if (savedTheme === 'dark') {
    isDark.value = true
    document.documentElement.classList.add('dark')
  } else if (savedTheme === 'light') {
    isDark.value = false
    document.documentElement.classList.remove('dark')
  } else {
    // If no preference stored, fallback to system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    isDark.value = prefersDark
    if (prefersDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  // System preference change listener
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  mediaQuery.addEventListener('change', (e) => {
    // Only apply system theme if there is no manual override
    if (!localStorage.getItem('sm_theme')) {
      isDark.value = e.matches
      document.documentElement.classList.toggle('dark', e.matches)
    }
  })
})

const toggleDark = () => {
  isDark.value = !isDark.value
  if (isDark.value) {
    document.documentElement.classList.add('dark')
    localStorage.setItem('sm_theme', 'dark')
  } else {
    document.documentElement.classList.remove('dark')
    localStorage.setItem('sm_theme', 'light')
  }
}

const handleLogout = async () => {
  await authStore.logout()
}
</script>

<template>
  <header class="app-header">
    <div class="header-inner">

      <!-- Logo -->
      <RouterLink to="/" class="logo">
        <img src="../assets/logo2.png" alt="Logo" class="logo-img" />
        <span class="logo-text">StackMatch</span>
      </RouterLink>

      <!-- Kanan: actions -->
      <div class="header-actions">

        <!-- Dark mode toggle -->
      <button
        class="btn-icon"
        @click="toggleDark"
        :aria-label="isDark ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'"
        :title="isDark ? 'Mode terang' : 'Mode gelap'"
      >
        <i v-if="isDark" class="fa-solid fa-sun"></i>
        <i v-else class="fa-solid fa-moon"></i>
      </button>

        <!-- Jika login: username + tombol logout -->
        <template v-if="authStore.isLoggedIn">
          <span class="username" :title="authStore.user?.username || 'User'">
            {{ authStore.user?.username || 'User' }}
          </span>
          <button class="btn-logout" @click="handleLogout">
            Keluar
          </button>
        </template>

        <!-- Jika belum login: tombol masuk -->
        <template v-else>
          <RouterLink to="/login" class="btn-login">Masuk</RouterLink>
        </template>

      </div>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background-color: var(--color-bg);
  border-bottom: 1px solid var(--color-border);
  backdrop-filter: blur(8px);
  transition: background-color var(--transition-speed), border-color var(--transition-speed);
}

.header-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
  height: 56px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  color: var(--color-text);
  transition: opacity var(--transition-speed);
}

.logo:hover {
  opacity: 0.85;
}

.logo-img {
  height: 32px;
  width: auto;
  display: block;
}

.logo-text {
  font-size: 17px;
  font-weight: 600;
  letter-spacing: -0.02em;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-icon {
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 6px 10px;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
  transition: border-color 0.15s ease, background-color var(--transition-speed);
  color: var(--color-text);
  display: flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  width: 36px;
}

.btn-icon:hover {
  border-color: var(--color-primary);
  background-color: var(--color-bg-secondary);
}

.username {
  font-size: 13px;
  color: var(--color-text-secondary);
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  background-color: var(--color-bg-secondary);
  padding: 4px 8px;
  border-radius: 6px;
  border: 1px solid var(--color-border);
}

.btn-logout {
  padding: 6px 14px;
  border: 1px solid var(--color-danger);
  color: var(--color-danger);
  background: transparent;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: var(--font-body);
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 32px;
}

.btn-logout:hover {
  background-color: var(--color-danger);
  color: #ffffff;
}

.btn-login {
  padding: 6px 16px;
  background-color: var(--color-primary);
  color: #ffffff;
  border-radius: 8px;
  font-size: 13px;
  text-decoration: none;
  font-weight: 500;
  transition: background-color 0.15s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  border: none;
}

.btn-login:hover {
  background-color: var(--color-primary-hover);
}

@media (max-width: 480px) {
  .username {
    display: none;
  }
  .header-inner {
    padding: 0 1rem;
  }
}
</style>
