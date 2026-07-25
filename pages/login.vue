<template>
  <div class="auth-page">
    <div class="auth-card glass-panel animate-fade-in">
      <h1 class="auth-title">Selamat Datang Kembali</h1>
      <p class="auth-subtitle">Masuk ke akun CineLog untuk mengelola daftar tontonan kamu.</p>

      <form @submit.prevent="handleLogin" class="auth-form">
        <div class="form-group">
          <label>Email</label>
          <input 
            v-model="email" 
            type="email" 
            required 
            placeholder="nama@email.com" 
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label>Password</label>
          <input 
            v-model="password" 
            type="password" 
            required 
            placeholder="••••••••" 
            class="form-input"
          />
        </div>

        <p v-if="errorMessage" class="error-msg">⚠️ {{ errorMessage }}</p>

        <button type="submit" class="btn-primary btn-full" :disabled="isLoading">
          {{ isLoading ? 'Memproses...' : 'Login' }}
        </button>
      </form>

      <p class="auth-footer">
        Belum punya akun? <NuxtLink to="/register">Daftar sekarang</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '~/stores/auth'

const config = useRuntimeConfig()
const authStore = useAuthStore()
const router = useRouter()

const email = ref('')
const password = ref('')
const isLoading = ref(false)
const errorMessage = ref('')

const handleLogin = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const res: any = await $fetch(`${config.public.apiBase}/api/auth/login`, {
      method: 'POST',
      body: {
        email: email.value,
        password: password.value
      }
    })

    if (res.token) {
      // Decode user_id from token payload if available or fetch profile
      authStore.setAuth(res.token, 1)
      router.push('/')
    }
  } catch (err: any) {
    errorMessage.value = err?.data?.error || 'Login gagal. Periksa kembali email & password.'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.auth-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(80vh - 100px);
}

.auth-card {
  width: 100%;
  max-width: 420px;
  padding: 36px;
  border-radius: 24px;
}

.auth-title {
  font-size: 1.8rem;
  font-weight: 800;
  margin-bottom: 8px;
}

.auth-subtitle {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-bottom: 24px;
}

.form-group {
  margin-bottom: 18px;
}

.form-group label {
  display: block;
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-bottom: 6px;
  font-weight: 600;
}

.form-input {
  width: 100%;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--glass-border);
  color: #fff;
  padding: 12px 16px;
  border-radius: 12px;
  font-family: inherit;
  outline: none;
  transition: all 0.2s;
}

.form-input:focus {
  border-color: var(--accent-purple);
  background: rgba(255, 255, 255, 0.1);
}

.error-msg {
  color: var(--accent-red);
  font-size: 0.85rem;
  margin-bottom: 16px;
}

.btn-full {
  width: 100%;
  justify-content: center;
  padding: 12px;
}

.auth-footer {
  text-align: center;
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-top: 24px;
}

.auth-footer a {
  color: var(--accent-gold);
  text-decoration: none;
  font-weight: 600;
}
</style>
