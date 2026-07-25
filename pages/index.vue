<template>
  <div class="search-page">
    <div class="hero-section">
      <h1 class="hero-title">Cari & Catat <span class="gradient-text">Film / TV Series</span></h1>
      <p class="hero-subtitle">Cari judul favoritmu dari TMDB, beri rating, dan simpan gambarnya langsung ke VPS servermu.</p>

      <!-- Search Box -->
      <div class="search-box glass-panel">
        <input 
          v-model="searchQuery" 
          @keyup.enter="handleSearch"
          type="text" 
          placeholder="Tulis judul film atau serial TV (contoh: Inception, Breaking Bad)..." 
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
          🔍 Cari
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Mengambil data dari TMDB...</p>
    </div>

    <!-- Empty / Initial state -->
    <div v-else-if="results.length === 0 && searched" class="empty-state">
      <p>❌ Tidak ditemukan film atau series dengan kata kunci "{{ searchQuery }}"</p>
    </div>

    <!-- Results Grid -->
    <div v-else-if="results.length > 0" class="results-grid">
      <div 
        v-for="item in results" 
        :key="item.id" 
        class="glass-card media-card"
      >
        <div class="poster-wrapper">
          <img 
            :src="getImageUrl(item.poster_path)" 
            :alt="item.title"
            class="poster-img"
            @error="onImageError"
          />
          <span :class="['badge', item.media_type === 'tv' ? 'badge-tv' : 'badge-movie', 'type-badge']">
            {{ item.media_type === 'tv' ? '📺 TV Series' : '🎬 Movie' }}
          </span>
          <span v-if="item.vote_average" class="rating-badge">
            ⭐ {{ item.vote_average.toFixed(1) }}
          </span>
        </div>

        <div class="card-info">
          <h3 class="media-title">{{ item.title || item.name }}</h3>
          <p class="release-date">{{ item.release_date || item.first_air_date || 'Tanggal tidak diketahui' }}</p>
          <p class="overview">{{ truncateText(item.overview, 110) }}</p>

          <button @click="openSaveModal(item)" class="btn-primary btn-full">
            ➕ Simpan ke List
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Save to Watchlist -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal-content glass-panel animate-fade-in">
        <h2 class="modal-title">Simpan ke Watchlist</h2>
        <p class="modal-subtitle">{{ activeItem?.title || activeItem?.name }}</p>

        <form @submit.prevent="saveToWatchlist" class="modal-form">
          <div class="form-group">
            <label>Status Tontonan</label>
            <select v-model="form.status" class="form-input">
              <option value="plan_to_watch">Plan to Watch (Rencana Nonton)</option>
              <option value="watching">Watching (Sedang Nonton)</option>
              <option value="completed">Completed (Selesai)</option>
              <option value="on_hold">On Hold (Ditunda)</option>
              <option value="dropped">Dropped (Dihentikan)</option>
            </select>
          </div>

          <div class="form-group">
            <label>Rating Pribadi (0.0 - 10.0)</label>
            <input 
              v-model.number="form.rating" 
              type="number" 
              step="0.5" 
              min="0" 
              max="10" 
              class="form-input" 
              placeholder="Contoh: 8.5"
            />
          </div>

          <div class="form-group checkbox-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="form.favorite" />
              ⭐ Tandai sebagai Favorit
            </label>
          </div>

          <div class="form-group">
            <label>Catatan Pribadi / Review</label>
            <textarea 
              v-model="form.notes" 
              class="form-input text-area" 
              placeholder="Tulis pesan atau kesanmu tentang film ini..."
            ></textarea>
          </div>

          <div class="modal-actions">
            <button type="button" @click="showModal = false" class="btn-secondary">Batal</button>
            <button type="submit" class="btn-primary" :disabled="isSaving">
              {{ isSaving ? 'Menyimpan & Download Asset...' : 'Simpan ke Database VPS' }}
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

const config = useRuntimeConfig()
const authStore = useAuthStore()
const router = useRouter()

const searchQuery = ref('Avengers')
const selectedType = ref('all')
const isLoading = ref(false)
const searched = ref(false)
const results = ref<any[]>([])

const mediaTypes = [
  { label: 'Semua', value: 'all' },
  { label: 'Movie', value: 'movie' },
  { label: 'TV Series', value: 'tv' }
]

const showModal = ref(false)
const activeItem = ref<any>(null)
const isSaving = ref(false)

const form = ref({
  status: 'plan_to_watch',
  rating: 8.0,
  favorite: false,
  notes: ''
})

const handleSearch = async () => {
  if (!searchQuery.value.trim()) return
  isLoading.value = true
  searched.value = true

  try {
    const res: any = await $fetch(`${config.public.apiBase}/api/search`, {
      params: {
        q: searchQuery.value,
        type: selectedType.value
      }
    })
    results.value = res.data || []
  } catch (err) {
    console.error(err)
    alert('Gagal mengambil data dari server API.')
  } finally {
    isLoading.value = false
  }
}

// Initial search
handleSearch()

const getImageUrl = (path: string) => {
  if (!path) return 'https://via.placeholder.com/300x450?text=No+Poster'
  return `https://image.tmdb.org/t/p/w500${path}`
}

const onImageError = (e: Event) => {
  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x450?text=No+Poster'
}

const truncateText = (text: string, len: number) => {
  if (!text) return 'Tidak ada deskripsi.'
  return text.length > len ? text.substring(0, len) + '...' : text
}

const openSaveModal = (item: any) => {
  if (!authStore.isAuth) {
    alert('Silakan login terlebih dahulu untuk menyimpan ke list!')
    router.push('/login')
    return
  }
  activeItem.value = item
  form.value = {
    status: 'plan_to_watch',
    rating: item.vote_average ? Math.round(item.vote_average * 10) / 10 : 8.0,
    favorite: false,
    notes: ''
  }
  showModal.value = true
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
      status: form.value.status,
      rating: form.value.rating,
      favorite: form.value.favorite,
      notes: form.value.notes
    }

    await $fetch(`${config.public.apiBase}/api/user/watchlist`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authStore.token}`
      },
      body: payload
    })

    alert('✅ Berhasil disimpan! Asset poster telah di-backup ke VPS storage.')
    showModal.value = false
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
  font-size: 2.8rem;
  font-weight: 800;
  margin-bottom: 12px;
}

.hero-subtitle {
  color: var(--text-secondary);
  font-size: 1.1rem;
  max-width: 600px;
  margin: 0 auto 28px;
}

.search-box {
  max-width: 750px;
  margin: 0 auto;
  padding: 12px;
  border-radius: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

.search-input {
  flex: 1;
  min-width: 250px;
  background: transparent;
  border: none;
  color: #fff;
  font-size: 1rem;
  padding: 10px 16px;
  outline: none;
}

.filter-type {
  display: flex;
  gap: 4px;
  background: rgba(255, 255, 255, 0.06);
  padding: 4px;
  border-radius: 12px;
}

.type-btn {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  padding: 6px 14px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
}

.type-btn.active {
  background: var(--accent-purple);
  color: #fff;
}

.loading-state, .empty-state {
  text-align: center;
  padding: 60px;
  color: var(--text-secondary);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-top-color: var(--accent-gold);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 24px;
}

.media-card {
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.poster-wrapper {
  position: relative;
  width: 100%;
  padding-top: 150%;
  overflow: hidden;
  background: #1e293b;
}

.poster-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.media-card:hover .poster-img {
  transform: scale(1.05);
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
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  color: #fbbf24;
  font-weight: 700;
  font-size: 0.8rem;
  padding: 4px 8px;
  border-radius: 8px;
}

.card-info {
  padding: 16px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.media-title {
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 4px;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.release-date {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-bottom: 8px;
}

.overview {
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.4;
  margin-bottom: 16px;
  flex: 1;
}

.btn-full {
  width: 100%;
  justify-content: center;
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
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
  padding: 28px;
}

.modal-title {
  font-size: 1.5rem;
  margin-bottom: 4px;
}

.modal-subtitle {
  color: var(--accent-gold);
  font-weight: 600;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-bottom: 6px;
  font-weight: 600;
}

.form-input {
  width: 100%;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--glass-border);
  color: #fff;
  padding: 10px 14px;
  border-radius: 10px;
  font-family: inherit;
  outline: none;
}

.form-input option {
  background: #0f172a;
}

.text-area {
  min-height: 80px;
  resize: vertical;
}

.checkbox-group {
  margin: 12px 0;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #fff;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}
</style>
