import { Children, cloneElement, isValidElement } from 'react'
import type { ButtonHTMLAttributes, ReactNode, ReactElement } from 'react'
import clsx from 'clsx'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  startIcon?: ReactNode
  endIcon?: ReactNode
  variant?: ButtonVariant
  fullWidth?: boolean
  asChild?: boolean
}

export const Button = ({
  children,
  className,
  startIcon,
  endIcon,
  variant = 'primary',
  fullWidth,
  asChild,
  ...props
}: ButtonProps) => {
  const { type, ...restProps } = props
  const baseStyles =
    'inline-flex items-center justify-center gap-2 rounded-lg border border-transparent px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-60 text-center'

  const variants: Record<ButtonVariant, string> = {
    primary: 'bg-[var(--color-primary)] text-white hover:opacity-90 focus-visible:outline-[var(--color-primary)] border border-transparent',
    secondary: 'bg-[var(--color-surface-200)] text-[#2D2D2D] border border-[var(--color-border)] hover:bg-[var(--color-surface)] focus-visible:outline-[var(--color-secondary)]',
    ghost: 'bg-transparent text-[var(--color-muted)] hover:text-[#2D2D2D] hover:bg-[var(--color-surface-200)] focus-visible:outline-[var(--color-primary)]',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus-visible:outline-red-500',
  }

  const content = (
    <span className="flex items-center justify-center gap-2 w-full">
      {startIcon && <span className="flex items-center justify-center flex-shrink-0">{startIcon}</span>}
      <span className="flex items-center">{children}</span>
      {endIcon && <span className="flex items-center justify-center flex-shrink-0">{endIcon}</span>}
    </span>
  )

  if (asChild) {
    const onlyChild = Children.only(children) as ReactElement | null
    if (!onlyChild || !isValidElement(onlyChild)) {
      throw new Error('Button with asChild expects a single React element as its child.')
    }

    const child = onlyChild as ReactElement<{ className?: string; children?: ReactNode }>

    return cloneElement(child, {
      ...(restProps as Record<string, unknown>),
      className: clsx(baseStyles, variants[variant], fullWidth && 'w-full', child.props.className, className),
      children: (
        <span className="flex items-center justify-center gap-2 w-full">
          {startIcon && <span className="flex items-center justify-center flex-shrink-0">{startIcon}</span>}
          <span className="flex items-center">{child.props.children ?? null}</span>
          {endIcon && <span className="flex items-center justify-center flex-shrink-0">{endIcon}</span>}
        </span>
      ),
    })
  }

  return (
    <button
      type={type ?? 'button'}
      className={clsx(baseStyles, variants[variant], fullWidth && 'w-full', className)}
      {...restProps}
    >
      {content}
    </button>
  )
}

