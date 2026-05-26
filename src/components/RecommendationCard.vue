<script setup>
import { ref, computed, watch } from 'vue'
import ScoreBar from './ScoreBar.vue'
import SimilarityBadge from './SimilarityBadge.vue'
import FeedbackStars from './FeedbackStars.vue'
import PersonalizationBadge from './PersonalizationBadge.vue'
import SaveToCollectionModal from './SaveToCollectionModal.vue'
import { useAuthStore } from '../stores/auth.js'
import { useCollectionsStore } from '../stores/collections.js'
import * as api from '../api/index.js'
import { getRecommendationQuestionId } from '../utils/recommendationIds.js'

const collectionsStore = useCollectionsStore()
const showSaveModal = ref(false)

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
  feedbackData: {
    type: Object,
    default: () => ({}),
  },
})

const authStore = useAuthStore()

const feedbackQuestionId = computed(() => {
  return getRecommendationQuestionId(props.item)
})

const initialFeedback = computed(() => {
  if (!feedbackQuestionId.value) return null
  return props.feedbackData?.[feedbackQuestionId.value] || null
})

const isSaved = computed(() => {
  if (!feedbackQuestionId.value) return false
  return collectionsStore.isSaved(feedbackQuestionId.value)
})

const isExpanded = ref(false)
const previewText = computed(() => props.item.answer_preview || '')
const answerText = computed(() => props.item.answer_full || props.item.answer_preview || '')
const displayedAnswer = computed(() => {
  return isExpanded.value ? answerText.value : previewText.value
})
const hasMore = computed(() => {
  return props.item.answer_full && props.item.answer_full.length > previewText.value.length
})

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
}

const TRANSLATION_LANGUAGES = [
  { code: 'id', label: 'Indonesia' },
  { code: 'en', label: 'Inggris' },
  { code: 'es', label: 'Spanyol' },
  { code: 'fr', label: 'Prancis' },
  { code: 'de', label: 'Jerman' },
  { code: 'ja', label: 'Jepang' },
  { code: 'ko', label: 'Korea' },
  { code: 'ar', label: 'Arab' },
]

const isTranslating = ref(false)
const showTranslation = ref(false)
const selectedLanguage = ref('id')
const translations = ref({})
const translationError = ref('')
const copySuccess = ref(false)

const selectedLanguageLabel = computed(() => {
  return (
    TRANSLATION_LANGUAGES.find((lang) => lang.code === selectedLanguage.value)?.label || 'Indonesia'
  )
})

const currentTranslation = computed(() => {
  return translations.value[selectedLanguage.value]
})

const translateButtonLabel = computed(() => {
  if (isTranslating.value) return 'Menerjemahkan...'
  if (showTranslation.value && currentTranslation.value) return 'Sembunyikan'
  if (currentTranslation.value) return 'Tampilkan'
  return 'Terjemahkan'
})

const extractTranslatedText = (response, fallbackText) => {
  return (
    response.data?.translated ||
    response.data?.translated_text ||
    response.data?.text ||
    fallbackText
  )
}

watch(selectedLanguage, () => {
  translationError.value = ''
  if (!currentTranslation.value) {
    showTranslation.value = false
  }
})

const toggleTranslate = async () => {
  translationError.value = ''

  if (showTranslation.value && currentTranslation.value) {
    showTranslation.value = false
    return
  }

  if (currentTranslation.value) {
    showTranslation.value = true
    return
  }

  isTranslating.value = true
  try {
    const [qRes, aRes] = await Promise.all([
      api.translate(props.item.question, selectedLanguage.value),
      api.translate(answerText.value, selectedLanguage.value),
    ])

    translations.value = {
      ...translations.value,
      [selectedLanguage.value]: {
        question: extractTranslatedText(qRes, 'Gagal menerjemahkan pertanyaan.'),
        answer: extractTranslatedText(aRes, ''),
      },
    }
    showTranslation.value = true
  } catch (error) {
    console.error('Gagal melakukan terjemahan:', error)
    translationError.value = 'Gagal menerjemahkan teks. Coba lagi nanti.'
    showTranslation.value = true
  } finally {
    isTranslating.value = false
  }
}

const copyToClipboard = async () => {
  try {
    const textToCopy = `${props.item.question}\n\n${answerText.value}`
    await navigator.clipboard.writeText(textToCopy)
    copySuccess.value = true
    setTimeout(() => {
      copySuccess.value = false
    }, 2000)
  } catch (error) {
    console.error('Gagal menyalin ke clipboard:', error)
  }
}
</script>

<template>
  <div class="card">
    <div class="card-header">
      <SimilarityBadge :score="props.item.score_fusion" />
      <span class="tag-badge">{{ props.item.tag }}</span>
      <PersonalizationBadge
        :applied="props.item.personalization_applied"
        :boost="props.item.preference_boost"
      />
    </div>

    <div class="scores">
      <ScoreBar label="Fusion" :value="props.item.score_fusion ?? 0" color="fusion" />
      <ScoreBar label="TF-IDF" :value="props.item.score_tfidf ?? 0" color="tfidf" />
      <ScoreBar label="SBERT" :value="props.item.score_sbert ?? 0" color="sbert" />
    </div>

    <p class="question-text">{{ props.item.question }}</p>

    <div class="answer-container">
      <p class="answer-preview" :class="{ expanded: isExpanded }">
        {{ displayedAnswer }}
      </p>

      <button v-if="hasMore" class="btn-toggle-expand" @click="toggleExpand">
        <span>{{ isExpanded ? 'Sembunyikan Jawaban' : 'Selengkapnya' }}</span>
        <i class="expand-arrow-icon fa-solid fa-chevron-down" :class="{ rotated: isExpanded }"></i>
      </button>
    </div>

    <div class="card-actions">
      <div class="translate-controls">
        <label class="sr-only" :for="`translation-target-${props.item.id}`">
          Pilih bahasa terjemahan
        </label>
        <select
          :id="`translation-target-${props.item.id}`"
          v-model="selectedLanguage"
          class="language-select"
          :disabled="isTranslating"
        >
          <option
            v-for="language in TRANSLATION_LANGUAGES"
            :key="language.code"
            :value="language.code"
          >
            {{ language.label }}
          </option>
        </select>
        <button class="btn-action btn-translate" @click="toggleTranslate" :disabled="isTranslating">
          <i class="fa-solid fa-language" style="margin-right: 6px;"></i>
          <span>{{ translateButtonLabel }}</span>
        </button>
      </div>

      <button class="btn-action" @click="showSaveModal = true">
        <i class="fa-solid fa-bookmark" :style="{ color: isSaved ? 'var(--color-primary)' : 'inherit', marginRight: '6px' }"></i>
        <span :style="{ fontWeight: isSaved ? 'bold' : 'normal' }">{{ isSaved ? 'Tersimpan' : 'Simpan' }}</span>
      </button>

      <button class="btn-action" @click="copyToClipboard">
        <i v-if="copySuccess" class="fa-solid fa-check" style="margin-right: 6px;"></i>
        <i v-else class="fa-solid fa-copy" style="margin-right: 6px;"></i>
        <span>{{ copySuccess ? 'Tersalin!' : 'Salin' }}</span>
      </button>
    </div>

    <div
      v-if="showTranslation && (currentTranslation || translationError)"
      class="translation-block"
    >
      <p class="translation-label">Translate {{ selectedLanguageLabel }}</p>
      <template v-if="currentTranslation">
        <p class="translation-section-title">Question</p>
        <p class="translated-text">{{ currentTranslation.question }}</p>
        <p class="translation-section-title">Answer</p>
        <p class="translated-text">{{ currentTranslation.answer }}</p>
      </template>
      <p v-else class="translated-text">{{ translationError }}</p>
    </div>

    <div class="feedback-footer">
      <FeedbackStars
        :questionId="feedbackQuestionId"
        :query="props.item.question"
        :isLoggedIn="authStore.isLoggedIn"
        :initialFeedback="initialFeedback"
      />
    </div>

    <!-- Save to Collection Modal Overlay -->
    <SaveToCollectionModal
      :item="props.item"
      :show="showSaveModal"
      @close="showSaveModal = false"
    />
  </div>
</template>

<style scoped>
.card {
  background-color: var(--color-card-bg);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1.25rem;
  margin-bottom: 1rem;
  transition:
    border-color 0.2s ease,
    box-shadow var(--transition-speed);
}

.card:hover {
  border-color: var(--color-primary);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.tag-badge {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 11px;
  padding: 2px 8px;
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  color: var(--color-text-secondary);
}

.scores {
  padding-bottom: 12px;
  margin-bottom: 12px;
  border-bottom: 1px solid var(--color-border);
}

.question-text {
  font-size: 15px;
  font-weight: 500;
  color: var(--color-text);
  line-height: 1.5;
  margin-bottom: 8px;
}

.answer-container {
  margin-bottom: 12px;
}

.answer-preview {
  font-size: 13px;
  color: var(--color-text-secondary);
  line-height: 1.6;
  word-break: break-word;
  margin-bottom: 0;
}

.answer-preview.expanded {
  white-space: pre-wrap;
  color: var(--color-text);
}

.btn-toggle-expand {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: none;
  color: var(--color-primary);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  padding: 4px 0;
  margin-top: 4px;
  transition: color 0.15s ease;
  font-family: var(--font-body);
}

.btn-toggle-expand:hover {
  color: var(--color-primary-hover);
}

.expand-arrow-icon {
  transition: transform 0.2s ease;
}

.expand-arrow-icon.rotated {
  transform: rotate(180deg);
}

.card-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}

.translate-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.language-select {
  min-height: 30px;
  max-width: 140px;
  padding: 5px 28px 5px 10px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background-color: var(--color-card-bg);
  color: var(--color-text-secondary);
  font-size: 12px;
  cursor: pointer;
}

.language-select:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-action {
  min-height: 30px;
  padding: 6px 14px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background-color: transparent;
  color: var(--color-text-secondary);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: var(--font-body);
}

.btn-translate {
  min-width: 96px;
}

.btn-action:hover:not(:disabled) {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.btn-action:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.translation-block {
  background-color: var(--color-bg-secondary);
  border-left: 3px solid var(--color-primary);
  padding: 10px 14px;
  border-radius: 0 8px 8px 0;
  margin-bottom: 12px;
}

.translation-label {
  font-size: 11px;
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  color: var(--color-text-secondary);
  margin-bottom: 8px;
}

.translation-section-title {
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-secondary);
  margin: 8px 0 2px;
  text-transform: uppercase;
}

.translated-text {
  font-size: 13px;
  color: var(--color-text);
  line-height: 1.6;
  word-break: break-word;
}

.feedback-footer {
  padding-top: 10px;
  margin-top: 10px;
  border-top: 1px solid var(--color-border);
}
</style>
