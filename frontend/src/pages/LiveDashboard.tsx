import { useState, useEffect } from 'react'
import { PageHeader, PremiumCard, StatCard, Badge } from '../components/PremiumUI'
import {
  BoltIcon,
  UsersIcon,
  ShoppingCartIcon,
  CurrencyDollarIcon,
  ClockIcon,
  MapPinIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon
} from '@heroicons/react/24/outline'
import api from '../utils/api'

interface LiveActivity {
  id: string
  type: 'sale' | 'visitor' | 'cart' | 'checkout'
  user: string
  location: string
  amount?: number
  product?: string
  timestamp: Date
}

export default function LiveDashboard() {
  const [activities, setActivities] = useState<LiveActivity[]>([])
  const [stats, setStats] = useState({
    activeUsers: 0,
    salesPerMinute: 0,
    avgSessionTime: 0,
    topLocation: '',
    mobileUsers: 0,
    desktopUsers: 0
  })

  useEffect(() => {
    loadLiveData()
    // Update every 5 seconds for real-time feel
    const interval = setInterval(loadLiveData, 5000)
    return () => clearInterval(interval)
  }, [])

  const loadLiveData = async () => {
    // Use mock data for now - backend endpoint will be added later
    setActivities(generateMockActivities())
    setStats(generateMockStats())
  }

  const generateMockActivities = (): LiveActivity[] => {
    const types: Array<'sale' | 'visitor' | 'cart' | 'checkout'> = ['sale', 'visitor', 'cart', 'checkout']
    const locations = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Pune', 'Hyderabad']
    const products = ['Laptop', 'Mouse', 'Keyboard', 'Monitor', 'Headphones', 'Webcam']
    const names = ['Raj', 'Priya', 'Amit', 'Sneha', 'Vikram', 'Ananya', 'Rohan', 'Kavya']

    return Array.from({ length: 10 }, (_, i) => ({
      id: `activity-${Date.now()}-${i}`,
      type: types[Math.floor(Math.random() * types.length)],
      user: names[Math.floor(Math.random() * names.length)],
      location: locations[Math.floor(Math.random() * locations.length)],
      amount: Math.random() > 0.5 ? Math.floor(Math.random() * 50000) + 5000 : undefined,
      product: products[Math.floor(Math.random() * products.length)],
      timestamp: new Date(Date.now() - Math.random() * 60000)
    }))
  }

  const generateMockStats = () => ({
    activeUsers: Math.floor(Math.random() * 100) + 50,
    salesPerMinute: Math.floor(Math.random() * 10) + 5,
    avgSessionTime: Math.floor(Math.random() * 300) + 180,
    topLocation: 'Mumbai',
    mobileUsers: Math.floor(Math.random() * 60) + 30,
    desktopUsers: Math.floor(Math.random() * 40) + 20
  })

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'sale': return '💰'
      case 'visitor': return '👤'
      case 'cart': return '🛒'
      case 'checkout': return '✅'
      default: return '📊'
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'sale': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
      case 'visitor': return 'text-blue-400 bg-blue-500/10 border-blue-500/30'
      case 'cart': return 'text-amber-400 bg-amber-500/10 border-amber-500/30'
      case 'checkout': return 'text-violet-400 bg-violet-500/10 border-violet-500/30'
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/30'
    }
  }

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
    if (seconds < 60) return `${seconds}s ago`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    return `${Math.floor(minutes / 60)}h ago`
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Live Dashboard"
        subtitle="Real-time activity monitoring"
        icon={BoltIcon}
        actions={
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm font-semibold text-emerald-400">Live</span>
          </div>
        }
      />

      {/* Real-time Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Active Users"
          value={stats.activeUsers}
          icon={UsersIcon}
          color="violet"
          subtitle="Right now"
          delay={100}
        />
        <StatCard
          title="Sales/Minute"
          value={stats.salesPerMinute}
          icon={ShoppingCartIcon}
          color="emerald"
          subtitle="Current rate"
          delay={150}
        />
        <StatCard
          title="Avg Session"
          value={`${Math.floor(stats.avgSessionTime / 60)}m ${stats.avgSessionTime % 60}s`}
          icon={ClockIcon}
          color="blue"
          subtitle="Time on site"
          delay={200}
        />
        <StatCard
          title="Top Location"
          value={stats.topLocation}
          icon={MapPinIcon}
          color="amber"
          subtitle="Most visitors"
          delay={250}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Activity Feed */}
        <div className="lg:col-span-2">
          <PremiumCard delay={300}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-text-primary">Live Activity Feed</h3>
                <Badge color="emerald">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Updating
                  </div>
                </Badge>
              </div>

              <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar">
                {activities.map((activity, idx) => (
                  <div
                    key={activity.id}
                    className={`p-4 rounded-lg border ${getActivityColor(activity.type)} animate-fade-in-up`}
                    style={{ animationDelay: `${idx * 50}ms`, animationFillMode: 'forwards', opacity: 0 }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">{getActivityIcon(activity.type)}</div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-text-primary">
                              {activity.type === 'sale' && `${activity.user} made a purchase`}
                              {activity.type === 'visitor' && `${activity.user} is browsing`}
                              {activity.type === 'cart' && `${activity.user} added to cart`}
                              {activity.type === 'checkout' && `${activity.user} started checkout`}
                            </p>
                            <p className="text-sm text-text-tertiary mt-1">
                              {activity.product && `${activity.product} • `}
                              {activity.location}
                            </p>
                          </div>
                          <div className="text-right">
                            {activity.amount && (
                              <p className="font-bold text-emerald-400">₹{activity.amount.toLocaleString()}</p>
                            )}
                            <p className="text-xs text-text-muted mt-1">{formatTimeAgo(activity.timestamp)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </PremiumCard>
        </div>

        {/* Device & Location Stats */}
        <div className="space-y-6">
          {/* Device Breakdown */}
          <PremiumCard delay={350}>
            <div className="p-6">
              <h3 className="text-lg font-bold text-text-primary mb-4">Device Breakdown</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-surface-hover">
                  <div className="flex items-center gap-3">
                    <DevicePhoneMobileIcon className="w-5 h-5 text-primary-400" />
                    <span className="text-sm font-semibold text-text-primary">Mobile</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 rounded-full bg-surface-active overflow-hidden">
                      <div 
                        className="h-full bg-primary-600"
                        style={{ width: `${(stats.mobileUsers / (stats.mobileUsers + stats.desktopUsers)) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-text-primary">{stats.mobileUsers}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-surface-hover">
                  <div className="flex items-center gap-3">
                    <ComputerDesktopIcon className="w-5 h-5 text-blue-400" />
                    <span className="text-sm font-semibold text-text-primary">Desktop</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 rounded-full bg-surface-active overflow-hidden">
                      <div 
                        className="h-full bg-blue-600"
                        style={{ width: `${(stats.desktopUsers / (stats.mobileUsers + stats.desktopUsers)) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-text-primary">{stats.desktopUsers}</span>
                  </div>
                </div>
              </div>
            </div>
          </PremiumCard>

          {/* Top Locations */}
          <PremiumCard delay={400}>
            <div className="p-6">
              <h3 className="text-lg font-bold text-text-primary mb-4">Top Locations</h3>
              <div className="space-y-3">
                {['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Pune'].map((city, idx) => (
                  <div key={city} className="flex items-center justify-between p-3 rounded-lg bg-surface-hover">
                    <div className="flex items-center gap-3">
                      <MapPinIcon className="w-4 h-4 text-text-muted" />
                      <span className="text-sm font-semibold text-text-primary">{city}</span>
                    </div>
                    <Badge color={idx === 0 ? 'emerald' : idx === 1 ? 'blue' : 'violet'}>
                      {Math.floor(Math.random() * 50) + 10} users
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </PremiumCard>

          {/* Traffic Sources */}
          <PremiumCard delay={450}>
            <div className="p-6">
              <h3 className="text-lg font-bold text-text-primary mb-4">Traffic Sources</h3>
              <div className="space-y-3">
                {[
                  { source: 'Direct', percentage: 45, color: 'violet' },
                  { source: 'Google', percentage: 30, color: 'blue' },
                  { source: 'Social Media', percentage: 15, color: 'rose' },
                  { source: 'Referral', percentage: 10, color: 'amber' }
                ].map((item) => (
                  <div key={item.source} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-text-primary">{item.source}</span>
                      <span className="text-sm text-text-tertiary">{item.percentage}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-surface-active overflow-hidden">
                      <div 
                        className={`h-full bg-${item.color}-600 transition-all duration-1000`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </PremiumCard>
        </div>
      </div>
    </div>
  )
}
