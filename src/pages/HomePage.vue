<script lang="ts" setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { storeToRefs } from 'pinia'
import * as api from '../api/index.js'
import usePageTitle from '../composables/usePageTitle.js'
import { useSearchStore } from '../stores/search.ts'
import { provideFeedbackBatch } from '../composables/useFeedbackBatch.js'
import { getRecommendationQuestionId } from '../utils/recommendationIds.js'

usePageTitle('Rekomendasi')
import RecommendationCard from '../components/RecommendationCard.vue'
import TagSelector from '../components/TagSelector.vue'
import SkeletonCard from '../components/SkeletonCard.vue'
import QuestionExplorer from '../components/QuestionExplorer.vue'
import SynthesisPanel from '../components/SynthesisPanel.vue'
import QuerySuggestions from '../components/QuerySuggestions.vue'
import TrendingPanel from '../components/TrendingPanel.vue'

const activeTab = ref<'explore' | 'trending'>('explore')
const isBottomSheetOpen = ref(false)

const searchStore = useSearchStore()
const {
  query,
  selectedTag,
  results,
  isLoading,
  error,
  hasSearched,
  limit,
  synthesis,
  isSynthesizing,
  synthesisError,
} = storeToRefs(searchStore)

const handleSelectSuggestionTag = (tag) => {
  searchStore.selectedTag = tag
  searchStore.handleSearch()
}

const { ratingsMap, loadBatchFeedback } = provideFeedbackBatch()
const isBatchLoading = ref(false)

watch(
  () => searchStore.isLoading,
  async (newIsLoading) => {
    if (newIsLoading) {
      isBatchLoading.value = true
    } else if (results.value.length > 0) {
      const ids = results.value
        .map((item) => getRecommendationQuestionId(item))
        .filter((id) => id !== null && id !== undefined)
      await loadBatchFeedback(ids)
      isBatchLoading.value = false
    } else {
      isBatchLoading.value = false
    }
  },
)

const tags = ref<string[]>([])

const charCount = computed(() => (query.value ? query.value.length : 0))

const sliderBackgroundStyle = computed(() => {
  const min = 1
  const max = 20
  const percentage = ((limit.value - min) / (max - min)) * 100
  return `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${percentage}%, var(--color-border) ${percentage}%, var(--color-border) 100%)`
})

const fetchTags = async () => {
  try {
    const response = await api.getTags()
    tags.value = response.data.tags || response.data || []
  } catch (err) {
    console.error('Gagal mengambil tag list:', err)
  }
}

const handleSearch = () => {
  searchStore.handleSearch()
}

const handleExplorerSelect = (question) => {
  searchStore.triggerSearch(question)
}

const handleKeydown = (event) => {
  if (event.key === 'Enter' && event.ctrlKey) {
    handleSearch()
  }
}

onMounted(() => {
  fetchTags()
  // Automatically focus on search input when homepage mounts
  searchStore.focusSearchInput()
})
</script>

<template>
  <div class="home-page">
    <div class="layout">
      <!-- MAIN WORKSPACE -->
      <main class="main-content">
        <!-- Search form -->
        <div class="search-box">
          <div class="search-options">
            <TagSelector v-model="selectedTag" :tags="tags" class="tag-selector-wrap" />

            <div class="textarea-wrap">
              <textarea
                v-model="query"
                placeholder="Tulis pertanyaan kamu di sini... (Ctrl+Enter untuk cari)"
                rows="3"
                maxlength="500"
                @keydown="handleKeydown"
                class="search-input"
              ></textarea>
              <span class="char-counter" :class="{ 'near-limit': charCount > 450 }">
                {{ charCount }}/500
              </span>
            </div>

            <div class="limit-slider-container">
              <div class="limit-label-wrap">
                <i class="results-icon fa-solid fa-list-ol"></i>
                <span class="limit-label">Results</span>
              </div>
              <input
                type="range"
                min="1"
                max="20"
                v-model.number="limit"
                class="limit-slider"
                :style="{ background: sliderBackgroundStyle }"
              />
              <span class="limit-value">{{ limit }}</span>
            </div>
          </div>

          <button class="btn-search" @click="handleSearch" :disabled="isLoading || isBatchLoading">
            {{ isLoading || isBatchLoading ? 'Mencari...' : 'Cari Rekomendasi' }}
          </button>
        </div>

        <!-- Query Suggestions -->
        <QuerySuggestions
          v-if="hasSearched && !isLoading && results.length > 0"
          :relatedQueries="searchStore.suggestions.related_queries"
          :relatedTags="searchStore.suggestions.related_tags"
          @select-query="searchStore.triggerSuggestion"
          @select-tag="handleSelectSuggestionTag"
        />

        <!-- AI Synthesis Panel -->
        <Transition name="fade">
          <SynthesisPanel
            v-if="hasSearched"
            :synthesis="synthesis?.synthesis || ''"
            :keyPoints="synthesis?.key_points || []"
            :confidence="synthesis?.confidence ?? undefined"
            :sourcesUsed="synthesis?.sources_used ?? 0"
            :isLoading="isSynthesizing"
            :error="synthesisError || undefined"
          />
        </Transition>

        <!-- Error state -->
        <div v-if="error" class="state-error" role="alert"><span><i class="fa-solid fa-triangle-exclamation"></i></span> {{ error }}</div>

        <!-- Loading state: 3 skeleton cards -->
        <div v-if="isLoading || isBatchLoading">
          <SkeletonCard v-for="i in 3" :key="i" />
        </div>

        <!-- Empty state: sudah search tapi hasil kosong -->
        <div
          v-else-if="
            hasSearched && !(isLoading || isBatchLoading) && results.length === 0 && !error
          "
          class="state-empty"
        >
          <p class="empty-icon"><i class="fa-solid fa-magnifying-glass"></i></p>
          <p class="empty-title">Tidak ada hasil ditemukan</p>
          <p class="empty-sub">Coba kata kunci yang berbeda atau hapus filter tag</p>
        </div>

        <!-- Hasil rekomendasi -->
        <div v-else>
          <p v-if="results.length > 0" class="result-count">
            {{ results.length }} rekomendasi ditemukan
          </p>
          <RecommendationCard
            v-for="item in results"
            :key="item.id"
            :item="item"
            :feedbackData="ratingsMap"
          />
        </div>

        <!-- Initial state: belum pernah search -->
        <div v-if="!hasSearched && !(isLoading || isBatchLoading)" class="state-initial">
          <p class="empty-icon"><i class="fa-solid fa-magnifying-glass" style="font-size: 3rem; color: var(--color-primary);"></i></p>
          <p class="initial-title">Temukan pertanyaan yang relevan</p>
          <p class="initial-sub">
            Masukkan pertanyaan kamu dan StackMatch akan merekomendasikan pertanyaan serupa dari
            database
          </p>
        </div>
      </main>

      <!-- RIGHT COLUMN: Tabbed panel (Jelajahi / Trending) -->
      <aside class="sidebar-right">
        <!-- Tab header -->
        <div class="right-tab-header">
          <button
            class="right-tab-btn"
            :class="{ active: activeTab === 'explore' }"
            @click="activeTab = 'explore'"
          >
            <i class="fa-solid fa-compass" style="font-size: 11px;"></i>
            Jelajahi
          </button>
          <button
            class="right-tab-btn"
            :class="{ active: activeTab === 'trending' }"
            @click="activeTab = 'trending'"
          >
            <i class="fa-solid fa-chart-line" style="font-size: 11px;"></i>
            Trending
          </button>
        </div>

        <!-- Tab content -->
        <div class="right-tab-body">
          <Transition name="tab-fade" mode="out-in">
            <QuestionExplorer
              v-if="activeTab === 'explore'"
              key="explore"
              @select="handleExplorerSelect"
              :activeTag="selectedTag"
            />
            <div v-else key="trending" class="trending-wrap">
              <TrendingPanel @select="handleExplorerSelect" />
            </div>
          </Transition>
        </div>
      </aside>
    </div>

  <!-- FAB: Tombol untuk membuka panel kanan di mobile -->
  <button
    class="fab-panel-btn"
    @click="isBottomSheetOpen = true"
    aria-label="Buka panel Jelajahi & Trending"
  >
    <i class="fa-solid fa-compass"></i>
  </button>

  <!-- Bottom Sheet Backdrop -->
  <Transition name="fade">
    <div
      v-if="isBottomSheetOpen"
      class="bottom-sheet-backdrop"
      @click="isBottomSheetOpen = false"
    ></div>
  </Transition>

  <!-- Bottom Sheet Panel -->
  <Transition name="slide-up">
    <div v-if="isBottomSheetOpen" class="bottom-sheet">
      <div class="bottom-sheet-handle-bar"></div>
      <div class="bottom-sheet-header">
        <div class="right-tab-header bottom-sheet-tabs">
          <button
            class="right-tab-btn"
            :class="{ active: activeTab === 'explore' }"
            @click="activeTab = 'explore'"
          >
            <i class="fa-solid fa-compass" style="font-size: 11px;"></i>
            Jelajahi
          </button>
          <button
            class="right-tab-btn"
            :class="{ active: activeTab === 'trending' }"
            @click="activeTab = 'trending'"
          >
            <i class="fa-solid fa-chart-line" style="font-size: 11px;"></i>
            Trending
          </button>
        </div>
        <button class="bottom-sheet-close-btn" @click="isBottomSheetOpen = false">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
      <div class="bottom-sheet-body">
        <Transition name="tab-fade" mode="out-in">
          <QuestionExplorer
            v-if="activeTab === 'explore'"
            key="explore-mobile"
            @select="(q) => { handleExplorerSelect(q); isBottomSheetOpen = false }"
            :activeTag="selectedTag"
          />
          <div v-else key="trending-mobile" class="trending-wrap">
            <TrendingPanel @select="(q) => { handleExplorerSelect(q); isBottomSheetOpen = false }" />
          </div>
        </Transition>
      </div>
    </div>
  </Transition>
</div>
</template>

<style scoped>
/* Layout */
.home-page {
  min-height: 100vh;
  padding: 2rem;
  background-color: var(--color-bg);
}

.layout {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 2rem;
  max-width: 1100px;
  margin: 0 auto;
  align-items: start;
}

/* Responsive: tablet */
@media (max-width: 1024px) {
  .layout {
    grid-template-columns: 1fr;
  }
  .sidebar-right {
    display: none;
  }
}

/* Responsive: mobile */
@media (max-width: 768px) {
  .home-page {
    padding: 1rem;
  }
}

/* Right column tabs */
.right-tab-header {
  display: flex;
  gap: 4px;
  margin-bottom: 10px;
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  padding: 4px;
}

.right-tab-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 6px 8px;
  border: none;
  border-radius: 7px;
  background: transparent;
  color: var(--color-text-secondary);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  font-family: var(--font-body);
  transition: all 0.15s ease;
}

.right-tab-btn:hover:not(.active) {
  color: var(--color-text);
  background-color: var(--color-bg-secondary);
}

.right-tab-btn.active {
  background-color: var(--color-card-bg);
  color: var(--color-primary);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border);
}

.right-tab-body {
  /* constrain height to avoid layout jumps */
  min-height: 0;
}

.trending-wrap {
  background-color: var(--color-sidebar-bg);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1rem;
}

/* Tab fade transition */
.tab-fade-enter-active,
.tab-fade-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}
.tab-fade-enter-from {
  opacity: 0;
  transform: translateY(6px);
}
.tab-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

/* Search box */
.search-box {
  background-color: var(--color-card-bg);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: var(--shadow-sm);
}

.textarea-wrap {
  position: relative;
  margin-bottom: 12px;
}

.search-input {
  width: 100%;
  padding: 14px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background-color: var(--color-bg);
  color: var(--color-text);
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  line-height: 1.6;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
}

.char-counter {
  position: absolute;
  bottom: 8px;
  right: 12px;
  font-size: 11px;
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  color: var(--color-text-secondary);
}

.char-counter.near-limit {
  color: var(--color-warning);
}

.tag-selector-wrap {
  margin-bottom: 0;
}

.search-options {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  margin-bottom: 1.5rem;
}

.limit-slider-container {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  width: 100%;
  padding: 4px 0;
}

.limit-label-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-text);
  font-weight: 500;
  font-size: 14px;
  flex-shrink: 0;
}

.results-icon {
  color: var(--color-text-secondary);
  flex-shrink: 0;
}

.limit-slider {
  -webkit-appearance: none;
  appearance: none;
  flex: 1;
  height: 6px;
  border-radius: 999px;
  outline: none;
  margin: 0;
  cursor: pointer;
  transition: box-shadow 0.15s ease;
}

.limit-slider:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 4px;
}

/* Track styles */
.limit-slider::-webkit-slider-runnable-track {
  height: 6px;
  background: transparent;
  border: none;
}

/* Thumb styles */
.limit-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--color-primary);
  border: none;
  margin-top: -5px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
  transition:
    transform 0.1s cubic-bezier(0.4, 0, 0.2, 1),
    background-color 0.15s ease;
}

.limit-slider::-webkit-slider-thumb:hover {
  transform: scale(1.2);
  background-color: var(--color-primary-hover);
}

.limit-slider::-webkit-slider-thumb:active {
  transform: scale(0.9);
}

/* Firefox Track styles */
.limit-slider::-moz-range-track {
  height: 6px;
  background: transparent;
  border: none;
}

/* Firefox Thumb styles */
.limit-slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--color-primary);
  border: none;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
  transition:
    transform 0.1s cubic-bezier(0.4, 0, 0.2, 1),
    background-color 0.15s ease;
}

.limit-slider::-moz-range-thumb:hover {
  transform: scale(1.2);
  background-color: var(--color-primary-hover);
}

.limit-slider::-moz-range-thumb:active {
  transform: scale(0.9);
}

.limit-value {
  color: var(--color-primary);
  font-weight: 600;
  font-size: 15px;
  min-width: 24px;
  text-align: right;
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  flex-shrink: 0;
}

.btn-search {
  width: 100%;
  padding: 12px;
  background-color: var(--color-primary);
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.15s ease;
  font-family: var(--font-body);
}

.btn-search:hover:not(:disabled) {
  background-color: var(--color-primary-hover);
}

.btn-search:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* States */
.state-error {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #fee2e2;
  border: 1px solid #fca5a5;
  color: #b91c1c;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 13px;
  margin-bottom: 1.5rem;
}

.state-empty,
.state-initial {
  text-align: center;
  padding: 4rem 1rem;
}

.empty-icon,
.initial-icon {
  font-size: 3rem;
  margin-bottom: 12px;
}

.empty-title,
.initial-title {
  font-size: 18px;
  font-weight: 500;
  color: var(--color-text);
  margin-bottom: 6px;
}

.empty-sub,
.initial-sub {
  font-size: 14px;
  color: var(--color-text-secondary);
  line-height: 1.6;
  max-width: 360px;
  margin: 0 auto;
}

.result-count {
  font-size: 12px;
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  color: var(--color-text-secondary);
  margin-bottom: 12px;
}

/* Fade transition for SynthesisPanel */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* ============================
   FAB Button (Mobile/Tablet)
   ============================ */
.fab-panel-btn {
  display: none;
  position: fixed;
  bottom: 24px;
  right: 20px;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary), #6366f1);
  color: #ffffff;
  border: none;
  font-size: 20px;
  cursor: pointer;
  z-index: 200;
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.4);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  align-items: center;
  justify-content: center;
}

.fab-panel-btn:hover {
  transform: scale(1.08);
  box-shadow: 0 6px 24px rgba(99, 102, 241, 0.55);
}

/* Bottom Sheet Backdrop */
.bottom-sheet-backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.45);
  z-index: 300;
  backdrop-filter: blur(2px);
}

/* Bottom Sheet */
.bottom-sheet {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: var(--color-card-bg);
  border-top: 1px solid var(--color-border);
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  z-index: 301;
  display: flex;
  flex-direction: column;
  max-height: 75vh;
  box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.15);
}

.bottom-sheet-handle-bar {
  width: 40px;
  height: 4px;
  background-color: var(--color-border);
  border-radius: 2px;
  margin: 12px auto 0 auto;
  flex-shrink: 0;
}

.bottom-sheet-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px 8px;
  flex-shrink: 0;
}

.bottom-sheet-tabs {
  flex: 1;
  margin-bottom: 0;
}

.bottom-sheet-close-btn {
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  font-size: 18px;
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  transition: background-color 0.15s ease, color 0.15s ease;
  margin-left: 8px;
}

.bottom-sheet-close-btn:hover {
  background-color: var(--color-bg-secondary);
  color: var(--color-text);
}

.bottom-sheet-body {
  flex: 1;
  overflow-y: auto;
  padding: 8px 12px 16px;
}

/* Slide-up transition */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}

/* Show FAB only on tablet/mobile */
@media (max-width: 1024px) {
  .fab-panel-btn {
    display: flex;
  }
}
</style>
