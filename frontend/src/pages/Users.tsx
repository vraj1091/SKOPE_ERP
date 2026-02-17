import { useEffect, useState } from 'react'
import { useAuthStore, User } from '../store/authStore'
import api from '../utils/api'
import toast from 'react-hot-toast'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  UserGroupIcon,
  UserPlusIcon,
  ShieldCheckIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'
import Modal from '../components/Modal'
import UserForm from '../components/UserForm'
import StoreSelector from '../components/StoreSelector'
import { PageHeader, StatCard, PremiumCard, Badge, Button, Input, Loading, EmptyState } from '../components/PremiumUI'

const getRoleBadgeColor = (role: string) => {
  switch (role) {
    case 'super_admin': return 'amber'
    case 'store_manager': return 'blue'
    case 'sales_staff': return 'emerald'
    case 'marketing': return 'rose'
    case 'accounts': return 'violet'
    default: return 'cyan'
  }
}

export default function Users() {
  const { user: currentUser } = useAuthStore()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedStoreId, setSelectedStoreId] = useState<number | 'all'>(currentUser?.role === 'super_admin' ? 'all' : (currentUser?.store_id || 'all'))

  useEffect(() => {
    loadUsers()
  }, [selectedStoreId])

  const loadUsers = async () => {
    try {
      const params: any = {}
      if (selectedStoreId !== 'all') {
        params.store_id = selectedStoreId
      }
      const response = await api.get('/users/', { params })
      setUsers(response.data)
    } catch (error) {
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  )

  // Check if current user has access
  if (currentUser?.role !== 'super_admin' && currentUser?.role !== 'store_manager') {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <PremiumCard className="text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center mx-auto mb-4">
            <ShieldCheckIcon className="w-8 h-8 text-rose-400" />
          </div>
          <h2 className="text-2xl font-bold text-rose-400 mb-2">Access Denied</h2>
          <p className="text-gray-400">You don't have permission to view this page.</p>
        </PremiumCard>
      </div>
    )
  }

  if (loading) {
    return <Loading message="Loading users..." />
  }

  const activeUsers = users.filter(u => u.is_active).length
  const adminCount = users.filter(u => u.role === 'super_admin' || u.role === 'store_manager').length

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <PageHeader
        title="User Management"
        subtitle="Manage user accounts and permissions"
        icon={UserGroupIcon}
        actions={
          <div className="flex items-center gap-3">
            <StoreSelector
              selectedStoreId={selectedStoreId}
              onStoreChange={setSelectedStoreId}
              showAllOption={true}
            />
            {currentUser?.role === 'super_admin' && (
              <Button onClick={() => setShowAddModal(true)} icon={UserPlusIcon}>
                Add User
              </Button>
            )}
          </div>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Users"
          value={users.length}
          subtitle="Registered accounts"
          icon={UserGroupIcon}
          color="violet"
          delay={100}
        />
        <StatCard
          title="Active Users"
          value={activeUsers}
          subtitle="Currently active"
          icon={ShieldCheckIcon}
          color="emerald"
          delay={200}
        />
        <StatCard
          title="Administrators"
          value={adminCount}
          subtitle="Admin accounts"
          icon={UserPlusIcon}
          color="amber"
          delay={300}
        />
      </div>

      {/* Search */}
      <PremiumCard delay={400}>
        <div className="flex gap-4">
          <Input
            placeholder="Search users by name, email, or username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={MagnifyingGlassIcon}
            className="flex-1"
          />
          <Button variant="ghost" onClick={loadUsers} icon={ArrowPathIcon}>
            Refresh
          </Button>
        </div>
      </PremiumCard>

      {/* Users Table */}
      {filteredUsers.length > 0 ? (
        <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: '500ms', animationFillMode: 'forwards' }}>
          <PremiumCard>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-6 py-4 text-left text-xs font-bold text-text-muted uppercase tracking-wider">User</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-text-muted uppercase tracking-wider">Username</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-text-muted uppercase tracking-wider">Email</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-text-muted uppercase tracking-wider">Role</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-text-muted uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-border hover:bg-primary-subtle transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white flex items-center justify-center font-bold shadow-lg shadow-violet-500/30">
                            {(user.full_name || user.username).charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-text-primary">
                              {user.full_name || user.username}
                            </div>
                            <div className="text-sm text-text-muted">
                              ID: {user.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary font-mono">
                        {user.username}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge color={getRoleBadgeColor(user.role) as any}>
                          {user.role.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.is_active ? (
                          <Badge color="emerald">Active</Badge>
                        ) : (
                          <Badge color="rose">Inactive</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </PremiumCard>
        </div>
      ) : (
        <PremiumCard delay={500}>
          <EmptyState
            icon={UserGroupIcon}
            title="No Users Found"
            message="Add your first user to get started."
            action={
              currentUser?.role === 'super_admin' && (
                <Button onClick={() => setShowAddModal(true)} icon={UserPlusIcon}>
                  Add User
                </Button>
              )
            }
          />
        </PremiumCard>
      )}

      {/* Add User Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New User"
      >
        <UserForm
          onSuccess={() => {
            setShowAddModal(false)
            loadUsers()
          }}
          onCancel={() => setShowAddModal(false)}
        />
      </Modal>
    </div>
  )
}
