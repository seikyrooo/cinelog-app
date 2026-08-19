<template>
  <div class="error-page-wrapper">
    <div class="error-card glass-card animate-fade-in">
      <div class="error-badge">{{ error?.statusCode || 500 }}</div>
      <h1 class="error-title">{{ errorTitle }}</h1>
      <p class="error-desc">{{ errorDescription }}</p>
      
      <div class="error-actions">
        <button class="btn-primary" @click="handleClearError">
          Back to Explore
        </button>
        <button class="btn-secondary" @click="reloadPage">
          Refresh Page
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  error: {
    type: Object,
    default: () => ({ statusCode: 500, message: 'An unexpected error occurred.' })
  }
})

const errorTitle = computed(() => {
  if (props.error?.statusCode === 404) return 'Lost Your Way?'
  return 'Something Went Wrong'
})

const errorDescription = computed(() => {
  if (props.error?.statusCode === 404) {
    return "We couldn't find the page you were looking for. Let's get you back to browsing movies and TV series."
  }
  return props.error?.message || "An unexpected error occurred while loading this page. Please try refreshing or return to explore."
})

const handleClearError = () => {
  clearError({ redirect: '/' })
}

const reloadPage = () => {
  if (typeof window !== 'undefined') {
    window.location.reload()
  }
}
</script>

<style scoped>
.error-page-wrapper {
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
}

.error-card {
  max-width: 480px;
  width: 100%;
  text-align: center;
  padding: 40px 32px;
  border-radius: 12px;
  background: rgba(24, 24, 24, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.6);
}

.error-badge {
  display: inline-block;
  font-size: 2.75rem;
  font-weight: 800;
  letter-spacing: -0.04em;
  color: var(--accent-red);
  margin-bottom: 8px;
}

.error-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 12px;
}

.error-desc {
  font-size: 0.9rem;
  color: #a3a3a3;
  line-height: 1.5;
  margin-bottom: 28px;
}

.error-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

@media (max-width: 540px) {
  .error-actions {
    flex-direction: column;
  }
}
</style>
