<template>
  <div class="search-page">
    <!-- Notification Toast -->
    <div v-if="toastMessage" class="toast-notification animate-fade-in">
      <svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
      <span>{{ toastMessage }}</span>
    </div>

    <!-- Featured Hero Banner on Explore -->
    <div v-if="featuredShow" class="featured-hero-banner glass-card" :style="getBackdropStyle(featuredShow)">
      <div class="featured-gradient-overlay">
        <div class="featured-content">
          <div class="featured-badges">
            <span class="badge badge-tv">
              <svg class="icon-inline-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
              TRENDING EXPLORE
            </span>
            <span class="hero-rating-badge">
              <svg class="icon-star-gold" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
              {{ featuredShow.vote_average?.toFixed(1) || '9.0' }} / 10.0
            </span>
          </div>
          <h2 class="featured-title">{{ featuredShow.title || featuredShow.name }}</h2>
          <p class="featured-overview">{{ truncateText(featuredShow.overview, 140) }}</p>
          <div class="featured-actions">
            <button @click="openSaveModal(featuredShow)" class="btn-primary">
              <svg class="icon-inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
              <span>Lihat Detail & Daftar Episode</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="hero-section">
      <h1 class="hero-title">Jelajahi & Lacak <span class="gradient-text">Film & TV Shows</span></h1>
      <p class="hero-subtitle">Cari ribuan judul dari TMDB, klik banner untuk melihat sutradara, pemeran, season, dan klik episode untuk langsung ditambahkan ke Watchlist kamu.</p>

      <!-- Search Box -->
      <div class="search-box glass-panel">
        <input 
          v-model="searchQuery" 
          @keyup.enter="handleSearch"
          type="text" 
          placeholder="Cari judul film atau TV show..." 
          class="search-input"
        />
        
        <div class="filter-type">
          <button 
            v-for="t in mediaTypes" 
            :key="t.value"
            @click="selectedType = t.value; handleSearch()"
            :class="['type-btn', { active: selectedType === t.value }]"
          >
            {{ t.label }}
          </button>
        </div>

        <button @click="handleSearch" class="btn-primary">
          <svg class="icon-inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <span>Cari</span>
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Mencari judul dari TMDB...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="results.length === 0 && searched" class="empty-state">
      <p>Tidak ditemukan hasil untuk "{{ searchQuery }}"</p>
    </div>

    <!-- Results Grid -->
    <div v-else-if="results.length > 0" class="results-grid">
      <div 
        v-for="item in results" 
        :key="item.id" 
        class="glass-card media-card clickable"
        @click="openSaveModal(item)"
      >
        <div class="poster-wrapper">
          <img 
            :src="getImageUrl(item.poster_path)" 
            :alt="item.title || item.name"
            class="poster-img"
            @error="onImageError"
          />
          <span :class="['badge', item.media_type === 'tv' ? 'badge-tv' : 'badge-movie', 'type-badge']">
            {{ item.media_type === 'tv' ? 'TV Show' : 'Movie' }}
          </span>
          <span v-if="item.vote_average" class="rating-badge">
            <svg class="icon-star-gold" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
            {{ item.vote_average.toFixed(1) }} / 10.0
          </span>
        </div>

        <div class="card-info">
          <h3 class="media-title">{{ item.title || item.name }}</h3>
          <p class="release-date">{{ formatYear(item.release_date || item.first_air_date) }}</p>
          <p class="overview">{{ truncateText(item.overview, 110) }}</p>

          <button class="btn-primary btn-full">
            <svg class="icon-inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            <span>Lihat Detail & Episode</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Full Detail Spasius & Wide 2-Column Layout -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal-content glass-panel detail-modal-content wide-modal animate-fade-in">
        
        <!-- Fixed Top Right Close Button -->
        <button @click="showModal = false" class="close-btn-fixed" title="Tutup Modal">&times;</button>

        <!-- Movie/Show Hero Backdrop Banner -->
        <div class="hero-backdrop-banner" :style="getBackdropStyle(activeItem)">
          <div class="hero-backdrop-gradient">
            <div class="hero-media-info">
              <div class="banner-badges">
                <span :class="['badge', activeItem?.media_type === 'tv' ? 'badge-tv' : 'badge-movie']">
                  {{ activeItem?.media_type === 'tv' ? 'TV Show' : 'Movie' }}
                </span>
                <span v-if="activeItem?.vote_average" class="hero-rating-badge">
                  <svg class="icon-star-gold" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                  {{ activeItem.vote_average.toFixed(1) }} / 10.0 TMDB Rating
                </span>
              </div>
              <h2 class="hero-media-title">{{ activeItem?.title || activeItem?.name }}</h2>
              <p class="hero-media-subtitle">
                {{ formatYear(activeItem?.release_date || activeItem?.first_air_date) }}
                <span v-if="detailedInfo?.media_status"> • {{ detailedInfo.media_status }}</span>
              </p>
            </div>
          </div>
        </div>

        <!-- Wide 2-Column Layout Body -->
        <div class="detail-body wide-grid">
          
          <!-- Left Column: Poster & Quick Action Bar & Metadata -->
          <div class="detail-left-col">
            <img 
              :src="getImageUrl(activeItem?.poster_path)" 
              :alt="activeItem?.title || activeItem?.name"
              class="detail-poster-img glass-card"
              @error="onImageError"
            />

            <!-- Quick Action Bar -->
            <div class="quick-add-bar glass-card">
              <div class="rating-input-row">
                <label>Beri Rating (Skala 1 - 10):</label>
                <div class="star-rating-selector">
                  <span 
                    v-for="star in 10" 
                    :key="star"
                    @click="form.rating = star"
                    :class="['star-icon', { active: star <= form.rating }]"
                  >★</span>
                  <span class="rating-number">{{ form.rating > 0 ? form.rating + ' / 10.0' : '' }}</span>
                </div>
              </div>

              <div class="quick-buttons-row">
                <button 
                  @click="saveToWatchlist('watching')" 
                  class="btn-primary flex-1"
                  :disabled="isSaving"
                >
                  <svg class="icon-inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  <span>{{ isSaving ? 'Menyimpan...' : 'Tambah Watchlist' }}</span>
                </button>
                <button 
                  @click="form.favorite = !form.favorite; saveToWatchlist('watching')" 
                  :class="['btn-secondary', { active: form.favorite }]"
                >
                  <svg class="icon-inline" viewBox="0 0 24 24" :fill="form.favorite ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Metadata Box -->
            <div v-if="isFetchingDetail" class="loading-state text-sm">
              <div class="spinner"></div>
              <span>Memuat detail sutradara & cast...</span>
            </div>

            <div v-else-if="detailedInfo" class="meta-info-box glass-card">
              <p v-if="detailedInfo.director">
                <strong>Sutradara / Pembuat:</strong> <br>
                <span class="highlight-text">{{ detailedInfo.director }}</span>
              </p>
              <p v-if="detailedInfo.cast">
                <strong>Pemeran Utama:</strong> <br>
                {{ detailedInfo.cast }}
              </p>
              <p v-if="detailedInfo.media_type === 'tv'">
                <strong>Total Episode:</strong> {{ detailedInfo.total_episodes || 'TBA' }} eps ({{ seasonsCount }} Season)
              </p>
            </div>
          </div>

          <!-- Right Column: Overview, Seasons Selector, & Spacious Episode Grid -->
          <div class="detail-right-col">
            <h4 class="section-subtitle">Ringkasan Sinopsis</h4>
            <p class="overview-text">{{ activeItem?.overview }}</p>

            <!-- If TV Show: Season Selector & Episodes List -->
            <div v-if="activeItem?.media_type === 'tv' || !activeItem?.media_type" class="seasons-section">
              <div class="section-header-row">
                <h4 class="section-subtitle">Daftar Season & Episode</h4>
                <span class="watched-counter-badge" v-if="watchlistContext">
                  Progres: {{ watchlistContext.episodes_watched }} eps ditonton
                </span>
              </div>

              <!-- Season Chips Selector -->
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

              <!-- Episodes List -->
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
                    <p class="eps-overview" v-if="eps.overview">{{ truncateText(eps.overview, 120) }}</p>
                  </div>

                  <!-- Watched Toggle Button -->
                  <button 
                    @click="toggleEpisodeWatched(eps.episode_number)"
                    :class="['eps-toggle-btn', { active: isEpisodeWatched(eps.episode_number) }]"
                  >
                    <svg v-if="isEpisodeWatched(eps.episode_number)" class="icon-inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span>{{ isEpisodeWatched(eps.episode_number) ? 'Sudah' : '+ Tonton' }}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
const router = useRouter()

const searchQuery = ref('Breaking Bad')
const selectedType = ref('all')
const isLoading = ref(false)
const searched = ref(false)
const results = ref<any[]>([])
const featuredShow = ref<any>(null)
const toastMessage = ref('')

const mediaTypes = [
  { label: 'Semua', value: 'all' },
  { label: 'Movies', value: 'movie' },
  { label: 'TV Shows', value: 'tv' }
]

const showModal = ref(false)
const activeItem = ref<any>(null)
const detailedInfo = ref<any>(null)
const isFetchingDetail = ref(false)
const isSaving = ref(false)

const selectedSeason = ref(1)
const isLoadingEpisodes = ref(false)
const episodesList = ref<any[]>([])
const watchlistContext = ref<any>(null)

const form = ref({
  status: 'watching',
  rating: 8.0,
  favorite: false,
  notes: '',
  season_watched: 1,
  episodes_watched: 0,
  total_episodes: 0
})

const seasonsCount = computed(() => {
  if (detailedInfo.value?.seasons?.length) {
    return detailedInfo.value.seasons.length
  }
  return detailedInfo.value?.total_seasons || 1
})

const showToast = (msg: string) => {
  toastMessage.value = msg
  setTimeout(() => {
    toastMessage.value = ''
  }, 3000)
}

const handleSearch = async () => {
  if (!searchQuery.value.trim()) return
  isLoading.value = true
  searched.value = true

  try {
    const res: any = await $fetch(useApiUrl('/api/search'), {
      params: {
        q: searchQuery.value,
        type: selectedType.value
      }
    })
    results.value = res.data || []
    if (results.value.length > 0 && !featuredShow.value) {
      featuredShow.value = results.value[0]
    }
  } catch (err) {
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  handleSearch()
})

const getImageUrl = (path: string) => {
  if (!path) return 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=500&q=80'
  return `https://image.tmdb.org/t/p/w500${path}`
}

const getBackdropStyle = (media: any) => {
  const path = media?.backdrop_path || media?.poster_path
  if (!path) return { background: '#1e293b' }
  return { backgroundImage: `url(https://image.tmdb.org/t/p/w780${path})` }
}

const getEpisodeStillUrl = (path: string) => {
  if (!path) return 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&w=500&q=80'
  return `https://image.tmdb.org/t/p/w500${path}`
}

const onImageError = (e: Event) => {
  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=500&q=80'
}

const onEpsImageError = (e: Event) => {
  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&w=500&q=80'
}

const formatYear = (dateStr: string) => {
  if (!dateStr) return ''
  return dateStr.substring(0, 4)
}

const truncateText = (text: string, len: number) => {
  if (!text) return 'Belum ada ringkasan.'
  return text.length > len ? text.substring(0, len) + '...' : text
}

const openSaveModal = async (item: any) => {
  activeItem.value = item
  detailedInfo.value = null
  selectedSeason.value = 1
  episodesList.value = []
  watchlistContext.value = null
  isFetchingDetail.value = true

  form.value = {
    status: item.media_type === 'tv' ? 'watching' : 'completed',
    rating: item.vote_average ? Math.min(10, Math.max(1, Math.round(item.vote_average))) : 8.0,
    favorite: false,
    notes: '',
    season_watched: 1,
    episodes_watched: 0,
    total_episodes: 0
  }
  showModal.value = true

  // Check if item is already in user watchlist
  if (authStore.isAuth) {
    try {
      const checkRes: any = await $fetch(useApiUrl(`/api/user/watchlist/check/${item.id}`), {
        headers: { Authorization: `Bearer ${authStore.token}` },
        params: { type: item.media_type || 'movie' }
      })
      if (checkRes.in_watchlist && checkRes.data) {
        watchlistContext.value = checkRes.data
        form.value.rating = checkRes.data.rating || form.value.rating
        form.value.favorite = checkRes.data.favorite
        form.value.season_watched = checkRes.data.season_watched || 1
        form.value.episodes_watched = checkRes.data.episodes_watched || 0
      }
    } catch (err) {
      console.error(err)
    }
  }

  // Fetch full detail from API
  try {
    const res: any = await $fetch(useApiUrl('/api/detail'), {
      params: {
        id: item.id,
        type: item.media_type || 'movie'
      }
    })
    if (res.data) {
      detailedInfo.value = res.data
      form.value.total_episodes = res.data.total_episodes || 0
    }
  } catch (err) {
    console.error(err)
  } finally {
    isFetchingDetail.value = false
  }

  if (item.media_type === 'tv' || !item.media_type) {
    fetchSeasonEpisodes(1)
  }
}

const fetchSeasonEpisodes = async (seasonNum: number) => {
  if (!activeItem.value) return
  selectedSeason.value = Math.max(1, Math.min(seasonNum, seasonsCount.value))
  isLoadingEpisodes.value = true

  try {
    const res: any = await $fetch(useApiUrl('/api/tv/season'), {
      params: {
        id: activeItem.value.id,
        season: selectedSeason.value
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
  if (!watchlistContext.value) return false
  const watchedEps = watchlistContext.value.episodes_watched || 0
  const currentSeason = watchlistContext.value.season_watched || 1
  
  if (selectedSeason.value < currentSeason) return true
  if (selectedSeason.value === currentSeason) return epsNumber <= watchedEps
  return false
}

const toggleEpisodeWatched = async (epsNumber: number) => {
  if (!authStore.isAuth) {
    showToast('Silakan login terlebih dahulu.')
    router.push('/login')
    return
  }

  if (!watchlistContext.value) {
    await saveToWatchlist('watching', epsNumber)
    return
  }

  const targetEpsCount = isEpisodeWatched(epsNumber) ? epsNumber - 1 : epsNumber

  try {
    const res: any = await $fetch(useApiUrl(`/api/user/watchlist/${watchlistContext.value.id}/set-progress`), {
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
      watchlistContext.value.season_watched = res.data.season_watched
      watchlistContext.value.episodes_watched = res.data.episodes_watched
      watchlistContext.value.status = res.data.status
      showToast(`Progres diperbarui: Season ${res.data.season_watched} Episode ${res.data.episodes_watched}`)
    }
  } catch (err) {
    console.error(err)
  }
}

const saveToWatchlist = async (statusOverride = 'watching', epsOverride?: number) => {
  if (!authStore.isAuth) {
    showToast('Silakan login terlebih dahulu.')
    router.push('/login')
    return
  }
  if (!activeItem.value) return
  isSaving.value = true

  try {
    const payload = {
      tmdb_id: activeItem.value.id,
      media_type: activeItem.value.media_type || 'movie',
      title: activeItem.value.title || activeItem.value.name,
      overview: activeItem.value.overview || '',
      poster_path: activeItem.value.poster_path || '',
      backdrop_path: activeItem.value.backdrop_path || '',
      release_date: activeItem.value.release_date || activeItem.value.first_air_date || '',
      vote_average: activeItem.value.vote_average || 0,
      director: detailedInfo.value?.director || '',
      cast: detailedInfo.value?.cast || '',
      total_seasons: detailedInfo.value?.total_seasons || 0,
      next_air_date: detailedInfo.value?.next_air_date || '',
      next_episode_name: detailedInfo.value?.next_episode_name || '',
      media_status: detailedInfo.value?.media_status || '',
      status: statusOverride || form.value.status,
      rating: Math.min(10, Math.max(0, form.value.rating)),
      favorite: form.value.favorite,
      notes: form.value.notes,
      season_watched: selectedSeason.value || form.value.season_watched,
      episodes_watched: epsOverride !== undefined ? epsOverride : form.value.episodes_watched,
      total_episodes: form.value.total_episodes || detailedInfo.value?.total_episodes || 0
    }

    const res: any = await $fetch(useApiUrl('/api/user/watchlist'), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authStore.token}`
      },
      body: payload
    })

    if (res.data) {
      watchlistContext.value = res.data
      showToast(`Tersimpan di Watchlist: ${payload.title}`)
    }
  } catch (err: any) {
    console.error(err)
    alert(err?.data?.error || 'Gagal menyimpan ke watchlist.')
  } finally {
    isSaving.value = false
  }
}
</script>

<style scoped>
.toast-notification {
  position: fixed;
  top: 80px;
  right: 24px;
  z-index: 10000;
  background: #10b981;
  color: #ffffff;
  padding: 12px 20px;
  border-radius: 14px;
  font-weight: 700;
  font-size: 0.88rem;
  box-shadow: 0 10px 25px rgba(16, 185, 129, 0.4);
  display: flex;
  align-items: center;
  gap: 10px;
}

.toast-icon {
  width: 20px;
  height: 20px;
}

.icon-inline {
  width: 16px;
  height: 16px;
}

.icon-inline-sm {
  width: 14px;
  height: 14px;
}

.icon-star-gold {
  width: 14px;
  height: 14px;
  color: #fbbf24;
}

.featured-hero-banner {
  position: relative;
  height: 260px;
  border-radius: 24px;
  overflow: hidden;
  background-size: cover;
  background-position: center;
  margin-bottom: 32px;
}

.featured-gradient-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.2) 0%, rgba(15, 23, 42, 0.95) 85%, #0f172a 100%);
  display: flex;
  align-items: flex-end;
  padding: 24px;
}

.featured-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 600px;
}

.featured-badges {
  display: flex;
  align-items: center;
  gap: 8px;
}

.featured-title {
  font-size: 1.8rem;
  font-weight: 800;
  color: #fff;
  line-height: 1.2;
}

.featured-overview {
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.4;
}

.featured-actions {
  margin-top: 6px;
}

.hero-section {
  text-align: center;
  margin-bottom: 40px;
}

.hero-title {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 10px;
}

.hero-subtitle {
  color: var(--text-secondary);
  font-size: 1rem;
  max-width: 580px;
  margin: 0 auto 24px;
}

.search-box {
  max-width: 720px;
  margin: 0 auto;
  padding: 10px 14px;
  border-radius: 18px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

.search-input {
  flex: 1;
  min-width: 240px;
  background: transparent;
  border: none;
  color: #fff;
  font-size: 0.95rem;
  padding: 8px 14px;
  outline: none;
}

.filter-type {
  display: flex;
  gap: 4px;
  background: rgba(255, 255, 255, 0.05);
  padding: 4px;
  border-radius: 10px;
}

.type-btn {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  padding: 6px 12px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
}

.type-btn.active {
  background: var(--accent-purple);
  color: #fff;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  gap: 22px;
}

.media-card {
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.poster-wrapper {
  position: relative;
  width: 100%;
  padding-top: 148%;
  overflow: hidden;
  background: #151d2a;
}

.poster-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.media-card:hover .poster-img {
  transform: scale(1.04);
}

.type-badge {
  position: absolute;
  top: 10px;
  left: 10px;
}

.rating-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(8px);
  color: #fbbf24;
  font-weight: 700;
  font-size: 0.75rem;
  padding: 4px 8px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.card-info {
  padding: 14px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.media-title {
  font-size: 1.05rem;
  font-weight: 700;
  margin-bottom: 2px;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.release-date {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-bottom: 6px;
}

.overview {
  font-size: 0.8rem;
  color: var(--text-secondary);
  line-height: 1.4;
  margin-bottom: 14px;
  flex: 1;
}

.btn-full {
  width: 100%;
  justify-content: center;
}

/* WIDE & SPACIOUS DETAIL MODAL (Wide 2-Column Layout) */
.detail-modal-content.wide-modal {
  position: relative;
  width: 92vw;
  max-width: 1040px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 0;
  border-radius: 28px;
  overflow: hidden;
}

.close-btn-fixed {
  position: absolute;
  top: 18px;
  right: 20px;
  z-index: 40;
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-size: 1.6rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.close-btn-fixed:hover {
  background: rgba(239, 68, 68, 0.9);
  transform: scale(1.08);
}

.hero-backdrop-banner {
  height: 250px;
  background-size: cover;
  background-position: center;
  position: relative;
}

.hero-backdrop-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.1) 0%, rgba(15, 23, 42, 0.95) 85%, #0f172a 100%);
  display: flex;
  align-items: flex-end;
  padding: 24px;
}

.banner-badges {
  display: flex;
  align-items: center;
  gap: 10px;
}

.hero-media-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.hero-rating-badge {
  color: #fbbf24;
  font-weight: 800;
  font-size: 0.9rem;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.hero-media-title {
  font-size: 2.2rem;
  font-weight: 900;
  color: #fff;
  line-height: 1.15;
}

.hero-media-subtitle {
  font-size: 0.9rem;
  color: var(--text-muted);
}

.detail-body.wide-grid {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 24px;
  padding: 24px;
}

@media (max-width: 768px) {
  .detail-body.wide-grid {
    grid-template-columns: 1fr;
  }
}

.detail-left-col {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-poster-img {
  width: 100%;
  border-radius: 16px;
  object-fit: cover;
  aspect-ratio: 2 / 3;
}

.detail-right-col {
  display: flex;
  flex-direction: column;
}

.meta-info-box {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--glass-border);
  padding: 14px;
  border-radius: 14px;
  font-size: 0.85rem;
  color: var(--text-secondary);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.highlight-text {
  color: #fbbf24;
  font-weight: 600;
}

.overview-text {
  font-size: 0.92rem;
  color: #cbd5e1;
  line-height: 1.65;
  margin-bottom: 20px;
}

.quick-add-bar {
  padding: 16px;
  border-radius: 16px;
}

.rating-input-row {
  margin-bottom: 12px;
}

.rating-input-row label {
  font-size: 0.82rem;
  color: var(--text-secondary);
  font-weight: 700;
  display: block;
  margin-bottom: 6px;
}

.star-rating-selector {
  display: flex;
  align-items: center;
  gap: 4px;
}

.star-icon {
  font-size: 1.2rem;
  color: #475569;
  cursor: pointer;
  transition: color 0.2s;
}

.star-icon.active {
  color: #fbbf24;
}

.rating-number {
  margin-left: 8px;
  font-size: 0.85rem;
  color: #fbbf24;
  font-weight: 700;
}

.quick-buttons-row {
  display: flex;
  gap: 10px;
}

.seasons-section {
  margin-top: 12px;
}

.section-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-subtitle {
  font-size: 1.1rem;
  font-weight: 800;
  color: #fff;
  margin-bottom: 8px;
}

.watched-counter-badge {
  font-size: 0.8rem;
  color: #fbbf24;
  font-weight: 800;
  background: rgba(251, 191, 36, 0.12);
  padding: 4px 12px;
  border-radius: 8px;
}

.season-chips {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 8px;
  margin-bottom: 16px;
}

.season-chip {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--glass-border);
  color: var(--text-secondary);
  padding: 8px 16px;
  border-radius: 10px;
  font-size: 0.85rem;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}

.season-chip.active {
  background: var(--accent-gold);
  color: #0f172a;
  font-weight: 800;
}

.episodes-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 380px;
  overflow-y: auto;
}

.episode-item {
  display: flex;
  gap: 16px;
  padding: 14px;
  align-items: center;
  transition: all 0.2s;
  border-radius: 16px;
}

.episode-item.watched {
  border-color: rgba(74, 222, 128, 0.35);
  background: rgba(74, 222, 128, 0.06);
}

.eps-banner-wrapper {
  position: relative;
  width: 130px;
  height: 74px;
  border-radius: 10px;
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
  background: rgba(15, 23, 42, 0.88);
  backdrop-filter: blur(4px);
  color: #fff;
  font-size: 0.72rem;
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
  margin-bottom: 4px;
}

.eps-name {
  font-size: 0.95rem;
  font-weight: 800;
  color: #fff;
}

.eps-date {
  font-size: 0.78rem;
  color: var(--text-muted);
  white-space: nowrap;
}

.eps-overview {
  font-size: 0.8rem;
  color: var(--text-secondary);
  line-height: 1.4;
}

.eps-toggle-btn {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid var(--glass-border);
  color: var(--text-secondary);
  padding: 8px 16px;
  border-radius: 10px;
  font-weight: 800;
  font-size: 0.82rem;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  gap: 6px;
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

/* Modal Overlay Fixed Overlay Styling */
.modal-overlay {
  position: fixed !important;
  inset: 0 !important;
  top: 0 !important;
  left: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  background: rgba(0, 0, 0, 0.85) !important;
  backdrop-filter: blur(12px) !important;
  -webkit-backdrop-filter: blur(12px) !important;
  z-index: 9999 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 20px !important;
}
</style>
