import type { LucideIcon } from 'lucide-react'

interface ConsentInfoCardProps {
  icon: LucideIcon
  title: string
  description: string
  iconColor?: string
  iconBgColor?: string
}

export const ConsentInfoCard = ({
  icon: Icon,
  title,
  description,
  iconColor = 'var(--color-primary)',
  iconBgColor = 'var(--color-accent-lavender)',
}: ConsentInfoCardProps) => {
  return (
    <div
      className="flex items-start gap-4 p-5 rounded-xl transition-all hover:shadow-md"
      style={{
        backgroundColor: 'var(--color-surface-200)',
        borderWidth: 'var(--border-subtle-width)',
        borderStyle: 'var(--border-subtle-style)',
        borderColor: 'var(--border-subtle-color)',
      }}
    >
      <div
        className="p-2 rounded-lg flex-shrink-0"
        style={{ backgroundColor: iconBgColor }}
      >
        <Icon className="w-6 h-6" style={{ color: iconColor }} />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-base text-black mb-2">
          {title}
        </h3>
        <p className="text-sm text-[var(--color-text-heading)] leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  )
}

