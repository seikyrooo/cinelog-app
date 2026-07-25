import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(null)
  const userId = ref<number | null>(null)

  const isAuth = computed(() => !!token.value)

  function initAuth() {
    if (import.meta.client) {
      token.value = localStorage.getItem('cinelog_token')
      const storedId = localStorage.getItem('cinelog_user_id')
      if (storedId) userId.value = Number(storedId)
    }
  }

  function setAuth(newToken: string, id: number) {
    token.value = newToken
    userId.value = id
    if (import.meta.client) {
      localStorage.setItem('cinelog_token', newToken)
      localStorage.setItem('cinelog_user_id', String(id))
    }
  }

  function logout() {
    token.value = null
    userId.value = null
    if (import.meta.client) {
      localStorage.removeItem('cinelog_token')
      localStorage.removeItem('cinelog_user_id')
    }
  }

  return {
    token,
    userId,
    isAuth,
    initAuth,
    setAuth,
    logout
  }
})
