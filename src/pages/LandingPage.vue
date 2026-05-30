<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { recommend } from '../api/index.js'

const router = useRouter()
const isDark = ref(false)

// ─── Theme Management (Following System Preference by default) ────────────────
onMounted(() => {
  const savedTheme = localStorage.getItem('sm_theme')
  if (savedTheme === 'dark') {
    isDark.value = true
    document.documentElement.classList.add('dark')
  } else if (savedTheme === 'light') {
    isDark.value = false
    document.documentElement.classList.remove('dark')
  } else {
    // If no preference stored, follow system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    isDark.value = prefersDark
    document.documentElement.classList.toggle('dark', prefersDark)
  }

  // Listener for system preference changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('sm_theme')) {
      isDark.value = e.matches
      document.documentElement.classList.toggle('dark', e.matches)
    }
  })
})

const toggleTheme = () => {
  isDark.value = !isDark.value
  if (isDark.value) {
    document.documentElement.classList.add('dark')
    localStorage.setItem('sm_theme', 'dark')
  } else {
    document.documentElement.classList.remove('dark')
    localStorage.setItem('sm_theme', 'light')
  }
}

const isMobileMenuOpen = ref(false)

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}

// ─── Navigation helper ────────────────────────────────────────────────────────
const navigateToLogin = () => {
  closeMobileMenu()
  router.push('/login')
}

const navigateToRegister = () => {
  closeMobileMenu()
  router.push('/register')
}

const scrollToSection = (id) => {
  closeMobileMenu()
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' })
  }
}

// ─── SVG Animated Path Generation (matching React component style) ────────────
const getPaths = (position) => {
  return Array.from({ length: 36 }, (_, i) => ({
    id: i,
    d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
      380 - i * 5 * position
    } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
      152 - i * 5 * position
    } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
      684 - i * 5 * position
    } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
    width: 0.5 + i * 0.03,
  }))
}

const leftPaths = computed(() => getPaths(1))
const rightPaths = computed(() => getPaths(-1))

// ─── Interactive Demo State & Simulation Data ─────────────────────────────────
const demoQuery = ref('')
const demoTag = ref('')
const demoLoading = ref(false)
const demoStep = ref('')
const demoResults = ref([])
const hasSearched = ref(false)

const predefinedQueries = [
  { label: 'Python File Read', text: 'Bagaimana cara membaca file teks baris demi baris di Python?', tag: 'python' },
  { label: 'JS Async Await', text: 'Cara handle asynchronous API response menggunakan async/await di JS', tag: 'javascript' },
  { label: 'Postgres Indexing', text: 'How to optimize SQL query performance using indexing in PostgreSQL?', tag: 'database' },
  { label: 'Go JWT Auth', text: 'Cara implementasi JSON Web Token untuk route middleware di Golang', tag: 'go' }
]

const setDemoQuery = (item) => {
  demoQuery.value = item.text
  demoTag.value = item.tag
}

// Simulated Recommendations Database
const simulatedDb = {
  python: [
    {
      question: 'What is the best way to read a large text file in Python?',
      tag: 'python',
      scores: { fusion: 0.89, tfidf: 0.78, sbert: 0.94 },
      similarity: 'Tinggi'
    },
    {
      question: 'How to read file line by line in Python and save results to list?',
      tag: 'python',
      scores: { fusion: 0.74, tfidf: 0.62, sbert: 0.81 },
      similarity: 'Tinggi'
    },
    {
      question: 'Reading flat JSON files using built-in Python modules',
      tag: 'python',
      scores: { fusion: 0.55, tfidf: 0.41, sbert: 0.64 },
      similarity: 'Sedang'
    }
  ],
  javascript: [
    {
      question: 'How do I return the response from an asynchronous call in JavaScript?',
      tag: 'javascript',
      scores: { fusion: 0.91, tfidf: 0.82, sbert: 0.96 },
      similarity: 'Tinggi'
    },
    {
      question: 'Understanding Promises, Async/Await and Event Loop in Node.js',
      tag: 'javascript',
      scores: { fusion: 0.71, tfidf: 0.58, sbert: 0.78 },
      similarity: 'Tinggi'
    },
    {
      question: 'How to chain multiple asynchronous API calls in Vanilla JavaScript',
      tag: 'javascript',
      scores: { fusion: 0.48, tfidf: 0.35, sbert: 0.57 },
      similarity: 'Sedang'
    }
  ],
  database: [
    {
      question: 'How to optimize SQL queries using indexes in PostgreSQL database?',
      tag: 'database',
      scores: { fusion: 0.86, tfidf: 0.79, sbert: 0.91 },
      similarity: 'Tinggi'
    },
    {
      question: 'When should I use index on foreign keys in relational databases?',
      tag: 'database',
      scores: { fusion: 0.63, tfidf: 0.49, sbert: 0.72 },
      similarity: 'Sedang'
    },
    {
      question: 'PostgreSQL performance query execution plan analysis (EXPLAIN ANALYZE)',
      tag: 'database',
      scores: { fusion: 0.38, tfidf: 0.22, sbert: 0.48 },
      similarity: 'Rendah'
    }
  ],
  go: [
    {
      question: 'How to implement JWT authentication in Go microservices using gin middleware?',
      tag: 'go',
      scores: { fusion: 0.88, tfidf: 0.81, sbert: 0.92 },
      similarity: 'Tinggi'
    },
    {
      question: 'Implementing route authorization with JSON Web Tokens (JWT) in Go HTTP server',
      tag: 'go',
      scores: { fusion: 0.69, tfidf: 0.54, sbert: 0.79 },
      similarity: 'Sedang'
    },
    {
      question: 'Securing API endpoints in Go using custom HTTP Handler functions',
      tag: 'go',
      scores: { fusion: 0.35, tfidf: 0.18, sbert: 0.45 },
      similarity: 'Rendah'
    }
  ]
}

const runDemoSearch = async () => {
  if (!demoQuery.value.trim()) return

  demoLoading.value = true
  hasSearched.value = true
  demoResults.value = []

  // Step 1: Detect translation if query is Indonesian
  const queryLower = demoQuery.value.toLowerCase()
  const isIndo = /[a-z]/i.test(queryLower) && 
    (queryLower.includes('bagaimana') || queryLower.includes('cara') || queryLower.includes('apa') || queryLower.includes('di') || queryLower.includes('ke'))

  if (isIndo) {
    demoStep.value = 'Deteksi Bahasa: Indonesia. Menerjemahkan ke bahasa Inggris menggunakan Deep-Translator...'
    await new Promise((r) => setTimeout(r, 900))
  }

  demoStep.value = 'AI memproses query... Mengekstrak representasi TF-IDF & Vektor Semantik SBERT...'
  await new Promise((r) => setTimeout(r, 700))

  demoStep.value = 'Mencari index kemiripan kosinus tercepat menggunakan FAISS...'
  await new Promise((r) => setTimeout(r, 500))

  // Try fetching from real backend. If it fails, fall back to mock
  try {
    const response = await recommend(demoQuery.value, 3, 'auto')
    if (response?.data?.recommendations && response.data.recommendations.length > 0) {
      demoResults.value = response.data.recommendations.map(r => ({
        question: r.question,
        tag: r.tag || demoTag.value || 'general',
        scores: {
          fusion: r.score_fusion ?? 0.82,
          tfidf: r.score_tfidf ?? 0.71,
          sbert: r.score_sbert ?? 0.89
        },
        similarity: (r.score_fusion ?? 0.82) > 0.7 ? 'Tinggi' : (r.score_fusion ?? 0.82) > 0.4 ? 'Sedang' : 'Rendah'
      }))
    } else {
      throw new Error('No results from backend')
    }
  } catch (err) {
    // Fallback to simulated database matching
    let matchedTag = demoTag.value
    if (!matchedTag) {
      if (queryLower.includes('python')) matchedTag = 'python'
      else if (queryLower.includes('js') || queryLower.includes('javascript') || queryLower.includes('async')) matchedTag = 'javascript'
      else if (queryLower.includes('postgres') || queryLower.includes('database') || queryLower.includes('sql')) matchedTag = 'database'
      else if (queryLower.includes('go') || queryLower.includes('golang') || queryLower.includes('jwt')) matchedTag = 'go'
      else matchedTag = 'python' // default fallback
    }
    demoResults.value = simulatedDb[matchedTag] || simulatedDb.python
  } finally {
    demoLoading.value = false
    demoStep.value = ''
  }
}

const getSimilarityClass = (similarity) => {
  if (similarity === 'Tinggi') return 'badge-success'
  if (similarity === 'Sedang') return 'badge-warning'
  return 'badge-danger'
}
</script>

<template>
  <div class="landing-container" :class="{ 'dark-mode': isDark }">
    
    <!-- ─── HEADER / NAVBAR ─── -->
    <header class="lp-header">
      <div class="lp-header-container">
        <div class="lp-brand">
          <img src="../assets/logo2.png" alt="StackMatch Logo" class="lp-brand-logo" />
          <span class="lp-brand-title">StackMatch</span>
        </div>
        <nav class="lp-nav">
          <button class="lp-nav-link" @click="scrollToSection('features-section')">Fitur</button>
          <button class="lp-nav-link" @click="scrollToSection('how-it-works')">Cara Kerja</button>
          <button class="lp-nav-link" @click="scrollToSection('score-explanation')">Skor</button>
        </nav>
        <div class="lp-actions">
          <button 
            class="theme-toggle-btn" 
            @click="toggleTheme" 
            :aria-label="isDark ? 'Mode Terang' : 'Mode Gelap'"
            :title="isDark ? 'Mode Terang' : 'Mode Gelap'"
          >
            <i v-if="isDark" class="fa-solid fa-sun"></i>
            <i v-else class="fa-solid fa-moon"></i>
          </button>
          <button class="btn-outline-header desktop-only" @click="navigateToRegister">Daftar</button>
          <button class="btn-primary-header desktop-only" @click="navigateToLogin">Masuk</button>
          <button 
            class="mobile-menu-btn" 
            @click="toggleMobileMenu" 
            :aria-label="isMobileMenuOpen ? 'Tutup menu' : 'Buka menu'"
          >
            <i :class="['fa-solid', isMobileMenuOpen ? 'fa-xmark' : 'fa-bars']"></i>
          </button>
        </div>
      </div>
      
      <!-- Mobile Navigation Drawer -->
      <div class="mobile-menu-drawer" :class="{ open: isMobileMenuOpen }">
        <button class="mobile-menu-link" @click="scrollToSection('features-section')">Fitur</button>
        <button class="mobile-menu-link" @click="scrollToSection('how-it-works')">Cara Kerja</button>
        <button class="mobile-menu-link" @click="scrollToSection('score-explanation')">Skor</button>
        <div class="mobile-menu-divider"></div>
        <div class="mobile-menu-actions">
          <button class="btn-mobile-outline" @click="navigateToRegister">Daftar</button>
          <button class="btn-mobile-primary" @click="navigateToLogin">Masuk</button>
        </div>
      </div>
    </header>

    <!-- ─── BG PATHS EFFECT (GPU ACCELERATED ANIMATED BACKDROP) ─── -->
    <div class="floating-paths-container">
      <svg class="floating-paths-svg" viewBox="0 0 696 316" fill="none">
        <path
          v-for="p in leftPaths"
          :key="'l-' + p.id"
          :d="p.d"
          stroke="currentColor"
          :stroke-width="p.width"
          class="animated-svg-path"
        />
        <path
          v-for="p in rightPaths"
          :key="'r-' + p.id"
          :d="p.d"
          stroke="currentColor"
          :stroke-width="p.width"
          class="animated-svg-path"
        />
      </svg>
    </div>

    <!-- ─── HERO SECTION ─── -->
    <section class="section-hero">
      <div class="hero-content">
        <div class="badge-capsule">
          <span class="badge-capsule-dot"></span>
          <span class="badge-capsule-text">v1.2 — SaaS Ready</span>
        </div>
        
        <h1 class="hero-headline">
          Smart Question Recommendations <span class="break-mobile">for Developers</span>
        </h1>
        
        <p class="hero-subheadline">
          StackMatch menemukan pertanyaan paling relevan dari ribuan data menggunakan AI — TF-IDF, SBERT, dan FAISS bekerja bersama.
        </p>

        <div class="hero-cta-group">
          <button class="btn-hero-primary" @click="scrollToSection('demo-section')">
            Coba Sekarang <span class="arrow">→</span>
          </button>
          <button class="btn-hero-secondary" @click="scrollToSection('how-it-works')">
            Pelajari Cara Kerja
          </button>
        </div>
      </div>

      <!-- ─── HERO VISUAL: MOCKUP RECOMMENDATION CARD ─── -->
      <div class="hero-visual">
        <div class="lp-flat-card mockup-card">
          <div class="mockup-card-header">
            <span class="mockup-tag">python</span>
            <div class="similarity-badge badge-success">Similarity: Tinggi</div>
          </div>
          <h3 class="mockup-question">
            Bagaimana cara melakukan pencarian kemiripan teks secara efisien di Python?
          </h3>
          <div class="mockup-scores">
            <div class="mockup-score-row">
              <div class="score-label-wrap">
                <span class="score-name font-mono">score_fusion</span>
                <span class="score-value font-mono">0.89</span>
              </div>
              <div class="progress-bar-container">
                <div class="progress-bar-fill progress-fusion" style="width: 89%"></div>
              </div>
            </div>
            <div class="mockup-score-row">
              <div class="score-label-wrap">
                <span class="score-name font-mono">score_tfidf</span>
                <span class="score-value font-mono">0.65</span>
              </div>
              <div class="progress-bar-container">
                <div class="progress-bar-fill progress-tfidf" style="width: 65%"></div>
              </div>
            </div>
            <div class="mockup-score-row">
              <div class="score-label-wrap">
                <span class="score-name font-mono">score_sbert</span>
                <span class="score-value font-mono">0.92</span>
              </div>
              <div class="progress-bar-container">
                <div class="progress-bar-fill progress-sbert" style="width: 92%"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ─── INTERACTIVE DEMO SECTION ─── -->
    <section id="demo-section" class="section-demo">
      <div class="container-narrow">
        <div class="section-title-wrap">
          <h2 class="section-title">Uji Coba Demo Sandbox</h2>
          <p class="section-desc">
            Masukkan pertanyaan teknis Anda di bawah ini untuk melihat bagaimana mesin hibrida kami mendeteksi makna semantik dan merekomendasikan topik yang sesuai.
          </p>
        </div>

        <div class="lp-flat-card demo-box">
          <div class="demo-form">
            <div class="form-group">
              <label for="query-input" class="form-label font-mono">Input Pertanyaan Developer</label>
              <div class="input-wrapper">
                <input 
                  id="query-input"
                  type="text" 
                  v-model="demoQuery"
                  placeholder="Ketik pertanyaan... (Contoh: cara membaca file di python)"
                  class="demo-input"
                  @keyup.enter="runDemoSearch"
                />
                <button 
                  class="btn-demo-search" 
                  @click="runDemoSearch" 
                  :disabled="demoLoading || !demoQuery.trim()"
                >
                  <span v-if="demoLoading"><i class="fa-solid fa-spinner fa-spin"></i></span>
                  <span v-else>Cari</span>
                </button>
              </div>
            </div>

            <!-- Chips Rekomendasi Cepat -->
            <div class="predefined-chips-wrap">
              <span class="chips-label font-mono">Quick Search:</span>
              <div class="chips-scroll">
                <button 
                  v-for="(item, idx) in predefinedQueries" 
                  :key="idx" 
                  class="chip-btn font-mono"
                  @click="setDemoQuery(item)"
                >
                  {{ item.label }}
                </button>
              </div>
            </div>

            <!-- Dropdown Filter Tag Bahasa -->
            <div class="form-group tag-dropdown-group">
              <label for="tag-select" class="form-label font-mono">Filter Tag Bahasa (Opsional)</label>
              <select id="tag-select" v-model="demoTag" class="demo-select">
                <option value="">Semua Bahasa / Tag</option>
                <option value="python">Python</option>
                <option value="javascript">JavaScript</option>
                <option value="database">Database / SQL</option>
                <option value="go">Golang</option>
              </select>
            </div>
          </div>

          <!-- Loading State AI -->
          <div v-if="demoLoading" class="demo-loading-state font-mono">
            <div class="spinner-inline"></div>
            <p>{{ demoStep }}</p>
          </div>

          <!-- Demo Results -->
          <div v-if="hasSearched && !demoLoading" class="demo-results-wrapper">
            <h4 class="results-header font-mono">HASIL REKOMENDASI (TOP 3 RELEVANSI)</h4>
            
            <div v-if="demoResults.length === 0" class="no-results font-mono">
              Tidak ada data rekomendasi yang ditemukan untuk query tersebut.
            </div>
            
            <div v-else class="demo-results-list">
              <div 
                v-for="(res, idx) in demoResults" 
                :key="idx" 
                class="lp-flat-card result-item-card"
              >
                <div class="result-item-header">
                  <span class="result-tag font-mono">{{ res.tag }}</span>
                  <span :class="['similarity-badge', getSimilarityClass(res.similarity)]">
                    Similarity: {{ res.similarity }}
                  </span>
                </div>
                
                <h4 class="result-question">{{ res.question }}</h4>
                
                <div class="result-scores-grid">
                  <div class="score-item">
                    <div class="score-title font-mono">
                      <span>Fusion</span>
                      <span>{{ res.scores.fusion.toFixed(2) }}</span>
                    </div>
                    <div class="progress-bar-container">
                      <div 
                        class="progress-bar-fill progress-fusion" 
                        :style="{ width: (res.scores.fusion * 100) + '%' }"
                      ></div>
                    </div>
                  </div>
                  
                  <div class="score-item">
                    <div class="score-title font-mono">
                      <span>TFIDF</span>
                      <span>{{ res.scores.tfidf.toFixed(2) }}</span>
                    </div>
                    <div class="progress-bar-container">
                      <div 
                        class="progress-bar-fill progress-tfidf" 
                        :style="{ width: (res.scores.tfidf * 100) + '%' }"
                      ></div>
                    </div>
                  </div>

                  <div class="score-item">
                    <div class="score-title font-mono">
                      <span>SBERT</span>
                      <span>{{ res.scores.sbert.toFixed(2) }}</span>
                    </div>
                    <div class="progress-bar-container">
                      <div 
                        class="progress-bar-fill progress-sbert" 
                        :style="{ width: (res.scores.sbert * 100) + '%' }"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ─── FEATURES SECTION (3 COLUMNS) ─── -->
    <section id="features-section" class="section-features">
      <div class="section-title-wrap">
        <h2 class="section-title">Fitur Utama Platform</h2>
        <p class="section-desc">Didesain dengan arsitektur tangguh untuk memberikan saran pencarian terbaik bagi workflow developer.</p>
      </div>

      <div class="features-grid">
        <!-- Feature 1 -->
        <div class="lp-flat-card feature-card">
          <div class="feature-icon"><i class="fa-solid fa-brain"></i></div>
          <h3 class="feature-card-title">Hybrid AI Search</h3>
          <p class="feature-card-desc">
            Menggabungkan TF-IDF berbasis kata kunci konvensional dengan SBERT untuk semantic understanding yang menangkap maksud sejati di balik kode.
          </p>
        </div>

        <!-- Feature 2 -->
        <div class="lp-flat-card feature-card">
          <div class="feature-icon"><i class="fa-solid fa-filter"></i></div>
          <h3 class="feature-card-title">Tag Filter</h3>
          <p class="feature-card-desc">
            Saring hasil pencarian langsung per bahasa pemrograman atau runtime (seperti Python, JS, Go, SQL) secara real-time demi relevansi maksimal.
          </p>
        </div>

        <!-- Feature 3 -->
        <div class="lp-flat-card feature-card">
          <div class="feature-icon"><i class="fa-solid fa-chart-line"></i></div>
          <h3 class="feature-card-title">Analytics & Feedback</h3>
          <p class="feature-card-desc">
            Pantau statistik penggunaan dataset, riwayat penelusuran, serta rating relevansi yang dikirim langsung oleh pengguna komunitas Anda.
          </p>
        </div>
      </div>
    </section>

    <!-- ─── HOW IT WORKS SECTION (4 STEPS) ─── -->
    <section id="how-it-works" class="section-how">
      <div class="section-title-wrap">
        <h2 class="section-title">Cara Kerja Pencarian Hibrida</h2>
        <p class="section-desc">Bagaimana StackMatch memproses input query hingga menyajikan kemiripan teks tingkat tinggi.</p>
      </div>

      <div class="steps-container">
        <!-- Step 1 -->
        <div class="step-card">
          <div class="step-num font-mono">01</div>
          <h4 class="step-title">Pilih Bahasa Pemrograman</h4>
          <p class="step-desc">Tentukan filter teknologi opsional untuk membatasi ruang lingkup pencarian AI.</p>
        </div>

        <div class="step-arrow"><i class="fa-solid fa-chevron-right"></i></div>
        <!-- Step 1 -->
        <div class="step-card">
          <div class="step-num font-mono">02</div>
          <h4 class="step-title">Ketik Pertanyaan</h4>
          <p class="step-desc">Developer mengetikkan query pencarian dalam bahasa alami di portal input StackMatch.</p>
        </div>
        
        <div class="step-arrow"><i class="fa-solid fa-chevron-right"></i></div>


        <!-- Step 3 -->
        <div class="step-card">
          <div class="step-num font-mono">03</div>
          <h4 class="step-title">AI Memproses Query</h4>
          <p class="step-desc">Query diterjemahkan otomatis ke bahasa Inggris jika diperlukan, lalu diekstrak ke representasi vektor.</p>
        </div>

        <div class="step-arrow"><i class="fa-solid fa-chevron-right"></i></div>

        <!-- Step 4 -->
        <div class="step-card">
          <div class="step-num font-mono">04</div>
          <h4 class="step-title">Hasil Muncul</h4>
          <p class="step-desc">Hasil relevan ditampilkan dengan visualisasi 3 skor utama (Fusion, TF-IDF, SBERT).</p>
        </div>
      </div>
    </section>

    <!-- ─── SCORE EXPLANATION SECTION ─── -->
    <section id="score-explanation" class="section-scores">
      <div class="container-narrow">
        <div class="section-title-wrap">
          <h2 class="section-title">Metrik & Pemeringkatan Skor</h2>
          <p class="section-desc">Pahami arti di balik sistem skor hibrida yang kami gunakan untuk menjamin akurasi data.</p>
        </div>

        <div class="lp-flat-card explanation-box">
          <div class="scores-demo-column">
            <!-- score_fusion -->
            <div class="explanation-score-item">
              <div class="exp-score-header">
                <span class="score-badge-label font-mono" style="background-color: rgba(55, 138, 221, 0.1); color: var(--color-score-fusion)">score_fusion</span>
                <span class="score-definition font-mono">Range 0.0 - 1.0</span>
              </div>
              <p class="score-desc">
                Gabungan skor akhir terbobot yang menyeimbangkan kecocokan kata kunci eksak dan pemahaman makna semantik. Menjadi prioritas pengurutan utama.
              </p>
              <div class="progress-bar-container">
                <div class="progress-bar-fill progress-fusion" style="width: 85%"></div>
              </div>
            </div>

            <!-- score_tfidf -->
            <div class="explanation-score-item">
              <div class="exp-score-header">
                <span class="score-badge-label font-mono" style="background-color: rgba(99, 153, 34, 0.1); color: var(--color-score-tfidf)">score_tfidf</span>
                <span class="score-definition font-mono">Range 0.0 - 1.0</span>
              </div>
              <p class="score-desc">
                Mengukur kemiripan berbasis frekuensi kata kunci (TF-IDF). Sangat efisien untuk mendeteksi kecocokan kode spesifik, nama library, atau sintaksis.
              </p>
              <div class="progress-bar-container">
                <div class="progress-bar-fill progress-tfidf" style="width: 60%"></div>
              </div>
            </div>

            <!-- score_sbert -->
            <div class="explanation-score-item">
              <div class="exp-score-header">
                <span class="score-badge-label font-mono" style="background-color: rgba(127, 119, 221, 0.1); color: var(--color-score-sbert)">score_sbert</span>
                <span class="score-definition font-mono">Range 0.0 - 1.0</span>
              </div>
              <p class="score-desc">
                Kemiripan makna semantik berdasarkan model Sentence-BERT. Mampu memahami maksud query meskipun developer menggunakan sinonim atau kosa kata berbeda.
              </p>
              <div class="progress-bar-container">
                <div class="progress-bar-fill progress-sbert" style="width: 90%"></div>
              </div>
            </div>
          </div>

          <div class="divider-v"></div>

          <!-- Similarity Badges Info -->
          <div class="badges-info-column">
            <h4 class="info-subtitle font-mono">SIMILARITY BADGES</h4>
            <p class="badges-description">
              Tingkat kesamaan keseluruhan dikelompokkan menjadi tiga kategori utama berdasarkan batas nilai ambang batas (threshold) skor fusion:
            </p>
            
            <div class="badge-info-list">
              <div class="badge-info-item">
                <span class="similarity-badge badge-success">Tinggi</span>
                <span class="badge-threshold font-mono">> 0.70</span>
                <p class="badge-text-detail">Kemiripan sangat tinggi. Jawaban hampir dipastikan relevan penuh dengan query.</p>
              </div>

              <div class="badge-info-item">
                <span class="similarity-badge badge-warning">Sedang</span>
                <span class="badge-threshold font-mono">0.40 - 0.70</span>
                <p class="badge-text-detail">Kemiripan cukup memadai. Memiliki irisan topik tetapi kemungkinan butuh penyesuaian konteks.</p>
              </div>

              <div class="badge-info-item">
                <span class="similarity-badge badge-danger">Rendah</span>
                <span class="badge-threshold font-mono">&lt; 0.40</span>
                <p class="badge-text-detail">Kemiripan rendah. Hanya memiliki kecocokan minimal pada kata kunci terisolasi.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>



    <!-- ─── TECH STACK SECTION (HORIZONTAL CHIPS) ─── -->
    <section class="section-tech-stack">
      <div class="section-title-wrap">
        <h4 class="tech-stack-title font-mono">STACK TEKNOLOGI INTI</h4>
      </div>
      <div class="tech-chips-container">
        <span class="tech-chip font-mono">Python</span>
        <span class="tech-chip font-mono">Flask/FastAPI</span>
        <span class="tech-chip font-mono">TF-IDF</span>
        <span class="tech-chip font-mono">SBERT (all-MiniLM-L6-v2)</span>
        <span class="tech-chip font-mono">FAISS</span>
        <span class="tech-chip font-mono">JWT Auth</span>
        <span class="tech-chip font-mono">deep-translator</span>
      </div>
    </section>

    <!-- ─── CTA FINAL SECTION ─── -->
    <section class="section-cta-final">
      <div class="lp-flat-card cta-final-box">
        <h2 class="cta-headline">Siap mulai integrasi?</h2>
        <p class="cta-desc">
          StackMatch tersedia sebagai REST API. Daftarkan akun developer Anda dan dapatkan access token dalam hitungan detik.
        </p>
        <div class="cta-final-buttons">
          <button class="btn-cta-primary-large" @click="navigateToRegister">Daftar Gratis</button>
          <button class="btn-cta-secondary-large" @click="navigateToLogin">Hubungi Tim</button>
        </div>
      </div>
    </section>

    <!-- ─── FOOTER ─── -->
    <footer class="lp-footer">
      <div class="lp-footer-top">
        <div class="footer-brand font-mono">StackMatch v1.2</div>
        <div class="footer-links">
          <a href="#" @click.prevent="scrollToSection('how-it-works')">Cara Kerja</a>
          <span class="dot-separator">·</span>
          <a href="#" @click.prevent="scrollToSection('score-explanation')">Sistem Skor</a>
          <span class="dot-separator">·</span>
          <a href="#" @click.prevent>Changelog</a>
          <span class="dot-separator">·</span>
          <a href="#" @click.prevent>Kontak</a>
        </div>
      </div>
      <div class="lp-footer-bottom">
        <p class="footer-confidential font-mono">© 2026 StackMatch. Confidential — Internal Use Only.</p>
      </div>
    </footer>

  </div>
</template>

<style scoped>
/* ─── DESIGN SYSTEM & TOKENS ─── */
.landing-container {
  --lp-bg: var(--color-bg, #ffffff);
  --lp-bg-secondary: var(--color-bg-secondary, #f5f5f5);
  --lp-text: var(--color-text, #1a1a1a);
  --lp-text-sec: var(--color-text-secondary, #6b6b6b);
  --lp-border: var(--color-border, #e0e0e0);
  --lp-card-bg: var(--color-card-bg, #ffffff);
  --lp-primary: var(--color-primary, #378ADD);
  --lp-primary-hover: var(--color-primary-hover, #1d4ed8);
  
  --fusion-color: #378ADD;
  --tfidf-color: #639922;
  --sbert-color: #7F77DD;
  
  font-family: var(--font-body, 'Plus Jakarta Sans', sans-serif);
  background-color: var(--lp-bg);
  color: var(--lp-text);
  min-height: 100vh;
  position: relative;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  transition: background-color 0.25s ease, color 0.25s ease;
}

/* Helper utilities */
.font-mono {
  font-family: var(--font-mono, 'JetBrains Mono', monospace) !important;
}

.container-narrow {
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
}

.lp-flat-card {
  border: 0.5px solid var(--lp-border);
  border-radius: 12px;
  background-color: var(--lp-card-bg);
  padding: 24px;
  transition: border-color 0.2s ease;
}

/* ─── HEADER / NAVBAR ─── */
.lp-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background-color: rgba(255, 255, 255, 0.85);
  border-bottom: 0.5px solid var(--lp-border);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  transition: background-color 0.25s ease, border-color 0.25s ease;
}
.dark-mode .lp-header {
  background-color: rgba(15, 15, 15, 0.85);
}

.lp-header-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.lp-brand {
  display: flex;
  align-items: center;
  gap: 10px;
}

.lp-brand-logo {
  height: 36px;
  width: auto;
}

.lp-brand-title {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.03em;
}

.lp-nav {
  display: flex;
  gap: 24px;
}

.lp-nav-link {
  background: transparent;
  border: none;
  color: var(--lp-text-sec);
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  padding: 8px 0;
  transition: color 0.15s ease;
}

.lp-nav-link:hover {
  color: var(--lp-text);
  text-decoration: none;
}

.lp-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.theme-toggle-btn {
  background: transparent;
  border: 0.5px solid var(--lp-border);
  color: var(--lp-text);
  border-radius: 8px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
}
.theme-toggle-btn:hover {
  background-color: var(--lp-bg-secondary);
}

.btn-outline-header {
  background: transparent;
  border: 0.5px solid var(--lp-border);
  color: var(--lp-text);
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  height: 36px;
  transition: all 0.15s ease;
}
.btn-outline-header:hover {
  background-color: var(--lp-bg-secondary);
}

.btn-primary-header {
  background-color: var(--lp-text);
  color: var(--lp-bg);
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  height: 36px;
  transition: opacity 0.15s ease;
}
.btn-primary-header:hover {
  opacity: 0.9;
}

.desktop-only {
  display: inline-flex;
}

@media (max-width: 768px) {
  .desktop-only {
    display: none !important;
  }
}

.mobile-menu-btn {
  display: none;
  background: transparent;
  border: 0.5px solid var(--lp-border);
  color: var(--lp-text);
  border-radius: 8px;
  width: 36px;
  height: 36px;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
}

@media (max-width: 768px) {
  .mobile-menu-btn {
    display: flex;
  }
}

.mobile-menu-btn:hover {
  background-color: var(--lp-bg-secondary);
}

.mobile-menu-drawer {
  display: none;
  flex-direction: column;
  position: absolute;
  top: 64px;
  left: 0;
  width: 100%;
  background-color: var(--lp-card-bg);
  border-bottom: 0.5px solid var(--lp-border);
  padding: 16px 24px 24px 24px;
  box-sizing: border-box;
  z-index: 99;
  transform: translateY(-10px);
  opacity: 0;
  pointer-events: none;
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.mobile-menu-drawer.open {
  transform: translateY(0);
  opacity: 1;
  pointer-events: auto;
}

@media (max-width: 768px) {
  .mobile-menu-drawer {
    display: flex;
  }
}

.mobile-menu-link {
  background: transparent;
  border: none;
  color: var(--lp-text-sec);
  font-weight: 600;
  font-size: 15px;
  text-align: left;
  padding: 12px 0;
  cursor: pointer;
  width: 100%;
  border-bottom: 0.5px solid rgba(0, 0, 0, 0.03);
  transition: color 0.15s ease;
}
.dark-mode .mobile-menu-link {
  border-bottom-color: rgba(255, 255, 255, 0.03);
}

.mobile-menu-link:hover {
  color: var(--lp-text);
}

.mobile-menu-divider {
  height: 1px;
  background-color: var(--lp-border);
  margin: 16px 0;
}

.mobile-menu-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.btn-mobile-outline {
  background: transparent;
  border: 0.5px solid var(--lp-border);
  color: var(--lp-text);
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  text-align: center;
  transition: all 0.15s ease;
}
.btn-mobile-outline:hover {
  background-color: var(--lp-bg-secondary);
}

.btn-mobile-primary {
  background-color: var(--lp-text);
  color: var(--lp-bg);
  border: none;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  text-align: center;
  transition: opacity 0.15s ease;
}
.btn-mobile-primary:hover {
  opacity: 0.9;
}

/* ─── BG DECORATIVE FLOATING PATHS ─── */
.floating-paths-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 600px;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
  color: rgba(15, 23, 42, 0.04);
}
.dark-mode .floating-paths-container {
  color: rgba(255, 255, 255, 0.03);
}

.floating-paths-svg {
  width: 100%;
  height: 100%;
}

.animated-svg-path {
  stroke-dasharray: 600;
  stroke-dashoffset: 600;
  animation: strokeDraw 24s linear infinite alternate;
}

@keyframes strokeDraw {
  0% {
    stroke-dashoffset: 600;
  }
  100% {
    stroke-dashoffset: 0;
  }
}

/* ─── HERO SECTION ─── */
.section-hero {
  max-width: 1280px;
  margin: 0 auto;
  padding: 80px 24px 60px 24px;
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  align-items: center;
  gap: 48px;
  z-index: 1;
}

.hero-content {
  text-align: left;
}

.badge-capsule {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background-color: var(--lp-bg-secondary);
  border: 0.5px solid var(--lp-border);
  padding: 6px 12px;
  border-radius: 99px;
  margin-bottom: 24px;
}

.badge-capsule-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: var(--fusion-color);
}

.badge-capsule-text {
  font-family: var(--font-mono, monospace);
  font-size: 12px;
  font-weight: 600;
  color: var(--lp-text-sec);
}

.hero-headline {
  font-size: 48px;
  font-weight: 800;
  line-height: 1.15;
  letter-spacing: -0.04em;
  margin-bottom: 20px;
}

.hero-subheadline {
  font-size: 18px;
  line-height: 1.6;
  color: var(--lp-text-sec);
  margin-bottom: 32px;
}

.hero-cta-group {
  display: flex;
  gap: 16px;
}

.btn-hero-primary {
  background-color: var(--lp-text);
  color: var(--lp-bg);
  border: none;
  padding: 14px 28px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  transition: opacity 0.15s ease;
}
.btn-hero-primary:hover {
  opacity: 0.95;
}

.btn-hero-primary .arrow {
  transition: transform 0.15s ease;
}
.btn-hero-primary:hover .arrow {
  transform: translateX(4px);
}

.btn-hero-secondary {
  background: transparent;
  border: 0.5px solid var(--lp-border);
  color: var(--lp-text);
  padding: 14px 28px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.15s ease;
}
.btn-hero-secondary:hover {
  background-color: var(--lp-bg-secondary);
}

/* HERO VISUAL: MOCKUP */
.hero-visual {
  display: flex;
  justify-content: center;
}

.mockup-card {
  width: 100%;
  max-width: 460px;
  border-color: var(--lp-border);
}

.mockup-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.mockup-tag {
  font-family: var(--font-mono, monospace);
  background-color: var(--lp-bg-secondary);
  border: 0.5px solid var(--lp-border);
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  color: var(--lp-text-sec);
}

.similarity-badge {
  font-family: var(--font-body, sans-serif);
  font-size: 11.5px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 6px;
  line-height: 1;
}

.badge-success {
  background-color: rgba(99, 153, 34, 0.12);
  color: #639922;
  border: 0.5px solid rgba(99, 153, 34, 0.25);
}

.badge-warning {
  background-color: rgba(217, 119, 6, 0.12);
  color: #d97706;
  border: 0.5px solid rgba(217, 119, 6, 0.25);
}

.badge-danger {
  background-color: rgba(220, 38, 38, 0.12);
  color: #dc2626;
  border: 0.5px solid rgba(220, 38, 38, 0.25);
}

.mockup-question {
  font-size: 16px;
  font-weight: 700;
  line-height: 1.4;
  margin-bottom: 24px;
}

.mockup-scores {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.mockup-score-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.score-label-wrap {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  font-weight: 600;
}

.score-name {
  color: var(--lp-text-sec);
}

.score-value {
  color: var(--lp-text);
}

.progress-bar-container {
  height: 8px;
  background-color: var(--lp-bg-secondary);
  border-radius: 99px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  border-radius: 99px;
}

.progress-fusion {
  background-color: var(--fusion-color);
}

.progress-tfidf {
  background-color: var(--tfidf-color);
}

.progress-sbert {
  background-color: var(--sbert-color);
}

/* ─── SECTION HEADER UTILITY ─── */
.section-title-wrap {
  text-align: center;
  margin-bottom: 40px;
}

.section-title {
  font-size: 32px;
  font-weight: 800;
  letter-spacing: -0.03em;
  margin-bottom: 12px;
}

.section-desc {
  font-size: 16px;
  color: var(--lp-text-sec);
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.5;
}

/* ─── SANDBOX DEMO SECTION ─── */
.section-demo {
  background-color: var(--lp-bg-secondary);
  padding: 80px 24px;
  z-index: 1;
}

.demo-box {
  width: 100%;
  border-color: var(--lp-border);
}

.demo-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--lp-text-sec);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.input-wrapper {
  display: flex;
  gap: 8px;
}

.demo-input {
  flex: 1;
  border: 0.5px solid var(--lp-border);
  border-radius: 8px;
  background-color: var(--lp-card-bg);
  color: var(--lp-text);
  padding: 12px 16px;
  font-size: 14.5px;
  outline: none;
  font-family: inherit;
  transition: border-color 0.15s ease;
}
.demo-input:focus {
  border-color: var(--lp-primary);
}

.btn-demo-search {
  background-color: var(--lp-text);
  color: var(--lp-bg);
  border: none;
  border-radius: 8px;
  padding: 0 24px;
  font-size: 14.5px;
  font-weight: 600;
  cursor: pointer;
  height: 46px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.15s ease;
}
.btn-demo-search:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.predefined-chips-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  overflow: hidden;
}

.chips-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--lp-text-sec);
  white-space: nowrap;
}

.chips-scroll {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
  scrollbar-width: none;
  width: 100%;
  min-width: 0;
}
.chips-scroll::-webkit-scrollbar {
  display: none;
}

.chip-btn {
  background-color: var(--lp-card-bg);
  border: 0.5px solid var(--lp-border);
  color: var(--lp-text);
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease;
}
.chip-btn:hover {
  background-color: var(--lp-bg-secondary);
  border-color: var(--lp-primary);
}

.demo-select {
  border: 0.5px solid var(--lp-border);
  border-radius: 8px;
  background-color: var(--lp-card-bg);
  color: var(--lp-text);
  padding: 10px 14px;
  font-size: 13.5px;
  outline: none;
  cursor: pointer;
}

.demo-loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 32px;
  padding: 24px;
  background-color: var(--lp-bg-secondary);
  border: 0.5px dashed var(--lp-border);
  border-radius: 8px;
  font-size: 13px;
  color: var(--lp-text-sec);
}

.spinner-inline {
  width: 16px;
  height: 16px;
  border: 2px solid var(--lp-border);
  border-top-color: var(--lp-primary);
  border-radius: 50%;
  animation: fa-spin 1s linear infinite;
}

.demo-results-wrapper {
  margin-top: 32px;
  border-top: 0.5px solid var(--lp-border);
  padding-top: 24px;
}

.results-header {
  font-size: 12px;
  font-weight: 700;
  color: var(--lp-text-sec);
  letter-spacing: 0.05em;
  margin-bottom: 16px;
}

.no-results {
  font-size: 13px;
  color: var(--lp-text-sec);
  text-align: center;
  padding: 16px;
}

.demo-results-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.result-item-card {
  padding: 18px;
  background-color: var(--lp-bg);
  border-color: var(--lp-border);
}

.result-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.result-tag {
  font-size: 11px;
  background-color: var(--lp-bg-secondary);
  border: 0.5px solid var(--lp-border);
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 600;
  color: var(--lp-text-sec);
}

.result-question {
  font-size: 14.5px;
  font-weight: 700;
  margin-bottom: 16px;
  line-height: 1.4;
}

.result-scores-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.score-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.score-title {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  font-weight: 600;
  color: var(--lp-text-sec);
}

/* ─── FEATURES SECTION (3 COLUMNS) ─── */
.section-features {
  max-width: 1280px;
  margin: 0 auto;
  padding: 80px 24px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.feature-card {
  text-align: left;
  border-color: var(--lp-border);
}

.feature-icon {
  width: 44px;
  height: 44px;
  border: 0.5px solid var(--lp-border);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: var(--lp-primary);
  background-color: var(--lp-bg-secondary);
  margin-bottom: 20px;
}

.feature-card-title {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 12px;
}

.feature-card-desc {
  font-size: 14px;
  line-height: 1.6;
  color: var(--lp-text-sec);
}

/* ─── HOW IT WORKS (4 STEPS) ─── */
.section-how {
  background-color: var(--lp-bg-secondary);
  padding: 80px 24px;
  z-index: 1;
}

.steps-container {
  max-width: 1280px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.step-card {
  flex: 1;
  text-align: left;
}

.step-num {
  font-size: 24px;
  font-weight: 800;
  color: var(--lp-primary);
  margin-bottom: 12px;
}

.step-title {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 8px;
}

.step-desc {
  font-size: 13px;
  line-height: 1.5;
  color: var(--lp-text-sec);
}

.step-arrow {
  color: var(--lp-border);
  font-size: 16px;
  display: flex;
  align-items: center;
}

/* ─── SCORE EXPLANATION SECTION ─── */
.section-scores {
  padding: 80px 24px;
}

.explanation-box {
  display: grid;
  grid-template-columns: 1.2fr 0.1fr 1fr;
  gap: 32px;
  border-color: var(--lp-border);
}

.scores-demo-column {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.explanation-score-item {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.exp-score-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.score-badge-label {
  font-size: 11px;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 4px;
}

.score-definition {
  font-size: 11px;
  color: var(--lp-text-sec);
}

.score-desc {
  font-size: 13.5px;
  line-height: 1.55;
  color: var(--lp-text-sec);
}

.divider-v {
  width: 0.5px;
  background-color: var(--lp-border);
  height: 100%;
}

.badges-info-column {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-subtitle {
  font-size: 12px;
  font-weight: 700;
  color: var(--lp-text-sec);
  letter-spacing: 0.05em;
  margin-top: 4px;
}

.badges-description {
  font-size: 13.5px;
  color: var(--lp-text-sec);
  line-height: 1.5;
}

.badge-info-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.badge-info-item {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  column-gap: 12px;
  row-gap: 4px;
}

.badge-threshold {
  font-size: 12px;
  font-weight: 600;
  color: var(--lp-text-sec);
  justify-self: end;
}

.badge-text-detail {
  grid-column: span 2;
  font-size: 12.5px;
  color: var(--lp-text-sec);
  line-height: 1.4;
}



/* ─── TECH STACK SECTION ─── */
.section-tech-stack {
  padding: 60px 24px;
  text-align: center;
}

.tech-stack-title {
  font-size: 12px;
  font-weight: 700;
  color: var(--lp-text-sec);
  letter-spacing: 0.05em;
  margin-bottom: 24px;
}

.tech-chips-container {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 12px;
  max-width: 800px;
  margin: 0 auto;
}

.tech-chip {
  background-color: var(--lp-bg-secondary);
  border: 0.5px solid var(--lp-border);
  color: var(--lp-text);
  padding: 6px 14px;
  border-radius: 99px;
  font-size: 13px;
  font-weight: 600;
}

/* ─── CTA FINAL SECTION ─── */
.section-cta-final {
  max-width: 1280px;
  margin: 0 auto;
  padding: 60px 24px 80px 24px;
  width: 100%;
}

.cta-final-box {
  text-align: center;
  border-color: var(--lp-border);
  padding: 48px 24px;
}

.cta-headline {
  font-size: 32px;
  font-weight: 800;
  letter-spacing: -0.03em;
  margin-bottom: 16px;
}

.cta-desc {
  font-size: 16px;
  color: var(--lp-text-sec);
  max-width: 580px;
  margin: 0 auto 32px auto;
  line-height: 1.55;
}

.cta-final-buttons {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.btn-cta-primary-large {
  background-color: var(--lp-text);
  color: var(--lp-bg);
  border: none;
  padding: 14px 32px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.15s ease;
}
.btn-cta-primary-large:hover {
  opacity: 0.9;
}

.btn-cta-secondary-large {
  background: transparent;
  border: 0.5px solid var(--lp-border);
  color: var(--lp-text);
  padding: 14px 32px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.15s ease;
}
.btn-cta-secondary-large:hover {
  background-color: var(--lp-bg-secondary);
}

/* ─── FOOTER ─── */
.lp-footer {
  border-top: 0.5px solid var(--lp-border);
  padding: 40px 24px;
  background-color: var(--lp-bg);
}

.lp-footer-top {
  max-width: 1280px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.footer-brand {
  font-size: 14px;
  font-weight: 700;
  color: var(--lp-text);
}

.footer-links {
  display: flex;
  gap: 12px;
  align-items: center;
}

.footer-links a {
  font-size: 13.5px;
  color: var(--lp-text-sec);
  text-decoration: none;
}
.footer-links a:hover {
  color: var(--lp-text);
}

.dot-separator {
  color: var(--lp-border);
}

.lp-footer-bottom {
  max-width: 1280px;
  margin: 0 auto;
  text-align: left;
}

.footer-confidential {
  font-size: 11px;
  color: var(--lp-text-sec);
}

/* ─── RESPONSIVE STYLES ─── */
@media (max-width: 1024px) {
  .section-hero {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 32px;
    padding: 60px 24px;
  }
  
  .hero-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .hero-headline {
    font-size: 38px;
  }

  .api-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .lp-header-container {
    padding: 0 16px;
  }

  .lp-nav {
    display: none; /* Hide header nav links on mobile */
  }

  .features-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .steps-container {
    flex-direction: column;
    gap: 24px;
  }

  .step-arrow {
    transform: rotate(90deg);
  }

  .explanation-box {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .divider-v {
    width: 100%;
    height: 0.5px;
  }

  .badge-info-item {
    grid-template-columns: 1fr auto;
  }
  .badge-threshold {
    justify-self: end;
  }
  .badge-text-detail {
    grid-column: span 2;
  }

  .lp-footer-top {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
}

@media (max-width: 480px) {
  .hero-headline {
    font-size: 32px;
  }
  
  .break-mobile {
    display: block;
  }

  .hero-cta-group {
    flex-direction: column;
    width: 100%;
  }

  .btn-hero-primary, .btn-hero-secondary {
    width: 100%;
    justify-content: center;
  }

  .predefined-chips-wrap {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
    width: 100%;
  }

  .input-wrapper {
    flex-direction: column;
    gap: 8px;
    width: 100%;
  }

  .demo-input {
    width: 100%;
    box-sizing: border-box;
  }

  .btn-demo-search {
    width: 100%;
    justify-content: center;
  }

  .demo-select {
    width: 100%;
    box-sizing: border-box;
  }

  .lp-flat-card {
    padding: 16px;
  }

  .result-scores-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .cta-final-buttons {
    flex-direction: column;
    gap: 12px;
    width: 100%;
  }

  .btn-cta-primary-large, .btn-cta-secondary-large {
    width: 100%;
  }
  
  .footer-links {
    flex-wrap: wrap;
    gap: 8px 12px;
  }
}

/* 360px mobile optimization boundary */
@media (max-width: 360px) {
  .landing-container {
    padding: 0 4px;
  }
}
</style>
