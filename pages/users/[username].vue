<template>
  <section class="public-profile-page">
    <div v-if="isLoading" class="public-state glass-card" aria-busy="true">Memuat profil publik...</div>
    <div v-else-if="error" class="public-state glass-card" role="alert">
      <h1>Profil Tidak Tersedia</h1>
      <p>{{ error }}</p>
    </div>
    <template v-else-if="profile">
      <header class="public-hero glass-card">
        <div class="public-avatar" aria-hidden="true">
          <img v-if="profile.user.avatar_url" :src="profile.user.avatar_url" alt="" />
          <span v-else>{{ profile.user.username.slice(0, 2).toUpperCase() }}</span>
        </div>
        <div class="public-copy">
          <h1>@{{ profile.user.username }}</h1>
          <p>{{ profile.user.bio || 'Belum ada bio.' }}</p>
        </div>
        <div class="public-stats" aria-label="Statistik publik">
          <div><strong>{{ profile.favorite_count }}</strong><span>Favorit</span></div>
          <div><strong>{{ profile.rating_count }}</strong><span>Rating</span></div>
        </div>
      </header>

      <div class="tabs" role="tablist" aria-label="Konten profil publik">
        <button :class="['tab-btn', { active: activeTab === 'favorites' }]" type="button" @click="activeTab = 'favorites'">
          Favorit Publik
        </button>
        <button :class="['tab-btn', { active: activeTab === 'ratings' }]" type="button" @click="activeTab = 'ratings'">
          Rating Publik
        </button>
      </div>

      <div v-if="activeItems.length === 0" class="public-state glass-card">
        Belum ada {{ activeTab === 'favorites' ? 'favorit' : 'rating' }} publik.
      </div>

      <div v-else class="public-grid">
        <article v-for="item in activeItems" :key="item.id" class="public-card glass-card">
          <img :src="getPosterUrl(item.movie)" :alt="item.movie?.title || 'Poster media'" @error="onImageError" />
          <div class="public-card-body">
            <span :class="['badge', item.movie?.media_type === 'tv' ? 'badge-tv' : 'badge-movie']">
              {{ item.movie?.media_type === 'tv' ? 'TV' : 'Movie' }}
            </span>
            <h2>{{ item.movie?.title || 'Untitled' }}</h2>
            <p>{{ formatYear(item.movie?.release_date) }} · {{ getStatusLabel(item.status) }}</p>
            <strong v-if="item.rating" class="rating-tag">★ {{ item.rating }}/10</strong>
            <strong v-else-if="item.favorite" class="favorite-tag">♥ Favorit</strong>
          </div>
        </article>
      </div>
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { PublicProfile } from '~/composables/useApi'

const route = useRoute()
const api = useApi()

const username = computed(() => String(route.params.username || ''))
const profile = ref<PublicProfile | null>(null)
const favorites = ref<any[]>([])
const ratings = ref<any[]>([])
const activeTab = ref<'favorites' | 'ratings'>('favorites')
const isLoading = ref(true)
const error = ref('')

const activeItems = computed(() => activeTab.value === 'favorites' ? favorites.value : ratings.value)

onMounted(async () => {
  try {
    const [profileRes, favoritesRes, ratingsRes] = await Promise.all([
      api.getPublicProfile(username.value),
      api.getPublicFavorites(username.value),
      api.getPublicRatings(username.value)
    ])
    profile.value = profileRes.data
    favorites.value = favoritesRes.data || []
    ratings.value = ratingsRes.data || []
  } catch (err: any) {
    error.value = err?.data?.error || 'Profil pengguna tidak ditemukan atau bersifat privat.'
  } finally {
    isLoading.value = false
  }
})

const getPosterUrl = (movie: any) => {
  if (movie?.local_poster_path) return useApiUrl(movie.local_poster_path)
  if (movie?.poster_path) return `https://image.tmdb.org/t/p/w500${movie.poster_path}`
  return 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=500&q=80'
}

const onImageError = (e: Event) => {
  ;(e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=500&q=80'
}

const formatYear = (dateStr?: string) => dateStr ? dateStr.substring(0, 4) : '—'

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'watching': return 'Sedang Ditonton'
    case 'completed': return 'Selesai'
    case 'on_hold': return 'Tertunda'
    case 'dropped': return 'Diberhentikan'
    default: return 'Rencana Nonton'
  }
}
</script>

<style scoped>
.public-profile-page {
  display: grid;
  gap: 24px;
}

.public-hero {
  align-items: center;
  display: grid;
  gap: 24px;
  grid-template-columns: auto 1fr auto;
  padding: 24px;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
}

.public-avatar {
  width: 80px;
  height: 80px;
  border-radius: 14px;
  background: rgba(229, 9, 20, 0.12);
  border: 1px solid var(--border-red);
  color: #ff6b6b;
  display: grid;
  font-size: 1.6rem;
  font-weight: 800;
  overflow: hidden;
  place-items: center;
}

.public-avatar img,
.public-card img {
  height: 100%;
  object-fit: cover;
  width: 100%;
}

.public-copy h1 {
  font-size: 1.8rem;
  margin: 0 0 4px;
  color: #ffffff;
}

.public-copy p,
.public-card-body p,
.public-state p {
  color: var(--text-secondary);
  font-size: 0.88rem;
}

.public-stats {
  display: flex;
  gap: 10px;
}

.public-stats div {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  min-width: 84px;
  padding: 10px;
  text-align: center;
}

.public-stats strong {
  display: block;
  font-size: 1.3rem;
  color: #ffffff;
}

.public-stats span {
  color: var(--text-secondary);
  font-size: 0.78rem;
}

.tabs {
  display: flex;
  gap: 8px;
}

.tab-btn {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  color: var(--text-secondary);
  cursor: pointer;
  font-weight: 700;
  font-size: 0.88rem;
  padding: 8px 18px;
  transition: all 0.2s ease;
}

.tab-btn.active {
  background: var(--accent-red);
  border-color: var(--accent-red);
  color: #ffffff;
}

.tab-btn:hover:not(.active) {
  background: rgba(255, 255, 255, 0.08);
  color: #ffffff;
}

.public-grid {
  display: grid;
  gap: 18px;
  grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
}

.public-card {
  overflow: hidden;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  transition: all 0.25s ease;
}

.public-card:hover {
  border-color: var(--border-red);
  transform: translateY(-4px);
}

.public-card img {
  aspect-ratio: 2 / 3;
  display: block;
}

.public-card-body {
  display: grid;
  gap: 6px;
  padding: 12px;
}

.public-card-body h2 {
  font-size: 0.92rem;
  line-height: 1.3;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.rating-tag {
  color: var(--accent-star);
  font-size: 0.85rem;
}

.favorite-tag {
  color: var(--accent-red);
  font-size: 0.85rem;
}

.public-state {
  padding: 32px;
  text-align: center;
  border-radius: 8px;
}

@media (max-width: 760px) {
  .public-hero {
    align-items: flex-start;
    grid-template-columns: 1fr;
  }

  .public-stats {
    width: 100%;
  }

  .public-stats div {
    flex: 1;
  }
}
</style>