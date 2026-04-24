import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

import { UserForm } from '@/pages/users/components/UserForm'
import { useUserCreateMutation } from '@/hooks/users'
import type { UserCreatePayload } from '@/api/types/users'

export const UserCreatePage = () => {
  const mutation = useUserCreateMutation()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between" style={{ position: 'relative', zIndex: 10 }}>
        <div>
          <p className="text-label">Nuevo usuario</p>
          <h1 className="text-3xl font-semibold text-heading">Registro manual</h1>
          <p className="text-description">
            Completa la información y asigna roles/perfiles según corresponda.
          </p>
        </div>
        <Link
          to="/app/usuarios"
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-transparent px-4 py-2 text-sm font-semibold transition-colors bg-transparent text-[var(--color-muted)] hover:text-[#2D2D2D] hover:bg-[var(--color-surface-200)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
          style={{ position: 'relative', zIndex: 100, pointerEvents: 'auto' }}
        >
          <ArrowLeft size={18} className="text-black" />
          Volver
        </Link>
      </div>

      <section className="rounded-3xl bg-surface p-6" style={{ boxShadow: 'var(--shadow-card)' }}>
        <UserForm
          mode="create"
          onSubmit={(payload) => mutation.mutateAsync(payload as UserCreatePayload)}
          isSubmitting={mutation.isPending}
        />
      </section>
    </div>
  )
}

