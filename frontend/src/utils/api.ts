import axios, { AxiosError } from 'axios'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

// Determine API URL based on environment
// In production (Render), use the VITE_API_URL environment variable
// In development, use localhost
const getApiUrl = () => {
  // Check if we're in production (Render sets this)
  if (import.meta.env.VITE_API_URL) {
    return `${import.meta.env.VITE_API_URL}/api/v1`
  }
  // Development - use localhost
  return 'http://localhost:8000/api/v1'
}

// Create axios instance with better configuration
const api = axios.create({
  baseURL: getApiUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
})

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Log request for debugging
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`)

    return config
  },
  (error) => {
    console.error('[API Request Error]', error)
    return Promise.reject(error)
  }
)

// Enhanced error handling
api.interceptors.response.use(
  (response) => {
    // Log successful responses
    console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`)
    return response
  },
  (error: AxiosError) => {
    console.error('[API Response Error]', error)

    // Get current path to avoid showing errors on login page
    const isLoginPage = window.location.pathname === '/login'

    // Handle different error types
    if (error.code === 'ECONNABORTED') {
      if (!isLoginPage) {
        toast.error('Request timeout. Please check your connection.')
      }
    } else if (error.code === 'ERR_NETWORK' || !error.response) {
      // Network error - backend not reachable
      console.error('Backend server is not reachable. Please ensure:')
      console.error('1. Backend is running on http://localhost:8000')
      console.error('2. Frontend proxy is configured correctly')
      console.error('3. No firewall is blocking the connection')

      // Only show this error if not on login page (login page has its own indicator)
      if (!isLoginPage) {
        toast.error('Cannot connect to server. Please ensure backend is running.', {
          duration: 5000,
          icon: '🔌',
        })
      }
    } else if (error.response?.status === 401) {
      // Unauthorized - clear auth and redirect
      console.log('[Auth] 401 Unauthorized - clearing auth data')
      useAuthStore.getState().logout()

      // Only redirect and show toast if not already on login page
      if (!isLoginPage) {
        window.location.href = '/login'
        toast.error('Session expired. Please login again.')
      }
    } else if (error.response?.status === 404) {
      // Not found - endpoint doesn't exist
      console.error(`API endpoint not found: ${error.config?.url}`)
      // Don't clear auth on 404 - it just means the endpoint doesn't exist
      // The page will handle the error gracefully with fallback data
    } else if (error.response?.status === 500) {
      // Server error
      console.error('Server error:', error.response?.data)
      if (!isLoginPage) {
        toast.error('Server error. Please try again later.')
      }
    }

    return Promise.reject(error)
  }
)

// Health check function
export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const healthUrl = import.meta.env.VITE_API_URL
      ? `${import.meta.env.VITE_API_URL}/health`
      : 'http://localhost:8000/health'

    const response = await axios.get(healthUrl, { timeout: 5000 })
    console.log('[Health Check] Backend is healthy:', response.data)
    return true
  } catch (error) {
    console.error('[Health Check] Backend is not responding:', error)
    return false
  }
}

export default api

