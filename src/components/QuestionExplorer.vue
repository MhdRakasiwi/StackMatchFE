<script setup>
import { ref, onMounted, watch } from 'vue'
import * as api from '../api/index.js'

const props = defineProps({
  // Tag yang dipilih dari filter utama di HomePage
  activeTag: {
    type: [String, null],
    default: null
  }
})

const emit = defineEmits(['select'])

const questions = ref([])
const tags = ref([])
const selectedTag = ref(null)
const isLoading = ref(false)
const error = ref('')

const fetchTags = async () => {
  try {
    const response = await api.getTags()
    tags.value = response.data.tags || response.data || []
  } catch (err) {
    console.error('Gagal mengambil tag untuk penjelajah:', err)
  }
}

const fetchRandom = async (tag = selectedTag.value) => {
  isLoading.value = true
  error.value = ''
  try {
    const response = await api.getRandom(tag, 5)
    questions.value = response.data.questions || response.data || []
  } catch (err) {
    console.error('Gagal mengambil data acak:', err)
    error.value = 'Gagal memuat pertanyaan'
  } finally {
    isLoading.value = false
  }
}

const handleTagChange = () => {
  fetchRandom(selectedTag.value)
}

const handleRefresh = () => {
  fetchRandom(selectedTag.value)
}

const handleSelect = (question) => {
  emit('select', question)
}

// Ketika filter tag utama di HomePage berubah, sinkronkan ke explorer
watch(() => props.activeTag, (newTag) => {
  selectedTag.value = newTag
  fetchRandom(newTag)
})

onMounted(() => {
  fetchTags()
  fetchRandom()
})
</script>

<template>
  <div class="explorer-panel">
    <div class="panel-header">
      <span class="panel-title">Jelajahi</span>
      <button 
        class="btn-refresh" 
        @click="handleRefresh" 
        :disabled="isLoading" 
        aria-label="Refresh"
      >
        <span :class="{ spinning: isLoading }">↻</span>
      </button>
    </div>

    <!-- Tag aktif indicator -->
    <div v-if="selectedTag" class="active-tag-banner">
      <span class="active-tag-label">Menampilkan:</span>
      <span class="active-tag-badge">{{ selectedTag }}</span>
      <button class="btn-clear-tag" @click="selectedTag = null; fetchRandom(null)" title="Tampilkan semua">✕</button>
    </div>

    <!-- Filter tag sederhana -->
    <select 
      class="tag-filter" 
      v-model="selectedTag" 
      @change="handleTagChange"
      :disabled="isLoading"
    >
      <option :value="null">Semua bahasa</option>
      <option 
        v-for="t in tags" 
        :key="t.tag" 
        :value="t.tag"
      >
        {{ t.tag }}{{ t.count ? ` (${t.count})` : '' }}
      </option>
    </select>

    <!-- Loading state -->
    <div v-if="isLoading" class="explorer-loading">
      <div v-for="i in 5" :key="i" class="skeleton-item"></div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="explorer-error">
      {{ error }}
    </div>

    <!-- List pertanyaan -->
    <ul v-else class="explorer-list">
      <li
        v-for="q in questions"
        :key="q.id"
        class="explorer-item"
        @click="handleSelect(q.question)"
      >
        <span class="explorer-question">{{ q.question }}</span>
        <span class="explorer-tag">{{ q.tag }}</span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.explorer-panel {
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

.btn-refresh {
  background-color: transparent;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  padding: 4px 8px;
  cursor: pointer;
  color: var(--color-text-secondary);
  font-size: 16px;
  line-height: 1;
  transition: all 0.15s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 28px;
  width: 28px;
}

.btn-refresh:hover:not(:disabled) {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.btn-refresh:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.spinning {
  display: inline-block;
  animation: spin 0.8s linear infinite;
}

/* Active tag banner */
.active-tag-banner {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background-color: rgba(37, 99, 235, 0.08);
  border: 1px solid rgba(37, 99, 235, 0.2);
  border-radius: 8px;
  margin-bottom: 10px;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-4px); }
  to   { opacity: 1; transform: translateY(0); }
}

.active-tag-label {
  font-size: 11px;
  color: var(--color-text-secondary);
  flex-shrink: 0;
}

.active-tag-badge {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 11px;
  font-weight: 600;
  color: var(--color-primary);
  background-color: rgba(37, 99, 235, 0.1);
  padding: 1px 7px;
  border-radius: 4px;
}

.btn-clear-tag {
  margin-left: auto;
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  font-size: 10px;
  padding: 2px 4px;
  border-radius: 4px;
  line-height: 1;
  transition: color 0.15s ease;
}

.btn-clear-tag:hover {
  color: var(--color-danger);
}

.tag-filter {
  width: 100%;
  padding: 6px 10px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background-color: var(--color-bg);
  color: var(--color-text);
  font-size: 13px;
  margin-bottom: 12px;
  cursor: pointer;
  outline: none;
  font-family: var(--font-body);
  transition: border-color 0.15s ease;
}

.tag-filter:focus {
  border-color: var(--color-primary);
}

.explorer-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.explorer-item {
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
  margin-bottom: 4px;
  border: 1px solid transparent;
  transition: all 0.15s ease;
}

.explorer-item:hover {
  background-color: var(--color-bg-secondary);
  border-color: var(--color-border);
}

.explorer-question {
  font-size: 13px;
  color: var(--color-text);
  display: block;
  line-height: 1.4;
  margin-bottom: 4px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.explorer-tag {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 10px;
  padding: 1px 6px;
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  color: var(--color-text-secondary);
  display: inline-block;
}

.explorer-loading {
  display: flex;
  flex-direction: column;
}

.skeleton-item {
  height: 52px;
  background: linear-gradient(
    90deg, 
    var(--color-border) 25%, 
    var(--color-bg-secondary) 50%, 
    var(--color-border) 75%
  );
  background-size: 200% 100%;
  border-radius: 8px;
  margin-bottom: 6px;
  animation: shimmer 1.5s infinite linear;
}

.explorer-error {
  text-align: center;
  color: var(--color-danger);
  font-size: 13px;
  padding: 1rem 0;
}

@keyframes shimmer {
  from {
    background-position: 200% 0;
  }
  to {
    background-position: -200% 0;
  }
}
</style>
