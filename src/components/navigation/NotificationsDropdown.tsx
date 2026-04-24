import { useState, useRef, useEffect } from 'react'
import { Bell } from 'lucide-react'

export const NotificationsDropdown = () => {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const unreadCount = 0 // TODO: Conectar con el módulo de notificaciones

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

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center justify-center rounded-xl bg-[var(--color-surface-200)] p-2.5 transition-all hover:bg-[var(--color-surface)] focus:outline-none"
        style={{
          boxShadow: 'var(--shadow-soft)',
          border: 'none',
          outline: 'none',
        }}
        onFocus={(e) => {
          e.currentTarget.style.outline = 'none'
          e.currentTarget.style.border = 'none'
        }}
        aria-label="Notificaciones"
      >
        <Bell size={20} className="text-[var(--color-muted)]" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-semibold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div 
          className="absolute right-0 top-full z-50 mt-2 w-80 rounded-2xl bg-surface"
          style={{
            boxShadow: 'var(--shadow-elevated)',
            border: 'none',
            outline: 'none',
          }}
        >
          <div className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#2D2D2D]">Notificaciones</h3>
              {unreadCount > 0 && (
                <span className="rounded-full bg-[var(--color-primary)] px-2 py-0.5 text-xs font-semibold text-white">
                  {unreadCount} nuevas
                </span>
              )}
            </div>

            <div className="max-h-96 space-y-2 overflow-y-auto">
              {unreadCount === 0 ? (
                <div className="py-8 text-center">
                  <Bell size={32} className="mx-auto mb-2 text-[var(--color-muted)] opacity-40" />
                  <p className="text-sm text-[var(--color-muted)]">No hay notificaciones nuevas</p>
                </div>
              ) : (
                <div className="py-4 text-center">
                  <p className="text-sm text-[var(--color-muted)]">Las notificaciones estarán disponibles próximamente</p>
                </div>
              )}
            </div>

            {unreadCount > 0 && (
              <button 
                className="mt-3 w-full rounded-lg bg-[var(--color-surface-200)] px-3 py-2 text-xs font-semibold text-[var(--color-muted)] transition-all hover:bg-[var(--color-surface)]"
                style={{
                  boxShadow: 'var(--shadow-soft)',
                }}
              >
                Ver todas las notificaciones
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

