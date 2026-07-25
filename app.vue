<template>
  <div class="app-layout">
    <!-- Navbar Header -->
    <header class="navbar-header glass-panel">
      <div class="nav-container">
        <NuxtLink to="/" class="brand">
          <span class="brand-icon">🎬</span>
          <span class="brand-name">Cine<span class="gradient-text">Log</span></span>
        </NuxtLink>

        <nav class="nav-links">
          <NuxtLink to="/" class="nav-item" active-class="active">
            🔍 Cari Film & TV
          </NuxtLink>
          <NuxtLink to="/watchlist" class="nav-item" active-class="active">
            ⭐ List Saya
          </NuxtLink>
        </nav>

        <div class="auth-actions">
          <template v-if="authStore.isAuth">
            <span class="user-badge">👤 Logged In</span>
            <button @click="handleLogout" class="btn-secondary text-sm">
              Logout
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
      <p>© 2026 CineLog — Film & Series Tracker dengan Auto VPS Backup Storage</p>
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
  gap: 8px;
  text-decoration: none;
  font-size: 1.5rem;
  font-weight: 800;
  color: #fff;
}

.brand-icon {
  font-size: 1.8rem;
}

.nav-links {
  display: flex;
  gap: 20px;
}

.nav-item {
  color: var(--text-secondary);
  text-decoration: none;
  font-weight: 600;
  padding: 8px 16px;
  border-radius: 10px;
  transition: all 0.2s ease;
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
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.15);
  padding: 6px 12px;
  border-radius: 20px;
  border: 1px solid rgba(56, 189, 248, 0.3);
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
