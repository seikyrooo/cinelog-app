<template>
  <div class="community-page">
    <!-- Hero Header -->
    <header class="community-hero glass-card">
      <div class="hero-text">
        <div class="hero-badge">
          <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          <span>Social Network</span>
        </div>
        <h1>Discover Cinephiles & Friends</h1>
        <p class="subtitle">Find other movie buffs, follow their watch journey, and explore their favorite films and ratings.</p>
      </div>

      <!-- Live Search Box -->
      <div class="search-box-wrapper">
        <div class="search-input-group">
          <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by username or bio keywords..."
            class="search-input"
            @input="onSearchInput"
          />
          <button v-if="searchQuery" class="clear-search-btn" @click="clearSearch" title="Clear search">✕</button>
        </div>
      </div>
    </header>

    <!-- State: Loading -->
    <div v-if="isLoading" class="community-state glass-card">
      <div class="spinner"></div>
      <p>Finding users...</p>
    </div>

    <!-- State: No Results -->
    <div v-else-if="users.length === 0" class="community-state glass-card">
      <div class="empty-icon-circle">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      </div>
      <h3>No Users Found</h3>
      <p v-if="searchQuery">We couldn't find anyone matching "<strong>{{ searchQuery }}</strong>". Try searching with different keywords.</p>
      <p v-else>No public profiles available at the moment.</p>
      <button v-if="searchQuery" @click="clearSearch" class="btn-secondary" style="margin-top: 10px;">Reset Search</button>
    </div>

    <!-- Results Grid -->
    <div v-else class="community-grid">
      <article v-for="user in users" :key="user.id" class="user-card glass-card">
        <div class="user-card-header">
          <NuxtLink :to="`/users/${user.username}`" class="user-avatar-link">
            <div class="user-avatar">
              <img v-if="user.avatar_url" :src="getAvatarUrl(user.avatar_url)" :alt="user.username" loading="lazy" decoding="async" />
              <span v-else>{{ user.username.slice(0, 2).toUpperCase() }}</span>
            </div>
          </NuxtLink>

          <div class="user-meta-info">
            <NuxtLink :to="`/users/${user.username}`" class="user-name-link">
              <h3>@{{ user.username }}</h3>
            </NuxtLink>
            <span class="user-joined">Member since {{ formatYear(user.created_at) }}</span>
          </div>

          <!-- Follow Button -->
          <div class="user-action-col">
            <span v-if="user.is_self" class="self-badge">You</span>
            <button
              v-else-if="authStore.isAuth"
              @click="toggleFollow(user)"
              :class="['btn-follow-chip', { following: user.is_following }]"
              :disabled="togglingMap[user.id]"
            >
              <span v-if="togglingMap[user.id]">...</span>
              <span v-else-if="user.is_following">Following ✓</span>
              <span v-else>+ Follow</span>
            </button>
            <NuxtLink v-else to="/login" class="btn-follow-chip">
              + Follow
            </NuxtLink>
          </div>
        </div>

        <p class="user-bio">{{ user.bio || 'Film lover on CineLog.' }}</p>

        <!-- Stats row -->
        <div class="user-stats-footer">
          <div class="stat-pill">
            <strong>{{ user.watched_count }}</strong>
            <span>Logged</span>
          </div>
          <div class="stat-pill">
            <strong>{{ user.followers_count }}</strong>
            <span>Followers</span>
          </div>
          <div class="stat-pill">
            <strong>{{ user.following_count }}</strong>
            <span>Following</span>
          </div>
          <NuxtLink :to="`/users/${user.username}`" class="profile-arrow-btn" title="View Profile">
            <span>View Profile ↗</span>
          </NuxtLink>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { useAuthStore } from '~/stores/auth'
import type { CommunityUser } from '~/composables/useApi'

const authStore = useAuthStore()
const api = useApi()

const searchQuery = ref('')
const users = ref<CommunityUser[]>([])
const isLoading = ref(true)
const togglingMap = reactive<Record<number, boolean>>({})

let searchDebounceTimeout: any = null

onMounted(async () => {
  authStore.initAuth()
  await loadUsers()
})

const loadUsers = async (q?: string) => {
  isLoading.value = true
  try {
    const res = await api.searchUsers(q)
    users.value = res.data || []
  } catch (err) {
    console.error('Failed to load users:', err)
  } finally {
    isLoading.value = false
  }
}

const onSearchInput = () => {
  if (searchDebounceTimeout) clearTimeout(searchDebounceTimeout)
  searchDebounceTimeout = setTimeout(() => {
    loadUsers(searchQuery.value.trim())
  }, 300)
}

const clearSearch = () => {
  searchQuery.value = ''
  loadUsers()
}

const toggleFollow = async (user: CommunityUser) => {
  if (togglingMap[user.id]) return
  togglingMap[user.id] = true

  const currentlyFollowing = user.is_following

  // Optimistic update
  user.is_following = !currentlyFollowing
  user.followers_count += currentlyFollowing ? -1 : 1

  try {
    if (currentlyFollowing) {
      await api.unfollowUser(user.id)
    } else {
      await api.followUser(user.id)
    }
  } catch (err) {
    console.error('Failed to toggle follow status:', err)
    // Revert optimistic update
    user.is_following = currentlyFollowing
    user.followers_count += currentlyFollowing ? 1 : -1
  } finally {
    togglingMap[user.id] = false
  }
}

const { getAvatarUrl, formatYear } = useFormatters()
</script>

<style scoped>
.community-page {
  display: flex;
  flex-direction: column;
  gap: 28px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 4px;
}

.community-hero {
  padding: 32px 28px;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(229, 9, 20, 0.15);
  border: 1px solid var(--border-red);
  color: #ff6b6b;
  font-size: 0.72rem;
  font-weight: 800;
  padding: 3px 10px;
  border-radius: 3px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin-bottom: 10px;
}

.icon-svg {
  width: 14px;
  height: 14px;
}

.hero-text h1 {
  font-size: 1.85rem;
  font-weight: 800;
  color: #ffffff;
  margin: 0 0 6px 0;
  letter-spacing: -0.03em;
}

.subtitle {
  color: var(--text-secondary);
  font-size: 0.92rem;
  margin: 0;
  max-width: 680px;
}

.search-box-wrapper {
  max-width: 600px;
}

.search-input-group {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 16px;
  width: 18px;
  height: 18px;
  color: var(--text-muted);
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 12px 44px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--border-subtle);
  border-radius: 4px;
  color: var(--text-primary);
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.search-input:focus {
  background: rgba(255, 255, 255, 0.08);
  border-color: var(--accent-red);
  outline: none;
}

.clear-search-btn {
  position: absolute;
  right: 14px;
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 1rem;
  cursor: pointer;
}

.clear-search-btn:hover {
  color: #ffffff;
}

.community-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 16px;
}

.user-card {
  padding: 20px;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  transition: all 0.2s ease;
}

.user-card:hover {
  transform: translateY(-2px);
  border-color: var(--border-medium);
}

.user-card-header {
  display: flex;
  align-items: center;
  gap: 14px;
}

.user-avatar-link {
  text-decoration: none;
  flex-shrink: 0;
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 4px;
  background: rgba(229, 9, 20, 0.15);
  border: 1px solid var(--border-red);
  color: #ff6b6b;
  display: grid;
  place-items: center;
  font-weight: 800;
  font-size: 1.1rem;
  overflow: hidden;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-meta-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-name-link {
  text-decoration: none;
  color: #ffffff;
}

.user-name-link h3 {
  font-size: 1.02rem;
  font-weight: 800;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: -0.02em;
}

.user-name-link:hover h3 {
  color: var(--accent-red);
}

.user-joined {
  font-size: 0.74rem;
  color: var(--text-muted);
}

.user-action-col {
  flex-shrink: 0;
}

.self-badge {
  font-size: 0.72rem;
  font-weight: 800;
  padding: 3px 8px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.08);
  color: var(--text-muted);
  text-transform: uppercase;
}

.btn-follow-chip {
  background: var(--accent-red);
  border: none;
  color: #ffffff;
  font-size: 0.78rem;
  font-weight: 700;
  padding: 6px 14px;
  border-radius: 3px;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
  transition: all 0.2s ease;
}

.btn-follow-chip:hover:not(:disabled) {
  background: var(--accent-red-hover);
  transform: scale(1.02);
}

.btn-follow-chip.following {
  background: rgba(70, 211, 105, 0.15);
  border: 1px solid rgba(70, 211, 105, 0.4);
  color: #46d369;
}

.user-bio {
  font-size: 0.84rem;
  color: var(--text-secondary);
  line-height: 1.45;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.user-stats-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  border-top: 1px solid var(--border-subtle);
  padding-top: 12px;
}

.stat-pill {
  flex: 1;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--border-subtle);
  border-radius: 4px;
  padding: 5px 8px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.stat-pill strong {
  font-size: 0.92rem;
  font-weight: 800;
  color: #ffffff;
}

.stat-pill span {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-muted);
}

.profile-arrow-btn {
  color: var(--accent-red);
  font-size: 0.78rem;
  font-weight: 700;
  text-decoration: none;
  padding: 6px 8px;
  white-space: nowrap;
}

.community-state {
  padding: 60px 24px;
  text-align: center;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.empty-icon-circle {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.04);
  display: grid;
  place-items: center;
  color: var(--text-muted);
}

.empty-icon-circle svg {
  width: 24px;
  height: 24px;
}

@media (max-width: 640px) {
  .community-hero {
    padding: 22px 18px;
  }

  .community-grid {
    grid-template-columns: 1fr;
  }
}
</style>
