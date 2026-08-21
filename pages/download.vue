<template>
  <div class="download-page">
    <!-- Ambient Radial Glow Background -->
    <div class="ambient-glow"></div>

    <div class="download-container">
      <!-- Top Micro Badge -->
      <div class="release-pill-badge animate-fade-in">
        <span class="pulse-dot"></span>
        <span class="pill-text">CINELOG FOR ANDROID • V1.0.0 RELEASE</span>
      </div>

      <!-- Hero Header Section -->
      <section class="hero-section animate-fade-in">
        <h1 class="hero-headline">
          Cinema tracking in your <span class="text-accent">palm.</span>
        </h1>
        <p class="hero-subtext">
          Experience blazing fast episode tracking, live release radar countdowns, and true AMOLED dark aesthetics on your Android device.
        </p>

        <!-- Main Download Action Group -->
        <div class="action-group">
          <a 
            href="/downloads/cinelog-v1.0.0.apk" 
            download="cinelog-v1.0.0.apk" 
            class="btn-download-primary"
            @click="trackDownload"
          >
            <div class="btn-icon-wrapper">
              <svg class="download-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
            </div>
            <div class="btn-text-col">
              <span class="btn-main-title">Download APK</span>
              <span class="btn-meta-info">v1.0.0 • 52.8 MB • Android 8.0+</span>
            </div>
          </a>
        </div>
      </section>

      <!-- Smartphone Preview Frame + Bento Features Grid -->
      <section class="showcase-grid">
        <!-- Phone Device Mockup Frame -->
        <div class="device-mockup-wrapper glass-card">
          <div class="mockup-frame">
            <div class="mockup-speaker"></div>
            
            <!-- Mockup Screen Content Preview -->
            <div class="mockup-screen">
              <div class="screen-status-bar">
                <span>09:41</span>
                <div class="status-icons">
                  <span>5G</span>
                  <span>100%</span>
                </div>
              </div>

              <!-- Mockup App Header -->
              <div class="screen-app-header">
                <div class="screen-brand">
                  <span class="screen-brand-text">CINE<span class="screen-brand-badge">LOG</span></span>
                </div>
                <div class="screen-avatar-dot"></div>
              </div>

              <!-- Mockup TV Card 1 -->
              <div class="mockup-tv-card">
                <div class="mockup-thumb-box">
                  <div class="mockup-thumb-gradient"></div>
                  <span class="mockup-badge">S01 | E04</span>
                </div>
                <div class="mockup-card-body">
                  <div class="mockup-title-row">
                    <span class="mockup-show-title">Stranger Things</span>
                    <span class="mockup-chevron">›</span>
                  </div>
                  <span class="mockup-eps-title">Chapter Four: Dear Billy</span>
                  <div class="mockup-rate-pill">
                    <span>★ 9.4/10</span>
                  </div>
                </div>
                <div class="mockup-check-btn">✓</div>
              </div>

              <!-- Mockup TV Card 2 -->
              <div class="mockup-tv-card">
                <div class="mockup-thumb-box alt">
                  <div class="mockup-thumb-gradient"></div>
                  <span class="mockup-badge">S02 | E01</span>
                </div>
                <div class="mockup-card-body">
                  <div class="mockup-title-row">
                    <span class="mockup-show-title">The Bear</span>
                    <span class="mockup-chevron">›</span>
                  </div>
                  <span class="mockup-eps-title">Beef</span>
                  <div class="mockup-rate-pill">
                    <span>★ 9.0/10</span>
                  </div>
                </div>
                <div class="mockup-check-btn">✓</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Bento Features Cards -->
        <div class="bento-col">
          <div class="bento-card glass-card">
            <div class="bento-icon">⚡</div>
            <h3>Instant Episode Tracking</h3>
            <p>One-tap progress logging with 16:9 widescreen thumbnails and episode synopses.</p>
          </div>

          <div class="bento-card glass-card">
            <div class="bento-icon">📡</div>
            <h3>Release Radar</h3>
            <p>Live countdowns and calendar schedule for upcoming seasons and new episodes.</p>
          </div>

          <div class="bento-card glass-card">
            <div class="bento-icon">🌓</div>
            <h3>AMOLED Native 60+ FPS</h3>
            <p>Engineered with Flutter for pure black aesthetics, buttery transitions, and zero battery drain.</p>
          </div>
        </div>
      </section>

      <!-- Minimal 3-Step Quick Install Guide -->
      <section class="install-guide-section glass-card">
        <h2 class="guide-title">How to Install</h2>
        <div class="steps-grid">
          <div class="step-item">
            <div class="step-num">01</div>
            <h4>Download File</h4>
            <p>Tap the <strong>Download APK</strong> button above to download the release file to your Android phone.</p>
          </div>

          <div class="step-item">
            <div class="step-num">02</div>
            <h4>Allow Installation</h4>
            <p>Open the downloaded <code>.apk</code> from your notifications. If prompted, toggle <em>"Allow from this source"</em>.</p>
          </div>

          <div class="step-item">
            <div class="step-num">03</div>
            <h4>Sign In & Enjoy</h4>
            <p>Launch Cinelog Mobile and log in. Your watchlist, ratings, and progress sync instantly.</p>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'Download Cinelog Mobile (Android APK) — Cinelog',
  meta: [
    { name: 'description', content: 'Download Cinelog Mobile Android App. Fast movie and TV series progress tracking, release radar countdowns, and AMOLED dark design.' }
  ]
})

const trackDownload = () => {
  console.log('[Analytics] APK Download triggered')
}
</script>

<style scoped>
.download-page {
  position: relative;
  min-height: calc(100vh - 80px);
  padding: 40px 20px 80px 20px;
  overflow: hidden;
}

.ambient-glow {
  position: absolute;
  top: -150px;
  left: 50%;
  transform: translateX(-50%);
  width: 700px;
  height: 450px;
  background: radial-gradient(circle, rgba(229, 9, 20, 0.12) 0%, rgba(10, 10, 12, 0) 70%);
  pointer-events: none;
  z-index: 0;
}

.download-container {
  position: relative;
  z-index: 1;
  max-width: 1060px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Micro Top Release Pill */
.release-pill-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 5px 14px;
  background: rgba(229, 9, 20, 0.08);
  border: 1px solid rgba(229, 9, 20, 0.28);
  border-radius: 20px;
  margin-bottom: 24px;
}

.pulse-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #e50914;
  box-shadow: 0 0 8px #e50914;
  animation: pulseGlow 2s infinite ease-in-out;
}

@keyframes pulseGlow {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.3); opacity: 0.6; }
}

.pill-text {
  font-size: 0.72rem;
  font-weight: 800;
  color: #ff8585;
  letter-spacing: 0.06em;
}

/* Hero Section */
.hero-section {
  text-align: center;
  max-width: 720px;
  margin-bottom: 48px;
}

.hero-headline {
  font-size: 2.75rem;
  font-weight: 900;
  color: #ffffff;
  letter-spacing: -0.03em;
  line-height: 1.15;
  margin-bottom: 16px;
}

.text-accent {
  background: linear-gradient(135deg, #ffffff 30%, #e50914 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-subtext {
  font-size: 1.05rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 32px;
}

/* Action Group */
.action-group {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  flex-wrap: wrap;
}

.btn-download-primary {
  display: inline-flex;
  align-items: center;
  gap: 14px;
  background: #e50914;
  color: #ffffff;
  padding: 12px 24px;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 700;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 10px 28px -6px rgba(229, 9, 20, 0.5);
}

.btn-download-primary:hover {
  background: #f40612;
  transform: translateY(-2px);
  box-shadow: 0 14px 34px -4px rgba(229, 9, 20, 0.65);
}

.btn-icon-wrapper {
  width: 38px;
  height: 38px;
  background: rgba(0, 0, 0, 0.25);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.download-svg {
  width: 20px;
  height: 20px;
}

.btn-text-col {
  display: flex;
  flex-direction: column;
  text-align: left;
}

.btn-main-title {
  font-size: 1.02rem;
  font-weight: 800;
  line-height: 1.2;
}

.btn-meta-info {
  font-size: 0.72rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
  letter-spacing: 0.02em;
}

/* Showcase Grid */
.showcase-grid {
  display: grid;
  grid-template-columns: 360px 1fr;
  gap: 28px;
  width: 100%;
  margin-bottom: 48px;
  align-items: stretch;
}

/* Device Mockup */
.device-mockup-wrapper {
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(18, 18, 22, 0.55);
}

.mockup-frame {
  width: 280px;
  border-radius: 28px;
  background: #09090b;
  border: 4px solid #27272a;
  padding: 12px 10px 18px 10px;
  box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.06);
}

.mockup-speaker {
  width: 48px;
  height: 4px;
  background: #27272a;
  border-radius: 4px;
  margin: 0 auto 10px auto;
}

.mockup-screen {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.screen-status-bar {
  display: flex;
  justify-content: space-between;
  font-size: 0.65rem;
  color: #71717a;
  font-weight: 700;
  padding: 0 4px;
}

.status-icons {
  display: flex;
  gap: 6px;
}

.screen-app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px;
}

.screen-brand-text {
  font-size: 0.95rem;
  font-weight: 900;
  color: #ffffff;
  letter-spacing: -0.02em;
}

.screen-brand-badge {
  color: #e50914;
}

.screen-avatar-dot {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #e50914;
}

.mockup-tv-card {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #141418;
  border: 1px solid #27272a;
  border-radius: 10px;
  padding: 8px;
}

.mockup-thumb-box {
  position: relative;
  width: 60px;
  height: 38px;
  border-radius: 4px;
  background: linear-gradient(135deg, #1e1b4b, #312e81);
  flex-shrink: 0;
  overflow: hidden;
}

.mockup-thumb-box.alt {
  background: linear-gradient(135deg, #451a03, #78350f);
}

.mockup-thumb-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
}

.mockup-badge {
  position: absolute;
  bottom: 2px;
  left: 2px;
  font-size: 0.55rem;
  font-weight: 800;
  color: #ffffff;
}

.mockup-card-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.mockup-title-row {
  display: flex;
  align-items: center;
  gap: 3px;
}

.mockup-show-title {
  font-size: 0.75rem;
  font-weight: 800;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mockup-chevron {
  font-size: 0.75rem;
  color: #71717a;
}

.mockup-eps-title {
  font-size: 0.65rem;
  color: #a1a1aa;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mockup-rate-pill {
  font-size: 0.6rem;
  font-weight: 700;
  color: #ffaa00;
}

.mockup-check-btn {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #27272a;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.65rem;
  font-weight: 800;
}

/* Bento Column */
.bento-col {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.bento-card {
  flex: 1;
  padding: 22px 24px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: rgba(18, 18, 22, 0.55);
}

.bento-icon {
  font-size: 1.4rem;
  margin-bottom: 8px;
}

.bento-card h3 {
  font-size: 1.08rem;
  font-weight: 800;
  color: #ffffff;
  margin-bottom: 4px;
}

.bento-card p {
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.45;
  margin: 0;
}

/* Install Guide Section */
.install-guide-section {
  width: 100%;
  padding: 32px 36px;
  background: rgba(18, 18, 22, 0.55);
}

.guide-title {
  font-size: 1.3rem;
  font-weight: 800;
  color: #ffffff;
  margin-bottom: 24px;
  text-align: center;
}

.steps-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.step-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.step-num {
  font-size: 1.3rem;
  font-weight: 900;
  color: #e50914;
  letter-spacing: -0.02em;
}

.step-item h4 {
  font-size: 0.95rem;
  font-weight: 800;
  color: #ffffff;
  margin: 0;
}

.step-item p {
  font-size: 0.82rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin: 0;
}

.step-item code {
  background: rgba(255, 255, 255, 0.08);
  padding: 2px 5px;
  border-radius: 4px;
  font-size: 0.78rem;
}

/* Responsive */
@media (max-width: 860px) {
  .showcase-grid {
    grid-template-columns: 1fr;
  }

  .steps-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .hero-headline {
    font-size: 2.1rem;
  }

  .install-guide-section {
    padding: 24px 20px;
  }
}
</style>
