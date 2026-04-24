import clsx from 'clsx'

interface RoleBadgeProps {
  role: string | undefined | null
  className?: string
}

const roleColors: Record<string, { bg: string; text: string; border: string }> = {
  administrador: {
    bg: 'bg-purple-100',
    text: 'text-purple-700',
    border: 'border-purple-200',
  },
  veterinario: {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    border: 'border-blue-200',
  },
  recepcionista: {
    bg: 'bg-green-100',
    text: 'text-green-700',
    border: 'border-green-200',
  },
  practicante: {
    bg: 'bg-orange-100',
    text: 'text-orange-700',
    border: 'border-orange-200',
  },
  cliente: {
    bg: 'bg-indigo-100',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
  },
}

const defaultColors = {
  bg: 'bg-gray-100',
  text: 'text-gray-700',
  border: 'border-gray-200',
}

export const RoleBadge = ({ role, className }: RoleBadgeProps) => {
  // Validación defensiva: si role es undefined, null o no es string, usar valor por defecto
  if (!role || typeof role !== 'string') {
    return null
  }

  const roleLower = role.toLowerCase()
  const colors = roleColors[roleLower] || defaultColors

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
      {role}
    </span>
  )
}

