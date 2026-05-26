<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import usePageTitle from '../composables/usePageTitle.js'

usePageTitle('Daftar')

const authStore = useAuthStore()
const router = useRouter()

const username = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')

const isLoading = ref(false)
const successMessage = ref('')

const errors = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  general: ''
})

const passwordStrength = computed(() => {
  const pwd = password.value
  if (!pwd) {
    return { level: 'weak', label: 'Lemah', color: 'var(--color-danger)', width: '0%' }
  }

  const hasLetter = /[a-zA-Z]/.test(pwd)
  const hasNumber = /[0-9]/.test(pwd)

  if (pwd.length < 8 || !hasLetter || !hasNumber) {
    return { level: 'weak', label: 'Lemah', color: 'var(--color-danger)', width: '33%' }
  } else if (pwd.length >= 8 && hasLetter && hasNumber && pwd.length < 12) {
    return { level: 'fair', label: 'Cukup', color: 'var(--color-warning)', width: '66%' }
  } else if (pwd.length >= 12 && hasLetter && hasNumber) {
    return { level: 'strong', label: 'Kuat', color: 'var(--color-success)', width: '100%' }
  }

  return { level: 'weak', label: 'Lemah', color: 'var(--color-danger)', width: '33%' }
})

const validate = () => {
  errors.username = ''
  errors.email = ''
  errors.password = ''
  errors.confirmPassword = ''
  errors.general = ''

  let isValid = true

  // Username validation
  const usernameRegex = /^[a-zA-Z0-9_]+$/
  if (!username.value) {
    errors.username = 'Username tidak boleh kosong'
    isValid = false
  } else if (username.value.length < 3 || username.value.length > 30) {
    errors.username = 'Username harus terdiri dari 3–30 karakter'
    isValid = false
  } else if (!usernameRegex.test(username.value)) {
    errors.username = 'Username hanya boleh mengandung huruf, angka, dan underscore (_)'
    isValid = false
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email.value) {
    errors.email = 'Email tidak boleh kosong'
    isValid = false
  } else if (!emailRegex.test(email.value)) {
    errors.email = 'Format email tidak valid'
    isValid = false
  }

  // Password validation
  const hasLetter = /[a-zA-Z]/.test(password.value)
  const hasNumber = /[0-9]/.test(password.value)
  if (!password.value) {
    errors.password = 'Password tidak boleh kosong'
    isValid = false
  } else if (password.value.length < 8) {
    errors.password = 'Password minimal harus 8 karakter'
    isValid = false
  } else if (!hasLetter || !hasNumber) {
    errors.password = 'Password harus mengandung huruf dan angka'
    isValid = false
  }

  // Confirm password validation
  if (!confirmPassword.value) {
    errors.confirmPassword = 'Konfirmasi password tidak boleh kosong'
    isValid = false
  } else if (confirmPassword.value !== password.value) {
    errors.confirmPassword = 'Konfirmasi password tidak cocok dengan password'
    isValid = false
  }

  return isValid
}

const handleSubmit = async () => {
  if (!validate()) return

  isLoading.value = true
  errors.general = ''

  const result = await authStore.register(username.value, email.value, password.value)

  if (result.success) {
    successMessage.value = 'Registrasi berhasil! Mengalihkan ke halaman login...'
    setTimeout(() => {
      router.push('/login')
    }, 2000)
  } else {
    if (result.status === 409) {
      // Check response message or default
      const message = result.data?.message || ''
      if (message.toLowerCase().includes('email')) {
        errors.email = 'Email sudah terdaftar'
      } else if (message.toLowerCase().includes('username')) {
        errors.username = 'Username sudah digunakan'
      } else {
        errors.general = 'Username atau email sudah digunakan'
      }
    } else if (result.status === 400) {
      errors.general = 'Data tidak valid, periksa kembali isian kamu'
    } else {
      errors.general = 'Server bermasalah, coba lagi nanti'
    }
    isLoading.value = false
  }
}
</script>

<template>
  <div class="register-wrapper">
    <div class="register-card">
      <div class="card-header">
        <h2 class="brand-title">Buat Akun Baru</h2>
        <p class="subtitle">Bergabung dengan komunitas StackMatch</p>
      </div>

      <div v-if="successMessage" class="alert alert-success" role="alert">
        {{ successMessage }}
      </div>

      <div v-if="!successMessage && errors.general" class="alert alert-danger" role="alert">
        {{ errors.general }}
      </div>

      <form v-if="!successMessage" @submit.prevent="handleSubmit" class="register-form">
        <div class="form-group">
          <label for="username" class="form-label">USERNAME</label>
          <input
            id="username"
            v-model="username"
            type="text"
            class="form-input"
            :class="{ 'input-error': errors.username }"
            placeholder="contoh: dev_user"
            autocomplete="username"
            :disabled="isLoading"
          />
          <span v-if="errors.username" class="error-text">{{ errors.username }}</span>
        </div>

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
            placeholder="Minimal 8 karakter (huruf & angka)"
            autocomplete="new-password"
            :disabled="isLoading"
          />
          <span v-if="errors.password" class="error-text">{{ errors.password }}</span>

          <div v-if="password.length > 0" class="password-strength-container">
            <div class="strength-bar-wrapper">
              <div 
                class="strength-bar-fill" 
                :style="{ width: passwordStrength.width, backgroundColor: passwordStrength.color }"
              ></div>
            </div>
            <span class="strength-label" :style="{ color: passwordStrength.color }">
              {{ passwordStrength.label }}
            </span>
          </div>
        </div>

        <div class="form-group">
          <label for="confirmPassword" class="form-label">KONFIRMASI PASSWORD</label>
          <input
            id="confirmPassword"
            v-model="confirmPassword"
            type="password"
            class="form-input"
            :class="{ 'input-error': errors.confirmPassword }"
            placeholder="Ulangi password"
            autocomplete="new-password"
            :disabled="isLoading"
          />
          <span v-if="errors.confirmPassword" class="error-text">{{ errors.confirmPassword }}</span>
        </div>

        <button type="submit" class="submit-btn" :disabled="isLoading">
          <span v-if="isLoading">Mendaftar...</span>
          <span v-else>Daftar</span>
        </button>
      </form>

      <div class="card-footer">
        <span>Sudah punya akun? </span>
        <RouterLink to="/login" class="login-link">Masuk</RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.register-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-bg);
  padding: 1rem;
  transition: background-color var(--transition-speed);
}

.register-card {
  max-width: 440px;
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

.alert-success {
  background-color: rgba(22, 163, 74, 0.1);
  border: 1px solid var(--color-success);
  color: var(--color-success);
}

.alert-danger {
  background-color: rgba(220, 38, 38, 0.1);
  border: 1px solid var(--color-danger);
  color: var(--color-danger);
}

.register-form {
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

.password-strength-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 6px;
  gap: 12px;
}

.strength-bar-wrapper {
  flex: 1;
  height: 4px;
  background-color: var(--color-border);
  border-radius: 2px;
  overflow: hidden;
}

.strength-bar-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.3s ease, background-color 0.3s ease;
}

.strength-label {
  font-size: 11px;
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-weight: 500;
  text-align: right;
  white-space: nowrap;
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

.login-link {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 500;
  transition: color var(--transition-speed);
}

.login-link:hover {
  text-decoration: underline;
  color: var(--color-primary-hover);
}
</style>
