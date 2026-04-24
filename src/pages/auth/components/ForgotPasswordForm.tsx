import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useRequestResetMutation } from '@/hooks/auth'

const forgotSchema = z.object({
  email: z.string().email('Correo inválido'),
})

type ForgotValues = z.infer<typeof forgotSchema>

interface ForgotPasswordFormProps {
  onBack: () => void
}

export const ForgotPasswordForm = ({ onBack }: ForgotPasswordFormProps) => {
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
    <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-5">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-[var(--color-text-heading)]">Recuperar contraseña</h3>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
          Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña
        </p>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-primary)]">
            <Mail size={18} />
          </div>
          <Input
            type="email"
            className="pl-10"
            placeholder="Correo electrónico"
            {...register('email')}
            error={errors.email?.message}
          />
        </div>
      </div>

      <Button type="submit" fullWidth disabled={isSubmitting || mutation.isPending}>
        {isSubmitting || mutation.isPending ? 'Enviando...' : 'Enviar instrucciones'}
      </Button>

      <button
        type="button"
        onClick={onBack}
        className="flex w-full items-center justify-center gap-2 text-sm text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-primary)]"
      >
        <ArrowLeft size={16} />
        <span>Volver al inicio de sesión</span>
      </button>
    </form>
  )
}

