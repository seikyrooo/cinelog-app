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
    <section v-if="featuredShow" class="featured-hero-banner glass-card" :style="getBackdropStyle(featuredShow)" aria-label="Pilihan trending CineLog">
      <div class="featured-gradient-overlay">
        <div class="featured-content">
          <div class="featured-badges">
            <span class="badge badge-tv">Pilihan Utama</span>
            <span class="hero-rating-badge">
              <svg class="icon-star-gold" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
              {{ featuredShow.vote_average?.toFixed(1) || '9.0' }} / 10.0
            </span>
          </div>
          <h2 class="featured-title">{{ featuredShow.title || featuredShow.name }}</h2>
          <p class="featured-overview">{{ truncateText(featuredShow.overview, 160) }}</p>
          <div class="featured-actions">
            <button @click="openSaveModal(featuredShow)" class="btn-primary">
              <svg class="icon-inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
              <span>Lihat Detail & Watchlist</span>
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Search Section -->
    <section class="hero-section" aria-labelledby="explore-title">
      <div class="hero-copy">
        <h1 id="explore-title" class="hero-title">Temukan Film & Serial TV Favorit</h1>
        <p class="hero-subtitle">Cari judul, cek daftar pemain, pantau season, dan catat setiap episode yang sudah Anda tonton.</p>
      </div>

      <!-- Search Box -->
      <div class="search-box glass-card" role="search" aria-label="Cari film dan TV show">
        <svg class="search-leading-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input 
          v-model="searchQuery" 
          @keyup.enter="handleSearch"
          type="text" 
          placeholder="Ketik judul... (Contoh: Stranger Things, Oppenheimer, Naruto)" 
          class="search-input"
          aria-label="Judul film atau TV show"
        />
        
        <div class="filter-type">
          <button 
            v-for="t in mediaTypes" 
            :key="t.value"
            @click="selectedType = t.value; handleSearch()"
            :class="['type-btn', { active: selectedType === t.value }]"
            :aria-pressed="selectedType === t.value"
          >
            {{ t.label }}
          </button>
        </div>

        <button @click="handleSearch" class="btn-primary search-action-btn">
          <svg class="icon-inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <span>Cari</span>
        </button>
      </div>
    </section>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Mencari data dari TMDB...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="results.length === 0 && searched" class="empty-state glass-card" role="status">
      <h2>Judul Tidak Ditemukan</h2>
      <p>Tidak ada hasil untuk "{{ searchQuery }}". Silakan periksa ejaan atau ubah filter tipe media.</p>
    </div>

    <!-- Results Grid -->
    <section v-else-if="results.length > 0" class="results-section" aria-labelledby="results-title">
      <div class="results-header">
        <div>
          <h2 id="results-title">{{ results.length }} Judul Ditemukan</h2>
          <p class="results-sub">Klik kartu untuk membuka detail, melihat season, dan menyimpan ke watchlist.</p>
        </div>
      </div>
      <div class="results-grid">
        <div 
          v-for="item in results" 
          :key="item.id" 
          class="glass-card media-card clickable"
          @click="openSaveModal(item)"
          role="button"
          tabindex="0"
          @keyup.enter="openSaveModal(item)"
        >
          <div class="poster-wrapper">
            <img 
              :src="getImageUrl(item.poster_path)" 
              :alt="item.title || item.name"
              class="poster-img"
              @error="onImageError"
            />
            <span :class="['badge', item.media_type === 'tv' ? 'badge-tv' : 'badge-movie', 'type-badge']">
              {{ item.media_type === 'tv' ? 'TV' : 'Movie' }}
            </span>
            <span v-if="item.vote_average" class="rating-badge">
              <svg class="icon-star-gold" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
              {{ item.vote_average.toFixed(1) }}
            </span>
          </div>

          <div class="card-info">
            <h3 class="media-title">{{ item.title || item.name }}</h3>
            <p class="release-date">{{ formatYear(item.release_date || item.first_air_date) }}</p>
            <p class="overview">{{ truncateText(item.overview, 95) }}</p>

            <button class="btn-secondary btn-full btn-card-action">
              <span>Detail & Watchlist</span>
            </button>
          </div>
        </div>
      </div>
    </section>

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
              class="detail-poster-img"
              @error="onImageError"
            />

            <!-- Quick Action Bar -->
            <div class="quick-add-bar glass-card">
              <div class="rating-input-row">
                <label>Rating Anda (1 - 10):</label>
                <div class="star-rating-selector">
                  <span 
                    v-for="star in 10" 
                    :key="star"
                    @click="form.rating = star"
                    :class="['star-icon', { active: star <= form.rating }]"
                  >★</span>
                  <span class="rating-number">{{ form.rating > 0 ? form.rating + ' / 10' : '' }}</span>
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
                  <svg class="icon-inline" viewBox="0 0 24 24" :fill="form.favorite ? 'var(--accent-red)' : 'none'" :stroke="form.favorite ? 'var(--accent-red)' : 'currentColor'" stroke-width="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                  <span>{{ form.favorite ? 'Favorit' : '+ Favorit' }}</span>
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
            <h4 class="section-subtitle">Sinopsis Cerita</h4>
            <p class="overview-text">{{ activeItem?.overview || 'Belum ada ringkasan sinopsis untuk judul ini.' }}</p>

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

const searchQuery = ref('')
const selectedType = ref('all')
const results = ref<any[]>([])
const isLoading = ref(false)
const searched = ref(false)
const toastMessage = ref('')

const mediaTypes = [
  { label: 'Semua', value: 'all' },
  { label: 'Movie', value: 'movie' },
  { label: 'TV Series', value: 'tv' }
]

const featuredShow = ref<any>(null)
const showModal = ref(false)
const activeItem = ref<any>(null)
const isSaving = ref(false)
const isFetchingDetail = ref(false)
const detailedInfo = ref<any>(null)
const selectedSeason = ref(1)
const episodesList = ref<any[]>([])
const isLoadingEpisodes = ref(false)
const watchlistContext = ref<any>(null)

const form = ref({
  status: 'watching',
  rating: 0,
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

onMounted(async () => {
  try {
    const res: any = await $fetch(useApiUrl('/api/search'), {
      params: { q: 'Breaking Bad', type: 'tv' }
    })
    if (res.data && res.data.length > 0) {
      featuredShow.value = res.data[0]
    }
  } catch (err) {
    console.error(err)
  }
})

const showToast = (msg: string) => {
  toastMessage.value = msg
  setTimeout(() => {
    toastMessage.value = ''
  }, 3500)
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
  } catch (err) {
    console.error(err)
    results.value = []
  } finally {
    isLoading.value = false
  }
}

const getImageUrl = (path: string) => {
  if (!path) return 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=500&q=80'
  return `https://image.tmdb.org/t/p/w500${path}`
}

const getBackdropStyle = (media: any) => {
  const path = media?.backdrop_path || media?.poster_path
  if (!path) return { background: '#121216' }
  return { backgroundImage: `url(https://image.tmdb.org/t/p/w1280${path})` }
}

const getEpisodeStillUrl = (path: string) => {
  if (!path) return 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&w=500&q=80'
  return `https://image.tmdb.org/t/p/w500${path}`
}

const onImageError = (e: Event) => {
  ;(e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=500&q=80'
}

const onEpsImageError = (e: Event) => {
  ;(e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&w=500&q=80'
}

const truncateText = (text: string, len: number) => {
  if (!text) return ''
  return text.length > len ? text.substring(0, len) + '...' : text
}

const formatYear = (dateStr: string) => {
  if (!dateStr) return ''
  return dateStr.substring(0, 4)
}

const isEpisodeWatched = (epsNumber: number) => {
  if (!watchlistContext.value) return false
  const currSeason = watchlistContext.value.season_watched || 1
  const watchedCount = watchlistContext.value.episodes_watched || 0
  if (selectedSeason.value < currSeason) return true
  if (selectedSeason.value === currSeason) return epsNumber <= watchedCount
  return false
}

const toggleEpisodeWatched = async (epsNumber: number) => {
  if (!authStore.isAuth) {
    showToast('Silakan login terlebih dahulu.')
    router.push('/login')
    return
  }

  const targetCount = isEpisodeWatched(epsNumber) ? epsNumber - 1 : epsNumber
  form.value.season_watched = selectedSeason.value
  form.value.episodes_watched = targetCount

  if (watchlistContext.value?.id) {
    try {
      const res: any = await $fetch(useApiUrl(`/api/user/watchlist/${watchlistContext.value.id}/set-progress`), {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${authStore.token}`
        },
        body: {
          season_watched: selectedSeason.value,
          episodes_watched: targetCount
        }
      })
      watchlistContext.value = res.data
      showToast(`Progres diperbarui: S${selectedSeason.value} Eps ${targetCount}`)
    } catch (err) {
      console.error(err)
    }
  } else {
    await saveToWatchlist('watching', targetCount)
  }
}

const openSaveModal = async (item: any) => {
  activeItem.value = item
  detailedInfo.value = null
  episodesList.value = []
  selectedSeason.value = 1
  watchlistContext.value = null

  form.value = {
    status: 'watching',
    rating: 0,
    favorite: false,
    notes: '',
    season_watched: 1,
    episodes_watched: 0,
    total_episodes: 0
  }

  showModal.value = true
  isFetchingDetail.value = true

  try {
    const detailRes: any = await $fetch(useApiUrl('/api/detail'), {
      params: {
        id: item.id,
        type: item.media_type || 'movie'
      }
    })
    detailedInfo.value = detailRes.data
    form.value.total_episodes = detailedInfo.value?.total_episodes || 0

    if (authStore.isAuth) {
      try {
        const checkRes: any = await $fetch(useApiUrl(`/api/user/watchlist/check/${item.id}`), {
          params: { type: item.media_type || 'movie' },
          headers: { Authorization: `Bearer ${authStore.token}` }
        })
        if (checkRes.in_watchlist && checkRes.data) {
          watchlistContext.value = checkRes.data
          form.value.status = checkRes.data.status
          form.value.rating = checkRes.data.rating || 0
          form.value.favorite = checkRes.data.favorite || false
          form.value.notes = checkRes.data.notes || ''
          form.value.season_watched = checkRes.data.season_watched || 1
          form.value.episodes_watched = checkRes.data.episodes_watched || 0
          selectedSeason.value = checkRes.data.season_watched || 1
        }
      } catch (e) {
        console.error(e)
      }
    }

    if (item.media_type === 'tv' || !item.media_type) {
      await fetchSeasonEpisodes(selectedSeason.value)
    }
  } catch (err) {
    console.error(err)
  } finally {
    isFetchingDetail.value = false
  }
}

const fetchSeasonEpisodes = async (seasonNum: number) => {
  selectedSeason.value = seasonNum
  isLoadingEpisodes.value = true
  try {
    const res: any = await $fetch(useApiUrl('/api/tv/season'), {
      params: {
        id: activeItem.value.id,
        season: seasonNum
      }
    })
    episodesList.value = res.data || []
  } catch (err) {
    console.error(err)
    episodesList.value = []
  } finally {
    isLoadingEpisodes.value = false
  }
}

const saveToWatchlist = async (statusOverride?: string, epsOverride?: number) => {
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
      showToast(form.value.favorite ? `Ditambahkan ke Favorit! ★` : `Tersimpan di Watchlist: ${payload.title}`)
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
  background: var(--accent-red);
  color: #ffffff;
  padding: 12px 20px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.88rem;
  box-shadow: 0 10px 25px rgba(229, 9, 20, 0.4);
  display: flex;
  align-items: center;
  gap: 10px;
}

.toast-icon {
  width: 18px;
  height: 18px;
}

.icon-inline {
  width: 16px;
  height: 16px;
}

.icon-star-gold {
  width: 13px;
  height: 13px;
  color: var(--accent-star);
}

.featured-hero-banner {
  position: relative;
  min-height: 320px;
  border-radius: 16px;
  overflow: hidden;
  background-size: cover;
  background-position: center;
  margin-bottom: 32px;
  border: 1px solid var(--border-subtle);
}

.featured-gradient-overlay {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(90deg, rgba(10, 10, 12, 0.96) 0%, rgba(10, 10, 12, 0.75) 50%, rgba(10, 10, 12, 0.2) 100%),
    linear-gradient(180deg, rgba(18, 18, 22, 0.1) 0%, rgba(18, 18, 22, 0.95) 100%);
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding: 32px;
}

.featured-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 620px;
}

.featured-badges {
  display: flex;
  align-items: center;
  gap: 8px;
}

.featured-title {
  font-size: clamp(1.8rem, 3.5vw, 2.8rem);
  font-weight: 900;
  color: #ffffff;
  line-height: 1.05;
}

.featured-overview {
  color: var(--text-secondary);
  font-size: 0.92rem;
  line-height: 1.55;
  margin-top: 4px;
}

.hero-section {
  margin-bottom: 32px;
  display: grid;
  gap: 18px;
}

.hero-title {
  font-size: clamp(1.8rem, 3.5vw, 2.6rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  margin-bottom: 6px;
  color: #ffffff;
}

.hero-subtitle {
  color: var(--text-secondary);
  font-size: 0.95rem;
  line-height: 1.6;
  max-width: 64ch;
}

.search-box {
  width: 100%;
  padding: 8px 12px;
  border-radius: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  transition: all 0.2s ease;
}

.search-box:focus-within {
  border-color: var(--border-red);
  box-shadow: 0 0 0 3px var(--accent-red-subtle);
}

.search-leading-icon {
  width: 18px;
  height: 18px;
  color: var(--text-muted);
  margin-left: 4px;
}

.search-input {
  flex: 1;
  min-width: 220px;
  background: transparent;
  border: none;
  color: #ffffff;
  font-size: 0.92rem;
  padding: 8px 10px;
  outline: none;
}

.filter-type {
  display: flex;
  gap: 4px;
  background: rgba(255, 255, 255, 0.04);
  padding: 3px;
  border-radius: 8px;
}

.type-btn {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  padding: 6px 12px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.type-btn.active {
  background: var(--accent-red);
  color: #ffffff;
}

.results-section {
  display: grid;
  gap: 18px;
}

.results-header h2 {
  font-size: 1.4rem;
  font-weight: 800;
  color: #ffffff;
}

.results-sub {
  color: var(--text-muted);
  font-size: 0.86rem;
  margin-top: 2px;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(175px, 1fr));
  gap: 18px;
}

.media-card {
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border-radius: 10px;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.media-card:hover {
  border-color: var(--border-red);
  transform: translateY(-4px);
  box-shadow: 0 12px 25px -5px rgba(0, 0, 0, 0.8);
}

.poster-wrapper {
  position: relative;
  width: 100%;
  padding-top: 148%;
  overflow: hidden;
  background: #15151a;
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
  transform: scale(1.05);
}

.type-badge {
  position: absolute;
  top: 8px;
  left: 8px;
}

.rating-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(10, 10, 12, 0.88);
  backdrop-filter: blur(6px);
  color: #ffffff;
  font-weight: 700;
  font-size: 0.72rem;
  padding: 3px 6px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  border: 1px solid var(--border-subtle);
}

.card-info {
  padding: 12px;
  display: flex;
  flex-direction: column;
  flex: 1;
  background: var(--bg-surface);
}

.media-title {
  font-size: 0.95rem;
  font-weight: 700;
  margin-bottom: 2px;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.release-date {
  font-size: 0.78rem;
  color: var(--text-muted);
  margin-bottom: 6px;
}

.overview {
  font-size: 0.78rem;
  color: var(--text-secondary);
  line-height: 1.4;
  margin-bottom: 12px;
  flex: 1;
}

.btn-card-action {
  font-size: 0.8rem;
  padding: 8px 12px;
  border-radius: 6px;
}

.empty-state {
  max-width: 500px;
  margin: 32px auto;
  padding: 32px;
  text-align: center;
  background: var(--bg-surface);
}

.empty-state h2 {
  font-size: 1.3rem;
  margin-bottom: 6px;
  color: #ffffff;
}

.empty-state p {
  color: var(--text-secondary);
  font-size: 0.88rem;
}

/* MODAL DETAIL STYLING */
.detail-modal-content.wide-modal {
  position: relative;
  width: 92vw;
  max-width: 1000px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 0;
  border-radius: 16px;
  overflow: hidden;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.95);
}

.close-btn-fixed {
  position: absolute;
  top: 16px;
  right: 18px;
  z-index: 40;
  background: rgba(10, 10, 12, 0.85);
  backdrop-filter: blur(8px);
  border: 1px solid var(--border-subtle);
  color: #ffffff;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  font-size: 1.4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.close-btn-fixed:hover {
  background: var(--accent-red);
  border-color: var(--accent-red);
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
  background: linear-gradient(180deg, rgba(10, 10, 12, 0.2) 0%, rgba(10, 10, 12, 0.95) 90%, var(--bg-surface) 100%);
  display: flex;
  align-items: flex-end;
  padding: 24px;
}

.banner-badges {
  display: flex;
  align-items: center;
  gap: 8px;
}

.hero-media-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.hero-rating-badge {
  color: #ffffff;
  font-weight: 700;
  font-size: 0.84rem;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.hero-media-title {
  font-size: 1.8rem;
  font-weight: 900;
  color: #ffffff;
  line-height: 1.15;
}

.hero-media-subtitle {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.detail-body.wide-grid {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 24px;
  padding: 24px;
}

@media (max-width: 768px) {
  .featured-gradient-overlay {
    padding: 20px;
  }
  .detail-body.wide-grid {
    grid-template-columns: 1fr;
  }
}

.detail-left-col {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.detail-poster-img {
  width: 100%;
  border-radius: 10px;
  object-fit: cover;
  aspect-ratio: 2 / 3;
  border: 1px solid var(--border-subtle);
}

.detail-right-col {
  display: flex;
  flex-direction: column;
}

.meta-info-box {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--border-subtle);
  padding: 12px;
  border-radius: 8px;
  font-size: 0.82rem;
  color: var(--text-secondary);
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.highlight-text {
  color: #ffffff;
  font-weight: 600;
}

.overview-text {
  font-size: 0.88rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 20px;
}

.quick-add-bar {
  padding: 14px;
  border-radius: 10px;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
}

.rating-input-row {
  margin-bottom: 12px;
}

.rating-input-row label {
  font-size: 0.8rem;
  color: var(--text-secondary);
  font-weight: 600;
  display: block;
  margin-bottom: 4px;
}

.star-rating-selector {
  display: flex;
  align-items: center;
  gap: 3px;
}

.star-icon {
  font-size: 1.15rem;
  color: #3f3f46;
  cursor: pointer;
  transition: color 0.15s;
}

.star-icon.active {
  color: var(--accent-star);
}

.rating-number {
  margin-left: 6px;
  font-size: 0.8rem;
  color: var(--accent-star);
  font-weight: 700;
}

.quick-buttons-row {
  display: flex;
  gap: 8px;
}

.seasons-section {
  margin-top: 12px;
}

.section-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.section-subtitle {
  font-size: 1rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 6px;
}

.watched-counter-badge {
  font-size: 0.78rem;
  color: var(--accent-red);
  font-weight: 700;
  background: var(--accent-red-subtle);
  padding: 3px 10px;
  border-radius: 6px;
  border: 1px solid var(--border-red);
}

.season-chips {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding-bottom: 6px;
  margin-bottom: 14px;
}

.season-chip {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--border-subtle);
  color: var(--text-secondary);
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s;
}

.season-chip.active {
  background: var(--accent-red);
  color: #ffffff;
  border-color: var(--accent-red);
}

.episodes-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 380px;
  overflow-y: auto;
}

.episode-item {
  display: flex;
  gap: 14px;
  padding: 12px;
  align-items: center;
  transition: all 0.2s;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--border-subtle);
}

.episode-item.watched {
  border-color: rgba(34, 197, 94, 0.35);
  background: rgba(34, 197, 94, 0.05);
}

.eps-banner-wrapper {
  position: relative;
  width: 110px;
  height: 62px;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
  background: #18181e;
}

.eps-still-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.eps-num-badge {
  position: absolute;
  bottom: 3px;
  left: 3px;
  background: rgba(10, 10, 12, 0.9);
  color: #ffffff;
  font-size: 0.68rem;
  font-weight: 700;
  padding: 1px 4px;
  border-radius: 3px;
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
  font-size: 0.88rem;
  font-weight: 700;
  color: #ffffff;
}

.eps-date {
  font-size: 0.74rem;
  color: var(--text-muted);
  white-space: nowrap;
}

.eps-overview {
  font-size: 0.76rem;
  color: var(--text-secondary);
  line-height: 1.35;
}

.eps-toggle-btn {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--border-subtle);
  color: var(--text-secondary);
  padding: 6px 12px;
  border-radius: 6px;
  font-weight: 700;
  font-size: 0.78rem;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.eps-toggle-btn.active {
  background: var(--accent-success);
  color: #ffffff;
  border-color: var(--accent-success);
}

.loading-state {
  text-align: center;
  padding: 40px;
  color: var(--text-secondary);
}

.text-sm {
  font-size: 0.78rem;
  padding: 6px 12px;
}

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
