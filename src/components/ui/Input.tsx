import type { InputHTMLAttributes, ReactNode } from 'react'
import clsx from 'clsx'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  helperText?: ReactNode
  error?: string
}

export const Input = ({ label, helperText, error, className, id, ...props }: InputProps) => {
  const inputId = id ?? props.name

  return (
    <div className="w-full">
      {label && (
        <label 
          className="block mb-2" 
          style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-primary)' }} 
          htmlFor={inputId}
        >
          <span
            className="font-medium block"
            style={{
              fontSize: 'var(--font-size-sm)',
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--color-text-primary)',
            }}
          >
            {label}
          </span>
        </label>
      )}
      <div className="relative">
        <input
          id={inputId}
          className={clsx(
            'w-full rounded-lg border bg-[var(--color-surface-200)] px-4 py-2 transition focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30',
            error && 'border-red-400 focus:border-red-500 focus:ring-red-300/60',
            !error && 'border-[var(--border-subtle-color)]',
            className,
          )}
          style={{
            fontSize: 'var(--font-size-base)',
            fontWeight: 'var(--font-weight-normal)',
            lineHeight: 'var(--line-height-normal)',
            color: 'var(--color-text-primary)',
            borderWidth: 'var(--border-subtle-width)',
            borderStyle: 'var(--border-subtle-style)',
          }}
          {...props}
        />
      </div>
      {helperText && !error && (
        <p className="mt-1 text-muted" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
          {helperText}
        </p>
      )}
      {error && <p className="mt-1" style={{ fontSize: 'var(--font-size-xs)', color: '#DC2626' }}>{error}</p>}
    </div>
  )
}

