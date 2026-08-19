export const useApiUrl = (path: string = '') => {
  const config = useRuntimeConfig()
  const base = (config.public.apiBase || 'http://localhost:3000').replace(/\/+$/, '')
  const cleanPath = path.replace(/^\/+/, '')
  return cleanPath ? `${base}/${cleanPath}` : base
}

export type ApiUser = {
  id: number
  username: string
  email: string
  bio?: string
  avatar_url?: string
  is_public: boolean
}

export type ProfilePayload = {
  bio: string
  avatar_url: string
  is_public?: boolean
}

export type LibraryPayload = Record<string, unknown>

export type PublicProfile = {
  user: ApiUser & { created_at?: string }
  favorite_count: number
  rating_count: number
  followers_count?: number
  following_count?: number
  is_following?: boolean
  is_self?: boolean
}

export type CommunityUser = {
  id: number
  username: string
  bio?: string
  avatar_url?: string
  followers_count: number
  following_count: number
  watched_count: number
  is_following: boolean
  is_self: boolean
  created_at: string
}

export const useApi = () => {
  const auth = useAuthStore()

  const authHeaders = () => auth.token
    ? { Authorization: `Bearer ${auth.token}` }
    : undefined

  const getMe = () => $fetch<{ success: boolean; data: ApiUser }>(useApiUrl('/api/me'), {
    headers: authHeaders()
  })

  const updateMe = (payload: ProfilePayload) => $fetch<{ message: string; data: ApiUser }>(useApiUrl('/api/me'), {
    method: 'PATCH',
    headers: authHeaders(),
    body: payload
  })

  const getLibrary = (params?: Record<string, string>) => $fetch<{ success: boolean; data: any[] }>(useApiUrl('/api/me/library'), {
    headers: authHeaders(),
    params
  })

  const getLibraryItem = (id: number | string) => $fetch<{ success: boolean; data: any }>(useApiUrl(`/api/me/library/${id}`), {
    headers: authHeaders()
  })

  const addLibraryItem = (payload: LibraryPayload) => $fetch<{ message: string; data: any }>(useApiUrl('/api/me/library'), {
    method: 'POST',
    headers: authHeaders(),
    body: payload
  })

  const updateLibraryItem = (id: number | string, payload: LibraryPayload) => $fetch<{ message: string; data: any }>(useApiUrl(`/api/me/library/${id}`), {
    method: 'PATCH',
    headers: authHeaders(),
    body: payload
  })

  const deleteLibraryItem = (id: number | string) => $fetch<{ message: string }>(useApiUrl(`/api/me/library/${id}`), {
    method: 'DELETE',
    headers: authHeaders()
  })

  const incrementLibraryProgress = (id: number | string) => $fetch<{ message: string; data: any }>(useApiUrl(`/api/me/library/${id}/progress`), {
    method: 'PUT',
    headers: authHeaders()
  })

  const setLibraryProgress = (id: number | string, payload: { season_watched: number; episodes_watched: number }) => $fetch<{ message: string; data: any }>(useApiUrl(`/api/me/library/${id}/set-progress`), {
    method: 'PUT',
    headers: authHeaders(),
    body: payload
  })

  const getPublicProfile = (username: string) => $fetch<{ success: boolean; data: PublicProfile }>(useApiUrl(`/api/users/${encodeURIComponent(username)}`), {
    headers: authHeaders()
  })

  const getPublicFavorites = (username: string) => $fetch<{ success: boolean; data: any[] }>(useApiUrl(`/api/users/${encodeURIComponent(username)}/favorites`))

  const getPublicRatings = (username: string) => $fetch<{ success: boolean; data: any[] }>(useApiUrl(`/api/users/${encodeURIComponent(username)}/ratings`))

  const searchUsers = (query?: string) => $fetch<{ success: boolean; data: CommunityUser[] }>(useApiUrl('/api/users/search'), {
    headers: authHeaders(),
    params: query ? { q: query } : undefined
  })

  const getUserFollowers = (username: string) => $fetch<{ success: boolean; data: CommunityUser[] }>(useApiUrl(`/api/users/${encodeURIComponent(username)}/followers`), {
    headers: authHeaders()
  })

  const getUserFollowing = (username: string) => $fetch<{ success: boolean; data: CommunityUser[] }>(useApiUrl(`/api/users/${encodeURIComponent(username)}/following`), {
    headers: authHeaders()
  })

  const followUser = (id: number | string) => $fetch<{ message: string; data: any }>(useApiUrl(`/api/me/follow/${id}`), {
    method: 'POST',
    headers: authHeaders()
  })

  const unfollowUser = (id: number | string) => $fetch<{ message: string }>(useApiUrl(`/api/me/follow/${id}`), {
    method: 'DELETE',
    headers: authHeaders()
  })

  const uploadAvatar = async (formData: FormData) => {
    try {
      return await $fetch<{ success: boolean; message: string; data: ApiUser }>(useApiUrl('/api/me/avatar'), {
        method: 'POST',
        headers: authHeaders(),
        body: formData
      })
    } catch (err: any) {
      if (err?.status === 404 || err?.statusCode === 404 || err?.response?.status === 404) {
        return await $fetch<{ success: boolean; message: string; data: ApiUser }>(useApiUrl('/api/user/avatar'), {
          method: 'POST',
          headers: authHeaders(),
          body: formData
        })
      }
      throw err
    }
  }

  const getRadar = () => $fetch<{ success: boolean; data: any[] }>(useApiUrl('/api/me/radar'), {
    headers: authHeaders()
  })

  const syncRadar = () => $fetch<{ success: boolean; message: string }>(useApiUrl('/api/me/radar/sync'), {
    method: 'POST',
    headers: authHeaders()
  })

  return {
    authHeaders,
    getMe,
    updateMe,
    uploadAvatar,
    getRadar,
    syncRadar,
    getLibrary,
    getLibraryItem,
    addLibraryItem,
    updateLibraryItem,
    deleteLibraryItem,
    incrementLibraryProgress,
    setLibraryProgress,
    getPublicProfile,
    getPublicFavorites,
    getPublicRatings,
    searchUsers,
    getUserFollowers,
    getUserFollowing,
    followUser,
    unfollowUser
  }
}
