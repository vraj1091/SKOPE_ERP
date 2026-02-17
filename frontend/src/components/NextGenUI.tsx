// Wrapper file for NextGenUI components used in Marketing page
import { ReactNode } from 'react'
import { StatCard } from './ui'

// NeonStatCard - Enhanced StatCard
export const NeonStatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  trend,
  delay,
  prefix
}: any) => (
  <div 
    className="animate-fade-in-up"
    style={{ animationDelay: `${delay || 0}ms`, animationFillMode: 'forwards', opacity: 0 }}
  >
    <StatCard
      title={title}
      value={typeof value === 'number' && prefix ? `${prefix}${value.toLocaleString()}` : value}
      icon={Icon && <Icon className="w-6 h-6" />}
      change={trend?.value}
      trend={trend?.isPositive ? 'up' : 'down'}
      changeLabel={subtitle}
    />
  </div>
)

// TiltCard - Card with hover effect
export const TiltCard = ({ 
  children, 
  className = '',
  glowColor
}: { 
  children: ReactNode
  className?: string
  glowColor?: string
}) => (
  <div className={`card card-hover ${className} animate-fade-in-up`}>
    <div className="p-6">
      {children}
    </div>
  </div>
)

// HolographicCard - Fancy card
export const HolographicCard = ({ children }: { children: ReactNode }) => (
  <div className="card card-glass card-hover animate-fade-in-up">
    <div className="p-6">
      {children}
    </div>
  </div>
)

// CyberButton - Enhanced Button
export const CyberButton = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  disabled
}: any) => {
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'btn-danger',
    ghost: 'btn-ghost'
  }

  const sizes = {
    sm: 'btn-sm',
    md: '',
    lg: 'btn-lg'
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn ${variants[variant]} ${sizes[size]}`}
    >
      {Icon && <Icon className="w-5 h-5" />}
      {children}
    </button>
  )
}

// AnimatedCounter - Simple counter
export const AnimatedCounter = ({ value }: { value: number }) => (
  <span className="font-bold">{value.toLocaleString()}</span>
)

// SkeletonCard - Loading skeleton
export const SkeletonCard = ({ className = '' }: { className?: string }) => (
  <div className={`skeleton ${className}`} />
)
