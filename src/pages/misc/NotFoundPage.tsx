import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/Button'

export const NotFoundPage = () => (
  <div className="flex min-h-[60vh] flex-col items-center justify-center text-center text-white/80">
    <p className="text-sm uppercase tracking-[0.5em] text-white/40">404</p>
    <h1 className="mt-4 text-4xl font-semibold">Página no encontrada</h1>
    <p className="mt-3 max-w-xl text-sm text-white/70">
      Aún estamos construyendo todos los módulos. Verifica la ruta o vuelve al panel para continuar planificando el proyecto.
    </p>
    <div className="mt-6 flex gap-3">
      <Button asChild>
        <Link to="/app">Ir al Dashboard</Link>
      </Button>
      <Button variant="ghost" asChild>
        <Link to="/auth/login">Volver al inicio de sesión</Link>
      </Button>
    </div>
  </div>
)

