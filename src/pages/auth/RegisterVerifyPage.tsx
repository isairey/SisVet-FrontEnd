import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useResendCodeMutation, useVerifyCodeMutation } from '@/hooks/auth'

const verifySchema = z.object({
  email: z.string().email('Correo inválido'),
  code: z
    .string()
    .length(6, 'Debe tener 6 dígitos')
    .regex(/^\d+$/, 'Solo números'),
})

type VerifyValues = z.infer<typeof verifySchema>

export const RegisterVerifyPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const verifyMutation = useVerifyCodeMutation()
  const resendMutation = useResendCodeMutation()
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<VerifyValues>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      email: searchParams.get('email') ?? '',
      code: '',
    },
  })

  const emailValue = watch('email')

  const onSubmit = async (values: VerifyValues) => {
    await verifyMutation.mutateAsync(values)
    navigate('/auth/login')
  }

  const handleResend = async () => {
    if (!emailValue) return
    await resendMutation.mutateAsync({ email: emailValue })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <p className="text-xs uppercase tracking-[0.4em] text-white/40">Verificación</p>
        <h2 className="mt-2 text-3xl font-semibold">Introduce el código que llegó a tu correo</h2>
        <p className="text-sm text-white/70">
          Al confirmar, tu cuenta se habilita automáticamente para iniciar sesión.
        </p>
      </div>

      <Input label="Correo" {...register('email')} error={errors.email?.message} />
      <Input label="Código de 6 dígitos" {...register('code')} error={errors.code?.message} />

      <Button 
        type="submit" 
        fullWidth 
        disabled={isSubmitting || verifyMutation.isPending}
        className="bg-[var(--color-secondary)] text-white hover:opacity-90 focus-visible:outline-[var(--color-secondary)]"
      >
        {isSubmitting || verifyMutation.isPending ? 'Verificando...' : 'Confirmar cuenta'}
      </Button>

      <Button
        type="button"
        variant="ghost"
        fullWidth
        disabled={!emailValue || resendMutation.isPending}
        onClick={handleResend}
      >
        {resendMutation.isPending ? 'Reenviando...' : 'Reenviar código'}
      </Button>

      <div className="text-center text-sm">
        <Link to="/auth/login" className="text-primary hover:text-primary/80">
          Volver al inicio de sesión
        </Link>
      </div>
    </form>
  )
}

