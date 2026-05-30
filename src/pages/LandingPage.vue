<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isDark = ref(false)

onMounted(() => {
  const savedTheme = localStorage.getItem('sm_theme')
  if (savedTheme === 'dark') {
    isDark.value = true
    document.documentElement.classList.add('dark')
  } else if (savedTheme === 'light') {
    isDark.value = false
    document.documentElement.classList.remove('dark')
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    isDark.value = prefersDark
    document.documentElement.classList.toggle('dark', prefersDark)
  }
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

const titleWords = ["Discover", "Excellence"]

// Generate an optimized subset of 6 paths per side (12 total) to minimize layout nodes and SVG complexity
const getFloatingPaths = (position) => {
  return Array.from({ length: 6 }, (_, i) => {
    const d = `M-${380 - i * 32 * position} -${189 + i * 36}C-${
      380 - i * 32 * position
    } -${189 + i * 36} -${312 - i * 32 * position} ${216 - i * 36} ${
      152 - i * 32 * position
    } ${343 - i * 36}C${616 - i * 32 * position} ${470 - i * 36} ${
      684 - i * 32 * position
    } ${875 - i * 36} ${684 - i * 32 * position} ${875 - i * 36}`
    
    return {
      id: i,
      d,
      width: 0.8 + i * 0.12
    }
  })
}

const paths1 = computed(() => getFloatingPaths(1))
const paths2 = computed(() => getFloatingPaths(-1))

const navigateToLogin = () => {
  router.push('/login')
}

const navigateToRegister = () => {
  router.push('/register')
}

const features = [
  {
    icon: "fa-solid fa-brain",
    title: "AI Stack Matching",
    description: "Algoritma rekomendasi cerdas menyusun kombinasi framework, database, dan library paling optimal untuk proyek spesifik Anda."
  },
  {
    icon: "fa-solid fa-magnifying-glass",
    title: "Hybrid Search",
    description: "Gabungan TF-IDF dan SBERT memastikan pencarian query stack Anda relevan secara semantik dan tekstual dengan respons kilat."
  },
  {
    icon: "fa-solid fa-bookmark",
    title: "Koleksi & Bookmark",
    description: "Simpan, atur, dan tinjau kembali kombinasi stack favorit Anda ke dalam ruang koleksi pribadi yang tersinkronisasi aman."
  }
]
</script>

<template>
  <div class="landing-page" :class="{ 'dark-theme': isDark }">
    <!-- Navigation Header -->
    <header class="navbar">
      <div class="navbar-container">
        <div class="navbar-brand">
          <img src="../assets/logo2.png" alt="Logo" class="brand-logo-img" />
          <span class="brand-text">StackMatch</span>
        </div>
        <div class="navbar-actions">
          <button
            class="btn-theme-toggle"
            @click="toggleTheme"
            :title="isDark ? 'Mode Terang' : 'Mode Gelap'"
            :aria-label="isDark ? 'Mode Terang' : 'Mode Gelap'"
          >
            <i v-if="isDark" class="fa-solid fa-sun"></i>
            <i v-else class="fa-solid fa-moon"></i>
          </button>
          <button class="btn-secondary" @click="navigateToRegister">Daftar</button>
          <button class="btn-primary" @click="navigateToLogin">Masuk</button>
        </div>
      </div>
    </header>

    <!-- Floating paths background (Now fully GPU accelerated) -->
    <div class="svg-container">
      <svg class="svg-element" viewBox="0 0 696 316" fill="none">
        <!-- Left-aligned paths -->
        <path
          v-for="path in paths1"
          :key="'p1-' + path.id"
          :d="path.d"
          stroke="url(#path-grad)"
          :stroke-width="path.width"
          class="floating-path"
        />
        
        <!-- Right-aligned paths -->
        <path
          v-for="path in paths2"
          :key="'p2-' + path.id"
          :d="path.d"
          stroke="url(#path-grad)"
          :stroke-width="path.width"
          class="floating-path"
        />

        <!-- Linear gradient for paths -->
        <linearGradient id="path-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.08" />
          <stop offset="50%" stop-color="#8b5cf6" stop-opacity="0.4" />
          <stop offset="100%" stop-color="#ec4899" stop-opacity="0.08" />
        </linearGradient>
      </svg>
    </div>

    <!-- Main Hero Content -->
    <main class="hero-section">
      <div class="hero-container">
        <!-- Modern capsule badge -->
        <div class="capsule-badge">
          <span class="badge-dot"></span>
          <span class="badge-text">StackMatch 1.0 is officially live</span>
        </div>

        <!-- Title: Words instead of letter animation to avoid layout/DOM overhead -->
        <h1 class="hero-title">
          <span 
            v-for="(word, wIdx) in titleWords" 
            :key="wIdx" 
            class="word"
            :class="'animate-word-' + wIdx"
          >
            {{ word }}
          </span>
        </h1>

        <!-- Subtitle -->
        <p class="hero-subtitle">
          Temukan kombinasi teknologi ideal Anda secara presisi. StackMatch menyelaraskan kebutuhan arsitektur proyek dengan keandalan framework secara instan.
        </p>

        <!-- CTA Buttons -->
        <div class="hero-ctas">
          <button class="btn-cta-primary" @click="navigateToLogin">
            <span>Mulai Sekarang</span>
            <span class="btn-arrow">→</span>
          </button>
          <button class="btn-cta-secondary" @click="navigateToRegister">
            <span>Pelajari Fitur</span>
          </button>
        </div>

        <!-- Features Grid -->
        <section class="features-grid">
          <div 
            v-for="(feat, idx) in features" 
            :key="idx" 
            class="feature-card"
            :style="{ 'animation-delay': `${0.65 + idx * 0.1}s` }"
          >
            <div class="feature-icon-wrap"><i :class="feat.icon"></i></div>
            <h3 class="feature-card-title">{{ feat.title }}</h3>
            <p class="feature-card-desc">{{ feat.description }}</p>
          </div>
        </section>
      </div>
    </main>

    <!-- Footer -->
    <footer class="landing-footer">
      <p>&copy; 2026 StackMatch. Built with Vue 3 & Shadcn style principles.</p>
    </footer>
  </div>
</template>

<style scoped>
.landing-page {
  position: relative;
  min-height: 100vh;
  width: 100%;
  overflow-x: hidden;
  background-image: 
    radial-gradient(circle at 10% 20%, rgba(99, 102, 241, 0.04) 0%, transparent 40%),
    radial-gradient(circle at 90% 80%, rgba(139, 92, 246, 0.04) 0%, transparent 40%),
    radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.03) 0%, transparent 50%);
  background-color: #f8fafc;
  color: #0f172a;
  display: flex;
  flex-direction: column;
  z-index: 1;
  backface-visibility: hidden; /* Force GPU layout */
  transform: translate3d(0, 0, 0);
  transition: background-color 0.3s ease, color 0.3s ease;
}

.landing-page.dark-theme {
  background-image: 
    radial-gradient(circle at 10% 20%, rgba(99, 102, 241, 0.07) 0%, transparent 40%),
    radial-gradient(circle at 90% 80%, rgba(139, 92, 246, 0.07) 0%, transparent 40%),
    radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.04) 0%, transparent 50%);
  background-color: #030307;
  color: #ffffff;
}

/* Navbar */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 72px;
  background-color: rgba(248, 250, 252, 0.92);
  border-bottom: 1px solid rgba(15, 23, 42, 0.05);
  z-index: 100;
  display: flex;
  align-items: center;
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.dark-theme .navbar {
  background-color: rgba(3, 3, 7, 0.92);
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}

.navbar-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

@media (max-width: 480px) {
  .navbar-container {
    padding: 0 1rem;
  }
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  user-select: none;
}

.brand-logo-img {
  height: 60px;
  width: auto;
  display: block;
}

.brand-text {
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.03em;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.navbar-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

@media (max-width: 480px) {
  .navbar-actions {
    gap: 8px;
  }

  /* Sembunyikan teks "Daftar" di layar kecil */
  .btn-secondary {
    display: none;
  }
}

/* Buttons */
.btn-theme-toggle {
  background: transparent;
  border: 1px solid rgba(15, 23, 42, 0.08);
  color: rgba(15, 23, 42, 0.7);
  border-radius: 10px;
  padding: 8px 12px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.dark-theme .btn-theme-toggle {
  border-color: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.8);
}

.btn-theme-toggle:hover {
  background-color: rgba(15, 23, 42, 0.04);
  color: #0f172a;
}

.dark-theme .btn-theme-toggle:hover {
  background-color: rgba(255, 255, 255, 0.04);
  color: #ffffff;
}

.btn-secondary {
  background: transparent;
  border: 1px solid rgba(15, 23, 42, 0.08);
  color: rgba(15, 23, 42, 0.7);
  padding: 8px 18px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease;
}

.dark-theme .btn-secondary {
  border-color: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.8);
}

.btn-secondary:hover {
  background-color: rgba(15, 23, 42, 0.04);
  color: #0f172a;
  border-color: rgba(15, 23, 42, 0.15);
}

.dark-theme .btn-secondary:hover {
  background-color: rgba(255, 255, 255, 0.04);
  color: #ffffff;
  border-color: rgba(255, 255, 255, 0.18);
}

.btn-primary {
  background-color: #0f172a;
  border: none;
  color: #ffffff;
  padding: 8px 20px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.15s ease, opacity 0.15s ease;
}

.dark-theme .btn-primary {
  background-color: #ffffff;
  color: #030307;
}

.btn-primary:hover {
  opacity: 0.95;
  transform: translateY(-1px);
}

/* GPU Accelerated SVG Background */
.svg-container {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 80%;
  pointer-events: none;
  z-index: 3;
  animation: 
    float-bg 22s ease-in-out infinite alternate,
    pulse-opacity-global 12s ease-in-out infinite alternate;
  will-change: transform, opacity;
}

@keyframes float-bg {
  0% {
    transform: translate3d(0, -8px, 0) scale(1.01);
  }
  100% {
    transform: translate3d(0, 8px, 0) scale(0.99);
  }
}

@keyframes pulse-opacity-global {
  0% {
    opacity: 0.8;
  }
  100% {
    opacity: 1.0;
  }
}

.svg-element {
  width: 100%;
  height: 100%;
  opacity: 0.18;
  transition: opacity 0.3s ease;
}

.dark-theme .svg-element {
  opacity: 0.35;
}

.floating-path {
  opacity: 0.25;
}

/* Hero Section */
.hero-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  z-index: 10;
  padding: 140px 1.5rem 60px 1.5rem;
}

.hero-container {
  max-width: 1000px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

/* Capsule badge */
.capsule-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background-color: rgba(15, 23, 42, 0.03);
  border: 1px solid rgba(15, 23, 42, 0.06);
  padding: 6px 16px;
  border-radius: 20px;
  margin-bottom: 2rem;
  transition: background-color 0.3s, border-color 0.3s;
}

.dark-theme .capsule-badge {
  background-color: rgba(255, 255, 255, 0.025);
  border-color: rgba(255, 255, 255, 0.06);
}

.badge-dot {
  width: 6px;
  height: 6px;
  background-color: #10b981;
  border-radius: 50%;
}

.badge-text {
  font-family: var(--font-mono, monospace);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.02em;
  color: rgba(15, 23, 42, 0.6);
  transition: color 0.3s;
}

.dark-theme .badge-text {
  color: rgba(255, 255, 255, 0.65);
}

/* Title Styling */
.hero-title {
  font-size: 5.5rem;
  font-weight: 800;
  letter-spacing: -0.05em;
  line-height: 1.05;
  margin-bottom: 1.5rem;
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 3.25rem;
  }
}

.word {
  display: inline-block;
  opacity: 0;
  transform: translate3d(0, 30px, 0);
  background: linear-gradient(to right, #0f172a, #334155);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: spring-word 0.75s cubic-bezier(0.25, 1, 0.5, 1) forwards;
  will-change: transform, opacity;
  transition: background 0.3s;
}

.dark-theme .word {
  background: linear-gradient(to right, #ffffff, #94a3b8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.animate-word-0 {
  margin-right: 1.25rem;
  animation-delay: 0.1s;
}

.animate-word-1 {
  animation-delay: 0.22s;
}

@keyframes spring-word {
  0% {
    opacity: 0;
    transform: translate3d(0, 30px, 0);
  }
  100% {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}

/* Subtitle */
.hero-subtitle {
  font-size: 1.25rem;
  color: rgba(15, 23, 42, 0.65);
  max-width: 700px;
  margin: 0 auto 2.5rem auto;
  line-height: 1.6;
  font-weight: 400;
  opacity: 0;
  transform: translate3d(0, 20px, 0);
  animation: fade-in-up 0.75s cubic-bezier(0.25, 1, 0.5, 1) forwards;
  animation-delay: 0.45s;
  will-change: transform, opacity;
  transition: color 0.3s;
}

.dark-theme .hero-subtitle {
  color: rgba(255, 255, 255, 0.52);
}

@media (max-width: 768px) {
  .hero-subtitle {
    font-size: 1.05rem;
    margin-bottom: 2rem;
  }
}

@keyframes fade-in-up {
  0% {
    opacity: 0;
    transform: translate3d(0, 20px, 0);
  }
  100% {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}

/* CTA buttons */
.hero-ctas {
  display: flex;
  gap: 16px;
  margin-bottom: 5rem;
  opacity: 0;
  transform: translate3d(0, 20px, 0);
  animation: fade-in-up 0.75s cubic-bezier(0.25, 1, 0.5, 1) forwards;
  animation-delay: 0.58s;
  will-change: transform, opacity;
  flex-wrap: wrap;
  justify-content: center;
}

@media (max-width: 480px) {
  .hero-ctas {
    flex-direction: column;
    align-items: stretch;
    width: 100%;
    max-width: 280px;
    gap: 10px;
    margin-bottom: 3rem;
  }

  .btn-cta-primary,
  .btn-cta-secondary {
    justify-content: center;
    width: 100%;
  }
}

.btn-cta-primary {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: linear-gradient(135deg, #3b82f6, #6366f1);
  color: #ffffff;
  border: none;
  padding: 13px 28px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.15);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.btn-cta-primary:hover {
  transform: translate3d(0, -1px, 0);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.3);
}

.btn-arrow {
  transition: transform 0.2s ease;
}

.btn-cta-primary:hover .btn-arrow {
  transform: translate3d(3px, 0, 0);
}

.btn-cta-secondary {
  display: inline-flex;
  align-items: center;
  background-color: rgba(15, 23, 42, 0.01);
  border: 1px solid rgba(15, 23, 42, 0.08);
  color: #0f172a;
  padding: 13px 28px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.dark-theme .btn-cta-secondary {
  background-color: rgba(255, 255, 255, 0.01);
  border-color: rgba(255, 255, 255, 0.06);
  color: #ffffff;
}

.btn-cta-secondary:hover {
  background-color: rgba(15, 23, 42, 0.04);
  border-color: rgba(15, 23, 42, 0.15);
}

.dark-theme .btn-cta-secondary:hover {
  background-color: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.12);
}

/* Features Grid */
.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  width: 100%;
}

@media (max-width: 900px) {
  .features-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}

.feature-card {
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid rgba(15, 23, 42, 0.05);
  border-radius: 16px;
  padding: 2rem 1.5rem;
  text-align: left;
  opacity: 0;
  transform: translate3d(0, 20px, 0);
  animation: fade-in-up 0.75s cubic-bezier(0.25, 1, 0.5, 1) forwards;
  transition: all 0.25s ease;
  will-change: transform, opacity;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.03), 0 2px 4px -2px rgba(0, 0, 0, 0.03);
}

.dark-theme .feature-card {
  background: rgba(13, 13, 20, 0.85);
  border-color: rgba(255, 255, 255, 0.03);
  box-shadow: none;
}

.feature-card:hover {
  transform: translate3d(0, -3px, 0);
  background-color: #ffffff;
  border-color: rgba(99, 102, 241, 0.25);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -4px rgba(0, 0, 0, 0.05);
}

.dark-theme .feature-card:hover {
  background-color: rgba(20, 20, 30, 0.95);
  border-color: rgba(99, 102, 241, 0.18);
  box-shadow: none;
}

.feature-icon-wrap {
  font-size: 28px;
  margin-bottom: 1rem;
  display: inline-block;
  padding: 6px;
  background-color: rgba(15, 23, 42, 0.02);
  border-radius: 10px;
  line-height: 1;
  color: var(--color-primary);
  transition: background-color 0.3s;
}

.dark-theme .feature-icon-wrap {
  background-color: rgba(255, 255, 255, 0.02);
}

.feature-card-title {
  font-size: 17px;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #0f172a;
  transition: color 0.3s;
}

.dark-theme .feature-card-title {
  color: #ffffff;
}

.feature-card-desc {
  font-size: 13.5px;
  color: rgba(15, 23, 42, 0.6);
  line-height: 1.55;
  transition: color 0.3s;
}

.dark-theme .feature-card-desc {
  color: rgba(255, 255, 255, 0.45);
}

/* Footer */
.landing-footer {
  text-align: center;
  padding: 30px 1.5rem;
  margin-top: auto;
  border-top: 1px solid rgba(15, 23, 42, 0.02);
  z-index: 10;
  transition: border-color 0.3s;
}

.dark-theme .landing-footer {
  border-top-color: rgba(255, 255, 255, 0.02);
}

.landing-footer p {
  font-size: 12px;
  color: rgba(15, 23, 42, 0.4);
  transition: color 0.3s;
}

.dark-theme .landing-footer p {
  color: rgba(255, 255, 255, 0.3);
}
</style>
