import { useEffect, useState } from 'react'
import api from '../utils/api'
import toast from 'react-hot-toast'
import { Sale } from '../utils/types'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  ShoppingCartIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ArrowPathIcon,
  ReceiptPercentIcon
} from '@heroicons/react/24/outline'
import { format } from 'date-fns'
import StoreSelector from '../components/StoreSelector'
import Modal from '../components/Modal'
import SaleForm from '../components/SaleForm'
import { StatCard, Card, CardHeader, CardBody, Button, Input, Badge } from '../components/ui'

export default function Sales() {
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [selectedStoreId, setSelectedStoreId] = useState<number | 'all'>('all')
  const [showSaleModal, setShowSaleModal] = useState(false)

  useEffect(() => {
    loadSales()
  }, [selectedStoreId])

  const loadSales = async () => {
    try {
      setError(null)
      const params: any = {}
      if (selectedStoreId !== 'all') params.store_id = selectedStoreId

      const response = await api.get('/sales/', { params })
      setSales(response.data)
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to load sales'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const filteredSales = sales.filter(
    (sale) => sale.invoice_number.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Calculate stats
  const todaySales = sales.filter(sale => {
    const saleDate = new Date(sale.sale_date)
    const today = new Date()
    return saleDate.toDateString() === today.toDateString()
  })

  const totalAmount = sales.reduce((sum, sale) => sum + sale.total_amount, 0)
  const todayAmount = todaySales.reduce((sum, sale) => sum + sale.total_amount, 0)

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
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
          <h1 className="text-4xl font-bold text-text-primary mb-2">Sales & POS</h1>
          <p className="text-text-tertiary text-lg">
            Manage sales transactions and point of sale
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StoreSelector
            selectedStoreId={selectedStoreId}
            onStoreChange={setSelectedStoreId}
            showAllOption={true}
          />
          <Button onClick={() => setShowSaleModal(true)}>
            <PlusIcon className="w-5 h-5" />
            New Sale
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Transactions"
          value={sales.length}
          icon={<ReceiptPercentIcon className="w-6 h-6" />}
        />
        <StatCard
          title="Total Revenue"
          value={`₹${totalAmount.toLocaleString()}`}
          change={12.5}
          trend="up"
          changeLabel="vs last month"
          icon={<CurrencyDollarIcon className="w-6 h-6" />}
        />
        <StatCard
          title="Today's Sales"
          value={`₹${todayAmount.toLocaleString()}`}
          change={todaySales.length}
          changeLabel={`${todaySales.length} transactions`}
          icon={<ClockIcon className="w-6 h-6" />}
        />
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-danger/20 bg-danger-bg">
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-danger mb-1">Error Loading Sales</h4>
                <p className="text-sm text-text-tertiary">{error}</p>
              </div>
              <Button variant="secondary" onClick={loadSales} size="sm">
                <ArrowPathIcon className="w-4 h-4" />
                Retry
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Search */}
      <Card>
        <CardBody>
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                placeholder="Search by invoice number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-12"
              />
            </div>
            <Button variant="secondary" onClick={loadSales}>
              <ArrowPathIcon className="w-5 h-5" />
              Refresh
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Sales Table */}
      <Card>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Amount</th>
                <th>Payment</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.map((sale) => (
                <tr key={sale.id}>
                  <td>
                    <span className="font-mono font-semibold text-primary-400">
                      {sale.invoice_number}
                    </span>
                  </td>
                  <td className="text-text-tertiary">
                    {format(new Date(sale.sale_date), 'MMM dd, yyyy HH:mm')}
                  </td>
                  <td className="font-medium">
                    {sale.customer_id ? 'Customer' : 'Walk-in'}
                  </td>
                  <td className="text-text-tertiary">
                    {sale.items?.length || 0} items
                  </td>
                  <td>
                    <span className="font-bold text-lg text-success">
                      ₹{sale.total_amount.toFixed(2)}
                    </span>
                  </td>
                  <td>
                    <Badge variant="info">{sale.payment_mode.toUpperCase()}</Badge>
                  </td>
                  <td>
                    <Badge variant="success">{sale.payment_status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredSales.length === 0 && !error && (
          <div className="text-center py-16">
            <ShoppingCartIcon className="w-16 h-16 mx-auto mb-4 text-text-muted opacity-50" />
            <h3 className="text-xl font-semibold text-text-primary mb-2">No Sales Found</h3>
            <p className="text-text-tertiary mb-6">Start recording sales to see them here</p>
            <Button onClick={() => setShowSaleModal(true)}>
              <PlusIcon className="w-5 h-5" />
              Create Sale
            </Button>
          </div>
        )}
      </Card>

      {/* New Sale Modal */}
      <Modal
        isOpen={showSaleModal}
        onClose={() => setShowSaleModal(false)}
        title="Create New Sale"
      >
        <SaleForm
          onSuccess={() => {
            setShowSaleModal(false)
            loadSales()
          }}
          onCancel={() => setShowSaleModal(false)}
        />
      </Modal>
    </div>
  )
}
