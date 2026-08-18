<template>
  <section class="profile-page">
    <div class="profile-hero glass-card">
      <div class="profile-avatar" aria-hidden="true">
        <img v-if="form.avatar_url" :src="form.avatar_url" alt="" />
        <span v-else>{{ initials }}</span>
      </div>

      <div class="profile-heading">
        <p class="eyebrow">Profile Saya</p>
        <h1>{{ authStore.user?.username || 'CineLog User' }}</h1>
        <p class="muted">Atur bio, avatar URL, dan visibilitas profile publik kamu.</p>
      </div>
    </div>

    <div v-if="message" class="notice success" role="status">{{ message }}</div>
    <div v-if="error" class="notice error" role="alert">{{ error }}</div>

    <form class="profile-form glass-card" @submit.prevent="saveProfile">
      <label class="field-group">
        <span>Bio</span>
        <textarea v-model="form.bio" rows="5" maxlength="280" placeholder="Contoh: Pecinta sci-fi, slow-burn drama, dan series misteri."></textarea>
        <small>{{ form.bio.length }}/280 karakter</small>
      </label>

      <label class="field-group">
        <span>Avatar URL</span>
        <input v-model="form.avatar_url" type="url" placeholder="https://example.com/avatar.jpg" />
      </label>

      <label class="privacy-row">
        <input v-model="form.is_public" type="checkbox" />
        <span>
          <strong>Profile publik</strong>
          <small>Orang lain bisa melihat bio, favorit publik, dan rating publik kamu.</small>
        </span>
      </label>

      <div class="actions-row">
        <button class="btn-primary" type="submit" :disabled="isSaving">
          {{ isSaving ? 'Menyimpan...' : 'Simpan Profile' }}
        </button>
        <NuxtLink
          v-if="authStore.user?.username && form.is_public"
          class="btn-secondary"
          :to="`/users/${authStore.user.username}`"
        >
          Lihat Public Profile
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
    message.value = 'Profile berhasil diperbarui.'
  } catch (err: any) {
    error.value = err?.data?.error || 'Gagal memperbarui profile.'
  } finally {
    isSaving.value = false
  }
}
</script>

<style scoped>
.profile-page {
  display: grid;
  gap: 20px;
}

.profile-hero,
.profile-form {
  padding: 24px;
}

.profile-hero {
  display: flex;
  align-items: center;
  gap: 20px;
}

.profile-avatar {
  width: 84px;
  height: 84px;
  border-radius: 22px;
  background: rgba(245, 158, 11, 0.14);
  border: 1px solid rgba(245, 158, 11, 0.28);
  color: #fbbf24;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  font-weight: 900;
  font-size: 1.6rem;
  overflow: hidden;
}

.profile-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.eyebrow {
  color: var(--accent-gold);
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.profile-heading h1 {
  font-size: clamp(2rem, 4vw, 3rem);
  margin: 4px 0 6px;
}

.muted,
.field-group small,
.privacy-row small {
  color: var(--text-secondary);
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
  font-weight: 800;
}

.field-group input,
.field-group textarea {
  width: 100%;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  color: var(--text-primary);
  font: inherit;
  padding: 12px 14px;
}

.field-group input:focus,
.field-group textarea:focus {
  border-color: rgba(245, 158, 11, 0.65);
  outline: 2px solid rgba(245, 158, 11, 0.2);
}

.privacy-row {
  align-items: flex-start;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--glass-border);
  border-radius: 14px;
  display: flex;
  flex-direction: row;
  gap: 12px;
  padding: 14px;
}

.privacy-row input {
  margin-top: 3px;
}

.actions-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 4px;
}

.notice {
  border-radius: 12px;
  font-weight: 700;
  padding: 12px 14px;
}

.notice.success {
  background: rgba(16, 185, 129, 0.14);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: #6ee7b7;
}

.notice.error {
  background: rgba(239, 68, 68, 0.14);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #fca5a5;
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

@media (max-width: 640px) {
  .profile-hero {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>