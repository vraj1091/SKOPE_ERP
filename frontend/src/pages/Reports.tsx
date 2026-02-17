import { useState } from 'react'
import api from '../utils/api'
import toast from 'react-hot-toast'
import {
  DocumentArrowDownIcon,
  DocumentTextIcon,
  CalendarDaysIcon,
  Cog6ToothIcon,
  CheckIcon,
  ChartBarIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline'
import StoreSelector from '../components/StoreSelector'
import { useAuthStore } from '../store/authStore'
import { PageHeader, PremiumCard, Button, Badge } from '../components/PremiumUI'

export default function Reports() {
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [selectedReport, setSelectedReport] = useState<string | null>(null)
  const [showCustomColumns, setShowCustomColumns] = useState(false)
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  })
  const [selectedStoreId, setSelectedStoreId] = useState<number | 'all'>(user?.role === 'super_admin' ? 'all' : (user?.store_id || 'all'))

  const downloadReport = async (reportType: string, endpoint: string) => {
    setLoading(true)
    setSelectedReport(reportType)

    try {
      const params: any = {
        start_date: `${dateRange.startDate}T00:00:00`,
        end_date: `${dateRange.endDate}T23:59:59`
      }
      if (selectedStoreId !== 'all') {
        params.store_id = selectedStoreId
      }

      const response = await api.get(endpoint, {
        responseType: 'blob',
        params
      })

      let filename = `${reportType}_${new Date().toISOString().split('T')[0]}.xlsx`
      const contentDisposition = response.headers['content-disposition']
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '')
        }
      }

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      toast.success('Report downloaded successfully')
    } catch (error: any) {
      console.error('Download error:', error)
      let errorMessage = 'Failed to download report'
      if (error.response?.data) {
        if (error.response.data instanceof Blob) {
          try {
            const text = await error.response.data.text()
            const errorData = JSON.parse(text)
            errorMessage = errorData.detail || errorMessage
          } catch (e) { }
        }
      }
      toast.error(errorMessage)
    } finally {
      setLoading(false)
      setSelectedReport(null)
    }
  }

  const availableColumns = {
    sales: ['Transaction ID', 'Date', 'Customer', 'Items', 'Subtotal', 'Tax', 'Total', 'Payment Method', 'Store'],
    inventory: ['SKU', 'Product Name', 'Category', 'Stock', 'Min Stock', 'Cost Price', 'Selling Price', 'GST', 'Warranty'],
    customers: ['ID', 'Name', 'Phone', 'Email', 'Total Purchases', 'Total Spent', 'Last Purchase', 'Status'],
    expenses: ['Date', 'Category', 'Description', 'Amount', 'Payment Mode', 'Vendor', 'Receipt #', 'Voucher']
  }

  const reports = [
    {
      id: 'sales',
      title: 'Sales Report',
      description: 'Download detailed sales transactions with custom columns',
      endpoint: '/reports/sales/excel',
      color: 'blue',
      icon: '📊',
    },
    {
      id: 'inventory',
      title: 'Inventory Report',
      description: 'Current stock levels, product details, and valuations',
      endpoint: '/reports/inventory/excel',
      color: 'violet',
      icon: '📦',
    },
    {
      id: 'customers',
      title: 'Customer Report',
      description: 'Customer database with purchase history and analytics',
      endpoint: '/reports/customers/excel',
      color: 'emerald',
      icon: '👥',
    },
    {
      id: 'expenses',
      title: 'Expenses Report',
      description: 'Expense records with vouchers and financial details',
      endpoint: '/reports/expenses/excel',
      color: 'rose',
      icon: '💰',
    },
    {
      id: 'profit_loss',
      title: 'Profit & Loss Statement',
      description: 'Comprehensive P&L report with revenue and expense breakdown',
      endpoint: '/reports/profit-loss/excel',
      color: 'cyan',
      icon: '📈',
    },
    {
      id: 'tax',
      title: 'GST/Tax Report',
      description: 'GST collected, paid, and tax compliance records',
      endpoint: '/reports/tax/excel',
      color: 'amber',
      icon: '📝',
    },
  ]

  const getColorClasses = (color: string) => {
    const colors: Record<string, { gradient: string; bg: string; border: string }> = {
      blue: { gradient: 'from-blue-500 to-cyan-500', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
      violet: { gradient: 'from-violet-500 to-purple-600', bg: 'bg-violet-500/10', border: 'border-violet-500/30' },
      emerald: { gradient: 'from-emerald-500 to-green-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
      rose: { gradient: 'from-rose-500 to-pink-500', bg: 'bg-rose-500/10', border: 'border-rose-500/30' },
      cyan: { gradient: 'from-cyan-500 to-blue-500', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30' },
      amber: { gradient: 'from-amber-500 to-orange-500', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
    }
    return colors[color] || colors.violet
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <PageHeader
        title="Reports & Analytics"
        subtitle="Generate and download comprehensive business reports"
        icon={DocumentTextIcon}
        actions={
          <StoreSelector
            selectedStoreId={selectedStoreId}
            onStoreChange={setSelectedStoreId}
            showAllOption={true}
          />
        }
      />

      {/* Date Range & Options */}
      <PremiumCard delay={100}>
        <div className="flex items-center gap-2 mb-4">
          <CalendarDaysIcon className="w-5 h-5 text-violet-400" />
          <h3 className="font-bold text-white">Report Settings</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Start Date</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">End Date</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setShowCustomColumns(!showCustomColumns)}
              className="w-full px-4 py-3 rounded-xl bg-violet-500/10 border border-violet-500/30 text-violet-400 hover:bg-violet-500/20 transition-all font-medium flex items-center justify-center gap-2"
            >
              <Cog6ToothIcon className="w-5 h-5" />
              {showCustomColumns ? 'Custom Columns Active' : 'Customize Columns'}
            </button>
          </div>
        </div>
        <div className="mt-4">
          <Badge color="cyan">
            Selected range: {Math.ceil((new Date(dateRange.endDate).getTime() - new Date(dateRange.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
          </Badge>
        </div>
      </PremiumCard>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report, index) => {
          const colors = getColorClasses(report.color)
          return (
            <div
              key={report.id}
              className="opacity-0 animate-fade-in-up"
              style={{ animationDelay: `${200 + index * 100}ms`, animationFillMode: 'forwards' }}
            >
              <PremiumCard hover className="h-full relative overflow-hidden">
                {/* Top Accent */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${colors.gradient}`} />
                
                {/* Icon Background Glow */}
                <div className={`absolute top-6 left-6 w-20 h-20 bg-gradient-to-br ${colors.gradient} opacity-20 blur-2xl rounded-full`} />

                <div className="p-6 relative">
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`text-4xl p-4 rounded-2xl bg-gradient-to-br ${colors.gradient} shadow-xl relative z-10`}>
                      {report.icon}
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-text-primary mb-1">{report.title}</h2>
                      <p className="text-xs text-text-muted font-medium">
                        {dateRange.startDate} to {dateRange.endDate}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-text-tertiary mb-6 min-h-[48px] leading-relaxed">{report.description}</p>

                  <Button
                    onClick={() => downloadReport(report.id, report.endpoint)}
                    disabled={loading && selectedReport === report.id}
                    className="w-full"
                    icon={DocumentArrowDownIcon}
                  >
                    {loading && selectedReport === report.id ? (
                      <span className="flex items-center gap-2">
                        <div className="spinner w-4 h-4" />
                        Generating...
                      </span>
                    ) : (
                      'Download Excel'
                    )}
                  </Button>
                </div>
              </PremiumCard>
            </div>
          )
        })}
      </div>

      {/* Daily Closing Report */}
      <PremiumCard title="Daily Closing Report" subtitle="Generate a comprehensive daily closing report" delay={800}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Select Date</label>
            <input
              type="date"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all"
              defaultValue={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div className="flex items-end">
            <Button className="w-full">Generate Report</Button>
          </div>
        </div>
      </PremiumCard>

      {/* Custom Columns Section */}
      {showCustomColumns && (
        <PremiumCard delay={900}>
          <div className="flex items-center gap-2 mb-4">
            <Cog6ToothIcon className="w-5 h-5 text-violet-400" />
            <h3 className="font-bold text-white">Customize Report Columns</h3>
          </div>
          <p className="text-sm text-gray-400 mb-6">
            Select which columns you want in your reports. This will be saved for future exports.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(availableColumns).map(([reportType, columns]) => (
              <div key={reportType} className="bg-white/5 rounded-xl p-4 border border-white/10">
                <h4 className="font-bold text-white mb-3 capitalize flex items-center gap-2">
                  {reports.find(r => r.id === reportType)?.icon}
                  {reportType} Columns
                </h4>
                <div className="space-y-2">
                  {columns.map((col) => (
                    <label key={col} className="flex items-center gap-2 text-sm text-gray-400 hover:bg-white/5 p-2 rounded cursor-pointer">
                      <input type="checkbox" className="rounded accent-violet-500" defaultChecked />
                      <span>{col}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex gap-3">
            <Button>💾 Save Column Preferences</Button>
            <Button variant="secondary" onClick={() => setShowCustomColumns(false)}>
              Cancel
            </Button>
          </div>
        </PremiumCard>
      )}

      {/* Report Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PremiumCard delay={1000}>
          <div className="flex items-center gap-2 mb-4">
            <ChartBarIcon className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-white">Report Features</h3>
          </div>
          <ul className="text-sm text-gray-400 space-y-3">
            {[
              'All reports in Excel format (.xlsx)',
              'Custom date range selection',
              'Customizable columns',
              'Historical data access',
              'GST/Tax compliance ready'
            ].map((feature, i) => (
              <li key={i} className="flex items-center gap-2">
                <CheckIcon className="w-4 h-4 text-emerald-400" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </PremiumCard>

        <PremiumCard delay={1100}>
          <div className="flex items-center gap-2 mb-4">
            <LightBulbIcon className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-white">Pro Tips</h3>
          </div>
          <ul className="text-sm text-gray-400 space-y-3">
            {[
              'Use custom date ranges for month-over-month comparison',
              'Download expense reports with vouchers for audits',
              'Generate P&L statements for financial analysis',
              'Export customer data for marketing campaigns'
            ].map((tip, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-violet-400">→</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </PremiumCard>
      </div>
    </div>
  )
}
