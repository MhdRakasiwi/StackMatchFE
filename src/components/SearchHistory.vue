<script setup>
import { ref, onMounted, watch } from 'vue'
import useHistory from '../composables/useHistory.js'
import { formatTime } from '../utils/format.js'
import { useAuthStore } from '../stores/auth.js'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['select', 'update:modelValue'])

const { getHistory, removeHistory, clearHistory } = useHistory()
const authStore = useAuthStore()
const history = ref([])

const refresh = () => {
  history.value = getHistory()
}

onMounted(() => {
  refresh()
})

watch(() => authStore.user, () => {
  refresh()
})

const handleSelect = (item) => {
  emit('select', item.query, item.tag)
}

const handleRemove = (index) => {
  removeHistory(index)
  refresh()
}

const handleClear = () => {
  clearHistory()
  history.value = []
}

// Expose refresh function to be callable from parent component
defineExpose({
  refresh
})
</script>

<template>
  <div class="history-panel">
    <div class="panel-header">
      <span class="panel-title">Riwayat</span>
      <button 
        v-if="history.length > 0" 
        class="btn-clear" 
        @click="handleClear"
      >
        Hapus semua
      </button>
    </div>

    <div v-if="history.length === 0" class="empty-history">
      <p>Belum ada riwayat pencarian</p>
    </div>

    <ul v-else class="history-list">
      <li
        v-for="(item, index) in history"
        :key="index"
        class="history-item"
      >
        <div class="history-content" @click="handleSelect(item)">
          <span class="history-query" :title="item.query">{{ item.query }}</span>
          <div class="history-meta">
            <span v-if="item.tag" class="history-tag">{{ item.tag }}</span>
            <span class="history-time">{{ formatTime(item.timestamp) }}</span>
          </div>
        </div>
        <button 
          class="btn-remove" 
          @click.stop="handleRemove(index)" 
          aria-label="Hapus"
        >
          ×
        </button>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.history-panel {
  background-color: var(--color-sidebar-bg);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1rem;
  height: fit-content;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.panel-title {
  font-size: 13px;
  font-weight: 500;
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.btn-clear {
  font-size: 11px;
  color: var(--color-danger);
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  font-family: var(--font-body);
}

.btn-clear:hover {
  text-decoration: underline;
}

.empty-history {
  text-align: center;
  padding: 1.5rem 0;
  color: var(--color-text-secondary);
  font-size: 13px;
}

.history-list {
  list-style: none;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 6px;
  border-radius: 8px;
  margin-bottom: 4px;
  transition: background-color 0.15s ease;
}

.history-item:hover {
  background-color: var(--color-bg-secondary);
}

.history-content {
  flex: 1;
  padding: 8px 10px;
  cursor: pointer;
  min-width: 0; /* Ensures inner flex item can shrink/ellipsis correctly */
}

.history-query {
  font-size: 13px;
  color: var(--color-text);
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 160px;
}

.history-meta {
  display: flex;
  gap: 6px;
  margin-top: 3px;
  align-items: center;
}

.history-tag {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 10px;
  padding: 1px 6px;
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  color: var(--color-text-secondary);
}

.history-time {
  font-size: 10px;
  color: var(--color-text-secondary);
}

.btn-remove {
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: 4px 8px;
  font-size: 16px;
  border-radius: 4px;
  flex-shrink: 0;
  transition: all 0.15s ease;
}

.btn-remove:hover {
  color: var(--color-danger);
  background-color: var(--color-bg-secondary);
}
</style>
