import { defineStore } from 'pinia'
import * as api from '../api/index.js'

export const useCollectionsStore = defineStore('collections', {
  state: () => ({
    collections: [], // list of collections metadata: [{id, name, created_at, item_count}]
    collectionsItems: {}, // key: collectionId, value: Array of items inside it
    isLoading: false,
    error: ''
  }),

  actions: {
    async fetchCollections() {
      this.isLoading = true
      this.error = ''
      try {
        const response = await api.getCollections()
        const cols = response.data.collections || response.data || []
        this.collections = cols

        // Load details for each collection in parallel to map internal items
        const details = await Promise.all(
          cols.map(c => api.getCollectionDetail(c.id).catch(() => ({ data: { items: [] } })))
        )

        const itemsMap = {}
        details.forEach((res, index) => {
          const colId = cols[index].id
          itemsMap[colId] = res.data.items || []
        })
        this.collectionsItems = itemsMap
      } catch (err) {
        console.error('Gagal mengambil daftar koleksi:', err)
        this.error = 'Gagal memuat daftar koleksi'
      } finally {
        this.isLoading = false
      }
    },

    async createCollection(name) {
      this.isLoading = true
      this.error = ''
      try {
        const response = await api.createCollection(name)
        const newCol = response.data
        this.collections.push(newCol)
        this.collectionsItems[newCol.id] = []
        return newCol
      } catch (err) {
        console.error('Gagal membuat koleksi:', err)
        this.error = 'Gagal membuat koleksi baru'
        throw err
      } finally {
        this.isLoading = false
      }
    },

    async deleteCollection(id) {
      this.isLoading = true
      this.error = ''
      try {
        await api.deleteCollection(id)
        this.collections = this.collections.filter(c => c.id !== id)
        delete this.collectionsItems[id]
      } catch (err) {
        console.error('Gagal menghapus koleksi:', err)
        this.error = 'Gagal menghapus koleksi'
        throw err
      } finally {
        this.isLoading = false
      }
    },

    async addItem(collectionId, item) {
      this.isLoading = true
      this.error = ''
      try {
        // Format item for the backend API
        const formattedItem = {
          question_id: String(item.question_id || item.id),
          question: item.question,
          answer_preview: item.answer_preview || item.answer_full || '',
          tag: item.tag || '',
          score_fusion: Number(item.score_fusion || 0)
        }

        await api.addToCollection(collectionId, formattedItem)

        // Update local items cache
        if (!this.collectionsItems[collectionId]) {
          this.collectionsItems[collectionId] = []
        }

        // Avoid duplicates in local items list
        const exists = this.collectionsItems[collectionId].some(
          i => String(i.question_id) === String(formattedItem.question_id)
        )
        if (!exists) {
          this.collectionsItems[collectionId].push(formattedItem)
        }

        // Increment item_count in metadata
        const col = this.collections.find(c => c.id === collectionId)
        if (col) {
          col.item_count = (col.item_count || 0) + 1
        }
      } catch (err) {
        console.error('Gagal menambah item ke koleksi:', err)
        this.error = 'Gagal menyimpan item ke koleksi'
        throw err
      } finally {
        this.isLoading = false
      }
    },

    async removeItem(collectionId, questionId) {
      this.isLoading = true
      this.error = ''
      try {
        await api.removeFromCollection(collectionId, questionId)

        // Filter item out in cache
        if (this.collectionsItems[collectionId]) {
          this.collectionsItems[collectionId] = this.collectionsItems[collectionId].filter(
            i => String(i.question_id || i.id) !== String(questionId)
          )
        }

        // Decrement item_count in metadata
        const col = this.collections.find(c => c.id === collectionId)
        if (col && col.item_count > 0) {
          col.item_count -= 1
        }
      } catch (err) {
        console.error('Gagal menghapus item dari koleksi:', err)
        this.error = 'Gagal menghapus item dari koleksi'
        throw err
      } finally {
        this.isLoading = false
      }
    }
  },

  getters: {
    hasCollections: (state) => state.collections.length > 0,
    getById: (state) => (id) => state.collections.find(c => c.id === id),
    isSaved: (state) => (questionId) => {
      const qStr = String(questionId)
      return Object.values(state.collectionsItems).some(items =>
        items.some(item => String(item.question_id || item.id) === qStr)
      )
    }
  }
})
