import { useEffect, useState } from 'react'
import api from '../utils/api'
import toast from 'react-hot-toast'
import { Customer } from '../utils/types'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PhoneIcon,
  EnvelopeIcon,
  UsersIcon,
  UserPlusIcon,
  CurrencyDollarIcon,
  ArrowPathIcon,
  EyeIcon
} from '@heroicons/react/24/outline'
import Modal from '../components/Modal'
import CustomerForm from '../components/CustomerForm'
import StoreSelector from '../components/StoreSelector'
import { PageHeader, StatCard, PremiumCard, Badge, Button, Input, Loading, EmptyState } from '../components/PremiumUI'

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedStoreId, setSelectedStoreId] = useState<number | 'all'>('all')

  useEffect(() => {
    loadCustomers()
  }, [selectedStoreId])

  const loadCustomers = async () => {
    try {
      const params: any = {}
      if (selectedStoreId !== 'all') params.store_id = selectedStoreId

      const response = await api.get('/customers/', { params })
      setCustomers(response.data)
    } catch (error) {
      toast.error('Failed to load customers')
    } finally {
      setLoading(false)
    }
  }

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm) ||
      (customer.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  )

  const totalPurchases = customers.reduce((sum, c) => sum + c.total_purchases, 0)
  const avgPurchase = customers.length > 0 ? totalPurchases / customers.length : 0

  if (loading) {
    return <Loading message="Loading customers..." />
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <PageHeader
        title="Customer Management"
        subtitle="Manage customer information and purchase history"
        icon={UsersIcon}
        actions={
          <div className="flex items-center gap-3">
            <StoreSelector
              selectedStoreId={selectedStoreId}
              onStoreChange={setSelectedStoreId}
              showAllOption={true}
            />
            <Button onClick={() => setShowAddModal(true)} icon={UserPlusIcon}>
              Add Customer
            </Button>
          </div>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Customers"
          value={customers.length}
          subtitle="Registered users"
          icon={UsersIcon}
          color="violet"
          delay={100}
        />
        <StatCard
          title="Total Purchases"
          value={`₹${totalPurchases.toLocaleString()}`}
          subtitle="Lifetime value"
          icon={CurrencyDollarIcon}
          color="emerald"
          delay={200}
        />
        <StatCard
          title="Avg. Purchase"
          value={`₹${avgPurchase.toLocaleString()}`}
          subtitle="Per customer"
          icon={UserPlusIcon}
          color="blue"
          delay={300}
        />
      </div>

      {/* Search */}
      <PremiumCard delay={400}>
        <div className="flex gap-4">
          <Input
            placeholder="Search customers by name, phone, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={MagnifyingGlassIcon}
            className="flex-1"
          />
          <Button variant="ghost" onClick={loadCustomers} icon={ArrowPathIcon}>
            Refresh
          </Button>
        </div>
      </PremiumCard>

      {/* Customers Grid */}
      {filteredCustomers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCustomers.map((customer, index) => (
            <div
              key={customer.id}
              className="opacity-0 animate-fade-in-up"
              style={{ animationDelay: `${500 + index * 100}ms`, animationFillMode: 'forwards' }}
            >
              <PremiumCard hover className="h-full">
                <div className="p-6">
                  {/* Customer Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center text-lg font-bold text-white shadow-lg shadow-violet-500/30">
                        {customer.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-text-primary">{customer.name}</h3>
                        <p className="text-sm text-text-muted">ID: #{customer.id}</p>
                      </div>
                    </div>
                  </div>

                  {/* Customer Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-text-secondary">
                      <PhoneIcon className="w-4 h-4 mr-2 text-text-muted" />
                      {customer.phone}
                    </div>
                    {customer.email && (
                      <div className="flex items-center text-sm text-text-secondary">
                        <EnvelopeIcon className="w-4 h-4 mr-2 text-text-muted" />
                        {customer.email}
                      </div>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="pt-4 border-t border-border">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs text-text-muted">Total Purchases</p>
                        <p className="text-xl font-bold text-success">
                          ₹{customer.total_purchases.toLocaleString()}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" icon={EyeIcon}>
                        View
                      </Button>
                    </div>
                  </div>
                </div>
              </PremiumCard>
            </div>
          ))}
        </div>
      ) : (
        <PremiumCard delay={500}>
          <EmptyState
            icon={UsersIcon}
            title="No Customers Found"
            message="Add your first customer to get started."
            action={
              <Button onClick={() => setShowAddModal(true)} icon={UserPlusIcon}>
                Add Customer
              </Button>
            }
          />
        </PremiumCard>
      )}

      {/* Add Customer Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Customer"
      >
        <CustomerForm
          onSuccess={() => {
            setShowAddModal(false)
            loadCustomers()
          }}
          onCancel={() => setShowAddModal(false)}
        />
      </Modal>
    </div>
  )
}
