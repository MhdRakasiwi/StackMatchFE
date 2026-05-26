<script setup>
import { onMounted, computed } from 'vue'
import { useTrendingStore } from '../stores/trending.js'
import { useSearchStore } from '../stores/search.ts'

const trendingStore = useTrendingStore()
const searchStore = useSearchStore()

const emit = defineEmits(['select'])

onMounted(() => {
  trendingStore.fetchTrending()
})

// Warna bar chart untuk tag distribution (terbatas 8 warna, sisanya abu)
const TAG_COLORS = [
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#06b6d4', // cyan
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
  '#ec4899', // pink
  '#14b8a6', // teal
]

const tagBars = computed(() =>
  trendingStore.tagDistribution.slice(0, 8).map((t, i) => ({
    ...t,
    color: TAG_COLORS[i] || '#6b7280',
  })),
)

const handleSelectQuery = (query) => {
  searchStore.triggerSearch(query)
  emit('select', query)
}

const formatCount = (n) => {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}
</script>

<template>
  <div class="trending-panel">
    <!-- Loading skeleton -->
    <div v-if="trendingStore.isLoading" class="tp-skeleton-wrap">
      <div class="skeleton-stat-row">
        <div class="skeleton-stat" v-for="i in 3" :key="i"></div>
      </div>
      <div
        class="skeleton-line"
        v-for="i in 5"
        :key="'q' + i"
        :style="{ width: 80 - i * 8 + '%' }"
      ></div>
      <div class="skeleton-bar-row" v-for="i in 4" :key="'b' + i"></div>
    </div>

    <!-- Error state -->
    <div v-else-if="trendingStore.error" class="tp-error">
      <span class="tp-error-icon"><i class="fa-solid fa-triangle-exclamation"></i></span>
      <span>{{ trendingStore.error }}</span>
      <button class="tp-retry-btn" @click="trendingStore.fetchTrending(true)">Coba lagi</button>
    </div>

    <!-- Content -->
    <template v-else>
      <!-- ── Stats Row ─────────────────────────────────────────── -->
      <div class="tp-stats-row">
        <div class="tp-stat-card">
          <span class="tp-stat-value">{{ formatCount(trendingStore.totalSearchesToday) }}</span>
          <span class="tp-stat-label">Hari ini</span>
        </div>
        <div class="tp-stat-card">
          <span class="tp-stat-value">{{ formatCount(trendingStore.totalSearchesWeek) }}</span>
          <span class="tp-stat-label">Minggu ini</span>
        </div>
        <div class="tp-stat-card accent">
          <span class="tp-stat-value">{{ formatCount(trendingStore.activeUsersToday) }}</span>
          <span class="tp-stat-label">Pengguna aktif</span>
        </div>
      </div>

      <!-- ── Trending Queries ──────────────────────────────────── -->
      <section class="tp-section" v-if="trendingStore.trendingQueries.length > 0">
        <h3 class="tp-section-title">
          <i class="fa-solid fa-chart-line" style="font-size: 11px;"></i>
          Query Trending
        </h3>
        <ul class="tp-query-list">
          <li
            v-for="(item, idx) in trendingStore.trendingQueries"
            :key="idx"
            class="tp-query-item"
            @click="handleSelectQuery(item.query)"
            role="button"
            tabindex="0"
            @keydown.enter.prevent="handleSelectQuery(item.query)"
          >
            <span class="tp-query-rank" :class="`rank-${idx + 1}`">{{ idx + 1 }}</span>
            <div class="tp-query-body">
              <span class="tp-query-text">{{ item.query }}</span>
              <span v-if="item.tag" class="tp-query-tag">{{ item.tag }}</span>
            </div>
            <span class="tp-query-count">
              <i class="fa-solid fa-arrow-trend-up"></i>
              {{ formatCount(item.count) }}
            </span>
          </li>
        </ul>
      </section>

      <!-- ── Tag Distribution ─────────────────────────────────── -->
      <section class="tp-section" v-if="tagBars.length > 0">
        <h3 class="tp-section-title">
          <i class="fa-solid fa-chart-bar" style="font-size: 11px;"></i>
          Distribusi Tag
        </h3>
        <div class="tp-bar-chart">
          <div v-for="bar in tagBars" :key="bar.tag" class="tp-bar-row">
            <span class="tp-bar-label">{{ bar.tag }}</span>
            <div class="tp-bar-track">
              <div
                class="tp-bar-fill"
                :style="{ width: bar.percentage + '%', background: bar.color }"
              ></div>
            </div>
            <span class="tp-bar-pct" :style="{ color: bar.color }">
              {{ bar.percentage.toFixed(1) }}%
            </span>
          </div>
        </div>
      </section>

      <!-- Empty state -->
      <div v-if="!trendingStore.hasData" class="tp-empty">
        <span class="tp-empty-icon"><i class="fa-solid fa-chart-simple" style="font-size: 28px; color: var(--color-text-secondary);"></i></span>
        <p>Belum ada data trending tersedia</p>
      </div>
    </template>

    <!-- Refresh button -->
    <button
      v-if="!trendingStore.isLoading"
      class="tp-refresh-btn"
      @click="trendingStore.fetchTrending(true)"
      title="Refresh data trending"
    >
      <i class="fa-solid fa-rotate"></i>
      Refresh
    </button>
  </div>
</template>

<style scoped>
/* ─── Container ─────────────────────────────────────────────── */
.trending-panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* ─── Stats Row ─────────────────────────────────────────────── */
.tp-stats-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.tp-stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 10px 6px;
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  text-align: center;
}

.tp-stat-card.accent {
  border-color: rgba(37, 99, 235, 0.3);
  background-color: rgba(37, 99, 235, 0.05);
}

.tp-stat-value {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text);
  line-height: 1;
}

.tp-stat-card.accent .tp-stat-value {
  color: var(--color-primary);
}

.tp-stat-label {
  font-size: 10px;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

/* ─── Section ───────────────────────────────────────────────── */
.tp-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tp-section-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 600;
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin: 0;
}

/* ─── Query List ─────────────────────────────────────────────── */
.tp-query-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tp-query-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 8px;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.15s ease;
}

.tp-query-item:hover {
  background-color: var(--color-bg-secondary);
  border-color: var(--color-border);
}

.tp-query-item:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 1px;
}

.tp-query-rank {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 11px;
  font-weight: 700;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
}

.tp-query-rank.rank-1 {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  border-color: #f59e0b;
  color: #fff;
}

.tp-query-rank.rank-2 {
  background: linear-gradient(135deg, #94a3b8, #64748b);
  border-color: #64748b;
  color: #fff;
}

.tp-query-rank.rank-3 {
  background: linear-gradient(135deg, #cd7c3e, #a0522d);
  border-color: #a0522d;
  color: #fff;
}

.tp-query-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.tp-query-text {
  font-size: 12px;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.3;
}

.tp-query-tag {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 9px;
  color: var(--color-text-secondary);
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  padding: 1px 5px;
  border-radius: 4px;
  width: fit-content;
}

.tp-query-count {
  display: flex;
  align-items: center;
  gap: 3px;
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 10px;
  color: var(--color-primary);
  font-weight: 600;
  flex-shrink: 0;
}

/* ─── Bar Chart ──────────────────────────────────────────────── */
.tp-bar-chart {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.tp-bar-row {
  display: grid;
  grid-template-columns: 80px 1fr 40px;
  align-items: center;
  gap: 8px;
}

.tp-bar-label {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 10px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: right;
}

.tp-bar-track {
  height: 6px;
  background-color: var(--color-border);
  border-radius: 999px;
  overflow: hidden;
}

.tp-bar-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 2px;
}

.tp-bar-pct {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 10px;
  font-weight: 600;
  text-align: left;
}

/* ─── Skeleton ───────────────────────────────────────────────── */
.tp-skeleton-wrap {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skeleton-stat-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 4px;
}

.skeleton-stat {
  height: 52px;
  border-radius: 8px;
  background: linear-gradient(
    90deg,
    var(--color-border) 25%,
    var(--color-bg-secondary) 50%,
    var(--color-border) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite linear;
}

.skeleton-line {
  height: 28px;
  border-radius: 8px;
  background: linear-gradient(
    90deg,
    var(--color-border) 25%,
    var(--color-bg-secondary) 50%,
    var(--color-border) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite linear;
}

.skeleton-bar-row {
  height: 10px;
  border-radius: 8px;
  background: linear-gradient(
    90deg,
    var(--color-border) 25%,
    var(--color-bg-secondary) 50%,
    var(--color-border) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite linear;
}

@keyframes shimmer {
  from {
    background-position: 200% 0;
  }
  to {
    background-position: -200% 0;
  }
}

/* ─── Error ──────────────────────────────────────────────────── */
.tp-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 1.5rem 1rem;
  text-align: center;
  color: var(--color-danger, #ef4444);
  font-size: 13px;
}

.tp-error-icon {
  font-size: 24px;
}

.tp-retry-btn {
  margin-top: 4px;
  padding: 5px 14px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: transparent;
  color: var(--color-text);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.tp-retry-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

/* ─── Empty ──────────────────────────────────────────────────── */
.tp-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 2rem 1rem;
  text-align: center;
  color: var(--color-text-secondary);
  font-size: 13px;
}

.tp-empty-icon {
  font-size: 28px;
}

/* ─── Refresh Button ─────────────────────────────────────────── */
.tp-refresh-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  width: 100%;
  padding: 6px;
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: 7px;
  color: var(--color-text-secondary);
  font-size: 11px;
  cursor: pointer;
  transition: all 0.15s ease;
  margin-top: 4px;
}

.tp-refresh-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}
</style>
