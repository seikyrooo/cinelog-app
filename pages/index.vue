<template>
  <div class="explore-page">
    <!-- Notification Toast -->
    <div v-if="toastMessage" class="toast-notification animate-fade-in" role="status" aria-live="polite">
      <svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
      <span>{{ toastMessage }}</span>
    </div>

    <!-- Enhanced Immersive Borderless Featured Spotlight Hero Banner (Cinematic Aesthetic) -->
    <section 
      v-if="featuredShow && !isSearchMode" 
      class="featured-hero-banner" 
      :style="getBackdropStyle(featuredShow)" 
      aria-label="Featured Spotlight"
    >
      <div class="featured-gradient-overlay">
        <div class="featured-content">
          <div class="featured-badges">
            <span class="badge-featured-pill">
              <svg class="icon-inline" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
              SPOTLIGHT
            </span>
            <span :class="['badge', featuredShow.media_type === 'tv' ? 'badge-tv' : 'badge-movie']">
              {{ featuredShow.media_type === 'tv' ? 'TV Series' : 'Movie' }}
            </span>
            <span class="hero-rating-badge" v-if="featuredShow.vote_average">
              <svg class="icon-star-gold" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
              {{ featuredShow.vote_average.toFixed(1) }} / 10 TMDB
            </span>
            <span class="hero-year-badge">
              {{ formatYear(featuredShow.release_date || featuredShow.first_air_date) }}
            </span>
          </div>

          <h1 class="featured-title">{{ featuredShow.title || featuredShow.name }}</h1>
          <p class="featured-overview">{{ truncateText(featuredShow.overview, 180) }}</p>

          <div class="featured-actions">
            <button @click="openSaveModal(featuredShow)" class="btn-primary btn-hero-play">
              <svg class="icon-inline" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
              <span>View Details & Episodes</span>
            </button>
            <button @click="openSaveModal(featuredShow)" class="btn-secondary btn-hero-info">
              <svg class="icon-inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <span>Add to Watchlist</span>
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Search Bar Section -->
    <section class="search-section" aria-labelledby="search-heading">
      <div class="search-bar-wrapper">
        <div class="search-box glass-card" role="search" aria-label="Search movies and TV shows">
          <svg class="search-leading-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input 
            v-model="searchQuery" 
            @keyup.enter="handleSearch"
            type="text" 
            placeholder="Search movies, TV shows, anime... (e.g. Stranger Things, Oppenheimer, The Last of Us)" 
            class="search-input"
            aria-label="Search query"
          />

          <div class="filter-type">
            <button 
              v-for="t in mediaTypes" 
              :key="t.value"
              @click="selectedType = t.value; if (searchQuery.trim()) handleSearch();"
              :class="['type-btn', { active: selectedType === t.value }]"
              :aria-pressed="selectedType === t.value"
            >
              {{ t.label }}
            </button>
          </div>

          <button @click="handleSearch" class="btn-primary search-action-btn">
            <svg class="icon-inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <span>Search</span>
          </button>
        </div>
      </div>
    </section>

    <!-- Search Loading State -->
    <div v-if="isSearching" class="loading-state">
      <div class="spinner"></div>
      <p>Searching TMDB catalog...</p>
    </div>

    <!-- Search Results Grid Mode -->
    <section v-else-if="isSearchMode" class="results-section" aria-labelledby="results-title">
      <div class="results-header">
        <div>
          <h2 id="results-title">{{ searchResults.length }} Results Found for "{{ searchQuery }}"</h2>
          <p class="results-sub">Click any title to view full synopsis, cast, episode tracking, or add to your watchlist.</p>
        </div>
        <button @click="clearSearch" class="btn-secondary text-sm">
          <span>✕ Clear Search</span>
        </button>
      </div>

      <!-- Search Empty State -->
      <div v-if="searchResults.length === 0" class="empty-state glass-card" role="status">
        <h2>No Results Found</h2>
        <p>We couldn't find any matches for "{{ searchQuery }}". Try adjusting your keywords or category filter.</p>
        <button @click="clearSearch" class="btn-primary" style="margin-top: 14px;">Return to Recommendations</button>
      </div>

      <!-- Search Grid -->
      <!-- Search Grid -->
      <div v-else class="media-grid">
        <div 
          v-for="item in searchResults" 
          :key="'search-' + item.id" 
          class="media-card glass-card clickable"
          @click="openSaveModal(item)"
          role="button"
          tabindex="0"
          @keyup.enter="openSaveModal(item)"
        >
          <div class="poster-wrapper">
            <img 
              :src="getImageUrl(item)" 
              :alt="item.title || item.name" 
              class="poster-img"
              @error="onImageError"
            />
            <span :class="['badge', item.media_type === 'tv' ? 'badge-tv' : 'badge-movie', 'type-badge']">
              {{ item.media_type === 'tv' ? 'TV' : 'Movie' }}
            </span>
            <span v-if="item.vote_average" class="rating-badge">
              <svg class="icon-star-gold" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
              {{ item.vote_average.toFixed(1) }}
            </span>

            <!-- Status Pill on Search Card (Watching / Completed / etc) -->
            <span v-if="getUserMediaStatus(item)" :class="['card-status-pill', getUserMediaStatus(item)?.status]">
              {{ getStatusBadgeLabel(getUserMediaStatus(item)) }}
            </span>
          </div>

          <div class="card-info">
            <h3 class="media-title">{{ item.title || item.name }}</h3>
            <p class="release-date">{{ formatYear(item.release_date || item.first_air_date) }}</p>
            <p class="overview">{{ truncateText(item.overview, 75) }}</p>

            <!-- Search Quick Action Buttons (Add to Watchlist + Favorite) -->
            <div class="card-quick-actions" @click.stop>
              <button 
                @click.stop="quickAddToWatchlist(item)" 
                :class="['btn-card-quick', 'btn-quick-watchlist', { 'in-watchlist': isInWatchlist(item) }]"
                :title="isInWatchlist(item) ? 'Saved in Watchlist (Click to view/edit)' : 'Add to Watchlist'"
              >
                <svg v-if="isInWatchlist(item)" class="btn-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <svg v-else class="btn-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                <span>{{ isInWatchlist(item) ? 'In Watchlist' : 'Watchlist' }}</span>
              </button>

              <button 
                @click.stop="quickToggleFavorite(item)" 
                :class="['btn-card-quick', 'btn-quick-fav', { 'is-favorite': isFavorite(item) }]"
                :title="isFavorite(item) ? 'Favorited' : 'Add to Favorites'"
                aria-label="Toggle Favorite"
              >
                <svg class="btn-icon-svg" viewBox="0 0 24 24" :fill="isFavorite(item) ? 'var(--accent-red)' : 'none'" :stroke="isFavorite(item) ? 'var(--accent-red)' : 'currentColor'" stroke-width="2.2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
                <span>{{ isFavorite(item) ? 'Favorited' : 'Favorite' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Horizontal Scrolling Shelves / Discovery Feeds (Cinematic Layout) -->
    <div v-else class="discovery-container">
      
      <!-- SHELF 1: Trending Now -->
      <section class="shelf-section" aria-labelledby="shelf-trending-title">
        <div class="shelf-header">
          <div class="shelf-title-group">
            <span class="shelf-indicator" aria-hidden="true"></span>
            <div>
              <h2 id="shelf-trending-title" class="shelf-title">Trending Now</h2>
              <p class="shelf-sub">The most-watched movies & TV series this week</p>
            </div>
          </div>

          <!-- Horizontal Scroll Navigation Buttons -->
          <div class="shelf-nav-controls">
            <button 
              @click="scrollShelf('shelf-trending', -1)" 
              class="shelf-arrow-btn" 
              aria-label="Scroll left"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            <button 
              @click="scrollShelf('shelf-trending', 1)" 
              class="shelf-arrow-btn" 
              aria-label="Scroll right"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
        </div>

        <div id="shelf-trending" class="shelf-scroll-track">
          <div 
            v-for="item in trendingList" 
            :key="'trending-' + item.id" 
            class="shelf-card clickable"
            @click="openSaveModal(item)"
            role="button"
            tabindex="0"
            @keyup.enter="openSaveModal(item)"
          >
            <div class="shelf-poster-wrapper">
              <img 
                :src="getImageUrl(item)" 
                :alt="item.title || item.name" 
                class="shelf-poster-img"
                @error="onImageError"
              />
              <span :class="['badge', item.media_type === 'tv' ? 'badge-tv' : 'badge-movie', 'shelf-type-badge']">
                {{ item.media_type === 'tv' ? 'TV' : 'Movie' }}
              </span>
              <span v-if="item.vote_average" class="shelf-rating-badge">
                ★ {{ item.vote_average.toFixed(1) }}
              </span>
              <span v-if="getUserMediaStatus(item)" :class="['shelf-status-pill', getUserMediaStatus(item)?.status]">
                {{ getStatusBadgeLabel(getUserMediaStatus(item)) }}
              </span>
            </div>
            <div class="shelf-card-info">
              <h3 class="shelf-card-title">{{ item.title || item.name }}</h3>
              <p class="shelf-card-year">{{ formatYear(item.release_date || item.first_air_date) }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- SHELF 2: Popular Movies -->
      <section class="shelf-section" aria-labelledby="shelf-movies-title">
        <div class="shelf-header">
          <div class="shelf-title-group">
            <span class="shelf-indicator" aria-hidden="true"></span>
            <div>
              <h2 id="shelf-movies-title" class="shelf-title">Popular Movies</h2>
              <p class="shelf-sub">Top blockbusters, theatrical releases, and audience picks</p>
            </div>
          </div>

          <div class="shelf-nav-controls">
            <button 
              @click="scrollShelf('shelf-movies', -1)" 
              class="shelf-arrow-btn" 
              aria-label="Scroll left"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            <button 
              @click="scrollShelf('shelf-movies', 1)" 
              class="shelf-arrow-btn" 
              aria-label="Scroll right"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
        </div>

        <div id="shelf-movies" class="shelf-scroll-track">
          <div 
            v-for="item in popularMovies" 
            :key="'pop-movie-' + item.id" 
            class="shelf-card clickable"
            @click="openSaveModal(item)"
            role="button"
            tabindex="0"
            @keyup.enter="openSaveModal(item)"
          >
            <div class="shelf-poster-wrapper">
              <img 
                :src="getImageUrl(item)" 
                :alt="item.title" 
                class="shelf-poster-img"
                @error="onImageError"
              />
              <span class="badge badge-movie shelf-type-badge">Movie</span>
              <span v-if="item.vote_average" class="shelf-rating-badge">
                ★ {{ item.vote_average.toFixed(1) }}
              </span>
              <span v-if="getUserMediaStatus(item)" :class="['shelf-status-pill', getUserMediaStatus(item)?.status]">
                {{ getStatusBadgeLabel(getUserMediaStatus(item)) }}
              </span>
            </div>
            <div class="shelf-card-info">
              <h3 class="shelf-card-title">{{ item.title }}</h3>
              <p class="shelf-card-year">{{ formatYear(item.release_date) }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- SHELF 3: Binge-Worthy Series -->
      <section class="shelf-section" aria-labelledby="shelf-tv-title">
        <div class="shelf-header">
          <div class="shelf-title-group">
            <span class="shelf-indicator" aria-hidden="true"></span>
            <div>
              <h2 id="shelf-tv-title" class="shelf-title">Binge-Worthy Series</h2>
              <p class="shelf-sub">Top television dramas, thriller, and active seasons</p>
            </div>
          </div>

          <div class="shelf-nav-controls">
            <button 
              @click="scrollShelf('shelf-tv', -1)" 
              class="shelf-arrow-btn" 
              aria-label="Scroll left"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            <button 
              @click="scrollShelf('shelf-tv', 1)" 
              class="shelf-arrow-btn" 
              aria-label="Scroll right"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
        </div>

        <div id="shelf-tv" class="shelf-scroll-track">
          <div 
            v-for="item in popularShows" 
            :key="'pop-tv-' + item.id" 
            class="shelf-card clickable"
            @click="openSaveModal(item)"
            role="button"
            tabindex="0"
            @keyup.enter="openSaveModal(item)"
          >
            <div class="shelf-poster-wrapper">
              <img 
                :src="getImageUrl(item)" 
                :alt="item.name" 
                class="shelf-poster-img"
                @error="onImageError"
              />
              <span class="badge badge-tv shelf-type-badge">TV Series</span>
              <span v-if="item.vote_average" class="shelf-rating-badge">
                ★ {{ item.vote_average.toFixed(1) }}
              </span>
              <span v-if="getUserMediaStatus(item)" :class="['shelf-status-pill', getUserMediaStatus(item)?.status]">
                {{ getStatusBadgeLabel(getUserMediaStatus(item)) }}
              </span>
            </div>
            <div class="shelf-card-info">
              <h3 class="shelf-card-title">{{ item.name }}</h3>
              <p class="shelf-card-year">{{ formatYear(item.first_air_date) }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- SHELF 4: Top Rated Masterpieces -->
      <section class="shelf-section" aria-labelledby="shelf-toprated-title">
        <div class="shelf-header">
          <div class="shelf-title-group">
            <span class="shelf-indicator" aria-hidden="true"></span>
            <div>
              <h2 id="shelf-toprated-title" class="shelf-title">Top Rated Masterpieces</h2>
              <p class="shelf-sub">Critically acclaimed cinema and modern classics</p>
            </div>
          </div>

          <div class="shelf-nav-controls">
            <button 
              @click="scrollShelf('shelf-toprated', -1)" 
              class="shelf-arrow-btn" 
              aria-label="Scroll left"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            <button 
              @click="scrollShelf('shelf-toprated', 1)" 
              class="shelf-arrow-btn" 
              aria-label="Scroll right"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
        </div>

        <div id="shelf-toprated" class="shelf-scroll-track">
          <div 
            v-for="item in topRatedList" 
            :key="'toprated-' + item.id" 
            class="shelf-card clickable"
            @click="openSaveModal(item)"
            role="button"
            tabindex="0"
            @keyup.enter="openSaveModal(item)"
          >
            <div class="shelf-poster-wrapper">
              <img 
                :src="getImageUrl(item)" 
                :alt="item.title || item.name" 
                class="shelf-poster-img"
                @error="onImageError"
              />
              <span :class="['badge', item.media_type === 'tv' ? 'badge-tv' : 'badge-movie', 'shelf-type-badge']">
                {{ item.media_type === 'tv' ? 'TV' : 'Movie' }}
              </span>
              <span v-if="item.vote_average" class="shelf-rating-badge">
                ★ {{ item.vote_average.toFixed(1) }}
              </span>
              <span v-if="getUserMediaStatus(item)" :class="['shelf-status-pill', getUserMediaStatus(item)?.status]">
                {{ getStatusBadgeLabel(getUserMediaStatus(item)) }}
              </span>
            </div>
            <div class="shelf-card-info">
              <h3 class="shelf-card-title">{{ item.title || item.name }}</h3>
              <p class="shelf-card-year">{{ formatYear(item.release_date || item.first_air_date) }}</p>
            </div>
          </div>
        </div>
      </section>

    </div>

    <!-- Modal Full Detail Spasius & Responsive Mobile-First Layout -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal-content glass-panel detail-modal-content wide-modal animate-fade-in">
        
        <!-- Fixed Top Right Close Button -->
        <button @click="showModal = false" class="close-btn-fixed" title="Close Dialog" aria-label="Close modal">&times;</button>

        <!-- Movie/Show Hero Backdrop Banner -->
        <div class="hero-backdrop-banner" :style="getBackdropStyle(activeItem)">
          <div class="hero-backdrop-gradient">
            <div class="hero-media-info">
              <div class="banner-badges">
                <span :class="['badge', activeItem?.media_type === 'tv' ? 'badge-tv' : 'badge-movie']">
                  {{ activeItem?.media_type === 'tv' ? 'TV Show' : 'Movie' }}
                </span>
                <span v-if="activeItem?.vote_average" class="hero-rating-badge">
                  <svg class="icon-star-gold" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                  {{ activeItem.vote_average.toFixed(1) }} / 10.0 TMDB Rating
                </span>
              </div>
              <h2 class="hero-media-title">{{ activeItem?.title || activeItem?.name }}</h2>
              <p class="hero-media-subtitle">
                {{ formatYear(activeItem?.release_date || activeItem?.first_air_date) }}
                <span v-if="detailedInfo?.media_status"> • {{ detailedInfo.media_status }}</span>
              </p>
            </div>
          </div>
        </div>

        <!-- Wide 2-Column Responsive Layout Body -->
        <div class="detail-body wide-grid">
          
          <!-- Left Column: Poster & Quick Action Bar & Metadata -->
          <div class="detail-left-col">
            <div class="detail-poster-wrap">
              <img 
                :src="getImageUrl(activeItem)" 
                :alt="activeItem?.title || activeItem?.name" 
                class="detail-poster-img"
                @error="onImageError"
              />
            </div>

            <!-- Quick Action Bar -->
            <div class="quick-add-bar glass-card">
              <div class="quick-action-icon-row">
                <button 
                  @click="saveToWatchlist('watching')" 
                  :class="['icon-action-btn', 'btn-primary-action', { 'in-watchlist': watchlistContext }]"
                  :disabled="isSaving"
                  :title="watchlistContext ? 'Saved in Watchlist (Click to save edits)' : 'Add to Watchlist'"
                  :aria-label="watchlistContext ? 'Saved in Watchlist' : 'Add to Watchlist'"
                >
                  <svg v-if="watchlistContext" class="action-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <svg v-else class="action-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </button>
                <button 
                  @click="form.favorite = !form.favorite; saveToWatchlist('watching')" 
                  :class="['icon-action-btn', 'btn-secondary', { active: form.favorite }]"
                  :title="form.favorite ? 'Favorited' : 'Add to Favorites'"
                  aria-label="Toggle Favorite"
                >
                  <svg class="action-svg" viewBox="0 0 24 24" :fill="form.favorite ? 'var(--accent-red)' : 'none'" :stroke="form.favorite ? 'var(--accent-red)' : 'currentColor'" stroke-width="2.2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Metadata Box -->
            <div v-if="isFetchingDetail" class="loading-state text-sm">
              <div class="spinner"></div>
              <span>Fetching director & cast details...</span>
            </div>

            <div v-else-if="detailedInfo" class="meta-info-box glass-card">
              <p v-if="detailedInfo.director">
                <strong>Director / Creator:</strong> <br>
                <span class="highlight-text">{{ detailedInfo.director }}</span>
              </p>
              <p v-if="detailedInfo.cast">
                <strong>Main Cast:</strong> <br>
                {{ detailedInfo.cast }}
              </p>
              <p v-if="detailedInfo.media_type === 'tv'">
                <strong>Total Episodes:</strong> {{ detailedInfo.total_episodes || 'TBA' }} eps ({{ seasonsCount }} Season{{ seasonsCount > 1 ? 's' : '' }})
              </p>
            </div>
          </div>

          <!-- Right Column: Overview, Seasons Selector, & Spacious Episode Grid -->
          <div class="detail-right-col">
            <h4 class="section-subtitle">Storyline Synopsis</h4>
            <p class="overview-text">{{ activeItem?.overview || 'No synopsis summary available for this title.' }}</p>

            <!-- If TV Show: Season Selector & Episodes List -->
            <div v-if="activeItem?.media_type === 'tv' || !activeItem?.media_type" class="seasons-section">
              <div class="section-header-row">
                <h4 class="section-subtitle">Seasons & Episodes</h4>
                <span class="watched-counter-badge" v-if="watchlistContext">
                  Progress: {{ watchlistContext.episodes_watched }} eps watched
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

              <!-- Episodes List -->
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

                  <!-- Watched Toggle Icon Button -->
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
const router = useRouter()

const searchQuery = ref('')
const selectedType = ref('all')
const isSearching = ref(false)
const isSearchMode = ref(false)
const searchResults = ref<any[]>([])
const toastMessage = ref('')

// Curated instant initial feeds with verified TMDB CDN paths
const DEFAULT_TRENDING = [
  {
    id: 66732,
    title: 'Stranger Things',
    name: 'Stranger Things',
    media_type: 'tv',
    overview: 'When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces, and one strange little girl.',
    poster_path: '/uOOtwVbSr4QDjAGIifLDwpb2Pdl.jpg',
    backdrop_path: '/56v2KjBlU4XaOv9rVYEQypROD7P.jpg',
    vote_average: 8.6,
    first_air_date: '2016-07-15'
  },
  {
    id: 872585,
    title: 'Oppenheimer',
    name: 'Oppenheimer',
    media_type: 'movie',
    overview: 'The story of J. Robert Oppenheimer’s role in the development of the atomic bomb during World War II.',
    poster_path: '/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    backdrop_path: '/neeNHeXjMF5fXoCJRsOmkNGC7q.jpg',
    vote_average: 8.1,
    release_date: '2023-07-19'
  },
  {
    id: 100088,
    title: 'The Last of Us',
    name: 'The Last of Us',
    media_type: 'tv',
    overview: 'Twenty years after modern civilization has been destroyed, Joel, a hardened survivor, is hired to smuggle Ellie, a 14-year-old girl, out of an oppressive quarantine zone.',
    poster_path: '/dmo6TYuuJgaYinXBPjrgG9mB5od.jpg',
    backdrop_path: '/lY2DhbA7Hy44fAKddr06UrXWWaQ.jpg',
    vote_average: 8.6,
    first_air_date: '2023-01-15'
  },
  {
    id: 693134,
    title: 'Dune: Part Two',
    name: 'Dune: Part Two',
    media_type: 'movie',
    overview: 'Follow the mythic journey of Paul Atreides as he unites with Chani and the Fremen while on a path of revenge against the conspirators who destroyed his family.',
    poster_path: '/6izwz7rsy95ARzTR3poZ8H6c5pp.jpg',
    backdrop_path: '/eZ239CUp1d6OryZEBPnO2n87gMG.jpg',
    vote_average: 8.2,
    release_date: '2024-02-27'
  },
  {
    id: 94605,
    title: 'Arcane',
    name: 'Arcane',
    media_type: 'tv',
    overview: 'Amid the stark discord of twin cities Piltover and Zaun, two sisters fight on rival sides of a war between magic technologies and clashing convictions.',
    poster_path: '/fqldf2t8ztc9aiwn3k6mlX3tvRT.jpg',
    backdrop_path: '/q8eejQcg1bAqImEV8jh8RtBD4uH.jpg',
    vote_average: 8.8,
    first_air_date: '2021-11-06'
  },
  {
    id: 157336,
    title: 'Interstellar',
    name: 'Interstellar',
    media_type: 'movie',
    overview: 'The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.',
    poster_path: '/yQvGrMoipbRoddT0ZR8tPoR7NfX.jpg',
    backdrop_path: '/5XNQBqnBwPA9yT0jZ0p3s8bbLh0.jpg',
    vote_average: 8.4,
    release_date: '2014-11-05'
  },
  {
    id: 76479,
    title: 'The Boys',
    name: 'The Boys',
    media_type: 'tv',
    overview: 'A fun and irreverent take on what happens when superheroes, who are as popular as celebrities, as influential as politicians and as revered as gods, abuse their superpowers rather than use them for good.',
    poster_path: '/in1R2dDc421JxsoRWaIIAqVI2KE.jpg',
    backdrop_path: '/n6vVs6z8obNbExdD3QHTr4Utu1Z.jpg',
    vote_average: 8.5,
    first_air_date: '2019-07-26'
  },
  {
    id: 27205,
    title: 'Inception',
    name: 'Inception',
    media_type: 'movie',
    overview: 'Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets is offered a chance to regain his old life as payment for a task considered to be impossible: "inception".',
    poster_path: '/xlaY2zyzMfkhk0HSC5VUwzoZPU1.jpg',
    backdrop_path: '/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg',
    vote_average: 8.4,
    release_date: '2010-07-15'
  }
]

const trendingList = ref<any[]>([...DEFAULT_TRENDING])
const popularMovies = ref<any[]>([...DEFAULT_TRENDING.filter(m => m.media_type === 'movie')])
const popularShows = ref<any[]>([...DEFAULT_TRENDING.filter(m => m.media_type === 'tv')])
const topRatedList = ref<any[]>([...DEFAULT_TRENDING])
const featuredShow = ref<any>(DEFAULT_TRENDING[0])

const mediaTypes = [
  { label: 'All', value: 'all' },
  { label: 'Movies', value: 'movie' },
  { label: 'TV Series', value: 'tv' }
]

const showModal = ref(false)
const activeItem = ref<any>(null)
const isSaving = ref(false)
const isFetchingDetail = ref(false)
const detailedInfo = ref<any>(null)
const selectedSeason = ref(1)
const episodesList = ref<any[]>([])
const isLoadingEpisodes = ref(false)
const watchlistContext = ref<any>(null)

const form = ref({
  status: 'watching',
  rating: 0,
  favorite: false,
  notes: '',
  season_watched: 1,
  episodes_watched: 0,
  total_episodes: 0
})

const seasonsCount = computed(() => {
  if (detailedInfo.value?.seasons?.length) {
    return detailedInfo.value.seasons.length
  }
  return detailedInfo.value?.total_seasons || 1
})

const userWatchlistMap = ref<Record<string, any>>({})

onMounted(async () => {
  if (import.meta.client) {
    authStore.initAuth()
  }
  await Promise.all([
    loadDiscoveryFeeds(),
    loadUserWatchlistMap()
  ])
})

watch(() => authStore.token, (newToken) => {
  if (newToken) {
    loadUserWatchlistMap()
  } else {
    userWatchlistMap.value = {}
  }
})

const loadUserWatchlistMap = async () => {
  let token = authStore.token
  if (!token && import.meta.client) {
    token = localStorage.getItem('cinelog_token')
  }
  if (!token) {
    userWatchlistMap.value = {}
    return
  }
  try {
    const res: any = await $fetch(useApiUrl('/api/user/watchlist'), {
      headers: { Authorization: `Bearer ${token}` }
    }).catch(() => null)

    const list = res?.data || []
    const map: Record<string, any> = {}
    for (const item of list) {
      const tmdbId = item.movie?.tmdb_id || item.tmdb_id || item.movie?.id || item.id
      const mediaType = item.movie?.media_type || item.media_type || 'movie'
      if (tmdbId) {
        map[`${tmdbId}_${mediaType}`] = item
        map[`${tmdbId}`] = item
      }
    }
    userWatchlistMap.value = map
  } catch (err) {
    console.error('Failed to load user watchlist map:', err)
  }
}

const getUserMediaStatus = (item: any) => {
  if (!item) return null
  const id = item.id || item.tmdb_id || item.movie?.tmdb_id || item.movie?.id
  const type = item.media_type || item.movie?.media_type || 'movie'
  if (!id) return null
  return userWatchlistMap.value[`${id}_${type}`] || userWatchlistMap.value[`${id}`] || null
}

const isInWatchlist = (item: any) => !!getUserMediaStatus(item)
const isFavorite = (item: any) => !!getUserMediaStatus(item)?.favorite

const getStatusBadgeLabel = (entry: any) => {
  if (!entry) return ''
  const status = entry.status || 'watching'
  if (status === 'completed') return 'Completed ✓'
  if (status === 'watching') {
    if (entry.media_type === 'tv' || entry.movie?.media_type === 'tv') {
      if (entry.episodes_watched > 0) return `Watching (E${entry.episodes_watched})`
    }
    return 'Watching'
  }
  if (status === 'plan_to_watch') return 'Plan to Watch'
  if (status === 'dropped') return 'Dropped'
  if (status === 'on_hold') return 'On Hold'
  return status
}

const quickAddToWatchlist = async (item: any) => {
  let token = authStore.token
  if (!token && import.meta.client) {
    token = localStorage.getItem('cinelog_token')
  }
  if (!token) {
    showToast('Please sign in to add to your watchlist.')
    router.push('/login')
    return
  }

  const existing = getUserMediaStatus(item)
  if (existing) {
    openSaveModal(item)
    return
  }

  try {
    const payload = {
      tmdb_id: Number(item.id || item.tmdb_id),
      media_type: item.media_type || 'movie',
      title: item.title || item.name || '',
      overview: item.overview || '',
      poster_path: item.poster_path || '',
      backdrop_path: item.backdrop_path || '',
      release_date: item.release_date || item.first_air_date || '',
      vote_average: item.vote_average || 0,
      status: 'watching',
      favorite: false
    }

    const res: any = await $fetch(useApiUrl('/api/user/watchlist'), {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: payload
    })

    if (res?.data) {
      const id = item.id || item.tmdb_id
      const type = item.media_type || 'movie'
      userWatchlistMap.value[`${id}_${type}`] = res.data
      userWatchlistMap.value[`${id}`] = res.data
      showToast(`Saved to Watchlist: ${payload.title}`)
    }
  } catch (err: any) {
    console.error('Quick add to watchlist error:', err)
    showToast(err?.data?.error || 'Failed to add to watchlist.')
  }
}

const quickToggleFavorite = async (item: any) => {
  let token = authStore.token
  if (!token && import.meta.client) {
    token = localStorage.getItem('cinelog_token')
  }
  if (!token) {
    showToast('Please sign in first.')
    router.push('/login')
    return
  }

  const existing = getUserMediaStatus(item)
  const newFavStatus = !existing?.favorite

  try {
    if (existing?.id) {
      const res: any = await $fetch(useApiUrl(`/api/user/watchlist/${existing.id}`), {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: { favorite: newFavStatus }
      })

      if (res?.data) {
        existing.favorite = newFavStatus
        const id = item.id || item.tmdb_id
        const type = item.media_type || 'movie'
        userWatchlistMap.value[`${id}_${type}`] = existing
        userWatchlistMap.value[`${id}`] = existing
        showToast(newFavStatus ? `Favorited "${item.title || item.name}"!` : `Removed from favorites.`)
      }
    } else {
      const payload = {
        tmdb_id: Number(item.id || item.tmdb_id),
        media_type: item.media_type || 'movie',
        title: item.title || item.name || '',
        overview: item.overview || '',
        poster_path: item.poster_path || '',
        backdrop_path: item.backdrop_path || '',
        release_date: item.release_date || item.first_air_date || '',
        vote_average: item.vote_average || 0,
        status: 'watching',
        favorite: true
      }

      const res: any = await $fetch(useApiUrl('/api/user/watchlist'), {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: payload
      })

      if (res?.data) {
        const id = item.id || item.tmdb_id
        const type = item.media_type || 'movie'
        userWatchlistMap.value[`${id}_${type}`] = res.data
        userWatchlistMap.value[`${id}`] = res.data
        showToast(`Favorited "${payload.title}"!`)
      }
    }
  } catch (err: any) {
    console.error('Quick toggle favorite error:', err)
    showToast(err?.data?.error || 'Failed to update favorite.')
  }
}


const loadDiscoveryFeeds = async () => {
  try {
    const [trendingRes, popMoviesRes, popShowsRes, topRatedRes]: any[] = await Promise.all([
      $fetch(useApiUrl('/api/trending'), { params: { type: 'all', time: 'week' } }).catch(() => ({ data: [] })),
      $fetch(useApiUrl('/api/discover'), { params: { type: 'movie', sort: 'popularity.desc' } }).catch(() => ({ data: [] })),
      $fetch(useApiUrl('/api/discover'), { params: { type: 'tv', sort: 'popularity.desc' } }).catch(() => ({ data: [] })),
      $fetch(useApiUrl('/api/discover'), { params: { type: 'movie', sort: 'vote_average.desc' } }).catch(() => ({ data: [] }))
    ])

    if (trendingRes?.data?.length > 0) trendingList.value = trendingRes.data
    if (popMoviesRes?.data?.length > 0) popularMovies.value = popMoviesRes.data
    if (popShowsRes?.data?.length > 0) popularShows.value = popShowsRes.data
    if (topRatedRes?.data?.length > 0) topRatedList.value = topRatedRes.data

    if (trendingList.value.length > 0) {
      featuredShow.value = trendingList.value.find((item: any) => item.backdrop_path) || trendingList.value[0]
    }
  } catch (err) {
    console.error('Failed to load discovery feeds', err)
  }
}

const scrollShelf = (shelfId: string, direction: number) => {
  const container = document.getElementById(shelfId)
  if (container) {
    const scrollAmount = container.clientWidth * 0.75 * direction
    container.scrollBy({ left: scrollAmount, behavior: 'smooth' })
  }
}

const showToast = (msg: string) => {
  toastMessage.value = msg
  setTimeout(() => {
    toastMessage.value = ''
  }, 3500)
}

const handleSearch = async () => {
  const query = searchQuery.value.trim()
  if (!query) {
    clearSearch()
    return
  }

  isSearching.value = true
  isSearchMode.value = true

  try {
    const res: any = await $fetch(useApiUrl('/api/search'), {
      params: {
        q: query,
        type: selectedType.value
      }
    })
    searchResults.value = res.data || []
  } catch (err) {
    console.error(err)
    searchResults.value = []
  } finally {
    isSearching.value = false
  }
}

const clearSearch = () => {
  searchQuery.value = ''
  isSearchMode.value = false
  searchResults.value = []
}

const { getPosterUrl, getImageUrl, getBackdropUrl, onImageError, padZero, formatYear } = useFormatters()

const getPoster = (itemOrPath: any) => getPosterUrl(itemOrPath)

const getBackdropStyle = (media: any) => {
  return { backgroundImage: `url(${getBackdropUrl(media)})` }
}

const getEpisodeStillUrl = (path: string) => getPosterUrl(path)

const onEpsImageError = (e: Event) => {
  const target = e.target as HTMLImageElement
  if (target && !target.src.includes('unsplash')) {
    target.src = 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&w=500&q=80'
  }
}

const truncateText = (text: string, len: number) => {
  if (!text) return ''
  return text.length > len ? text.substring(0, len) + '...' : text
}

const getGlobalEpisodeNumber = (seasonNumber: number, epsNumber: number) => {
  const seasons = detailedInfo.value?.seasons || watchlistContext.value?.movie?.seasons || []
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

  const totalSeasons = detailedInfo.value?.total_seasons || watchlistContext.value?.movie?.total_seasons || seasonsCount.value || 1
  const totalEps = detailedInfo.value?.total_episodes || watchlistContext.value?.movie?.total_episodes || 0
  if (totalSeasons > 1 && totalEps > 0) {
    const avgPerSeason = Math.ceil(totalEps / totalSeasons)
    return ((seasonNumber - 1) * avgPerSeason) + epsNumber
  }

  return epsNumber
}

const isEpisodeWatched = (epsNumber: number) => {
  if (!watchlistContext.value) return false
  const watchedCount = watchlistContext.value.episodes_watched || 0
  const totalEps = watchlistContext.value.total_episodes || watchlistContext.value.movie?.total_episodes || detailedInfo.value?.total_episodes || 0
  
  if (totalEps > 0 && watchedCount >= totalEps) {
    return true
  }

  const globalEps = getGlobalEpisodeNumber(selectedSeason.value, epsNumber)
  return globalEps <= watchedCount
}

const toggleEpisodeWatched = async (epsNumber: number) => {
  if (!authStore.isAuth) {
    showToast('Please sign in first.')
    router.push('/login')
    return
  }

  const globalEps = getGlobalEpisodeNumber(selectedSeason.value, epsNumber)
  const isWatched = isEpisodeWatched(epsNumber)
  const targetCount = isWatched ? Math.max(0, globalEps - 1) : globalEps

  form.value.season_watched = selectedSeason.value
  form.value.episodes_watched = targetCount

  if (watchlistContext.value?.id) {
    try {
      const res: any = await $fetch(useApiUrl(`/api/user/watchlist/${watchlistContext.value.id}/set-progress`), {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${authStore.token}`
        },
        body: {
          season_watched: selectedSeason.value,
          episodes_watched: targetCount
        }
      })
      watchlistContext.value = res.data
      if (res.data?.status === 'completed') {
        showToast('🎉 Series Completed! All episodes watched.')
      } else {
        showToast(`Progress logged: S${selectedSeason.value} E${epsNumber} (${targetCount} eps)`)
      }
    } catch (err) {
      console.error(err)
    }
  } else {
    await saveToWatchlist('watching', targetCount)
  }
}

const openSaveModal = async (item: any) => {
  activeItem.value = { ...item }
  detailedInfo.value = null
  episodesList.value = []
  selectedSeason.value = 1
  watchlistContext.value = null

  form.value = {
    status: 'watching',
    rating: 0,
    favorite: false,
    notes: '',
    season_watched: 1,
    episodes_watched: 0,
    total_episodes: 0
  }

  showModal.value = true
  isFetchingDetail.value = true

  try {
    const detailRes: any = await $fetch(useApiUrl('/api/detail'), {
      params: {
        id: item.id || item.tmdb_id,
        type: item.media_type || 'movie'
      }
    })
    if (detailRes.data) {
      detailedInfo.value = detailRes.data
      activeItem.value = { ...activeItem.value, ...detailRes.data }
      form.value.total_episodes = detailedInfo.value?.total_episodes || 0
    }

    if (authStore.isAuth) {
      try {
        const checkRes: any = await $fetch(useApiUrl(`/api/user/watchlist/check/${item.id}`), {
          params: { type: item.media_type || 'movie' },
          headers: { Authorization: `Bearer ${authStore.token}` }
        })
        if (checkRes.in_watchlist && checkRes.data) {
          watchlistContext.value = checkRes.data
          form.value.status = checkRes.data.status
          form.value.rating = checkRes.data.rating || 0
          form.value.favorite = checkRes.data.favorite || false
          form.value.notes = checkRes.data.notes || ''
          form.value.season_watched = checkRes.data.season_watched || 1
          form.value.episodes_watched = checkRes.data.episodes_watched || 0
          selectedSeason.value = checkRes.data.season_watched || 1
        }
      } catch (e) {
        console.error(e)
      }
    }

    if (item.media_type === 'tv' || !item.media_type) {
      await fetchSeasonEpisodes(selectedSeason.value)
    }
  } catch (err) {
    console.error(err)
  } finally {
    isFetchingDetail.value = false
  }
}

const fetchSeasonEpisodes = async (seasonNum: number) => {
  selectedSeason.value = seasonNum
  isLoadingEpisodes.value = true
  try {
    const res: any = await $fetch(useApiUrl('/api/tv/season'), {
      params: {
        id: activeItem.value.id,
        season: seasonNum
      }
    })
    episodesList.value = res.data || []
  } catch (err) {
    console.error(err)
    episodesList.value = []
  } finally {
    isLoadingEpisodes.value = false
  }
}

const saveToWatchlist = async (statusOverride?: string, epsOverride?: number) => {
  if (!authStore.isAuth) {
    showToast('Please sign in first.')
    router.push('/login')
    return
  }
  if (!activeItem.value) return
  isSaving.value = true

  try {
    const payload = {
      tmdb_id: activeItem.value.id,
      media_type: activeItem.value.media_type || 'movie',
      title: activeItem.value.title || activeItem.value.name,
      overview: activeItem.value.overview || '',
      poster_path: activeItem.value.poster_path || '',
      backdrop_path: activeItem.value.backdrop_path || '',
      release_date: activeItem.value.release_date || activeItem.value.first_air_date || '',
      vote_average: activeItem.value.vote_average || 0,
      director: detailedInfo.value?.director || '',
      cast: detailedInfo.value?.cast || '',
      total_seasons: detailedInfo.value?.total_seasons || 0,
      next_air_date: detailedInfo.value?.next_air_date || '',
      next_episode_name: detailedInfo.value?.next_episode_name || '',
      media_status: detailedInfo.value?.media_status || '',
      status: ((activeItem.value.media_type || 'movie') === 'movie' && form.value.rating > 0) ? 'completed' : (statusOverride || form.value.status),
      rating: Math.min(10, Math.max(0, form.value.rating)),
      favorite: form.value.favorite,
      notes: form.value.notes,
      season_watched: selectedSeason.value || form.value.season_watched,
      episodes_watched: epsOverride !== undefined ? epsOverride : form.value.episodes_watched,
      total_episodes: form.value.total_episodes || detailedInfo.value?.total_episodes || 0
    }

    const res: any = await $fetch(useApiUrl('/api/user/watchlist'), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authStore.token}`
      },
      body: payload
    })

    if (res.data) {
      watchlistContext.value = res.data
      const id = activeItem.value.id || activeItem.value.tmdb_id
      const type = activeItem.value.media_type || 'movie'
      userWatchlistMap.value[`${id}_${type}`] = res.data
      userWatchlistMap.value[`${id}`] = res.data
      showToast(form.value.favorite ? `Added to Favorites! ★` : `Saved to Watchlist: ${payload.title}`)
    }
  } catch (err: any) {
    console.error(err)
    showToast(err?.data?.error || 'Failed to save to watchlist.')
  } finally {
    isSaving.value = false
  }
}
</script>

<style scoped>
.explore-page {
  display: flex;
  flex-direction: column;
  gap: 36px;
}

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

.icon-star-gold {
  width: 13px;
  height: 13px;
  color: var(--accent-star);
}

/* =========================================================================
   CINEMATIC BORDERLESS HERO BANNER (NO TACKY LIGHT BORDER / IDLIX AESTHETIC)
   ========================================================================= */
.featured-hero-banner {
  position: relative;
  min-height: 460px;
  border-radius: 18px;
  overflow: hidden;
  background-size: cover;
  background-position: center top;
  border: none !important;
  box-shadow: 0 30px 60px -15px rgba(0, 0, 0, 0.95), 0 0 40px -10px rgba(229, 9, 20, 0.15);
}

.featured-gradient-overlay {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(90deg, #0a0a0c 0%, rgba(10, 10, 12, 0.94) 38%, rgba(10, 10, 12, 0.5) 70%, rgba(10, 10, 12, 0.8) 100%),
    linear-gradient(180deg, rgba(10, 10, 12, 0.02) 0%, rgba(10, 10, 12, 0.4) 50%, #0a0a0c 100%);
  display: flex;
  align-items: flex-end;
  padding: 44px 48px;
}

.featured-content {
  display: flex;
  flex-direction: column;
  gap: 14px;
  max-width: 660px;
}

.featured-badges {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.badge-featured-pill {
  background: var(--accent-red);
  color: #ffffff;
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  padding: 4px 10px;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.hero-rating-badge {
  color: #ffffff;
  font-weight: 700;
  font-size: 0.84rem;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.hero-year-badge {
  color: var(--text-muted);
  font-size: 0.82rem;
  font-weight: 600;
}

.featured-title {
  font-size: clamp(2rem, 4.2vw, 3.4rem);
  font-weight: 900;
  color: #ffffff;
  line-height: 1.05;
  letter-spacing: -0.02em;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.9);
}

.featured-overview {
  color: #e2e8f0;
  font-size: 0.95rem;
  line-height: 1.65;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.95);
}

.featured-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn-hero-primary {
  padding: 12px 24px;
  font-size: 0.95rem;
}

.btn-hero-info {
  padding: 12px 20px;
  font-size: 0.95rem;
}

/* =========================================================================
   SEARCH BAR & CATEGORY PILLS
   ========================================================================= */
.search-section {
  margin-bottom: 40px;
}

.search-bar-wrapper {
  max-width: 800px;
  margin: 0 auto;
}

.search-box {
  display: flex;
  align-items: center;
  padding: 6px 10px 6px 18px;
  gap: 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 50px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.search-box:focus-within {
  border-color: var(--accent-red);
  box-shadow: 0 0 0 3px rgba(229, 9, 20, 0.2), 0 12px 40px rgba(0, 0, 0, 0.7);
  background: rgba(255, 255, 255, 0.05);
}

.search-leading-icon {
  width: 20px;
  height: 20px;
  color: var(--text-muted);
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  color: #ffffff;
  font-size: 1rem;
  padding: 10px 0;
  outline: none;
  font-family: inherit;
}

.search-input::placeholder {
  color: var(--text-muted);
}

.filter-type {
  display: flex;
  gap: 4px;
  background: rgba(255, 255, 255, 0.04);
  padding: 3px;
  border-radius: 8px;
}

.type-btn {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  padding: 6px 12px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.type-btn.active {
  background: var(--accent-red);
  color: #ffffff;
}

/* =========================================================================
   HORIZONTAL SCROLLING SHELVES (IDLIX / NETFLIX SLIDER)
   ========================================================================= */
.discovery-container {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.shelf-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.shelf-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4px;
}

.shelf-title-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.shelf-indicator {
  display: inline-block;
  width: 4px;
  height: 24px;
  background: var(--accent-red);
  border-radius: 2px;
  box-shadow: 0 0 12px rgba(229, 9, 20, 0.6);
  flex-shrink: 0;
}

.shelf-title {
  font-size: 1.35rem;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: -0.01em;
}

.shelf-sub {
  color: var(--text-muted);
  font-size: 0.84rem;
  margin-top: 1px;
}

.shelf-nav-controls {
  display: flex;
  gap: 8px;
}

.shelf-arrow-btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-subtle);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.shelf-arrow-btn svg {
  width: 18px;
  height: 18px;
}

.shelf-arrow-btn:hover {
  background: var(--accent-red);
  border-color: var(--accent-red);
  transform: scale(1.05);
}

.shelf-scroll-track {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  scroll-behavior: smooth;
  scroll-snap-type: x mandatory;
  padding: 4px 2px 16px 2px;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.15) transparent;
}

.shelf-scroll-track::-webkit-scrollbar {
  height: 6px;
}

.shelf-scroll-track::-webkit-scrollbar-track {
  background: transparent;
}

.shelf-scroll-track::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.12);
  border-radius: 4px;
}

.shelf-scroll-track::-webkit-scrollbar-thumb:hover {
  background: var(--accent-red);
}

.shelf-card {
  flex: 0 0 175px;
  scroll-snap-align: start;
  border-radius: 10px;
  overflow: hidden;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
}

.shelf-card:hover {
  border-color: var(--accent-red);
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 12px 25px -5px rgba(0, 0, 0, 0.8), 0 0 15px -3px rgba(229, 9, 20, 0.35);
}

.shelf-poster-wrapper {
  position: relative;
  width: 100%;
  padding-top: 148%;
  background: #141418;
  overflow: hidden;
}

.shelf-poster-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.shelf-card:hover .shelf-poster-img {
  transform: scale(1.06);
}

.shelf-type-badge {
  position: absolute;
  top: 8px;
  left: 8px;
}

.shelf-rating-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(10, 10, 12, 0.88);
  backdrop-filter: blur(6px);
  color: var(--accent-star);
  font-weight: 800;
  font-size: 0.72rem;
  padding: 3px 6px;
  border-radius: 4px;
  border: 1px solid var(--border-subtle);
}

.shelf-card-info {
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.shelf-card-title {
  font-size: 0.88rem;
  font-weight: 700;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.shelf-card-year {
  font-size: 0.76rem;
  color: var(--text-muted);
}

/* =========================================================================
   SEARCH RESULTS GRID
   ========================================================================= */
.results-section {
  display: grid;
  gap: 20px;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.results-header h2 {
  font-size: 1.4rem;
  font-weight: 800;
  color: #ffffff;
}

.results-sub {
  color: var(--text-muted);
  font-size: 0.86rem;
  margin-top: 2px;
}

.media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
}

.media-card {
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border-radius: 10px;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.media-card:hover {
  border-color: var(--border-red);
  transform: translateY(-4px);
  box-shadow: 0 12px 25px -5px rgba(0, 0, 0, 0.8);
}

.poster-wrapper {
  position: relative;
  width: 100%;
  padding-top: 148%;
  overflow: hidden;
  background: #15151a;
}

.poster-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.media-card:hover .poster-img {
  transform: scale(1.05);
}

.type-badge {
  position: absolute;
  top: 8px;
  left: 8px;
}

.rating-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(10, 10, 12, 0.88);
  backdrop-filter: blur(6px);
  color: #ffffff;
  font-weight: 700;
  font-size: 0.72rem;
  padding: 3px 6px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  border: 1px solid var(--border-subtle);
}

.card-info {
  padding: 12px;
  display: flex;
  flex-direction: column;
  flex: 1;
  background: var(--bg-surface);
}

.media-title {
  font-size: 0.95rem;
  font-weight: 700;
  margin-bottom: 2px;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.release-date {
  font-size: 0.78rem;
  color: var(--text-muted);
  margin-bottom: 6px;
}

.overview {
  font-size: 0.78rem;
  color: var(--text-secondary);
  line-height: 1.4;
  margin-bottom: 12px;
  flex: 1;
}

.btn-card-action {
  font-size: 0.8rem;
  padding: 8px 12px;
  border-radius: 6px;
}

.empty-state {
  max-width: 500px;
  margin: 32px auto;
  padding: 32px;
  text-align: center;
  background: var(--bg-surface);
}

.empty-state h2 {
  font-size: 1.3rem;
  margin-bottom: 6px;
  color: #ffffff;
}

.empty-state p {
  color: var(--text-secondary);
  font-size: 0.88rem;
}

/* =========================================================================
   RESPONSIVE DETAIL MODAL STYLING
   ========================================================================= */
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

.detail-modal-content.wide-modal {
  position: relative;
  width: 92vw;
  max-width: 1000px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 0;
  border-radius: 16px;
  overflow-x: hidden;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.95);
}

.close-btn-fixed {
  position: absolute;
  top: 16px;
  right: 18px;
  z-index: 50;
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
  height: 240px;
  background-size: cover;
  background-position: center;
  position: relative;
}

.hero-backdrop-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(10, 10, 12, 0.15) 0%, rgba(10, 10, 12, 0.95) 90%, var(--bg-surface) 100%);
  display: flex;
  align-items: flex-end;
  padding: 24px 28px;
}

.banner-badges {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.hero-media-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-width: calc(100% - 48px);
}

.hero-rating-badge {
  color: #ffffff;
  font-weight: 700;
  font-size: 0.84rem;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.hero-media-title {
  font-size: 1.8rem;
  font-weight: 900;
  color: #ffffff;
  line-height: 1.15;
  word-break: break-word;
}

.hero-media-subtitle {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.detail-body.wide-grid {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 24px;
  padding: 24px 28px;
}

.detail-left-col {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-poster-wrap {
  width: 100%;
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
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 20px;
}

.quick-add-bar {
  padding: 14px;
  border-radius: 10px;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
}

.rating-input-row {
  margin-bottom: 12px;
}

.rating-input-row label {
  font-size: 0.8rem;
  color: var(--text-secondary);
  font-weight: 600;
  display: block;
  margin-bottom: 4px;
}

.star-rating-selector {
  display: flex;
  align-items: center;
  gap: 3px;
  flex-wrap: wrap;
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

.review-input-group {
  margin-bottom: 12px;
}

.review-input-group label {
  font-size: 0.78rem;
  color: var(--text-secondary);
  font-weight: 600;
  display: block;
  margin-bottom: 4px;
}

.modal-review-textarea {
  width: 100%;
  padding: 8px 10px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  color: #ffffff;
  font-size: 0.84rem;
  resize: vertical;
  min-height: 60px;
  max-height: 140px;
  transition: all 0.2s;
  box-sizing: border-box;
}

.modal-review-textarea:focus {
  background: rgba(255, 255, 255, 0.07);
  border-color: var(--accent-red);
  outline: none;
}

.review-char-count {
  text-align: right;
  font-size: 0.7rem;
  color: var(--text-muted);
  margin-top: 2px;
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
  gap: 6px;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 0 14px;
  border: 1px solid var(--border-subtle);
}

.icon-action-btn:hover {
  transform: translateY(-2px);
}

.icon-action-btn.btn-primary-action {
  background: rgba(255, 255, 255, 0.06);
  color: #ffffff;
  border-color: rgba(255, 255, 255, 0.12);
}

.icon-action-btn.btn-primary-action:hover {
  background: rgba(255, 255, 255, 0.12);
}

.icon-action-btn.btn-primary-action.in-watchlist {
  background: var(--accent-red) !important;
  color: #ffffff !important;
  border-color: var(--accent-red) !important;
  box-shadow: 0 4px 14px rgba(229, 9, 20, 0.4);
}

.icon-action-btn.btn-primary-action.in-watchlist:hover {
  background: var(--accent-red-hover) !important;
  box-shadow: 0 6px 20px rgba(229, 9, 20, 0.6);
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
  -webkit-overflow-scrolling: touch;
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

.loading-state {
  text-align: center;
  padding: 40px;
  color: var(--text-secondary);
}

.text-sm {
  font-size: 0.78rem;
  padding: 6px 12px;
}

/* =========================================================================
   MOBILE RESPONSIVE BREAKPOINTS (PERFECT MOBILE EXPERIENCE)
   ========================================================================= */
@media (max-width: 768px) {
  .explore-page {
    gap: 24px;
  }

  .featured-hero-banner {
    min-height: 380px;
    border-radius: 12px;
  }

  .featured-gradient-overlay {
    padding: 24px 18px;
  }

  .featured-title {
    font-size: 1.75rem;
  }

  .featured-overview {
    font-size: 0.86rem;
    -webkit-line-clamp: 3;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .featured-actions {
    flex-direction: column;
    gap: 10px;
  }

  .shelf-card {
    flex: 0 0 142px;
  }

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

  .detail-poster-wrap {
    display: flex;
    justify-content: center;
  }

  .detail-poster-img {
    max-width: 140px;
  }

  .quick-buttons-row {
    flex-direction: column;
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

/* =========================================================================
   STATUS PILLS & FAST SEARCH ACTION BUTTONS (IMPECCABLE DESIGN)
   ========================================================================= */
.card-status-pill,
.shelf-status-pill {
  position: absolute;
  bottom: 8px;
  left: 8px;
  font-size: 0.65rem;
  font-weight: 800;
  padding: 3px 8px;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  z-index: 4;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.7);
  display: inline-flex;
  align-items: center;
  gap: 3px;
  white-space: nowrap;
}

.card-status-pill.watching,
.shelf-status-pill.watching {
  background: rgba(14, 165, 233, 0.92);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.45);
  box-shadow: 0 2px 10px rgba(14, 165, 233, 0.5);
}

.card-status-pill.completed,
.shelf-status-pill.completed {
  background: rgba(16, 185, 129, 0.95);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.45);
  box-shadow: 0 2px 10px rgba(16, 185, 129, 0.5);
}

.card-status-pill.plan_to_watch,
.shelf-status-pill.plan_to_watch {
  background: rgba(139, 92, 246, 0.92);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.45);
  box-shadow: 0 2px 10px rgba(139, 92, 246, 0.5);
}

.card-status-pill.dropped,
.shelf-status-pill.dropped {
  background: rgba(239, 68, 68, 0.92);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.45);
  box-shadow: 0 2px 10px rgba(239, 68, 68, 0.5);
}

.card-status-pill.on_hold,
.shelf-status-pill.on_hold {
  background: rgba(245, 158, 11, 0.92);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.45);
  box-shadow: 0 2px 10px rgba(245, 158, 11, 0.5);
}

.card-quick-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  margin-top: 8px;
}

.btn-card-quick {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 7px 8px;
  border-radius: 5px;
  font-size: 0.74rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.05);
  color: #ffffff;
  white-space: nowrap;
}

.btn-card-quick:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-1px);
}

/* Active in-watchlist button styled in vibrant red like detail modal */
.btn-quick-watchlist.in-watchlist {
  background: var(--accent-red) !important;
  color: #ffffff !important;
  border-color: var(--accent-red) !important;
  box-shadow: 0 4px 14px rgba(229, 9, 20, 0.45) !important;
}

.btn-quick-watchlist.in-watchlist:hover {
  background: var(--accent-red-hover) !important;
  box-shadow: 0 6px 18px rgba(229, 9, 20, 0.6) !important;
}

/* Active favorite button styled with red glow */
.btn-quick-fav.is-favorite {
  background: rgba(229, 9, 20, 0.25) !important;
  border-color: var(--accent-red) !important;
  color: #ff5252 !important;
  box-shadow: 0 2px 10px rgba(229, 9, 20, 0.3) !important;
}

.btn-icon-svg {
  width: 13px;
  height: 13px;
  flex-shrink: 0;
}
</style>
