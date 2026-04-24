import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useRequestResetMutation } from '@/hooks/auth'

const forgotSchema = z.object({
  email: z.string().email('Correo inválido'),
})

type ForgotValues = z.infer<typeof forgotSchema>

export const ForgotPasswordPage = () => {
  const mutation = useRequestResetMutation()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotValues>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: '' },
  })

  const onSubmit = async (values: ForgotValues) => {
    await mutation.mutateAsync(values)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <p className="text-xs uppercase tracking-[0.4em] text-white/40">Recuperar acceso</p>
        <h2 className="mt-2 text-3xl font-semibold">Solicita un enlace de restablecimiento</h2>
        <p className="text-sm text-white/70">
          Enviaremos un correo con instrucciones. El enlace expira según la configuración del backend.
        </p>
      </div>

      <Input type="email" label="Correo electrónico" {...register('email')} error={errors.email?.message} />

      <Button type="submit" fullWidth disabled={isSubmitting || mutation.isPending}>
        {isSubmitting || mutation.isPending ? 'Enviando...' : 'Enviar instrucciones'}
      </Button>

      <div className="text-center text-sm">
        <Link to="/auth/login" className="text-primary hover:text-primary/80">
          Volver al inicio de sesión
        </Link>
      </div>
    </form>
  )
}

