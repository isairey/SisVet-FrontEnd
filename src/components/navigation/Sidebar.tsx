import type { LucideIcon } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import clsx from 'clsx'

export interface SidebarItem {
  label: string
  href: string
  icon: LucideIcon
  badge?: string
}

interface SidebarProps {
  items: SidebarItem[]
  isOpen: boolean
  onNavigate?: () => void
}

export const Sidebar = ({ items, isOpen, onNavigate }: SidebarProps) => (
  <aside
    className={clsx(
      'dashboard-sidebar fixed inset-y-0 left-0 z-30 flex w-[260px] flex-col bg-surface px-4 py-6 transition-transform duration-300 overflow-y-auto',
      'md:translate-x-0',
      isOpen ? 'translate-x-0' : '-translate-x-full',
    )}
    style={{
      boxShadow: '4px 0 12px rgba(139, 92, 246, 0.05), 2px 0 6px rgba(0, 0, 0, 0.03)',
    }}
  >
    <div className="mb-8 flex items-center gap-3 px-2">
      <div className="h-16 w-16 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center bg-transparent">
        <img 
          src="/logo.png" 
          alt="SGV Logo" 
          className="h-full w-full object-cover object-center scale-110"
          style={{
            imageRendering: 'crisp-edges',
            imageRendering: '-webkit-optimize-contrast',
            padding: 0,
            margin: 0,
          }}
          onError={(e) => {
            // Fallback si el logo no existe
            const target = e.target as HTMLImageElement
            target.style.display = 'none'
          }}
        />
      </div>
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-[var(--color-muted)]">Sistema</p>
        <p className="text-lg font-semibold text-[#2D2D2D]">Gestión Veterinaria</p>
      </div>
    </div>

    <nav className="flex flex-1 flex-col gap-1">
      {items.map(({ label, href, icon: Icon, badge }) => (
        <NavLink
          key={href}
          to={href}
          onClick={onNavigate}
          className={({ isActive }) =>
            clsx(
              'group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition',
              isActive
                ? 'bg-[var(--color-primary)] text-white'
                : 'text-[var(--color-muted)] hover:bg-[var(--color-surface-200)] hover:text-[#2D2D2D]',
            )
          }
        >
          <Icon size={18} className="transition group-hover:scale-105" />
          <span className="flex-1">{label}</span>
          {badge && (
            <span className="rounded-full bg-[var(--color-surface-200)] px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-heading)]" style={{ boxShadow: 'var(--shadow-soft)' }}>
              {badge}
            </span>
          )}
        </NavLink>
      ))}
    </nav>

    <p className="mt-6 px-2 text-xs text-[var(--color-muted)]">© {new Date().getFullYear()} SGV. Todos los derechos reservados.</p>
  </aside>
)

