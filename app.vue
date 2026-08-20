<template>
  <div class="app-layout">
    <!-- Top-Edge Micro Progress Bar (Impeccable Netflix Red Theme) -->
    <NuxtLoadingIndicator color="#E50914" :height="3" :duration="2000" :throttle="50" />

    <!-- Navbar Header -->
    <header class="navbar-header glass-panel">
      <div class="nav-container">
        <NuxtLink to="/" class="brand">
          <svg class="brand-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="3" ry="3"></rect>
            <line x1="7" y1="2" x2="7" y2="22"></line>
            <line x1="17" y1="2" x2="17" y2="22"></line>
            <line x1="2" y1="12" x2="22" y2="12"></line>
            <line x1="2" y1="7" x2="7" y2="7"></line>
            <line x1="2" y1="17" x2="7" y2="17"></line>
            <line x1="17" y1="17" x2="22" y2="17"></line>
            <line x1="17" y1="7" x2="22" y2="7"></line>
          </svg>
          <span class="brand-name">CINE<span class="brand-log-badge">LOG</span></span>
        </NuxtLink>

        <nav class="nav-links">
          <NuxtLink to="/" class="nav-item" active-class="active">
            <svg class="nav-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <span>Explore</span>
          </NuxtLink>
          <NuxtLink to="/watchlist" class="nav-item" active-class="active">
            <svg class="nav-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
            </svg>
            <span>Watchlist</span>
          </NuxtLink>
          <NuxtLink to="/community" class="nav-item" active-class="active">
            <svg class="nav-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            <span>Community</span>
          </NuxtLink>
          <NuxtLink v-if="authStore.isAuth" to="/profile" class="nav-item" active-class="active">
            <svg class="nav-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span>Profile</span>
          </NuxtLink>
        </nav>

        <div class="auth-actions">
          <template v-if="authStore.isAuth">
            <!-- Notification Bell Icon with Dropdown -->
            <div class="notif-wrapper" ref="notifWrapperRef">
              <button 
                @click="toggleNotifDropdown" 
                :class="['notif-bell-btn', { active: showNotifDropdown, has_unread: unreadNotifCount > 0 }]"
                title="Notifications"
              >
                <svg class="bell-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                <span v-if="unreadNotifCount > 0" class="notif-badge-pill">
                  {{ unreadNotifCount > 99 ? '99+' : unreadNotifCount }}
                </span>
              </button>

              <!-- Notifications Dropdown Popover -->
              <div v-if="showNotifDropdown" class="notif-dropdown glass-card animate-fade-in">
                <div class="notif-dropdown-header">
                  <div class="notif-header-title">
                    <span class="notif-title-text">Notifications</span>
                    <span v-if="unreadNotifCount > 0" class="notif-unread-tag">{{ unreadNotifCount }} new</span>
                  </div>
                  <button 
                    v-if="unreadNotifCount > 0" 
                    @click="markAllAsRead" 
                    class="btn-mark-all-read"
                  >
                    Mark all read
                  </button>
                </div>

                <div v-if="isLoadingNotifs" class="notif-loading">
                  <div class="spinner-mini"></div>
                  <span>Loading updates...</span>
                </div>

                <div v-else-if="notifications.length === 0" class="notif-empty">
                  <svg class="empty-bell-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                  </svg>
                  <p>No notifications yet</p>
                  <small>When others like or comment on your watch activity, you'll see it here.</small>
                </div>

                <div v-else class="notif-list-scroll">
                  <div 
                    v-for="item in notifications" 
                    :key="'notif-' + item.id"
                    @click="handleNotificationClick(item)"
                    :class="['notif-item', { unread: !item.is_read }]"
                  >
                    <div class="notif-actor-avatar">
                      <img 
                        v-if="item.actor?.avatar_url" 
                        :src="getAvatarUrl(item.actor.avatar_url)" 
                        :alt="item.actor?.username || 'User'"
                        @error="onAvatarError"
                      />
                      <span v-else>{{ (item.actor?.username || 'C').slice(0, 1).toUpperCase() }}</span>
                      
                      <!-- Action Icon Mini Badge -->
                      <span :class="['notif-type-badge', item.type]">
                        <span v-if="item.type === 'like'">❤️</span>
                        <span v-else-if="item.type === 'comment'">💬</span>
                        <span v-else>👥</span>
                      </span>
                    </div>

                    <div class="notif-item-body">
                      <p class="notif-item-message">{{ item.message }}</p>
                      <span class="notif-item-time">{{ formatRelativeTime(item.created_at) }}</span>
                    </div>

                    <span v-if="!item.is_read" class="notif-unread-dot"></span>
                  </div>
                </div>
              </div>
            </div>

            <NuxtLink to="/profile" class="user-badge" title="Go to Profile Settings">
              <div class="user-avatar-mini">
                <img 
                  v-if="authStore.user?.avatar_url" 
                  :src="getAvatarUrl(authStore.user.avatar_url)" 
                  :alt="authStore.user?.username || 'User'"
                  @error="onAvatarError"
                />
                <span v-else>{{ userInitials }}</span>
              </div>
              <span class="user-name-text">{{ authStore.user?.username || `User #${authStore.userId}` }}</span>
            </NuxtLink>
            <button @click="handleLogout" class="btn-secondary text-sm">
              <svg class="nav-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              <span>Log Out</span>
            </button>
          </template>
          <template v-else>
            <NuxtLink to="/login" class="btn-secondary text-sm">Sign In</NuxtLink>
            <NuxtLink to="/register" class="btn-primary text-sm">Sign Up</NuxtLink>
          </template>
        </div>
      </div>
    </header>

    <!-- Main Content Container -->
    <main class="main-content">
      <NuxtPage />
    </main>

    <!-- Footer -->
    <footer class="footer glass-panel">
      <p>© 2026 CineLog — Film & TV Show Tracking Platform. Powered by TMDB.</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
const api = useApi()
const { getAvatarUrl, onAvatarError, formatRelativeTime } = useFormatters()

const userInitials = computed(() => {
  const name = authStore.user?.username || ''
  return name ? name.slice(0, 2).toUpperCase() : 'CL'
})

const notifWrapperRef = ref<HTMLElement | null>(null)
const showNotifDropdown = ref(false)
const unreadNotifCount = ref(0)
const notifications = ref<any[]>([])
const isLoadingNotifs = ref(false)
let pollTimer: any = null

const toggleNotifDropdown = async () => {
  showNotifDropdown.value = !showNotifDropdown.value
  if (showNotifDropdown.value) {
    await loadNotifications()
  }
}

const loadUnreadCount = async () => {
  if (!authStore.isAuth) return
  try {
    const res = await api.getUnreadNotificationCount()
    if (res && typeof res.unread_count === 'number') {
      unreadNotifCount.value = res.unread_count
    }
  } catch {}
}

const loadNotifications = async () => {
  if (!authStore.isAuth) return
  isLoadingNotifs.value = true
  try {
    const res = await api.getNotifications()
    if (res?.data) {
      notifications.value = res.data
      unreadNotifCount.value = res.unread_count || 0
    }
  } catch (err) {
    console.error('Failed to load notifications:', err)
  } finally {
    isLoadingNotifs.value = false
  }
}

const markAllAsRead = async () => {
  try {
    await api.markAllNotificationsAsRead()
    unreadNotifCount.value = 0
    notifications.value.forEach(n => { n.is_read = true })
  } catch (err) {
    console.error('Failed to mark notifications read:', err)
  }
}

const handleNotificationClick = async (item: any) => {
  if (!item.is_read) {
    try {
      await api.markNotificationAsRead(item.id)
      item.is_read = true
      unreadNotifCount.value = Math.max(0, unreadNotifCount.value - 1)
    } catch {}
  }
  showNotifDropdown.value = false
  useRouter().push('/community')
}

const handleClickOutside = (e: MouseEvent) => {
  if (notifWrapperRef.value && !notifWrapperRef.value.contains(e.target as Node)) {
    showNotifDropdown.value = false
  }
}

onMounted(() => {
  authStore.initAuth()
  loadUnreadCount()
  document.addEventListener('click', handleClickOutside)
  // Poll notifications every 30s
  pollTimer = setInterval(() => {
    loadUnreadCount()
  }, 30000)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
  if (pollTimer) clearInterval(pollTimer)
})

const handleLogout = () => {
  authStore.logout()
  useRouter().push('/login')
}
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-primary);
}

.navbar-header {
  position: sticky;
  top: 0;
  z-index: 50;
  padding: 14px 28px;
  background: rgba(20, 20, 20, 0.95);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

.nav-container {
  max-width: 1240px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.brand {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  font-size: 1.4rem;
  font-weight: 900;
  color: #ffffff;
  letter-spacing: -0.03em;
}

.brand-name {
  font-family: var(--font-heading);
  letter-spacing: -0.04em;
  font-weight: 900;
}

.brand-svg-icon {
  width: 22px;
  height: 22px;
  color: var(--accent-red);
}

.nav-links {
  display: flex;
  gap: 6px;
}

.nav-item {
  color: var(--text-secondary);
  text-decoration: none;
  font-weight: 600;
  font-size: 0.88rem;
  padding: 6px 14px;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  transition: all 0.2s ease;
}

.nav-svg-icon {
  width: 15px;
  height: 15px;
}

.nav-item:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.05);
}

.nav-item.active {
  color: #ffffff;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.1);
}

.auth-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* Notification Bell & Dropdown Popover */
.notif-wrapper {
  position: relative;
}

.notif-bell-btn {
  position: relative;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-subtle);
  color: var(--text-secondary);
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.notif-bell-btn:hover,
.notif-bell-btn.active {
  background: rgba(229, 9, 20, 0.12);
  border-color: rgba(229, 9, 20, 0.4);
  color: #ffffff;
}

.notif-bell-btn.has_unread {
  color: #ffffff;
}

.bell-svg-icon {
  width: 17px;
  height: 17px;
}

.notif-badge-pill {
  position: absolute;
  top: -4px;
  right: -4px;
  background: var(--accent-red);
  color: #ffffff;
  font-size: 0.65rem;
  font-weight: 900;
  padding: 1px 5px;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(229, 9, 20, 0.8);
  border: 2px solid var(--bg-primary);
  line-height: 1.2;
}

.notif-dropdown {
  position: absolute;
  top: calc(100% + 12px);
  right: 0;
  width: 340px;
  background: rgba(20, 20, 20, 0.96);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.7), 0 0 20px rgba(229, 9, 20, 0.08);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  overflow: hidden;
  z-index: 100;
}

.notif-dropdown-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.02);
}

.notif-header-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.notif-title-text {
  font-weight: 800;
  font-size: 0.92rem;
  color: #ffffff;
}

.notif-unread-tag {
  font-size: 0.68rem;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 10px;
  background: rgba(229, 9, 20, 0.2);
  color: #ff6b6b;
  border: 1px solid rgba(229, 9, 20, 0.4);
}

.btn-mark-all-read {
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: color 0.15s;
}

.btn-mark-all-read:hover {
  color: var(--accent-red);
}

.notif-loading {
  padding: 30px 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: var(--text-muted);
  font-size: 0.85rem;
}

.spinner-mini {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-top-color: var(--accent-red);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.notif-empty {
  padding: 36px 20px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.empty-bell-icon {
  width: 32px;
  height: 32px;
  color: var(--text-muted);
  opacity: 0.6;
}

.notif-empty p {
  margin: 0;
  font-weight: 700;
  font-size: 0.9rem;
  color: #ffffff;
}

.notif-empty small {
  font-size: 0.75rem;
  color: var(--text-muted);
  line-height: 1.4;
}

.notif-list-scroll {
  max-height: 380px;
  overflow-y: auto;
}

.notif-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  cursor: pointer;
  transition: background 0.15s ease;
  position: relative;
}

.notif-item:hover {
  background: rgba(255, 255, 255, 0.04);
}

.notif-item.unread {
  background: rgba(229, 9, 20, 0.05);
}

.notif-actor-avatar {
  position: relative;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(229, 9, 20, 0.15);
  color: #ff6b6b;
  display: grid;
  place-items: center;
  font-weight: 800;
  font-size: 0.85rem;
  flex-shrink: 0;
  overflow: visible;
}

.notif-actor-avatar img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.notif-type-badge {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #181818;
  display: grid;
  place-items: center;
  font-size: 0.6rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.notif-item-body {
  flex: 1;
  min-width: 0;
}

.notif-item-message {
  margin: 0 0 3px 0;
  font-size: 0.82rem;
  color: #e5e5e5;
  line-height: 1.35;
  word-break: break-word;
}

.notif-item.unread .notif-item-message {
  color: #ffffff;
  font-weight: 600;
}

.notif-item-time {
  font-size: 0.7rem;
  color: var(--text-muted);
}

.notif-unread-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent-red);
  box-shadow: 0 0 6px var(--accent-red);
  margin-top: 6px;
  flex-shrink: 0;
}

.user-badge {
  font-size: 0.84rem;
  font-weight: 600;
  color: #ffffff;
  text-decoration: none;
  background: rgba(255, 255, 255, 0.05);
  padding: 4px 10px 4px 5px;
  border-radius: 20px;
  border: 1px solid var(--border-subtle);
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.user-avatar-mini {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  overflow: hidden;
  background: rgba(229, 9, 20, 0.15);
  color: #ff6b6b;
  display: grid;
  place-items: center;
  font-size: 0.65rem;
  font-weight: 800;
  flex-shrink: 0;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.user-avatar-mini img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-name-text {
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-badge:hover {
  border-color: rgba(229, 9, 20, 0.5);
  background: rgba(229, 9, 20, 0.08);
  color: #ffffff;
}

.main-content {
  flex: 1;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 28px 24px 48px;
}

.footer {
  text-align: center;
  padding: 24px;
  margin-top: auto;
  font-size: 0.82rem;
  color: var(--text-muted);
  border-top: 1px solid var(--border-subtle);
}

.text-sm {
  font-size: 0.85rem;
  padding: 8px 16px;
}

@media (max-width: 640px) {
  .notif-dropdown {
    width: 290px;
    right: -50px;
  }
}
</style>
