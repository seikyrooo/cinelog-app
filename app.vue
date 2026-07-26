<template>
  <div class="app-layout">
    <!-- Navbar Header -->
    <header class="navbar-header glass-panel">
      <div class="nav-container">
        <NuxtLink to="/" class="brand">
          <svg class="brand-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect>
            <line x1="7" y1="2" x2="7" y2="22"></line>
            <line x1="17" y1="2" x2="17" y2="22"></line>
            <line x1="2" y1="12" x2="22" y2="12"></line>
            <line x1="2" y1="7" x2="7" y2="7"></line>
            <line x1="2" y1="17" x2="7" y2="17"></line>
            <line x1="17" y1="17" x2="22" y2="17"></line>
            <line x1="17" y1="7" x2="22" y2="7"></line>
          </svg>
          <span class="brand-name">Cine<span class="gradient-text">Log</span></span>
        </NuxtLink>

        <nav class="nav-links">
          <NuxtLink to="/" class="nav-item" active-class="active">
            <svg class="nav-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <span>Eksplor</span>
          </NuxtLink>
          <NuxtLink to="/watchlist" class="nav-item" active-class="active">
            <svg class="nav-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
            </svg>
            <span>Watchlist Saya</span>
          </NuxtLink>
        </nav>

        <div class="auth-actions">
          <template v-if="authStore.isAuth">
            <span class="user-badge">
              <svg class="user-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <span>{{ authStore.user?.username || 'Member' }}</span>
            </span>
            <button @click="handleLogout" class="btn-secondary text-sm">
              <svg class="nav-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              <span>Logout</span>
            </button>
          </template>
          <template v-else>
            <NuxtLink to="/login" class="btn-secondary text-sm">Login</NuxtLink>
            <NuxtLink to="/register" class="btn-primary text-sm">Daftar</NuxtLink>
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
      <p>© 2026 CineLog — Film & Series Tracker dengan TMDB Engine & VPS Auto Sync</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()

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
}

.navbar-header {
  position: sticky;
  top: 0;
  z-index: 50;
  padding: 14px 24px;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  font-size: 1.5rem;
  font-weight: 800;
  color: #fff;
}

.brand-svg-icon {
  width: 28px;
  height: 28px;
  color: var(--accent-gold);
}

.nav-links {
  display: flex;
  gap: 12px;
}

.nav-item {
  color: var(--text-secondary);
  text-decoration: none;
  font-weight: 700;
  font-size: 0.9rem;
  padding: 8px 18px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.nav-svg-icon {
  width: 18px;
  height: 18px;
}

.user-svg-icon {
  width: 16px;
  height: 16px;
}

.nav-item:hover, .nav-item.active {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.08);
}

.auth-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-badge {
  font-size: 0.85rem;
  font-weight: 700;
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.12);
  padding: 6px 14px;
  border-radius: 20px;
  border: 1px solid rgba(56, 189, 248, 0.25);
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.main-content {
  flex: 1;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 32px 24px;
}

.footer {
  text-align: center;
  padding: 20px;
  margin-top: auto;
  font-size: 0.85rem;
  color: var(--text-muted);
}

.text-sm {
  font-size: 0.85rem;
  padding: 8px 16px;
}
</style>
