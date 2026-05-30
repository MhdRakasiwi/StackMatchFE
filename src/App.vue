<script setup>
import { onMounted, ref, onErrorCaptured } from 'vue'
import { useAuthStore } from './stores/auth.js'
import AppHeader from './components/AppHeader.vue'
import AppSidebar from './components/AppSidebar.vue'

const authStore = useAuthStore()
const appError = ref('')
const sidebarCollapsed = ref(false)
const isMobileSidebarOpen = ref(false)

onErrorCaptured((err, instance, info) => {
  console.error('[StackMatch Error]', err, info)
  appError.value = 'Terjadi kesalahan tak terduga. Silakan reload halaman.'
  return false
})

const reloadPage = () => {
  appError.value = ''
  window.location.reload()
}

const onSidebarCollapse = (collapsed) => {
  sidebarCollapsed.value = collapsed
}

const toggleMobileSidebar = () => {
  isMobileSidebarOpen.value = !isMobileSidebarOpen.value
}

const closeMobileSidebar = () => {
  isMobileSidebarOpen.value = false
}

onMounted(async () => {
  await authStore.initAuth()
})
</script>

<template>
  <div
    class="app-container"
    :class="{
      'has-sidebar': authStore.isLoggedIn,
      'sidebar-collapsed': sidebarCollapsed,
      'mobile-sidebar-open': isMobileSidebarOpen,
    }"
  >
    <!-- Header: Only for guest users -->
    <AppHeader v-if="!authStore.isLoggedIn && $route.path !== '/landing'" />

    <!-- Mobile topbar: Only for logged-in users on mobile -->
    <div v-if="authStore.isLoggedIn" class="mobile-topbar">
      <button class="hamburger-btn" @click="toggleMobileSidebar" aria-label="Buka menu">
        <span class="hamburger-icon" :class="{ open: isMobileSidebarOpen }">
          <span></span>
          <span></span>
          <span></span>
        </span>
      </button>
      <span class="mobile-topbar-title">StackMatch</span>
    </div>

    <!-- Sidebar: Only for logged in users -->
    <AppSidebar
      v-if="authStore.isLoggedIn"
      @collapse="onSidebarCollapse"
      :mobileOpen="isMobileSidebarOpen"
      @close="closeMobileSidebar"
    />

    <!-- Mobile backdrop overlay -->
    <div
      v-if="authStore.isLoggedIn && isMobileSidebarOpen"
      class="mobile-sidebar-backdrop"
      @click="closeMobileSidebar"
    ></div>

    <div v-if="appError" class="app-error-banner" role="alert">
      <span>⚠</span> {{ appError }}
      <button @click="reloadPage" class="reload-btn">Reload</button>
    </div>

    <main class="app-main">
      <RouterView v-slot="{ Component }">
        <Transition name="page-fade" mode="out-in">
          <component :is="Component" :key="$route.path" />
        </Transition>
      </RouterView>
    </main>
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
  padding-top: 0;
  transition: padding-left var(--transition-speed) cubic-bezier(0.4, 0, 0.2, 1);
}

/* Sidebar layout modifications */
.has-sidebar .app-main {
  padding-left: 260px;
}

.has-sidebar.sidebar-collapsed .app-main {
  padding-left: 56px;
}

/* Mobile topbar */
.mobile-topbar {
  display: none;
  align-items: center;
  gap: 12px;
  padding: 0 16px;
  height: 52px;
  background-color: var(--color-bg);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 50;
  flex-shrink: 0;
}

.mobile-topbar-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text);
}

.hamburger-btn {
  background: transparent;
  border: none;
  padding: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: background-color 0.15s ease;
}

.hamburger-btn:hover {
  background-color: var(--color-bg-secondary);
}

.hamburger-icon {
  display: flex;
  flex-direction: column;
  gap: 5px;
  width: 22px;
}

.hamburger-icon span {
  display: block;
  height: 2px;
  background-color: var(--color-text);
  border-radius: 2px;
  transition: all 0.25s ease;
  transform-origin: center;
}

.hamburger-icon.open span:nth-child(1) {
  transform: translateY(7px) rotate(45deg);
}

.hamburger-icon.open span:nth-child(2) {
  opacity: 0;
  transform: scaleX(0);
}

.hamburger-icon.open span:nth-child(3) {
  transform: translateY(-7px) rotate(-45deg);
}

/* Mobile overlay backdrop */
.mobile-sidebar-backdrop {
  display: none;
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
  backdrop-filter: blur(2px);
  animation: fadeInBackdrop 0.2s ease;
}

@keyframes fadeInBackdrop {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* App error banner */
.app-error-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #fee2e2;
  border-bottom: 1px solid #fca5a5;
  color: #b91c1c;
  padding: 10px 16px;
  font-size: 13px;
  z-index: 200;
}

.reload-btn {
  margin-left: auto;
  padding: 4px 10px;
  background-color: #b91c1c;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
}

/* Page transition */
.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.2s ease;
}
.page-fade-enter-from,
.page-fade-leave-to {
  opacity: 0;
}

/* ============================
   RESPONSIVE
   ============================ */
@media (max-width: 768px) {
  /* Show mobile topbar */
  .mobile-topbar {
    display: flex;
  }

  /* Show backdrop */
  .mobile-sidebar-backdrop {
    display: block;
  }

  /* Remove sidebar padding on mobile — sidebar is an overlay */
  .has-sidebar .app-main {
    padding-left: 0 !important;
  }

  .has-sidebar.sidebar-collapsed .app-main {
    padding-left: 0 !important;
  }
}
</style>
