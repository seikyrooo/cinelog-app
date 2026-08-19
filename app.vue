<template>
  <div class="app-layout">
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
import { computed, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
const { getAvatarUrl, onAvatarError } = useFormatters()

const userInitials = computed(() => {
  const name = authStore.user?.username || ''
  return name ? name.slice(0, 2).toUpperCase() : 'CL'
})

onMounted(() => {
  authStore.initAuth()
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

.user-svg-icon {
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
</style>
