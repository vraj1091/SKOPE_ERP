import { useState } from 'react'
import { ChartBarIcon, DocumentArrowDownIcon, CalendarIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import api from '../utils/api'
import { PageHeader, PremiumCard, Button, StatCard, Badge } from '../components/PremiumUI'

interface ReportTemplate {
  id: string
  name: string
  description: string
  icon: string
  category: string
  endpoint: string
  hasDownload?: boolean
}

export default function AdvancedReports() {
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  })

  const reportTemplates: ReportTemplate[] = [
    // Sales Analytics
    {
      id: 'product-wise',
      name: 'Product-wise Sales Report',
      description: 'Detailed sales breakdown by product with quantities, revenue, margins, and discounts',
      icon: '📦',
      category: 'Sales Analytics',
      endpoint: '/reports/sales/product-wise',
      hasDownload: true
    },
    {
      id: 'category-wise',
      name: 'Category-wise Sales Analysis',
      description: 'Revenue and profit analysis by product category with contribution percentages',
      icon: '📊',
      category: 'Sales Analytics',
      endpoint: '/reports/sales/category-wise',
      hasDownload: true
    },
    {
      id: 'daily-summary',
      name: 'Daily Sales Summary',
      description: 'Today\'s sales with comparisons to yesterday and last week, payment mode breakdown',
      icon: '📈',
      category: 'Sales Analytics',
      endpoint: '/reports/sales/daily-summary',
      hasDownload: true
    },

    // Staff Performance
    {
      id: 'staff-sales',
      name: 'Staff Sales Performance',
      description: 'Individual staff member sales metrics: bills generated, sales value, units sold',
      icon: '👨‍💼',
      category: 'Staff Performance',
      endpoint: '/reports/staff/sales-report',
      hasDownload: true
    },
    {
      id: 'staff-incentive',
      name: 'Staff Incentive Report',
      description: 'Monthly incentive calculations based on targets achieved and pending payments',
      icon: '💰',
      category: 'Staff Performance',
      endpoint: '/reports/staff/incentive-report',
      hasDownload: true
    },
    {
      id: 'staff-attendance',
      name: 'Attendance & Sales Correlation',
      description: 'Staff attendance linked with sales performance - productivity analysis',
      icon: '📅',
      category: 'Staff Performance',
      endpoint: '/reports/staff/attendance-sales-correlation',
      hasDownload: true
    },

    // Inventory Analytics
    {
      id: 'live-stock',
      name: 'Live Stock Report',
      description: 'Current stock levels across all products with last sold dates',
      icon: '📦',
      category: 'Inventory Analytics',
      endpoint: '/reports/inventory/live-stock',
      hasDownload: true
    },
    {
      id: 'stock-movement',
      name: 'Stock Movement Analysis',
      description: 'Fast moving vs slow moving items with stock ageing classification',
      icon: '🔄',
      category: 'Inventory Analytics',
      endpoint: '/reports/inventory/movement-analysis',
      hasDownload: true
    },
    {
      id: 'reorder-level',
      name: 'Reorder Level Alert',
      description: 'Products below minimum stock with suggested reorder quantities and costs',
      icon: '⚠️',
      category: 'Inventory Analytics',
      endpoint: '/reports/inventory/reorder-level',
      hasDownload: true
    },
    {
      id: 'high-value-stock',
      name: 'High Value Stock Report',
      description: 'High-value inventory with low movement - capital blocked analysis',
      icon: '💎',
      category: 'Inventory Analytics',
      endpoint: '/reports/inventory/high-value-stock',
      hasDownload: true
    },

    // Profitability Analysis
    {
      id: 'item-margin',
      name: 'Item-wise Margin Report',
      description: 'Cost vs selling price analysis with net margins and margin percentages',
      icon: '📊',
      category: 'Profitability Analysis',
      endpoint: '/reports/profitability/item-wise-margin',
      hasDownload: true
    },
    {
      id: 'brand-profitability',
      name: 'Brand-wise Profitability',
      description: 'Revenue and profit breakdown by brand with margin analysis',
      icon: '🏷️',
      category: 'Profitability Analysis',
      endpoint: '/reports/profitability/brand-wise',
      hasDownload: true
    },
    {
      id: 'discount-impact',
      name: 'Discount Impact Analysis',
      description: 'How discounts affect profitability - total discount given and profit erosion',
      icon: '💸',
      category: 'Profitability Analysis',
      endpoint: '/reports/profitability/discount-impact',
      hasDownload: true
    },

    // Customer Analytics
    {
      id: 'repeat-customers',
      name: 'Repeat Customer Analysis',
      description: 'Customers with multiple visits, lifetime value, and preferred products',
      icon: '👥',
      category: 'Customer Analytics',
      endpoint: '/reports/customers/repeat-customers',
      hasDownload: true
    },
    {
      id: 'warranty-due',
      name: 'Warranty Expiry Alert',
      description: 'Products with warranties expiring in the next 30 days for follow-up',
      icon: '🛡️',
      category: 'Customer Analytics',
      endpoint: '/reports/customers/warranty-due',
      hasDownload: true
    },

    // Financial Reports
    {
      id: 'payment-mode',
      name: 'Payment Mode Breakdown',
      description: 'Transaction count and amount by payment method (Cash, Card, UPI, QR)',
      icon: '💳',
      category: 'Financial Reports',
      endpoint: '/reports/finance/payment-mode-report',
      hasDownload: true
    },
    {
      id: 'outstanding',
      name: 'Outstanding Receivables',
      description: 'Pending payments with customer details and ageing analysis',
      icon: '📋',
      category: 'Financial Reports',
      endpoint: '/reports/finance/outstanding-receivables',
      hasDownload: true
    }
  ]

  const categories = Array.from(new Set(reportTemplates.map(r => r.category)))
  const [reportData, setReportData] = useState<any>(null)
  const [showModal, setShowModal] = useState(false)
  const [selectedReportName, setSelectedReportName] = useState('')
  const [loading, setLoading] = useState(false)

  const handleGenerateReport = async (reportId: string) => {
    const report = reportTemplates.find(r => r.id === reportId)
    if (!report) return

    setLoading(true)
    setSelectedReportName(report.name)

    try {
      const params: any = {}

      // Add date range for applicable reports
      if (!report.id.includes('live-stock') && !report.id.includes('repeat') && !report.id.includes('outstanding')) {
        // Convert date to datetime string (ISO 8601 format)
        params.start_date = `${dateRange.start}T00:00:00`
        params.end_date = `${dateRange.end}T23:59:59`
      }

      // Special handling for warranty due report
      if (report.id === 'warranty-due') {
        params.days_ahead = 30
      }

      const response = await api.get(report.endpoint, { params })
      setReportData(response.data)
      setShowModal(true)
      toast.success(`${report.name} generated successfully!`)
    } catch (error: any) {
      console.error('Report generation error:', error)

      // Handle different error types
      let errorMessage = 'Failed to generate report'

      if (error.response?.data?.detail) {
        const detail = error.response.data.detail
        // If detail is an array of validation errors
        if (Array.isArray(detail)) {
          errorMessage = detail.map((err: any) => err.msg || JSON.stringify(err)).join(', ')
        }
        // If detail is an object
        else if (typeof detail === 'object') {
          errorMessage = detail.msg || JSON.stringify(detail)
        }
        // If detail is a string
        else {
          errorMessage = detail
        }
      }

      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const downloadReportAsExcel = async () => {
    const report = reportTemplates.find(r => r.name === selectedReportName)
    if (!report) return

    try {
      const params: any = {}

      // Add date range for applicable reports
      if (!report.id.includes('live-stock') && !report.id.includes('repeat') && !report.id.includes('outstanding')) {
        params.start_date = `${dateRange.start}T00:00:00`
        params.end_date = `${dateRange.end}T23:59:59`
      }

      // Special handling for daily summary
      if (report.id === 'daily-summary') {
        params.date = `${dateRange.end}T00:00:00`
      }

      const response = await api.get(`${report.endpoint}/excel`, {
        responseType: 'blob',
        params
      })

      // Try to get filename from Content-Disposition header
      let filename = `${report.id}_${dateRange.start}_${dateRange.end}.xlsx`
      const contentDisposition = response.headers['content-disposition']
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '')
        }
      }

      // Create blob and download
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      toast.success('Excel report downloaded successfully!')
    } catch (error: any) {
      console.error('Download error:', error)
      toast.error('Failed to download Excel report')
    }
  }

  const renderTableData = () => {
    if (!reportData) return null

    console.log('Report Data:', reportData) // Debug log

    // Get the main data array from response
    let dataArray: any[] = []
    let columns: string[] = []

    // Check for different data array structures
    if (reportData.products && Array.isArray(reportData.products) && reportData.products.length > 0) {
      dataArray = reportData.products
      columns = Object.keys(dataArray[0])
    } else if (reportData.categories && Array.isArray(reportData.categories) && reportData.categories.length > 0) {
      dataArray = reportData.categories
      columns = Object.keys(dataArray[0])
    } else if (reportData.staff && Array.isArray(reportData.staff) && reportData.staff.length > 0) {
      dataArray = reportData.staff
      columns = Object.keys(dataArray[0])
    } else if (reportData.staff_report && Array.isArray(reportData.staff_report) && reportData.staff_report.length > 0) {
      dataArray = reportData.staff_report
      columns = Object.keys(dataArray[0])
    } else if (reportData.staff_incentives && Array.isArray(reportData.staff_incentives) && reportData.staff_incentives.length > 0) {
      dataArray = reportData.staff_incentives
      columns = Object.keys(dataArray[0])
    } else if (reportData.stock_report && Array.isArray(reportData.stock_report) && reportData.stock_report.length > 0) {
      dataArray = reportData.stock_report
      columns = Object.keys(dataArray[0])
    } else if (reportData.stock_analysis && Array.isArray(reportData.stock_analysis) && reportData.stock_analysis.length > 0) {
      dataArray = reportData.stock_analysis
      columns = Object.keys(dataArray[0])
    } else if (reportData.reorder_report && Array.isArray(reportData.reorder_report) && reportData.reorder_report.length > 0) {
      dataArray = reportData.reorder_report
      columns = Object.keys(dataArray[0])
    } else if (reportData.high_value_stock && Array.isArray(reportData.high_value_stock) && reportData.high_value_stock.length > 0) {
      dataArray = reportData.high_value_stock
      columns = Object.keys(dataArray[0])
    } else if (reportData.margin_report && Array.isArray(reportData.margin_report) && reportData.margin_report.length > 0) {
      dataArray = reportData.margin_report
      columns = Object.keys(dataArray[0])
    } else if (reportData.brand_report && Array.isArray(reportData.brand_report) && reportData.brand_report.length > 0) {
      dataArray = reportData.brand_report
      columns = Object.keys(dataArray[0])
    } else if (reportData.payment_breakdown && Array.isArray(reportData.payment_breakdown) && reportData.payment_breakdown.length > 0) {
      dataArray = reportData.payment_breakdown
      columns = Object.keys(dataArray[0])
    } else if (reportData.repeat_customers && Array.isArray(reportData.repeat_customers) && reportData.repeat_customers.length > 0) {
      dataArray = reportData.repeat_customers
      columns = Object.keys(dataArray[0])
    } else if (reportData.warranty_due_list && Array.isArray(reportData.warranty_due_list) && reportData.warranty_due_list.length > 0) {
      dataArray = reportData.warranty_due_list
      columns = Object.keys(dataArray[0])
    } else if (reportData.customers && Array.isArray(reportData.customers) && reportData.customers.length > 0) {
      dataArray = reportData.customers
      columns = Object.keys(dataArray[0])
    } else if (reportData.items && Array.isArray(reportData.items) && reportData.items.length > 0) {
      dataArray = reportData.items
      columns = Object.keys(dataArray[0])
    } else if (reportData.brands && Array.isArray(reportData.brands) && reportData.brands.length > 0) {
      dataArray = reportData.brands
      columns = Object.keys(dataArray[0])
    } else if (reportData.payment_modes && Array.isArray(reportData.payment_modes) && reportData.payment_modes.length > 0) {
      dataArray = reportData.payment_modes
      columns = Object.keys(dataArray[0])
    } else if (reportData.receivables && Array.isArray(reportData.receivables) && reportData.receivables.length > 0) {
      dataArray = reportData.receivables
      columns = Object.keys(dataArray[0])
    }

    // If we have data array, render table
    if (dataArray.length > 0 && columns.length > 0) {
      // Format column names
      const formatColumnName = (col: string) => {
        return col
          .split('_')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')
      }

      // Check if column is a percentage column
      const isPercentColumn = (col: string) => {
        const percentKeywords = ['percent', 'percentage', 'rate', 'contribution_percent', 'achievement_percent']
        return percentKeywords.some(keyword => col.toLowerCase().includes(keyword))
      }

      // Check if column value should be formatted as currency
      const isCurrencyColumn = (col: string, value: any) => {
        if (typeof value !== 'number') return false
        // Exclude percentage columns from currency formatting
        if (isPercentColumn(col)) return false
        const currencyKeywords = ['value', 'price', 'sales', 'revenue', 'margin', 'profit', 'discount', 'amount', 'cost', 'total', 'subtotal']
        return currencyKeywords.some(keyword => col.toLowerCase().includes(keyword))
      }

      return (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-surface-hover">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col}
                    className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider"
                  >
                    {formatColumnName(col)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-surface divide-y divide-border">
              {dataArray.map((row, idx) => (
                <tr key={idx} className="hover:bg-surface-hover transition-colors">
                  {columns.map((col) => (
                    <td key={col} className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                      {isPercentColumn(col) && typeof row[col] === 'number'
                        ? `${Number(row[col]).toFixed(2)}%`
                        : isCurrencyColumn(col, row[col])
                          ? `₹${Number(row[col]).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                          : (row[col] !== null && row[col] !== undefined ? String(row[col]) : '-')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }

    // For reports with custom structure (like daily summary) - render as cards
    return (
      <div className="space-y-4">
        {Object.entries(reportData).map(([key, value]) => {
          // Skip metadata fields
          if (key === 'start_date' || key === 'end_date' || key === 'date') return null

          if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            return (
              <div key={key} className="bg-surface-hover p-4 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-3 capitalize text-text-primary">{key.replace(/_/g, ' ')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(value as Record<string, any>).map(([subKey, subValue]) => (
                    <div key={subKey} className="flex justify-between items-center">
                      <span className="text-text-tertiary capitalize text-sm">{subKey.replace(/_/g, ' ')}:</span>
                      <span className="font-semibold text-text-primary">
                        {typeof subValue === 'number' && (subKey.includes('amount') || subKey.includes('value') || subKey.includes('total'))
                          ? `₹${Number(subValue).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                          : String(subValue)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )
          } else if (!Array.isArray(value) && value !== null) {
            return (
              <div key={key} className="flex justify-between items-center p-4 bg-surface-hover rounded-lg border border-border">
                <span className="text-text-tertiary capitalize font-medium">{key.replace(/_/g, ' ')}:</span>
                <span className="font-bold text-text-primary">
                  {typeof value === 'number' && (key.includes('amount') || key.includes('value') || key.includes('total') || key.includes('sales'))
                    ? `₹${Number(value).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                    : String(value)}
                </span>
              </div>
            )
          }
          return null
        })}
        {Object.keys(reportData).filter(k => !['start_date', 'end_date', 'date'].includes(k)).length === 0 && (
          <div className="text-center py-8 text-text-muted">
            No data available for the selected criteria
          </div>
        )}
      </div>
    )
  }

  const renderSummaryCards = () => {
    if (!reportData) return null

    const cards = []

    if (reportData.total_sales !== undefined) {
      cards.push(
        <div key="sales" className="bg-primary-subtle p-4 rounded-lg border border-primary-500/30">
          <div className="text-primary-400 text-sm font-semibold">Total Sales</div>
          <div className="text-2xl font-bold text-text-primary">₹{reportData.total_sales.toLocaleString()}</div>
        </div>
      )
    }

    if (reportData.num_bills !== undefined) {
      cards.push(
        <div key="bills" className="bg-success-bg p-4 rounded-lg border border-success/30">
          <div className="text-success text-sm font-semibold">Number of Bills</div>
          <div className="text-2xl font-bold text-text-primary">{reportData.num_bills}</div>
        </div>
      )
    }

    if (reportData.average_bill_value !== undefined) {
      cards.push(
        <div key="avg" className="bg-surface-hover p-4 rounded-lg border border-border">
          <div className="text-primary-400 text-sm font-semibold">Average Bill Value</div>
          <div className="text-2xl font-bold text-text-primary">₹{reportData.average_bill_value.toLocaleString()}</div>
        </div>
      )
    }

    if (reportData.products && Array.isArray(reportData.products)) {
      cards.push(
        <div key="count" className="bg-surface-hover p-4 rounded-lg border border-border">
          <div className="text-primary-400 text-sm font-semibold">Total Items</div>
          <div className="text-2xl font-bold text-text-primary">{reportData.products.length}</div>
        </div>
      )
    }

    if (reportData.categories && Array.isArray(reportData.categories)) {
      cards.push(
        <div key="categories" className="bg-surface-hover p-4 rounded-lg border border-border">
          <div className="text-primary-400 text-sm font-semibold">Categories</div>
          <div className="text-2xl font-bold text-text-primary">{reportData.categories.length}</div>
        </div>
      )
    }

    return cards.length > 0 ? cards : null
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <PageHeader
        title="Advanced Reports"
        subtitle="Deep analytics and insights with advanced reporting templates"
        icon={ChartBarIcon}
        actions={
          <Badge color="violet">{reportTemplates.length} Report Templates</Badge>
        }
      />

      {/* Date Range Selector */}
      <PremiumCard delay={100}>
        <div className="flex items-center gap-4">
          <CalendarIcon className="w-6 h-6 text-primary-400" />
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-text-tertiary mb-2">Start Date</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-text-tertiary mb-2">End Date</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="input w-full"
              />
            </div>
          </div>
        </div>
      </PremiumCard>

      {/* Reports by Category */}
      {categories.map((category, catIndex) => (
        <div key={category} className="space-y-4">
          <h2 className="text-2xl font-bold text-text-primary flex items-center gap-3">
            <div className="w-2 h-8 bg-gradient-to-b from-primary-400 to-primary-600 rounded-full"></div>
            {category}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reportTemplates
              .filter(report => report.category === category)
              .map((report, index) => (
                <div
                  key={report.id}
                  className="opacity-0 animate-fade-in-up"
                  style={{ animationDelay: `${200 + catIndex * 100 + index * 50}ms`, animationFillMode: 'forwards' }}
                >
                  <PremiumCard hover className="h-full">
                    <div className="p-6">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="text-4xl">{report.icon}</div>
                        <Badge color="emerald">Real Data</Badge>
                      </div>
                      <h3 className="text-lg font-bold text-text-primary mb-2">
                        {report.name}
                      </h3>

                      {/* Content */}
                      <p className="text-sm text-text-tertiary mb-6 leading-relaxed">
                        {report.description}
                      </p>

                      <Button
                        onClick={() => handleGenerateReport(report.id)}
                        disabled={loading}
                        className="w-full"
                        icon={ChartBarIcon}
                      >
                        {loading && selectedReportName === report.name ? 'Generating...' : 'View Report'}
                      </Button>
                    </div>
                  </PremiumCard>
                </div>
              ))}
          </div>
        </div>
      ))}

      {/* Info Banner */}
      <PremiumCard delay={1000}>
        <div className="flex items-start gap-4">
          <ChartBarIcon className="w-6 h-6 text-primary-400 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-bold text-text-primary mb-2">Real-Time Analytics with Database</h3>
            <p className="text-text-tertiary text-sm leading-relaxed">
              All reports are generated from your actual business data stored in the database.
              Select a date range and click "View Report" to see comprehensive analytics with real values.
              Reports include sales data, staff performance, inventory analysis, and customer insights.
            </p>
          </div>
        </div>
      </PremiumCard>

      {/* Report Data Modal */}
      {showModal && reportData && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-border">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-6 text-white flex justify-between items-center border-b border-border">
              <div>
                <h2 className="text-2xl font-bold">{selectedReportName}</h2>
                <p className="text-white/80 text-sm mt-1">
                  {reportData.start_date && reportData.end_date
                    ? `${reportData.start_date} to ${reportData.end_date}`
                    : 'Current Data'}
                </p>
              </div>
              <div className="flex gap-2">
                {reportTemplates.find(r => r.name === selectedReportName)?.hasDownload && (
                  <button
                    onClick={downloadReportAsExcel}
                    className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-semibold transition flex items-center gap-2"
                  >
                    <DocumentArrowDownIcon className="w-5 h-5" />
                    Download Excel
                  </button>
                )}
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-semibold transition"
                >
                  ✕ Close
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-auto p-6 bg-background">
              {/* Summary Cards */}
              {renderSummaryCards() && (
                <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  {renderSummaryCards()}
                </div>
              )}

              {/* Table Data */}
              <div className="bg-surface rounded-xl border border-border shadow-sm overflow-hidden">
                {renderTableData()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
