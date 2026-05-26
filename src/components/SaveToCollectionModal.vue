<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCollectionsStore } from '../stores/collections.js'

const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'saved'])

const collectionsStore = useCollectionsStore()
const selectedCollectionId = ref(null)
const showNewInput = ref(false)
const newCollectionName = ref('')
const isSaving = ref(false)
const localError = ref('')

onMounted(async () => {
  // If collections are not loaded, fetch them
  if (collectionsStore.collections.length === 0) {
    await collectionsStore.fetchCollections()
  }
  
  // Pre-select the first collection that this item is NOT already saved in
  const itemQId = String(props.item?.question_id || props.item?.id)
  const availableCol = collectionsStore.collections.find(col => {
    const items = collectionsStore.collectionsItems[col.id] || []
    return !items.some(i => String(i.question_id || i.id) === itemQId)
  })
  if (availableCol) {
    selectedCollectionId.value = availableCol.id
  }
})

const isSavedInCollection = (colId) => {
  const items = collectionsStore.collectionsItems[colId] || []
  const itemQId = String(props.item?.question_id || props.item?.id)
  return items.some(i => String(i.question_id || i.id) === itemQId)
}

const handleCreateCollection = async () => {
  const name = newCollectionName.value.trim()
  if (!name) return

  localError.value = ''
  try {
    const newCol = await collectionsStore.createCollection(name)
    selectedCollectionId.value = newCol.id
    newCollectionName.value = ''
    showNewInput.value = false
  } catch (err) {
    localError.value = 'Gagal membuat koleksi baru'
  }
}

const handleSave = async () => {
  if (!selectedCollectionId.value) return

  isSaving.value = true
  localError.value = ''
  try {
    await collectionsStore.addItem(selectedCollectionId.value, props.item)
    emit('saved')
    emit('close')
  } catch (err) {
    localError.value = 'Gagal menyimpan item ke koleksi'
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <Transition name="fade">
    <div v-if="props.show" class="modal-backdrop" @click="emit('close')">
      <div class="modal-card" @click.stop>
        <!-- Header -->
        <div class="modal-header">
          <h2 class="modal-title">Simpan ke Koleksi</h2>
          <button class="btn-close" @click="emit('close')" aria-label="Tutup">
            &times;
          </button>
        </div>

        <!-- Content -->
        <div class="modal-content">
          <div v-if="localError" class="error-message">
            <span>⚠</span> {{ localError }}
          </div>

          <div class="modal-body">
            <!-- List of collections -->
            <div v-if="collectionsStore.collections.length > 0" class="collections-list">
              <label
                v-for="col in collectionsStore.collections"
                :key="col.id"
                class="collection-radio-card"
                :class="{ 
                  active: selectedCollectionId === col.id,
                  'already-saved': isSavedInCollection(col.id)
                }"
              >
                <input
                  type="radio"
                  name="collection"
                  :value="col.id"
                  v-model="selectedCollectionId"
                  :disabled="isSavedInCollection(col.id) || isSaving"
                  class="sr-only"
                />
                <div class="radio-card-content">
                  <div class="card-left">
                    <span class="collection-name">{{ col.name }}</span>
                    <span class="collection-meta">({{ col.item_count || 0 }} item)</span>
                  </div>
                  <div class="card-right">
                    <span v-if="isSavedInCollection(col.id)" class="saved-indicator">
                      ✓ Tersimpan
                    </span>
                    <span v-else-if="selectedCollectionId === col.id" class="check-dot"></span>
                  </div>
                </div>
              </label>
            </div>
            
            <p v-else class="empty-collections-text">
              Belum ada koleksi. Buat koleksi baru di bawah ini.
            </p>

            <!-- Inline input for new collection -->
            <div class="new-collection-section">
              <button 
                v-if="!showNewInput" 
                class="btn-toggle-new" 
                @click="showNewInput = true"
              >
                + Koleksi Baru
              </button>
              <div v-else class="new-input-wrap">
                <input
                  v-model="newCollectionName"
                  type="text"
                  placeholder="Nama koleksi baru..."
                  class="new-collection-input"
                  @keydown.enter.prevent="handleCreateCollection"
                  :disabled="isSaving"
                />
                <div class="new-input-actions">
                  <button 
                    class="btn-create" 
                    @click="handleCreateCollection" 
                    :disabled="!newCollectionName.trim() || isSaving"
                  >
                    Buat
                  </button>
                  <button 
                    class="btn-cancel" 
                    @click="showNewInput = false; newCollectionName = ''"
                    :disabled="isSaving"
                  >
                    Batal
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="modal-footer">
          <button class="btn-action-secondary" @click="emit('close')" :disabled="isSaving">
            Batal
          </button>
          <button 
            class="btn-action-primary" 
            :disabled="!selectedCollectionId || isSaving" 
            @click="handleSave"
          >
            <span v-if="isSaving" class="spinner-inline"></span>
            {{ isSaving ? 'Menyimpan...' : 'Simpan' }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.modal-backdrop {
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
  align-items: center;
  padding: 1rem;
}

.modal-card {
  width: 100%;
  max-width: 400px;
  background-color: var(--color-card-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg, 12px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 260px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 18px;
  border-bottom: 1px solid var(--color-border);
}

.modal-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
}

.btn-close {
  background: transparent;
  border: none;
  font-size: 22px;
  color: var(--color-text-secondary);
  cursor: pointer;
  line-height: 1;
  padding: 0 4px;
}

.modal-content {
  flex: 1;
  overflow-y: auto;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 6px;
  background-color: #fee2e2;
  border: 1px solid #fca5a5;
  color: #b91c1c;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
}

.collections-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
  max-height: 180px;
  overflow-y: auto;
  padding-right: 4px;
}

.collection-radio-card {
  display: block;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 10px 14px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.collection-radio-card:hover:not(.already-saved) {
  background-color: var(--color-bg-secondary);
}

.collection-radio-card.active {
  border-color: var(--color-primary);
  background-color: rgba(37, 99, 235, 0.04);
}

:global(.dark) .collection-radio-card.active {
  background-color: rgba(59, 130, 246, 0.08);
}

.collection-radio-card.already-saved {
  opacity: 0.6;
  cursor: not-allowed;
  background-color: var(--color-bg-secondary);
}

.radio-card-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-left {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.collection-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.collection-meta {
  font-size: 11px;
  color: var(--color-text-secondary);
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  flex-shrink: 0;
}

.saved-indicator {
  font-size: 11px;
  color: #15803d;
  font-weight: 500;
}

:global(.dark) .saved-indicator {
  color: #4ade80;
}

.check-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--color-primary);
}

.empty-collections-text {
  font-size: 13px;
  color: var(--color-text-secondary);
  text-align: center;
  margin: 16px 0;
}

/* Inline input section */
.new-collection-section {
  margin-top: 4px;
}

.btn-toggle-new {
  background: transparent;
  border: none;
  color: var(--color-primary);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  padding: 4px 0;
  font-family: var(--font-body);
}

.btn-toggle-new:hover {
  text-decoration: underline;
}

.new-input-wrap {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px 0;
}

.new-collection-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background-color: var(--color-bg);
  color: var(--color-text);
  font-size: 13px;
  outline: none;
}

.new-collection-input:focus {
  border-color: var(--color-primary);
}

.new-input-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.btn-create, .btn-cancel {
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  font-weight: 500;
  font-family: var(--font-body);
}

.btn-create {
  background-color: var(--color-primary);
  color: #ffffff;
  border: none;
}

.btn-create:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-cancel {
  background-color: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
}

/* Footer */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 12px 18px;
  border-top: 1px solid var(--color-border);
}

.btn-action-primary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background-color: var(--color-primary);
  color: #ffffff;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.15s ease;
  font-family: var(--font-body);
}

.btn-action-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-action-secondary {
  padding: 8px 16px;
  background-color: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  font-family: var(--font-body);
}

/* Spinners */
.spinner-inline {
  width: 12px;
  height: 12px;
  border: 1.5px solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.8s infinite linear;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Fade transition */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
