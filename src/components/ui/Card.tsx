import type { HTMLAttributes, ReactNode } from 'react'
import clsx from 'clsx'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  header?: ReactNode
  footer?: ReactNode
}

export const Card = ({ header, footer, className, children, style, ...props }: CardProps) => {
  // Si ya hay handlers personalizados, no aplicar el hover por defecto
  const hasCustomHover = props.onMouseEnter || props.onMouseLeave
  
  return (
    <div
      className={clsx(
        'card-component bg-surface',
        className,
      )}
      style={{
        borderRadius: 'var(--radius-card)',
        boxShadow: 'var(--shadow-card)',
        borderWidth: 'var(--border-subtle-width)',
        borderStyle: 'var(--border-subtle-style)',
        borderColor: 'var(--border-subtle-color)',
        transition: hasCustomHover 
          ? undefined 
          : 'box-shadow 0.5s cubic-bezier(0.25, 0.1, 0.25, 1)',
        ...style,
      }}
      onMouseEnter={hasCustomHover ? props.onMouseEnter : (e) => {
        e.currentTarget.style.setProperty('box-shadow', 'var(--shadow-card-hover)')
      }}
      onMouseLeave={hasCustomHover ? props.onMouseLeave : (e) => {
        e.currentTarget.style.setProperty('box-shadow', 'var(--shadow-card)')
      }}
      {...props}
    >
    {header && (
      <div 
        className="px-5 py-4"
        style={{
          borderBottomWidth: '0',
          boxShadow: '0 1px 0 rgba(139, 92, 246, 0.04)',
        }}
      >
        {header}
      </div>
    )}
    <div className="px-5 py-4">{children}</div>
    {footer && (
      <div 
        className="px-5 py-4"
        style={{
          borderTopWidth: '0',
          boxShadow: '0 -1px 0 rgba(139, 92, 246, 0.04)',
        }}
      >
        {footer}
      </div>
    )}
  </div>
  )
}
