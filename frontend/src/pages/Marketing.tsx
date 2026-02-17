import { useState, useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import api from '../utils/api'
import toast from 'react-hot-toast'
import {
  RocketLaunchIcon,
  PlusIcon,
  ChartBarIcon,
  UserGroupIcon,
  DocumentDuplicateIcon,
  ArrowTrendingUpIcon,
  MegaphoneIcon,
  BoltIcon,
  FunnelIcon,
  GlobeAltIcon,
  SparklesIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline'
import {
  NeonStatCard,
  TiltCard,
  HolographicCard,
  CyberButton,
  SkeletonCard
} from '../components/NextGenUI'
import Modal from '../components/Modal'
import CampaignForm from '../components/CampaignForm'
import MarketingIntegrations from '../components/MarketingIntegrations'
import StoreSelector from '../components/StoreSelector'
import {
  CampaignsTab,
  SegmentsTab,
  TemplatesTab,
  AutomationTab,
  AnalyticsTab,
  LeadsTab,
  ExternalCampaignCard,
  CampaignCard
} from '../components/MarketingTabs'

// Types
interface Campaign {
  id: number
  name: string
  description?: string
  campaign_type: string
  trigger_type?: string
  status: string
  total_sent: number
  total_opened: number
  total_clicked: number
  total_converted: number
  created_at: string
  segment?: string
  revenue?: number
}

interface Segment {
  id: number
  name: string
  description: string
  filters: any
  customer_count: number
  estimated_reach: number
}

interface Template {
  id: number
  name: string
  type: 'email' | 'sms' | 'whatsapp'
  subject?: string
  content: string
  preview_url?: string
}

interface SyncedCampaign {
  id: number
  integration_id: number
  platform: string
  campaign_name: string
  status: string
  impressions: number
  clicks: number
  conversions: number
  spend: number
  roas: number
}

interface MarketingInsight {
  type: 'opportunity' | 'risk' | 'achievement'
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  potential_revenue?: number
  action_label: string
  action_endpoint: string
}

type TabType = 'overview' | 'campaigns' | 'segments' | 'templates' | 'automation' | 'analytics' | 'leads' | 'integrations'

export default function Marketing() {
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [loading, setLoading] = useState(true)

  // Data states
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [segments, setSegments] = useState<Segment[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [syncedCampaigns, setSyncedCampaigns] = useState<SyncedCampaign[]>([])
  const [insights, setInsights] = useState<MarketingInsight[]>([])

  // Modal states
  const [showCampaignModal, setShowCampaignModal] = useState(false)

  // Store selector
  const [selectedStoreId, setSelectedStoreId] = useState<number | 'all'>(
    user?.role === 'super_admin' ? 'all' : (user?.store_id || 'all')
  )

  // Stats
  const [stats, setStats] = useState({
    total_campaigns: 0,
    active_campaigns: 0,
    total_sent: 0,
    total_revenue: 0,
    avg_open_rate: 0,
    avg_click_rate: 0,
    avg_conversion_rate: 0,
    total_leads: 0
  })

  useEffect(() => {
    loadData()
  }, [activeTab, selectedStoreId])

  const loadData = async () => {
    setLoading(true)
    try {
      const [campaignsRes, insightsRes, syncedRes] = await Promise.all([
        api.get('/campaigns/').catch(() => ({ data: [] })),
        api.get('/automation/marketing/insights').catch(() => ({ data: [] })),
        api.get('/marketing/campaigns/synced').catch(() => ({ data: [] }))
      ])

      const campaignData = campaignsRes.data || []
      setCampaigns(campaignData.length > 0 ? campaignData : mockCampaigns)
      setInsights(insightsRes.data && insightsRes.data.length > 0 ? insightsRes.data : mockInsights)
      setSyncedCampaigns(syncedRes.data || [])

      // Load segments and templates
      setSegments(mockSegments)
      setTemplates(mockTemplates)

      // Calculate stats
      calculateStats(campaignData.length > 0 ? campaignData : mockCampaigns)
    } catch (error: any) {
      console.error('Error loading data:', error)
      // Use mock data
      setCampaigns(mockCampaigns)
      setInsights(mockInsights)
      setSegments(mockSegments)
      setTemplates(mockTemplates)
      calculateStats(mockCampaigns)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (campaigns: Campaign[]) => {
    const totalSent = campaigns.reduce((sum, c) => sum + (c.total_sent || 0), 0)
    const totalOpened = campaigns.reduce((sum, c) => sum + (c.total_opened || 0), 0)
    const totalClicked = campaigns.reduce((sum, c) => sum + (c.total_clicked || 0), 0)
    const totalConverted = campaigns.reduce((sum, c) => sum + (c.total_converted || 0), 0)
    const totalRevenue = campaigns.reduce((sum, c) => sum + (c.revenue || 0), 0)

    setStats({
      total_campaigns: campaigns.length,
      active_campaigns: campaigns.filter(c => c.status === 'active').length,
      total_sent: totalSent,
      total_revenue: totalRevenue,
      avg_open_rate: totalSent > 0 ? (totalOpened / totalSent) * 100 : 0,
      avg_click_rate: totalSent > 0 ? (totalClicked / totalSent) * 100 : 0,
      avg_conversion_rate: totalSent > 0 ? (totalConverted / totalSent) * 100 : 0,
      total_leads: 1247
    })
  }

  const handleAction = async (endpoint: string) => {
    toast.promise(
      api.post('/automation' + endpoint),
      {
        loading: 'Orchestrating campaign...',
        success: 'Campaign launched successfully!',
        error: 'Failed to launch campaign'
      }
    )
  }

  // Mock data
  const mockCampaigns: Campaign[] = [
    {
      id: 1,
      name: 'Summer Sale Email Blast',
      campaign_type: 'email',
      status: 'active',
      segment: 'VIP Customers',
      total_sent: 5420,
      total_opened: 3250,
      total_clicked: 890,
      total_converted: 156,
      revenue: 234500,
      created_at: '2025-01-20T10:00:00Z'
    },
    {
      id: 2,
      name: 'Cart Abandonment SMS',
      campaign_type: 'sms',
      status: 'active',
      segment: 'Abandoned Carts',
      total_sent: 1240,
      total_opened: 1180,
      total_clicked: 450,
      total_converted: 89,
      revenue: 89000,
      created_at: '2025-01-22T14:30:00Z'
    }
  ]

  const mockInsights: MarketingInsight[] = [
    {
      type: 'opportunity',
      priority: 'high',
      title: 'Birthday Revenue Boost',
      description: '12 customers have birthdays this week. Estimated revenue opportunity: ₹24,000.',
      potential_revenue: 24000,
      action_label: 'Launch Campaign',
      action_endpoint: '/birthdays'
    },
    {
      type: 'risk',
      priority: 'high',
      title: 'VIP Churn Risk',
      description: '3 high-value customers haven\'t purchased in 90 days.',
      action_label: 'Win Back',
      action_endpoint: '/winback'
    }
  ]

  const mockSegments: Segment[] = [
    {
      id: 1,
      name: 'VIP Customers',
      description: 'Customers with lifetime value > ₹50,000',
      filters: { ltv: { gt: 50000 } },
      customer_count: 342,
      estimated_reach: 342
    },
    {
      id: 2,
      name: 'Abandoned Carts',
      description: 'Customers who left items in cart in last 24h',
      filters: { cart_abandoned: true, hours: 24 },
      customer_count: 156,
      estimated_reach: 156
    }
  ]

  const mockTemplates: Template[] = [
    {
      id: 1,
      name: 'Welcome Email',
      type: 'email',
      subject: 'Welcome to {{store_name}}!',
      content: 'Hi {{customer_name}}, welcome to our store...'
    },
    {
      id: 2,
      name: 'Order Confirmation SMS',
      type: 'sms',
      content: 'Your order #{{order_id}} has been confirmed. Track: {{tracking_url}}'
    }
  ]

  const tabs = [
    { id: 'overview', name: 'Overview', icon: ChartBarIcon },
    { id: 'campaigns', name: 'Campaigns', icon: MegaphoneIcon },
    { id: 'segments', name: 'Segments', icon: UserGroupIcon },
    { id: 'templates', name: 'Templates', icon: DocumentDuplicateIcon },
    { id: 'automation', name: 'Automation', icon: BoltIcon },
    { id: 'analytics', name: 'Analytics', icon: ArrowTrendingUpIcon },
    { id: 'leads', name: 'Leads', icon: FunnelIcon },
    { id: 'integrations', name: 'Integrations', icon: GlobeAltIcon }
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonCard className="h-32" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
        </div>
        <SkeletonCard className="h-96" />
      </div>
    )
  }

  return (
    <div className="space-y-8 relative min-h-screen">
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute w-[600px] h-[600px] rounded-full bg-purple-500/10 blur-[150px] -top-1/4 -left-1/4 animate-aurora-1" />
        <div className="absolute w-[500px] h-[500px] rounded-full bg-pink-500/10 blur-[150px] top-1/2 -right-1/4 animate-aurora-2" />
        <div className="absolute w-[400px] h-[400px] rounded-full bg-blue-500/10 blur-[150px] -bottom-1/4 left-1/3 animate-aurora-3" />
      </div>

      {/* Header */}
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-5xl font-black text-white flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 flex items-center justify-center shadow-lg shadow-purple-500/30 animate-glow-pulse">
              <RocketLaunchIcon className="w-9 h-9 text-white" />
            </div>
            <span>
              Marketing <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400">Hub</span>
            </span>
          </h1>
          <p className="text-gray-400 text-lg mt-2 ml-20">
            All-in-One Marketing Command Center
          </p>
        </div>

        <div className="flex gap-3">
          <StoreSelector
            selectedStoreId={selectedStoreId}
            onStoreChange={setSelectedStoreId}
            showAllOption
          />
          <CyberButton
            onClick={() => setShowCampaignModal(true)}
            icon={PlusIcon}
            variant="primary"
          >
            New Campaign
          </CyberButton>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="relative z-10">
        <div className="flex gap-2 p-1.5 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${activeTab === tab.id
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
              >
                <Icon className="w-5 h-5" />
                {tab.name}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="relative z-10">
        {activeTab === 'overview' && (
          <div className="space-y-8 relative z-10">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <NeonStatCard
                title="Total Campaigns"
                value={stats.total_campaigns}
                icon={MegaphoneIcon}
                color="violet"
                subtitle={`${stats.active_campaigns} active`}
                delay={100}
              />
              <NeonStatCard
                title="Messages Sent"
                value={stats.total_sent}
                icon={EnvelopeIcon}
                color="blue"
                subtitle="This month"
                delay={200}
              />
              <NeonStatCard
                title="Revenue Generated"
                value={stats.total_revenue}
                prefix="₹"
                icon={ArrowTrendingUpIcon}
                color="emerald"
                trend={{ value: 23.5, isPositive: true }}
                delay={300}
              />
              <NeonStatCard
                title="Total Leads"
                value={stats.total_leads}
                icon={FunnelIcon}
                color="amber"
                subtitle="+156 this week"
                delay={400}
              />
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <TiltCard glowColor="purple">
                <div className="p-6 rounded-3xl bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-purple-500/20 text-purple-400">
                      <ChartBarIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Open Rate</h3>
                      <p className="text-sm text-gray-500">Average across all campaigns</p>
                    </div>
                  </div>
                  <div className="text-4xl font-black text-purple-400 mb-2">
                    {stats.avg_open_rate.toFixed(1)}%
                  </div>
                  <div className="flex items-center gap-2 text-sm text-emerald-400">
                    <ArrowTrendingUpIcon className="w-4 h-4" />
                    <span>+5.2% from last month</span>
                  </div>
                </div>
              </TiltCard>

              <TiltCard glowColor="blue">
                <div className="p-6 rounded-3xl bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-blue-500/20 text-blue-400">
                      <BoltIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Click Rate</h3>
                      <p className="text-sm text-gray-500">Engagement metric</p>
                    </div>
                  </div>
                  <div className="text-4xl font-black text-blue-400 mb-2">
                    {stats.avg_click_rate.toFixed(1)}%
                  </div>
                  <div className="flex items-center gap-2 text-sm text-emerald-400">
                    <ArrowTrendingUpIcon className="w-4 h-4" />
                    <span>+3.8% from last month</span>
                  </div>
                </div>
              </TiltCard>

              <TiltCard glowColor="emerald">
                <div className="p-6 rounded-3xl bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400">
                      <UserGroupIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Conversion Rate</h3>
                      <p className="text-sm text-gray-500">Revenue impact</p>
                    </div>
                  </div>
                  <div className="text-4xl font-black text-emerald-400 mb-2">
                    {stats.avg_conversion_rate.toFixed(1)}%
                  </div>
                  <div className="flex items-center gap-2 text-sm text-emerald-400">
                    <ArrowTrendingUpIcon className="w-4 h-4" />
                    <span>+12.4% from last month</span>
                  </div>
                </div>
              </TiltCard>
            </div>

            {/* AI Insights */}
            <HolographicCard>
              <div className="flex items-center gap-3 mb-6">
                <SparklesIcon className="w-6 h-6 text-amber-400 animate-pulse" />
                <h2 className="text-2xl font-bold text-white">Actionable Intelligence</h2>
              </div>

              <div className="grid gap-4">
                {insights.map((insight: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/30 transition-all group">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl ${insight.type === 'opportunity' ? 'bg-emerald-500/20 text-emerald-400' :
                        insight.type === 'risk' ? 'bg-rose-500/20 text-rose-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                        <BoltIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-lg">{insight.title}</h3>
                        <p className="text-gray-400">{insight.description}</p>
                        {insight.potential_revenue && (
                          <p className="text-emerald-400 font-bold mt-1">
                            Potential Impact: +₹{insight.potential_revenue.toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <CyberButton
                      variant={insight.type === 'risk' ? 'danger' : 'secondary'}
                      size="sm"
                      onClick={() => handleAction(insight.action_endpoint)}
                    >
                      {insight.action_label}
                    </CyberButton>
                  </div>
                ))}
              </div>
            </HolographicCard>

            {/* Recent Campaigns */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">Recent Campaigns</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {campaigns.slice(0, 4).map((campaign: any, idx: number) => (
                  <CampaignCard key={campaign.id} campaign={campaign} delay={idx * 100} />
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'campaigns' && (
          <CampaignsTab
            campaigns={campaigns}
            onRefresh={loadData}
          />
        )}

        {activeTab === 'segments' && (
          <SegmentsTab segments={segments} onRefresh={loadData} />
        )}

        {activeTab === 'templates' && (
          <TemplatesTab templates={templates} onRefresh={loadData} />
        )}

        {activeTab === 'automation' && <AutomationTab />}

        {activeTab === 'analytics' && <AnalyticsTab campaigns={campaigns} />}

        {activeTab === 'leads' && <LeadsTab />}

        {activeTab === 'integrations' && (
          <div>
            <MarketingIntegrations />

            {syncedCampaigns.length > 0 && (
              <>
                <h2 className="text-2xl font-bold text-white mt-8 mb-4">External Ad Performance</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {syncedCampaigns.map((camp, idx) => (
                    <ExternalCampaignCard key={camp.id} campaign={camp} delay={idx * 100} />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Campaign Modal */}
      <Modal isOpen={showCampaignModal} onClose={() => setShowCampaignModal(false)} title="New Campaign">
        <CampaignForm
          onSuccess={() => {
            setShowCampaignModal(false)
            loadData()
          }}
          onCancel={() => setShowCampaignModal(false)}
        />
      </Modal>
    </div>
  )
}
