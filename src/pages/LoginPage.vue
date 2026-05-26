<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import usePageTitle from '../composables/usePageTitle.js'

usePageTitle('Masuk')

const authStore = useAuthStore()
const router = useRouter()

const email = ref('')
const password = ref('')
const isLoading = ref(false)

const errors = reactive({
  email: '',
  password: '',
  general: ''
})

const validate = () => {
  errors.email = ''
  errors.password = ''
  errors.general = ''

  let isValid = true

  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email.value) {
    errors.email = 'Email tidak boleh kosong'
    isValid = false
  } else if (!emailRegex.test(email.value)) {
    errors.email = 'Format email tidak valid'
    isValid = false
  }

  // Password validation
  if (!password.value) {
    errors.password = 'Password tidak boleh kosong'
    isValid = false
  }

  return isValid
}

const handleSubmit = async () => {
  if (!validate()) return

  isLoading.value = true
  errors.general = ''

  const result = await authStore.login(email.value, password.value)

  if (result.success) {
    router.push('/')
  } else {
    if (result.status === 401) {
      errors.general = 'Email atau password salah'
    } else if (result.status === 429) {
      errors.general = 'Terlalu banyak percobaan, coba lagi dalam 1 menit'
    } else {
      errors.general = 'Server bermasalah, coba lagi nanti'
    }
    isLoading.value = false
  }
}
</script>

<template>
  <div class="login-wrapper">
    <div class="login-card">
      <div class="card-header">
        <h2 class="brand-title">StackMatch</h2>
        <p class="subtitle">Masuk ke akun kamu</p>
      </div>

      <div v-if="errors.general" class="alert alert-danger" role="alert">
        {{ errors.general }}
      </div>

      <form @submit.prevent="handleSubmit" class="login-form">
        <div class="form-group">
          <label for="email" class="form-label">EMAIL</label>
          <input
            id="email"
            v-model="email"
            type="email"
            class="form-input"
            :class="{ 'input-error': errors.email }"
            placeholder="nama@email.com"
            autocomplete="email"
            :disabled="isLoading"
          />
          <span v-if="errors.email" class="error-text">{{ errors.email }}</span>
        </div>

        <div class="form-group">
          <label for="password" class="form-label">PASSWORD</label>
          <input
            id="password"
            v-model="password"
            type="password"
            class="form-input"
            :class="{ 'input-error': errors.password }"
            placeholder="••••••••"
            autocomplete="current-password"
            :disabled="isLoading"
          />
          <span v-if="errors.password" class="error-text">{{ errors.password }}</span>
        </div>

        <button type="submit" class="submit-btn" :disabled="isLoading">
          <span v-if="isLoading">Masuk...</span>
          <span v-else>Masuk</span>
        </button>
      </form>

      <div class="card-footer">
        <span>Belum punya akun? </span>
        <RouterLink to="/register" class="register-link">Daftar</RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-bg);
  padding: 1rem;
  transition: background-color var(--transition-speed);
}

.login-card {
  max-width: 400px;
  width: 100%;
  padding: 2.5rem 2rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg, 12px);
  background-color: var(--color-card-bg);
  box-shadow: var(--shadow-md);
  transition: background-color var(--transition-speed), border-color var(--transition-speed), box-shadow var(--transition-speed);
}

.card-header {
  text-align: center;
  margin-bottom: 2rem;
}

.brand-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, var(--color-primary), var(--color-score-sbert));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.subtitle {
  color: var(--color-text-secondary);
  font-size: 14px;
}

.alert {
  margin-bottom: 1.5rem;
  padding: 10px 14px;
  border-radius: var(--radius-md, 8px);
  font-size: 13px;
  line-height: 1.4;
}

.alert-danger {
  background-color: rgba(220, 38, 38, 0.1);
  border: 1px solid var(--color-danger);
  color: var(--color-danger);
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-label {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-secondary);
  margin-bottom: 6px;
  letter-spacing: 0.05em;
}

.form-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md, 8px);
  font-size: 14px;
  font-family: var(--font-body);
  background-color: var(--color-bg);
  color: var(--color-text);
  outline: none;
  transition: all var(--transition-speed);
}

.form-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.15);
}

.form-input.input-error {
  border-color: var(--color-danger);
}

.form-input.input-error:focus {
  box-shadow: 0 0 0 2px rgba(220, 38, 38, 0.15);
}

.error-text {
  font-size: 12px;
  color: var(--color-danger);
  margin-top: 4px;
}

.submit-btn {
  width: 100%;
  padding: 11px;
  background-color: var(--color-primary);
  color: #ffffff;
  border: none;
  border-radius: var(--radius-md, 8px);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color var(--transition-speed), opacity var(--transition-speed);
  margin-top: 0.5rem;
}

.submit-btn:hover:not(:disabled) {
  background-color: var(--color-primary-hover);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.card-footer {
  text-align: center;
  margin-top: 1.5rem;
  font-size: 13px;
  color: var(--color-text-secondary);
}

.register-link {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 500;
  transition: color var(--transition-speed);
}

.register-link:hover {
  text-decoration: underline;
  color: var(--color-primary-hover);
}
</style>
