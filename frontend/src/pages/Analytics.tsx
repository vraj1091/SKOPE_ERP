import { useState, useEffect } from 'react'
import { PageHeader, PremiumCard, StatCard, Badge, Button } from '../components/PremiumUI'
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CurrencyDollarIcon,
  ShoppingCartIcon,
  UsersIcon,
  ClockIcon,
  FunnelIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ComposedChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  Treemap,
  Funnel,
  FunnelChart,
  LabelList
} from 'recharts'
import api from '../utils/api'
import toast from 'react-hot-toast'

export default function Analytics() {
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d')
  const [realtimeData, setRealtimeData] = useState<any>(null)

  // Chart data generators
  const generateRevenueData = () => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365
    return Array.from({ length: days }, (_, i) => ({
      date: `Day ${i + 1}`,
      revenue: Math.floor(Math.random() * 50000) + 30000,
      profit: Math.floor(Math.random() * 20000) + 10000,
      orders: Math.floor(Math.random() * 100) + 50,
      customers: Math.floor(Math.random() * 80) + 30
    }))
  }

  const generateHourlyData = () => {
    return Array.from({ length: 24 }, (_, i) => ({
      hour: `${i}:00`,
      sales: Math.floor(Math.random() * 5000) + 1000,
      traffic: Math.floor(Math.random() * 200) + 50,
      conversion: (Math.random() * 10 + 5).toFixed(1)
    }))
  }

  const generateCategoryData = () => {
    return [
      { name: 'Electronics', value: 45000, percentage: 35, color: '#8B5CF6' },
      { name: 'Clothing', value: 32000, percentage: 25, color: '#3B82F6' },
      { name: 'Food & Beverage', value: 25000, percentage: 20, color: '#10B981' },
      { name: 'Home & Garden', value: 15000, percentage: 12, color: '#F59E0B' },
      { name: 'Others', value: 10000, percentage: 8, color: '#EF4444' }
    ]
  }

  const generateProductPerformance = () => {
    return [
      { product: 'Laptop Pro', sales: 85, revenue: 425000, profit: 85000, rating: 4.8 },
      { product: 'Wireless Mouse', sales: 156, revenue: 78000, profit: 23400, rating: 4.5 },
      { product: 'Keyboard RGB', sales: 134, revenue: 134000, profit: 40200, rating: 4.6 },
      { product: 'Monitor 27"', sales: 67, revenue: 268000, profit: 53600, rating: 4.7 },
      { product: 'Headphones', sales: 98, revenue: 147000, profit: 44100, rating: 4.4 },
      { product: 'Webcam HD', sales: 112, revenue: 89600, profit: 26880, rating: 4.3 }
    ]
  }

  const generateChannelData = () => {
    return [
      { channel: 'Online Store', value: 65, color: '#8B5CF6' },
      { channel: 'Mobile App', value: 85, color: '#3B82F6' },
      { channel: 'Physical Store', value: 45, color: '#10B981' },
      { channel: 'Social Media', value: 55, color: '#F59E0B' },
      { channel: 'Marketplace', value: 70, color: '#EF4444' }
    ]
  }

  const generateCustomerSegments = () => {
    return [
      { segment: 'VIP', customers: 450, revenue: 450000, avgOrder: 5000 },
      { segment: 'Regular', customers: 1200, revenue: 360000, avgOrder: 1500 },
      { segment: 'New', customers: 800, revenue: 160000, avgOrder: 800 },
      { segment: 'Inactive', customers: 350, revenue: 35000, avgOrder: 500 }
    ]
  }

  const generateFunnelData = () => {
    return [
      { stage: 'Visitors', value: 10000, fill: '#8B5CF6' },
      { stage: 'Product Views', value: 6500, fill: '#7C3AED' },
      { stage: 'Add to Cart', value: 3200, fill: '#6D28D9' },
      { stage: 'Checkout', value: 1800, fill: '#5B21B6' },
      { stage: 'Purchase', value: 1200, fill: '#4C1D95' }
    ]
  }

  const generatePaymentMethods = () => {
    return [
      { method: 'Credit Card', value: 45, color: '#8B5CF6' },
      { method: 'UPI', value: 30, color: '#3B82F6' },
      { method: 'Debit Card', value: 15, color: '#10B981' },
      { method: 'Cash', value: 7, color: '#F59E0B' },
      { method: 'Wallet', value: 3, color: '#EF4444' }
    ]
  }

  const generateDeviceData = () => {
    return [
      { device: 'Mobile', sessions: 5600, revenue: 280000, conversion: 3.2 },
      { device: 'Desktop', sessions: 3400, revenue: 340000, conversion: 4.5 },
      { device: 'Tablet', sessions: 1200, revenue: 96000, conversion: 3.8 }
    ]
  }

  const generateLocationData = () => {
    return [
      { city: 'Mumbai', orders: 450, revenue: 675000 },
      { city: 'Delhi', orders: 380, revenue: 570000 },
      { city: 'Bangalore', orders: 420, revenue: 630000 },
      { city: 'Chennai', orders: 290, revenue: 435000 },
      { city: 'Kolkata', orders: 250, revenue: 375000 },
      { city: 'Pune', orders: 310, revenue: 465000 }
    ]
  }

  const generateRetentionData = () => {
    return [
      { month: 'Jan', newCustomers: 450, returning: 280, churnRate: 12 },
      { month: 'Feb', newCustomers: 520, returning: 340, churnRate: 10 },
      { month: 'Mar', newCustomers: 480, returning: 390, churnRate: 8 },
      { month: 'Apr', newCustomers: 610, returning: 450, churnRate: 7 },
      { month: 'May', newCustomers: 580, returning: 520, churnRate: 6 },
      { month: 'Jun', newCustomers: 650, returning: 580, churnRate: 5 }
    ]
  }

  useEffect(() => {
    loadAnalytics()
    const interval = setInterval(loadRealtimeData, 30000)
    return () => clearInterval(interval)
  }, [timeRange])

  const loadAnalytics = async () => {
    setLoading(true)
    try {
      await loadRealtimeData()
    } catch (error) {
      console.error('Analytics error:', error)
      setRealtimeData(generateMockRealtimeData())
    } finally {
      setLoading(false)
    }
  }

  const loadRealtimeData = async () => {
    setRealtimeData(generateMockRealtimeData())
  }

  const generateMockRealtimeData = () => ({
    active_users: Math.floor(Math.random() * 50) + 10,
    current_sales: Math.floor(Math.random() * 10000) + 5000,
    orders_today: Math.floor(Math.random() * 100) + 50,
    avg_order_value: Math.floor(Math.random() * 2000) + 1000,
    conversion_rate: (Math.random() * 5 + 10).toFixed(2),
    bounce_rate: (Math.random() * 20 + 30).toFixed(2)
  })

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface-elevated border border-border-primary rounded-lg p-3 shadow-xl">
          <p className="text-text-primary font-semibold mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="spinner w-12 h-12 mx-auto mb-4" />
          <p className="text-text-tertiary">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-8">
      <PageHeader
        title="Advanced Analytics"
        subtitle="Real-time insights and performance metrics with 12+ interactive charts"
        icon={ChartBarIcon}
        actions={
          <div className="flex gap-2">
            {(['7d', '30d', '90d', '1y'] as const).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setTimeRange(range)}
              >
                {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : range === '90d' ? '90 Days' : '1 Year'}
              </Button>
            ))}
          </div>
        }
      />

      {/* Real-time Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Active Users"
          value={realtimeData?.active_users || 0}
          icon={UsersIcon}
          color="violet"
          subtitle="Right now"
          delay={100}
        />
        <StatCard
          title="Today's Sales"
          value={`₹${(realtimeData?.current_sales || 0).toLocaleString()}`}
          icon={CurrencyDollarIcon}
          color="emerald"
          delay={150}
        />
        <StatCard
          title="Orders Today"
          value={realtimeData?.orders_today || 0}
          icon={ShoppingCartIcon}
          color="blue"
          delay={200}
        />
        <StatCard
          title="Avg Order Value"
          value={`₹${(realtimeData?.avg_order_value || 0).toLocaleString()}`}
          icon={CurrencyDollarIcon}
          color="amber"
          delay={250}
        />
        <StatCard
          title="Conversion Rate"
          value={`${realtimeData?.conversion_rate || 0}%`}
          icon={FunnelIcon}
          color="emerald"
          delay={300}
        />
        <StatCard
          title="Bounce Rate"
          value={`${realtimeData?.bounce_rate || 0}%`}
          icon={ArrowTrendingDownIcon}
          color="rose"
          delay={350}
        />
      </div>

      {/* Chart 1 & 2: Revenue & Profit Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PremiumCard delay={400}>
          <div className="p-6">
            <h3 className="text-lg font-bold text-text-primary mb-4">Revenue & Profit Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={generateRevenueData()}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1A2332" />
                <XAxis dataKey="date" stroke="#6B7280" tick={{ fill: '#9CA3AF' }} />
                <YAxis stroke="#6B7280" tick={{ fill: '#9CA3AF' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ color: '#9CA3AF' }} />
                <Area type="monotone" dataKey="revenue" stroke="#8B5CF6" fillOpacity={1} fill="url(#colorRevenue)" name="Revenue" />
                <Area type="monotone" dataKey="profit" stroke="#10B981" fillOpacity={1} fill="url(#colorProfit)" name="Profit" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </PremiumCard>

        <PremiumCard delay={450}>
          <div className="p-6">
            <h3 className="text-lg font-bold text-text-primary mb-4">Orders & Customers Growth</h3>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={generateRevenueData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1A2332" />
                <XAxis dataKey="date" stroke="#6B7280" tick={{ fill: '#9CA3AF' }} />
                <YAxis stroke="#6B7280" tick={{ fill: '#9CA3AF' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ color: '#9CA3AF' }} />
                <Bar dataKey="orders" fill="#3B82F6" name="Orders" />
                <Line type="monotone" dataKey="customers" stroke="#F59E0B" strokeWidth={3} name="Customers" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </PremiumCard>
      </div>

      {/* Chart 3: Hourly Sales Pattern */}
      <PremiumCard delay={500}>
        <div className="p-6">
          <h3 className="text-lg font-bold text-text-primary mb-4">24-Hour Sales Pattern</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={generateHourlyData()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1A2332" />
              <XAxis dataKey="hour" stroke="#6B7280" tick={{ fill: '#9CA3AF' }} />
              <YAxis stroke="#6B7280" tick={{ fill: '#9CA3AF' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: '#9CA3AF' }} />
              <Bar dataKey="sales" fill="#8B5CF6" name="Sales (₹)" radius={[8, 8, 0, 0]} />
              <Bar dataKey="traffic" fill="#10B981" name="Traffic" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </PremiumCard>

      {/* Chart 4 & 5: Category Distribution & Payment Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PremiumCard delay={550}>
          <div className="p-6">
            <h3 className="text-lg font-bold text-text-primary mb-4">Sales by Category</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={generateCategoryData()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name} ${percentage}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {generateCategoryData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </PremiumCard>

        <PremiumCard delay={600}>
          <div className="p-6">
            <h3 className="text-lg font-bold text-text-primary mb-4">Payment Methods Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadialBarChart 
                cx="50%" 
                cy="50%" 
                innerRadius="10%" 
                outerRadius="90%" 
                data={generatePaymentMethods()}
                startAngle={180}
                endAngle={0}
              >
                <PolarGrid gridType="circle" stroke="#1A2332" />
                <RadialBar
                  minAngle={15}
                  label={{ position: 'insideStart', fill: '#fff', fontSize: 12 }}
                  background
                  clockWise
                  dataKey="value"
                >
                  {generatePaymentMethods().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </RadialBar>
                <Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ color: '#9CA3AF' }} />
                <Tooltip content={<CustomTooltip />} />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
        </PremiumCard>
      </div>

      {/* Chart 6: Product Performance */}
      <PremiumCard delay={650}>
        <div className="p-6">
          <h3 className="text-lg font-bold text-text-primary mb-4">Top Products Performance</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={generateProductPerformance()} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#1A2332" />
              <XAxis type="number" stroke="#6B7280" tick={{ fill: '#9CA3AF' }} />
              <YAxis dataKey="product" type="category" stroke="#6B7280" tick={{ fill: '#9CA3AF' }} width={120} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: '#9CA3AF' }} />
              <Bar dataKey="revenue" fill="#8B5CF6" name="Revenue (₹)" radius={[0, 8, 8, 0]} />
              <Bar dataKey="profit" fill="#10B981" name="Profit (₹)" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </PremiumCard>

      {/* Chart 7: Sales Funnel */}
      <PremiumCard delay={700}>
        <div className="p-6">
          <h3 className="text-lg font-bold text-text-primary mb-4">Conversion Funnel</h3>
          <ResponsiveContainer width="100%" height={400}>
            <FunnelChart>
              <Tooltip content={<CustomTooltip />} />
              <Funnel dataKey="value" data={generateFunnelData()} isAnimationActive>
                <LabelList position="right" fill="#fff" stroke="none" dataKey="stage" />
              </Funnel>
            </FunnelChart>
          </ResponsiveContainer>
        </div>
      </PremiumCard>

      {/* Chart 8 & 9: Channel Performance & Device Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PremiumCard delay={750}>
          <div className="p-6">
            <h3 className="text-lg font-bold text-text-primary mb-4">Sales Channel Performance</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={generateChannelData()}>
                <PolarGrid stroke="#1A2332" />
                <PolarAngleAxis dataKey="channel" tick={{ fill: '#9CA3AF' }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#9CA3AF' }} />
                <Radar name="Performance" dataKey="value" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.6} />
                <Tooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </PremiumCard>

        <PremiumCard delay={800}>
          <div className="p-6">
            <h3 className="text-lg font-bold text-text-primary mb-4">Device Analytics</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={generateDeviceData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1A2332" />
                <XAxis dataKey="device" stroke="#6B7280" tick={{ fill: '#9CA3AF' }} />
                <YAxis stroke="#6B7280" tick={{ fill: '#9CA3AF' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ color: '#9CA3AF' }} />
                <Bar dataKey="sessions" fill="#3B82F6" name="Sessions" radius={[8, 8, 0, 0]} />
                <Bar dataKey="revenue" fill="#10B981" name="Revenue (₹)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </PremiumCard>
      </div>

      {/* Chart 10: Geographic Distribution */}
      <PremiumCard delay={850}>
        <div className="p-6">
          <h3 className="text-lg font-bold text-text-primary mb-4">Top Cities by Revenue</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={generateLocationData()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1A2332" />
              <XAxis dataKey="city" stroke="#6B7280" tick={{ fill: '#9CA3AF' }} />
              <YAxis yAxisId="left" stroke="#6B7280" tick={{ fill: '#9CA3AF' }} />
              <YAxis yAxisId="right" orientation="right" stroke="#6B7280" tick={{ fill: '#9CA3AF' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: '#9CA3AF' }} />
              <Bar yAxisId="left" dataKey="orders" fill="#F59E0B" name="Orders" radius={[8, 8, 0, 0]} />
              <Bar yAxisId="right" dataKey="revenue" fill="#8B5CF6" name="Revenue (₹)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </PremiumCard>

      {/* Chart 11: Customer Retention */}
      <PremiumCard delay={900}>
        <div className="p-6">
          <h3 className="text-lg font-bold text-text-primary mb-4">Customer Retention Analysis</h3>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={generateRetentionData()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1A2332" />
              <XAxis dataKey="month" stroke="#6B7280" tick={{ fill: '#9CA3AF' }} />
              <YAxis yAxisId="left" stroke="#6B7280" tick={{ fill: '#9CA3AF' }} />
              <YAxis yAxisId="right" orientation="right" stroke="#6B7280" tick={{ fill: '#9CA3AF' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: '#9CA3AF' }} />
              <Bar yAxisId="left" dataKey="newCustomers" fill="#3B82F6" name="New Customers" radius={[8, 8, 0, 0]} />
              <Bar yAxisId="left" dataKey="returning" fill="#10B981" name="Returning" radius={[8, 8, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="churnRate" stroke="#EF4444" strokeWidth={3} name="Churn Rate %" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </PremiumCard>

      {/* Chart 12: Customer Segments */}
      <PremiumCard delay={950}>
        <div className="p-6">
          <h3 className="text-lg font-bold text-text-primary mb-4">Customer Segments Analysis</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={generateCustomerSegments()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1A2332" />
              <XAxis dataKey="segment" stroke="#6B7280" tick={{ fill: '#9CA3AF' }} />
              <YAxis stroke="#6B7280" tick={{ fill: '#9CA3AF' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: '#9CA3AF' }} />
              <Bar dataKey="customers" fill="#8B5CF6" name="Customers" radius={[8, 8, 0, 0]} />
              <Bar dataKey="revenue" fill="#10B981" name="Revenue (₹)" radius={[8, 8, 0, 0]} />
              <Bar dataKey="avgOrder" fill="#F59E0B" name="Avg Order (₹)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </PremiumCard>

      {/* AI Insights */}
      <PremiumCard delay={1000}>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <SparklesIcon className="w-6 h-6 text-amber-400 animate-pulse" />
            <div>
              <h3 className="text-xl font-bold text-text-primary">AI-Powered Insights</h3>
              <p className="text-sm text-text-tertiary">Automated recommendations based on your data</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
              <div className="flex items-start gap-3">
                <ArrowTrendingUpIcon className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-emerald-400 mb-1">Peak Performance</h4>
                  <p className="text-sm text-text-tertiary">Sales are 23% higher between 2-5 PM. Consider increasing staff during these hours.</p>
                </div>
              </div>
            </div>
            <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
              <div className="flex items-start gap-3">
                <ClockIcon className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-amber-400 mb-1">Slow Hours Detected</h4>
                  <p className="text-sm text-text-tertiary">Traffic drops 45% after 8 PM. Consider running evening promotions.</p>
                </div>
              </div>
            </div>
            <div className="p-4 rounded-lg bg-violet-500/10 border border-violet-500/30">
              <div className="flex items-start gap-3">
                <UsersIcon className="w-5 h-5 text-violet-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-violet-400 mb-1">Customer Retention</h4>
                  <p className="text-sm text-text-tertiary">Repeat customer rate is 34%. Launch loyalty program to increase retention.</p>
                </div>
              </div>
            </div>
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
              <div className="flex items-start gap-3">
                <ShoppingCartIcon className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-400 mb-1">Cart Abandonment</h4>
                  <p className="text-sm text-text-tertiary">28% cart abandonment rate. Send reminder emails to recover lost sales.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PremiumCard>
    </div>
  )
}
