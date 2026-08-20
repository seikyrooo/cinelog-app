<template>
  <div class="community-page">
    <!-- Hero Header -->
    <header class="community-hero glass-card">
      <div class="hero-header-top">
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
          <h1>Community & Watch Feed</h1>
          <p class="subtitle">See live ratings and reviews from friends you follow, or discover other passionate cinephiles across the globe.</p>
        </div>

        <!-- Impeccable Dual Tab Switcher -->
        <div class="community-tab-bar">
          <button 
            @click="activeTab = 'activity'; if (activities.length === 0) loadActivityFeed();" 
            :class="['community-tab-btn', { active: activeTab === 'activity' }]"
          >
            <svg class="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
            </svg>
            <span>Following Activity</span>
          </button>

          <button 
            @click="activeTab = 'discover'; if (users.length === 0) loadUsers();" 
            :class="['community-tab-btn', { active: activeTab === 'discover' }]"
          >
            <svg class="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            <span>Discover Cinephiles</span>
          </button>
        </div>
      </div>

      <!-- Live Search Box (Active only on Discover tab) -->
      <div v-if="activeTab === 'discover'" class="search-box-wrapper animate-fade-in">
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

    <!-- ==========================================
         TAB 1: FOLLOWING ACTIVITY STREAM
         ========================================== -->
    <section v-if="activeTab === 'activity'" class="activity-section animate-fade-in">
      <!-- Loading State -->
      <div v-if="isLoadingActivities" class="community-state glass-card">
        <div class="spinner"></div>
        <p>Loading activity stream...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="activities.length === 0" class="community-state glass-card">
        <div class="empty-icon-circle">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
          </svg>
        </div>
        <h3>No Activities Yet</h3>
        <p>Follow other movie buffs in the <strong>Discover Cinephiles</strong> tab to see their watch history, ratings, and reviews here in real-time!</p>
        <button @click="activeTab = 'discover'" class="btn-primary" style="margin-top: 10px;">
          Find Cinephiles to Follow →
        </button>
      </div>

      <!-- Activity Feed List -->
      <div v-else class="activity-stream-list">
        <article 
          v-for="act in activities" 
          :key="'act-' + act.id" 
          class="activity-card glass-card"
        >
          <!-- Activity Header: User Info & Time -->
          <div class="activity-card-header">
            <NuxtLink :to="`/users/${encodeURIComponent(act.user?.username || '')}`" class="activity-user-link">
              <div class="activity-avatar">
                <img 
                  v-if="act.user?.avatar_url" 
                  :src="getAvatarUrl(act.user.avatar_url)" 
                  :alt="act.user?.username" 
                  @error="onAvatarError" 
                  loading="lazy" 
                />
                <span v-else>{{ (act.user?.username || 'CL').slice(0, 2).toUpperCase() }}</span>
              </div>
            </NuxtLink>

            <div class="activity-user-meta">
              <div class="activity-headline">
                <NuxtLink :to="`/users/${encodeURIComponent(act.user?.username || '')}`" class="activity-username">
                  @{{ act.user?.username }}
                </NuxtLink>
                <span class="activity-action-label">{{ getActivityActionLabel(act) }}</span>
              </div>
              <span class="activity-time">
                {{ formatRelativeTime(act.updated_at || act.created_at) }}
                <span v-if="act.is_edited" class="edited-tag">• edited</span>
              </span>
            </div>

            <!-- Rating badge if rated -->
            <div v-if="act.rating > 0" class="activity-rating-badge">
              <span class="star-gold">★</span>
              <strong>{{ act.rating }}</strong>
              <small>/ 10</small>
            </div>
          </div>

          <!-- Activity Media Body -->
          <div class="activity-media-body">
            <div class="activity-poster-wrap">
              <img 
                :src="getPosterUrl(act.movie)" 
                :alt="act.movie?.title || 'Media poster'" 
                class="activity-poster-img"
                @error="onImageError"
              />
            </div>

            <div class="activity-media-info">
              <div class="activity-media-title-row">
                <h3 class="activity-media-title">{{ act.movie?.title }}</h3>
                <span class="activity-media-badge">{{ act.movie?.media_type === 'tv' ? 'TV' : 'Movie' }}</span>
              </div>
              <p class="activity-media-year">{{ formatYear(act.movie?.release_date || act.movie?.first_air_date) }}</p>

              <!-- User Review / Commentary Quote Box -->
              <div v-if="act.review || act.notes" class="activity-review-quote">
                <svg class="quote-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
                </svg>
                <p>{{ act.review || act.notes }}</p>
              </div>

              <!-- Watch Status Pill if watching/progress -->
              <div class="activity-status-row">
                <span :class="['activity-status-tag', act.status]">
                  {{ getStatusLabel(act.status) }}
                  <template v-if="act.movie?.media_type === 'tv' && act.episodes_watched > 0">
                    • Ep {{ act.episodes_watched }}
                  </template>
                </span>
                <span v-if="act.favorite" class="activity-fav-tag">★ Favorite</span>
              </div>
            </div>
          </div>

          <!-- Activity Actions Row: Like & Comment Counters & Triggers -->
          <div class="activity-interaction-bar">
            <button 
              @click="toggleLike(act)" 
              :class="['btn-interaction-chip', 'like-chip', { active: act.is_liked }]"
              :title="act.is_liked ? 'Unlike this post' : 'Like this post'"
            >
              <svg class="interaction-icon" viewBox="0 0 24 24" :fill="act.is_liked ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
              <span>{{ act.likes_count || 0 }}</span>
              <span class="action-label-text">{{ act.likes_count === 1 ? 'Like' : 'Likes' }}</span>
            </button>

            <button 
              @click="toggleComments(act)" 
              :class="['btn-interaction-chip', 'comment-chip', { active: expandedComments[act.id] }]"
              title="View comments"
            >
              <svg class="interaction-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              <span>{{ act.comments_count || 0 }}</span>
              <span class="action-label-text">{{ act.comments_count === 1 ? 'Comment' : 'Comments' }}</span>
            </button>
          </div>

          <!-- Expandable Comments Drawer / Box -->
          <div v-if="expandedComments[act.id]" class="activity-comments-section animate-fade-in">
            <!-- Loading state for comments -->
            <div v-if="loadingComments[act.id]" class="comments-loading">
              <div class="spinner-mini"></div>
              <span>Loading comments...</span>
            </div>

            <!-- List of comments -->
            <div v-else class="comments-list">
              <div v-if="!commentsData[act.id] || commentsData[act.id].length === 0" class="no-comments-yet">
                <span>No comments yet. Be the first to start the conversation!</span>
              </div>
              <div 
                v-for="comm in commentsData[act.id]" 
                :key="'comm-' + comm.id"
                class="comment-row"
              >
                <NuxtLink :to="`/users/${encodeURIComponent(comm.user?.username || '')}`" class="comment-avatar-link">
                  <div class="comment-avatar">
                    <img 
                      v-if="comm.user?.avatar_url" 
                      :src="getAvatarUrl(comm.user.avatar_url)" 
                      :alt="comm.user?.username" 
                      @error="onAvatarError"
                    />
                    <span v-else>{{ (comm.user?.username || 'C').slice(0, 1).toUpperCase() }}</span>
                  </div>
                </NuxtLink>

                <div class="comment-content-box">
                  <div class="comment-header-row">
                    <NuxtLink :to="`/users/${encodeURIComponent(comm.user?.username || '')}`" class="comment-author">
                      @{{ comm.user?.username }}
                    </NuxtLink>
                    <span class="comment-time">{{ formatRelativeTime(comm.created_at) }}</span>
                    <button 
                      v-if="authStore.userId === comm.user_id" 
                      @click="deleteComment(act, comm.id)"
                      class="btn-delete-comment"
                      title="Delete comment"
                    >
                      ✕
                    </button>
                  </div>
                  <p class="comment-text">{{ comm.content }}</p>
                </div>
              </div>
            </div>

            <!-- Post New Comment Input Form -->
            <form @submit.prevent="submitComment(act)" class="comment-form">
              <div class="comment-form-avatar">
                <img 
                  v-if="authStore.user?.avatar_url" 
                  :src="getAvatarUrl(authStore.user.avatar_url)" 
                  :alt="authStore.user?.username" 
                  @error="onAvatarError"
                />
                <span v-else>{{ userInitials }}</span>
              </div>
              <input 
                v-model="commentInputs[act.id]" 
                type="text" 
                placeholder="Write a comment..."
                class="comment-input-field"
                :disabled="submittingComment[act.id]"
              />
              <button 
                type="submit" 
                :disabled="!commentInputs[act.id] || !commentInputs[act.id].trim() || submittingComment[act.id]"
                class="btn-submit-comment"
              >
                <span v-if="submittingComment[act.id]">...</span>
                <span v-else>Post</span>
              </button>
            </form>
          </div>
        </article>
      </div>
    </section>

    <!-- ==========================================
         TAB 2: DISCOVER CINEPHILES
         ========================================== -->
    <section v-else class="discover-section animate-fade-in">
      <!-- State: Loading -->
      <div v-if="isLoadingUsers" class="community-state glass-card">
        <div class="spinner"></div>
        <p>Finding cinephiles...</p>
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
          <!-- Card Header: Avatar, Name, Follow -->
          <div class="user-card-header">
            <NuxtLink :to="`/users/${encodeURIComponent(user.username)}`" class="user-avatar-link" :title="`View @${user.username}`">
              <div class="user-avatar">
                <img v-if="user.avatar_url" :src="getAvatarUrl(user.avatar_url)" :alt="user.username" @error="onAvatarError" loading="lazy" decoding="async" />
                <span v-else>{{ user.username.slice(0, 2).toUpperCase() }}</span>
              </div>
            </NuxtLink>

            <div class="user-meta-info">
              <NuxtLink :to="`/users/${encodeURIComponent(user.username)}`" class="user-name-link">
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

          <!-- Bio text -->
          <p class="user-bio" :class="{ 'empty-bio': !user.bio }">
            {{ user.bio || 'Film lover tracking cinema on CineLog.' }}
          </p>

          <!-- Stats 3-Grid -->
          <div class="user-stats-grid">
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
          </div>

          <!-- Action Button -->
          <NuxtLink :to="`/users/${encodeURIComponent(user.username)}`" class="btn-view-profile">
            <span>View Public Profile</span>
            <svg class="arrow-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </NuxtLink>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { useAuthStore } from '~/stores/auth'
import type { CommunityUser } from '~/composables/useApi'

const authStore = useAuthStore()
const api = useApi()

const activeTab = ref<'activity' | 'discover'>('activity')
const searchQuery = ref('')
const users = ref<CommunityUser[]>([])
const activities = ref<any[]>([])
const isLoadingUsers = ref(false)
const isLoadingActivities = ref(false)
const togglingMap = reactive<Record<number, boolean>>({})

let searchDebounceTimeout: any = null

onMounted(async () => {
  authStore.initAuth()
  await Promise.all([
    loadActivityFeed(),
    loadUsers()
  ])
})

const loadActivityFeed = async () => {
  isLoadingActivities.value = true
  try {
    const res = await api.getSocialFeed({ type: 'following', limit: 30 })
    activities.value = res?.data || []
  } catch (err) {
    console.error('Failed to load social feed:', err)
  } finally {
    isLoadingActivities.value = false
  }
}

const loadUsers = async (q?: string) => {
  isLoadingUsers.value = true
  try {
    let res = await api.searchUsers(q)
    if ((!res?.data || res.data.length === 0) && !q) {
      try {
        const discoverRes = await api.getDiscoverUsers()
        if (discoverRes?.data && discoverRes.data.length > 0) {
          res = discoverRes
        }
      } catch {}
    }
    users.value = res?.data || []
  } catch (err) {
    console.error('Failed to load users:', err)
  } finally {
    isLoadingUsers.value = false
  }
}

const getActivityActionLabel = (act: any): string => {
  if (act.review || act.notes) {
    return 'rated & reviewed'
  }
  if (act.rating > 0) {
    return 'rated'
  }
  if (act.favorite) {
    return 'added to favorites'
  }
  return 'logged'
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
  if (!authStore.isAuth) {
    useRouter().push('/login')
    return
  }
  if (togglingMap[user.id]) return
  togglingMap[user.id] = true

  const currentlyFollowing = user.is_following

  // Optimistic update
  user.is_following = !currentlyFollowing
  user.followers_count = Math.max(0, user.followers_count + (currentlyFollowing ? -1 : 1))

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
  } finally {
    togglingMap[user.id] = false
  }
}

const togglingLikeMap = reactive<Record<number, boolean>>({})
const expandedComments = reactive<Record<number, boolean>>({})
const commentsData = reactive<Record<number, any[]>>({})
const loadingComments = reactive<Record<number, boolean>>({})
const commentInputs = reactive<Record<number, string>>({})
const submittingComment = reactive<Record<number, boolean>>({})

const userInitials = computed(() => {
  const name = authStore.user?.username || ''
  return name ? name.slice(0, 2).toUpperCase() : 'CL'
})

const toggleLike = async (act: any) => {
  if (!authStore.isAuth) {
    useRouter().push('/login')
    return
  }
  if (togglingLikeMap[act.id]) return
  togglingLikeMap[act.id] = true

  const currentlyLiked = act.is_liked
  act.is_liked = !currentlyLiked
  act.likes_count = Math.max(0, (act.likes_count || 0) + (currentlyLiked ? -1 : 1))

  try {
    const res = await api.toggleActivityLike(act.id)
    if (res && typeof res.liked === 'boolean') {
      act.is_liked = res.liked
      act.likes_count = res.likes_count
    }
  } catch (err) {
    console.error('Failed to toggle like:', err)
    act.is_liked = currentlyLiked
    act.likes_count = Math.max(0, (act.likes_count || 0) + (currentlyLiked ? 1 : -1))
  } finally {
    togglingLikeMap[act.id] = false
  }
}

const toggleComments = async (act: any) => {
  expandedComments[act.id] = !expandedComments[act.id]
  if (expandedComments[act.id] && !commentsData[act.id]) {
    await loadComments(act.id)
  }
}

const loadComments = async (activityId: number) => {
  loadingComments[activityId] = true
  try {
    const res = await api.getActivityComments(activityId)
    commentsData[activityId] = res?.data || []
  } catch (err) {
    console.error('Failed to load comments:', err)
  } finally {
    loadingComments[activityId] = false
  }
}

const submitComment = async (act: any) => {
  if (!authStore.isAuth) {
    useRouter().push('/login')
    return
  }
  const text = commentInputs[act.id]?.trim()
  if (!text || submittingComment[act.id]) return

  submittingComment[act.id] = true
  try {
    const res = await api.postActivityComment(act.id, text)
    if (res?.data) {
      if (!commentsData[act.id]) commentsData[act.id] = []
      commentsData[act.id].push(res.data)
      act.comments_count = res.comments_count || (act.comments_count || 0) + 1
      commentInputs[act.id] = ''
    }
  } catch (err) {
    console.error('Failed to post comment:', err)
  } finally {
    submittingComment[act.id] = false
  }
}

const deleteComment = async (act: any, commentId: number) => {
  try {
    await api.deleteActivityComment(commentId)
    if (commentsData[act.id]) {
      commentsData[act.id] = commentsData[act.id].filter(c => c.id !== commentId)
    }
    act.comments_count = Math.max(0, (act.comments_count || 1) - 1)
  } catch (err) {
    console.error('Failed to delete comment:', err)
  }
}

const { getAvatarUrl, getPosterUrl, onAvatarError, onImageError, formatYear, formatRelativeTime, getStatusLabel } = useFormatters()
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
  padding: 28px 28px 20px 28px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
}

.hero-header-top {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;
}

.hero-text {
  flex: 1;
  min-width: 280px;
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
  flex-shrink: 0;
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

/* Dual Tab Bar Switcher */
.community-tab-bar {
  display: inline-flex;
  align-items: center;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 4px;
  border-radius: 8px;
  gap: 4px;
}

.community-tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 18px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.86rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
}

.community-tab-btn .tab-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.community-tab-btn:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.05);
}

.community-tab-btn.active {
  background: var(--accent-red);
  color: #ffffff;
  box-shadow: 0 4px 14px rgba(229, 9, 20, 0.45);
}

/* Live Search Box */
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
  flex-shrink: 0;
}

.search-input {
  width: 100%;
  padding: 12px 44px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
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

/* =========================================================================
   TAB 1: ACTIVITY STREAM CARDS
   ========================================================================= */
.activity-stream-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 820px;
  margin: 0 auto;
  width: 100%;
}

.activity-card {
  padding: 18px 20px;
  border-radius: 8px;
  background: rgba(22, 22, 22, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  display: flex;
  flex-direction: column;
  gap: 14px;
  transition: all 0.25s ease;
}

.activity-card:hover {
  border-color: rgba(229, 9, 20, 0.35);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.5), 0 0 15px rgba(229, 9, 20, 0.06);
}

.activity-card-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.activity-user-link {
  text-decoration: none;
  flex-shrink: 0;
}

.activity-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(229, 9, 20, 0.15);
  border: 2px solid rgba(229, 9, 20, 0.4);
  color: #ff6b6b;
  display: grid;
  place-items: center;
  font-weight: 800;
  font-size: 1rem;
  overflow: hidden;
  transition: transform 0.2s;
  flex-shrink: 0;
}

.activity-card:hover .activity-avatar {
  transform: scale(1.05);
  border-color: var(--accent-red);
}

.activity-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.activity-user-meta {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.activity-headline {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.activity-username {
  text-decoration: none;
  color: #ffffff;
  font-weight: 800;
  font-size: 0.94rem;
  transition: color 0.15s;
}

.activity-username:hover {
  color: var(--accent-red);
}

.activity-action-label {
  color: var(--text-secondary);
  font-size: 0.84rem;
  font-weight: 500;
}

.activity-time {
  font-size: 0.72rem;
  color: var(--text-muted);
}

.edited-tag {
  font-size: 0.68rem;
  color: var(--text-muted);
  font-style: italic;
  opacity: 0.8;
}

.activity-rating-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: rgba(245, 158, 11, 0.15);
  border: 1px solid rgba(245, 158, 11, 0.4);
  color: #fbbf24;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 800;
  flex-shrink: 0;
}

.star-gold {
  color: #fbbf24;
  font-size: 0.95rem;
}

.activity-rating-badge small {
  font-size: 0.68rem;
  color: var(--text-muted);
}

.activity-media-body {
  display: flex;
  gap: 16px;
  background: rgba(0, 0, 0, 0.3);
  padding: 12px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.activity-poster-wrap {
  width: 65px;
  height: 96px;
  border-radius: 4px;
  overflow: hidden;
  flex-shrink: 0;
  background: #111;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6);
}

.activity-poster-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.activity-media-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  justify-content: center;
}

.activity-media-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.activity-media-title {
  font-size: 1.05rem;
  font-weight: 800;
  color: #ffffff;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.activity-media-badge {
  font-size: 0.62rem;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 3px;
  text-transform: uppercase;
  background: rgba(255, 255, 255, 0.1);
  color: #e5e5e5;
  letter-spacing: 0.04em;
  flex-shrink: 0;
}

.activity-media-year {
  font-size: 0.76rem;
  color: var(--text-muted);
  margin: 0;
}

.activity-review-quote {
  position: relative;
  margin-top: 4px;
  padding: 8px 12px 8px 30px;
  background: rgba(255, 255, 255, 0.04);
  border-left: 3px solid var(--accent-red);
  border-radius: 0 4px 4px 0;
}

.quote-icon {
  position: absolute;
  top: 8px;
  left: 8px;
  width: 14px;
  height: 14px;
  color: var(--accent-red);
  opacity: 0.7;
  flex-shrink: 0;
}

.activity-review-quote p {
  margin: 0;
  font-size: 0.84rem;
  font-style: italic;
  color: #e5e5e5;
  line-height: 1.45;
}

.activity-status-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 2px;
  flex-wrap: wrap;
}

.activity-status-tag {
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 2px 8px;
  border-radius: 4px;
  background: rgba(14, 165, 233, 0.2);
  color: #38bdf8;
  border: 1px solid rgba(14, 165, 233, 0.4);
}

.activity-status-tag.completed {
  background: rgba(16, 185, 129, 0.2);
  color: #34d399;
  border-color: rgba(16, 185, 129, 0.4);
}

.activity-fav-tag {
  font-size: 0.68rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 2px 8px;
  border-radius: 4px;
  background: rgba(229, 9, 20, 0.2);
  color: #ff6b6b;
  border: 1px solid rgba(229, 9, 20, 0.4);
}
/* Activity Interaction Bar (Likes & Comments) */
.activity-interaction-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-top: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.btn-interaction-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: var(--text-secondary);
  font-size: 0.8rem;
  font-weight: 700;
  padding: 6px 12px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.interaction-icon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.action-label-text {
  font-weight: 500;
  font-size: 0.74rem;
  color: var(--text-muted);
}

.btn-interaction-chip:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #ffffff;
}

.btn-interaction-chip:hover .interaction-icon {
  transform: scale(1.15);
}

.like-chip.active {
  background: rgba(229, 9, 20, 0.15);
  border-color: rgba(229, 9, 20, 0.45);
  color: #ff4b55;
}

.like-chip.active .action-label-text {
  color: #ff6b6b;
}

.comment-chip.active {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.25);
  color: #ffffff;
}

/* Comments Section Drawer */
.activity-comments-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  background: rgba(0, 0, 0, 0.2);
  margin: 0 -20px -18px -20px;
  padding: 14px 20px 18px 20px;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
}

.comments-loading {
  padding: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--text-muted);
  font-size: 0.8rem;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 280px;
  overflow-y: auto;
}

.no-comments-yet {
  padding: 10px;
  text-align: center;
  color: var(--text-muted);
  font-size: 0.78rem;
  font-style: italic;
}

.comment-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.comment-avatar-link {
  text-decoration: none;
  flex-shrink: 0;
}

.comment-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(229, 9, 20, 0.15);
  color: #ff6b6b;
  display: grid;
  place-items: center;
  font-size: 0.7rem;
  font-weight: 800;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.comment-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.comment-content-box {
  flex: 1;
  min-width: 0;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  padding: 8px 12px;
}

.comment-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 3px;
}

.comment-author {
  text-decoration: none;
  font-size: 0.8rem;
  font-weight: 800;
  color: #ffffff;
}

.comment-author:hover {
  color: var(--accent-red);
}

.comment-time {
  font-size: 0.68rem;
  color: var(--text-muted);
  margin-left: auto;
}

.btn-delete-comment {
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 0.72rem;
  cursor: pointer;
  padding: 0 4px;
}

.btn-delete-comment:hover {
  color: var(--accent-red);
}

.comment-text {
  margin: 0;
  font-size: 0.82rem;
  color: #e5e5e5;
  line-height: 1.35;
  word-break: break-word;
}

.comment-form {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}

.comment-form-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(229, 9, 20, 0.15);
  color: #ff6b6b;
  display: grid;
  place-items: center;
  font-size: 0.7rem;
  font-weight: 800;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
}

.comment-form-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.comment-input-field {
  flex: 1;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: #ffffff;
  font-size: 0.82rem;
}

.comment-input-field:focus {
  outline: none;
  border-color: var(--accent-red);
  background: rgba(255, 255, 255, 0.08);
}

.btn-submit-comment {
  padding: 8px 14px;
  background: var(--accent-red);
  color: #ffffff;
  border: none;
  border-radius: 6px;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s ease;
}

.btn-submit-comment:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-submit-comment:hover:not(:disabled) {
  background: #b80710;
}

/* =========================================================================
   TAB 2: DISCOVER CINEPHILES GRID
   ========================================================================= */
.community-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 18px;
}

.user-card {
  padding: 20px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  background: rgba(22, 22, 22, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.07);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
}

.user-card:hover {
  transform: translateY(-3px);
  border-color: rgba(229, 9, 20, 0.4);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.5), 0 0 15px rgba(229, 9, 20, 0.08);
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
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: rgba(229, 9, 20, 0.15);
  border: 2px solid rgba(229, 9, 20, 0.3);
  color: #ff6b6b;
  display: grid;
  place-items: center;
  font-weight: 800;
  font-size: 1.15rem;
  overflow: hidden;
  transition: border-color 0.2s ease, transform 0.2s ease;
  flex-shrink: 0;
}

.user-card:hover .user-avatar {
  border-color: var(--accent-red);
  transform: scale(1.04);
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
  font-size: 1.05rem;
  font-weight: 800;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: -0.02em;
  transition: color 0.2s ease;
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
  padding: 4px 10px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.08);
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.btn-follow-chip {
  background: var(--accent-red);
  border: 1px solid var(--accent-red);
  color: #ffffff;
  font-size: 0.78rem;
  font-weight: 700;
  padding: 6px 14px;
  border-radius: 20px;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
  transition: all 0.2s ease;
}

.btn-follow-chip:hover:not(:disabled) {
  background: #b80710;
  border-color: #b80710;
  transform: scale(1.03);
}

.btn-follow-chip.following {
  background: rgba(34, 197, 94, 0.15);
  border: 1px solid rgba(34, 197, 94, 0.4);
  color: #4ade80;
}

.user-bio {
  font-size: 0.86rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin: 0;
  min-height: 2.6em;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.user-bio.empty-bio {
  color: var(--text-muted);
  font-style: italic;
}

.user-stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  padding: 10px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.stat-pill {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  padding: 6px 4px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-pill strong {
  font-size: 0.96rem;
  font-weight: 800;
  color: #ffffff;
}

.stat-pill span {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
}

.btn-view-profile {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 9px 14px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  color: #e5e5e5;
  font-size: 0.82rem;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-sizing: border-box;
}

.arrow-svg-icon {
  width: 14px;
  height: 14px;
  transition: transform 0.2s ease;
  flex-shrink: 0;
}

.btn-view-profile:hover {
  background: rgba(229, 9, 20, 0.12);
  border-color: rgba(229, 9, 20, 0.4);
  color: #ffffff;
}

.btn-view-profile:hover .arrow-svg-icon {
  transform: translateX(3px);
  color: var(--accent-red);
}

/* Common State Banners */
.community-state {
  padding: 60px 24px;
  text-align: center;
  border-radius: 12px;
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

  .hero-header-top {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .community-tab-bar {
    width: 100%;
    justify-content: center;
  }

  .community-tab-btn {
    flex: 1;
    justify-content: center;
    padding: 8px 12px;
    font-size: 0.8rem;
  }

  .community-grid {
    grid-template-columns: 1fr;
  }

  .activity-card {
    padding: 14px;
  }

  .activity-poster-wrap {
    width: 54px;
    height: 80px;
  }
}
</style>
