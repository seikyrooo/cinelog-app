<template>
  <section class="profile-page">
    <div class="profile-hero glass-card">
      <div class="profile-avatar" aria-hidden="true">
        <img v-if="form.avatar_url" :src="form.avatar_url" alt="" />
        <span v-else>{{ initials }}</span>
      </div>

      <div class="profile-heading">
        <h1>{{ authStore.user?.username || 'CineLog User' }}</h1>
        <p class="muted">Manage your bio, avatar, and public profile visibility.</p>
      </div>
    </div>

    <div v-if="message" class="notice success" role="status">{{ message }}</div>
    <div v-if="error" class="notice error" role="alert">{{ error }}</div>

    <form class="profile-form glass-card" @submit.prevent="saveProfile">
      <label class="field-group">
        <span>Bio</span>
        <textarea v-model="form.bio" rows="4" maxlength="280" placeholder="e.g., Cinephile, sci-fi enthusiast, drama series lover."></textarea>
        <small>{{ form.bio.length }}/280 characters</small>
      </label>

      <label class="field-group">
        <span>Avatar URL</span>
        <input v-model="form.avatar_url" type="url" placeholder="https://example.com/avatar.jpg" />
      </label>

      <label class="privacy-row">
        <input v-model="form.is_public" type="checkbox" />
        <span>
          <strong>Public Profile</strong>
          <small>Allow other users to view your bio, public favorites, and ratings.</small>
        </span>
      </label>

      <div class="actions-row">
        <button class="btn-primary" type="submit" :disabled="isSaving">
          {{ isSaving ? 'Saving...' : 'Save Profile' }}
        </button>
        <NuxtLink
          v-if="authStore.user?.username && form.is_public"
          class="btn-secondary"
          :to="`/users/${authStore.user.username}`"
        >
          View Public Profile
        </NuxtLink>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
const api = useApi()
const router = useRouter()

const isSaving = ref(false)
const message = ref('')
const error = ref('')
const form = reactive({
  bio: '',
  avatar_url: '',
  is_public: true
})

const initials = computed(() => (authStore.user?.username || 'CL').slice(0, 2).toUpperCase())

const hydrateForm = () => {
  form.bio = authStore.user?.bio || ''
  form.avatar_url = authStore.user?.avatar_url || ''
  form.is_public = authStore.user?.is_public ?? true
}

onMounted(async () => {
  authStore.initAuth()
  if (!authStore.isAuth) {
    router.push('/login')
    return
  }

  hydrateForm()
  try {
    const res = await api.getMe()
    authStore.setUser(res.data)
    hydrateForm()
  } catch (err) {
    console.error(err)
  }
})

const saveProfile = async () => {
  isSaving.value = true
  message.value = ''
  error.value = ''

  try {
    const res = await api.updateMe({
      bio: form.bio,
      avatar_url: form.avatar_url,
      is_public: form.is_public
    })
    authStore.setUser(res.data)
    message.value = 'Profile saved successfully.'
  } catch (err: any) {
    error.value = err?.data?.error || 'Failed to save profile.'
  } finally {
    isSaving.value = false
  }
}
</script>

<style scoped>
.profile-page {
  display: grid;
  gap: 20px;
  max-width: 760px;
  margin: 0 auto;
}

.profile-hero,
.profile-form {
  padding: 24px;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
}

.profile-hero {
  display: flex;
  align-items: center;
  gap: 20px;
}

.profile-avatar {
  width: 76px;
  height: 76px;
  border-radius: 14px;
  background: rgba(229, 9, 20, 0.12);
  border: 1px solid var(--border-red);
  color: #ff6b6b;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  font-weight: 800;
  font-size: 1.5rem;
  overflow: hidden;
}

.profile-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-heading h1 {
  font-size: 1.6rem;
  margin: 0 0 4px;
  color: #ffffff;
}

.muted,
.field-group small,
.privacy-row small {
  color: var(--text-secondary);
  font-size: 0.84rem;
}

.profile-form,
.field-group,
.privacy-row span {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-group span,
.privacy-row strong {
  font-weight: 700;
  font-size: 0.88rem;
  color: #ffffff;
}

.field-group input,
.field-group textarea {
  width: 100%;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  color: var(--text-primary);
  font: inherit;
  font-size: 0.9rem;
  padding: 10px 14px;
  transition: all 0.2s ease;
}

.field-group input:focus,
.field-group textarea:focus {
  border-color: var(--accent-red) !important;
  background: rgba(255, 255, 255, 0.07);
  box-shadow: 0 0 0 3px var(--accent-red-subtle) !important;
}

.privacy-row {
  align-items: flex-start;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--border-subtle);
  border-radius: 10px;
  display: flex;
  flex-direction: row;
  gap: 12px;
  padding: 14px;
}

.privacy-row input {
  margin-top: 3px;
  accent-color: var(--accent-red);
}

.actions-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 8px;
}

.notice {
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.88rem;
  padding: 12px 14px;
}

.notice.success {
  background: rgba(34, 197, 94, 0.12);
  border: 1px solid rgba(34, 197, 94, 0.3);
  color: #4ade80;
}

.notice.error {
  background: rgba(229, 9, 20, 0.12);
  border: 1px solid rgba(229, 9, 20, 0.3);
  color: #ff6b6b;
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

@media (max-width: 640px) {
  .profile-hero {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>