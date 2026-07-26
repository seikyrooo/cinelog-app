<template>
  <div class="watchlist-page">
    <!-- Header & Main View Mode (Shows vs Movies) -->
    <div class="header-banner">
      <div class="main-mode-toggle glass-panel">
        <button 
          @click="mediaTypeTab = 'tv'; fetchWatchlist()"
          :class="['mode-btn', { active: mediaTypeTab === 'tv' }]"
        >
          📺 TV Shows (Series)
        </button>
        <button 
          @click="mediaTypeTab = 'movie'; fetchWatchlist()"
          :class="['mode-btn', { active: mediaTypeTab === 'movie' }]"
        >
          🎬 Movies
        </button>
      </div>

      <!-- Secondary Status Filter Tabs -->
      <div class="filter-tabs">
        <button 
          v-for="status in statusTabs" 
          :key="status.value"
          @click="activeStatus = status.value; fetchWatchlist()"
          :class="['tab-btn', { active: activeStatus === status.value }]"
        >
          {{ status.label }}
        </button>

        <button 
          @click="favoriteOnly = !favoriteOnly; fetchWatchlist()"
          :class="['tab-btn favorite-tab', { active: favoriteOnly }]"
        >
          ★ Favorit
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Memuat daftar tontonan...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="watchlist.length === 0" class="empty-state glass-card">
      <h3>Belum Ada {{ mediaTypeTab === 'tv' ? 'TV Show' : 'Film' }} Ditemukan</h3>
      <p>Kamu belum menambahkan {{ mediaTypeTab === 'tv' ? 'TV series' : 'film' }} di kategori ini.</p>
      <NuxtLink to="/" class="btn-primary" style="margin-top: 14px;">
        + Cari {{ mediaTypeTab === 'tv' ? 'TV Series' : 'Film' }}
      </NuxtLink>
    </div>

    <!-- TV SHOWS TRACKER (TV Time Style) -->
    <div v-else-if="mediaTypeTab === 'tv'" class="shows-list">
      <div 
        v-for="item in watchlist" 
        :key="item.id" 
        class="glass-card show-row-card"
      >
        <img 
          :src="getPosterUrl(item.movie)" 
          :alt="item.movie.title"
          class="show-poster clickable"
          @click="openDetailModal(item)"
          @error="onImageError"
        />

        <div class="show-content">
          <div class="show-top">
            <h3 class="show-title clickable" @click="openDetailModal(item)">{{ item.movie.title }}</h3>
            <span :class="['badge', getStatusBadgeClass(item.status)]">
              {{ getStatusLabel(item.status) }}
            </span>
          </div>

          <p class="show-meta" v-if="item.movie.director || item.movie.cast">
            <span v-if="item.movie.director" class="meta-director">Kreator: <strong>{{ item.movie.director }}</strong></span>
            <span v-if="item.movie.cast" class="meta-cast"> • {{ truncateText(item.movie.cast, 40) }}</span>
          </p>

          <!-- TV Time Progress Bar & Tracker -->
          <div class="tracker-box">
            <div class="tracker-info">
              <span class="eps-counter">
                Season {{ item.season_watched || 1 }} • Episode {{ item.episodes_watched }}
                <span v-if="getEffectiveTotalEps(item) > 0"> / {{ getEffectiveTotalEps(item) }}</span>
              </span>
              <span class="eps-percent" v-if="getEffectiveTotalEps(item) > 0">
                {{ Math.min(100, Math.round((item.episodes_watched / getEffectiveTotalEps(item)) * 100)) }}%
              </span>
            </div>

            <!-- Progress Bar -->
            <div class="progress-bar-bg" v-if="getEffectiveTotalEps(item) > 0">
              <div 
                class="progress-bar-fill"
                :style="{ width: Math.min(100, (item.episodes_watched / getEffectiveTotalEps(item)) * 100) + '%' }"
              ></div>
            </div>

            <!-- Upcoming episode air date banner -->
            <div v-if="item.movie.next_air_date" class="next-air-banner">
              📅 Episode berikutnya: <strong>{{ item.movie.next_air_date }}</strong>
              <span v-if="item.movie.next_episode_name"> ({{ item.movie.next_episode_name }})</span>
            </div>
          </div>

          <!-- Rating & Notes -->
          <div class="show-footer">
            <div class="stars-display" v-if="item.rating > 0">
              <span class="stars-gold">★</span>
              <span class="rating-text"><strong>{{ item.rating }}</strong> / 5.0</span>
            </div>
            
            <div class="action-buttons">
              <button 
                @click="incrementEpisode(item)" 
                class="btn-primary text-sm" 
                title="Klik untuk menyelesaikan 1 episode lagi"
              >
                +1 Eps Nonton
              </button>
              <button @click="openDetailModal(item)" class="btn-secondary text-sm">
                Lihat Episode
              </button>
              <button @click="openEditModal(item)" class="btn-secondary text-sm">
                Edit
              </button>
              <button @click="deleteItem(item.id)" class="btn-danger text-sm">
                Hapus
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- MOVIES TRACKER -->
    <div v-else class="movies-grid">
      <div 
        v-for="item in watchlist" 
        :key="item.id" 
        class="glass-card movie-item-card"
      >
        <div class="card-poster clickable" @click="openDetailModal(item)">
          <img 
            :src="getPosterUrl(item.movie)" 
            :alt="item.movie.title"
            class="poster-img"
            @error="onImageError"
          />
          <span :class="['badge', getStatusBadgeClass(item.status), 'status-badge']">
            {{ getStatusLabel(item.status) }}
          </span>
          <span v-if="item.favorite" class="fav-badge">★ Favorit</span>
        </div>

        <div class="card-details">
          <div class="details-top">
            <span class="movie-year">{{ formatYear(item.movie.release_date) }}</span>
            <span class="user-rating" v-if="item.rating > 0">
              ★ <strong>{{ item.rating }}</strong> / 5.0
            </span>
          </div>

          <h3 class="movie-title clickable" @click="openDetailModal(item)">{{ item.movie.title }}</h3>
          <p class="director-text" v-if="item.movie.director">Sutradara: {{ item.movie.director }}</p>

          <p v-if="item.notes" class="user-notes">
            "{{ item.notes }}"
          </p>

          <div class="card-actions">
            <button @click="openDetailModal(item)" class="btn-secondary text-sm">
              Detail
            </button>
            <button @click="openEditModal(item)" class="btn-secondary text-sm">
              Edit
            </button>
            <button @click="deleteItem(item.id)" class="btn-danger text-sm">
              Hapus
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Full Detail & Seasons Breakdown dengan Banner Backdrop & Episode Still Banners -->
    <div v-if="showDetailModal" class="modal-overlay" @click.self="showDetailModal = false">
      <div class="modal-content glass-panel detail-modal-content animate-fade-in">
        
        <!-- Fixed Top Right Close Button -->
        <button @click="showDetailModal = false" class="close-btn-fixed" title="Tutup Modal">&times;</button>

        <!-- Movie/Show Hero Backdrop Banner -->
        <div class="hero-backdrop-banner" :style="getBackdropStyle(activeDetailMedia)">
          <div class="hero-backdrop-gradient">
            <div class="hero-media-info">
              <span :class="['badge', isTvShowContext ? 'badge-tv' : 'badge-movie']">
                {{ isTvShowContext ? 'TV Show' : 'Movie' }}
              </span>
              <span v-if="activeDetailMedia?.vote_average" class="hero-rating-badge">
                ★ {{ (activeDetailMedia.vote_average / 2).toFixed(1) }} / 5.0
              </span>
              <h2 class="hero-media-title">{{ activeDetailMedia?.title || activeWatchlistContext?.movie?.title }}</h2>
              <p class="hero-media-subtitle">
                {{ formatYear(activeDetailMedia?.release_date || activeWatchlistContext?.movie?.release_date) }}
                <span v-if="activeDetailMedia?.media_status"> • {{ activeDetailMedia.media_status }}</span>
              </p>
            </div>
          </div>
        </div>

        <!-- Detail Body -->
        <div class="detail-body">
          <div class="meta-info-box">
            <p v-if="activeDetailMedia?.director || activeWatchlistContext?.movie?.director">
              <strong>Sutradara / Pembuat:</strong> <span class="highlight-text">{{ activeDetailMedia?.director || activeWatchlistContext?.movie?.director }}</span>
            </p>
            <p v-if="activeDetailMedia?.cast || activeWatchlistContext?.movie?.cast">
              <strong>Pemeran Utama:</strong> {{ activeDetailMedia?.cast || activeWatchlistContext?.movie?.cast }}
            </p>
          </div>

          <p class="overview-text">{{ activeDetailMedia?.overview || activeWatchlistContext?.movie?.overview }}</p>

          <!-- If TV Show: Season Selector & Interactive Episode Cards with Still Banners -->
          <div v-if="isTvShowContext" class="seasons-section">
            <div class="section-header-row">
              <h4 class="section-subtitle">Daftar Season & Episode</h4>
              <span class="watched-counter-badge" v-if="activeWatchlistContext">
                Progres: {{ activeWatchlistContext.episodes_watched }} eps ditonton
              </span>
            </div>

            <!-- Season Chips Selector (Season 1, 2, 3...) -->
            <div class="season-chips">
              <button 
                v-for="s in seasonsCount" 
                :key="s"
                @click="fetchSeasonEpisodes(s)"
                :class="['season-chip', { active: selectedSeason === s }]"
              >
                Season {{ s }}
              </button>
            </div>

            <!-- Episodes List with Episode Still Banner -->
            <div v-if="isLoadingEpisodes" class="loading-state text-sm">
              <div class="spinner"></div>
              <span>Memuat episode Season {{ selectedSeason }}...</span>
            </div>

            <div v-else class="episodes-list">
              <div 
                v-for="eps in episodesList" 
                :key="eps.episode_number"
                :class="['episode-item', 'glass-card', { watched: isEpisodeWatched(eps.episode_number) }]"
              >
                <!-- Episode Banner Still Image -->
                <div class="eps-banner-wrapper">
                  <img 
                    :src="getEpisodeStillUrl(eps.still_path)" 
                    :alt="eps.name"
                    class="eps-still-img"
                    @error="onEpsImageError"
                  />
                  <span class="eps-num-badge">Eps {{ eps.episode_number }}</span>
                </div>

                <div class="eps-info">
                  <div class="eps-header">
                    <h5 class="eps-name">{{ eps.name }}</h5>
                    <span class="eps-date" v-if="eps.air_date">Tayang: {{ eps.air_date }}</span>
                  </div>
                  <p class="eps-overview" v-if="eps.overview">{{ truncateText(eps.overview, 110) }}</p>
                </div>

                <!-- Watched Checkmark Toggle Button -->
                <button 
                  v-if="activeWatchlistContext"
                  @click="toggleEpisodeWatched(eps.episode_number)"
                  :class="['eps-toggle-btn', { active: isEpisodeWatched(eps.episode_number) }]"
                >
                  {{ isEpisodeWatched(eps.episode_number) ? '✓ Sudah' : '+ Tonton' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Edit Watchlist Item -->
    <div v-if="showEditModal" class="modal-overlay" @click.self="showEditModal = false">
      <div class="modal-content glass-panel animate-fade-in">
        <!-- Fixed Close Button -->
        <button @click="showEditModal = false" class="close-btn-fixed" title="Tutup Modal">&times;</button>

        <h2 class="modal-title">Edit Watchlist</h2>
        <p class="modal-subtitle">{{ editingItem?.movie?.title }}</p>

        <form @submit.prevent="updateWatchlist" class="modal-form">
          <div class="form-group">
            <label>Status Tontonan</label>
            <select v-model="editForm.status" class="form-input">
              <option value="watching">Sedang Nonton (Watching)</option>
              <option value="completed">Selesai (Completed)</option>
              <option value="plan_to_watch">Rencana Nonton (Plan to Watch)</option>
              <option value="on_hold">Ditunda (On Hold)</option>
              <option value="dropped">Dihentikan (Dropped)</option>
            </select>
          </div>

          <div class="form-group">
            <label>Rating Kamu (1 - 5 Bintang)</label>
            <div class="star-rating-selector">
              <span 
                v-for="star in 5" 
                :key="star"
                @click="editForm.rating = star"
                :class="['star-icon', { active: star <= editForm.rating }]"
              >★</span>
              <span class="rating-number">{{ editForm.rating > 0 ? editForm.rating + ' / 5.0' : 'Belum dinilai' }}</span>
            </div>
          </div>

          <div v-if="editingItem?.movie?.media_type === 'tv'" class="form-row">
            <div class="form-group flex-1">
              <label>Season</label>
              <input v-model.number="editForm.season_watched" type="number" min="1" class="form-input" />
            </div>
            <div class="form-group flex-1">
              <label>Eps Ditonton</label>
              <input v-model.number="editForm.episodes_watched" type="number" min="0" class="form-input" />
            </div>
            <div class="form-group flex-1">
              <label>Total Eps</label>
              <input v-model.number="editForm.total_episodes" type="number" min="0" class="form-input" />
            </div>
          </div>

          <div class="form-group checkbox-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="editForm.favorite" />
              Tandai sebagai Favorit
            </label>
          </div>

          <div class="form-group">
            <label>Catatan / Review Singkat</label>
            <textarea v-model="editForm.notes" class="form-input text-area"></textarea>
          </div>

          <div class="modal-actions">
            <button type="button" @click="showEditModal = false" class="btn-secondary">Batal</button>
            <button type="submit" class="btn-primary">Update</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
const router = useRouter()

const isLoading = ref(true)
const watchlist = ref<any[]>([])
const mediaTypeTab = ref('tv')
const activeStatus = ref('all')
const favoriteOnly = ref(false)

const showEditModal = ref(false)
const editingItem = ref<any>(null)
const editForm = ref({
  status: 'watching',
  rating: 4.5,
  favorite: false,
  notes: '',
  season_watched: 1,
  episodes_watched: 0,
  total_episodes: 0
})

const showDetailModal = ref(false)
const activeDetailMedia = ref<any>(null)
const activeWatchlistContext = ref<any>(null)
const selectedSeason = ref(1)
const isLoadingEpisodes = ref(false)
const episodesList = ref<any[]>([])

const statusTabs = [
  { label: 'Semua', value: 'all' },
  { label: 'Watching', value: 'watching' },
  { label: 'Completed', value: 'completed' },
  { label: 'Plan to Watch', value: 'plan_to_watch' }
]

const isTvShowContext = computed(() => {
  return activeDetailMedia.value?.media_type === 'tv' || activeWatchlistContext.value?.movie?.media_type === 'tv'
})

const seasonsCount = computed(() => {
  if (activeDetailMedia.value?.seasons?.length) {
    return activeDetailMedia.value.seasons.length
  }
  return activeDetailMedia.value?.total_seasons || activeWatchlistContext.value?.movie?.total_seasons || 1
})

const fetchWatchlist = async () => {
  if (!authStore.isAuth) {
    router.push('/login')
    return
  }
  isLoading.value = true

  try {
    const params: any = {
      media_type: mediaTypeTab.value
    }
    if (activeStatus.value !== 'all') params.status = activeStatus.value
    if (favoriteOnly.value) params.favorite = 'true'

    const res: any = await $fetch(useApiUrl('/api/user/watchlist'), {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      },
      params
    })
    watchlist.value = res.data || []
  } catch (err) {
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchWatchlist()
})

const getEffectiveTotalEps = (item: any) => {
  if (item.total_episodes > 0) return item.total_episodes
  if (item.movie?.total_episodes > 0) return item.movie.total_episodes
  return 0
}

const getBackdropStyle = (media: any) => {
  const path = media?.backdrop_path || media?.poster_path
  if (!path) return { background: '#1e293b' }
  const url = path.startsWith('/uploads') ? useApiUrl(path) : `https://image.tmdb.org/t/p/w780${path}`
  return { backgroundImage: `url(${url})` }
}

const getEpisodeStillUrl = (path: string) => {
  if (!path) return 'https://via.placeholder.com/160x90?text=No+Preview'
  return `https://image.tmdb.org/t/p/w500${path}`
}

const onEpsImageError = (e: Event) => {
  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/160x90?text=No+Preview'
}

const openDetailModal = async (contextItem: any) => {
  let movieObj = contextItem.movie ? contextItem.movie : contextItem
  activeWatchlistContext.value = contextItem.movie ? contextItem : null
  activeDetailMedia.value = movieObj
  selectedSeason.value = contextItem.season_watched || 1
  episodesList.value = []
  showDetailModal.value = true

  try {
    const res: any = await $fetch(useApiUrl('/api/detail'), {
      params: {
        id: movieObj.tmdb_id || movieObj.id,
        type: movieObj.media_type || 'tv'
      }
    })
    if (res.data) {
      activeDetailMedia.value = res.data
    }
  } catch (err) {
    console.error(err)
  }

  if (isTvShowContext.value) {
    fetchSeasonEpisodes(selectedSeason.value)
  }
}

const fetchSeasonEpisodes = async (seasonNum: number) => {
  const tmdbId = activeDetailMedia.value?.id || activeDetailMedia.value?.tmdb_id || activeWatchlistContext.value?.movie?.tmdb_id
  if (!tmdbId) return

  selectedSeason.value = seasonNum
  isLoadingEpisodes.value = true

  try {
    const res: any = await $fetch(useApiUrl('/api/tv/season'), {
      params: {
        id: tmdbId,
        season: seasonNum
      }
    })
    episodesList.value = res.data || []
  } catch (err) {
    console.error(err)
  } finally {
    isLoadingEpisodes.value = false
  }
}

const isEpisodeWatched = (epsNumber: number) => {
  if (!activeWatchlistContext.value) return false
  const watchedEps = activeWatchlistContext.value.episodes_watched || 0
  const currentSeason = activeWatchlistContext.value.season_watched || 1
  
  if (selectedSeason.value < currentSeason) return true
  if (selectedSeason.value === currentSeason) return epsNumber <= watchedEps
  return false
}

const toggleEpisodeWatched = async (epsNumber: number) => {
  if (!activeWatchlistContext.value) return

  const targetEpsCount = isEpisodeWatched(epsNumber) ? epsNumber - 1 : epsNumber

  try {
    const res: any = await $fetch(useApiUrl(`/api/user/watchlist/${activeWatchlistContext.value.id}/set-progress`), {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${authStore.token}`
      },
      body: {
        season_watched: selectedSeason.value,
        episodes_watched: Math.max(0, targetEpsCount)
      }
    })

    if (res.data) {
      activeWatchlistContext.value.season_watched = res.data.season_watched
      activeWatchlistContext.value.episodes_watched = res.data.episodes_watched
      activeWatchlistContext.value.status = res.data.status
    }
  } catch (err) {
    console.error(err)
  }
}

const getPosterUrl = (movie: any) => {
  if (movie?.local_poster_path) {
    return useApiUrl(movie.local_poster_path)
  }
  if (movie?.poster_path) {
    return `https://image.tmdb.org/t/p/w500${movie.poster_path}`
  }
  return 'https://via.placeholder.com/300x450?text=No+Poster'
}

const onImageError = (e: Event) => {
  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x450?text=No+Poster'
}

const formatYear = (dateStr: string) => {
  if (!dateStr) return ''
  return dateStr.substring(0, 4)
}

const truncateText = (text: string, len: number) => {
  if (!text) return ''
  return text.length > len ? text.substring(0, len) + '...' : text
}

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'watching': return 'badge-watching'
    case 'completed': return 'badge-completed'
    default: return 'badge-plan'
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'watching': return 'Watching'
    case 'completed': return 'Completed'
    case 'on_hold': return 'On Hold'
    case 'dropped': return 'Dropped'
    default: return 'Plan to Watch'
  }
}

const incrementEpisode = async (item: any) => {
  try {
    const res: any = await $fetch(useApiUrl(`/api/user/watchlist/${item.id}/progress`), {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })
    if (res.data) {
      item.episodes_watched = res.data.episodes_watched
      item.status = res.data.status
    }
  } catch (err) {
    console.error(err)
  }
}

const openEditModal = (item: any) => {
  editingItem.value = item
  editForm.value = {
    status: item.status,
    rating: item.rating || 4.0,
    favorite: item.favorite,
    notes: item.notes || '',
    season_watched: item.season_watched || 1,
    episodes_watched: item.episodes_watched || 0,
    total_episodes: item.total_episodes || item.movie?.total_episodes || 0
  }
  showEditModal.value = true
}

const updateWatchlist = async () => {
  if (!editingItem.value) return
  try {
    await $fetch(useApiUrl(`/api/user/watchlist/${editingItem.value.id}`), {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${authStore.token}`
      },
      body: editForm.value
    })
    showEditModal.value = false
    fetchWatchlist()
  } catch (err: any) {
    alert(err?.data?.error || 'Gagal mengupdate watchlist.')
  }
}

const deleteItem = async (id: number) => {
  if (!confirm('Hapus item ini dari watchlist kamu?')) return
  try {
    await $fetch(useApiUrl(`/api/user/watchlist/${id}`), {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })
    fetchWatchlist()
  } catch (err: any) {
    alert(err?.data?.error || 'Gagal menghapus item.')
  }
}
</script>

<style scoped>
.header-banner {
  margin-bottom: 28px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.main-mode-toggle {
  display: flex;
  padding: 6px;
  border-radius: 14px;
  gap: 8px;
  max-width: 380px;
}

.mode-btn {
  flex: 1;
  background: transparent;
  border: none;
  color: var(--text-secondary);
  padding: 10px 16px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}

.mode-btn.active {
  background: var(--accent-purple);
  color: #fff;
}

.filter-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tab-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--glass-border);
  color: var(--text-secondary);
  padding: 6px 14px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.82rem;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn.active {
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
  border-color: rgba(255, 255, 255, 0.25);
}

.favorite-tab.active {
  background: var(--accent-gold);
  color: #0f172a;
  border-color: var(--accent-gold);
}

.clickable {
  cursor: pointer;
}

/* TV Shows List Layout */
.shows-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.show-row-card {
  display: flex;
  gap: 16px;
  padding: 16px;
  align-items: flex-start;
}

.show-poster {
  width: 90px;
  height: 130px;
  border-radius: 10px;
  object-fit: cover;
  flex-shrink: 0;
}

.show-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.show-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.show-title {
  font-size: 1.15rem;
  font-weight: 800;
  color: #fff;
}

.show-meta {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-bottom: 12px;
}

.meta-director {
  color: #fbbf24;
}

.tracker-box {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--glass-border);
  padding: 10px 14px;
  border-radius: 10px;
  margin-bottom: 12px;
}

.tracker-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.82rem;
  margin-bottom: 6px;
}

.eps-counter {
  color: #fff;
  font-weight: 600;
}

.eps-percent {
  color: var(--accent-purple);
  font-weight: 700;
}

.progress-bar-bg {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #8b5cf6, #38bdf8);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.next-air-banner {
  margin-top: 8px;
  font-size: 0.78rem;
  color: #38bdf8;
}

.show-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.stars-display {
  display: flex;
  align-items: center;
  gap: 4px;
}

.stars-gold {
  color: #fbbf24;
}

.rating-text {
  font-size: 0.82rem;
  color: var(--text-secondary);
}

.action-buttons {
  display: flex;
  gap: 8px;
}

/* Movies Grid Layout */
.movies-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
}

.movie-item-card {
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.card-poster {
  position: relative;
  width: 100%;
  padding-top: 140%;
  background: #151d2a;
}

.poster-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.status-badge {
  position: absolute;
  top: 10px;
  left: 10px;
}

.fav-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: var(--accent-gold);
  color: #0f172a;
  font-weight: 700;
  font-size: 0.75rem;
  padding: 3px 8px;
  border-radius: 6px;
}

.card-details {
  padding: 14px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.details-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.movie-year {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.user-rating {
  font-size: 0.82rem;
  color: #fbbf24;
}

.movie-title {
  font-size: 1.05rem;
  color: #fff;
  font-weight: 700;
  margin-bottom: 4px;
}

.director-text {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.user-notes {
  font-size: 0.8rem;
  color: #cbd5e1;
  font-style: italic;
  background: rgba(255, 255, 255, 0.04);
  padding: 8px;
  border-radius: 8px;
  margin-bottom: 12px;
}

.card-actions {
  display: flex;
  gap: 8px;
  margin-top: auto;
}

.card-actions button {
  flex: 1;
}

/* Detail Modal Style with Backdrop & Episode Still Banner */
.detail-modal-content {
  position: relative;
  max-width: 680px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 0;
  border-radius: 24px;
  overflow: hidden;
}

/* Fixed Top Right Close Button */
.close-btn-fixed {
  position: absolute;
  top: 16px;
  right: 18px;
  z-index: 30;
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #fff;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.close-btn-fixed:hover {
  background: rgba(239, 68, 68, 0.85);
  transform: scale(1.05);
}

.hero-backdrop-banner {
  height: 220px;
  background-size: cover;
  background-position: center;
  position: relative;
}

.hero-backdrop-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.2) 0%, rgba(15, 23, 42, 0.95) 85%, #0f172a 100%);
  display: flex;
  align-items: flex-end;
  padding: 20px;
}

.hero-media-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.hero-rating-badge {
  color: #fbbf24;
  font-weight: 700;
  font-size: 0.85rem;
}

.hero-media-title {
  font-size: 1.6rem;
  font-weight: 800;
  color: #fff;
  line-height: 1.2;
}

.hero-media-subtitle {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.detail-body {
  padding: 20px;
}

.meta-info-box {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--glass-border);
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-bottom: 14px;
}

.highlight-text {
  color: #fbbf24;
  font-weight: 600;
}

.overview-text {
  font-size: 0.88rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 20px;
}

.seasons-section {
  margin-top: 16px;
}

.section-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-subtitle {
  font-size: 1.05rem;
  font-weight: 800;
  color: #fff;
}

.watched-counter-badge {
  font-size: 0.78rem;
  color: #fbbf24;
  font-weight: 700;
  background: rgba(251, 191, 36, 0.12);
  padding: 4px 10px;
  border-radius: 8px;
}

.season-chips {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 8px;
  margin-bottom: 14px;
}

.season-chip {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--glass-border);
  color: var(--text-secondary);
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 0.82rem;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}

.season-chip.active {
  background: var(--accent-gold);
  color: #0f172a;
  font-weight: 700;
}

.episodes-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 340px;
  overflow-y: auto;
}

.episode-item {
  display: flex;
  gap: 14px;
  padding: 12px;
  align-items: center;
  transition: all 0.2s;
  border-radius: 14px;
}

.episode-item.watched {
  border-color: rgba(74, 222, 128, 0.3);
  background: rgba(74, 222, 128, 0.05);
}

.eps-banner-wrapper {
  position: relative;
  width: 120px;
  height: 68px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  background: #151d2a;
}

.eps-still-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.eps-num-badge {
  position: absolute;
  bottom: 4px;
  left: 4px;
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(4px);
  color: #fff;
  font-size: 0.7rem;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 4px;
}

.eps-info {
  flex: 1;
}

.eps-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2px;
}

.eps-name {
  font-size: 0.92rem;
  font-weight: 700;
  color: #fff;
}

.eps-date {
  font-size: 0.75rem;
  color: var(--text-muted);
  white-space: nowrap;
}

.eps-overview {
  font-size: 0.78rem;
  color: var(--text-secondary);
  margin-top: 4px;
  line-height: 1.35;
}

.eps-toggle-btn {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid var(--glass-border);
  color: var(--text-secondary);
  padding: 8px 14px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.eps-toggle-btn.active {
  background: #22c55e;
  color: #fff;
  border-color: #22c55e;
}

.loading-state, .empty-state {
  text-align: center;
  padding: 60px;
  color: var(--text-secondary);
}

.text-sm {
  font-size: 0.78rem;
  padding: 6px 12px;
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal-content {
  width: 100%;
  max-width: 480px;
  border-radius: 20px;
  padding: 24px;
  position: relative;
}

.modal-title {
  font-size: 1.4rem;
  margin-bottom: 2px;
}

.modal-subtitle {
  color: var(--accent-gold);
  font-size: 0.85rem;
  margin-bottom: 16px;
}

.form-group {
  margin-bottom: 14px;
}

.form-row {
  display: flex;
  gap: 10px;
}

.flex-1 {
  flex: 1;
}

.form-group label {
  display: block;
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-bottom: 4px;
  font-weight: 600;
}

.form-input {
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--glass-border);
  color: #fff;
  padding: 8px 12px;
  border-radius: 10px;
  font-family: inherit;
  outline: none;
  font-size: 0.9rem;
}

.form-input option {
  background: #0f172a;
}

.star-rating-selector {
  display: flex;
  align-items: center;
  gap: 6px;
}

.star-icon {
  font-size: 1.4rem;
  color: #475569;
  cursor: pointer;
  transition: color 0.2s;
}

.star-icon.active {
  color: #fbbf24;
}

.rating-number {
  margin-left: 8px;
  font-size: 0.82rem;
  color: #fbbf24;
  font-weight: 700;
}

.text-area {
  min-height: 70px;
  resize: vertical;
}

.checkbox-group {
  margin: 10px 0;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #fff;
  font-size: 0.85rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}
</style>
