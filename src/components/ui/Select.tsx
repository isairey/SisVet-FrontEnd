import type { SelectHTMLAttributes, ReactNode } from 'react'
import clsx from 'clsx'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  helperText?: ReactNode
  children: ReactNode
}

export const Select = ({ label, error, helperText, className, children, id, ...props }: SelectProps) => {
  const selectId = id ?? props.name

  return (
    <label className="space-y-2" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-primary)' }} htmlFor={selectId}>
      {label && (
        <span
          className="font-medium"
          style={{
            fontSize: 'var(--font-size-sm)',
            fontWeight: 'var(--font-weight-medium)',
            color: 'var(--color-text-primary)',
          }}
        >
          {label}
        </span>
      )}
      <select
        id={selectId}
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
      >
        {children}
      </select>
      {helperText && !error && (
        <p className="text-muted" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
          {helperText}
        </p>
      )}
      {error && <p style={{ fontSize: 'var(--font-size-xs)', color: '#DC2626' }}>{error}</p>}
    </label>
  )
}

