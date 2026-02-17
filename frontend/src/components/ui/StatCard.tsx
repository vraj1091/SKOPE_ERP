import { HTMLAttributes, forwardRef, ReactNode } from 'react'
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline'

interface StatCardProps extends HTMLAttributes<HTMLDivElement> {
  title: string
  value: string | number
  change?: number
  changeLabel?: string
  icon?: ReactNode
  trend?: 'up' | 'down'
  loading?: boolean
}

const StatCard = forwardRef<HTMLDivElement, StatCardProps>(
  ({ className, title, value, change, changeLabel, icon, trend, loading, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`stat-card card-hover ${className || ''}`}
        {...props}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="stat-label">{title}</p>
            {loading ? (
              <div className="skeleton h-10 w-32 mt-2" />
            ) : (
              <p className="stat-value">{value}</p>
            )}
            {change !== undefined && (
              <div className={`stat-change mt-2 ${
                trend === 'up' ? 'stat-change-positive' : 
                trend === 'down' ? 'stat-change-negative' : 
                'text-text-tertiary'
              }`}>
                {trend === 'up' && <ArrowUpIcon className="w-3.5 h-3.5" />}
                {trend === 'down' && <ArrowDownIcon className="w-3.5 h-3.5" />}
                <span>{Math.abs(change)}%</span>
                {changeLabel && <span className="text-text-muted ml-1">{changeLabel}</span>}
              </div>
            )}
          </div>
          {icon && (
            <div className="w-12 h-12 rounded-xl bg-primary-subtle flex items-center justify-center text-primary-400">
              {icon}
            </div>
          )}
        </div>
      </div>
    )
  }
)

StatCard.displayName = 'StatCard'

export default StatCard
