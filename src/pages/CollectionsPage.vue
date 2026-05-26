<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useCollectionsStore } from '../stores/collections.js'
import * as api from '../api/index.js'
import usePageTitle from '../composables/usePageTitle.js'
import SimilarityBadge from '../components/SimilarityBadge.vue'

usePageTitle('Koleksi Saya')

const collectionsStore = useCollectionsStore()
const activeCollectionId = ref(null)
const showDetailMobile = ref(false)

const showCreateInput = ref(false)
const newCollectionName = ref('')
const isCreating = ref(false)
const createError = ref('')

const isDetailsLoading = ref(false)
const detailsError = ref('')
const collectionDetail = ref(null)

const fetchDetails = async (colId) => {
  if (!colId) {
    collectionDetail.value = null
    return
  }
  isDetailsLoading.value = true
  detailsError.value = ''
  try {
    const res = await api.getCollectionDetail(colId)
    collectionDetail.value = res.data || null
  } catch (err) {
    console.error('Gagal mengambil detail koleksi:', err)
    detailsError.value = 'Gagal memuat detail koleksi'
  } finally {
    isDetailsLoading.value = false
  }
}

watch(activeCollectionId, (newId) => {
  fetchDetails(newId)
})

onMounted(async () => {
  await collectionsStore.fetchCollections()
})

const handleSelectCollection = (colId) => {
  activeCollectionId.value = colId
  showDetailMobile.value = true
}

const handleCreateCollection = async () => {
  const name = newCollectionName.value.trim()
  if (!name) return

  isCreating.value = true
  createError.value = ''
  try {
    const newCol = await collectionsStore.createCollection(name)
    activeCollectionId.value = newCol.id
    newCollectionName.value = ''
    showCreateInput.value = false
    showDetailMobile.value = true
  } catch (err) {
    createError.value = 'Gagal membuat koleksi baru'
  } finally {
    isCreating.value = false
  }
}

const handleDeleteCollection = async (colId) => {
  if (!confirm('Apakah Anda yakin ingin menghapus koleksi ini dan semua isinya?')) {
    return
  }

  try {
    await collectionsStore.deleteCollection(colId)
    if (activeCollectionId.value === colId) {
      activeCollectionId.value = null
      collectionDetail.value = null
      showDetailMobile.value = false
    }
  } catch (err) {
    alert('Gagal menghapus koleksi')
  }
}

const handleRemoveItem = async (questionId) => {
  if (!activeCollectionId.value) return
  if (!confirm('Apakah Anda yakin ingin menghapus item ini dari koleksi?')) {
    return
  }

  try {
    await collectionsStore.removeItem(activeCollectionId.value, questionId)
    if (collectionDetail.value && collectionDetail.value.items) {
      collectionDetail.value.items = collectionDetail.value.items.filter(
        item => String(item.question_id || item.id) !== String(questionId)
      )
    }
  } catch (err) {
    alert('Gagal menghapus item dari koleksi')
  }
}

const goBackToList = () => {
  showDetailMobile.value = false
}

const activeCollectionMeta = computed(() => {
  return collectionsStore.collections.find(c => c.id === activeCollectionId.value)
})
</script>

<template>
  <div class="collections-page">
    <div class="collections-layout" :class="{ 'show-detail': showDetailMobile }">
      
      <!-- LEFT PANEL: Collections List -->
      <div class="left-panel">
        <div class="panel-header-left">
          <h2 class="panel-title">Koleksi</h2>
          <button 
            v-if="!showCreateInput" 
            class="btn-add-collection" 
            @click="showCreateInput = true"
            title="Koleksi Baru"
          >
            <i class="fa-solid fa-plus"></i>
          </button>
        </div>

        <!-- Inline create input -->
        <div v-if="showCreateInput" class="create-collection-box">
          <input
            v-model="newCollectionName"
            type="text"
            placeholder="Nama koleksi..."
            class="create-input"
            @keydown.enter.prevent="handleCreateCollection"
            :disabled="isCreating"
          />
          <div class="create-actions">
            <button class="btn-create-submit" @click="handleCreateCollection" :disabled="isCreating || !newCollectionName.trim()">
              {{ isCreating ? '...' : 'Buat' }}
            </button>
            <button class="btn-create-cancel" @click="showCreateInput = false; newCollectionName = ''" :disabled="isCreating">
              Batal
            </button>
          </div>
          <span v-if="createError" class="create-error-text">{{ createError }}</span>
        </div>

        <!-- Collections list scrollbox -->
        <div class="collections-scroll">
          <div v-if="collectionsStore.isLoading && collectionsStore.collections.length === 0" class="loading-state-left">
            <div class="spinner-small"></div>
          </div>
          <div v-else-if="collectionsStore.collections.length === 0" class="empty-left">
            Belum ada koleksi
          </div>
          <ul v-else class="collections-list">
            <li 
              v-for="col in collectionsStore.collections" 
              :key="col.id" 
              class="collection-item"
              :class="{ active: activeCollectionId === col.id }"
              @click="handleSelectCollection(col.id)"
            >
              <div class="col-item-details">
                <span class="col-name">{{ col.name }}</span>
                <span class="col-count">{{ col.item_count || 0 }} item</span>
              </div>
              <button 
                class="btn-delete-col" 
                @click.stop="handleDeleteCollection(col.id)"
                title="Hapus Koleksi"
              >
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </li>
          </ul>
        </div>
      </div>

      <!-- RIGHT PANEL: Active Collection Detail -->
      <div class="right-panel">
        <!-- Back button (mobile only) -->
        <div class="mobile-header">
          <button class="btn-mobile-back" @click="goBackToList">
            ← Kembali ke Daftar
          </button>
        </div>

        <!-- Details loading state -->
        <div v-if="isDetailsLoading" class="loading-state-right">
          <div class="spinner"></div>
          <span>Memuat isi koleksi...</span>
        </div>

        <!-- Details error state -->
        <div v-else-if="detailsError" class="error-state-right">
          <p>{{ detailsError }}</p>
          <button class="btn-retry" @click="fetchDetails(activeCollectionId)">Coba Lagi</button>
        </div>

        <!-- No collection selected -->
        <div v-else-if="!activeCollectionId" class="empty-right">
          <div class="empty-illus"><i class="fa-solid fa-bookmark" style="font-size: 3rem; color: var(--color-text-secondary);"></i></div>
          <h3>Pilih koleksi untuk melihat isinya</h3>
          <p>Koleksi yang Anda simpan akan tampil di sini</p>
        </div>

        <!-- Active collection items list -->
        <div v-else class="detail-container">
          <div class="detail-header">
            <div class="header-info">
              <h2 class="collection-title">{{ activeCollectionMeta?.name }}</h2>
              <span class="collection-meta-count">{{ collectionDetail?.items?.length || 0 }} item tersimpan</span>
            </div>
            <button 
              class="btn-header-delete" 
              @click="handleDeleteCollection(activeCollectionId)"
            >
              Hapus Koleksi
            </button>
          </div>

          <div class="detail-content">
            <div v-if="!collectionDetail?.items || collectionDetail.items.length === 0" class="empty-items-box">
              <p>Koleksi ini masih kosong.</p>
              <p class="empty-items-sub">Temukan pertanyaan menarik di halaman utama dan simpan ke sini!</p>
            </div>
            
            <div v-else class="items-list">
              <div 
                v-for="item in collectionDetail.items" 
                :key="item.question_id || item.id" 
                class="compact-item-card"
              >
                <div class="card-top">
                  <span class="item-tag-badge" v-if="item.tag">{{ item.tag }}</span>
                  <SimilarityBadge 
                    v-if="item.score_fusion !== undefined && item.score_fusion !== null" 
                    :score="Number(item.score_fusion)" 
                  />
                </div>
                <p class="item-question">{{ item.question }}</p>
                <p class="item-preview-text" v-if="item.answer_preview">
                  {{ item.answer_preview }}
                </p>
                <div class="card-bottom">
                  <button 
                    class="btn-remove-item"
                    @click="handleRemoveItem(item.question_id || item.id)"
                  >
                    Hapus dari Koleksi
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.collections-page {
  min-height: 100vh;
  background-color: var(--color-bg);
  padding: 0;
  display: flex;
}

.collections-layout {
  display: grid;
  grid-template-columns: 260px 1fr;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  background-color: var(--color-card-bg);
  border-left: 1px solid var(--color-border);
  border-right: 1px solid var(--color-border);
}

/* Left Panel */
.left-panel {
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  background-color: var(--color-sidebar-bg);
}

.panel-header-left {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  height: 56px;
  border-bottom: 1px solid var(--color-border);
}

.panel-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
}

.btn-add-collection {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid var(--color-border);
  background: transparent;
  color: var(--color-text);
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
  line-height: 1;
}

.btn-add-collection:hover {
  background-color: var(--color-bg-secondary);
  color: var(--color-primary);
  border-color: var(--color-primary);
}

/* Create Input box */
.create-collection-box {
  padding: 12px;
  border-bottom: 1px solid var(--color-border);
  background-color: var(--color-bg-secondary);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.create-input {
  width: 100%;
  padding: 6px 10px;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background-color: var(--color-bg);
  color: var(--color-text);
  font-size: 13px;
  outline: none;
}

.create-input:focus {
  border-color: var(--color-primary);
}

.create-actions {
  display: flex;
  justify-content: flex-end;
  gap: 6px;
}

.btn-create-submit, .btn-create-cancel {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
}

.btn-create-submit {
  background-color: var(--color-primary);
  color: #ffffff;
  border: none;
}

.btn-create-submit:disabled {
  opacity: 0.5;
}

.btn-create-cancel {
  background-color: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
}

.create-error-text {
  font-size: 11px;
  color: var(--color-danger);
}

/* Left Collections List */
.collections-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.collections-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.collection-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
  user-select: none;
}

.collection-item:hover {
  background-color: var(--color-bg-secondary);
}

.collection-item.active {
  background-color: rgba(37, 99, 235, 0.08);
  border-left: 3px solid var(--color-primary);
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}

:global(.dark) .collection-item.active {
  background-color: rgba(59, 130, 246, 0.15);
}

.col-item-details {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
}

.col-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.col-count {
  font-size: 11px;
  color: var(--color-text-secondary);
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  margin-top: 2px;
}

.btn-delete-col {
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  opacity: 0;
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.collection-item:hover .btn-delete-col {
  opacity: 1;
}

.btn-delete-col:hover {
  background-color: rgba(220, 38, 38, 0.1);
  color: var(--color-danger);
}

.loading-state-left, .empty-left {
  padding: 30px 10px;
  text-align: center;
  font-size: 12px;
  color: var(--color-text-secondary);
}

/* Right Panel */
.right-panel {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  background-color: var(--color-card-bg);
}

.mobile-header {
  display: none;
  padding: 12px;
  border-bottom: 1px solid var(--color-border);
  background-color: var(--color-sidebar-bg);
}

.btn-mobile-back {
  background: transparent;
  border: none;
  color: var(--color-primary);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  padding: 4px 8px;
}

.loading-state-right, .error-state-right, .empty-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 40px 20px;
  color: var(--color-text-secondary);
  gap: 12px;
}

.empty-illus {
  font-size: 3rem;
  margin-bottom: 12px;
}

.empty-right h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
}

.empty-right p {
  font-size: 13px;
  margin: 0;
}

.btn-retry {
  padding: 8px 16px;
  background-color: var(--color-primary);
  color: #ffffff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

/* Detail view content container */
.detail-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

.collection-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
}

.collection-meta-count {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-top: 4px;
  display: block;
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
}

.btn-header-delete {
  padding: 6px 12px;
  background-color: transparent;
  border: 1px solid var(--color-danger);
  color: var(--color-danger);
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-header-delete:hover {
  background-color: rgba(220, 38, 38, 0.08);
}

.detail-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.empty-items-box {
  padding: 40px;
  text-align: center;
  background-color: var(--color-bg-secondary);
  border: 1px dashed var(--color-border);
  border-radius: 8px;
  color: var(--color-text-secondary);
  font-size: 13px;
}

.empty-items-sub {
  margin-top: 8px;
  font-size: 12px;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Compact Card */
.compact-item-card {
  border: 1px solid var(--color-border);
  background-color: var(--color-bg-secondary);
  border-radius: 8px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: border-color 0.15s ease;
}

.compact-item-card:hover {
  border-color: var(--color-primary);
}

.card-top {
  display: flex;
  align-items: center;
  gap: 8px;
}

.item-tag-badge {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 10px;
  padding: 1px 6px;
  background-color: var(--color-card-bg);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  color: var(--color-text-secondary);
}

.item-question {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text);
  line-height: 1.5;
  margin: 0;
}

.item-preview-text {
  font-size: 12px;
  color: var(--color-text-secondary);
  line-height: 1.5;
  margin: 0;
  word-break: break-word;
}

.card-bottom {
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid var(--color-border);
  padding-top: 8px;
  margin-top: 4px;
}

.btn-remove-item {
  background: transparent;
  border: none;
  color: var(--color-danger);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.15s ease;
}

.btn-remove-item:hover {
  background-color: rgba(220, 38, 38, 0.08);
}

/* Spinner */
.spinner-small {
  width: 18px;
  height: 18px;
  border: 2px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s infinite linear;
  margin: 0 auto;
}

.spinner {
  width: 28px;
  height: 28px;
  border: 2.5px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s infinite linear;
}

/* Responsive (Mobile/Tablet breakpoint) */
@media (max-width: 768px) {
  .collections-layout {
    grid-template-columns: 1fr;
    border: none;
  }
  
  .left-panel {
    display: flex;
    width: 100%;
    height: 100vh;
  }
  
  .right-panel {
    display: none;
    width: 100%;
    height: 100vh;
  }
  
  .mobile-header {
    display: block;
  }
  
  /* Show detail panel when active */
  .collections-layout.show-detail .left-panel {
    display: none;
  }
  
  .collections-layout.show-detail .right-panel {
    display: flex;
  }

  .detail-header {
    padding: 12px 16px;
  }
  
  .detail-content {
    padding: 16px;
  }
}
</style>
