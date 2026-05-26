<script setup>
import { onMounted, ref, onErrorCaptured } from 'vue'
import { useAuthStore } from './stores/auth.js'
import AppHeader from './components/AppHeader.vue'
import AppSidebar from './components/AppSidebar.vue'

const authStore = useAuthStore()
const appError = ref('')
const sidebarCollapsed = ref(false)

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

onMounted(async () => {
  await authStore.initAuth()
})
</script>

<template>
  <div 
    class="app-container" 
    :class="{ 
      'has-sidebar': authStore.isLoggedIn, 
      'sidebar-collapsed': sidebarCollapsed 
    }"
  >
    <!-- Header: Only for guest users (except on the landing page) -->
    <AppHeader v-if="!authStore.isLoggedIn && $route.path !== '/landing'" />
    
    <!-- Sidebar: Only for logged in users -->
    <AppSidebar v-if="authStore.isLoggedIn" @collapse="onSidebarCollapse" />
    
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

/* Responsive adjustments */
@media (max-width: 768px) {
  .has-sidebar .app-main {
    padding-left: 56px; /* Force collapsed size on mobile */
  }
}
</style>
