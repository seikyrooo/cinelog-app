export const useApiUrl = (path: string = '') => {
  const config = useRuntimeConfig()
  const base = (config.public.apiBase || 'http://localhost:3000').replace(/\/+$/, '')
  const cleanPath = path.replace(/^\/+/, '')
  return cleanPath ? `${base}/${cleanPath}` : base
}
