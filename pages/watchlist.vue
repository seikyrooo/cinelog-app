<template>
  <div class="tvtime-container">
    <!-- Toast Notification -->
    <div v-if="toastMessage" class="toast-notification animate-fade-in">
      <svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
      <span>{{ toastMessage }}</span>
    </div>

    <!-- Main Top Mode: Shows vs Movies -->
    <div class="top-nav-bar">
      <div class="mode-switcher glass-panel">
        <button 
          @click="mediaTypeTab = 'tv'; fetchWatchlist()"
          :class="['mode-tab', { active: mediaTypeTab === 'tv' }]"
        >
          <svg class="icon-inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect>
            <polyline points="17 2 12 7 7 2"></polyline>
          </svg>
          <span>TV Shows</span>
        </button>
        <button 
          @click="mediaTypeTab = 'movie'; fetchWatchlist()"
          :class="['mode-tab', { active: mediaTypeTab === 'movie' }]"
        >
          <svg class="icon-inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect>
            <line x1="7" y1="2" x2="7" y2="22"></line>
            <line x1="17" y1="2" x2="17" y2="22"></line>
            <line x1="2" y1="12" x2="22" y2="12"></line>
          </svg>
          <span>Movies</span>
        </button>
      </div>
    </div>

    <!-- TV Shows TV Time Experience -->
    <div v-if="mediaTypeTab === 'tv'" class="tv-experience">
      <!-- Sub-tabs: WATCH LIST vs UPCOMING -->
      <div class="sub-tab-bar">
        <button 
          @click="activeTvSubTab = 'watchlist'"
          :class="['sub-tab-btn', { active: activeTvSubTab === 'watchlist' }]"
        >
          WATCH LIST
        </button>
        <button 
          @click="activeTvSubTab = 'upcoming'"
          :class="['sub-tab-btn', { active: activeTvSubTab === 'upcoming' }]"
        >
          UPCOMING
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>Memuat TV Time Watchlist...</p>
      </div>

      <!-- WATCH LIST TAB -->
      <div v-else-if="activeTvSubTab === 'watchlist'" class="tv-sections">
        
        <!-- SECTION 1: WATCH NEXT (Active Series with remaining episodes) -->
        <div v-if="watchNextList.length > 0" class="section-group">
          <div class="section-pill-header">
            <span class="pill-badge watch-next-badge">WATCH NEXT</span>
          </div>

          <div class="shows-stack">
            <div 
              v-for="item in watchNextList" 
              :key="item.id"
              class="tvtime-card glass-card"
            >
              <img 
                :src="getPosterUrl(item.movie)" 
                :alt="item.movie.title"
                class="tvtime-poster clickable"
                @click="openDetailModal(item)"
                @error="onImageError"
              />

              <div class="tvtime-card-body">
                <div class="show-title-tag clickable" @click="openDetailModal(item)">
                  <span>{{ item.movie.title.toUpperCase() }}</span> &gt;
                </div>

                <div class="eps-headline">
                  <span class="season-eps-code">
                    S{{ padZero(item.season_watched || 1) }} | E{{ padZero((item.episodes_watched || 0) + 1) }}
                  </span>
                  <span class="remaining-count-pill" v-if="getRemainingEps(item) > 0">
                    +{{ getRemainingEps(item) }} eps lagi
                  </span>
                </div>

                <p class="eps-title-text clickable" @click="openDetailModal(item)">
                  <span class="eps-label">Next Episode:</span> <strong>{{ getNextEpsName(item) }}</strong>
                </p>

                <div class="card-badges-row">
                  <span v-if="(item.episodes_watched || 0) + 1 === 1" class="badge-premiere">PREMIERE</span>
                  <span v-if="item.favorite" class="badge-fav">★ FAVORIT</span>
                  <span class="badge-total-info" v-if="getTotalEps(item) > 0">
                    Tersisa {{ getRemainingEps(item) }} dari {{ getTotalEps(item) }} eps
                  </span>
                </div>
              </div>

              <!-- Big Circle Checkmark Button (Increment Episode) -->
              <button 
                @click="incrementEpisode(item)" 
                class="circle-check-btn"
                title="Klik untuk tandai episode ini selesai ditonton"
              >
                <svg class="check-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- SECTION 2: HAVENT WATCHED FOR A WHILE (Inactive / On Hold) -->
        <div v-if="haventWatchedList.length > 0" class="section-group">
          <div class="section-pill-header">
            <span class="pill-badge idle-badge">HAVENT WATCHED FOR A WHILE</span>
          </div>

          <div class="shows-stack">
            <div 
              v-for="item in haventWatchedList" 
              :key="item.id"
              class="tvtime-card glass-card idle-card"
            >
              <img 
                :src="getPosterUrl(item.movie)" 
                :alt="item.movie.title"
                class="tvtime-poster clickable"
                @click="openDetailModal(item)"
                @error="onImageError"
              />

              <div class="tvtime-card-body">
                <div class="show-title-tag clickable" @click="openDetailModal(item)">
                  <span>{{ item.movie.title.toUpperCase() }}</span> &gt;
                </div>

                <div class="eps-headline">
                  <span class="season-eps-code">
                    S{{ padZero(item.season_watched || 1) }} | E{{ padZero((item.episodes_watched || 0) + 1) }}
                  </span>
                  <span class="remaining-count-pill" v-if="getRemainingEps(item) > 0">
                    +{{ getRemainingEps(item) }} eps lagi
                  </span>
                </div>

                <p class="eps-title-text">Belum dilanjutkan lagi</p>
              </div>

              <button @click="incrementEpisode(item)" class="circle-check-btn">
                <svg class="check-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- SECTION 3: WATCHED HISTORY (Completed Shows & History) -->
        <div v-if="watchedHistoryList.length > 0" class="section-group">
          <div class="section-pill-header">
            <span class="pill-badge history-badge">WATCHED HISTORY</span>
          </div>

          <div class="shows-stack">
            <div 
              v-for="item in watchedHistoryList" 
              :key="item.id"
              class="tvtime-card glass-card completed-card"
            >
              <img 
                :src="getPosterUrl(item.movie)" 
                :alt="item.movie.title"
                class="tvtime-poster clickable"
                @click="openDetailModal(item)"
                @error="onImageError"
              />

              <div class="tvtime-card-body">
                <div class="show-title-tag clickable" @click="openDetailModal(item)">
                  <span>{{ item.movie.title.toUpperCase() }}</span> &gt;
                </div>

                <div class="eps-headline">
                  <span class="season-eps-code">
                    S{{ padZero(item.season_watched || 1) }} | E{{ padZero(item.episodes_watched) }}
                  </span>
                  <span class="badge-completed-tag">TAMAT ({{ item.episodes_watched }} eps)</span>
                </div>

                <p class="eps-title-text">Semua episode telah ditonton 100%</p>
              </div>

              <div class="circle-check-btn completed">
                <svg class="check-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="watchlist.length === 0" class="empty-state glass-card">
          <h3>Watchlist TV Series Kosong</h3>
          <p>Cari & tambahkan TV show favorit kamu dari menu Explore.</p>
          <NuxtLink to="/" class="btn-primary" style="margin-top: 14px;">+ Cari TV Series</NuxtLink>
        </div>
      </div>

      <!-- UPCOMING TAB -->
      <div v-else-if="activeTvSubTab === 'upcoming'" class="upcoming-section">
        <div v-if="upcomingList.length > 0" class="shows-stack">
          <div 
            v-for="item in upcomingList" 
            :key="item.id"
            class="tvtime-card glass-card upcoming-card"
          >
            <img 
              :src="getPosterUrl(item.movie)" 
              :alt="item.movie.title"
              class="tvtime-poster clickable"
              @click="openDetailModal(item)"
              @error="onImageError"
            />

            <div class="tvtime-card-body">
              <div class="show-title-tag clickable" @click="openDetailModal(item)">
                <span>{{ item.movie.title.toUpperCase() }}</span> &gt;
              </div>

              <div class="upcoming-date-box">
                <svg class="icon-inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                <span>Rilis: <strong>{{ item.movie.next_air_date }}</strong></span>
              </div>

              <p class="eps-title-text" v-if="item.movie.next_episode_name">
                Judul Eps: "{{ item.movie.next_episode_name }}"
              </p>
            </div>
          </div>
        </div>

        <div v-else class="empty-state glass-card">
          <h3>Belum Ada Episode Mendatang</h3>
          <p>Series di watchlist kamu belum memiliki jadwal tayang episode baru.</p>
        </div>
      </div>
    </div>

    <!-- Movies Mode Tracker -->
    <div v-else class="movies-experience">
      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>Memuat daftar film...</p>
      </div>

      <div v-else-if="watchlist.length === 0" class="empty-state glass-card">
        <h3>Belum Ada Film Ditemukan</h3>
        <NuxtLink to="/" class="btn-primary" style="margin-top: 14px;">+ Cari Film</NuxtLink>
      </div>

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
                ★ <strong>{{ item.rating }}</strong> / 10.0
              </span>
            </div>

            <h3 class="movie-title clickable" @click="openDetailModal(item)">{{ item.movie.title }}</h3>
            <p class="director-text" v-if="item.movie.director">Sutradara: {{ item.movie.director }}</p>

            <div class="card-actions">
              <button @click="openDetailModal(item)" class="btn-secondary text-sm">Detail</button>
              <button @click="openEditModal(item)" class="btn-secondary text-sm">Edit</button>
              <button @click="deleteItem(item.id)" class="btn-danger text-sm">Hapus</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Full Detail Spasius & Wide 2-Column Layout -->
    <div v-if="showDetailModal" class="modal-overlay" @click.self="showDetailModal = false">
      <div class="modal-content glass-panel detail-modal-content wide-modal animate-fade-in">
        
        <!-- Fixed Top Right Close Button -->
        <button @click="showDetailModal = false" class="close-btn-fixed" title="Tutup Modal">&times;</button>

        <!-- Movie/Show Hero Backdrop Banner -->
        <div class="hero-backdrop-banner" :style="getBackdropStyle(activeDetailMedia)">
          <div class="hero-backdrop-gradient">
            <div class="hero-media-info">
              <div class="banner-badges">
                <span :class="['badge', isTvShowContext ? 'badge-tv' : 'badge-movie']">
                  {{ isTvShowContext ? 'TV Show' : 'Movie' }}
                </span>
                <span v-if="activeDetailMedia?.vote_average" class="hero-rating-badge">
                  ★ {{ activeDetailMedia.vote_average.toFixed(1) }} / 10.0 TMDB Rating
                </span>
              </div>
              <h2 class="hero-media-title">{{ activeDetailMedia?.title || activeWatchlistContext?.movie?.title }}</h2>
              <p class="hero-media-subtitle">
                {{ formatYear(activeDetailMedia?.release_date || activeWatchlistContext?.movie?.release_date) }}
                <span v-if="activeDetailMedia?.media_status"> • {{ activeDetailMedia.media_status }}</span>
              </p>
            </div>
          </div>
        </div>

        <!-- Wide 2-Column Layout Body -->
        <div class="detail-body wide-grid">
          
          <!-- Left Column: Poster & Metadata Box -->
          <div class="detail-left-col">
            <img 
              :src="getPosterUrl(activeDetailMedia || activeWatchlistContext?.movie)" 
              :alt="activeDetailMedia?.title"
              class="detail-poster-img glass-card"
              @error="onImageError"
            />

            <div class="meta-info-box glass-card">
              <p v-if="activeDetailMedia?.director || activeWatchlistContext?.movie?.director">
                <strong>Sutradara / Pembuat:</strong> <br>
                <span class="highlight-text">{{ activeDetailMedia?.director || activeWatchlistContext?.movie?.director }}</span>
              </p>
              <p v-if="activeDetailMedia?.cast || activeWatchlistContext?.movie?.cast">
                <strong>Pemeran Utama:</strong> <br>
                {{ activeDetailMedia?.cast || activeWatchlistContext?.movie?.cast }}
              </p>
              <p v-if="isTvShowContext">
                <strong>Total Episode:</strong> {{ activeDetailMedia?.total_episodes || activeWatchlistContext?.movie?.total_episodes || 'TBA' }} eps ({{ seasonsCount }} Season)
              </p>
            </div>
          </div>

          <!-- Right Column: Overview, Seasons Selector, & Spacious Episode Grid -->
          <div class="detail-right-col">
            <h4 class="section-subtitle">Ringkasan Sinopsis</h4>
            <p class="overview-text">{{ activeDetailMedia?.overview || activeWatchlistContext?.movie?.overview }}</p>

            <!-- If TV Show: Season Selector & Interactive Episode Cards -->
            <div v-if="isTvShowContext" class="seasons-section">
              <div class="section-header-row">
                <h4 class="section-subtitle">Daftar Season & Episode</h4>
                <span class="watched-counter-badge" v-if="activeWatchlistContext">
                  Progres: {{ activeWatchlistContext.episodes_watched }} eps ditonton
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

                  <!-- Watched Checkmark Toggle Button -->
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

    <!-- Modal Edit Watchlist Item -->
    <div v-if="showEditModal" class="modal-overlay" @click.self="showEditModal = false">
      <div class="modal-content glass-panel animate-fade-in">
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
            <label>Rating Kamu (Skala 1 - 10)</label>
            <div class="star-rating-selector">
              <span 
                v-for="star in 10" 
                :key="star"
                @click="editForm.rating = star"
                :class="['star-icon', { active: star <= editForm.rating }]"
              >★</span>
              <span class="rating-number">{{ editForm.rating > 0 ? editForm.rating + ' / 10.0' : 'Belum dinilai' }}</span>
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
const activeTvSubTab = ref('watchlist')
const toastMessage = ref('')

const showEditModal = ref(false)
const editingItem = ref<any>(null)
const editForm = ref({
  status: 'watching',
  rating: 8.0,
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

const showToast = (msg: string) => {
  toastMessage.value = msg
  setTimeout(() => {
    toastMessage.value = ''
  }, 3000)
}

const isTvShowContext = computed(() => {
  return activeDetailMedia.value?.media_type === 'tv' || activeWatchlistContext.value?.movie?.media_type === 'tv'
})

const seasonsCount = computed(() => {
  if (activeDetailMedia.value?.seasons?.length) {
    return activeDetailMedia.value.seasons.length
  }
  return activeDetailMedia.value?.total_seasons || activeWatchlistContext.value?.movie?.total_seasons || 1
})

const watchNextList = computed(() => {
  return watchlist.value.filter(item => item.status === 'watching' || item.status === 'plan_to_watch')
})

const haventWatchedList = computed(() => {
  return watchlist.value.filter(item => item.status === 'on_hold')
})

const watchedHistoryList = computed(() => {
  return watchlist.value.filter(item => item.status === 'completed')
})

const upcomingList = computed(() => {
  return watchlist.value.filter(item => item.movie?.next_air_date && item.movie.next_air_date !== '')
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

const padZero = (num: number) => {
  return num < 10 ? `0${num}` : `${num}`
}

const getTotalEps = (item: any) => {
  return item.movie?.total_episodes || item.total_episodes || 0
}

const getRemainingEps = (item: any) => {
  const total = getTotalEps(item)
  const watched = item.episodes_watched || 0
  if (total <= 0) return 0
  return Math.max(0, total - watched - 1)
}

const getNextEpsName = (item: any) => {
  if (item.movie?.next_episode_name) return item.movie.next_episode_name
  const nextNum = (item.episodes_watched || 0) + 1
  return `Episode ${nextNum}`
}

const getBackdropStyle = (media: any) => {
  const path = media?.backdrop_path || media?.poster_path
  if (!path) return { background: '#1e293b' }
  const url = path.startsWith('/uploads') ? useApiUrl(path) : `https://image.tmdb.org/t/p/w780${path}`
  return { backgroundImage: `url(${url})` }
}

const getEpisodeStillUrl = (path: string) => {
  if (!path) return 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&w=500&q=80'
  return `https://image.tmdb.org/t/p/w500${path}`
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

  selectedSeason.value = Math.max(1, Math.min(seasonNum, seasonsCount.value))
  isLoadingEpisodes.value = true

  try {
    const res: any = await $fetch(useApiUrl('/api/tv/season'), {
      params: {
        id: tmdbId,
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
  if (!activeWatchlistContext.value) return false
  const watchedEps = activeWatchlistContext.value.episodes_watched || 0
  const currentSeason = activeWatchlistContext.value.season_watched || 1
  
  if (selectedSeason.value < currentSeason) return true
  if (selectedSeason.value === currentSeason) return epsNumber <= watchedEps
  return false
}

const toggleEpisodeWatched = async (epsNumber: number) => {
  if (!activeWatchlistContext.value) {
    try {
      const res: any = await $fetch(useApiUrl('/api/user/watchlist'), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authStore.token}`
        },
        body: {
          tmdb_id: activeDetailMedia.value.id || activeDetailMedia.value.tmdb_id,
          media_type: activeDetailMedia.value.media_type || 'tv',
          title: activeDetailMedia.value.title,
          overview: activeDetailMedia.value.overview,
          poster_path: activeDetailMedia.value.poster_path,
          backdrop_path: activeDetailMedia.value.backdrop_path,
          release_date: activeDetailMedia.value.release_date,
          vote_average: activeDetailMedia.value.vote_average,
          director: activeDetailMedia.value.director,
          cast: activeDetailMedia.value.cast,
          total_seasons: activeDetailMedia.value.total_seasons,
          total_episodes: activeDetailMedia.value.total_episodes,
          status: 'watching',
          season_watched: selectedSeason.value,
          episodes_watched: epsNumber
        }
      })
      if (res.data) {
        activeWatchlistContext.value = res.data
        fetchWatchlist()
        showToast(`Tersimpan: Season ${selectedSeason.value} Episode ${epsNumber}`)
      }
    } catch (err) {
      console.error(err)
    }
    return
  }

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
      fetchWatchlist()
      showToast(`Progres diperbarui: Season ${res.data.season_watched} Episode ${res.data.episodes_watched}`)
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
  return 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=500&q=80'
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
      fetchWatchlist()
      showToast(`+1 Episode! Total ${item.episodes_watched} eps ditonton`)
    }
  } catch (err) {
    console.error(err)
  }
}

const openEditModal = (item: any) => {
  editingItem.value = item
  editForm.value = {
    status: item.status,
    rating: item.rating || 8.0,
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
    showToast('Watchlist berhasil diperbarui!')
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
    showToast('Item berhasil dihapus dari watchlist.')
  } catch (err: any) {
    alert(err?.data?.error || 'Gagal menghapus item.')
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

.check-svg {
  width: 22px;
  height: 22px;
}

.tvtime-container {
  max-width: 800px;
  margin: 0 auto;
}

.top-nav-bar {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.mode-switcher {
  display: flex;
  padding: 4px;
  border-radius: 14px;
  gap: 6px;
  width: 100%;
  max-width: 320px;
}

.mode-tab {
  flex: 1;
  background: transparent;
  border: none;
  color: var(--text-secondary);
  padding: 10px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
}

.mode-tab.active {
  background: var(--accent-purple);
  color: #fff;
}

/* Sub Tab Bar: WATCH LIST vs UPCOMING */
.sub-tab-bar {
  display: flex;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 24px;
}

.sub-tab-btn {
  flex: 1;
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-weight: 800;
  font-size: 0.95rem;
  padding: 12px;
  cursor: pointer;
  letter-spacing: 0.5px;
  position: relative;
  transition: color 0.2s;
}

.sub-tab-btn.active {
  color: #fff;
}

.sub-tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 3px;
  background: #fff;
  border-radius: 2px;
}

/* Sections & Pill Badges matching TV Time Screenshot */
.section-group {
  margin-bottom: 24px;
}

.section-pill-header {
  margin-bottom: 12px;
}

.pill-badge {
  display: inline-block;
  padding: 4px 14px;
  border-radius: 20px;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.watch-next-badge {
  background: #e2e8f0;
  color: #0f172a;
}

.history-badge {
  background: #334155;
  color: #cbd5e1;
}

.idle-badge {
  background: #475569;
  color: #f1f5f9;
}

/* TV Time Card Layout */
.shows-stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tvtime-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px;
  border-radius: 16px;
  background: #111827;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.tvtime-poster {
  width: 90px;
  height: 125px;
  object-fit: cover;
  border-radius: 10px;
  flex-shrink: 0;
}

.tvtime-card-body {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.show-title-tag {
  display: inline-flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 14px;
  padding: 2px 10px;
  font-size: 0.72rem;
  font-weight: 800;
  color: #fff;
  width: fit-content;
  margin-bottom: 8px;
}

.eps-headline {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.season-eps-code {
  font-size: 1.15rem;
  font-weight: 800;
  color: #fff;
}

.remaining-count-pill {
  font-size: 0.75rem;
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.12);
  padding: 2px 8px;
  border-radius: 6px;
  font-weight: 700;
}

.eps-title-text {
  font-size: 0.88rem;
  color: #cbd5e1;
  margin-bottom: 8px;
  font-weight: 500;
}

.eps-label {
  color: #fbbf24;
  font-weight: 600;
}

.card-badges-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
}

.badge-premiere {
  background: #fff;
  color: #000;
  font-weight: 800;
  font-size: 0.68rem;
  padding: 2px 6px;
  border-radius: 4px;
}

.badge-fav {
  background: var(--accent-gold);
  color: #0f172a;
  font-weight: 800;
  font-size: 0.68rem;
  padding: 2px 6px;
  border-radius: 4px;
}

.badge-completed-tag {
  background: #22c55e;
  color: #fff;
  font-size: 0.7rem;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 6px;
}

.badge-total-info {
  font-size: 0.72rem;
  color: var(--text-muted);
}

.circle-check-btn {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background: #ffffff;
  border: none;
  color: #000000;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.2s ease;
  margin-left: 8px;
}

.circle-check-btn:hover {
  background: #22c55e;
  color: #ffffff;
  transform: scale(1.1);
}

.circle-check-btn.completed {
  background: #22c55e;
  color: #ffffff;
}

.upcoming-date-box {
  color: #38bdf8;
  font-size: 0.85rem;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
}

/* Movies Grid Layout */
.movies-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
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

.card-actions {
  display: flex;
  gap: 8px;
  margin-top: auto;
}

.card-actions button {
  flex: 1;
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
