<script setup lang="ts">
import { ref, onMounted, watch, computed, nextTick, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import { useSearchStore } from '../stores/search.js'
import useHistory from '../composables/useHistory.js'
import { formatTime } from '../utils/format.js'

interface HistoryItem {
  query: string
  tag: string | null
  timestamp: string
}

const authStore = useAuthStore()
const searchStore = useSearchStore()
const router = useRouter()
const { getHistory, removeHistory, clearHistory } = useHistory()

const isCollapsed = ref<boolean>(false)
const history = ref<HistoryItem[]>([])
const isDark = ref<boolean>(false)

const showSearchModal = ref<boolean>(false)
const modalQuery = ref<string>('')
const activeIndex = ref<number>(0)
const modalInputRef = ref<HTMLInputElement | null>(null)

const emit = defineEmits(['collapse'])

const refreshHistory = () => {
  history.value = getHistory() as HistoryItem[]
}

onMounted(() => {
  // Load collapse state
  const savedCollapse = localStorage.getItem('sm_sidebar_collapsed')
  isCollapsed.value = savedCollapse === 'true'
  emit('collapse', isCollapsed.value)

  // Load theme state
  const savedTheme = localStorage.getItem('sm_theme')
  if (savedTheme === 'dark') {
    isDark.value = true
    document.documentElement.classList.add('dark')
  } else if (savedTheme === 'light') {
    isDark.value = false
    document.documentElement.classList.remove('dark')
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    isDark.value = prefersDark
    document.documentElement.classList.toggle('dark', prefersDark)
  }

  refreshHistory()
  window.addEventListener('keydown', handleGlobalShortcut)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleGlobalShortcut)
})

// Watch search store refresh trigger to update history in real-time
watch(
  () => searchStore.historyRefreshTrigger,
  () => {
    refreshHistory()
  },
)

// Watch user state to reload history when logging in / logging out
watch(
  () => authStore.user,
  () => {
    refreshHistory()
  },
)

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
  localStorage.setItem('sm_sidebar_collapsed', String(isCollapsed.value))
  emit('collapse', isCollapsed.value)
}

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

const handleSelectHistory = (item) => {
  searchStore.triggerSearch(item.query, item.tag)
  router.push('/')
}

const handleRemoveHistory = (index) => {
  removeHistory(index)
  refreshHistory()
}

const handleClearHistory = () => {
  if (confirm('Hapus semua riwayat pencarian?')) {
    clearHistory()
    history.value = []
  }
}

const handleLogout = async () => {
  await authStore.logout()
}

const handleNewChat = () => {
  searchStore.newChat()
  router.push('/')
}

const handleFocusSearch = () => {
  openSearchModal()
}

const openSearchModal = () => {
  showSearchModal.value = true
  modalQuery.value = ''
  activeIndex.value = 0
  nextTick(() => {
    if (modalInputRef.value) {
      modalInputRef.value.focus()
    }
  })
}

const closeSearchModal = () => {
  showSearchModal.value = false
}

const filteredItems = computed(() => {
  const q = modalQuery.value.trim().toLowerCase()
  if (!q) {
    return history.value.slice(0, 5)
  }
  return history.value.filter(
    (item) =>
      item.query.toLowerCase().includes(q) || (item.tag && item.tag.toLowerCase().includes(q)),
  )
})

const exactMatchInHistory = computed(() => {
  const q = modalQuery.value.trim().toLowerCase()
  return history.value.some((item) => item.query.toLowerCase() === q)
})

const submitNewSearch = () => {
  const q = modalQuery.value.trim()
  if (q) {
    searchStore.triggerSearch(q)
    closeSearchModal()
    router.push('/')
  }
}

const selectHistoryItem = (item) => {
  searchStore.triggerSearch(item.query, item.tag)
  closeSearchModal()
  router.push('/')
}

const handleModalKeydown = (e) => {
  const hasNewOption = modalQuery.value.trim() && !exactMatchInHistory.value ? 1 : 0
  const listLength = filteredItems.value.length + hasNewOption

  if (e.key === 'ArrowDown') {
    e.preventDefault()
    activeIndex.value = (activeIndex.value + 1) % listLength
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    activeIndex.value = (activeIndex.value - 1 + listLength) % listLength
  } else if (e.key === 'Enter') {
    e.preventDefault()
    if (listLength === 0) return
    if (hasNewOption && activeIndex.value === 0) {
      submitNewSearch()
    } else {
      const itemIdx = hasNewOption ? activeIndex.value - 1 : activeIndex.value
      if (filteredItems.value[itemIdx]) {
        selectHistoryItem(filteredItems.value[itemIdx])
      }
    }
  } else if (e.key === 'Escape') {
    closeSearchModal()
  }
}

const handleGlobalShortcut = (e) => {
  if (!authStore.isLoggedIn) return
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault()
    if (showSearchModal.value) {
      closeSearchModal()
    } else {
      openSearchModal()
    }
  }
}
</script>

<template>
  <aside class="app-sidebar" :class="{ collapsed: isCollapsed }">
    <!-- Header: Logo & Toggle -->
    <div class="sidebar-header" :class="{ 'collapsed-header': isCollapsed }">
      <div class="logo-wrap" v-if="!isCollapsed">
        <img src="../assets/logo2.png" alt="Logo" class="logo-img-sidebar expanded-logo-img" />
        <span class="logo-text">StackMatch</span>
      </div>
      <button
        class="btn-toggle-collapse"
        @click="toggleCollapse"
        title="Sembunyikan/Tampilkan Sidebar"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="sidebar-toggle-icon"
        >
          <rect width="18" height="18" x="3" y="3" rx="2" />
          <path d="M9 3v18" />
        </svg>
      </button>
    </div>

    <!-- Actions: New Chat & Search -->
    <div class="sidebar-actions">
      <button class="btn-new-chat" @click="handleNewChat" title="Mulai Rekomendasi Baru">
        <i class="fa-solid fa-plus"></i>
        <span v-if="!isCollapsed">New chat</span>
      </button>

      <button class="btn-action-item" @click="handleFocusSearch" title="Cari Rekomendasi">
        <i class="fa-solid fa-magnifying-glass"></i>
        <span v-if="!isCollapsed">Search</span>
      </button>

      <RouterLink to="/collections" class="btn-action-item" title="Koleksi Saya">
        <i class="fa-solid fa-bookmark"></i>
        <span v-if="!isCollapsed">Koleksi Saya</span>
      </RouterLink>
    </div>

    <!-- History / Recents Section -->
    <div class="sidebar-history-section">
      <div class="history-header" v-if="!isCollapsed">
        <span class="history-title">Recents</span>
        <button
          v-if="history.length > 0"
          class="btn-clear-all"
          @click="handleClearHistory"
          title="Hapus Semua Riwayat"
        >
          Hapus
        </button>
      </div>

      <div class="history-scroll-container">
        <div v-if="history.length === 0 && !isCollapsed" class="history-empty">
          Belum ada riwayat
        </div>

        <ul class="history-list">
          <li
            v-for="(item, index) in history"
            :key="index"
            class="history-item"
            :class="{ 'collapsed-item': isCollapsed }"
          >
            <div
              class="history-item-clickable"
              @click="handleSelectHistory(item)"
              :title="item.query"
            >
              <i class="history-icon fa-regular fa-comment"></i>
              <div class="history-info" v-if="!isCollapsed">
                <span class="history-query-text">{{ item.query }}</span>
                <span class="history-time-text" v-if="item.tag">[{{ item.tag }}]</span>
              </div>
            </div>
            <button
              v-if="!isCollapsed"
              class="btn-delete-history"
              @click.stop="handleRemoveHistory(index)"
              title="Hapus riwayat ini"
            >
              <i class="fa-solid fa-xmark"></i>
            </button>
          </li>
        </ul>
      </div>
    </div>

    <!-- Bottom Section: Dark Mode Toggle & Profile -->
    <div class="sidebar-footer">
      <!-- Dark mode toggle -->
      <button
        class="btn-action-item footer-toggle"
        @click="toggleDark"
        :title="isDark ? 'Mode Terang' : 'Mode Gelap'"
      >
        <span class="footer-icon-wrap">
          <i v-if="isDark" class="fa-solid fa-sun"></i>
          <i v-else class="fa-solid fa-moon"></i>
        </span>
        <span v-if="!isCollapsed">{{ isDark ? 'Mode Terang' : 'Mode Gelap' }}</span>
      </button>

      <!-- User Profile -->
      <div class="user-profile-box" v-if="authStore.isLoggedIn">
        <div class="user-avatar" :title="authStore.user?.username || 'User'">
          {{ (authStore.user?.username || 'U').substring(0, 1).toUpperCase() }}
        </div>

        <div class="user-details" v-if="!isCollapsed">
          <span class="user-name" :title="authStore.user?.username || 'User'">
            {{ authStore.user?.username || 'User' }}
          </span>
        </div>

        <button class="btn-logout-sidebar" @click="handleLogout" title="Keluar">
          <i class="fa-solid fa-right-from-bracket"></i>
        </button>
      </div>
    </div>
  </aside>

  <!-- Modal Search / Command Palette -->
  <Transition name="fade">
    <div v-if="showSearchModal" class="search-modal-backdrop" @click="closeSearchModal">
      <div class="search-modal-card" @click.stop>
        <div class="search-modal-input-wrapper">
          <i class="search-modal-icon fa-solid fa-magnifying-glass"></i>
          <input
            ref="modalInputRef"
            v-model="modalQuery"
            type="text"
            placeholder="Search chats and projects..."
            class="search-modal-input"
            @keydown="handleModalKeydown"
          />
          <button class="search-modal-close-btn" @click="closeSearchModal" title="Tutup (Esc)">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div class="search-modal-results" v-if="filteredItems.length > 0 || modalQuery.trim()">
          <ul class="modal-results-list">
            <!-- Option to search new query if it's typed and not already in history -->
            <li
              v-if="modalQuery.trim() && !exactMatchInHistory"
              class="modal-result-item new-search-option"
              :class="{ active: activeIndex === 0 }"
              @click="submitNewSearch"
              @mouseenter="activeIndex = 0"
            >
              <i class="result-icon text-primary fa-solid fa-plus"></i>
              <div class="result-details">
                <span class="result-title">Mulai pencarian baru untuk "{{ modalQuery }}"</span>
                <span class="result-subtitle">Kirim ke StackMatch AI</span>
              </div>
              <span class="result-enter-badge">Enter</span>
            </li>

            <!-- Filtered history items -->
            <li
              v-for="(item, idx) in filteredItems"
              :key="idx"
              class="modal-result-item"
              :class="{
                active: activeIndex === (modalQuery.trim() && !exactMatchInHistory ? idx + 1 : idx),
              }"
              @click="selectHistoryItem(item)"
              @mouseenter="activeIndex = modalQuery.trim() && !exactMatchInHistory ? idx + 1 : idx"
            >
              <i class="result-icon fa-regular fa-comment"></i>
              <div class="result-details">
                <span class="result-title">{{ item.query }}</span>
                <span class="result-subtitle" v-if="item.tag"
                  >Tag: {{ item.tag }} &bull; {{ formatTime(item.timestamp) }}</span
                >
                <span class="result-subtitle" v-else>{{ formatTime(item.timestamp) }}</span>
              </div>
              <span class="result-enter-badge">Enter</span>
            </li>
          </ul>
        </div>
        <div v-else class="search-modal-empty">
          <p>Ketik untuk mencari riwayat atau membuat pertanyaan baru...</p>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.app-sidebar {
  width: 260px;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  background-color: var(--color-sidebar-bg);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  transition: width var(--transition-speed) cubic-bezier(0.4, 0, 0.2, 1);
  font-family: var(--font-body);
}

.app-sidebar.collapsed {
  width: 56px;
}

/* Header */
.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  height: 56px;
  border-bottom: 1px solid var(--color-border);
}

.sidebar-header.collapsed-header {
  justify-content: center;
  padding: 12px 0;
}

.logo-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo-img-sidebar {
  width: auto;
  display: block;
  object-fit: contain;
}

.expanded-logo-img {
  height: 32px;
}

.collapsed-logo-img {
  height: 26px;
}

.logo-text {
  font-size: 16px;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--color-text);
}

.btn-toggle-collapse {
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    background-color 0.15s ease,
    color 0.15s ease;
}

.btn-toggle-collapse:hover {
  background-color: var(--color-bg-secondary);
  color: var(--color-text);
}

/* Actions */
.sidebar-actions {
  padding: 12px 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  border-bottom: 1px solid var(--color-border);
}

.btn-new-chat {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
  width: 100%;
  padding: 10px 12px;
  background-color: var(--color-primary);
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.btn-new-chat:hover {
  background-color: var(--color-primary-hover);
}

.btn-action-item {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
  width: 100%;
  padding: 10px 12px;
  background: transparent;
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  text-decoration: none;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease;
}

.btn-action-item:hover {
  background-color: var(--color-bg-secondary);
  border-color: var(--color-text-secondary);
}

/* Collapsed variations */
.collapsed .btn-new-chat,
.collapsed .btn-action-item {
  justify-content: center;
  padding: 10px;
}

/* History / Recents Section */
.sidebar-history-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 16px 8px;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 8px 8px 8px;
}

.history-title {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-secondary);
}

.btn-clear-all {
  background: transparent;
  border: none;
  color: var(--color-danger);
  font-size: 11px;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;
}

.btn-clear-all:hover {
  background-color: rgba(220, 38, 38, 0.1);
}

.history-scroll-container {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

.history-empty {
  padding: 16px;
  text-align: center;
  font-size: 12px;
  color: var(--color-text-secondary);
}

.history-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.history-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 6px;
  transition: background-color 0.15s ease;
}

.history-item:hover {
  background-color: var(--color-bg-secondary);
}

.history-item-clickable {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  cursor: pointer;
  min-width: 0;
}

.history-icon {
  color: var(--color-text-secondary);
  flex-shrink: 0;
}

.history-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.history-query-text {
  font-size: 13px;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.history-time-text {
  font-size: 10px;
  color: var(--color-text-secondary);
  font-family: var(--font-mono);
}

.btn-delete-history {
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: 6px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition:
    opacity 0.15s ease,
    background-color 0.15s ease;
  margin-right: 4px;
}

.history-item:hover .btn-delete-history {
  opacity: 1;
}

.btn-delete-history:hover {
  background-color: rgba(220, 38, 38, 0.15);
  color: var(--color-danger);
}

.collapsed-item {
  justify-content: center;
}

.collapsed-item .history-item-clickable {
  justify-content: center;
}

/* Footer Section */
.sidebar-footer {
  padding: 12px 8px;
  border-top: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.footer-toggle {
  border: none;
  font-size: 13px;
  padding: 8px 12px;
}

.footer-icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-profile-box {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: 8px;
}

.collapsed .user-profile-box {
  justify-content: center;
  padding: 6px;
}

.user-avatar {
  width: 32px;
  height: 32px;
  background-color: var(--color-primary);
  color: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  flex-shrink: 0;
}

.user-details {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
}

.user-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-plan {
  font-size: 10px;
  color: var(--color-text-secondary);
}

.btn-logout-sidebar {
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: 6px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    color 0.15s ease,
    background-color 0.15s ease;
}

.btn-logout-sidebar:hover {
  color: var(--color-danger);
  background-color: rgba(220, 38, 38, 0.1);
}

.collapsed .btn-logout-sidebar,
.collapsed .user-details {
  display: none;
}

/* Search Modal / Command Palette */
.search-modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(4px);
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 15vh;
}

.search-modal-card {
  width: 100%;
  max-width: 600px;
  background-color: var(--color-card-bg);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.2),
    0 10px 10px -5px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: modalEnter 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes modalEnter {
  from {
    opacity: 0;
    transform: scale(0.96) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.search-modal-input-wrapper {
  display: flex;
  align-items: center;
  padding: 14px 18px;
  border-bottom: 1px solid var(--color-border);
  gap: 12px;
}

.search-modal-icon {
  color: var(--color-text-secondary);
  flex-shrink: 0;
}

.search-modal-input {
  flex: 1;
  background: transparent;
  border: none;
  font-size: 16px;
  color: var(--color-text);
  font-family: inherit;
  outline: none;
}

.search-modal-input::placeholder {
  color: var(--color-text-secondary);
  opacity: 0.7;
}

.search-modal-close-btn {
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    background-color 0.15s ease,
    color 0.15s ease;
}

.search-modal-close-btn:hover {
  background-color: var(--color-bg-secondary);
  color: var(--color-text);
}

.search-modal-results {
  max-height: 320px;
  overflow-y: auto;
  padding: 8px;
}

.modal-results-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.modal-result-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 8px;
  cursor: pointer;
  transition:
    background-color 0.1s ease,
    transform 0.1s ease;
}

.modal-result-item:hover,
.modal-result-item.active {
  background-color: var(--color-bg-secondary);
}

.modal-result-item.active {
  transform: translateX(2px);
}

.result-icon {
  color: var(--color-text-secondary);
  flex-shrink: 0;
}

.new-search-option .result-icon {
  color: var(--color-primary);
}

.result-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.result-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.result-subtitle {
  font-size: 11px;
  color: var(--color-text-secondary);
  margin-top: 2px;
}

.result-enter-badge {
  font-size: 10px;
  color: var(--color-text-secondary);
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  padding: 1px 6px;
  border-radius: 4px;
  font-family: var(--font-mono);
  opacity: 0;
  transition: opacity 0.15s ease;
}

.modal-result-item:hover .result-enter-badge,
.modal-result-item.active .result-enter-badge {
  opacity: 1;
}

.search-modal-empty {
  padding: 24px;
  text-align: center;
  font-size: 13px;
  color: var(--color-text-secondary);
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
