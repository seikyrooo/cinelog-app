<template>
  <section class="public-profile-page">
    <div v-if="isLoading" class="public-state glass-card" aria-busy="true">Memuat public profile...</div>
    <div v-else-if="error" class="public-state glass-card" role="alert">
      <h1>Profile tidak tersedia</h1>
      <p>{{ error }}</p>
    </div>
    <template v-else-if="profile">
      <header class="public-hero glass-card">
        <div class="public-avatar" aria-hidden="true">
          <img v-if="profile.user.avatar_url" :src="profile.user.avatar_url" alt="" />
          <span v-else>{{ profile.user.username.slice(0, 2).toUpperCase() }}</span>
        </div>
        <div class="public-copy">
          <p class="eyebrow">Public Profile</p>
          <h1>@{{ profile.user.username }}</h1>
          <p>{{ profile.user.bio || 'Belum ada bio.' }}</p>
        </div>
        <div class="public-stats" aria-label="Statistik publik">
          <div><strong>{{ profile.favorite_count }}</strong><span>Favorit</span></div>
          <div><strong>{{ profile.rating_count }}</strong><span>Rating</span></div>
        </div>
      </header>

      <div class="tabs" role="tablist" aria-label="Konten profile publik">
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
            <strong v-if="item.rating">★ {{ item.rating }}/10</strong>
            <strong v-else-if="item.favorite">★ Favorit</strong>
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
    error.value = err?.data?.error || 'Profile user tidak ditemukan atau bersifat private.'
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
    case 'watching': return 'Watching'
    case 'completed': return 'Completed'
    case 'on_hold': return 'On Hold'
    case 'dropped': return 'Dropped'
    default: return 'Plan to Watch'
  }
}
</script>

<style scoped>
.public-profile-page {
  display: grid;
  gap: 20px;
}

.public-hero {
  align-items: center;
  display: grid;
  gap: 20px;
  grid-template-columns: auto 1fr auto;
  padding: 24px;
}

.public-avatar {
  width: 96px;
  height: 96px;
  border-radius: 24px;
  background: rgba(56, 189, 248, 0.12);
  border: 1px solid rgba(56, 189, 248, 0.28);
  color: #67e8f9;
  display: grid;
  font-size: 1.8rem;
  font-weight: 900;
  overflow: hidden;
  place-items: center;
}

.public-avatar img,
.public-card img {
  height: 100%;
  object-fit: cover;
  width: 100%;
}

.eyebrow {
  color: var(--accent-cyan);
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.public-copy h1 {
  font-size: clamp(2rem, 4vw, 3.2rem);
  margin: 4px 0 8px;
}

.public-copy p,
.public-card-body p,
.public-state p {
  color: var(--text-secondary);
}

.public-stats {
  display: flex;
  gap: 12px;
}

.public-stats div {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--glass-border);
  border-radius: 14px;
  min-width: 92px;
  padding: 12px;
  text-align: center;
}

.public-stats strong {
  display: block;
  font-size: 1.5rem;
}

.public-stats span {
  color: var(--text-secondary);
  font-size: 0.8rem;
}

.tabs {
  display: flex;
  gap: 10px;
}

.tab-btn {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  color: var(--text-secondary);
  cursor: pointer;
  font-weight: 800;
  padding: 10px 16px;
}

.tab-btn.active,
.tab-btn:hover {
  background: rgba(56, 189, 248, 0.14);
  border-color: rgba(56, 189, 248, 0.35);
  color: #e0f2fe;
}

.public-grid {
  display: grid;
  gap: 18px;
  grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
}

.public-card {
  overflow: hidden;
}

.public-card img {
  aspect-ratio: 2 / 3;
  display: block;
}

.public-card-body {
  display: grid;
  gap: 8px;
  padding: 14px;
}

.public-card-body h2 {
  font-size: 1rem;
  line-height: 1.3;
}

.public-card-body strong {
  color: #fbbf24;
}

.public-state {
  padding: 24px;
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