import { useState, useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import api from '../utils/api'
import Modal from '../components/Modal'
import {
  BuildingStorefrontIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  UsersIcon,
  CubeIcon,
  BanknotesIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline'
import { PageHeader, StatCard, Button, PremiumCard, Badge, Loading, EmptyState, Input } from '../components/PremiumUI'

interface Store {
  id: number
  name: string
  address?: string
  phone?: string
  email?: string
  gst_number?: string
  is_active: boolean
  created_at: string
}

interface StoreStats {
  store_id: number
  store_name: string
  total_products: number
  total_sales: number
  total_customers: number
  total_users: number
}

export default function Stores() {
  const { user } = useAuthStore()
  const [stores, setStores] = useState<Store[]>([])
  const [storeStats, setStoreStats] = useState<StoreStats[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingStore, setEditingStore] = useState<Store | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    gst_number: ''
  })

  useEffect(() => {
    loadStores()
    loadStoreStats()
  }, [])

  const loadStores = async () => {
    try {
      const response = await api.get('/stores/')
      setStores(response.data)
    } catch (error) {
      console.error('Error loading stores:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadStoreStats = async () => {
    try {
      const response = await api.get('/stores/stats')
      setStoreStats(response.data)
    } catch (error) {
      console.error('Error loading store stats:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingStore) {
        await api.put(`/stores/${editingStore.id}`, formData)
      } else {
        await api.post('/stores/', formData)
      }
      setShowModal(false)
      resetForm()
      loadStores()
      loadStoreStats()
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Error saving store')
    }
  }

  const handleEdit = (store: Store) => {
    setEditingStore(store)
    setFormData({
      name: store.name,
      address: store.address || '',
      phone: store.phone || '',
      email: store.email || '',
      gst_number: store.gst_number || ''
    })
    setShowModal(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to deactivate this store?')) return

    try {
      await api.delete(`/stores/${id}`)
      loadStores()
      loadStoreStats()
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Error deleting store')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      phone: '',
      email: '',
      gst_number: ''
    })
    setEditingStore(null)
  }

  const getStoreStats = (storeId: number) => {
    return storeStats.find(s => s.store_id === storeId)
  }

  if (loading) {
    return <Loading message="Loading stores..." />
  }

  // Only Super Admin can access
  if (user?.role !== 'super_admin') {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <PremiumCard className="text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center mx-auto mb-4">
            <BuildingStorefrontIcon className="w-8 h-8 text-rose-400" />
          </div>
          <h2 className="text-2xl font-bold text-rose-400 mb-2">Access Denied</h2>
          <p className="text-gray-400">Only Super Admin can manage stores.</p>
        </PremiumCard>
      </div>
    )
  }

  const totalRevenue = storeStats.reduce((sum, s) => sum + s.total_sales, 0)
  const totalProducts = storeStats.reduce((sum, s) => sum + s.total_products, 0)
  const totalUsers = storeStats.reduce((sum, s) => sum + s.total_users, 0)

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <PageHeader
        title="Store Management"
        subtitle="Manage multiple stores and view analytics"
        icon={BuildingStorefrontIcon}
        actions={
          <Button onClick={() => { resetForm(); setShowModal(true) }} icon={PlusIcon}>
            Add New Store
          </Button>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Stores"
          value={stores.length}
          subtitle="Active locations"
          icon={BuildingStorefrontIcon}
          color="violet"
          delay={100}
        />
        <StatCard
          title="Total Revenue"
          value={`₹${totalRevenue.toLocaleString()}`}
          subtitle="Across all stores"
          icon={BanknotesIcon}
          color="emerald"
          delay={200}
        />
        <StatCard
          title="Total Products"
          value={totalProducts}
          subtitle="In inventory"
          icon={CubeIcon}
          color="blue"
          delay={300}
        />
        <StatCard
          title="Total Users"
          value={totalUsers}
          subtitle="Active employees"
          icon={UserGroupIcon}
          color="amber"
          delay={400}
        />
      </div>

      {/* Stores Grid */}
      {stores.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores.map((store, index) => {
            const stats = getStoreStats(store.id)
            return (
              <div
                key={store.id}
                className="opacity-0 animate-fade-in-up"
                style={{ animationDelay: `${500 + index * 100}ms`, animationFillMode: 'forwards' }}
              >
                <PremiumCard hover className="h-full">
                  <div className="p-6">
                    {/* Store Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/30">
                          <BuildingStorefrontIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-text-primary">{store.name}</h3>
                          <Badge color={store.is_active ? 'emerald' : 'rose'}>
                            {store.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEdit(store)}
                          className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(store.id)}
                          className="p-2 text-rose-400 hover:bg-rose-500/20 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Store Details */}
                    <div className="space-y-2 mb-4 text-sm">
                      {store.address && (
                        <div className="flex items-start gap-2 text-text-secondary">
                          <MapPinIcon className="w-4 h-4 mt-0.5 flex-shrink-0 text-text-muted" />
                          <span>{store.address}</span>
                        </div>
                      )}
                      {store.phone && (
                        <div className="flex items-center gap-2 text-text-secondary">
                          <PhoneIcon className="w-4 h-4 text-text-muted" />
                          <span>{store.phone}</span>
                        </div>
                      )}
                      {store.email && (
                        <div className="flex items-center gap-2 text-text-secondary">
                          <EnvelopeIcon className="w-4 h-4 text-text-muted" />
                          <span>{store.email}</span>
                        </div>
                      )}
                      {store.gst_number && (
                        <div className="text-text-secondary">
                          <span className="font-medium text-text-muted">GST:</span> {store.gst_number}
                        </div>
                      )}
                    </div>

                    {/* Store Stats */}
                    {stats && (
                      <div className="pt-4 border-t border-border">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-text-muted">Products</p>
                            <p className="text-lg font-bold text-text-primary">{stats.total_products}</p>
                          </div>
                          <div>
                            <p className="text-xs text-text-muted">Revenue</p>
                            <p className="text-lg font-bold text-success">₹{stats.total_sales.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-text-muted">Customers</p>
                            <p className="text-lg font-bold text-text-primary">{stats.total_customers}</p>
                          </div>
                          <div>
                            <p className="text-xs text-text-muted">Users</p>
                            <p className="text-lg font-bold text-text-primary">{stats.total_users}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </PremiumCard>
              </div>
            )
          })}
        </div>
      ) : (
        <PremiumCard delay={500}>
          <EmptyState
            icon={BuildingStorefrontIcon}
            title="No Stores Yet"
            message="Get started by adding your first store"
            action={
              <Button onClick={() => setShowModal(true)} icon={PlusIcon}>
                Add Store
              </Button>
            }
          />
        </PremiumCard>
      )}

      {/* Add/Edit Store Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          resetForm()
        }}
        title={editingStore ? 'Edit Store' : 'Add New Store'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Store Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Address</label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">GST Number</label>
            <input
              type="text"
              value={formData.gst_number}
              onChange={(e) => setFormData({ ...formData, gst_number: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all"
              placeholder="e.g., 22AAAAA0000A1Z5"
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button
              variant="secondary"
              onClick={() => {
                setShowModal(false)
                resetForm()
              }}
            >
              Cancel
            </Button>
            <Button type="submit">
              {editingStore ? 'Update Store' : 'Create Store'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
