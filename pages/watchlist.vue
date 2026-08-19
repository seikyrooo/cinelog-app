<template>
  <div class="tvtime-container">
    <!-- Toast Notification -->
    <div v-if="toastMessage" class="toast-notification animate-fade-in" role="status" aria-live="polite">
      <svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
      <span>{{ toastMessage }}</span>
    </div>

    <!-- Main Top Mode: Shows vs Movies -->
    <div class="top-nav-bar">
      <div class="mode-switcher glass-card">
        <button 
          @click="mediaTypeTab = 'tv'; fetchWatchlist()"
          :class="['mode-tab', { active: mediaTypeTab === 'tv' }]"
        >
          <svg class="icon-inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect>
            <polyline points="17 2 12 7 7 2"></polyline>
          </svg>
          <span>TV Shows</span>
        </button>
        <button 
          @click="mediaTypeTab = 'movie'; fetchWatchlist()"
          :class="['mode-tab', { active: mediaTypeTab === 'movie' }]"
        >
          <svg class="icon-inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect>
            <line x1="7" y1="2" x2="7" y2="22"></line>
            <line x1="17" y1="12" x2="22" y2="12"></line>
          </svg>
          <span>Movies</span>
        </button>
      </div>
    </div>

    <!-- TV Shows TV Time Experience -->
    <div v-if="mediaTypeTab === 'tv'" class="tv-experience">
      <!-- Sub-tabs: WATCH LIST vs UPCOMING -->
      <div class="sub-tab-bar">
        <button 
          @click="activeTvSubTab = 'watchlist'"
          :class="['sub-tab-btn', { active: activeTvSubTab === 'watchlist' }]"
        >
          WATCH LIST
        </button>
        <button 
          @click="activeTvSubTab = 'upcoming'"
          :class="['sub-tab-btn', { active: activeTvSubTab === 'upcoming' }]"
        >
          UPCOMING
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading watchlist...</p>
      </div>

      <!-- WATCH LIST TAB -->
      <div v-else-if="activeTvSubTab === 'watchlist'" class="tv-sections">
        
        <!-- SECTION 1: WATCH NEXT (Active Series with remaining episodes) -->
        <div v-if="watchNextList.length > 0" class="section-group">
          <div class="section-pill-header">
            <span class="pill-badge watch-next-badge">WATCH NEXT</span>
          </div>

          <div class="shows-stack">
            <div 
              v-for="item in watchNextList" 
              :key="item.id"
              class="swipe-action-wrapper"
              :class="{ 'swipe-active': activeSwipeItemId === item.id }"
            >
              <!-- Background Action Reveal Layer (Swipe Right) -->
              <div 
                class="swipe-action-reveal"
                :style="{
                  opacity: activeSwipeItemId === item.id ? Math.min(1, swipeOffset / 50) : 0,
                  transform: `scale(${activeSwipeItemId === item.id ? Math.min(1, 0.75 + (swipeOffset / 250)) : 0.8})`
                }"
              >
                <div class="swipe-reveal-content">
                  <svg class="swipe-check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span class="swipe-text">Watched</span>
                </div>
              </div>

              <!-- Foreground Card (Draggable) -->
              <div 
                class="tvtime-card glass-card"
                :style="getCardSwipeStyle(item.id)"
                @touchstart="onTouchStart($event, item)"
                @touchmove="onTouchMove($event, item)"
                @touchend="onTouchEnd($event, item)"
                @pointerdown="onPointerDown($event, item)"
                @pointermove="onPointerMove($event, item)"
                @pointerup="onPointerUp($event, item)"
                @pointercancel="onPointerCancel($event, item)"
              >
                <img 
                  :src="getPosterUrl(item)" 
                  :alt="item.movie?.title || item.title"
                  class="tvtime-poster clickable"
                  @click="openDetailModal(item)"
                  @error="onImageError"
                />

                <div class="tvtime-card-body">
                  <div class="show-title-tag clickable" @click="openDetailModal(item)">
                    <h3 class="show-card-title">{{ item.movie?.title || item.title }}</h3>
                    <svg class="chevron-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                  </div>

                  <div class="eps-headline">
                    <span class="season-eps-code">
                      {{ getEpisodeProgressCode(item) }}
                    </span>
                    <span class="remaining-count-pill" v-if="getRemainingEps(item) > 0">
                      +{{ getRemainingEps(item) }} eps left
                    </span>
                  </div>

                  <p class="eps-title-text clickable" @click="openDetailModal(item)">
                    <span class="eps-label">Next:</span> <strong>{{ getNextEpsName(item) }}</strong>
                  </p>

                  <div class="card-badges-row">
                    <span v-if="(item.episodes_watched || 0) + 1 === 1" class="badge-premiere">PREMIERE</span>
                    <span v-if="item.favorite" class="badge-fav">★ FAVORITE</span>
                    <span class="badge-total-info" v-if="getTotalEps(item) > 0">
                      {{ getRemainingEps(item) }} remaining of {{ getTotalEps(item) }} eps
                    </span>
                  </div>

                  <!-- Interactive Quick Rating Bar -->
                  <div class="card-rating-quick-bar" @click.stop>
                    <span class="rating-prompt-text">{{ item.rating > 0 ? 'Your Score:' : 'Rate:' }}</span>
                    <div class="quick-stars">
                      <span 
                        v-for="star in 10" 
                        :key="star"
                        @click="updateItemRating(item, star)"
                        :class="['mini-star', { active: star <= (item.rating || 0) }]"
                        :title="'Rate ' + star + ' / 10'"
                      >★</span>
                    </div>
                    <span class="quick-rating-num" v-if="item.rating > 0">{{ item.rating }}/10</span>
                  </div>
                </div>

                <!-- Side Actions (Increment Episode + Remove) -->
                <div class="card-side-actions">
                  <button 
                    @click="incrementEpisode(item)" 
                    :class="['circle-check-btn', { completed: getRemainingEps(item) === 0 }]"
                    :disabled="getRemainingEps(item) === 0"
                    title="Mark this episode watched"
                    aria-label="Mark episode watched"
                  >
                    <svg class="check-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </button>

                  <button 
                    @click.stop="deleteItem(item.id)" 
                    class="circle-trash-btn"
                    title="Remove from Watchlist"
                    aria-label="Remove from Watchlist"
                  >
                    <svg class="trash-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      <line x1="10" y1="11" x2="10" y2="17"></line>
                      <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- SECTION 2: HAVENT WATCHED FOR A WHILE (Inactive / On Hold) -->
        <div v-if="haventWatchedList.length > 0" class="section-group">
          <div class="section-pill-header">
            <span class="pill-badge idle-badge">ON HOLD</span>
          </div>

          <div class="shows-stack">
            <div 
              v-for="item in haventWatchedList" 
              :key="item.id" 
              class="swipe-action-wrapper"
              :class="{ 'swipe-active': activeSwipeItemId === item.id }"
            >
              <!-- Background Action Reveal Layer (Swipe Right) -->
              <div 
                class="swipe-action-reveal"
                :style="{
                  opacity: activeSwipeItemId === item.id ? Math.min(1, swipeOffset / 50) : 0,
                  transform: `scale(${activeSwipeItemId === item.id ? Math.min(1, 0.75 + (swipeOffset / 250)) : 0.8})`
                }"
              >
                <div class="swipe-reveal-content">
                  <svg class="swipe-check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span class="swipe-text">Watched</span>
                </div>
              </div>

              <!-- Foreground Card (Draggable) -->
              <div 
                class="tvtime-card glass-card idle-card"
                :style="getCardSwipeStyle(item.id)"
                @touchstart="onTouchStart($event, item)"
                @touchmove="onTouchMove($event, item)"
                @touchend="onTouchEnd($event, item)"
                @pointerdown="onPointerDown($event, item)"
                @pointermove="onPointerMove($event, item)"
                @pointerup="onPointerUp($event, item)"
                @pointercancel="onPointerCancel($event, item)"
              >
                <img 
                  :src="getPosterUrl(item)" 
                  :alt="item.movie?.title || item.title"
                  class="tvtime-poster clickable"
                  @click="openDetailModal(item)"
                  @error="onImageError"
                />

                <div class="tvtime-card-body">
                  <div class="show-title-tag clickable" @click="openDetailModal(item)">
                    <h3 class="show-card-title">{{ item.movie?.title || item.title }}</h3>
                    <svg class="chevron-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                  </div>

                  <div class="eps-headline">
                    <span class="season-eps-code">
                      {{ getEpisodeProgressCode(item) }}
                    </span>
                    <span class="remaining-count-pill" v-if="getRemainingEps(item) > 0">
                      +{{ getRemainingEps(item) }} eps left
                    </span>
                  </div>

                  <p class="eps-title-text">Paused watching</p>
                </div>

                <div class="card-side-actions">
                  <button 
                    @click="incrementEpisode(item)" 
                    :class="['circle-check-btn', { completed: getRemainingEps(item) === 0 }]"
                    :disabled="getRemainingEps(item) === 0"
                    title="Mark this episode watched"
                    aria-label="Mark episode watched"
                  >
                    <svg class="check-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </button>

                  <button 
                    @click.stop="deleteItem(item.id)" 
                    class="circle-trash-btn"
                    title="Remove from Watchlist"
                    aria-label="Remove from Watchlist"
                  >
                    <svg class="trash-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      <line x1="10" y1="11" x2="10" y2="17"></line>
                      <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- SECTION 3: WATCHED HISTORY (Completed Shows) -->
        <div v-if="watchedHistoryList.length > 0" class="section-group">
          <div class="section-pill-header">
            <span class="pill-badge history-badge">COMPLETED HISTORY</span>
          </div>

          <div class="shows-stack">
            <div 
              v-for="item in watchedHistoryList" 
              :key="item.id" 
              class="tvtime-card glass-card completed-card"
            >
              <img 
                :src="getPosterUrl(item)" 
                :alt="item.movie?.title || item.title"
                class="tvtime-poster clickable"
                @click="openDetailModal(item)"
                @error="onImageError"
              />

              <div class="tvtime-card-body">
                <div class="show-title-tag clickable" @click="openDetailModal(item)">
                  <h3 class="show-card-title">{{ item.movie?.title || item.title }}</h3>
                  <svg class="chevron-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </div>

                <div class="eps-headline">
                  <span class="season-eps-code">
                    S{{ padZero(item.movie?.total_seasons || item.season_watched || 1) }} | ALL CAUGHT UP
                  </span>
                  <span class="badge-completed-tag">COMPLETED ({{ item.episodes_watched || getTotalEps(item) }} eps)</span>
                </div>

                <p class="eps-title-text">All episodes watched 100%</p>

                <!-- Interactive Rating Bar for Completed Show -->
                <div class="card-rating-quick-bar" @click.stop>
                  <span class="rating-prompt-text">{{ item.rating > 0 ? 'Your Rating:' : 'Rate Series:' }}</span>
                  <div class="quick-stars">
                    <span 
                      v-for="star in 10" 
                      :key="star"
                      @click="updateItemRating(item, star)"
                      :class="['mini-star', { active: star <= (item.rating || 0) }]"
                      :title="'Rate ' + star + ' / 10'"
                    >★</span>
                  </div>
                  <span class="quick-rating-num" v-if="item.rating > 0">{{ item.rating }}/10</span>
                </div>
              </div>

              <div class="card-side-actions">
                <div class="circle-check-btn completed" title="Series Completed">
                  <svg class="check-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>

                <button 
                  @click.stop="deleteItem(item.id)" 
                  class="circle-trash-btn"
                  title="Remove from Watchlist"
                  aria-label="Remove from Watchlist"
                >
                  <svg class="trash-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="watchlist.length === 0" class="empty-state glass-card">
          <h3>Your TV Watchlist is Empty</h3>
          <p>Discover and add your favorite TV series from the Explore page.</p>
          <NuxtLink to="/" class="btn-primary" style="margin-top: 14px;">+ Browse TV Shows</NuxtLink>
        </div>
      </div>

      <!-- UPCOMING TAB -->
      <div v-else-if="activeTvSubTab === 'upcoming'" class="upcoming-section">
        <div v-if="upcomingList.length > 0" class="shows-stack">
          <div 
            v-for="item in upcomingList" 
            :key="item.id" 
            class="tvtime-card glass-card upcoming-card"
          >
            <img 
              :src="getPosterUrl(item)" 
              :alt="item.movie?.title || item.title"
              class="tvtime-poster clickable"
              @click="openDetailModal(item)"
              @error="onImageError"
            />

            <div class="tvtime-card-body">
              <div class="show-title-tag clickable" @click="openDetailModal(item)">
                <h3 class="show-card-title">{{ item.movie?.title || item.title }}</h3>
                <svg class="chevron-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </div>

              <div class="upcoming-date-box">
                <svg class="icon-inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                <span>Airs: <strong>{{ item.movie?.next_air_date }}</strong></span>
              </div>

              <p class="eps-title-text" v-if="item.movie?.next_episode_name">
                Episode: "{{ item.movie?.next_episode_name }}"
              </p>
            </div>
          </div>
        </div>

        <div v-else class="empty-state glass-card">
          <h3>No Upcoming Episodes Scheduled</h3>
          <p>TV series in your watchlist currently have no new episode air dates scheduled.</p>
        </div>
      </div>
    </div>

    <!-- Movies Mode Tracker -->
    <div v-else class="movies-experience">
      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading movies...</p>
      </div>

      <div v-else-if="watchlist.length === 0" class="empty-state glass-card">
        <h3>No Movies in Your Watchlist</h3>
        <NuxtLink to="/" class="btn-primary" style="margin-top: 14px;">+ Browse Movies</NuxtLink>
      </div>

      <div v-else class="movies-grid">
        <div 
          v-for="item in watchlist" 
          :key="item.id" 
          class="glass-card movie-item-card"
        >
          <div class="card-poster clickable" @click="openDetailModal(item)">
            <img 
              :src="getPosterUrl(item)" 
              :alt="item.movie?.title || item.title"
              class="poster-img"
              @error="onImageError"
            />
            <span :class="['badge', getStatusBadgeClass(item.status), 'status-badge']">
              {{ getStatusLabel(item.status) }}
            </span>
            <span v-if="item.favorite" class="fav-badge">★ Favorite</span>
          </div>

          <div class="card-details">
            <div class="details-top">
              <span class="movie-year">{{ formatYear(item.movie?.release_date || item.release_date) }}</span>
              <span class="user-rating" v-if="item.rating > 0">
                ★ <strong>{{ item.rating }}</strong> / 10
              </span>
            </div>

            <div class="show-title-tag clickable" @click="openDetailModal(item)">
              <h3 class="show-card-title">{{ item.movie?.title || item.title }}</h3>
              <svg class="chevron-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </div>

            <p class="director-text" v-if="item.movie?.director">Director: {{ item.movie.director }}</p>

            <!-- Interactive Quick Star Rating Bar -->
            <div class="card-rating-quick-bar" @click.stop>
              <span class="rating-prompt-text">{{ item.rating > 0 ? 'Your Score:' : 'Rate:' }}</span>
              <div class="quick-stars">
                <span 
                  v-for="star in 10" 
                  :key="star"
                  @click="updateItemRating(item, star)"
                  :class="['mini-star', { active: star <= (item.rating || 0) }]"
                  :title="'Rate ' + star + ' / 10'"
                >★</span>
              </div>
              <span class="quick-rating-num" v-if="item.rating > 0">{{ item.rating }}/10</span>
            </div>

            <!-- Minimalist Icon Actions Row: Watched Checkmark + Trash Button -->
            <div class="movie-card-icon-actions">
              <button 
                @click.stop="toggleMovieWatched(item)" 
                :class="['movie-action-btn', 'btn-check', { active: item.status === 'completed' }]"
                :title="item.status === 'completed' ? 'Mark as unwatched' : 'Mark as watched'"
                :aria-label="item.status === 'completed' ? 'Mark as unwatched' : 'Mark as watched'"
              >
                <svg class="check-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </button>

              <button 
                @click.stop="deleteItem(item.id)" 
                class="movie-action-btn btn-trash"
                title="Remove from Watchlist"
                aria-label="Remove from Watchlist"
              >
                <svg class="trash-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  <line x1="10" y1="11" x2="10" y2="17"></line>
                  <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Full Detail Spasius & Wide 2-Column Layout -->
    <div v-if="showDetailModal" class="modal-overlay" @click.self="showDetailModal = false">
      <div class="modal-content glass-panel detail-modal-content wide-modal animate-fade-in">
        
        <!-- Fixed Top Right Close Button -->
        <button @click="showDetailModal = false" class="close-btn-fixed" title="Close Dialog">&times;</button>

        <!-- Movie/Show Hero Backdrop Banner -->
        <div class="hero-backdrop-banner" :style="getBackdropStyle(activeDetailMedia)">
          <div class="hero-backdrop-gradient">
            <div class="hero-media-info">
              <div class="banner-badges">
                <span :class="['badge', isTvShowContext ? 'badge-tv' : 'badge-movie']">
                  {{ isTvShowContext ? 'TV Show' : 'Movie' }}
                </span>
                <span v-if="activeDetailMedia?.vote_average" class="hero-rating-badge">
                  ★ {{ activeDetailMedia.vote_average.toFixed(1) }} / 10.0 TMDB Rating
                </span>
              </div>
              <h2 class="hero-media-title">{{ activeDetailMedia?.title || activeWatchlistContext?.movie?.title }}</h2>
              <p class="hero-media-subtitle">
                {{ formatYear(activeDetailMedia?.release_date || activeWatchlistContext?.movie?.release_date) }}
                <span v-if="activeDetailMedia?.media_status"> • {{ activeDetailMedia.media_status }}</span>
              </p>
            </div>
          </div>
        </div>

        <!-- Wide 2-Column Layout Body -->
        <div class="detail-body wide-grid">
          
          <!-- Left Column: Poster & Metadata Box & Favorite Button -->
          <div class="detail-left-col">
            <img 
              :src="getPosterUrl(activeDetailMedia || activeWatchlistContext?.movie)" 
              :alt="activeDetailMedia?.title"
              class="detail-poster-img"
              @error="onImageError"
            />

            <!-- Quick Rating & Favorite Action Bar -->
            <div class="quick-add-bar glass-card" v-if="activeWatchlistContext">
              <div class="rating-input-row">
                <div class="rating-header-flex">
                  <label class="rating-prompt-label">Your Rating:</label>
                  <span class="rating-score-highlight" v-if="activeWatchlistContext.rating > 0">
                    ★ {{ activeWatchlistContext.rating }} / 10
                  </span>
                  <span class="rating-score-highlight muted" v-else>
                    Click star to rate
                  </span>
                </div>
                <div class="star-rating-selector">
                  <span 
                    v-for="star in 10" 
                    :key="star"
                    @click="updateItemRating(activeWatchlistContext, star)"
                    :class="['star-icon', { active: star <= (activeWatchlistContext.rating || 0) }]"
                    :title="'Rate ' + star + ' / 10'"
                  >★</span>
                </div>
              </div>

              <div class="quick-action-icon-row">
                <button 
                  @click="toggleFavoriteStatus(activeWatchlistContext)"
                  :class="['icon-action-btn', 'btn-secondary', { active: activeWatchlistContext.favorite }]"
                  :title="activeWatchlistContext.favorite ? 'Favorited' : 'Add to Favorites'"
                  aria-label="Toggle Favorite"
                >
                  <svg class="action-svg" viewBox="0 0 24 24" :fill="activeWatchlistContext.favorite ? 'var(--accent-red)' : 'none'" :stroke="activeWatchlistContext.favorite ? 'var(--accent-red)' : 'currentColor'" stroke-width="2.2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                </button>

                <button 
                  @click="deleteItem(activeWatchlistContext.id)"
                  class="icon-action-btn btn-danger-icon"
                  title="Remove from Watchlist (Resets Progress)"
                  aria-label="Remove from Watchlist"
                >
                  <svg class="action-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                  </svg>
                </button>
              </div>
            </div>

            <div class="meta-info-box glass-card">
              <p v-if="activeDetailMedia?.director || activeWatchlistContext?.movie?.director">
                <strong>Director / Creator:</strong> <br>
                <span class="highlight-text">{{ activeDetailMedia?.director || activeWatchlistContext?.movie?.director }}</span>
              </p>
              <p v-if="activeDetailMedia?.cast || activeWatchlistContext?.movie?.cast">
                <strong>Main Cast:</strong> <br>
                {{ activeDetailMedia?.cast || activeWatchlistContext?.movie?.cast }}
              </p>
              <p v-if="isTvShowContext">
                <strong>Total Episodes:</strong> {{ activeDetailMedia?.total_episodes || activeWatchlistContext?.movie?.total_episodes || 'TBA' }} eps ({{ seasonsCount }} Season{{ seasonsCount > 1 ? 's' : '' }})
              </p>
            </div>
          </div>

          <!-- Right Column: Overview, Seasons Selector, & Spacious Episode Grid -->
          <div class="detail-right-col">
            <h4 class="section-subtitle">Storyline Synopsis</h4>
            <p class="overview-text">{{ activeDetailMedia?.overview || activeWatchlistContext?.movie?.overview || 'No synopsis summary available.' }}</p>

            <!-- If TV Show: Season Selector & Interactive Episode Cards -->
            <div v-if="isTvShowContext" class="seasons-section">
              <div class="section-header-row">
                <h4 class="section-subtitle">Seasons & Episodes</h4>
                <span class="watched-counter-badge" v-if="activeWatchlistContext">
                  Progress: {{ activeWatchlistContext.episodes_watched }} eps watched
                </span>
              </div>

              <!-- Season Chips Selector -->
              <div class="season-chips">
                <button 
                  v-for="s in seasonsCount" 
                  :key="s"
                  @click="fetchSeasonEpisodes(s)"
                  :class="['season-chip', { active: selectedSeason === s }]"
                >
                  Season {{ s }}
                </button>
              </div>

              <!-- Episodes List with Episode Still Banner -->
              <div v-if="isLoadingEpisodes" class="loading-state text-sm">
                <div class="spinner"></div>
                <span>Loading Season {{ selectedSeason }} episodes...</span>
              </div>

              <div v-else class="episodes-list">
                <div 
                  v-for="eps in episodesList" 
                  :key="eps.episode_number"
                  :class="['episode-item', 'glass-card', { watched: isEpisodeWatched(eps.episode_number) }]"
                >
                  <div class="eps-banner-wrapper">
                    <img 
                      :src="getEpisodeStillUrl(eps.still_path)" 
                      :alt="eps.name"
                      class="eps-still-img"
                      @error="onEpsImageError"
                    />
                    <span class="eps-num-badge">E{{ eps.episode_number }}</span>
                  </div>

                  <div class="eps-info">
                    <div class="eps-header">
                      <h5 class="eps-name">{{ eps.name }}</h5>
                      <span class="eps-date" v-if="eps.air_date">Aired: {{ eps.air_date }}</span>
                    </div>
                    <p class="eps-overview" v-if="eps.overview">{{ truncateText(eps.overview, 120) }}</p>
                  </div>

                  <!-- Watched Checkmark Toggle Icon Button -->
                  <button 
                    @click="toggleEpisodeWatched(eps.episode_number)"
                    :class="['eps-check-btn', { active: isEpisodeWatched(eps.episode_number) }]"
                    :title="isEpisodeWatched(eps.episode_number) ? 'Mark unwatched' : 'Mark watched'"
                    :aria-label="'Toggle episode ' + eps.episode_number + ' watched'"
                  >
                    <svg v-if="isEpisodeWatched(eps.episode_number)" class="check-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <svg v-else class="plus-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Edit Watchlist Item -->
    <div v-if="showEditModal" class="modal-overlay" @click.self="showEditModal = false">
      <div class="modal-content glass-panel edit-modal-box animate-fade-in">
        <button @click="showEditModal = false" class="close-btn-fixed" title="Close Dialog">&times;</button>
        <h2 class="modal-title">Edit Watchlist</h2>
        <p class="modal-subtitle">{{ editingItem?.movie?.title }}</p>

        <form @submit.prevent="updateWatchlist" class="modal-form">
          <div class="form-group">
            <label>Watch Status</label>
            <select v-model="editForm.status" class="form-input">
              <option value="watching">Watching</option>
              <option value="completed">Completed</option>
              <option value="plan_to_watch">Plan to Watch</option>
              <option value="on_hold">On Hold</option>
              <option value="dropped">Dropped</option>
            </select>
          </div>

          <div class="form-group">
            <label>Your Rating (1 - 10)</label>
            <div class="star-rating-selector">
              <span 
                v-for="star in 10" 
                :key="star"
                @click="editForm.rating = star"
                :class="['star-icon', { active: star <= editForm.rating }]"
              >★</span>
              <span class="rating-number">{{ editForm.rating > 0 ? editForm.rating + ' / 10' : 'Not rated yet' }}</span>
            </div>
          </div>

          <div class="form-group checkbox-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="editForm.favorite" />
              Mark as Favorite
            </label>
          </div>

          <div class="form-group">
            <label>Personal Notes</label>
            <textarea v-model="editForm.notes" rows="3" class="form-input text-area" placeholder="Write your private review or thoughts..."></textarea>
          </div>

          <div class="modal-actions">
            <button type="button" @click="showEditModal = false" class="btn-secondary">Cancel</button>
            <button type="submit" class="btn-primary">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
const api = useApi()
const router = useRouter()

const isLoading = ref(true)
const watchlist = ref<any[]>([])
const mediaTypeTab = ref('tv')
const activeTvSubTab = ref('watchlist')
const toastMessage = ref('')

const showEditModal = ref(false)
const editingItem = ref<any>(null)
const editForm = ref({
  status: 'watching',
  rating: 8.0,
  favorite: false,
  notes: '',
  season_watched: 1,
  episodes_watched: 0,
  total_episodes: 0
})

const showDetailModal = ref(false)
const activeDetailMedia = ref<any>(null)
const activeWatchlistContext = ref<any>(null)
const selectedSeason = ref(1)
const isLoadingEpisodes = ref(false)
const episodesList = ref<any[]>([])

// Swipe-to-Watched Gesture State & Handlers
const activeSwipeItemId = ref<number | null>(null)
const swipeOffset = ref(0)
const isSwiping = ref(false)
let startX = 0
let startY = 0
let isHorizontalGesture = false
let currentSwipingItem: any = null
const SWIPE_THRESHOLD = 85

const getCardSwipeStyle = (itemId: number) => {
  if (activeSwipeItemId.value === itemId && swipeOffset.value > 0) {
    return {
      transform: `translateX(${swipeOffset.value}px)`,
      transition: isSwiping.value ? 'none' : 'transform 0.25s cubic-bezier(0.2, 0.9, 0.3, 1)'
    }
  }
  return {
    transform: 'translateX(0px)',
    transition: 'transform 0.25s cubic-bezier(0.2, 0.9, 0.3, 1)'
  }
}

const handleSwipeStart = (clientX: number, clientY: number, item: any, target: HTMLElement | null) => {
  if (!target) return false
  if (target.closest('button') || target.closest('.quick-stars') || target.closest('.mini-star') || target.closest('.card-side-actions') || target.closest('.show-title-tag') || target.closest('.clickable')) {
    return false
  }
  if (getRemainingEps(item) === 0 && item.status === 'completed') {
    return false
  }
  startX = clientX
  startY = clientY
  currentSwipingItem = item
  isHorizontalGesture = false
  isSwiping.value = true
  return true
}

const handleSwipeMove = (clientX: number, clientY: number) => {
  if (!isSwiping.value || !currentSwipingItem) return
  const deltaX = clientX - startX
  const deltaY = clientY - startY

  if (!isHorizontalGesture) {
    if (Math.abs(deltaX) > 8 || Math.abs(deltaY) > 8) {
      if (Math.abs(deltaX) > Math.abs(deltaY) && deltaX > 0) {
        isHorizontalGesture = true
        activeSwipeItemId.value = currentSwipingItem.id
      } else {
        handleSwipeCancel()
        return
      }
    }
  }

  if (isHorizontalGesture && deltaX > 0) {
    if (deltaX > SWIPE_THRESHOLD) {
      swipeOffset.value = SWIPE_THRESHOLD + (deltaX - SWIPE_THRESHOLD) * 0.35
    } else {
      swipeOffset.value = deltaX
    }
  }
}

const handleSwipeEnd = () => {
  if (!isSwiping.value || !currentSwipingItem) {
    handleSwipeCancel()
    return
  }

  const triggeredItem = currentSwipingItem
  const offset = swipeOffset.value
  isSwiping.value = false

  if (offset >= SWIPE_THRESHOLD) {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(40) } catch (_) {}
    }
    swipeOffset.value = 160
    setTimeout(() => {
      incrementEpisode(triggeredItem)
      setTimeout(() => {
        handleSwipeCancel()
      }, 150)
    }, 120)
  } else {
    swipeOffset.value = 0
    setTimeout(() => {
      activeSwipeItemId.value = null
      currentSwipingItem = null
    }, 250)
  }
}

const handleSwipeCancel = () => {
  isSwiping.value = false
  swipeOffset.value = 0
  activeSwipeItemId.value = null
  currentSwipingItem = null
  isHorizontalGesture = false
}

const onTouchStart = (e: TouchEvent, item: any) => {
  const touch = e.touches[0]
  handleSwipeStart(touch.clientX, touch.clientY, item, e.target as HTMLElement)
}

const onTouchMove = (e: TouchEvent, item: any) => {
  if (!isSwiping.value) return
  const touch = e.touches[0]
  handleSwipeMove(touch.clientX, touch.clientY)
  if (isHorizontalGesture) {
    e.preventDefault()
  }
}

const onTouchEnd = () => {
  handleSwipeEnd()
}

const onPointerDown = (e: PointerEvent, item: any) => {
  if (e.pointerType === 'mouse' && e.button !== 0) return
  const ok = handleSwipeStart(e.clientX, e.clientY, item, e.target as HTMLElement)
  if (ok) {
    (e.currentTarget as HTMLElement)?.setPointerCapture?.(e.pointerId)
  }
}

const onPointerMove = (e: PointerEvent) => {
  handleSwipeMove(e.clientX, e.clientY)
}

const onPointerUp = () => {
  handleSwipeEnd()
}

const onPointerCancel = () => {
  handleSwipeCancel()
}

const showToast = (msg: string) => {
  toastMessage.value = msg
  setTimeout(() => {
    toastMessage.value = ''
  }, 3500)
}

const isTvShowContext = computed(() => {
  return activeDetailMedia.value?.media_type === 'tv' || 
         activeWatchlistContext.value?.movie?.media_type === 'tv' || 
         mediaTypeTab.value === 'tv'
})

const seasonsCount = computed(() => {
  if (activeDetailMedia.value?.seasons?.length) {
    return activeDetailMedia.value.seasons.length
  }
  return activeDetailMedia.value?.total_seasons || activeWatchlistContext.value?.movie?.total_seasons || 1
})

const watchNextList = computed(() => {
  return watchlist.value.filter(item => {
    const total = getTotalEps(item)
    const watched = item.episodes_watched || 0
    const isTamat = total > 0 && watched >= total
    return !isTamat && (item.status === 'watching' || item.status === 'plan_to_watch' || item.status === 'completed')
  })
})

const haventWatchedList = computed(() => {
  return watchlist.value.filter(item => {
    const total = getTotalEps(item)
    const watched = item.episodes_watched || 0
    const isTamat = total > 0 && watched >= total
    return !isTamat && item.status === 'on_hold'
  })
})

const watchedHistoryList = computed(() => {
  return watchlist.value.filter(item => {
    const total = getTotalEps(item)
    const watched = item.episodes_watched || 0
    return total > 0 && watched >= total
  })
})

const upcomingList = computed(() => {
  return watchlist.value.filter(item => item.movie?.next_air_date && item.movie.next_air_date !== '')
})

const fetchWatchlist = async () => {
  if (!authStore.isAuth) {
    router.push('/login')
    return
  }
  isLoading.value = true

  try {
    const params: any = {
      media_type: mediaTypeTab.value
    }

    const res: any = await api.getLibrary(params)
    watchlist.value = res.data || []
    
    // Auto-enrich any items that might have missing posters in the database
    enrichMissingMetadata()
  } catch (err) {
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

const enrichMissingMetadata = async () => {
  for (const item of watchlist.value) {
    const m = item.movie || item
    const hasPoster = m.poster_path && m.poster_path !== ''
    const tmdbId = m.tmdb_id || m.id
    if (!hasPoster && tmdbId) {
      try {
        const detailRes: any = await $fetch(useApiUrl('/api/detail'), {
          params: {
            id: tmdbId,
            type: m.media_type || mediaTypeTab.value || 'movie'
          }
        })
        if (detailRes?.data?.poster_path) {
          if (item.movie) {
            item.movie.poster_path = detailRes.data.poster_path
            item.movie.backdrop_path = detailRes.data.backdrop_path || item.movie.backdrop_path
          } else {
            item.poster_path = detailRes.data.poster_path
            item.backdrop_path = detailRes.data.backdrop_path || item.backdrop_path
          }
        }
      } catch {
        // silent
      }
    }
  }
}

onMounted(() => {
  fetchWatchlist()
})

const padZero = (num: number) => {
  return num < 10 ? `0${num}` : `${num}`
}

const getTotalEps = (item: any) => {
  return item.movie?.total_episodes || item.total_episodes || 0
}

const getRemainingEps = (item: any) => {
  const total = getTotalEps(item)
  const watched = item.episodes_watched || 0
  if (total > 0 && watched >= total) return 0
  if (total <= 0) return 0
  return Math.max(0, total - watched)
}

const getEpisodeProgressCode = (item: any) => {
  const totalWatched = item.episodes_watched || 0
  const nextWatched = totalWatched + 1
  const totalEps = getTotalEps(item)

  if (totalEps > 0 && totalWatched >= totalEps) {
    return `S${padZero(item.movie?.total_seasons || item.season_watched || 1)} | All Caught Up`
  }

  // If detailed seasons info is available
  const seasons = item.movie?.seasons || item.seasons || []
  if (seasons && seasons.length > 0) {
    let accumulated = 0
    for (const s of seasons) {
      const count = s.episode_count || 0
      if (nextWatched <= accumulated + count) {
        const episodeInSeason = nextWatched - accumulated
        return `S${padZero(s.season_number || 1)} | E${padZero(episodeInSeason)}`
      }
      accumulated += count
    }
  }

  // Heuristic for multi-season TV shows
  const totalSeasons = item.movie?.total_seasons || 1
  if (totalSeasons > 1 && totalEps > 0) {
    const avgPerSeason = Math.ceil(totalEps / totalSeasons)
    const currentSeason = Math.min(totalSeasons, Math.floor(totalWatched / avgPerSeason) + 1)
    const currentEpsInSeason = (totalWatched % avgPerSeason) + 1
    return `S${padZero(currentSeason)} | E${padZero(currentEpsInSeason)}`
  }

  // Single season fallback
  return `S${padZero(item.season_watched || 1)} | E${padZero(nextWatched)}`
}

const getNextEpsName = (item: any) => {
  if (item.movie?.next_episode_name) return item.movie.next_episode_name
  const totalWatched = item.episodes_watched || 0
  const totalEps = getTotalEps(item)
  if (totalEps > 0 && totalWatched >= totalEps) return 'Season Completed'
  const nextNum = totalWatched + 1
  return `Episode ${nextNum}`
}

const getBackdropStyle = (media: any) => {
  if (!media) return { background: '#121216' }
  const path = media?.backdrop_path || media?.local_backdrop_path || media?.poster_path || media?.local_poster_path || media?.movie?.backdrop_path || media?.movie?.poster_path
  if (!path || path === 'null' || path === 'undefined') {
    return { backgroundImage: `url(https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1280&q=80)` }
  }
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return { backgroundImage: `url(${path})` }
  }
  if (path.startsWith('/uploads/') || path.startsWith('uploads/')) {
    return { backgroundImage: `url(${useApiUrl(path)})` }
  }
  return { backgroundImage: `url(https://image.tmdb.org/t/p/w1280${path.startsWith('/') ? path : '/' + path})` }
}

const getEpisodeStillUrl = (path: string) => {
  if (!path || path === 'null' || path === 'undefined') {
    return 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&w=500&q=80'
  }
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }
  if (path.startsWith('/uploads/') || path.startsWith('uploads/')) {
    return useApiUrl(path)
  }
  return `https://image.tmdb.org/t/p/w500${path.startsWith('/') ? path : '/' + path}`
}

const openDetailModal = async (contextItem: any) => {
  let movieObj = contextItem.movie ? contextItem.movie : contextItem
  activeWatchlistContext.value = contextItem.movie ? contextItem : null
  activeDetailMedia.value = { ...movieObj }
  showDetailModal.value = true
  selectedSeason.value = activeWatchlistContext.value?.season_watched || 1

  const tmdbId = activeDetailMedia.value?.tmdb_id || activeDetailMedia.value?.id
  const mediaType = activeDetailMedia.value?.media_type || mediaTypeTab.value || 'movie'

  if (tmdbId) {
    try {
      const detailRes: any = await $fetch(useApiUrl('/api/detail'), {
        params: {
          id: tmdbId,
          type: mediaType
        }
      })
      if (detailRes?.data) {
        // 1. Update modal object
        activeDetailMedia.value = { ...activeDetailMedia.value, ...detailRes.data }

        // 2. Reactively update the dashboard card poster & details in real-time
        if (contextItem && contextItem.movie) {
          contextItem.movie.poster_path = detailRes.data.poster_path || contextItem.movie.poster_path
          contextItem.movie.backdrop_path = detailRes.data.backdrop_path || contextItem.movie.backdrop_path
          contextItem.movie.overview = detailRes.data.overview || contextItem.movie.overview
          contextItem.movie.director = detailRes.data.director || contextItem.movie.director
        }
        const match = watchlist.value.find(w => w.id === contextItem.id || (w.movie && (w.movie.id === movieObj.id || w.movie.tmdb_id === tmdbId)))
        if (match && match.movie) {
          match.movie.poster_path = detailRes.data.poster_path || match.movie.poster_path
          match.movie.backdrop_path = detailRes.data.backdrop_path || match.movie.backdrop_path
        }
      }
    } catch (e) {
      console.error(e)
    }

    if (isTvShowContext.value) {
      await fetchSeasonEpisodes(selectedSeason.value)
    }
  }
}

const fetchSeasonEpisodes = async (seasonNum: number) => {
  selectedSeason.value = seasonNum
  isLoadingEpisodes.value = true
  try {
    const tmdbId = activeDetailMedia.value?.tmdb_id || activeDetailMedia.value?.id
    const res: any = await $fetch(useApiUrl('/api/tv/season'), {
      params: {
        id: tmdbId,
        season: seasonNum
      }
    })
    episodesList.value = res.data || []
  } catch (err) {
    console.error(err)
  } finally {
    isLoadingEpisodes.value = false
  }
}

const getGlobalEpisodeNumber = (seasonNumber: number, epsNumber: number) => {
  const seasons = activeDetailMedia.value?.seasons || activeWatchlistContext.value?.movie?.seasons || []
  if (seasons && seasons.length > 0) {
    let accumulated = 0
    for (const s of seasons) {
      if (s.season_number === 0 && seasonNumber !== 0) continue
      if (s.season_number < seasonNumber) {
        accumulated += s.episode_count || 0
      }
    }
    return accumulated + epsNumber
  }

  // Multi-season heuristic fallback
  const totalSeasons = activeDetailMedia.value?.total_seasons || activeWatchlistContext.value?.movie?.total_seasons || seasonsCount.value || 1
  const totalEps = activeDetailMedia.value?.total_episodes || activeWatchlistContext.value?.movie?.total_episodes || 0
  if (totalSeasons > 1 && totalEps > 0) {
    const avgPerSeason = Math.ceil(totalEps / totalSeasons)
    return ((seasonNumber - 1) * avgPerSeason) + epsNumber
  }

  return epsNumber
}

const isEpisodeWatched = (epsNumber: number) => {
  if (!activeWatchlistContext.value) return false
  const watchedEps = activeWatchlistContext.value.episodes_watched || 0
  const totalEps = activeWatchlistContext.value.total_episodes || activeWatchlistContext.value.movie?.total_episodes || 0
  
  if (totalEps > 0 && watchedEps >= totalEps) {
    return true
  }

  const globalEps = getGlobalEpisodeNumber(selectedSeason.value, epsNumber)
  return globalEps <= watchedEps
}

const toggleEpisodeWatched = async (epsNumber: number) => {
  const globalEps = getGlobalEpisodeNumber(selectedSeason.value, epsNumber)
  const isWatched = isEpisodeWatched(epsNumber)
  const targetEpsCount = isWatched ? Math.max(0, globalEps - 1) : globalEps
  const totalEps = activeWatchlistContext.value?.total_episodes || activeWatchlistContext.value?.movie?.total_episodes || activeDetailMedia.value?.total_episodes || 0

  if (!activeWatchlistContext.value) {
    try {
      const res: any = await api.addLibraryItem({
        tmdb_id: activeDetailMedia.value.id || activeDetailMedia.value.tmdb_id,
        media_type: activeDetailMedia.value.media_type || 'tv',
        title: activeDetailMedia.value.title || activeDetailMedia.value.name,
        overview: activeDetailMedia.value.overview,
        poster_path: activeDetailMedia.value.poster_path,
        backdrop_path: activeDetailMedia.value.backdrop_path,
        release_date: activeDetailMedia.value.release_date || activeDetailMedia.value.first_air_date,
        vote_average: activeDetailMedia.value.vote_average,
        director: activeDetailMedia.value.director,
        cast: activeDetailMedia.value.cast,
        total_seasons: activeDetailMedia.value.total_seasons || seasonsCount.value,
        total_episodes: activeDetailMedia.value.total_episodes,
        status: (totalEps > 0 && targetEpsCount >= totalEps) ? 'completed' : 'watching',
        season_watched: selectedSeason.value,
        episodes_watched: targetEpsCount
      })
      if (res.data) {
        activeWatchlistContext.value = res.data
        fetchWatchlist()
        showToast(`Saved: S${padZero(selectedSeason.value)} E${padZero(epsNumber)} (${targetEpsCount} eps watched)`)
      }
    } catch (err) {
      console.error(err)
    }
    return
  }

  try {
    const res: any = await api.setLibraryProgress(activeWatchlistContext.value.id, {
      season_watched: selectedSeason.value,
      episodes_watched: targetEpsCount
    })

    if (res.data) {
      activeWatchlistContext.value.season_watched = res.data.season_watched
      activeWatchlistContext.value.episodes_watched = res.data.episodes_watched
      activeWatchlistContext.value.status = res.data.status
      fetchWatchlist()

      if (res.data.status === 'completed') {
        showToast('🎉 Series Completed! Moved to Completed History.')
      } else {
        showToast(`Progress: S${padZero(selectedSeason.value)} E${padZero(epsNumber)} (${res.data.episodes_watched} eps)`)
      }
    }
  } catch (err) {
    console.error(err)
  }
}

const updateItemRating = async (item: any, rating: number) => {
  if (!item || !item.id) return
  item.rating = rating

  // Rating is independent of completion - rating a show never forces it to completed/ended
  const total = getTotalEps(item)
  const isFinished = total > 0 && (item.episodes_watched || 0) >= total
  const currentStatus = isFinished ? 'completed' : (item.status === 'completed' ? 'watching' : (item.status || 'watching'))

  try {
    const res: any = await api.updateLibraryItem(item.id, {
      rating: rating,
      status: currentStatus,
      favorite: item.favorite,
      notes: item.notes || '',
      episodes_watched: item.episodes_watched || 0,
      season_watched: item.season_watched || 1
    })
    if (res.data) {
      item.rating = res.data.rating
      item.status = res.data.status
      if (activeWatchlistContext.value && activeWatchlistContext.value.id === item.id) {
        activeWatchlistContext.value.rating = res.data.rating
        activeWatchlistContext.value.status = res.data.status
      }
      showToast(`⭐ Rated ${rating} / 10!`)
    }
  } catch (err) {
    console.error('Failed to update rating:', err)
  }
}

const toggleFavoriteStatus = async (item: any) => {
  const newFavState = !item.favorite
  try {
    const res: any = await api.updateLibraryItem(item.id, {
        status: item.status,
        rating: item.rating,
        favorite: newFavState,
        notes: item.notes || '',
        season_watched: item.season_watched,
        episodes_watched: item.episodes_watched,
        total_episodes: item.total_episodes
    })
    if (res.data) {
      item.favorite = newFavState
      if (activeWatchlistContext.value) {
        activeWatchlistContext.value.favorite = newFavState
      }
      fetchWatchlist()
      showToast(newFavState ? 'Added to Favorites! ★' : 'Removed from Favorites.')
    }
  } catch (err) {
    console.error(err)
  }
}

const getPosterUrl = (itemOrPath: any) => {
  let poster = ''
  let local = ''
  let backdrop = ''

  if (typeof itemOrPath === 'object' && itemOrPath !== null) {
    const movie = itemOrPath.movie ? itemOrPath.movie : itemOrPath
    poster = movie.poster_path || ''
    local = movie.local_poster_path || ''
    backdrop = movie.backdrop_path || movie.local_backdrop_path || ''
  } else if (typeof itemOrPath === 'string') {
    poster = itemOrPath
  }

  // 1. Direct TMDB CDN / External URL (100% reliable)
  if (poster && poster !== 'null' && poster !== 'undefined') {
    if (poster.startsWith('http://') || poster.startsWith('https://')) {
      return poster
    }
    if (poster.startsWith('/uploads/') || poster.startsWith('uploads/')) {
      return useApiUrl(poster)
    }
    return `https://image.tmdb.org/t/p/w500${poster.startsWith('/') ? poster : '/' + poster}`
  }

  // 2. Local Upload fallback
  if (local && local !== 'null' && local !== 'undefined') {
    if (local.startsWith('http://') || local.startsWith('https://')) {
      return local
    }
    return useApiUrl(local)
  }

  // 3. Backdrop fallback
  if (backdrop && backdrop !== 'null' && backdrop !== 'undefined') {
    if (backdrop.startsWith('http://') || backdrop.startsWith('https://')) {
      return backdrop
    }
    if (backdrop.startsWith('/uploads/') || backdrop.startsWith('uploads/')) {
      return useApiUrl(backdrop)
    }
    return `https://image.tmdb.org/t/p/w500${backdrop.startsWith('/') ? backdrop : '/' + backdrop}`
  }

  return 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=500&q=80'
}

const onImageError = (e: Event) => {
  const target = e.target as HTMLImageElement
  if (target && !target.src.includes('unsplash')) {
    target.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=500&q=80'
  }
}

const onEpsImageError = (e: Event) => {
  const target = e.target as HTMLImageElement
  if (target && !target.src.includes('unsplash')) {
    target.src = 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&w=500&q=80'
  }
}

const formatYear = (dateStr: string) => {
  if (!dateStr) return ''
  return dateStr.substring(0, 4)
}

const truncateText = (text: string, len: number) => {
  if (!text) return ''
  return text.length > len ? text.substring(0, len) + '...' : text
}

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'watching': return 'badge-watching'
    case 'completed': return 'badge-completed'
    default: return 'badge-plan'
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'watching': return 'Watching'
    case 'completed': return 'Completed'
    case 'on_hold': return 'On Hold'
    case 'dropped': return 'Dropped'
    default: return 'Plan to Watch'
  }
}

const incrementEpisode = async (item: any) => {
  const total = getTotalEps(item)
  if (total > 0 && item.episodes_watched >= total) {
    showToast('🎉 All episodes already watched! Show is in Completed History.')
    return
  }

  try {
    const res: any = await api.incrementLibraryProgress(item.id)
    if (res.data) {
      item.episodes_watched = res.data.episodes_watched
      item.season_watched = res.data.season_watched
      item.status = res.data.status
      fetchWatchlist()

      if (res.data.status === 'completed') {
        showToast('🎉 Series Completed! Moved to Completed History')
      } else {
        showToast(`+1 Episode logged! (${getEpisodeProgressCode(item)})`)
      }
    }
  } catch (err) {
    console.error(err)
  }
}

const openEditModal = (item: any) => {
  editingItem.value = item
  editForm.value = {
    status: item.status,
    rating: item.rating || 8.0,
    favorite: item.favorite,
    notes: item.notes || '',
    season_watched: item.season_watched || 1,
    episodes_watched: item.episodes_watched || 0,
    total_episodes: item.total_episodes || item.movie?.total_episodes || 0
  }
  showEditModal.value = true
}

const updateWatchlist = async () => {
  if (!editingItem.value) return
  try {
    await api.updateLibraryItem(editingItem.value.id, editForm.value)
    showEditModal.value = false
    fetchWatchlist()
    showToast('Watchlist updated successfully!')
  } catch (err: any) {
    alert(err?.data?.error || 'Failed to update watchlist.')
  }
}

const toggleMovieWatched = async (item: any) => {
  const newStatus = item.status === 'completed' ? 'watching' : 'completed'
  try {
    const res: any = await api.updateLibraryItem(item.id, {
      status: newStatus,
      rating: item.rating || 0,
      favorite: item.favorite,
      notes: item.notes || ''
    })
    if (res.data) {
      item.status = res.data.status
      fetchWatchlist()
      if (newStatus === 'completed') {
        showToast('🎉 Movie marked as watched! Don\'t forget to rate.')
      } else {
        showToast('Movie status updated to watching.')
      }
    }
  } catch (err) {
    console.error('Failed to toggle movie status:', err)
  }
}

const deleteItem = async (id: number) => {
  if (!confirm('Remove this title from your watchlist? This will reset all progress.')) return
  try {
    await api.deleteLibraryItem(id)
    showDetailModal.value = false
    showEditModal.value = false
    activeWatchlistContext.value = null
    fetchWatchlist()
    showToast('🗑️ Title removed from watchlist.')
  } catch (err: any) {
    alert(err?.data?.error || 'Failed to remove from watchlist.')
  }
}
</script>

<style scoped>
.toast-notification {
  position: fixed;
  top: 80px;
  right: 24px;
  z-index: 10000;
  background: var(--accent-red);
  color: #ffffff;
  padding: 12px 20px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.88rem;
  box-shadow: 0 10px 25px rgba(229, 9, 20, 0.4);
  display: flex;
  align-items: center;
  gap: 10px;
}

.toast-icon {
  width: 18px;
  height: 18px;
}

.icon-inline {
  width: 16px;
  height: 16px;
}

.check-svg {
  width: 20px;
  height: 20px;
}

.quick-add-bar {
  padding: 14px;
  border-radius: 10px;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.rating-header-flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.rating-prompt-label {
  font-size: 0.8rem;
  color: var(--text-secondary);
  font-weight: 600;
}

.rating-score-highlight {
  font-size: 0.84rem;
  color: var(--accent-star);
  font-weight: 700;
}

.rating-score-highlight.muted {
  font-size: 0.76rem;
  color: var(--text-muted);
  font-weight: 500;
}

.card-rating-quick-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.rating-prompt-text {
  font-size: 0.74rem;
  color: var(--text-muted);
  font-weight: 600;
}

.quick-stars {
  display: flex;
  align-items: center;
  gap: 2px;
}

.mini-star {
  font-size: 0.92rem;
  color: #3f3f46;
  cursor: pointer;
  transition: all 0.15s ease;
  line-height: 1;
}

.mini-star:hover {
  transform: scale(1.25);
  color: var(--accent-star);
}

.mini-star.active {
  color: var(--accent-star);
}

.quick-rating-num {
  font-size: 0.74rem;
  font-weight: 700;
  color: var(--accent-star);
  margin-left: 2px;
}

.quick-action-icon-row {
  display: flex;
  gap: 10px;
  width: 100%;
}

.icon-action-btn {
  flex: 1;
  height: 42px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 0;
  border: 1px solid var(--border-subtle);
}

.icon-action-btn:hover {
  transform: translateY(-2px);
}

.icon-action-btn.btn-primary {
  background: var(--accent-red);
  color: #ffffff;
  border-color: var(--accent-red);
  box-shadow: 0 4px 14px rgba(229, 9, 20, 0.35);
}

.icon-action-btn.btn-primary:hover {
  background: var(--accent-red-hover);
  box-shadow: 0 6px 20px rgba(229, 9, 20, 0.5);
}

.icon-action-btn.btn-secondary {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-secondary);
}

.icon-action-btn.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.icon-action-btn.btn-secondary.active {
  background: rgba(229, 9, 20, 0.15);
  border-color: var(--accent-red);
  color: var(--accent-red);
}

.action-svg {
  width: 20px;
  height: 20px;
}

.tvtime-container {
  max-width: 860px;
  margin: 0 auto;
}

.top-nav-bar {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.mode-switcher {
  display: flex;
  padding: 4px;
  border-radius: 10px;
  gap: 6px;
  width: 100%;
  max-width: 320px;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
}

.mode-tab {
  flex: 1;
  background: transparent;
  border: none;
  color: var(--text-secondary);
  padding: 9px;
  border-radius: 6px;
  font-weight: 700;
  font-size: 0.88rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.18s ease;
}

.mode-tab.active {
  background: var(--accent-red);
  color: #ffffff;
}

/* Sub Tab Bar: WATCH LIST vs UPCOMING */
.sub-tab-bar {
  display: flex;
  border-bottom: 1px solid var(--border-subtle);
  margin-bottom: 24px;
}

.sub-tab-btn {
  flex: 1;
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-weight: 800;
  font-size: 0.9rem;
  padding: 12px;
  cursor: pointer;
  letter-spacing: 0.05em;
  position: relative;
  transition: color 0.18s;
}

.sub-tab-btn.active {
  color: #ffffff;
}

.sub-tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--accent-red);
}

/* Sections & Pill Badges */
.section-group {
  margin-bottom: 24px;
}

.section-pill-header {
  margin-bottom: 12px;
}

.pill-badge {
  display: inline-block;
  padding: 3px 12px;
  border-radius: 6px;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.watch-next-badge {
  background: var(--accent-red);
  color: #ffffff;
}

.history-badge {
  background: #27272a;
  color: #a1a1aa;
}

.idle-badge {
  background: #3f3f46;
  color: #e4e4e7;
}

/* TV Time Card Layout */
.shows-stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Swipe-to-Watched Action Styling */
.swipe-action-wrapper {
  position: relative;
  overflow: hidden;
  border-radius: 10px;
  touch-action: pan-y;
}

.swipe-action-reveal {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, #15803d 0%, #22c55e 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  padding-left: 28px;
  color: #ffffff;
  z-index: 1;
  pointer-events: none;
  transition: opacity 0.1s ease, transform 0.15s ease;
  box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.3);
}

.swipe-reveal-content {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 800;
  font-size: 1.1rem;
  color: #ffffff;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
}

.swipe-check-icon {
  width: 28px;
  height: 28px;
}

.swipe-text {
  letter-spacing: 0.03em;
  text-transform: uppercase;
}

.tvtime-card {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 14px;
  border-radius: 10px;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  user-select: none;
  touch-action: pan-y;
}

.tvtime-card:hover {
  border-color: var(--border-red);
}

.tvtime-poster {
  width: 80px;
  height: 115px;
  object-fit: cover;
  border-radius: 6px;
  flex-shrink: 0;
}

.tvtime-card-body {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.show-title-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  width: fit-content;
  margin-bottom: 6px;
  cursor: pointer;
}

.show-card-title {
  font-size: 0.96rem;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: -0.01em;
  line-height: 1.25;
  transition: color 0.15s ease;
  margin: 0;
}

.show-title-tag:hover .show-card-title {
  color: var(--accent-red);
}

.chevron-icon {
  width: 14px;
  height: 14px;
  color: var(--text-muted);
  transition: transform 0.2s ease, color 0.2s ease;
  flex-shrink: 0;
}

.show-title-tag:hover .chevron-icon {
  color: var(--accent-red);
  transform: translateX(3px);
}

.eps-headline {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.season-eps-code {
  font-size: 1.1rem;
  font-weight: 800;
  color: #ffffff;
}

.remaining-count-pill {
  font-size: 0.74rem;
  color: #ff8585;
  background: var(--accent-red-subtle);
  border: 1px solid var(--border-red);
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 700;
}

.eps-title-text {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-bottom: 8px;
  font-weight: 500;
}

.eps-label {
  color: var(--text-muted);
  font-weight: 600;
}

.card-badges-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
}

.badge-premiere {
  background: var(--accent-red);
  color: #ffffff;
  font-weight: 800;
  font-size: 0.65rem;
  padding: 2px 6px;
  border-radius: 4px;
}

.badge-fav {
  background: rgba(251, 191, 36, 0.15);
  color: var(--accent-star);
  border: 1px solid rgba(251, 191, 36, 0.35);
  font-weight: 700;
  font-size: 0.65rem;
  padding: 2px 6px;
  border-radius: 4px;
}

.badge-completed-tag {
  background: rgba(34, 197, 94, 0.15);
  color: #4ade80;
  border: 1px solid rgba(34, 197, 94, 0.35);
  font-size: 0.68rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 4px;
}

.badge-total-info {
  font-size: 0.72rem;
  color: var(--text-muted);
}

.circle-check-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #27272a;
  border: 1px solid var(--border-subtle);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.2s ease;
  margin-left: 8px;
}

.circle-check-btn:hover:not(:disabled) {
  background: var(--accent-red);
  color: #ffffff;
  border-color: var(--accent-red);
  transform: scale(1.06);
}

.circle-check-btn.completed,
.circle-check-btn:disabled {
  background: var(--accent-success);
  color: #ffffff;
  border-color: var(--accent-success);
  cursor: default;
  transform: none;
}

.upcoming-date-box {
  color: var(--text-primary);
  font-size: 0.84rem;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.upcoming-date-box strong {
  color: var(--accent-red);
}

/* Movies Grid Layout */
.movies-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 18px;
}

.movie-item-card {
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border-radius: 10px;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  transition: all 0.2s ease;
}

.movie-item-card:hover {
  border-color: var(--border-red);
  transform: translateY(-3px);
}

.card-poster {
  position: relative;
  width: 100%;
  padding-top: 140%;
  background: #15151a;
}

.poster-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.status-badge {
  position: absolute;
  top: 8px;
  left: 8px;
}

.fav-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(10, 10, 12, 0.88);
  backdrop-filter: blur(6px);
  color: var(--accent-star);
  font-weight: 700;
  font-size: 0.72rem;
  padding: 3px 6px;
  border-radius: 4px;
  border: 1px solid var(--border-subtle);
}

.card-details {
  padding: 12px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.details-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.movie-year {
  font-size: 0.78rem;
  color: var(--text-muted);
}

.user-rating {
  font-size: 0.8rem;
  color: var(--accent-star);
}

.movie-title {
  font-size: 0.95rem;
  color: #ffffff;
  font-weight: 700;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-side-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 8px;
  flex-shrink: 0;
}

.circle-trash-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--border-subtle);
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 0;
}

.circle-trash-btn:hover {
  background: rgba(239, 68, 68, 0.15);
  border-color: #ef4444;
  color: #ef4444;
  transform: scale(1.08);
}

.trash-svg {
  width: 16px;
  height: 16px;
}

.movie-card-icon-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.movie-action-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 0;
  border: 1px solid var(--border-subtle);
  background: rgba(255, 255, 255, 0.04);
  color: var(--text-muted);
}

.movie-action-btn.btn-check:hover {
  border-color: var(--accent-red);
  color: #ffffff;
  transform: scale(1.08);
  background: rgba(229, 9, 20, 0.15);
}

.movie-action-btn.btn-check.active {
  background: var(--accent-success);
  border-color: var(--accent-success);
  color: #ffffff;
  box-shadow: 0 0 12px rgba(34, 197, 94, 0.45);
}

.movie-action-btn.btn-trash:hover {
  background: rgba(239, 68, 68, 0.15);
  border-color: #ef4444;
  color: #ef4444;
  transform: scale(1.08);
}

.btn-danger-icon {
  background: rgba(239, 68, 68, 0.08);
  border-color: rgba(239, 68, 68, 0.3);
  color: #ef4444;
}

.btn-danger-icon:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: #ef4444;
  color: #ffffff;
  box-shadow: 0 4px 14px rgba(239, 68, 68, 0.3);
}

/* WIDE & SPACIOUS DETAIL MODAL */
.detail-modal-content.wide-modal {
  position: relative;
  width: 92vw;
  max-width: 1000px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 0;
  border-radius: 16px;
  overflow: hidden;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.95);
}

.close-btn-fixed {
  position: absolute;
  top: 16px;
  right: 18px;
  z-index: 40;
  background: rgba(10, 10, 12, 0.85);
  backdrop-filter: blur(8px);
  border: 1px solid var(--border-subtle);
  color: #ffffff;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  font-size: 1.4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.close-btn-fixed:hover {
  background: var(--accent-red);
  border-color: var(--accent-red);
}

.hero-backdrop-banner {
  height: 220px;
  background-size: cover;
  background-position: center;
  position: relative;
}

.hero-backdrop-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(10, 10, 12, 0.2) 0%, rgba(10, 10, 12, 0.95) 90%, var(--bg-surface) 100%);
  display: flex;
  align-items: flex-end;
  padding: 24px;
}

.banner-badges {
  display: flex;
  align-items: center;
  gap: 8px;
}

.hero-media-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.hero-rating-badge {
  color: #ffffff;
  font-weight: 700;
  font-size: 0.84rem;
}

.hero-media-title {
  font-size: 1.8rem;
  font-weight: 900;
  color: #ffffff;
  line-height: 1.15;
}

.hero-media-subtitle {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.detail-body.wide-grid {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 24px;
  padding: 24px;
}

@media (max-width: 768px) {
  .detail-body.wide-grid {
    grid-template-columns: 1fr;
  }
}

.detail-left-col {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.detail-poster-img {
  width: 100%;
  border-radius: 10px;
  object-fit: cover;
  aspect-ratio: 2 / 3;
  border: 1px solid var(--border-subtle);
}

.detail-right-col {
  display: flex;
  flex-direction: column;
}

.meta-info-box {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--border-subtle);
  padding: 12px;
  border-radius: 8px;
  font-size: 0.82rem;
  color: var(--text-secondary);
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.highlight-text {
  color: #ffffff;
  font-weight: 600;
}

.overview-text {
  font-size: 0.88rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 20px;
}

.seasons-section {
  margin-top: 12px;
}

.section-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.section-subtitle {
  font-size: 1rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 6px;
}

.watched-counter-badge {
  font-size: 0.78rem;
  color: var(--accent-red);
  font-weight: 700;
  background: var(--accent-red-subtle);
  padding: 3px 10px;
  border-radius: 6px;
  border: 1px solid var(--border-red);
}

.season-chips {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding-bottom: 6px;
  margin-bottom: 14px;
}

.season-chip {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--border-subtle);
  color: var(--text-secondary);
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s;
}

.season-chip.active {
  background: var(--accent-red);
  color: #ffffff;
  border-color: var(--accent-red);
}

.episodes-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 380px;
  overflow-y: auto;
}

.episode-item {
  display: flex;
  gap: 14px;
  padding: 12px;
  align-items: center;
  transition: all 0.2s;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--border-subtle);
}

.episode-item.watched {
  border-color: rgba(34, 197, 94, 0.35);
  background: rgba(34, 197, 94, 0.05);
}

.eps-banner-wrapper {
  position: relative;
  width: 110px;
  height: 62px;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
  background: #18181e;
}

.eps-still-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.eps-num-badge {
  position: absolute;
  bottom: 3px;
  left: 3px;
  background: rgba(10, 10, 12, 0.9);
  color: #ffffff;
  font-size: 0.68rem;
  font-weight: 700;
  padding: 1px 4px;
  border-radius: 3px;
}

.eps-info {
  flex: 1;
}

.eps-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2px;
}

.eps-name {
  font-size: 0.88rem;
  font-weight: 700;
  color: #ffffff;
}

.eps-date {
  font-size: 0.74rem;
  color: var(--text-muted);
  white-space: nowrap;
}

.eps-overview {
  font-size: 0.76rem;
  color: var(--text-secondary);
  line-height: 1.35;
}

.eps-check-btn {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: 1.5px solid var(--border-subtle);
  background: rgba(255, 255, 255, 0.04);
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
  padding: 0;
}

.eps-check-btn:hover {
  border-color: var(--accent-red);
  color: #ffffff;
  transform: scale(1.08);
  background: rgba(229, 9, 20, 0.15);
}

.eps-check-btn.active {
  background: var(--accent-red);
  border-color: var(--accent-red);
  color: #ffffff;
  box-shadow: 0 0 14px rgba(229, 9, 20, 0.45);
}

.eps-check-btn .check-svg,
.eps-check-btn .plus-svg {
  width: 18px;
  height: 18px;
}

/* EDIT MODAL */
.edit-modal-box {
  width: 90vw;
  max-width: 440px;
  padding: 28px;
  border-radius: 12px;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
}

.modal-title {
  font-size: 1.4rem;
  font-weight: 800;
  color: #ffffff;
  margin-bottom: 2px;
}

.modal-subtitle {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-bottom: 18px;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group label {
  display: block;
  font-size: 0.82rem;
  color: var(--text-secondary);
  font-weight: 600;
  margin-bottom: 6px;
}

.form-input {
  width: 100%;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--border-subtle);
  color: #ffffff;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 0.88rem;
}

.form-input.text-area {
  resize: vertical;
}

.checkbox-group {
  margin-top: -4px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: #ffffff;
  cursor: pointer;
}

.checkbox-label input {
  accent-color: var(--accent-red);
}

.star-rating-selector {
  display: flex;
  align-items: center;
  gap: 3px;
}

.star-icon {
  font-size: 1.15rem;
  color: #3f3f46;
  cursor: pointer;
  transition: color 0.15s;
}

.star-icon.active {
  color: var(--accent-star);
}

.rating-number {
  margin-left: 6px;
  font-size: 0.8rem;
  color: var(--accent-star);
  font-weight: 700;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 8px;
}

.loading-state, .empty-state {
  text-align: center;
  padding: 48px;
  color: var(--text-secondary);
}

.text-sm {
  font-size: 0.78rem;
  padding: 6px 12px;
}

/* Modal Overlay Fixed Overlay Styling */
.modal-overlay {
  position: fixed !important;
  inset: 0 !important;
  top: 0 !important;
  left: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  background: rgba(0, 0, 0, 0.85) !important;
  backdrop-filter: blur(12px) !important;
  -webkit-backdrop-filter: blur(12px) !important;
  z-index: 9999 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 20px !important;
}

@media (max-width: 768px) {
  .modal-overlay {
    padding: 0 !important;
  }

  .detail-modal-content.wide-modal {
    width: 100vw;
    height: 100vh;
    max-height: 100vh;
    border-radius: 0;
    border: none;
  }

  .hero-backdrop-banner {
    height: 180px;
  }

  .hero-backdrop-gradient {
    padding: 16px 18px;
  }

  .hero-media-title {
    font-size: 1.3rem;
  }

  .close-btn-fixed {
    top: 12px;
    right: 12px;
    width: 32px;
    height: 32px;
    font-size: 1.2rem;
  }

  .detail-body.wide-grid {
    grid-template-columns: 1fr;
    gap: 18px;
    padding: 18px 16px 36px 16px;
  }

  .detail-left-col {
    align-items: center;
  }

  .detail-poster-img {
    max-width: 140px;
  }

  .fav-toggle-btn, .meta-info-box {
    width: 100%;
  }

  .episode-item {
    display: grid;
    grid-template-columns: 90px 1fr;
    grid-template-rows: auto auto;
    gap: 10px;
    padding: 10px;
    align-items: flex-start;
  }

  .eps-banner-wrapper {
    width: 90px;
    height: 52px;
    grid-row: 1 / span 2;
  }

  .eps-info {
    grid-column: 2;
  }

  .eps-header {
    flex-direction: column;
    gap: 2px;
  }

  .eps-toggle-btn {
    grid-column: 2;
    align-self: flex-start;
    padding: 5px 10px;
    font-size: 0.74rem;
  }
}
</style>
