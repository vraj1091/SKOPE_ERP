import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
  success?: boolean
  helperText?: string
  label?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, success, helperText, label, ...props }, ref) => {
    const inputClasses = [
      'input',
      error && 'input-error',
      success && 'input-success',
      className
    ].filter(Boolean).join(' ')

    return (
      <div className="form-group">
        {label && (
          <label className="form-label">
            {label}
            {props.required && <span className="text-danger ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          className={inputClasses}
          {...props}
        />
        {helperText && (
          <p className={error ? 'form-error' : 'form-helper'}>
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
