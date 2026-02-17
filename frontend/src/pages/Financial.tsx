import { useEffect, useState } from 'react'
import api from '../utils/api'
import toast from 'react-hot-toast'
import { Expense } from '../utils/types'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  BanknotesIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ReceiptPercentIcon,
  ArrowPathIcon,
  WalletIcon
} from '@heroicons/react/24/outline'
import { format } from 'date-fns'
import Modal from '../components/Modal'
import ExpenseForm from '../components/ExpenseForm'
import StoreSelector from '../components/StoreSelector'
import { PageHeader, StatCard, PremiumCard, Badge, Button, Input, Loading, EmptyState } from '../components/PremiumUI'

export default function Financial() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [stats, setStats] = useState<any>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedStoreId, setSelectedStoreId] = useState<number | 'all'>('all')

  useEffect(() => {
    loadData()
  }, [selectedStoreId])

  const loadData = async () => {
    try {
      const params: any = {}
      if (selectedStoreId !== 'all') params.store_id = selectedStoreId

      const [expensesRes, statsRes] = await Promise.all([
        api.get('/financial/expenses', { params }),
        api.get('/financial/dashboard/stats', { params }),
      ])
      setExpenses(expensesRes.data)
      setStats(statsRes.data)
    } catch (error) {
      toast.error('Failed to load financial data')
    } finally {
      setLoading(false)
    }
  }

  const filteredExpenses = expenses.filter(
    (expense) =>
      expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return <Loading message="Loading financial data..." />
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <PageHeader
        title="Financial Management"
        subtitle="Track expenses, revenue, and profitability"
        icon={BanknotesIcon}
        actions={
          <div className="flex items-center gap-3">
            <StoreSelector
              selectedStoreId={selectedStoreId}
              onStoreChange={setSelectedStoreId}
              showAllOption={true}
            />
            <Button onClick={() => setShowAddModal(true)} icon={PlusIcon}>
              Add Expense
            </Button>
          </div>
        }
      />

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Monthly Revenue"
          value={`₹${(stats?.month_revenue || 0).toLocaleString()}`}
          subtitle="This month's earnings"
          icon={ArrowTrendingUpIcon}
          color="emerald"
          trend="up"
          trendValue="+15.3%"
          delay={100}
        />
        <StatCard
          title="Monthly Expenses"
          value={`₹${(stats?.month_expenses || 0).toLocaleString()}`}
          subtitle="This month's spending"
          icon={ArrowTrendingDownIcon}
          color="rose"
          delay={200}
        />
        <StatCard
          title="Monthly Profit"
          value={`₹${(stats?.month_profit || 0).toLocaleString()}`}
          subtitle="Net profit"
          icon={WalletIcon}
          color="violet"
          trend={stats?.month_profit > 0 ? 'up' : 'down'}
          trendValue={stats?.month_profit > 0 ? 'Profitable' : 'Loss'}
          delay={300}
        />
      </div>

      {/* Today's Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <PremiumCard delay={400}>
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-2">Today's Revenue</p>
            <p className="text-3xl font-bold text-emerald-400">₹{(stats?.today_revenue || 0).toLocaleString()}</p>
          </div>
        </PremiumCard>
        <PremiumCard delay={500}>
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-2">Today's Expenses</p>
            <p className="text-3xl font-bold text-rose-400">₹{(stats?.today_expenses || 0).toLocaleString()}</p>
          </div>
        </PremiumCard>
        <PremiumCard delay={600}>
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-2">Today's Profit</p>
            <p className="text-3xl font-bold text-violet-400">₹{(stats?.today_profit || 0).toLocaleString()}</p>
          </div>
        </PremiumCard>
      </div>

      {/* Search */}
      <PremiumCard delay={700}>
        <div className="flex gap-4">
          <Input
            placeholder="Search expenses by description or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={MagnifyingGlassIcon}
            className="flex-1"
          />
          <Button variant="ghost" onClick={loadData} icon={ArrowPathIcon}>
            Refresh
          </Button>
        </div>
      </PremiumCard>

      {/* Expenses Table */}
      <div className="relative premium-card rounded-2xl overflow-hidden opacity-0 animate-slide-up" style={{ animationDelay: '800ms', animationFillMode: 'forwards' }}>
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ReceiptPercentIcon className="w-6 h-6 text-violet-400" />
            Recent Expenses
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Description</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Vendor</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Payment</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.map((expense) => (
                <tr key={expense.id} className="border-b border-white/5 hover:bg-violet-500/5 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {format(new Date(expense.expense_date), 'MMM dd, yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge color="violet">{expense.category.replace('_', ' ')}</Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-white">
                    {expense.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {expense.vendor_name || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-bold text-lg text-rose-400">₹{expense.amount.toFixed(2)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge color="cyan">{expense.payment_mode.toUpperCase()}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredExpenses.length === 0 && (
          <EmptyState
            icon={ReceiptPercentIcon}
            title="No Expenses Found"
            message="Start tracking your expenses to see them here."
            action={
              <Button onClick={() => setShowAddModal(true)} icon={PlusIcon}>
                Add Expense
              </Button>
            }
          />
        )}
      </div>

      {/* Add Expense Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Record New Expense"
      >
        <ExpenseForm
          onSuccess={() => {
            setShowAddModal(false)
            loadData()
          }}
          onCancel={() => setShowAddModal(false)}
        />
      </Modal>
    </div>
  )
}
