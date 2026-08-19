<template>
  <section class="public-profile-page">
    <div v-if="isLoading" class="public-state glass-card" aria-busy="true">
      <div class="spinner"></div>
      <p>Loading profile...</p>
    </div>
    <div v-else-if="error" class="public-state glass-card" role="alert">
      <h1>Profile Unavailable</h1>
      <p>{{ error }}</p>
      <NuxtLink to="/" class="btn-primary" style="margin-top: 14px;">Return Home</NuxtLink>
    </div>
    <template v-else-if="profile">
      <header class="public-hero glass-card">
        <div class="public-avatar" aria-hidden="true">
          <img v-if="profile.user.avatar_url" :src="getAvatarUrl(profile.user.avatar_url)" alt="User avatar" />
          <span v-else>{{ profile.user.username.slice(0, 2).toUpperCase() }}</span>
        </div>
        <div class="public-copy">
          <div class="username-row">
            <h1>@{{ profile.user.username }}</h1>
            <button 
              v-if="authStore.isAuth && authStore.user?.username !== profile.user.username"
              @click="toggleFollow" 
              :class="['btn-follow', { following: isFollowing }]"
            >
              {{ isFollowing ? 'Following ✓' : '+ Follow' }}
            </button>
          </div>
          <p class="bio-text">{{ profile.user.bio || 'No bio provided yet.' }}</p>
        </div>
        <div class="public-stats" aria-label="Public statistics">
          <div class="stat-card clickable" @click="activeTab = 'favorites'">
            <strong>{{ profile.favorite_count }}</strong>
            <span>Favorites</span>
          </div>
          <div class="stat-card clickable" @click="activeTab = 'ratings'">
            <strong>{{ profile.rating_count }}</strong>
            <span>Ratings</span>
          </div>
          <div class="stat-card clickable" @click="selectFollowTab('followers')">
            <strong>{{ profile.followers_count ?? followers.length }}</strong>
            <span>Followers</span>
          </div>
          <div class="stat-card clickable" @click="selectFollowTab('following')">
            <strong>{{ profile.following_count ?? following.length }}</strong>
            <span>Following</span>
          </div>
        </div>
      </header>

      <div class="tabs" role="tablist" aria-label="Public profile tabs">
        <button :class="['tab-btn', { active: activeTab === 'favorites' }]" type="button" @click="activeTab = 'favorites'">
          Public Favorites ({{ favorites.length }})
        </button>
        <button :class="['tab-btn', { active: activeTab === 'ratings' }]" type="button" @click="activeTab = 'ratings'">
          Public Ratings ({{ ratings.length }})
        </button>
        <button :class="['tab-btn', { active: activeTab === 'followers' }]" type="button" @click="selectFollowTab('followers')">
          Followers ({{ profile.followers_count ?? followers.length }})
        </button>
        <button :class="['tab-btn', { active: activeTab === 'following' }]" type="button" @click="selectFollowTab('following')">
          Following ({{ profile.following_count ?? following.length }})
        </button>
      </div>

      <!-- State: Empty Media -->
      <div v-if="(activeTab === 'favorites' || activeTab === 'ratings') && activeItems.length === 0" class="public-state glass-card">
        No public {{ activeTab === 'favorites' ? 'favorites' : 'ratings' }} shared yet.
      </div>

      <!-- Media Grid -->
      <div v-else-if="activeTab === 'favorites' || activeTab === 'ratings'" class="public-grid">
        <article v-for="item in activeItems" :key="item.id" class="public-card glass-card">
          <div class="public-card-poster">
            <img :src="getPosterUrl(item.movie)" :alt="item.movie?.title || 'Media poster'" @error="onImageError" loading="lazy" decoding="async" />
            <span :class="['badge', item.movie?.media_type === 'tv' ? 'badge-tv' : 'badge-movie', 'poster-type-badge']">
              {{ item.movie?.media_type === 'tv' ? 'TV' : 'Movie' }}
            </span>
          </div>
          <div class="public-card-body">
            <h2>{{ item.movie?.title || 'Untitled' }}</h2>
            <p>{{ formatYear(item.movie?.release_date || item.movie?.first_air_date) }} · {{ getStatusLabel(item.status) }}</p>
            <div class="card-footer-tags">
              <strong v-if="item.rating" class="rating-tag">★ {{ item.rating }}/10</strong>
              <strong v-if="item.favorite" class="favorite-tag">♥ Favorite</strong>
            </div>
          </div>
        </article>
      </div>

      <!-- Followers / Following List -->
      <div v-else-if="activeTab === 'followers' || activeTab === 'following'" class="followers-tab-content">
        <div v-if="isLoadingFollows" class="public-state glass-card">
          <div class="spinner"></div>
          <p>Loading {{ activeTab }}...</p>
        </div>
        <div v-else-if="currentFollowUsers.length === 0" class="public-state glass-card">
          <p>No {{ activeTab }} to display yet.</p>
        </div>
        <div v-else class="followers-grid">
          <article v-for="user in currentFollowUsers" :key="user.id" class="follower-card glass-card">
            <NuxtLink :to="`/users/${user.username}`" class="follower-avatar">
              <img v-if="user.avatar_url" :src="getAvatarUrl(user.avatar_url)" :alt="user.username" loading="lazy" decoding="async" />
              <span v-else>{{ user.username.slice(0, 2).toUpperCase() }}</span>
            </NuxtLink>
            <div class="follower-meta">
              <NuxtLink :to="`/users/${user.username}`" class="follower-username">
                <h4>@{{ user.username }}</h4>
              </NuxtLink>
              <p class="follower-bio">{{ user.bio || 'Film lover on CineLog.' }}</p>
            </div>
            <div class="follower-action">
              <span v-if="user.is_self" class="self-badge">You</span>
              <button
                v-else-if="authStore.isAuth"
                @click="toggleUserFollow(user)"
                :class="['btn-follow-chip', { following: user.is_following }]"
              >
                {{ user.is_following ? 'Following ✓' : '+ Follow' }}
              </button>
            </div>
          </article>
        </div>
      </div>
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useAuthStore } from '~/stores/auth'
import type { PublicProfile, CommunityUser } from '~/composables/useApi'

const route = useRoute()
const api = useApi()
const authStore = useAuthStore()

const username = computed(() => String(route.params.username || ''))
const profile = ref<PublicProfile | null>(null)
const favorites = ref<any[]>([])
const ratings = ref<any[]>([])
const followers = ref<CommunityUser[]>([])
const following = ref<CommunityUser[]>([])
const activeTab = ref<'favorites' | 'ratings' | 'followers' | 'following'>('favorites')
const isLoading = ref(true)
const isLoadingFollows = ref(false)
const isFollowing = ref(false)
const error = ref('')

const activeItems = computed(() => activeTab.value === 'favorites' ? favorites.value : ratings.value)
const currentFollowUsers = computed(() => activeTab.value === 'followers' ? followers.value : following.value)

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
    isFollowing.value = profileRes.data.is_following || false
  } catch (err: any) {
    error.value = err?.data?.error || 'User profile not found or set to private.'
  } finally {
    isLoading.value = false
  }
})

const selectFollowTab = async (tab: 'followers' | 'following') => {
  activeTab.value = tab
  if (tab === 'followers' && followers.value.length === 0) {
    await loadFollowers()
  } else if (tab === 'following' && following.value.length === 0) {
    await loadFollowing()
  }
}

const loadFollowers = async () => {
  isLoadingFollows.value = true
  try {
    const res = await api.getUserFollowers(username.value)
    followers.value = res.data || []
  } catch (err) {
    console.error('Failed to load followers:', err)
  } finally {
    isLoadingFollows.value = false
  }
}

const loadFollowing = async () => {
  isLoadingFollows.value = true
  try {
    const res = await api.getUserFollowing(username.value)
    following.value = res.data || []
  } catch (err) {
    console.error('Failed to load following:', err)
  } finally {
    isLoadingFollows.value = false
  }
}

const toggleFollow = async () => {
  if (!profile.value?.user?.id) return
  const targetId = profile.value.user.id
  const currentlyFollowing = isFollowing.value
  isFollowing.value = !currentlyFollowing

  if (profile.value) {
    profile.value.followers_count = (profile.value.followers_count || 0) + (currentlyFollowing ? -1 : 1)
  }

  try {
    if (currentlyFollowing) {
      await api.unfollowUser(targetId)
    } else {
      await api.followUser(targetId)
    }
  } catch (err) {
    console.error('Failed to toggle follow status:', err)
    isFollowing.value = currentlyFollowing
  }
}

const toggleUserFollow = async (user: CommunityUser) => {
  const currentlyFollowing = user.is_following
  user.is_following = !currentlyFollowing
  try {
    if (currentlyFollowing) {
      await api.unfollowUser(user.id)
    } else {
      await api.followUser(user.id)
    }
  } catch (err) {
    console.error('Failed to toggle user follow:', err)
    user.is_following = currentlyFollowing
  }
}

const { getPosterUrl, getAvatarUrl, onImageError, formatYear, getStatusLabel } = useFormatters()
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

.username-row {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}

.btn-follow {
  background: rgba(229, 9, 20, 0.14);
  border: 1px solid var(--border-red);
  color: #ff6b6b;
  font-size: 0.78rem;
  font-weight: 700;
  padding: 4px 14px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-follow:hover {
  background: var(--accent-red);
  color: #ffffff;
  transform: translateY(-1px);
}

.btn-follow.following {
  background: rgba(34, 197, 94, 0.12);
  border-color: rgba(34, 197, 94, 0.4);
  color: #4ade80;
}

.public-card-poster {
  position: relative;
  overflow: hidden;
}

.poster-type-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  font-size: 0.65rem;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.6);
}

.card-footer-tags {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-card.clickable {
  cursor: pointer;
  transition: all 0.2s ease;
}

.stat-card.clickable:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(229, 9, 20, 0.3);
  transform: translateY(-2px);
}

.followers-tab-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.followers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.follower-card {
  padding: 16px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 14px;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  transition: transform 0.2s ease, border-color 0.2s ease;
}

.follower-card:hover {
  transform: translateY(-2px);
  border-color: rgba(229, 9, 20, 0.35);
}

.follower-avatar {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: rgba(229, 9, 20, 0.12);
  border: 1px solid var(--border-red);
  color: #ff6b6b;
  display: grid;
  place-items: center;
  font-weight: 800;
  font-size: 1rem;
  overflow: hidden;
  text-decoration: none;
  flex-shrink: 0;
}

.follower-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.follower-meta {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.follower-username {
  text-decoration: none;
  color: #ffffff;
}

.follower-username h4 {
  font-size: 0.95rem;
  font-weight: 800;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.follower-username:hover h4 {
  color: var(--accent-red);
}

.follower-bio {
  font-size: 0.78rem;
  color: var(--text-secondary);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.follower-action {
  flex-shrink: 0;
}

.self-badge {
  font-size: 0.72rem;
  font-weight: 800;
  padding: 4px 10px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.08);
  color: var(--text-muted);
}

.btn-follow-chip {
  background: rgba(229, 9, 20, 0.14);
  border: 1px solid var(--border-red);
  color: #ff6b6b;
  font-size: 0.76rem;
  font-weight: 700;
  padding: 5px 12px;
  border-radius: 18px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-follow-chip:hover {
  background: var(--accent-red);
  color: #ffffff;
}

.btn-follow-chip.following {
  background: rgba(34, 197, 94, 0.12);
  border-color: rgba(34, 197, 94, 0.4);
  color: #4ade80;
}

.public-state {
  padding: 40px 24px;
  text-align: center;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
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