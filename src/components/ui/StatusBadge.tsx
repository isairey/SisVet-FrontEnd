import clsx from 'clsx'

interface StatusBadgeProps {
  status: 'activo' | 'inactivo' | 'suspendido'
  className?: string
}

const statusColors: Record<StatusBadgeProps['status'], { bg: string; text: string; border: string }> = {
  activo: {
    bg: 'bg-emerald-100',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
  },
  inactivo: {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    border: 'border-gray-200',
  },
  suspendido: {
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    border: 'border-amber-200',
  },
}

export const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const colors = statusColors[status]

  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize transition-all',
        colors.bg,
        colors.text,
        colors.border,
        className,
      )}
    >
      {status}
    </span>
  )
}

