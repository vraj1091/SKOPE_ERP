import { useState, useEffect } from 'react'
import { SparklesIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon, LightBulbIcon, ChartBarIcon } from '@heroicons/react/24/outline'
import { PageHeader, PremiumCard, StatCard, Badge } from '../components/PremiumUI'

interface Insight {
  id: string
  title: string
  description: string
  type: 'opportunity' | 'warning' | 'recommendation'
  impact: 'high' | 'medium' | 'low'
  metric?: string
  change?: number
}

export default function AIInsights() {
  const [insights, setInsights] = useState<Insight[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate AI-generated insights
    const sampleInsights: Insight[] = [
      {
        id: '1',
        title: 'Peak Sales Hours Identified',
        description: 'Your store experiences highest sales between 2 PM - 5 PM. Consider scheduling more staff during these hours.',
        type: 'opportunity',
        impact: 'high',
        metric: 'Sales Volume',
        change: 34
      },
      {
        id: '2',
        title: 'Inventory Turnover Rate Improving',
        description: 'Electronics category inventory turnover has increased by 15% this month. Stock levels are optimal.',
        type: 'opportunity',
        impact: 'medium',
        metric: 'Inventory Turnover',
        change: 15
      },
      {
        id: '3',
        title: 'Low Stock Alert - Popular Items',
        description: '3 bestselling products are running low. Restock "Wireless Earbuds", "Smart Watch", and "Phone Cases" to avoid lost sales.',
        type: 'warning',
        impact: 'high',
        metric: 'Stock Levels',
        change: -35
      },
      {
        id: '4',
        title: 'Customer Retention Opportunity',
        description: '25 customers haven\'t purchased in 30 days. Launch a re-engagement campaign with personalized offers.',
        type: 'recommendation',
        impact: 'medium',
        metric: 'Customer Retention',
        change: -12
      },
      {
        id: '5',
        title: 'Product Bundle Recommendation',
        description: 'Customers buying "Laptop" often purchase "Mouse" and "Laptop Bag". Create a bundle offer to increase average order value.',
        type: 'opportunity',
        impact: 'high',
        metric: 'Average Order Value',
        change: 28
      },
      {
        id: '6',
        title: 'Seasonal Demand Forecast',
        description: 'Based on historical data, Fashion category sales typically increase by 40% next month. Plan inventory accordingly.',
        type: 'recommendation',
        impact: 'high',
        metric: 'Seasonal Forecast',
        change: 40
      }
    ]

    setTimeout(() => {
      setInsights(sampleInsights)
      setLoading(false)
    }, 800)
  }, [])

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'opportunity':
        return 'from-green-500 to-emerald-600'
      case 'warning':
        return 'from-red-500 to-orange-600'
      case 'recommendation':
        return 'from-blue-500 to-indigo-600'
      default:
        return 'from-gray-500 to-gray-600'
    }
  }

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <PageHeader
        title="AI Insights"
        subtitle="Intelligent business recommendations powered by data analysis"
        icon={SparklesIcon}
        actions={
          <Badge color="violet">{insights.length} Active Insights</Badge>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Opportunities"
          value={insights.filter(i => i.type === 'opportunity').length}
          subtitle="Growth potential identified"
          icon={ArrowTrendingUpIcon}
          color="emerald"
          delay={100}
        />
        <StatCard
          title="Warnings"
          value={insights.filter(i => i.type === 'warning').length}
          subtitle="Issues requiring attention"
          icon={ArrowTrendingDownIcon}
          color="rose"
          delay={200}
        />
        <StatCard
          title="Recommendations"
          value={insights.filter(i => i.type === 'recommendation').length}
          subtitle="Actionable suggestions"
          icon={LightBulbIcon}
          color="blue"
          delay={300}
        />
      </div>

      {/* Insights List */}
      <PremiumCard delay={400}>
        <div className="p-6 border-b border-border">
          <h2 className="text-2xl font-bold text-text-primary flex items-center gap-3">
            <ChartBarIcon className="w-7 h-7 text-primary-400" />
            Generated Insights
          </h2>
          <p className="text-text-tertiary mt-1">AI-powered analysis of your business data</p>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="spinner w-12 h-12 mr-4" />
              <span className="text-text-tertiary font-semibold">Analyzing data...</span>
            </div>
          ) : insights.length === 0 ? (
            <div className="text-center py-12">
              <SparklesIcon className="w-16 h-16 text-text-muted opacity-50 mx-auto mb-4" />
              <p className="text-text-secondary font-semibold">No insights available yet</p>
              <p className="text-text-muted text-sm mt-2">
                AI will analyze your data and generate insights automatically
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {insights.map((insight, index) => (
                <div
                  key={insight.id}
                  className="opacity-0 animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
                >
                  <PremiumCard hover>
                    <div className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${getInsightColor(insight.type)}`}></div>
                            <h3 className="text-lg font-bold text-text-primary">
                              {insight.title}
                            </h3>
                            <Badge color={insight.impact === 'high' ? 'rose' : insight.impact === 'medium' ? 'amber' : 'emerald'}>
                              {insight.impact.toUpperCase()} IMPACT
                            </Badge>
                          </div>
                          <p className="text-text-tertiary leading-relaxed">
                            {insight.description}
                          </p>
                          {insight.metric && (
                            <div className="flex items-center gap-4 mt-4">
                              <div className="text-sm font-semibold text-text-muted">
                                📊 {insight.metric}
                              </div>
                              {insight.change && (
                                <div className={`flex items-center gap-1 text-sm font-bold ${insight.change > 0 ? 'text-success' : 'text-danger'
                                  }`}>
                                  {insight.change > 0 ? (
                                    <ArrowTrendingUpIcon className="w-4 h-4" />
                                  ) : (
                                    <ArrowTrendingDownIcon className="w-4 h-4" />
                                  )}
                                  {Math.abs(insight.change)}%
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </PremiumCard>
                </div>
              ))}
            </div>
          )}
        </div>
      </PremiumCard>

      {/* Info Banner */}
      <PremiumCard delay={500}>
        <div className="flex items-start gap-4">
          <SparklesIcon className="w-6 h-6 text-primary-400 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-bold text-text-primary mb-2">How AI Insights Work</h3>
            <p className="text-text-tertiary text-sm leading-relaxed">
              Our AI engine continuously analyzes your sales patterns, inventory levels, customer behavior, and market trends
              to generate actionable insights. These recommendations help you make data-driven decisions to grow your business.
            </p>
          </div>
        </div>
      </PremiumCard>
    </div>
  )
}
