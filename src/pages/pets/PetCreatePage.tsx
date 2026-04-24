import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/Button'
import { PetForm } from '@/pages/pets/components/PetForm'
import { usePetCreateMutation } from '@/hooks/pets'

export const PetCreatePage = () => {
  const mutation = usePetCreateMutation()

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex-1">
          <p className="text-label">Registrar mascota</p>
          <h1 className="text-3xl font-semibold text-heading">Nueva mascota</h1>
          <p className="text-description">
            Completa la información requerida. Si eres cliente, la mascota quedará asociada a tu perfil.
          </p>
        </div>
        <div className="flex-shrink-0">
          <Button asChild variant="ghost" startIcon={<ArrowLeft size={18} className="text-black" />}>
            <Link to="/app/mascotas">Volver</Link>
          </Button>
        </div>
      </div>

      <section className="rounded-3xl bg-surface p-6" style={{ boxShadow: 'var(--shadow-card)' }}>
        <PetForm mode="create" onSubmit={(payload) => mutation.mutateAsync(payload)} isSubmitting={mutation.isPending} />
      </section>
    </div>
  )
}

