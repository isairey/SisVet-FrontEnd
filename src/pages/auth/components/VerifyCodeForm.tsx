import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, ArrowLeft, CheckCircle2, ShieldCheck } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

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

interface VerifyCodeFormProps {
  email?: string
  onBack: () => void
  onSuccess?: () => void
}

export const VerifyCodeForm = ({ email: initialEmail = '', onBack, onSuccess }: VerifyCodeFormProps) => {
  const [isSuccess, setIsSuccess] = useState(false)
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
      email: initialEmail,
      code: '',
    },
  })

  const emailValue = watch('email')

  const onSubmit = async (values: VerifyValues) => {
    try {
      await verifyMutation.mutateAsync(values)
      setIsSuccess(true)
      toast.success('¡Código verificado exitosamente!')
      setTimeout(() => {
        if (onSuccess) {
          onSuccess()
        }
      }, 2000)
    } catch (error) {
      // Error manejado por el hook
    }
  }

  const handleResend = async () => {
    if (!emailValue) {
      toast.error('Ingresa un correo electrónico')
      return
    }
    try {
      await resendMutation.mutateAsync({ email: emailValue })
      toast.success('Código reenviado a tu correo')
    } catch (error) {
      // Error manejado por el hook
    }
  }

  return (
    <AnimatePresence mode="wait">
      {isSuccess ? (
        <motion.div
          key="success"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          className="w-full space-y-6 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
            className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100"
          >
            <CheckCircle2 size={40} className="text-green-500" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-3"
          >
            <h3 className="text-2xl font-bold text-[var(--color-text-heading)]">¡Cuenta verificada!</h3>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Tu cuenta ha sido verificada exitosamente. Ya puedes iniciar sesión.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="pt-4"
          >
            <div className="flex items-center justify-center gap-2 text-sm text-[var(--color-text-tertiary)]">
              <ShieldCheck size={16} className="text-green-500" />
              <span>Redirigiendo al inicio de sesión...</span>
            </div>
          </motion.div>
        </motion.div>
      ) : (
        <motion.form
          key="form"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          onSubmit={handleSubmit(onSubmit)}
          className="w-full space-y-5"
          onFocus={(e) => {
            e.stopPropagation()
          }}
          onBlur={(e) => {
            e.stopPropagation()
          }}
        >
          <div className="text-center">
            <h3 className="text-2xl font-bold text-[var(--color-text-heading)]">Verificar código</h3>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
              Ingresa el código de 6 dígitos que llegó a tu correo electrónico
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <div className="relative">
                <div className="pointer-events-none absolute left-3 top-[14px] z-10 text-[var(--color-secondary)]">
                  <Mail size={18} />
                </div>
                <Input
                  type="email"
                  className="pl-10"
                  placeholder="Correo electrónico"
                  {...register('email')}
                  error={errors.email?.message}
                  disabled={!!initialEmail}
                />
              </div>
            </div>

            <div>
              <div className="relative">
                <div className="pointer-events-none absolute left-3 top-[14px] z-10 text-[var(--color-secondary)]">
                  <ShieldCheck size={18} />
                </div>
                <Input
                  className="pl-10"
                  placeholder="Código de 6 dígitos"
                  maxLength={6}
                  {...register('code')}
                  error={errors.code?.message}
                />
              </div>
            </div>
          </div>

          <Button 
            type="submit" 
            fullWidth 
            disabled={isSubmitting || verifyMutation.isPending}
            className="bg-[var(--color-secondary)] text-white hover:opacity-90 focus-visible:outline-[var(--color-secondary)]"
          >
            {isSubmitting || verifyMutation.isPending ? 'Verificando...' : 'Verificar código'}
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

          <button
            type="button"
            onClick={onBack}
            className="flex w-full items-center justify-center gap-2 text-sm text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-secondary)]"
          >
            <ArrowLeft size={16} />
            <span>Volver al registro</span>
          </button>
        </motion.form>
      )}
    </AnimatePresence>
  )
}

