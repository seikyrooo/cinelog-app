<template>
  <div class="watchlist-page">
    <div class="header-banner">
      <h1 class="page-title">Daftar Tontonan <span class="gradient-text">Saya</span></h1>
      <p class="page-subtitle">Daftar film dan TV series favorit yang tersimpan aman di database & server VPS kamu.</p>

      <!-- Status Filter Tabs -->
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
          ⭐ Hanya Favorit
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
      <p class="empty-icon">🍿</p>
      <h3>Belum Ada Film / Series Ditemukan</h3>
      <p>Kamu belum menambahkan film ke kategori ini.</p>
      <NuxtLink to="/" class="btn-primary" style="margin-top: 16px;">
        🔍 Cari & Tambah Sekarang
      </NuxtLink>
    </div>

    <!-- Watchlist Grid -->
    <div v-else class="watchlist-grid">
      <div 
        v-for="item in watchlist" 
        :key="item.id" 
        class="glass-card item-card"
      >
        <div class="card-poster">
          <img 
            :src="getPosterUrl(item.movie)" 
            :alt="item.movie.title"
            class="poster-img"
            @error="onImageError"
          />
          <span :class="['badge', getStatusBadgeClass(item.status), 'status-badge']">
            {{ getStatusLabel(item.status) }}
          </span>
          <span v-if="item.favorite" class="fav-badge">
            ⭐ Favorit
          </span>
        </div>

        <div class="card-details">
          <div class="details-top">
            <span :class="['badge', item.movie.media_type === 'tv' ? 'badge-tv' : 'badge-movie']">
              {{ item.movie.media_type === 'tv' ? 'TV Series' : 'Movie' }}
            </span>
            <span class="user-rating" v-if="item.rating > 0">
              ⭐ <strong>{{ item.rating }}</strong> / 10
            </span>
          </div>

          <h3 class="movie-title">{{ item.movie.title }}</h3>
          <p class="release-date">{{ item.movie.release_date || 'Tahun tidak diketahui' }}</p>
          
          <p v-if="item.notes" class="user-notes">
            💬 "{{ item.notes }}"
          </p>

          <!-- Asset Local indicator -->
          <div class="asset-info" title="Asset disimpan secara independen di VPS storage">
            <span class="vps-badge">☁️ VPS Asset Saved</span>
          </div>

          <div class="card-actions">
            <button @click="openEditModal(item)" class="btn-secondary text-sm">
              ✏️ Edit
            </button>
            <button @click="deleteItem(item.id)" class="btn-danger text-sm">
              🗑️ Hapus
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Edit Watchlist Item -->
    <div v-if="showEditModal" class="modal-overlay" @click.self="showEditModal = false">
      <div class="modal-content glass-panel animate-fade-in">
        <h2 class="modal-title">Edit Watchlist</h2>
        <p class="modal-subtitle">{{ editingItem?.movie?.title }}</p>

        <form @submit.prevent="updateWatchlist" class="modal-form">
          <div class="form-group">
            <label>Status Tontonan</label>
            <select v-model="editForm.status" class="form-input">
              <option value="plan_to_watch">Plan to Watch</option>
              <option value="watching">Watching</option>
              <option value="completed">Completed</option>
              <option value="on_hold">On Hold</option>
              <option value="dropped">Dropped</option>
            </select>
          </div>

          <div class="form-group">
            <label>Rating (0.0 - 10.0)</label>
            <input 
              v-model.number="editForm.rating" 
              type="number" 
              step="0.5" 
              min="0" 
              max="10" 
              class="form-input" 
            />
          </div>

          <div class="form-group checkbox-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="editForm.favorite" />
              ⭐ Tandai sebagai Favorit
            </label>
          </div>

          <div class="form-group">
            <label>Catatan / Impression</label>
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
import { ref, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'

const config = useRuntimeConfig()
const authStore = useAuthStore()
const router = useRouter()

const isLoading = ref(true)
const watchlist = ref<any[]>([])
const activeStatus = ref('all')
const favoriteOnly = ref(false)

const showEditModal = ref(false)
const editingItem = ref<any>(null)
const editForm = ref({
  status: 'plan_to_watch',
  rating: 8.0,
  favorite: false,
  notes: ''
})

const statusTabs = [
  { label: 'Semua', value: 'all' },
  { label: 'Watching', value: 'watching' },
  { label: 'Completed', value: 'completed' },
  { label: 'Plan to Watch', value: 'plan_to_watch' },
  { label: 'Dropped', value: 'dropped' }
]

const fetchWatchlist = async () => {
  if (!authStore.isAuth) {
    router.push('/login')
    return
  }
  isLoading.value = true

  try {
    const params: any = {}
    if (activeStatus.value !== 'all') params.status = activeStatus.value
    if (favoriteOnly.value) params.favorite = 'true'

    const res: any = await $fetch(`${config.public.apiBase}/api/user/watchlist`, {
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

const getPosterUrl = (movie: any) => {
  if (movie?.local_poster_path) {
    return `${config.public.apiBase}${movie.local_poster_path}`
  }
  if (movie?.poster_path) {
    return `https://image.tmdb.org/t/p/w500${movie.poster_path}`
  }
  return 'https://via.placeholder.com/300x450?text=No+Poster'
}

const onImageError = (e: Event) => {
  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x450?text=No+Poster'
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
    case 'watching': return '▶️ Watching'
    case 'completed': return '✅ Completed'
    case 'on_hold': return '⏸️ On Hold'
    case 'dropped': return '🚫 Dropped'
    default: return '📌 Plan to Watch'
  }
}

const openEditModal = (item: any) => {
  editingItem.value = item
  editForm.value = {
    status: item.status,
    rating: item.rating,
    favorite: item.favorite,
    notes: item.notes || ''
  }
  showEditModal.value = true
}

const updateWatchlist = async () => {
  if (!editingItem.value) return
  try {
    await $fetch(`${config.public.apiBase}/api/user/watchlist/${editingItem.value.id}`, {
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
  if (!confirm('Yakin ingin menghapus item ini dari watchlist kamu?')) return
  try {
    await $fetch(`${config.public.apiBase}/api/user/watchlist/${id}`, {
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
  margin-bottom: 32px;
}

.page-title {
  font-size: 2.2rem;
  font-weight: 800;
  margin-bottom: 8px;
}

.page-subtitle {
  color: var(--text-secondary);
  margin-bottom: 24px;
}

.filter-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tab-btn {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--glass-border);
  color: var(--text-secondary);
  padding: 8px 16px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn.active {
  background: var(--accent-purple);
  color: #fff;
  border-color: var(--accent-purple);
}

.favorite-tab.active {
  background: var(--accent-gold);
  color: #0f172a;
  border-color: var(--accent-gold);
}

.watchlist-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 24px;
}

.item-card {
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.card-poster {
  position: relative;
  width: 100%;
  padding-top: 140%;
  background: #1e293b;
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
  top: 12px;
  left: 12px;
}

.fav-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(245, 158, 11, 0.9);
  color: #0f172a;
  font-weight: 700;
  font-size: 0.75rem;
  padding: 4px 8px;
  border-radius: 8px;
}

.card-details {
  padding: 16px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.details-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.user-rating {
  font-size: 0.85rem;
  color: #fbbf24;
}

.movie-title {
  font-size: 1.1rem;
  color: #fff;
  font-weight: 700;
  margin-bottom: 4px;
}

.release-date {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-bottom: 12px;
}

.user-notes {
  font-size: 0.85rem;
  color: #e2e8f0;
  font-style: italic;
  background: rgba(255, 255, 255, 0.05);
  padding: 8px 12px;
  border-radius: 8px;
  margin-bottom: 12px;
}

.asset-info {
  margin-top: auto;
  margin-bottom: 12px;
}

.vps-badge {
  font-size: 0.7rem;
  color: #34d399;
  background: rgba(16, 185, 129, 0.1);
  padding: 3px 8px;
  border-radius: 6px;
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.card-actions {
  display: flex;
  gap: 8px;
}

.card-actions button {
  flex: 1;
}

.loading-state, .empty-state {
  text-align: center;
  padding: 60px;
  color: var(--text-secondary);
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 12px;
}

.text-sm {
  font-size: 0.8rem;
  padding: 6px 12px;
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
