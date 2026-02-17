import { useEffect, useState } from 'react'
import { useAuthStore } from '../store/authStore'
import api from '../utils/api'
import toast from 'react-hot-toast'
import { Product } from '../utils/types'
import {
  PlusIcon,
  PencilIcon,
  MagnifyingGlassIcon,
  CubeIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'
import Modal from '../components/Modal'
import ProductForm from '../components/ProductForm'
import StoreSelector from '../components/StoreSelector'
import { StatCard, Card, CardHeader, CardBody, Button, Badge } from '../components/ui'

export default function Inventory() {
  const { user } = useAuthStore()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showLowStock, setShowLowStock] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedStoreId, setSelectedStoreId] = useState<number | 'all'>('all')

  useEffect(() => {
    loadProducts()
  }, [showLowStock, selectedStoreId])

  const loadProducts = async () => {
    try {
      const params: any = {}
      if (showLowStock) params.low_stock = true
      if (selectedStoreId !== 'all') params.store_id = selectedStoreId

      const response = await api.get('/inventory/products', { params })
      setProducts(response.data)
    } catch (error) {
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.category?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  )

  const lowStockCount = products.filter(p => p.current_stock <= p.minimum_stock).length
  const inStockCount = products.filter(p => p.current_stock > p.minimum_stock).length

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
          <h1 className="text-4xl font-bold text-text-primary mb-2">Inventory Management</h1>
          <p className="text-text-tertiary text-lg">
            Manage your product catalog and stock levels
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StoreSelector
            selectedStoreId={selectedStoreId}
            onStoreChange={setSelectedStoreId}
            showAllOption={true}
          />
          {(user?.role === 'super_admin' || user?.role === 'store_manager') && (
            <Button onClick={() => setShowAddModal(true)}>
              <PlusIcon className="w-5 h-5" />
              Add Product
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Products"
          value={products.length}
          icon={<CubeIcon className="w-6 h-6" />}
        />
        <StatCard
          title="Low Stock Items"
          value={lowStockCount}
          change={lowStockCount}
          trend={lowStockCount > 0 ? 'down' : undefined}
          changeLabel="need restocking"
          icon={<ExclamationTriangleIcon className="w-6 h-6" />}
        />
        <StatCard
          title="In Stock"
          value={inStockCount}
          icon={<CheckCircleIcon className="w-6 h-6" />}
        />
      </div>

      {/* Search & Filters */}
      <Card>
        <CardBody>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                placeholder="Search products by name, SKU, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-12"
              />
            </div>
            <label className="flex items-center gap-3 px-5 py-3 rounded-lg bg-surface border border-border cursor-pointer hover:bg-surface-hover transition-colors">
              <input
                type="checkbox"
                checked={showLowStock}
                onChange={(e) => setShowLowStock(e.target.checked)}
                className="w-4 h-4 rounded border-border bg-surface text-primary-600 focus:ring-2 focus:ring-primary-500/20"
              />
              <span className="font-medium text-text-secondary">Low Stock Only</span>
            </label>
            <Button variant="secondary" onClick={loadProducts}>
              <ArrowPathIcon className="w-5 h-5" />
              Refresh
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Products Table */}
      <Card>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td>
                    <span className="font-mono font-semibold text-primary-400">
                      {product.sku}
                    </span>
                  </td>
                  <td>
                    <div>
                      <div className="font-semibold text-text-primary">{product.name}</div>
                      {product.brand && (
                        <div className="text-sm text-text-tertiary">{product.brand}</div>
                      )}
                    </div>
                  </td>
                  <td>
                    <Badge variant="info">{product.category || 'Uncategorized'}</Badge>
                  </td>
                  <td>
                    <span className="font-bold text-lg text-success">
                      ₹{product.unit_price.toFixed(2)}
                    </span>
                  </td>
                  <td>
                    <div>
                      <div className="font-bold text-text-primary">{product.current_stock}</div>
                      <div className="text-xs text-text-tertiary">Min: {product.minimum_stock}</div>
                    </div>
                  </td>
                  <td>
                    {product.current_stock === 0 ? (
                      <Badge variant="danger">Out of Stock</Badge>
                    ) : product.current_stock <= product.minimum_stock ? (
                      <Badge variant="warning">Low Stock</Badge>
                    ) : (
                      <Badge variant="success">In Stock</Badge>
                    )}
                  </td>
                  <td className="text-right">
                    <button className="p-2 text-primary-400 hover:bg-primary-subtle rounded-lg transition-colors">
                      <PencilIcon className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-16">
            <CubeIcon className="w-16 h-16 mx-auto mb-4 text-text-muted opacity-50" />
            <h3 className="text-xl font-semibold text-text-primary mb-2">No Products Found</h3>
            <p className="text-text-tertiary mb-6">
              Try adjusting your search or add new products to your inventory
            </p>
            <Button onClick={() => setShowAddModal(true)}>
              <PlusIcon className="w-5 h-5" />
              Add Product
            </Button>
          </div>
        )}
      </Card>

      {/* Add Product Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Product"
      >
        <ProductForm
          onSuccess={() => {
            setShowAddModal(false)
            loadProducts()
          }}
          onCancel={() => setShowAddModal(false)}
        />
      </Modal>
    </div>
  )
}
