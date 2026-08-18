import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ApiUser } from '~/composables/useApi'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(null)
  const userId = ref<number | null>(null)
  const user = ref<ApiUser | null>(null)

  const isAuth = computed(() => !!token.value)

  function initAuth() {
    if (import.meta.client) {
      token.value = localStorage.getItem('cinelog_token')
      const storedId = localStorage.getItem('cinelog_user_id')
      if (storedId) userId.value = Number(storedId)
      const storedUser = localStorage.getItem('cinelog_user')
      if (storedUser) user.value = JSON.parse(storedUser)
    }
  }

  function setAuth(newToken: string, id: number, profile?: ApiUser) {
    token.value = newToken
    userId.value = id
    if (profile) user.value = profile
    if (import.meta.client) {
      localStorage.setItem('cinelog_token', newToken)
      localStorage.setItem('cinelog_user_id', String(id))
      if (profile) localStorage.setItem('cinelog_user', JSON.stringify(profile))
    }
  }

  function setUser(profile: ApiUser) {
    user.value = profile
    userId.value = profile.id
    if (import.meta.client) {
      localStorage.setItem('cinelog_user', JSON.stringify(profile))
      localStorage.setItem('cinelog_user_id', String(profile.id))
    }
  }

  function logout() {
    token.value = null
    userId.value = null
    user.value = null
    if (import.meta.client) {
      localStorage.removeItem('cinelog_token')
      localStorage.removeItem('cinelog_user_id')
      localStorage.removeItem('cinelog_user')
    }
  }

  return {
    token,
    userId,
    user,
    isAuth,
    initAuth,
    setAuth,
    setUser,
    logout
  }
})
