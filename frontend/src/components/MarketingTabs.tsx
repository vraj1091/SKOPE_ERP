import { useState } from 'react'
import {
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  DevicePhoneMobileIcon,
  BellAlertIcon,
  ChartBarIcon,
  UserGroupIcon,
  SparklesIcon,
  PencilSquareIcon,
  ArrowTrendingUpIcon,
  MegaphoneIcon,
  BoltIcon,
  EyeIcon,
  DocumentDuplicateIcon,
  CheckCircleIcon,
  PauseCircleIcon,
  PlayCircleIcon,
  PlusIcon,
  FunnelIcon
} from '@heroicons/react/24/outline'
import {
  NeonStatCard,
  TiltCard,
  HolographicCard,
  CyberButton
} from './NextGenUI'
import toast from 'react-hot-toast'

// Campaign Card Component
export function CampaignCard({ campaign, delay }: { campaign: any; delay: number }) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return EnvelopeIcon
      case 'sms': return DevicePhoneMobileIcon
      case 'whatsapp': return ChatBubbleLeftRightIcon
      case 'push': return BellAlertIcon
      default: return MegaphoneIcon
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
      case 'paused': return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
      case 'draft': return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
      case 'completed': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const Icon = getTypeIcon(campaign.campaign_type || campaign.type)
  const openRate = campaign.total_sent > 0 ? (campaign.total_opened / campaign.total_sent) * 100 : 0
  const conversionRate = campaign.total_sent > 0 ? (campaign.total_converted / campaign.total_sent) * 100 : 0

  return (
    <TiltCard
      glowColor="purple"
      className="opacity-0 animate-slide-up"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' } as any}
    >
      <div className="p-6 rounded-3xl bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] h-full">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-purple-500/20 text-purple-400">
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">{campaign.name}</h3>
              <p className="text-sm text-gray-500">{campaign.segment || 'All Customers'}</p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${getStatusColor(campaign.status)}`}>
            {campaign.status}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="text-center p-3 rounded-xl bg-white/5">
            <div className="text-xs text-gray-500 mb-1">Sent</div>
            <div className="font-bold text-white">{campaign.total_sent?.toLocaleString() || 0}</div>
          </div>
          <div className="text-center p-3 rounded-xl bg-white/5">
            <div className="text-xs text-gray-500 mb-1">Open</div>
            <div className="font-bold text-blue-400">{openRate.toFixed(1)}%</div>
          </div>
          <div className="text-center p-3 rounded-xl bg-white/5">
            <div className="text-xs text-gray-500 mb-1">Conv</div>
            <div className="font-bold text-emerald-400">{conversionRate.toFixed(1)}%</div>
          </div>
          <div className="text-center p-3 rounded-xl bg-white/5">
            <div className="text-xs text-gray-500 mb-1">Revenue</div>
            <div className="font-bold text-purple-400">₹{((campaign.revenue || 0) / 1000).toFixed(0)}k</div>
          </div>
        </div>

        <div className="flex gap-2">
          <CyberButton className="flex-1" size="sm" variant="secondary">
            <EyeIcon className="w-4 h-4" />
            View
          </CyberButton>
          <CyberButton className="flex-1" size="sm" variant="primary">
            <ChartBarIcon className="w-4 h-4" />
            Analytics
          </CyberButton>
        </div>
      </div>
    </TiltCard>
  )
}

// Overview Tab Component
export function OverviewTab({ stats, campaigns, insights, onAction }: any) {
  return (
    <div className="space-y-8 relative z-10">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <NeonStatCard
          title="Total Campaigns"
          value={stats.total_campaigns}
          icon={MegaphoneIcon}
          color="purple"
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
                <EyeIcon className="w-6 h-6" />
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
                <CheckCircleIcon className="w-6 h-6" />
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
                onClick={() => onAction(insight.action_endpoint)}
              >
                {insight.action_label}
              </CyberButton>
            </div>
          ))}
        </div>
      </HolographicCard>

      {/* Quick Actions */}
      <HolographicCard>
        <div className="flex items-center gap-3 mb-6">
          <SparklesIcon className="w-6 h-6 text-amber-400 animate-pulse" />
          <h2 className="text-2xl font-bold text-white">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => toast.success('Email Builder Coming Soon!')}
            className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 hover:border-purple-500/40 transition-all group"
          >
            <EnvelopeIcon className="w-8 h-8 text-purple-400 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-white mb-1">Email Builder</h3>
            <p className="text-sm text-gray-400">Create beautiful emails</p>
          </button>

          <button
            onClick={() => toast.success('SMS Campaign Builder Coming Soon!')}
            className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 hover:border-blue-500/40 transition-all group"
          >
            <DevicePhoneMobileIcon className="w-8 h-8 text-blue-400 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-white mb-1">SMS Campaign</h3>
            <p className="text-sm text-gray-400">Send bulk SMS</p>
          </button>

          <button
            onClick={() => toast.success('WhatsApp Campaign Coming Soon!')}
            className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-green-500/10 border border-emerald-500/20 hover:border-emerald-500/40 transition-all group"
          >
            <ChatBubbleLeftRightIcon className="w-8 h-8 text-emerald-400 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-white mb-1">WhatsApp</h3>
            <p className="text-sm text-gray-400">Engage on WhatsApp</p>
          </button>

          <button
            onClick={() => toast.success('Push Notification Coming Soon!')}
            className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 hover:border-amber-500/40 transition-all group"
          >
            <BellAlertIcon className="w-8 h-8 text-amber-400 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-white mb-1">Push Notifications</h3>
            <p className="text-sm text-gray-400">Mobile alerts</p>
          </button>
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
  )
}

// Campaigns Tab Component
export function CampaignsTab({ campaigns, onRefresh }: any) {
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const filteredCampaigns = campaigns.filter((c: any) => {
    const matchesFilter = filter === 'all' || c.status === filter
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  return (
    <div className="space-y-6 relative z-10">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="Search campaigns..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
        />
        <div className="flex gap-2">
          {['all', 'active', 'paused', 'draft', 'completed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-3 rounded-xl font-semibold capitalize transition-all ${
                filter === status
                  ? 'bg-purple-500 text-white'
                  : 'bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredCampaigns.map((campaign: any, idx: number) => (
          <CampaignCard key={campaign.id} campaign={campaign} delay={idx * 100} />
        ))}
      </div>

      {filteredCampaigns.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No campaigns found
        </div>
      )}
    </div>
  )
}

// Segments Tab Component
export function SegmentsTab({ segments, onRefresh }: any) {
  return (
    <div className="space-y-6 relative z-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {segments.map((segment: any, idx: number) => (
          <TiltCard
            key={segment.id}
            glowColor="blue"
            className="opacity-0 animate-slide-up"
            style={{ animationDelay: `${idx * 100}ms`, animationFillMode: 'forwards' } as any}
          >
            <div className="p-6 rounded-3xl bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] h-full flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-blue-500/20 text-blue-400">
                  <UserGroupIcon className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400">
                  {segment.customer_count} customers
                </span>
              </div>

              <h3 className="text-xl font-bold text-white mb-2">{segment.name}</h3>
              <p className="text-gray-400 text-sm mb-4 flex-1">{segment.description}</p>

              <div className="p-4 rounded-xl bg-white/5 mb-4">
                <div className="text-xs text-gray-500 mb-1">Estimated Reach</div>
                <div className="text-2xl font-bold text-blue-400">{segment.estimated_reach.toLocaleString()}</div>
              </div>

              <div className="flex gap-2">
                <CyberButton className="flex-1" size="sm" variant="secondary">
                  <PencilSquareIcon className="w-4 h-4" />
                  Edit
                </CyberButton>
                <CyberButton className="flex-1" size="sm" variant="primary">
                  <MegaphoneIcon className="w-4 h-4" />
                  Campaign
                </CyberButton>
              </div>
            </div>
          </TiltCard>
        ))}
      </div>
    </div>
  )
}

// Templates Tab Component
export function TemplatesTab({ templates, onRefresh }: any) {
  return (
    <div className="space-y-6 relative z-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template: any, idx: number) => (
          <TiltCard
            key={template.id}
            glowColor="emerald"
            className="opacity-0 animate-slide-up"
            style={{ animationDelay: `${idx * 100}ms`, animationFillMode: 'forwards' } as any}
          >
            <div className="p-6 rounded-3xl bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] h-full flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400">
                  {template.type === 'email' ? <EnvelopeIcon className="w-6 h-6" /> :
                   template.type === 'sms' ? <DevicePhoneMobileIcon className="w-6 h-6" /> :
                   <ChatBubbleLeftRightIcon className="w-6 h-6" />}
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-purple-500/20 text-purple-400">
                  {template.type}
                </span>
              </div>

              <h3 className="text-xl font-bold text-white mb-2">{template.name}</h3>
              {template.subject && (
                <p className="text-sm text-gray-500 mb-2">Subject: {template.subject}</p>
              )}
              <p className="text-gray-400 text-sm mb-4 flex-1 line-clamp-3">{template.content}</p>

              <div className="flex gap-2">
                <CyberButton className="flex-1" size="sm" variant="secondary">
                  <PencilSquareIcon className="w-4 h-4" />
                  Edit
                </CyberButton>
                <CyberButton className="flex-1" size="sm" variant="primary">
                  <DocumentDuplicateIcon className="w-4 h-4" />
                  Use
                </CyberButton>
              </div>
            </div>
          </TiltCard>
        ))}
      </div>
    </div>
  )
}

// Automation Tab Component
export function AutomationTab() {
  const workflows = [
    {
      id: 1,
      name: 'Welcome Series',
      trigger: 'New Customer',
      steps: 3,
      active: true,
      sent: 1240,
      converted: 156
    },
    {
      id: 2,
      name: 'Cart Abandonment',
      trigger: 'Cart Abandoned',
      steps: 2,
      active: true,
      sent: 890,
      converted: 89
    },
    {
      id: 3,
      name: 'Win-Back Campaign',
      trigger: 'Inactive 90 Days',
      steps: 4,
      active: false,
      sent: 450,
      converted: 34
    }
  ]

  return (
    <div className="space-y-6 relative z-10">
      <HolographicCard>
        <div className="flex items-center gap-3 mb-6">
          <BoltIcon className="w-6 h-6 text-amber-400" />
          <h2 className="text-2xl font-bold text-white">Automation Workflows</h2>
        </div>

        <div className="space-y-4">
          {workflows.map((workflow) => (
            <div
              key={workflow.id}
              className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/30 transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${workflow.active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-400'}`}>
                    <BoltIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{workflow.name}</h3>
                    <p className="text-sm text-gray-500">Trigger: {workflow.trigger} • {workflow.steps} steps</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${workflow.active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-400'}`}>
                    {workflow.active ? 'Active' : 'Paused'}
                  </span>
                  <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all">
                    {workflow.active ? <PauseCircleIcon className="w-5 h-5" /> : <PlayCircleIcon className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 rounded-xl bg-white/5">
                  <div className="text-xs text-gray-500 mb-1">Sent</div>
                  <div className="text-lg font-bold text-white">{workflow.sent}</div>
                </div>
                <div className="p-3 rounded-xl bg-white/5">
                  <div className="text-xs text-gray-500 mb-1">Converted</div>
                  <div className="text-lg font-bold text-emerald-400">{workflow.converted}</div>
                </div>
                <div className="p-3 rounded-xl bg-white/5">
                  <div className="text-xs text-gray-500 mb-1">Conv Rate</div>
                  <div className="text-lg font-bold text-purple-400">
                    {((workflow.converted / workflow.sent) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </HolographicCard>
    </div>
  )
}

// Analytics Tab Component
export function AnalyticsTab({ campaigns }: { campaigns: any[] }) {
  return (
    <div className="space-y-6 relative z-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HolographicCard>
          <h3 className="text-xl font-bold text-white mb-4">Campaign Performance</h3>
          <div className="space-y-3">
            {campaigns.slice(0, 5).map((campaign) => {
              const convRate = campaign.total_sent > 0 ? (campaign.total_converted / campaign.total_sent) * 100 : 0
              return (
                <div key={campaign.id} className="p-4 rounded-xl bg-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-white">{campaign.name}</span>
                    <span className="text-emerald-400 font-bold">{convRate.toFixed(1)}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                      style={{ width: `${Math.min(convRate, 100)}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </HolographicCard>

        <HolographicCard>
          <h3 className="text-xl font-bold text-white mb-4">Revenue by Channel</h3>
          <div className="space-y-4">
            {[
              { channel: 'Email', revenue: 450000, color: 'purple' },
              { channel: 'SMS', revenue: 230000, color: 'blue' },
              { channel: 'WhatsApp', revenue: 180000, color: 'emerald' },
              { channel: 'Push', revenue: 120000, color: 'amber' }
            ].map((item) => (
              <div key={item.channel} className="flex items-center justify-between">
                <span className="text-gray-400">{item.channel}</span>
                <span className="text-white font-bold">₹{item.revenue.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </HolographicCard>
      </div>
    </div>
  )
}

// Leads Tab Component
export function LeadsTab() {
  const leads = [
    { id: 1, name: 'Rajesh Kumar', email: 'rajesh@example.com', phone: '9876543210', source: 'Website', score: 85, status: 'hot' },
    { id: 2, name: 'Priya Sharma', email: 'priya@example.com', phone: '9876543211', source: 'Facebook', score: 72, status: 'warm' },
    { id: 3, name: 'Amit Patel', email: 'amit@example.com', phone: '9876543212', source: 'Google Ads', score: 45, status: 'cold' }
  ]

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-emerald-400'
    if (score >= 40) return 'text-amber-400'
    return 'text-gray-400'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'hot': return 'bg-rose-500/20 text-rose-400 border-rose-500/30'
      case 'warm': return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
      case 'cold': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  return (
    <div className="space-y-6 relative z-10">
      <HolographicCard>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Lead Management</h2>
          <CyberButton icon={PlusIcon} variant="primary">
            Add Lead
          </CyberButton>
        </div>

        <div className="space-y-3">
          {leads.map((lead) => (
            <div
              key={lead.id}
              className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/30 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
                    {lead.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">{lead.name}</h3>
                    <p className="text-sm text-gray-400">{lead.email} • {lead.phone}</p>
                    <p className="text-xs text-gray-500 mt-1">Source: {lead.source}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-xs text-gray-500 mb-1">Lead Score</div>
                    <div className={`text-2xl font-bold ${getScoreColor(lead.score)}`}>{lead.score}</div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${getStatusColor(lead.status)}`}>
                    {lead.status}
                  </span>
                  <CyberButton size="sm" variant="primary">
                    Contact
                  </CyberButton>
                </div>
              </div>
            </div>
          ))}
        </div>
      </HolographicCard>
    </div>
  )
}

// External Campaign Card
export function ExternalCampaignCard({ campaign, delay }: { campaign: any; delay: number }) {
  return (
    <TiltCard
      glowColor={campaign.platform === 'google_ads' ? 'blue' : 'indigo'}
      className="opacity-0 animate-slide-up"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' } as any}
    >
      <div className={`p-6 rounded-3xl backdrop-blur-md border h-full flex flex-col ${campaign.platform === 'google_ads'
        ? 'bg-blue-900/10 border-blue-500/20'
        : 'bg-indigo-900/10 border-indigo-500/20'
        }`}>
        <div className="flex justify-between items-start mb-4">
          <div className={`p-3 rounded-xl ${campaign.platform === 'google_ads' ? 'bg-blue-500/20 text-blue-400' : 'bg-indigo-500/20 text-indigo-400'
            }`}>
            <MegaphoneIcon className="w-6 h-6" />
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400">
            {campaign.status || 'Active'}
          </span>
        </div>

        <h3 className="text-xl font-bold text-white mb-1">{campaign.campaign_name}</h3>
        <p className="text-gray-400 text-xs mb-4 uppercase tracking-widest">{campaign.platform.replace('_', ' ')}</p>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-2 rounded-lg bg-black/20">
            <div className="text-xs text-gray-500">Spend</div>
            <div className="font-bold text-white">₹{campaign.spend.toLocaleString()}</div>
          </div>
          <div className="p-2 rounded-lg bg-black/20">
            <div className="text-xs text-gray-500">ROAS</div>
            <div className="font-bold text-emerald-400">{campaign.roas}x</div>
          </div>
          <div className="p-2 rounded-lg bg-black/20">
            <div className="text-xs text-gray-500">Impressions</div>
            <div className="font-bold text-white">{campaign.impressions.toLocaleString()}</div>
          </div>
          <div className="p-2 rounded-lg bg-black/20">
            <div className="text-xs text-gray-500">Conversions</div>
            <div className="font-bold text-purple-400">{campaign.conversions}</div>
          </div>
        </div>

        <div className="flex gap-2 mt-auto">
          <CyberButton
            className="flex-1 w-full"
            size="sm"
            variant="secondary"
          >
            View Details
          </CyberButton>
        </div>
      </div>
    </TiltCard>
  )
}
