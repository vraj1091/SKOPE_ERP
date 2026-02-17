import { useState } from 'react'
import {
  CogIcon,
  UserCircleIcon,
  BuildingStorefrontIcon,
  BellIcon,
  ShieldCheckIcon,
  PaintBrushIcon,
  GlobeAltIcon,
  KeyIcon,
  DocumentTextIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline'
import { PageHeader, PremiumCard, Button, Input, Badge } from '../components/PremiumUI'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'
import Modal from '../components/Modal'

type SettingsTab = 'profile' | 'store' | 'notifications' | 'security' | 'appearance' | 'integrations' | 'billing'

export default function Settings() {
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile')
  const [loading, setLoading] = useState(false)
  const [showIntegrationModal, setShowIntegrationModal] = useState(false)
  const [selectedIntegration, setSelectedIntegration] = useState<any>(null)

  const tabs = [
    { id: 'profile', name: 'Profile', icon: UserCircleIcon },
    { id: 'store', name: 'Store Settings', icon: BuildingStorefrontIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
    { id: 'appearance', name: 'Appearance', icon: PaintBrushIcon },
    { id: 'integrations', name: 'Integrations', icon: GlobeAltIcon },
    { id: 'billing', name: 'Billing', icon: CreditCardIcon }
  ]

  const integrations = [
    { name: 'Google Analytics', status: 'Connected', icon: '📊' },
    { name: 'WhatsApp Business', status: 'Not Connected', icon: '💬' },
    { name: 'Payment Gateway', status: 'Connected', icon: '💳' },
    { name: 'Email Service', status: 'Connected', icon: '📧' }
  ]

  const handleSave = () => {
    setLoading(true)
    setTimeout(() => {
      toast.success('Settings saved successfully!')
      setLoading(false)
      if (showIntegrationModal) setShowIntegrationModal(false)
    }, 1000)
  }

  const handleIntegrationClick = (integration: any) => {
    setSelectedIntegration(integration)
    setShowIntegrationModal(true)
  }

  const handleAction = (action: string) => {
    toast.success(`${action} action initiated successfully!`)
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Settings"
        subtitle="Manage your account and application preferences"
        icon={CogIcon}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <PremiumCard>
            <div className="p-4 space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as SettingsTab)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === tab.id
                      ? 'bg-primary-subtle text-primary-400 font-semibold'
                      : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                      }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.name}</span>
                  </button>
                )
              })}
            </div>
          </PremiumCard>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {activeTab === 'profile' && (
            <PremiumCard>
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-text-primary mb-4">Profile Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-text-tertiary mb-2">Full Name</label>
                      <Input defaultValue={user?.full_name || user?.username} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-tertiary mb-2">Email</label>
                      <Input type="email" defaultValue={user?.email} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-tertiary mb-2">Username</label>
                      <Input defaultValue={user?.username} disabled />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-tertiary mb-2">Role</label>
                      <Badge color="violet">{user?.role?.replace('_', ' ')}</Badge>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <Button onClick={handleSave} disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            </PremiumCard>
          )}

          {activeTab === 'store' && (
            <PremiumCard>
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-text-primary mb-4">Store Configuration</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-text-tertiary mb-2">Store Name</label>
                      <Input placeholder="My Store" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-tertiary mb-2">Currency</label>
                      <select className="input w-full">
                        <option>INR (₹)</option>
                        <option>USD ($)</option>
                        <option>EUR (€)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-tertiary mb-2">Timezone</label>
                      <select className="input w-full">
                        <option>Asia/Kolkata (IST)</option>
                        <option>America/New_York (EST)</option>
                        <option>Europe/London (GMT)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-tertiary mb-2">Tax Rate (%)</label>
                      <Input type="number" placeholder="18" />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <Button onClick={handleSave} disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            </PremiumCard>
          )}

          {activeTab === 'notifications' && (
            <PremiumCard>
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-text-primary mb-4">Notification Preferences</h3>
                  <div className="space-y-4">
                    {[
                      { label: 'Email Notifications', description: 'Receive email updates about your account' },
                      { label: 'Sales Alerts', description: 'Get notified when a sale is made' },
                      { label: 'Low Stock Alerts', description: 'Alert when inventory is running low' },
                      { label: 'Marketing Updates', description: 'Campaign performance and insights' },
                      { label: 'System Updates', description: 'Important system announcements' }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-surface-hover">
                        <div>
                          <div className="font-semibold text-text-primary">{item.label}</div>
                          <div className="text-sm text-text-tertiary">{item.description}</div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-surface-active peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <Button onClick={handleSave} disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            </PremiumCard>
          )}

          {activeTab === 'security' && (
            <PremiumCard>
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-text-primary mb-4">Security Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-text-tertiary mb-2">Current Password</label>
                      <Input type="password" placeholder="••••••••" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-tertiary mb-2">New Password</label>
                      <Input type="password" placeholder="••••••••" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-tertiary mb-2">Confirm New Password</label>
                      <Input type="password" placeholder="••••••••" />
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-primary-subtle border border-primary-500/30">
                  <div className="flex items-start gap-3">
                    <KeyIcon className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-text-primary mb-1">Two-Factor Authentication</div>
                      <div className="text-sm text-text-tertiary mb-3">Add an extra layer of security to your account</div>
                      <Button variant="secondary" size="sm" onClick={() => handleAction('2FA Setup')}>Enable 2FA</Button>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <Button onClick={handleSave} disabled={loading}>
                    {loading ? 'Saving...' : 'Update Password'}
                  </Button>
                </div>
              </div>
            </PremiumCard>
          )}

          {activeTab === 'appearance' && (
            <PremiumCard>
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-text-primary mb-4">Appearance Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-text-tertiary mb-2">Theme</label>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-lg border-2 border-primary-500 bg-surface-hover cursor-pointer" onClick={() => toast.success('Theme set to Dark')}>
                          <div className="font-semibold text-text-primary mb-1">Dark</div>
                          <div className="text-sm text-text-tertiary">Current theme</div>
                        </div>
                        <div className="p-4 rounded-lg border border-border bg-surface-hover cursor-pointer opacity-50" onClick={() => toast.error('Light theme coming soon!')}>
                          <div className="font-semibold text-text-primary mb-1">Light</div>
                          <div className="text-sm text-text-tertiary">Coming soon</div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-tertiary mb-2">Accent Color</label>
                      <div className="grid grid-cols-6 gap-3">
                        {['violet', 'blue', 'emerald', 'rose', 'amber', 'cyan'].map((color) => (
                          <button
                            key={color}
                            onClick={() => toast.success(`Theme accent set to ${color}`)}
                            className={`w-12 h-12 rounded-lg bg-${color}-500 hover:scale-110 transition-transform ${color === 'violet' ? 'ring-2 ring-white ring-offset-2 ring-offset-background' : ''}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <Button onClick={handleSave} disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            </PremiumCard>
          )}

          {activeTab === 'integrations' && (
            <PremiumCard>
              <div className="p-6">
                <h3 className="text-xl font-bold text-text-primary mb-4">Connected Integrations</h3>
                <div className="space-y-4">
                  {integrations.map((integration, index) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-surface-hover">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">{integration.icon}</div>
                        <div>
                          <div className="font-semibold text-text-primary">{integration.name}</div>
                          <Badge color={integration.status === 'Connected' ? 'emerald' : 'rose'}>
                            {integration.status}
                          </Badge>
                        </div>
                      </div>
                      <Button variant="secondary" size="sm" onClick={() => handleIntegrationClick(integration)}>
                        {integration.status === 'Connected' ? 'Configure' : 'Connect'}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </PremiumCard>
          )}

          {activeTab === 'billing' && (
            <PremiumCard>
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-text-primary mb-4">Billing & Subscription</h3>
                  <div className="p-6 rounded-lg bg-gradient-to-br from-primary-600 to-primary-700 text-white mb-6">
                    <div className="text-sm font-semibold mb-2">Current Plan</div>
                    <div className="text-3xl font-bold mb-1">Professional</div>
                    <div className="text-sm opacity-90">₹2,999/month • Renews on March 3, 2026</div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-surface-hover">
                      <div>
                        <div className="font-semibold text-text-primary">Payment Method</div>
                        <div className="text-sm text-text-tertiary">•••• •••• •••• 4242</div>
                      </div>
                      <Button variant="secondary" size="sm" onClick={() => handleAction('Update Payment Method')}>Update</Button>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg bg-surface-hover">
                      <div>
                        <div className="font-semibold text-text-primary">Billing History</div>
                        <div className="text-sm text-text-tertiary">View past invoices</div>
                      </div>
                      <Button variant="secondary" size="sm" onClick={() => handleAction('View Billing History')}>
                        <DocumentTextIcon className="w-4 h-4" />
                        <span>View</span>
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <Button variant="danger" onClick={() => {
                    if (confirm('Are you sure you want to cancel?')) handleAction('Subscription Cancellation')
                  }}>Cancel Subscription</Button>
                </div>
              </div>
            </PremiumCard>
          )}
        </div>
      </div>

      <Modal
        isOpen={showIntegrationModal}
        onClose={() => setShowIntegrationModal(false)}
        title={selectedIntegration?.status === 'Connected' ? `Configure ${selectedIntegration?.name}` : `Connect ${selectedIntegration?.name}`}
      >
        <div className="space-y-6">
          {selectedIntegration?.name === 'Google Analytics' && (
            <>
              <p className="text-text-tertiary">Connect your Google Analytics account to track website traffic and user behavior.</p>
              <div>
                <label className="block text-sm font-medium text-text-tertiary mb-2">Tracking ID</label>
                <Input placeholder="UA-XXXXXXXXX-X" defaultValue="UA-123456789-1" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded border-gray-600 bg-transparent text-primary-500 focus:ring-primary-500" />
                <span className="text-sm text-text-tertiary">Enable Enhanced Ecommerce</span>
              </div>
            </>
          )}

          {selectedIntegration?.name === 'WhatsApp Business' && (
            <>
              <p className="text-text-tertiary">Send automated order updates and notifications directly to your customers' WhatsApp.</p>
              <div>
                <label className="block text-sm font-medium text-text-tertiary mb-2">Business Phone Number</label>
                <Input placeholder="+1 (555) 000-0000" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-tertiary mb-2">API Key</label>
                <Input type="password" placeholder="Enter WhatsApp API Key" />
              </div>
            </>
          )}

          {selectedIntegration?.name === 'Payment Gateway' && (
            <>
              <p className="text-text-tertiary">Manage your payment provider settings and transaction preferences.</p>
              <div>
                <label className="block text-sm font-medium text-text-tertiary mb-2">Provider</label>
                <select className="input w-full">
                  <option>Stripe</option>
                  <option>PayPal</option>
                  <option>Razorpay</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-tertiary mb-2">Publishable Key</label>
                <Input type="password" placeholder="pk_test_..." defaultValue="pk_test_sample_key_123" />
              </div>
            </>
          )}

          {selectedIntegration?.name === 'Email Service' && (
            <>
              <p className="text-text-tertiary">Configure your email service provider for transactional emails and marketing campaigns.</p>
              <div>
                <label className="block text-sm font-medium text-text-tertiary mb-2">Provider</label>
                <select className="input w-full">
                  <option>AWS SES</option>
                  <option>SendGrid</option>
                  <option>Mailgun</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-tertiary mb-2">API Key</label>
                <Input type="password" placeholder="Enter API Key" defaultValue="SG.sample.key" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-tertiary mb-2">Sender Email</label>
                <Input placeholder="noreply@store.com" defaultValue="notifications@store.com" />
              </div>
            </>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <Button variant="secondary" onClick={() => setShowIntegrationModal(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? 'Saving...' : 'Save Configuration'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
