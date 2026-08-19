<template>
  <div class="auth-page">
    <div class="auth-card glass-panel animate-fade-in">
      <h1 class="auth-title">Welcome Back</h1>
      <p class="auth-subtitle">Sign in to your CineLog account to track and manage your watchlists.</p>

      <form @submit.prevent="handleLogin" class="auth-form">
        <div class="form-group">
          <label>Email Address</label>
          <input 
            v-model="email" 
            type="email" 
            required 
            placeholder="name@email.com" 
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
          {{ isLoading ? 'Signing in...' : 'Sign In' }}
        </button>
      </form>

      <p class="auth-footer">
        Don't have an account? <NuxtLink to="/register">Sign up now</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '~/stores/auth'

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
    const res: any = await $fetch(useApiUrl('/api/auth/login'), {
      method: 'POST',
      body: {
        email: email.value,
        password: password.value
      }
    })

    if (res.token) {
      authStore.setAuth(res.token, res.user_id || res.user?.id, res.user)
      router.push('/')
    }
  } catch (err: any) {
    errorMessage.value = err?.data?.error || 'Login failed. Please check your credentials.'
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
  max-width: 400px;
  padding: 32px;
  border-radius: 12px;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.8);
}

.auth-title {
  font-size: 1.6rem;
  font-weight: 800;
  margin-bottom: 6px;
  color: #ffffff;
}

.auth-subtitle {
  color: var(--text-secondary);
  font-size: 0.88rem;
  margin-bottom: 24px;
}

.form-group {
  margin-bottom: 18px;
}

.form-group label {
  display: block;
  font-size: 0.82rem;
  color: var(--text-secondary);
  margin-bottom: 6px;
  font-weight: 600;
}

.form-input {
  width: 100%;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--border-subtle);
  color: #fff;
  padding: 11px 14px;
  border-radius: 8px;
  font-family: inherit;
  font-size: 0.9rem;
  outline: none;
  transition: all 0.2s ease;
}

.form-input:focus {
  border-color: var(--accent-red) !important;
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 0 3px var(--accent-red-subtle) !important;
}

.error-msg {
  color: #ff6b6b;
  font-size: 0.84rem;
  margin-bottom: 16px;
  padding: 8px 12px;
  background: rgba(229, 9, 20, 0.1);
  border: 1px solid rgba(229, 9, 20, 0.25);
  border-radius: 6px;
}

.btn-full {
  width: 100%;
  justify-content: center;
  padding: 12px;
  margin-top: 6px;
}

.auth-footer {
  text-align: center;
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-top: 24px;
}

.auth-footer a {
  color: var(--accent-red);
  text-decoration: none;
  font-weight: 700;
}

.auth-footer a:hover {
  text-decoration: underline;
}
</style>
