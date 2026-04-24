import { useMemo } from 'react'
import type { Location } from 'react-router-dom'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useLoginMutation } from '@/hooks/auth'

const loginSchema = z.object({
  username: z.string().min(2, 'Ingresa un usuario válido'),
  password: z.string().min(4, 'La contraseña es requerida'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export const LoginPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const loginMutation = useLoginMutation()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  })

  const redirectPath = useMemo(() => {
    const state = location.state as { from?: Location }
    return state?.from?.pathname ?? '/app'
  }, [location.state])

  const onSubmit = async (values: LoginFormValues) => {
    await loginMutation.mutateAsync(values)
    navigate(redirectPath, { replace: true })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.4em] text-[var(--color-muted)]">Bienvenido</p>
        <h2 className="mt-2 text-3xl font-semibold text-[#2D2D2D]">Inicia sesión</h2>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Autentícate con tus credenciales del backend (JWT). Validamos estados, bloqueos y roles exactamente como la API.
        </p>
      </div>

      <Input label="Usuario" placeholder="correo@sgv.com" {...register('username')} error={errors.username?.message} />

      <Input
        type="password"
        label="Contraseña"
        placeholder="••••••••"
        {...register('password')}
        error={errors.password?.message}
      />

      <Button type="submit" fullWidth disabled={isSubmitting}>
        {isSubmitting ? 'Validando...' : 'Iniciar sesión'}
      </Button>

      <div className="text-center text-sm text-white/70">
        ¿No tienes cuenta?{' '}
        <Link to="/auth/register" className="font-semibold text-primary hover:text-primary/80">
          Registro rápido
        </Link>
        {' • '}
        <Link to="/auth/register/step" className="font-semibold text-primary hover:text-primary/80">
          Registro + verificación
        </Link>
      </div>

      <p className="text-center text-sm">
        <Link to="/auth/forgot-password" className="text-primary hover:text-primary/80">
          ¿Olvidaste tu contraseña?
        </Link>
      </p>
    </form>
  )
}

