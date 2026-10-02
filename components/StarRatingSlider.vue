<template>
  <div 
    class="star-slider-container"
    :class="[`size-${size}`, { 'is-readonly': readonly, 'is-sliding': isInteracting }]"
    @mouseleave="onMouseLeave"
  >
    <!-- Live Header & Score Display -->
    <div class="star-slider-header" v-if="showScore">
      <div class="score-badge-wrap">
        <span 
          class="score-pill" 
          :class="{ 'has-score': activeScore > 0, 'is-preview': isInteracting }"
        >
          <svg class="score-pill-star" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          <span class="score-number" v-if="activeScore > 0">
            {{ formatScore(activeScore) }}
          </span>
          <span class="score-max" v-if="activeScore > 0">/10</span>
          <span class="score-empty-text" v-else>Slide or click to rate</span>
        </span>

        <span class="sentiment-tag" v-if="showSentiment && activeScore > 0">
          {{ getSentiment(activeScore) }}
        </span>
      </div>

      <!-- Clear Rating Action -->
      <button 
        v-if="allowClear && !readonly && modelValue > 0"
        type="button"
        @click.stop="clearRating"
        class="btn-clear-score"
        title="Clear rating score (reset to 0)"
        aria-label="Clear rating"
      >
        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
        <span>Reset</span>
      </button>
    </div>

    <!-- Star Track Wrapper -->
    <div 
      ref="trackRef"
      class="star-track"
      role="slider"
      :aria-valuemin="0"
      :aria-valuemax="10"
      :aria-valuenow="modelValue"
      :aria-label="ariaLabel || 'Rating from 0 to 10'"
      tabindex="0"
      @keydown="onKeyDown"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerCancel"
    >
      <!-- Hidden SVG Defs for Gradients and Half-Star Clip Paths -->
      <svg class="svg-defs-anchor" width="0" height="0">
        <defs>
          <linearGradient :id="`gold-grad-${instanceId}`" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#fde047" />
            <stop offset="60%" stop-color="#fbbf24" />
            <stop offset="100%" stop-color="#f59e0b" />
          </linearGradient>

          <clipPath :id="`half-clip-left-${instanceId}`">
            <rect x="0" y="0" width="12" height="24" />
          </clipPath>
          <clipPath :id="`half-clip-right-${instanceId}`">
            <rect x="12" y="0" width="12" height="24" />
          </clipPath>
        </defs>
      </svg>

      <!-- 10 Interactive Stars -->
      <div 
        v-for="star in 10" 
        :key="star"
        class="star-node-wrapper"
        :style="getStarTransform(star)"
      >
        <div class="star-node">
          <!-- Background Empty Star Base -->
          <svg class="star-svg empty-layer" viewBox="0 0 24 24">
            <polygon 
              points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
              fill="rgba(255, 255, 255, 0.08)"
              stroke="rgba(255, 255, 255, 0.22)"
              stroke-width="1.2"
              stroke-linejoin="round"
            />
          </svg>

          <!-- Full Filled Star Layer -->
          <svg 
            v-if="activeScore >= star" 
            class="star-svg filled-layer" 
            viewBox="0 0 24 24"
          >
            <polygon 
              points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
              :fill="`url(#gold-grad-${instanceId})`"
              stroke="#fbbf24"
              stroke-width="0.8"
              stroke-linejoin="round"
            />
          </svg>

          <!-- Half Filled Star Layer (Left 50%) -->
          <svg 
            v-else-if="activeScore >= star - 0.5" 
            class="star-svg half-layer" 
            viewBox="0 0 24 24"
          >
            <polygon 
              points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
              :fill="`url(#gold-grad-${instanceId})`"
              stroke="#fbbf24"
              stroke-width="0.8"
              stroke-linejoin="round"
              :clip-path="`url(#half-clip-left-${instanceId})`"
            />
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = withDefaults(defineProps<{
  modelValue?: number
  readonly?: boolean
  size?: 'sm' | 'md' | 'lg'
  showScore?: boolean
  showSentiment?: boolean
  allowClear?: boolean
  ariaLabel?: string
}>(), {
  modelValue: 0,
  readonly: false,
  size: 'md',
  showScore: true,
  showSentiment: true,
  allowClear: true,
  ariaLabel: 'Rating'
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void
  (e: 'change', value: number): void
}>()

const instanceId = Math.random().toString(36).substring(2, 9)
const trackRef = ref<HTMLElement | null>(null)
const isPointerDown = ref(false)
const hoverScore = ref<number | null>(null)
const hoveredStarIndex = ref<number | null>(null)

const isInteracting = computed(() => isPointerDown.value || hoverScore.value !== null)

const activeScore = computed(() => {
  if (hoverScore.value !== null) {
    return hoverScore.value
  }
  return props.modelValue || 0
})

const formatScore = (val: number): string => {
  if (val % 1 === 0) {
    return val.toString()
  }
  return val.toFixed(1)
}

const getSentiment = (val: number): string => {
  if (val >= 9.5) return 'Masterpiece 🔥'
  if (val >= 9.0) return 'Outstanding 💎'
  if (val >= 8.0) return 'Very Good ✨'
  if (val >= 7.0) return 'Good 👍'
  if (val >= 9.5) return 'Masterpiece'
  if (val >= 9.0) return 'Outstanding'
  if (val >= 8.0) return 'Very Good'
  if (val >= 7.0) return 'Good'
  if (val >= 5.5) return 'Decent'
  if (val >= 4.0) return 'Mediocre'
  if (val >= 2.0) return 'Poor'
  return 'Appalling'
}

// Calculate the score and focused star index from clientX coordinate
const resolvePointerPosition = (clientX: number) => {
  if (!trackRef.value) return { score: 0, starIndex: 1 }
  const rect = trackRef.value.getBoundingClientRect()
  const clampedX = Math.min(Math.max(0, clientX - rect.left), rect.width)
  const fraction = rect.width > 0 ? clampedX / rect.width : 0

  // 10 stars, each star occupies 1/10 (0.1) of track width
  const rawRating = fraction * 10
  // Star index: 1 to 10
  const starIndex = Math.min(10, Math.max(1, Math.floor(rawRating) + 1))
  
  // Calculate relative position within this specific star (0 to 1)
  const positionInStar = rawRating - Math.floor(rawRating)
  
  // If in left 50% -> star - 0.5; if right 50% -> star
  let score = 0
  if (positionInStar < 0.5) {
    score = starIndex - 0.5
  } else {
    score = starIndex
  }

  score = Math.min(10, Math.max(0.5, Math.round(score * 2) / 2))
  return { score, starIndex }
}

const onPointerDown = (e: PointerEvent) => {
  if (props.readonly) return
  isPointerDown.value = true
  if (trackRef.value && 'setPointerCapture' in trackRef.value) {
    try {
      trackRef.value.setPointerCapture(e.pointerId)
    } catch {
      // ignore in environments where pointer capture isn't permitted
    }
  }
  const { score, starIndex } = resolvePointerPosition(e.clientX)
  hoverScore.value = score
  hoveredStarIndex.value = starIndex
}

const onPointerMove = (e: PointerEvent) => {
  if (props.readonly) return
  const { score, starIndex } = resolvePointerPosition(e.clientX)
  hoverScore.value = score
  hoveredStarIndex.value = starIndex
}

const onPointerUp = (e: PointerEvent) => {
  if (props.readonly) return
  const { score } = resolvePointerPosition(e.clientX)
  
  // If user clicked the same rating already active, toggle to 0 (clear)
  const targetScore = (props.modelValue === score && !isPointerDown.value) ? 0 : score
  commitScore(targetScore)

  isPointerDown.value = false
  hoverScore.value = null
  hoveredStarIndex.value = null

  if (trackRef.value && 'releasePointerCapture' in trackRef.value) {
    try {
      trackRef.value.releasePointerCapture(e.pointerId)
    } catch {
      // ignore
    }
  }
}

const onPointerCancel = () => {
  isPointerDown.value = false
  hoverScore.value = null
  hoveredStarIndex.value = null
}

const onMouseLeave = () => {
  if (!isPointerDown.value) {
    hoverScore.value = null
    hoveredStarIndex.value = null
  }
}

const commitScore = (val: number) => {
  emit('update:modelValue', val)
  emit('change', val)
}

const clearRating = () => {
  if (props.readonly) return
  hoverScore.value = null
  hoveredStarIndex.value = null
  commitScore(0)
}

// Keyboard controls (left / down: -0.5, right / up: +0.5)
const onKeyDown = (e: KeyboardEvent) => {
  if (props.readonly) return
  let current = props.modelValue || 0
  if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
    e.preventDefault()
    current = Math.min(10, current + 0.5)
    commitScore(current)
  } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
    e.preventDefault()
    current = Math.max(0, current - 0.5)
    commitScore(current)
  } else if (e.key === 'Home') {
    e.preventDefault()
    commitScore(0)
  } else if (e.key === 'End') {
    e.preventDefault()
    commitScore(10)
  }
}

// Dynamic magnification wave transform calculation
const getStarTransform = (starIndex: number) => {
  if (props.readonly || hoveredStarIndex.value === null) {
    return {}
  }

  const distance = Math.abs(starIndex - hoveredStarIndex.value)

  if (distance === 0) {
    return {
      transform: 'scale(1.34) translateY(-3px)',
      filter: 'drop-shadow(0 4px 12px rgba(245, 158, 11, 0.55))',
      zIndex: 10
    }
  }

  if (distance === 1) {
    return {
      transform: 'scale(1.12) translateY(-1.5px)',
      filter: 'drop-shadow(0 2px 6px rgba(245, 158, 11, 0.25))',
      zIndex: 5
    }
  }

  if (distance === 2) {
    return {
      transform: 'scale(1.04) translateY(-0.5px)',
      zIndex: 2
    }
  }

  return {
    transform: 'scale(1)',
    zIndex: 1
  }
}
</script>

<style scoped>
.star-slider-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
  user-select: none;
  touch-action: none;
}

/* Header & Live Score Badge */
.star-slider-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 28px;
}

.score-badge-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.score-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 9px;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  font-family: inherit;
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--text-secondary, #a1a1aa);
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.score-pill.has-score {
  background: rgba(245, 158, 11, 0.12);
  border-color: rgba(245, 158, 11, 0.35);
  color: #fbbf24;
}

.score-pill.is-preview {
  transform: scale(1.04);
  border-color: rgba(245, 158, 11, 0.6);
  box-shadow: 0 0 16px rgba(245, 158, 11, 0.25);
}

.score-pill-star {
  width: 14px;
  height: 14px;
  color: #fbbf24;
}

.score-number {
  font-size: 0.95rem;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.score-max {
  font-size: 0.72rem;
  font-weight: 600;
  opacity: 0.7;
}

.score-empty-text {
  font-size: 0.78rem;
  font-weight: 500;
  color: var(--text-muted, #71717a);
}

.sentiment-tag {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-secondary, #d4d4d8);
  background: rgba(255, 255, 255, 0.05);
  padding: 2px 8px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(2px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Reset / Clear Button */
.btn-clear-score {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  padding: 3px 8px;
  color: var(--text-muted, #71717a);
  font-size: 0.74rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.18s ease;
}

.btn-clear-score:hover {
  color: #f87171;
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.3);
}

/* Star Track */
.star-track {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
  padding: 8px 10px;
  border-radius: 12px;
  background: rgba(24, 24, 27, 0.65);
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
  cursor: pointer;
  touch-action: none;
  outline: none;
  transition: border-color 0.2s ease, background 0.2s ease;
}

.star-track:hover,
.star-slider-container.is-sliding .star-track {
  border-color: rgba(245, 158, 11, 0.3);
  background: rgba(24, 24, 27, 0.85);
}

.star-track:focus-visible {
  border-color: #fbbf24;
  box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.35);
}

/* Star Node & Wrapper */
.star-node-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.16s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.16s ease;
  transition: transform 0.18s cubic-bezier(0.16, 1, 0.3, 1), filter 0.18s ease;
  will-change: transform;
}

.star-node {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.star-svg {
  display: block;
  pointer-events: none;
}

/* Sizing Tokens */
.size-sm .star-svg {
  width: 18px;
  height: 18px;
}
.size-md .star-svg {
  width: 24px;
  height: 24px;
}
.size-lg .star-svg {
  width: 32px;
  height: 32px;
}

.size-sm .star-track {
  padding: 6px 8px;
  gap: 3px;
}

.size-lg .star-track {
  padding: 12px 14px;
  gap: 6px;
}

/* SVG Layer Overlays */
.star-svg.filled-layer,
.star-svg.half-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.svg-defs-anchor {
  position: absolute;
  width: 0;
  height: 0;
  pointer-events: none;
}

/* Readonly modifier */
.star-slider-container.is-readonly .star-track {
  cursor: default;
  border-color: transparent;
  background: transparent;
  padding: 0;
}
</style>
