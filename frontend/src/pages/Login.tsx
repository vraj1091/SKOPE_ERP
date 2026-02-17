import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import api, { checkBackendHealth } from '../utils/api'
import toast from 'react-hot-toast'
import {
  EyeIcon,
  EyeSlashIcon,
  EnvelopeIcon,
  LockClosedIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowRightIcon,
  SparklesIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  CubeIcon,
} from '@heroicons/react/24/outline'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [backendHealthy, setBackendHealthy] = useState<boolean | null>(null)
  const [focusedField, setFocusedField] = useState<string | null>(null)

  const navigate = useNavigate()
  const { setAuth, token, logout } = useAuthStore()

  useEffect(() => {
    if (token) {
      navigate('/')
    } else {
      logout()
    }
  }, [])

  useEffect(() => {
    const checkHealth = async () => {
      const isHealthy = await checkBackendHealth()
      setBackendHealthy(isHealthy)
    }
    checkHealth()
    const interval = setInterval(checkHealth, 15000)
    return () => clearInterval(interval)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await api.post('/auth/login', {
        username: email,
        password: password
      })

      const { access_token, user } = response.data
      localStorage.setItem('token', access_token)
      localStorage.setItem('user', JSON.stringify(user))
      setAuth(user, access_token)

      toast.success(`Welcome back, ${user.full_name || user.username}!`, {
        icon: '👋',
        style: {
          borderRadius: '12px',
          background: '#1A2332',
          color: '#F8FAFC',
          border: '1px solid #1E293B',
        },
      })
      navigate('/')
    } catch (error: any) {
      console.error('Login error:', error)
      let message = 'Invalid credentials. Please try again.'
      if (error.response?.data?.detail) {
        if (typeof error.response.data.detail === 'string') {
          message = error.response.data.detail
        }
      }
      toast.error(message, {
        style: {
          borderRadius: '12px',
          background: '#1A2332',
          color: '#F8FAFC',
          border: '1px solid #EF4444',
        },
      })
    } finally {
      setLoading(false)
    }
  }

  const features = [
    {
      icon: ChartBarIcon,
      title: 'Real-time Analytics',
      description: 'Track performance with live dashboards and insights',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: CubeIcon,
      title: 'Inventory Control',
      description: 'Smart stock management with automated alerts',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: SparklesIcon,
      title: 'AI-Powered Insights',
      description: 'Predictive analytics and intelligent recommendations',
      color: 'from-amber-500 to-orange-500'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Enterprise Security',
      description: 'Bank-level encryption and role-based access',
      color: 'from-emerald-500 to-teal-500'
    },
  ]

  return (
    <div className="min-h-screen flex bg-background font-sans overflow-hidden relative">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl animate-pulse-subtle" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-500/10 rounded-full blur-3xl animate-pulse-subtle" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent-cyan/5 rounded-full blur-3xl animate-pulse-subtle" style={{ animationDelay: '2s' }} />
      </div>

      {/* Left Panel - Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00em0wIDI0YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00ek0xMiAxNmMwLTIuMjEgMS43OS00IDQtNHM0IDEuNzkgNCA0LTEuNzkgNC00IDQtNC0xLjc5LTQtNHptMCAyNGMwLTIuMjEgMS43OS00IDQtNHM0IDEuNzkgNCA0LTEuNzkgNC00IDQtNC0xLjc5LTQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />
        
        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          {/* Logo */}
          <div className="animate-fade-in-down">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20 shadow-2xl">
                <span className="text-2xl font-bold bg-gradient-to-br from-white to-blue-100 bg-clip-text text-transparent">S</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">SKOPE ERP</h1>
                <p className="text-xs text-blue-200 font-medium">Enterprise Edition</p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-12 animate-fade-in-up">
            <div className="max-w-lg">
              <h2 className="text-5xl font-bold mb-6 leading-tight">
                Manage your enterprise with precision
              </h2>
              <p className="text-xl text-blue-100 leading-relaxed">
                The complete solution for inventory, sales, and customer management. Built for modern businesses that demand excellence.
              </p>
            </div>

            {/* Feature Grid */}
            <div className="grid grid-cols-2 gap-4">
              {features.map((feature, i) => (
                <div
                  key={i}
                  className="group p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105 animate-fade-in-up"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center mb-3 shadow-lg`}>
                    <feature.icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-white mb-1">{feature.title}</h3>
                  <p className="text-sm text-blue-200 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="text-sm text-blue-200 animate-fade-in">
            <p>© 2024 Skope Technologies Inc. All rights reserved.</p>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md space-y-8 animate-fade-in-up">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-600 rounded-2xl text-white font-bold text-2xl mb-4 shadow-xl">
              S
            </div>
            <h1 className="text-2xl font-bold text-text-primary">SKOPE ERP</h1>
            <p className="text-sm text-text-tertiary">Enterprise Edition</p>
          </div>

          {/* Header */}
          <div className="text-center lg:text-left space-y-2">
            <h2 className="text-3xl font-bold text-text-primary">Welcome back</h2>
            <p className="text-text-tertiary">Sign in to access your dashboard</p>
          </div>

          {/* Health Status */}
          {backendHealthy !== null && (
            <div className={`flex items-center gap-3 p-4 rounded-xl border ${
              backendHealthy 
                ? 'bg-success-bg border-success/20' 
                : 'bg-danger-bg border-danger/20'
            } animate-fade-in`}>
              <div className={`w-2 h-2 rounded-full ${backendHealthy ? 'bg-success animate-pulse' : 'bg-danger'}`} />
              <div className="flex-1">
                <p className={`text-sm font-semibold ${backendHealthy ? 'text-success-light' : 'text-danger-light'}`}>
                  {backendHealthy ? 'System Operational' : 'System Offline'}
                </p>
                <p className="text-xs text-text-muted">
                  {backendHealthy ? 'All services running normally' : 'Please check backend connection'}
                </p>
              </div>
              {backendHealthy ? (
                <CheckCircleIcon className="w-5 h-5 text-success" />
              ) : (
                <ExclamationCircleIcon className="w-5 h-5 text-danger" />
              )}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="form-group">
              <label className="form-label">Email address</label>
              <div className="relative">
                <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors ${
                  focusedField === 'email' ? 'text-primary-400' : 'text-text-muted'
                }`}>
                  <EnvelopeIcon className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  className="input pl-12"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="relative">
                <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors ${
                  focusedField === 'password' ? 'text-primary-400' : 'text-text-muted'
                }`}>
                  <LockClosedIcon className="h-5 w-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  className="input pl-12 pr-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-text-muted hover:text-text-primary transition-colors"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-border bg-surface text-primary-600 focus:ring-2 focus:ring-primary-500/20 transition-all"
                />
                <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">
                  Remember me
                </span>
              </label>

              <a href="#" className="text-sm font-medium text-primary-400 hover:text-primary-300 transition-colors">
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || backendHealthy === false}
              className="btn btn-primary w-full group"
            >
              {loading ? (
                <>
                  <div className="spinner w-5 h-5" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign in</span>
                  <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="card p-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-success-bg flex items-center justify-center">
                <CheckCircleIcon className="w-5 h-5 text-success" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-text-primary">Demo Credentials</h4>
                <p className="text-xs text-text-muted">Use these to explore the platform</p>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-background-tertiary border border-border">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-text-tertiary">Email</span>
                <code className="text-xs font-mono text-primary-400">admin@store.com</code>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-tertiary">Password</span>
                <code className="text-xs font-mono text-primary-400">admin123</code>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          <div className="text-center text-sm text-text-muted">
            <p>
              Don't have an account?{' '}
              <a href="#" className="font-medium text-primary-400 hover:text-primary-300 transition-colors">
                Contact sales
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
