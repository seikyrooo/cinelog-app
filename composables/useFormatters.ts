export const useFormatters = () => {
  const FALLBACK_POSTER = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=500&q=80'
  const FALLBACK_BACKDROP = 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1200&q=80'

  const getPosterUrl = (movieOrItem: any): string => {
    if (!movieOrItem) return FALLBACK_POSTER

    let path = ''
    if (typeof movieOrItem === 'object') {
      const m = movieOrItem.movie || movieOrItem
      path = m.local_poster_path || m.poster_path || m.local_backdrop_path || m.backdrop_path || ''
    } else if (typeof movieOrItem === 'string') {
      path = movieOrItem
    }

    if (!path || path === 'null' || path === 'undefined') {
      return FALLBACK_POSTER
    }
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path
    }
    if (path.startsWith('/uploads/') || path.startsWith('uploads/')) {
      return useApiUrl(path)
    }
    return `https://image.tmdb.org/t/p/w500${path.startsWith('/') ? path : '/' + path}`
  }

  const getBackdropUrl = (movieOrItem: any): string => {
    if (!movieOrItem) return FALLBACK_BACKDROP

    let path = ''
    if (typeof movieOrItem === 'object') {
      const m = movieOrItem.movie || movieOrItem
      path = m.local_backdrop_path || m.backdrop_path || m.local_poster_path || m.poster_path || ''
    } else if (typeof movieOrItem === 'string') {
      path = movieOrItem
    }

    if (!path || path === 'null' || path === 'undefined') {
      return FALLBACK_BACKDROP
    }
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path
    }
    if (path.startsWith('/uploads/') || path.startsWith('uploads/')) {
      return useApiUrl(path)
    }
    return `https://image.tmdb.org/t/p/original${path.startsWith('/') ? path : '/' + path}`
  }

  const getAvatarUrl = (path?: string): string => {
    if (!path || path === 'null' || path === 'undefined') return ''
    if (path.startsWith('blob:') || path.startsWith('http://') || path.startsWith('https://')) return path
    if (path.startsWith('/uploads/') || path.startsWith('uploads/')) return useApiUrl(path)
    if (path.startsWith('/')) return useApiUrl(path)
    return useApiUrl('/uploads/avatars/' + path)
  }

  const onAvatarError = (e: Event) => {
    const target = e.target as HTMLImageElement
    if (target) {
      target.style.display = 'none'
    }
  }

  const onImageError = (e: Event) => {
    const target = e.target as HTMLImageElement
    if (target && !target.src.includes('unsplash')) {
      target.src = FALLBACK_POSTER
    }
  }

  const formatYear = (dateStr?: string): string => {
    if (!dateStr) return '—'
    return dateStr.substring(0, 4)
  }

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'watching': return 'Watching'
      case 'completed': return 'Completed'
      case 'on_hold': return 'On Hold'
      case 'dropped': return 'Dropped'
      default: return 'Plan to Watch'
    }
  }

  const padZero = (n: number | string): string => {
    const num = Number(n) || 0
    return num < 10 ? `0${num}` : `${num}`
  }

  return {
    getPosterUrl,
    getImageUrl: getPosterUrl,
    getBackdropUrl,
    getAvatarUrl,
    onAvatarError,
    onImageError,
    formatYear,
    getStatusLabel,
    padZero
  }
}
