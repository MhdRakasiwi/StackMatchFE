<script setup>
import { ref, onMounted, computed } from 'vue'
import * as api from '../api/index.js'

const emit = defineEmits(['close'])

const isLoading = ref(false)
const error = ref(null)
const preferences = ref({
  tag_weights: {},
  total_interactions: 0,
  is_personalized: false
})

const fetchPreferences = async () => {
  isLoading.value = true
  error.value = null
  try {
    const res = await api.getPreferences()
    preferences.value = res.data || {
      tag_weights: {},
      total_interactions: 0,
      is_personalized: false
    }
  } catch (err) {
    console.error('Gagal mengambil preferensi:', err)
    error.value = 'Gagal memuat data preferensi'
  } finally {
    isLoading.value = false
  }
}

const handleReset = async () => {
  if (!confirm('Apakah Anda yakin ingin menghapus preferensi pencarian Anda?')) {
    return
  }

  try {
    await api.deletePreferences()
    // Re-fetch data to update the state to non-personalized
    await fetchPreferences()
  } catch (err) {
    console.error('Gagal mereset preferensi:', err)
    alert('Gagal mereset preferensi. Coba lagi nanti.')
  }
}

onMounted(() => {
  fetchPreferences()
})

// Compute maximum weight to calculate bar widths relatively
const maxWeight = computed(() => {
  const weights = Object.values(preferences.value.tag_weights || {})
  if (weights.length === 0) return 1.0
  return Math.max(...weights, 1.0)
})

// Format weights as array of objects sorted by weight descending
const sortedTags = computed(() => {
  const weightsObj = preferences.value.tag_weights || {}
  return Object.entries(weightsObj)
    .map(([tag, weight]) => ({
      tag,
      weight: Number(weight)
    }))
    .sort((a, b) => b.weight - a.weight)
})

const isPersonalized = computed(() => {
  return preferences.value.is_personalized && preferences.value.total_interactions >= 3
})
</script>

<template>
  <div class="preference-panel">
    <!-- Header -->
    <div class="panel-header">
      <button class="btn-back" @click="emit('close')" aria-label="Kembali">
        <i class="back-icon fa-solid fa-arrow-left"></i>
      </button>
      <span class="panel-title">Preferensi</span>
    </div>

    <!-- Content -->
    <div class="panel-content">
      <div v-if="isLoading" class="loading-state">
        <div class="spinner-small"></div>
        <span>Memuat preferensi...</span>
      </div>

      <div v-else-if="error" class="error-state">
        <p>{{ error }}</p>
        <button class="btn-retry" @click="fetchPreferences">Coba Lagi</button>
      </div>

      <div v-else class="preference-info">
        <!-- Non-personalized state -->
        <div v-if="!isPersonalized" class="unpersonalized-box">
          <div class="info-icon"><i class="fa-solid fa-lightbulb" style="color: var(--color-warning);"></i></div>
          <p class="info-desc">
            Beri rating pada hasil pencarian untuk mengaktifkan rekomendasi personal
          </p>
          <div class="interaction-status" v-if="preferences.total_interactions > 0">
            Interaksi saat ini: <strong>{{ preferences.total_interactions }} / 3</strong>
          </div>
        </div>

        <!-- Personalized state -->
        <div v-else class="personalized-box">
          <h3 class="section-subtitle">Pencarian Terkini</h3>
          <div class="stats-card">
            <span class="stats-label">Total Interaksi</span>
            <span class="stats-value">{{ preferences.total_interactions }}</span>
          </div>

          <h3 class="section-subtitle">Bobot Minat Kategori</h3>
          <div class="chart-container">
            <div v-for="tagObj in sortedTags" :key="tagObj.tag" class="chart-row">
              <span class="tag-label" :title="tagObj.tag">{{ tagObj.tag }}</span>
              <div class="bar-track">
                <div 
                  class="bar-fill"
                  :style="{ width: `${(tagObj.weight / maxWeight) * 100}%` }"
                  :title="tagObj.weight.toFixed(2)"
                ></div>
              </div>
              <span class="tag-value">{{ tagObj.weight.toFixed(1) }}</span>
            </div>
          </div>

          <button class="btn-reset" @click="handleReset">
            Reset Preferensi
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.preference-panel {
  position: absolute;
  top: 0;
  left: 0;
  width: 260px;
  height: 100vh;
  background-color: var(--color-sidebar-bg);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  z-index: 1010;
  box-shadow: 4px 0 15px rgba(0, 0, 0, 0.15);
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  height: 56px;
  border-bottom: 1px solid var(--color-border);
}

.btn-back {
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.btn-back:hover {
  background-color: var(--color-bg-secondary);
  color: var(--color-text);
}

.panel-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text);
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
}

/* States */
.loading-state, .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 10px;
  text-align: center;
  gap: 12px;
  font-size: 13px;
  color: var(--color-text-secondary);
}

.spinner-small {
  width: 20px;
  height: 20px;
  border: 2px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s infinite linear;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.btn-retry {
  padding: 6px 12px;
  background-color: var(--color-primary);
  color: #ffffff;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
}

/* Unpersonalized Box */
.unpersonalized-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px 10px;
  text-align: center;
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: 8px;
}

.info-icon {
  font-size: 2rem;
  margin-bottom: 12px;
}

.info-desc {
  font-size: 13px;
  line-height: 1.5;
  color: var(--color-text-secondary);
  margin: 0 0 16px;
}

.interaction-status {
  font-size: 11px;
  color: var(--color-text-secondary);
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
}

/* Personalized Box */
.personalized-box {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-subtitle {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-secondary);
  margin: 0;
}

.stats-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: 8px;
}

.stats-label {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.stats-value {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text);
}

/* Pure CSS Chart */
.chart-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 12px;
}

.chart-row {
  display: grid;
  grid-template-columns: 80px 1fr 30px;
  align-items: center;
  gap: 8px;
}

.tag-label {
  font-size: 12px;
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  color: var(--color-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bar-track {
  height: 8px;
  background-color: var(--color-border);
  border-radius: 999px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background-color: var(--color-primary);
  border-radius: 999px;
  transition: width 0.3s ease;
}

.tag-value {
  font-size: 11px;
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  color: var(--color-text-secondary);
  text-align: right;
}

.btn-reset {
  width: 100%;
  padding: 10px;
  background-color: transparent;
  border: 1px solid var(--color-danger);
  color: var(--color-danger);
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease;
  font-family: var(--font-body);
}

.btn-reset:hover {
  background-color: rgba(220, 38, 38, 0.1);
}
</style>
