import { ButtonHTMLAttributes, forwardRef } from 'react'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
  size?: 'sm' | 'md' | 'lg' | 'icon'
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => {
    const variantClasses = {
      primary: 'btn-primary',
      secondary: 'btn-secondary',
      ghost: 'btn-ghost',
      danger: 'btn-danger',
      success: 'btn-success',
    }

    const sizeClasses = {
      sm: 'btn-sm',
      md: '',
      lg: 'btn-lg',
      icon: 'btn-icon',
    }

    return (
      <button
        className={`btn ${variantClasses[variant]} ${sizeClasses[size]} ${className || ''}`}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <div className="spinner w-4 h-4" />
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button
