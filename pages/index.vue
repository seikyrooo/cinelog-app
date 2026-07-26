<template>
  <div class="search-page">
    <div class="hero-section">
      <h1 class="hero-title">Cari & Lacak <span class="gradient-text">Film & TV Shows</span></h1>
      <p class="hero-subtitle">Jelajahi ribuan judul, kelola progres episode, dan berikan penilaian sinematik terbaikmu.</p>

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
          Cari
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
        class="glass-card media-card"
      >
        <div class="poster-wrapper" @click="openSaveModal(item)">
          <img 
            :src="getImageUrl(item.poster_path)" 
            :alt="item.title"
            class="poster-img"
            @error="onImageError"
          />
          <span :class="['badge', item.media_type === 'tv' ? 'badge-tv' : 'badge-movie', 'type-badge']">
            {{ item.media_type === 'tv' ? 'TV Show' : 'Movie' }}
          </span>
          <span v-if="item.vote_average" class="rating-badge">
            ★ {{ (item.vote_average / 2).toFixed(1) }}
          </span>
        </div>

        <div class="card-info">
          <h3 class="media-title" :title="item.title || item.name">{{ item.title || item.name }}</h3>
          <p class="release-date">{{ formatYear(item.release_date || item.first_air_date) }}</p>
          <p class="overview">{{ truncateText(item.overview, 110) }}</p>

          <button @click="openSaveModal(item)" class="btn-primary btn-full">
            + Tambah ke Watchlist
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Save & Detail -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal-content glass-panel animate-fade-in">
        <div class="modal-header">
          <div>
            <h2 class="modal-title">{{ activeItem?.title || activeItem?.name }}</h2>
            <p class="modal-meta">
              {{ activeItem?.media_type === 'tv' ? 'TV Show' : 'Movie' }} • {{ formatYear(activeItem?.release_date || activeItem?.first_air_date) }}
            </p>
          </div>
          <button @click="showModal = false" class="close-btn">&times;</button>
        </div>

        <!-- Detail info loading or rich info -->
        <div v-if="isFetchingDetail" class="detail-loading">
          <span>Memuat detail sutradara & episode...</span>
        </div>
        <div v-else-if="detailedInfo" class="rich-info-box">
          <p v-if="detailedInfo.director"><strong>Sutradara / Pembuat:</strong> {{ detailedInfo.director }}</p>
          <p v-if="detailedInfo.cast"><strong>Pemeran:</strong> {{ detailedInfo.cast }}</p>
          <p v-if="detailedInfo.media_type === 'tv'"><strong>Jumlah Episode:</strong> {{ detailedInfo.total_episodes || 'TBA' }} eps ({{ detailedInfo.total_seasons }} Season)</p>
          <p v-if="detailedInfo.next_air_date" class="next-air-highlight">
            📅 Episode berikutnya tayang: {{ detailedInfo.next_air_date }} ({{ detailedInfo.next_episode_name }})
          </p>
        </div>

        <form @submit.prevent="saveToWatchlist" class="modal-form">
          <div class="form-group">
            <label>Status Tontonan</label>
            <select v-model="form.status" class="form-input">
              <option value="watching">Sedang Nonton (Watching)</option>
              <option value="completed">Selesai (Completed)</option>
              <option value="plan_to_watch">Rencana Nonton (Plan to Watch)</option>
              <option value="on_hold">Ditunda (On Hold)</option>
              <option value="dropped">Dihentikan (Dropped)</option>
            </select>
          </div>

          <!-- Rating Bintang (1 - 5 Bintang) -->
          <div class="form-group">
            <label>Rating Kamu (1 - 5 Bintang)</label>
            <div class="star-rating-selector">
              <span 
                v-for="star in 5" 
                :key="star"
                @click="form.rating = star"
                :class="['star-icon', { active: star <= form.rating }]"
              >★</span>
              <span class="rating-number">{{ form.rating > 0 ? form.rating + ' / 5.0' : 'Belum dinilai' }}</span>
            </div>
          </div>

          <!-- If TV Show: Episode progress tracking -->
          <div v-if="activeItem?.media_type === 'tv'" class="form-row">
            <div class="form-group flex-1">
              <label>Season</label>
              <input v-model.number="form.season_watched" type="number" min="1" class="form-input" />
            </div>
            <div class="form-group flex-1">
              <label>Eps Ditonton</label>
              <input v-model.number="form.episodes_watched" type="number" min="0" class="form-input" />
            </div>
            <div class="form-group flex-1">
              <label>Total Eps</label>
              <input v-model.number="form.total_episodes" type="number" min="0" class="form-input" />
            </div>
          </div>

          <div class="form-group checkbox-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="form.favorite" />
              Tandai sebagai Favorit
            </label>
          </div>

          <div class="form-group">
            <label>Catatan / Review Singkat</label>
            <textarea 
              v-model="form.notes" 
              class="form-input text-area" 
              placeholder="Tulis pendapatmu..."
            ></textarea>
          </div>

          <div class="modal-actions">
            <button type="button" @click="showModal = false" class="btn-secondary">Batal</button>
            <button type="submit" class="btn-primary" :disabled="isSaving">
              {{ isSaving ? 'Menyimpan...' : 'Simpan ke Watchlist' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
const router = useRouter()

const searchQuery = ref('Breaking Bad')
const selectedType = ref('all')
const isLoading = ref(false)
const searched = ref(false)
const results = ref<any[]>([])

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

const form = ref({
  status: 'watching',
  rating: 4.5,
  favorite: false,
  notes: '',
  season_watched: 1,
  episodes_watched: 0,
  total_episodes: 0
})

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
    alert('Gagal mengambil data pencarian.')
  } finally {
    isLoading.value = false
  }
}

handleSearch()

const getImageUrl = (path: string) => {
  if (!path) return 'https://via.placeholder.com/300x450?text=No+Poster'
  return `https://image.tmdb.org/t/p/w500${path}`
}

const onImageError = (e: Event) => {
  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x450?text=No+Poster'
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
  if (!authStore.isAuth) {
    alert('Silakan login terlebih dahulu.')
    router.push('/login')
    return
  }
  activeItem.value = item
  detailedInfo.value = null
  isFetchingDetail.value = true

  form.value = {
    status: item.media_type === 'tv' ? 'watching' : 'completed',
    rating: item.vote_average ? Math.min(5, Math.round((item.vote_average / 2) * 2) / 2) : 4.0,
    favorite: false,
    notes: '',
    season_watched: 1,
    episodes_watched: 0,
    total_episodes: 0
  }
  showModal.value = true

  // Fetch detailed info
  try {
    const res: any = await $fetch(useApiUrl('/api/detail'), {
      params: {
        id: item.id,
        type: item.media_type || 'movie'
      }
    })
    if (res.data) {
      detailedInfo.value = res.data
      if (res.data.total_episodes) form.value.total_episodes = res.data.total_episodes
    }
  } catch (err) {
    console.error(err)
  } finally {
    isFetchingDetail.value = false
  }
}

const saveToWatchlist = async () => {
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
      status: form.value.status,
      rating: form.value.rating,
      favorite: form.value.favorite,
      notes: form.value.notes,
      season_watched: form.value.season_watched,
      episodes_watched: form.value.episodes_watched,
      total_episodes: form.value.total_episodes
    }

    await $fetch(useApiUrl('/api/user/watchlist'), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authStore.token}`
      },
      body: payload
    })

    showModal.value = false
    router.push('/watchlist')
  } catch (err: any) {
    console.error(err)
    alert(err?.data?.error || 'Gagal menyimpan ke watchlist.')
  } finally {
    isSaving.value = false
  }
}
</script>

<style scoped>
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
  cursor: pointer;
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

/* Modal Styling */
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
  max-width: 520px;
  border-radius: 20px;
  padding: 24px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.modal-title {
  font-size: 1.4rem;
  font-weight: 800;
}

.modal-meta {
  font-size: 0.85rem;
  color: var(--accent-gold);
}

.close-btn {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  font-size: 1.8rem;
  cursor: pointer;
  line-height: 1;
}

.rich-info-box {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--glass-border);
  padding: 12px 14px;
  border-radius: 12px;
  font-size: 0.82rem;
  color: var(--text-secondary);
  margin-bottom: 16px;
}

.rich-info-box p {
  margin-bottom: 4px;
}

.next-air-highlight {
  color: #38bdf8;
  font-weight: 600;
}

.detail-loading {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-bottom: 16px;
}

.form-group {
  margin-bottom: 14px;
}

.form-row {
  display: flex;
  gap: 12px;
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
  font-size: 1.5rem;
  color: #475569;
  cursor: pointer;
  transition: color 0.2s;
}

.star-icon.active {
  color: #fbbf24;
}

.rating-number {
  margin-left: 10px;
  font-size: 0.85rem;
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
