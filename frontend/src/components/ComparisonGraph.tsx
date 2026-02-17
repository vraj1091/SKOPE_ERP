import { useState, useEffect } from 'react'
import { format, subDays } from 'date-fns'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { CalendarIcon, ArrowPathIcon, ChartBarIcon } from '@heroicons/react/24/outline'
import api from '../utils/api'
import toast from 'react-hot-toast'

interface ComparisonData {
  date?: string
  month?: string
  day?: number
  revenue: number
  profit: number
  expenses: number
  transactions: number
}

interface ComparisonGraphProps {
  className?: string
}

type ComparisonMode = 'daily' | 'yearly' | 'monthly'

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
        <p className="text-gray-600 text-sm mb-1 font-semibold">{label}</p>
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

export default function ComparisonGraph({ className = '' }: ComparisonGraphProps) {
  const [mode, setMode] = useState<ComparisonMode>('daily')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<ComparisonData[]>([])

  // Daily mode states
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'))
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'))

  // Yearly mode states
  const [selectedYears, setSelectedYears] = useState<number[]>([new Date().getFullYear() - 1, new Date().getFullYear()])
  const [yearlyData, setYearlyData] = useState<Record<string, ComparisonData[]>>({})

  // Monthly mode states
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedMonths, setSelectedMonths] = useState<number[]>([new Date().getMonth() + 1])
  const [monthlyData, setMonthlyData] = useState<Record<string, ComparisonData[]>>({})

  useEffect(() => {
    loadData()
  }, [mode, startDate, endDate, selectedYears, selectedYear, selectedMonths])

  const loadData = async () => {
    setLoading(true)
    try {
      if (mode === 'daily') {
        await loadDailyData()
      } else if (mode === 'yearly') {
        await loadYearlyData()
      } else if (mode === 'monthly') {
        await loadMonthlyData()
      }
    } catch (error: any) {
      console.error('Comparison data error:', error)
      toast.error('Failed to load comparison data')
    } finally {
      setLoading(false)
    }
  }

  const loadDailyData = async () => {
    try {
      const response = await api.get('/comparison/daily-comparison', {
        params: { start_date: startDate, end_date: endDate }
      })
      setData(response.data.data || [])
    } catch (e) {
      // Fallback or empty
    }
  }

  const loadYearlyData = async () => {
    try {
      const response = await api.get('/comparison/yearly-comparison', {
        params: { years: selectedYears.join(',') }
      })
      setYearlyData(response.data.data || {})
    } catch (e) { }
  }

  const loadMonthlyData = async () => {
    try {
      const response = await api.get('/comparison/monthly-comparison', {
        params: {
          year: selectedYear,
          months: selectedMonths.join(',')
        }
      })
      setMonthlyData(response.data.data || {})
    } catch (e) { }
  }

  const handleYearToggle = (year: number) => {
    if (selectedYears.includes(year)) {
      if (selectedYears.length > 1) {
        setSelectedYears(selectedYears.filter(y => y !== year))
      }
    } else {
      if (selectedYears.length < 3) {
        setSelectedYears([...selectedYears, year].sort())
      } else {
        toast.error('Maximum 3 years can be compared')
      }
    }
  }

  const handleMonthToggle = (month: number) => {
    if (selectedMonths.includes(month)) {
      if (selectedMonths.length > 1) {
        setSelectedMonths(selectedMonths.filter(m => m !== month))
      }
    } else {
      if (selectedMonths.length < 3) {
        setSelectedMonths([...selectedMonths, month].sort())
      } else {
        toast.error('Maximum 3 months can be compared')
      }
    }
  }

  const getYearColor = (index: number) => {
    const colors = ['#2563eb', '#10b981', '#f59e0b'] // Blue, Emerald, Amber
    return colors[index % colors.length]
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const currentYear = new Date().getFullYear()
  const availableYears = Array.from({ length: 5 }, (_, i) => currentYear - i)

  return (
    <div className={`p-6 rounded-xl bg-white border border-gray-200 shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
            <ChartBarIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Revenue & Profit Comparison</h3>
            <p className="text-sm text-gray-500">Compare performance across different time periods</p>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex bg-gray-100 p-1 rounded-lg">
          {(['daily', 'yearly', 'monthly'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all capitalize ${mode === m
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
        {mode === 'daily' && (
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex-1 w-full">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={loadData}
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        )}

        {mode === 'yearly' && (
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Select Years (Max 3)</label>
            <div className="flex flex-wrap gap-2">
              {availableYears.map((year) => (
                <button
                  key={year}
                  onClick={() => handleYearToggle(year)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors border ${selectedYears.includes(year)
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                    }`}
                >
                  {year}
                </button>
              ))}
            </div>
          </div>
        )}

        {mode === 'monthly' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Select Year</label>
              <div className="flex flex-wrap gap-2">
                {availableYears.map((year) => (
                  <button
                    key={year}
                    onClick={() => setSelectedYear(year)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors border ${selectedYear === year
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                      }`}
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Select Months (Max 3)</label>
              <div className="flex flex-wrap gap-2">
                {monthNames.map((month, index) => (
                  <button
                    key={index}
                    onClick={() => handleMonthToggle(index + 1)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors border ${selectedMonths.includes(index + 1)
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                      }`}
                  >
                    {month.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="h-80">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {mode === 'daily' ? (
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="#9ca3af"
                  fontSize={12}
                  tickMargin={10}
                  tickFormatter={(value) => format(new Date(value), 'MMM dd')}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  stroke="#9ca3af"
                  fontSize={12}
                  tickFormatter={(v) => `₹${(v / 1000)}k`}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1 }} />
                <Legend iconType="circle" />
                <Line type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2} dot={{ r: 3, fill: '#2563eb', strokeWidth: 0 }} activeDot={{ r: 5 }} name="Revenue" />
                <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} dot={{ r: 3, fill: '#10b981', strokeWidth: 0 }} name="Profit" />
                <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} strokeDasharray="4 4" dot={false} name="Expenses" />
              </LineChart>
            ) : mode === 'yearly' ? (
              <BarChart data={yearlyData[selectedYears[0]] || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} axisLine={false} tickLine={false} />
                <YAxis stroke="#9ca3af" fontSize={12} tickFormatter={(v) => `₹${(v / 1000)}k`} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f3f4f6' }} />
                <Legend iconType="circle" />
                {selectedYears.map((year, index) => (
                  <Bar
                    key={year}
                    data={yearlyData[year] || []}
                    dataKey="revenue"
                    fill={getYearColor(index)}
                    radius={[4, 4, 0, 0]}
                    name={`${year} Revenue`}
                  />
                ))}
              </BarChart>
            ) : (
              <LineChart data={monthlyData[monthNames[selectedMonths[0] - 1]] || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="day" stroke="#9ca3af" fontSize={12} axisLine={false} tickLine={false} />
                <YAxis stroke="#9ca3af" fontSize={12} tickFormatter={(v) => `₹${(v / 1000)}k`} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" />
                {selectedMonths.map((month, index) => {
                  const monthName = monthNames[month - 1]
                  return (
                    <Line
                      key={month}
                      data={monthlyData[monthName] || []}
                      type="monotone"
                      dataKey="revenue"
                      stroke={getYearColor(index)}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      name={`${monthName} Revenue`}
                    />
                  )
                })}
              </LineChart>
            )}
          </ResponsiveContainer>
        )}
      </div>

      {/* Summary Stats Footer */}
      {!loading && mode === 'daily' && data.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase">Total Revenue</p>
            <p className="text-lg font-bold text-gray-900 mt-0.5">
              ₹{data.reduce((sum, d) => sum + d.revenue, 0).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase">Total Profit</p>
            <p className="text-lg font-bold text-gray-900 mt-0.5">
              ₹{data.reduce((sum, d) => sum + d.profit, 0).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase">Total Expenses</p>
            <p className="text-lg font-bold text-gray-900 mt-0.5">
              ₹{data.reduce((sum, d) => sum + d.expenses, 0).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase">Transactions</p>
            <p className="text-lg font-bold text-gray-900 mt-0.5">
              {data.reduce((sum, d) => sum + d.transactions, 0)}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
