<template>
  <section class="profile-page">
    <div class="profile-hero glass-card">
      <div class="avatar-upload-zone" @click="triggerFileInput" @dragover.prevent="isDragging = true" @dragleave.prevent="isDragging = false" @drop.prevent="handleFileDrop" :class="{ dragging: isDragging }">
        <div class="profile-avatar" aria-hidden="true">
          <img v-if="avatarPreview || form.avatar_url" :src="getAvatarUrl(avatarPreview || form.avatar_url)" alt="User Avatar" />
          <span v-else>{{ initials }}</span>
        </div>
        <div class="avatar-overlay">
          <svg class="camera-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
            <circle cx="12" cy="13" r="4"></circle>
          </svg>
          <span class="upload-label">{{ isUploadingAvatar ? 'Uploading...' : 'Change Photo' }}</span>
        </div>
        <input ref="fileInputRef" type="file" accept="image/png,image/jpeg,image/webp,image/gif" class="hidden-file-input" @change="handleFileSelect" />
      </div>

      <div class="profile-heading">
        <div class="profile-title-row">
          <h1>@{{ authStore.user?.username || 'CineLog User' }}</h1>
          <span :class="['privacy-badge', form.is_public ? 'public' : 'private']">
            {{ form.is_public ? 'Public Profile' : 'Private' }}
          </span>
        </div>
        <p class="muted">Manage your bio, avatar picture, and public profile visibility.</p>
      </div>
    </div>

    <div v-if="message" class="notice success animate-fade-in" role="status">{{ message }}</div>
    <div v-if="error" class="notice error animate-fade-in" role="alert">{{ error }}</div>

    <form class="profile-form glass-card" @submit.prevent="saveProfile">
      <div class="field-group">
        <label for="bio-input">Bio</label>
        <textarea id="bio-input" v-model="form.bio" rows="4" maxlength="280" placeholder="e.g., Film enthusiast, binge-watching thriller series, sci-fi lover."></textarea>
        <div class="char-count-row">
          <small>{{ form.bio.length }}/280 characters</small>
        </div>
      </div>

      <div class="field-group">
        <label for="avatar-url-input">Or External Avatar URL (Optional)</label>
        <input id="avatar-url-input" v-model="form.avatar_url" type="url" placeholder="https://example.com/avatar.webp" />
        <small class="hint-text">You can upload a file directly above, or enter an external image URL here.</small>
      </div>

      <label class="privacy-row">
        <input v-model="form.is_public" type="checkbox" />
        <span>
          <strong>Public Profile Visibility</strong>
          <small>Allow other CineLog users to explore your profile, public favorites, ratings, and stats.</small>
        </span>
      </label>

      <div class="actions-row">
        <button class="btn-primary" type="submit" :disabled="isSaving || isUploadingAvatar">
          <span v-if="isSaving">Saving Profile...</span>
          <span v-else>Save Changes</span>
        </button>
        <NuxtLink
          v-if="authStore.user?.username && form.is_public"
          class="btn-secondary"
          :to="`/users/${authStore.user.username}`"
        >
          View Public Profile ↗
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
const isUploadingAvatar = ref(false)
const isDragging = ref(false)
const message = ref('')
const error = ref('')
const fileInputRef = ref<HTMLInputElement | null>(null)
const avatarPreview = ref('')

const form = reactive({
  bio: '',
  avatar_url: '',
  is_public: true
})

const initials = computed(() => (authStore.user?.username || 'CL').slice(0, 2).toUpperCase())

const getAvatarUrl = (path?: string) => {
  if (!path) return ''
  if (path.startsWith('blob:') || path.startsWith('http://') || path.startsWith('https://')) return path
  if (path.startsWith('/uploads/') || path.startsWith('uploads/')) return useApiUrl(path)
  return path
}

const triggerFileInput = () => {
  if (fileInputRef.value) {
    fileInputRef.value.click()
  }
}

const handleFileSelect = async (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files[0]) {
    await uploadAvatarFile(target.files[0])
  }
}

const handleFileDrop = async (e: DragEvent) => {
  isDragging.value = false
  if (e.dataTransfer?.files && e.dataTransfer.files[0]) {
    await uploadAvatarFile(e.dataTransfer.files[0])
  }
}

const uploadAvatarFile = async (file: File) => {
  if (!file.type.startsWith('image/')) {
    error.value = 'Please select a valid image file (JPG, PNG, WEBP, GIF).'
    return
  }
  if (file.size > 5 * 1024 * 1024) {
    error.value = 'Image size must be less than 5MB.'
    return
  }

  avatarPreview.value = URL.createObjectURL(file)
  isUploadingAvatar.value = true
  message.value = ''
  error.value = ''

  try {
    const formData = new FormData()
    formData.append('avatar', file)

    const res = await api.uploadAvatar(formData)
    if (res.data) {
      authStore.setUser(res.data)
      form.avatar_url = res.data.avatar_url || ''
      message.value = 'Avatar uploaded successfully!'
    }
  } catch (err: any) {
    console.error(err)
    error.value = err?.data?.error || 'Failed to upload avatar image.'
  } finally {
    isUploadingAvatar.value = false
  }
}

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
    message.value = 'Profile updated successfully!'
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
  gap: 24px;
  max-width: 760px;
  margin: 0 auto;
  padding: 0 4px;
}

.profile-hero,
.profile-form {
  padding: 28px;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: 14px;
}

.profile-hero {
  display: flex;
  align-items: center;
  gap: 24px;
}

.avatar-upload-zone {
  position: relative;
  width: 88px;
  height: 88px;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  flex-shrink: 0;
  border: 2px dashed rgba(255, 255, 255, 0.18);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.avatar-upload-zone:hover,
.avatar-upload-zone.dragging {
  border-color: var(--accent-red);
  transform: scale(1.03);
}

.profile-avatar {
  width: 100%;
  height: 100%;
  background: rgba(229, 9, 20, 0.12);
  color: #ff6b6b;
  display: grid;
  place-items: center;
  font-weight: 800;
  font-size: 1.6rem;
}

.profile-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s ease;
  color: #ffffff;
}

.avatar-upload-zone:hover .avatar-overlay {
  opacity: 1;
}

.camera-icon {
  width: 22px;
  height: 22px;
}

.upload-label {
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  text-align: center;
}

.hidden-file-input {
  display: none;
}

.profile-heading {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.profile-title-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.profile-title-row h1 {
  font-size: 1.6rem;
  font-weight: 800;
  margin: 0;
  color: #ffffff;
}

.privacy-badge {
  font-size: 0.72rem;
  font-weight: 800;
  padding: 3px 10px;
  border-radius: 6px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.privacy-badge.public {
  background: rgba(34, 197, 94, 0.12);
  color: #4ade80;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.privacy-badge.private {
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-muted);
  border: 1px solid var(--border-subtle);
}

.muted {
  color: var(--text-secondary);
  font-size: 0.86rem;
  margin: 0;
}

.profile-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-group label {
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
  padding: 12px 14px;
  transition: all 0.2s ease;
}

.field-group input:focus,
.field-group textarea:focus {
  border-color: var(--accent-red) !important;
  background: rgba(255, 255, 255, 0.07);
  box-shadow: 0 0 0 3px var(--accent-red-subtle) !important;
  outline: none;
}

.char-count-row {
  display: flex;
  justify-content: flex-end;
}

.char-count-row small,
.hint-text {
  color: var(--text-muted);
  font-size: 0.8rem;
}

.privacy-row {
  align-items: flex-start;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--border-subtle);
  border-radius: 10px;
  display: flex;
  flex-direction: row;
  gap: 14px;
  padding: 16px;
  cursor: pointer;
}

.privacy-row input {
  margin-top: 3px;
  accent-color: var(--accent-red);
  width: 18px;
  height: 18px;
}

.privacy-row span {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.privacy-row strong {
  font-weight: 700;
  font-size: 0.9rem;
  color: #ffffff;
}

.privacy-row small {
  color: var(--text-secondary);
  font-size: 0.82rem;
}

.actions-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 6px;
}

.notice {
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.88rem;
  padding: 12px 16px;
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