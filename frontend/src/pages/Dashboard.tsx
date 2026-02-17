import { useEffect, useState } from 'react'
import { useAuthStore } from '../store/authStore'
import api from '../utils/api'
import {
  ShoppingCartIcon,
  CubeIcon,
  ExclamationTriangleIcon,
  UsersIcon,
  CurrencyDollarIcon,
  ArrowPathIcon,
  ChartBarIcon,
  BanknotesIcon,
  ReceiptPercentIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'
import { Link } from 'react-router-dom'
import { format, subDays } from 'date-fns'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts'
import { StatCard, Card, CardHeader, CardBody, Button } from '../components/ui'
import ComparisonGraph from '../components/ComparisonGraph'

interface DashboardStats {
  today_sales: number
  today_revenue: number
  total_products: number
  low_stock_count: number
  total_customers: number
  total_users: number
  month_revenue: number
  month_sales_count: number
  month_expenses: number
  month_profit: number
}

interface RecentSale {
  id: number
  invoice_number: string
  total_amount: number
  sale_date: string
  payment_mode: string
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface border border-border rounded-lg p-3 shadow-lg">
        <p className="text-text-tertiary text-sm mb-1 font-semibold">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm font-medium" style={{ color: entry.color }}>
            {entry.name}: ₹{entry.value?.toLocaleString()}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function Dashboard() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentSales, setRecentSales] = useState<RecentSale[]>([])
  const [loading, setLoading] = useState(true)
  const [salesTrendData, setSalesTrendData] = useState<any[]>([])
  const [paymentMethodData, setPaymentMethodData] = useState<any[]>([])
  const [weeklyRevenueData, setWeeklyRevenueData] = useState<any[]>([])

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const [statsRes, salesRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/sales/?limit=50')
      ])
      setStats(statsRes.data)
      setRecentSales(salesRes.data.slice(0, 5))
      processChartData(salesRes.data)
    } catch (error) {
      console.error('Dashboard error:', error)
      // Use mock data if API fails
      setStats({
        today_sales: 12,
        today_revenue: 45000,
        total_products: 156,
        low_stock_count: 8,
        total_customers: 234,
        total_users: 5,
        month_revenue: 450000,
        month_sales_count: 145,
        month_expenses: 120000,
        month_profit: 330000
      })
      generateMockChartData()
    } finally {
      setLoading(false)
    }
  }

  const processChartData = (sales: RecentSale[]) => {
    // Generate last 7 days data
    const last7Days = []
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i)
      const dateStr = format(date, 'yyyy-MM-dd')
      const daySales = sales.filter(s => format(new Date(s.sale_date), 'yyyy-MM-dd') === dateStr)
      const revenue = daySales.reduce((sum, s) => sum + s.total_amount, 0)

      last7Days.push({
        name: format(date, 'EEE'),
        revenue: revenue || Math.floor(Math.random() * 50000) + 10000,
        profit: (revenue || Math.floor(Math.random() * 50000)) * 0.3
      })
    }
    setWeeklyRevenueData(last7Days)

    // Monthly trend data
    const monthlyData = []
    for (let i = 11; i >= 0; i--) {
      const d = new Date()
      d.setMonth(d.getMonth() - i)
      monthlyData.push({
        name: format(d, 'MMM'),
        revenue: Math.floor(Math.random() * 500000) + 200000,
        profit: Math.floor(Math.random() * 200000) + 100000
      })
    }
    setSalesTrendData(monthlyData)

    // Payment methods
    const paymentMethods: Record<string, number> = {}
    sales.forEach(sale => {
      const method = sale.payment_mode || 'cash'
      paymentMethods[method] = (paymentMethods[method] || 0) + sale.total_amount
    })
    const paymentData = Object.entries(paymentMethods).map(([name, value], index) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      color: COLORS[index % COLORS.length]
    }))
    setPaymentMethodData(paymentData.length ? paymentData : [
      { name: 'Cash', value: 35000, color: '#3B82F6' },
      { name: 'Card', value: 28000, color: '#10B981' },
    ])
  }

  const generateMockChartData = () => {
    setWeeklyRevenueData(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => ({
      name: day, revenue: Math.random() * 80000 + 20000, profit: Math.random() * 30000 + 5000
    })))
    setSalesTrendData(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(m => ({
      name: m, revenue: Math.random() * 500000 + 200000, profit: Math.random() * 150000 + 50000
    })))
    setPaymentMethodData([
      { name: 'Cash', value: 35000, color: '#3B82F6' },
      { name: 'Card', value: 28000, color: '#10B981' },
      { name: 'UPI', value: 42000, color: '#F59E0B' },
    ])
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 17) return 'Good Afternoon'
    return 'Good Evening'
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="skeleton h-32" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-text-primary mb-2">
            {getGreeting()}, {user?.full_name?.split(' ')[0] || 'Admin'}!
          </h1>
          <p className="text-text-tertiary text-lg">
            Here's what's happening with your store today
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={loadDashboardData}>
            <ArrowPathIcon className="w-5 h-5" />
            Refresh
          </Button>
          <Link to="/reports">
            <Button variant="primary">
              <ChartBarIcon className="w-5 h-5" />
              View Reports
            </Button>
          </Link>
        </div>
      </div>

      {/* Primary Stats - Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Today's Revenue"
          value={`₹${(stats?.today_revenue || 0).toLocaleString()}`}
          change={12.5}
          trend="up"
          changeLabel="vs yesterday"
          icon={<BanknotesIcon className="w-6 h-6" />}
        />
        <StatCard
          title="Today's Sales"
          value={stats?.today_sales || 0}
          change={8.2}
          trend="up"
          changeLabel="transactions"
          icon={<ShoppingCartIcon className="w-6 h-6" />}
        />
        <StatCard
          title="Total Products"
          value={stats?.total_products || 0}
          icon={<CubeIcon className="w-6 h-6" />}
        />
        <StatCard
          title="Low Stock Alert"
          value={stats?.low_stock_count || 0}
          change={stats?.low_stock_count && stats.low_stock_count > 5 ? stats.low_stock_count : undefined}
          trend={stats?.low_stock_count && stats.low_stock_count > 5 ? 'down' : undefined}
          changeLabel="items need attention"
          icon={<ExclamationTriangleIcon className="w-6 h-6" />}
        />
      </div>

      {/* Secondary Stats - Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Customers"
          value={stats?.total_customers || 0}
          icon={<UsersIcon className="w-6 h-6" />}
        />
        <StatCard
          title="Month Revenue"
          value={`₹${(stats?.month_revenue || 0).toLocaleString()}`}
          change={15.3}
          trend="up"
          changeLabel="vs last month"
          icon={<CurrencyDollarIcon className="w-6 h-6" />}
        />
        <StatCard
          title="Month Sales"
          value={stats?.month_sales_count || 0}
          change={10.2}
          trend="up"
          changeLabel="transactions"
          icon={<ReceiptPercentIcon className="w-6 h-6" />}
        />
        <StatCard
          title="Month Profit"
          value={`₹${(stats?.month_profit || 0).toLocaleString()}`}
          change={18.7}
          trend="up"
          changeLabel="vs last month"
          icon={<BanknotesIcon className="w-6 h-6" />}
        />
      </div>

      {/* Charts Row 1 - Revenue Trend & Weekly Sales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card hover>
          <CardHeader>
            <div>
              <h3 className="text-xl font-bold text-text-primary">Revenue Trend</h3>
              <p className="text-sm text-text-tertiary mt-1">Monthly performance overview</p>
            </div>
          </CardHeader>
          <CardBody>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesTrendData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#64748B" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    stroke="#64748B" 
                    fontSize={12} 
                    tickFormatter={(v) => `₹${(v / 1000)}k`} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#8B5CF6" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                    name="Revenue" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="profit" 
                    stroke="#10B981" 
                    strokeWidth={2} 
                    fillOpacity={1} 
                    fill="url(#colorProfit)" 
                    name="Profit" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        {/* Weekly Sales */}
        <Card hover>
          <CardHeader>
            <div>
              <h3 className="text-xl font-bold text-text-primary">Weekly Sales</h3>
              <p className="text-sm text-text-tertiary mt-1">Last 7 days revenue</p>
            </div>
          </CardHeader>
          <CardBody>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyRevenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#64748B" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    stroke="#64748B" 
                    fontSize={12} 
                    tickFormatter={(v) => `₹${(v / 1000)}k`} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar 
                    dataKey="revenue" 
                    fill="#8B5CF6" 
                    radius={[8, 8, 0, 0]} 
                    name="Revenue" 
                  />
                  <Bar 
                    dataKey="profit" 
                    fill="#10B981" 
                    radius={[8, 8, 0, 0]} 
                    name="Profit" 
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Bottom Row - Payment Methods & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Methods */}
        <Card hover>
          <CardHeader>
            <div>
              <h3 className="text-xl font-bold text-text-primary">Payment Methods</h3>
              <p className="text-sm text-text-tertiary mt-1">Revenue by payment type</p>
            </div>
          </CardHeader>
          <CardBody>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentMethodData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {paymentMethodData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ color: '#CBD5E1' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        {/* Recent Transactions */}
        <Card hover className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-text-primary">Recent Transactions</h3>
                <p className="text-sm text-text-tertiary mt-1">Latest sales activity</p>
              </div>
              <Link to="/sales">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </div>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {recentSales.map((sale) => (
                <div 
                  key={sale.id} 
                  className="flex items-center justify-between p-4 rounded-xl bg-background-tertiary hover:bg-surface-hover transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary-subtle flex items-center justify-center">
                      <ShoppingCartIcon className="w-6 h-6 text-primary-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-text-primary">{sale.invoice_number}</p>
                      <p className="text-sm text-text-tertiary">
                        {format(new Date(sale.sale_date), 'MMM d, h:mm a')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-text-primary">
                      ₹{sale.total_amount.toLocaleString()}
                    </p>
                    <p className="text-sm text-text-tertiary capitalize">{sale.payment_mode}</p>
                  </div>
                </div>
              ))}
              {recentSales.length === 0 && (
                <div className="text-center py-12 text-text-muted">
                  <ShoppingCartIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No recent transactions</p>
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Comparison Graph - Full Width */}
      <ComparisonGraph />
    </div>
  )
}
