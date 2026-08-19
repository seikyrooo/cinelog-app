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
            <span>Eksplor</span>
          </NuxtLink>
          <NuxtLink to="/watchlist" class="nav-item" active-class="active">
            <svg class="nav-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
            </svg>
            <span>Watchlist</span>
          </NuxtLink>
          <NuxtLink v-if="authStore.isAuth" to="/profile" class="nav-item" active-class="active">
            <svg class="nav-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span>Profil</span>
          </NuxtLink>
        </nav>

        <div class="auth-actions">
          <template v-if="authStore.isAuth">
            <NuxtLink to="/profile" class="user-badge">
              <svg class="user-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <span>{{ authStore.user?.username || `User #${authStore.userId}` }}</span>
            </NuxtLink>
            <button @click="handleLogout" class="btn-secondary text-sm">
              <svg class="nav-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              <span>Keluar</span>
            </button>
          </template>
          <template v-else>
            <NuxtLink to="/login" class="btn-secondary text-sm">Masuk</NuxtLink>
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
      <p>© 2026 CineLog — Film & TV Show Tracking Platform. Powered by TMDB.</p>
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
  background-color: var(--bg-primary);
}

.navbar-header {
  position: sticky;
  top: 0;
  z-index: 50;
  padding: 12px 24px;
  background: rgba(10, 10, 12, 0.92);
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
  gap: 8px;
  text-decoration: none;
  font-size: 1.35rem;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: -0.02em;
}

.brand-svg-icon {
  width: 24px;
  height: 24px;
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
  padding: 8px 16px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  transition: all 0.18s ease;
}

.nav-svg-icon {
  width: 16px;
  height: 16px;
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
  background: var(--accent-red-subtle);
  border: 1px solid var(--border-red);
}

.auth-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-badge {
  font-size: 0.85rem;
  font-weight: 600;
  color: #ffffff;
  text-decoration: none;
  background: rgba(255, 255, 255, 0.05);
  padding: 7px 14px;
  border-radius: 8px;
  border: 1px solid var(--border-subtle);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
}

.user-badge:hover {
  border-color: var(--border-red);
  color: var(--accent-red);
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
