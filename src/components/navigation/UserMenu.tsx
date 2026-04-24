import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserRound, LogOut, ChevronDown } from 'lucide-react'
import clsx from 'clsx'

import { useSessionStore } from '@/core/store/session-store'
import { useLogoutMutation } from '@/hooks/auth'

export const UserMenu = () => {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const user = useSessionStore((state) => state.user)
  const logoutMutation = useLogoutMutation()
  const navigate = useNavigate()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        navigate('/auth')
      },
    })
  }

  const initials = user?.nombre_completo
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U'

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-xl bg-[var(--color-surface-200)] px-3 py-2 transition-all hover:bg-[var(--color-surface)] focus:outline-none"
        style={{
          boxShadow: 'var(--shadow-soft)',
          border: 'none',
          outline: 'none',
        }}
        onFocus={(e) => {
          e.currentTarget.style.outline = 'none'
          e.currentTarget.style.border = 'none'
        }}
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-primary)] text-white text-sm font-semibold">
          {initials}
        </div>
        <div className="hidden flex-col items-start text-left md:flex">
          <span className="text-xs text-[var(--color-muted)]">Usuario</span>
          <span className="text-sm font-medium text-[#2D2D2D]">{user?.nombre_completo || 'Usuario'}</span>
        </div>
        <ChevronDown size={16} className={clsx('text-[var(--color-muted)] transition-transform', isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <div 
          className="absolute right-0 top-full z-50 mt-2 w-56 rounded-2xl bg-surface"
          style={{
            boxShadow: 'var(--shadow-elevated)',
            border: 'none',
            outline: 'none',
          }}
        >
          <div className="p-2">
            <div 
              className="mb-2 rounded-lg px-3 py-2"
              style={{
                boxShadow: '0 1px 0 rgba(139, 92, 246, 0.04)',
              }}
            >
              <p className="text-xs text-[var(--color-muted)]">Conectado como</p>
              <p className="text-sm font-semibold text-[#2D2D2D]">{user?.nombre_completo || 'Usuario'}</p>
              <p className="text-xs text-[var(--color-muted)]">{user?.email}</p>
            </div>

            <Link
              to="/app/perfil"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-[var(--color-muted)] transition-colors hover:bg-[var(--color-surface-200)] hover:text-[#2D2D2D]"
            >
              <UserRound size={18} />
              <span>Mi perfil</span>
            </Link>

            <button
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
            >
              <LogOut size={18} />
              <span>{logoutMutation.isPending ? 'Cerrando sesión...' : 'Cerrar sesión'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

