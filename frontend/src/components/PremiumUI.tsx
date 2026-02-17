// Wrapper file to make old pages work with new component library
import { ReactNode } from 'react'
import { Card, CardHeader, CardBody } from './ui'
export { Card as PremiumCard } from './ui'
export { Button } from './ui'
export { Badge } from './ui'

// Input wrapper
export const Input = ({ 
  placeholder, 
  value, 
  onChange, 
  icon: Icon,
  className = '',
  ...props 
}: any) => (
  <div className={`relative ${className}`}>
    {Icon && (
      <Icon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
    )}
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`input ${Icon ? 'pl-12' : ''}`}
      {...props}
    />
  </div>
)

// StatCard wrapper - Fixed to work with old props
export const StatCard = ({ 
  title, 
  value, 
  subtitle,
  icon: Icon, 
  color,
  trend,
  trendValue,
  delay 
}: any) => {
  const iconElement = Icon ? <Icon className="w-6 h-6" /> : null
  
  return (
    <div 
      className="animate-fade-in-up"
      style={{ animationDelay: `${delay || 0}ms`, animationFillMode: 'forwards', opacity: 0 }}
    >
      <Card className="card-hover">
        <CardBody>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-text-tertiary uppercase tracking-wide mb-2">
                {title}
              </p>
              <p className="text-3xl font-bold text-text-primary mb-1">
                {typeof value === 'number' ? value.toLocaleString() : value}
              </p>
              {subtitle && (
                <p className="text-sm text-text-muted">{subtitle}</p>
              )}
              {trendValue && (
                <p className={`text-sm mt-2 ${trend === 'up' ? 'text-success' : 'text-text-muted'}`}>
                  {trendValue}
                </p>
              )}
            </div>
            {iconElement && (
              <div className="w-12 h-12 rounded-xl bg-primary-subtle flex items-center justify-center text-primary-400">
                {iconElement}
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  )
}

// PageHeader Component
export const PageHeader = ({ 
  title, 
  subtitle, 
  icon: Icon, 
  actions 
}: { 
  title: string
  subtitle?: string
  icon?: any
  actions?: ReactNode
}) => (
  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 animate-fade-in-up">
    <div className="flex items-center gap-4">
      {Icon && (
        <div className="w-14 h-14 rounded-xl bg-primary-subtle flex items-center justify-center">
          <Icon className="w-7 h-7 text-primary-400" />
        </div>
      )}
      <div>
        <h1 className="text-4xl font-bold text-text-primary">{title}</h1>
        {subtitle && <p className="text-text-tertiary text-lg mt-1">{subtitle}</p>}
      </div>
    </div>
    {actions && <div className="flex items-center gap-3">{actions}</div>}
  </div>
)

// Loading Component
export const Loading = ({ message }: { message?: string }) => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center animate-fade-in">
      <div className="spinner w-12 h-12 mx-auto mb-4" />
      <p className="text-text-tertiary">{message || 'Loading...'}</p>
    </div>
  </div>
)

// EmptyState Component
export const EmptyState = ({ 
  icon: Icon, 
  title, 
  message, 
  action 
}: { 
  icon?: any
  title: string
  message?: string
  action?: ReactNode
}) => (
  <div className="text-center py-16 animate-fade-in">
    {Icon && <Icon className="w-16 h-16 mx-auto mb-4 text-text-muted opacity-50" />}
    <h3 className="text-xl font-semibold text-text-primary mb-2">{title}</h3>
    {message && <p className="text-text-tertiary mb-6">{message}</p>}
    {action}
  </div>
)

// Alert Component
export const Alert = ({
  type,
  title,
  message,
  action
}: {
  type: 'error' | 'success' | 'warning' | 'info'
  title: string
  message?: string
  action?: ReactNode
}) => {
  const colors = {
    error: 'border-danger/20 bg-danger-bg',
    success: 'border-success/20 bg-success-bg',
    warning: 'border-warning/20 bg-warning-bg',
    info: 'border-info/20 bg-info-bg',
  }

  const textColors = {
    error: 'text-danger',
    success: 'text-success',
    warning: 'text-warning',
    info: 'text-info',
  }

  return (
    <div className={`card ${colors[type]} animate-fade-in`}>
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h4 className={`font-semibold ${textColors[type]} mb-1`}>{title}</h4>
            {message && <p className="text-sm text-text-tertiary">{message}</p>}
          </div>
          {action}
        </div>
      </div>
    </div>
  )
}
