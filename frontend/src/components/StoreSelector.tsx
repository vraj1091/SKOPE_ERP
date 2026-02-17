import { useEffect, useState } from 'react'
import { useAuthStore } from '../store/authStore'
import api from '../utils/api'
import { BuildingStorefrontIcon } from '@heroicons/react/24/outline'

interface Store {
  id: number
  name: string
}

interface StoreSelectorProps {
  selectedStoreId: number | 'all'
  onStoreChange: (storeId: number | 'all') => void
  showAllOption?: boolean
  label?: string
  className?: string
}

export default function StoreSelector({
  selectedStoreId,
  onStoreChange,
  showAllOption = true,
  label = 'Store:',
  className = ''
}: StoreSelectorProps) {
  const { user } = useAuthStore()
  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.role === 'super_admin') {
      loadStores()
    } else {
      setLoading(false)
    }
  }, [user])

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

  // Don't show selector if not super admin
  if (user?.role !== 'super_admin') {
    return null
  }

  if (loading) {
    return <div className="text-sm text-gray-500">Loading stores...</div>
  }

  if (stores.length === 0) {
    return null
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <BuildingStorefrontIcon className="w-5 h-5 text-violet-400" />
      {label && <label className="text-sm font-medium text-gray-400 hidden md:block">{label}</label>}
      <select
        value={selectedStoreId}
        onChange={(e) => onStoreChange(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
        className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all min-w-[180px]"
      >
        {showAllOption && <option value="all" className="bg-[#0a0a10]">📊 All Stores</option>}
        {stores.map((store) => (
          <option key={store.id} value={store.id} className="bg-[#0a0a10]">
            🏪 {store.name}
          </option>
        ))}
      </select>
    </div>
  )
}
