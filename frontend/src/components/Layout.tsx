import { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import {
  HomeIcon,
  CubeIcon,
  ShoppingCartIcon,
  UsersIcon,
  UserGroupIcon,
  ChartBarIcon,
  BuildingStorefrontIcon,
  CurrencyDollarIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  RocketLaunchIcon,
  SparklesIcon,
  DocumentTextIcon,
  LinkIcon,
  ClockIcon,
  CogIcon,
  BellIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline'
import { format } from 'date-fns'
import Chatbot from '../components/Chatbot'

export default function Layout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [showUserMenu, setShowUserMenu] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navItems = [
    { name: 'Dashboard', icon: HomeIcon, path: '/', roles: ['super_admin', 'store_manager', 'sales_staff', 'marketing', 'accounts'] },
    { name: 'Inventory', icon: CubeIcon, path: '/inventory', roles: ['super_admin', 'store_manager', 'sales_staff'] },
    { name: 'Sales', icon: ShoppingCartIcon, path: '/sales', roles: ['super_admin', 'store_manager', 'sales_staff'] },
    { name: 'Customers', icon: UsersIcon, path: '/customers', roles: ['super_admin', 'store_manager', 'sales_staff'] },
    { name: 'Financial', icon: CurrencyDollarIcon, path: '/financial', roles: ['super_admin', 'store_manager', 'accounts'] },
    { name: 'Marketing', icon: RocketLaunchIcon, path: '/marketing', roles: ['super_admin', 'store_manager', 'marketing'] },
    { name: 'AI Insights', icon: SparklesIcon, path: '/ai-insights', roles: ['super_admin', 'store_manager', 'marketing'] },
    { name: 'Analytics', icon: ChartBarIcon, path: '/analytics', roles: ['super_admin', 'store_manager'] },
    { name: 'Live Dashboard', icon: ClockIcon, path: '/live-dashboard', roles: ['super_admin', 'store_manager'] },
    { name: 'Reports', icon: DocumentTextIcon, path: '/reports', roles: ['super_admin', 'store_manager', 'accounts'] },
    { name: 'Advanced Reports', icon: ChartBarIcon, path: '/advanced-reports', roles: ['super_admin', 'store_manager'] },
    { name: 'Ad Integrations', icon: LinkIcon, path: '/ad-integrations', roles: ['super_admin', 'store_manager', 'marketing'] },
    { name: 'Stores', icon: BuildingStorefrontIcon, path: '/stores', roles: ['super_admin'] },
    { name: 'Users', icon: UserGroupIcon, path: '/users', roles: ['super_admin', 'store_manager'] },
  ]

  const filteredNavItems = navItems.filter(item => item.roles.includes(user?.role || ''))

  const getRoleBadge = (role: string) => {
    const badges: Record<string, { text: string, className: string }> = {
      super_admin: { text: 'ADMIN', className: 'badge-danger' },
      store_manager: { text: 'MANAGER', className: 'badge-info' },
      sales_staff: { text: 'SALES', className: 'badge-success' },
      marketing: { text: 'MARKETING', className: 'badge-warning' },
      accounts: { text: 'ACCOUNTS', className: 'badge-info' },
    }
    return badges[role] || { text: role.toUpperCase(), className: 'badge-info' }
  }

  const roleBadge = getRoleBadge(user?.role || '')

  const getCurrentPageName = () => {
    const currentNav = navItems.find(item => item.path === location.pathname)
    return currentNav?.name || 'Dashboard'
  }

  return (
    <div className="flex h-screen bg-background text-text-secondary overflow-hidden font-sans">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-72 flex flex-col
          bg-surface border-r border-border
          transform transition-transform duration-300 ease-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo Section */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center text-white font-bold shadow-lg shadow-primary-500/20">
              S
            </div>
            <div>
              <h1 className="text-base font-bold text-text-primary leading-tight tracking-tight">
                SKOPE
              </h1>
              <p className="text-[9px] font-bold text-text-muted tracking-widest uppercase">Enterprise</p>
            </div>
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 text-text-muted hover:text-text-primary hover:bg-surface-hover rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* User Profile Card */}
        <div className="p-4">
          <div className="card p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {user?.full_name?.charAt(0) || user?.username?.charAt(0) || 'U'}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-success rounded-full border-2 border-surface" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-text-primary truncate">
                  {user?.full_name || user?.username}
                </p>
                <p className="text-xs text-text-muted truncate">{user?.email}</p>
              </div>
            </div>
            <span className={`badge ${roleBadge.className} w-fit`}>
              {roleBadge.text}
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-1 custom-scrollbar">
          {filteredNavItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`nav-item ${isActive ? 'nav-item-active' : ''}`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span className="flex-1">{item.name}</span>
                {isActive && (
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-pulse" />
                )}
              </NavLink>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border space-y-2">
          {/* Time Display */}
          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-background-tertiary text-xs">
            <div className="flex items-center gap-2 text-text-muted">
              <ClockIcon className="w-3.5 h-3.5" />
              <span className="font-mono font-medium">{format(currentTime, 'HH:mm:ss')}</span>
            </div>
            <span className="text-text-tertiary font-medium">{format(currentTime, 'MMM d, yyyy')}</span>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-text-tertiary hover:text-danger hover:bg-danger-bg transition-all"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-4 lg:px-8 bg-surface border-b border-border sticky top-0 z-30 backdrop-blur-xl bg-surface/80">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-text-tertiary hover:text-text-primary hover:bg-surface-hover rounded-lg transition-colors"
            >
              <Bars3Icon className="w-6 h-6" />
            </button>

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-text-muted font-medium hidden sm:inline">SKOPE</span>
              <span className="text-border hidden sm:inline">/</span>
              <span className="text-text-primary font-semibold">{getCurrentPageName()}</span>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Search Button */}
            <button className="btn-icon btn-ghost hidden sm:flex">
              <MagnifyingGlassIcon className="w-5 h-5" />
            </button>

            {/* Notifications */}
            <button className="btn-icon btn-ghost relative">
              <BellIcon className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full border-2 border-surface" />
            </button>

            {/* Divider */}
            <div className="h-6 w-px bg-border mx-1" />

            {/* System Status */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-success-bg border border-success/20">
              <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              <span className="text-xs font-semibold text-success-light">Online</span>
            </div>

            {/* Settings */}
            <button 
              onClick={() => navigate('/settings')}
              className="btn-icon btn-ghost"
            >
              <CogIcon className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-4 lg:p-8">
            <div className="max-w-7xl mx-auto w-full">
              <Outlet />
            </div>
          </div>
        </div>
      </main>

      {/* AI Chatbot */}
      <Chatbot />
    </div>
  )
}
