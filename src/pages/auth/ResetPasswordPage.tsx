import { useSearchParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Lock, Eye, EyeOff, ArrowLeft, KeyRound, CheckCircle2, Shield } from 'lucide-react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useConfirmResetMutation } from '@/hooks/auth'

const resetSchema = z
  .object({
    password: z.string().min(6, 'Mínimo 6 caracteres'),
    password2: z.string().min(6, 'Confirma tu contraseña'),
  })
  .refine((values) => values.password === values.password2, {
    path: ['password2'],
    message: 'Las contraseñas deben coincidir',
  })

type ResetValues = z.infer<typeof resetSchema>

export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const navigate = useNavigate()
  const mutation = useConfirmResetMutation()
  const [showPassword, setShowPassword] = useState(false)
  const [showPassword2, setShowPassword2] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      password: '',
      password2: '',
    },
  })

  const passwordValue = watch('password')
  const password2Value = watch('password2')

  // Validación de fortaleza de contraseña
  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, label: '', color: '' }
    let strength = 0
    if (password.length >= 6) strength++
    if (password.length >= 8) strength++
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++
    if (/\d/.test(password)) strength++
    if (/[^a-zA-Z\d]/.test(password)) strength++

    if (strength <= 2) return { strength, label: 'Débil', color: 'text-red-500' }
    if (strength <= 3) return { strength, label: 'Media', color: 'text-orange-500' }
    return { strength, label: 'Fuerte', color: 'text-green-500' }
  }

  const passwordStrength = getPasswordStrength(passwordValue || '')

  const onSubmit = async (values: ResetValues) => {
    if (!token) {
      return
    }
    try {
      await mutation.mutateAsync({ ...values, token })
      setIsSuccess(true)
      setTimeout(() => {
        navigate('/auth')
      }, 2000)
    } catch (error) {
      // Error manejado por el hook
    }
  }

  if (!token) {
    return (
      <div className="auth-welcome-container relative h-[calc(100vh-4rem)] w-full overflow-hidden rounded-[var(--radius-card)] bg-surface flex items-center justify-center" style={{ boxShadow: 'var(--shadow-card)' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md px-6 py-8 text-center space-y-6"
        >
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
            <Shield size={40} className="text-red-500" />
          </div>
          <div className="space-y-3">
            <h3 className="text-2xl font-bold text-[var(--color-text-heading)]">Token no válido</h3>
            <p className="text-sm text-[var(--color-text-secondary)]">
              El enlace de recuperación no contiene un token válido o ha expirado. Por favor, solicita uno nuevo.
            </p>
          </div>
          <Button
            onClick={() => navigate('/auth')}
            className="w-full"
          >
            Volver al inicio
          </Button>
        </motion.div>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="auth-welcome-container relative h-[calc(100vh-4rem)] w-full overflow-hidden rounded-[var(--radius-card)] bg-surface flex items-center justify-center" style={{ boxShadow: 'var(--shadow-card)' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md px-6 py-8 text-center space-y-6"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100"
          >
            <CheckCircle2 size={40} className="text-green-500" />
          </motion.div>
          <div className="space-y-3">
            <h3 className="text-2xl font-bold text-[var(--color-text-heading)]">¡Contraseña actualizada!</h3>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Tu contraseña ha sido restablecida correctamente. Serás redirigido al inicio de sesión...
            </p>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div
      className="auth-welcome-container relative h-[calc(100vh-4rem)] w-full overflow-hidden rounded-[var(--radius-card)] bg-surface flex items-center justify-center"
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md px-6 py-8"
      >
        {/* Header con icono */}
        <div className="mb-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-primary)]/20"
          >
            <KeyRound size={32} className="text-[var(--color-primary)]" />
          </motion.div>
          <h2 className="text-3xl font-bold text-[var(--color-text-heading)]">Nueva contraseña</h2>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            Configura una contraseña segura para proteger tu cuenta
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Nueva contraseña */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--color-text-heading)]">
              Nueva contraseña
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-primary)]">
                <Lock size={18} />
              </div>
              <Input
                type={showPassword ? 'text' : 'password'}
                className="pl-10 pr-10"
                placeholder="Ingresa tu nueva contraseña"
                {...register('password')}
                error={errors.password?.message}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-primary)]"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            
            {/* Indicador de fortaleza de contraseña */}
            {passwordValue && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-1"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--color-text-tertiary)]">Fortaleza:</span>
                  <span className={passwordStrength.color}>{passwordStrength.label}</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-surface-200)]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                    transition={{ duration: 0.3 }}
                    className={`h-full ${
                      passwordStrength.strength <= 2
                        ? 'bg-red-500'
                        : passwordStrength.strength <= 3
                          ? 'bg-orange-500'
                          : 'bg-green-500'
                    }`}
                  />
                </div>
              </motion.div>
            )}
          </div>

          {/* Confirmar contraseña */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--color-text-heading)]">
              Confirmar contraseña
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-primary)]">
                <Lock size={18} />
              </div>
              <Input
                type={showPassword2 ? 'text' : 'password'}
                className="pl-10 pr-10"
                placeholder="Confirma tu nueva contraseña"
                {...register('password2')}
                error={errors.password2?.message}
              />
              <button
                type="button"
                onClick={() => setShowPassword2(!showPassword2)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-primary)]"
                aria-label={showPassword2 ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword2 ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            
            {/* Indicador de coincidencia */}
            {password2Value && (
              <AnimatePresence>
                {passwordValue === password2Value ? (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="flex items-center gap-2 text-xs text-green-500"
                  >
                    <CheckCircle2 size={14} />
                    <span>Las contraseñas coinciden</span>
                  </motion.div>
                ) : password2Value.length > 0 ? (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="flex items-center gap-2 text-xs text-red-500"
                  >
                    <span>Las contraseñas no coinciden</span>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            )}
          </div>

          {/* Información de seguridad */}
          <div className="rounded-lg bg-[var(--color-surface-200)] p-3 text-xs text-[var(--color-text-secondary)]">
            <p className="font-medium mb-1.5">Recomendaciones de seguridad:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Mínimo 6 caracteres (recomendado 8 o más)</li>
              <li>Combina mayúsculas, minúsculas y números</li>
              <li>Incluye caracteres especiales para mayor seguridad</li>
            </ul>
          </div>

          {/* Botón de envío */}
          <Button type="submit" fullWidth disabled={isSubmitting || mutation.isPending}>
            {isSubmitting || mutation.isPending ? 'Actualizando...' : 'Actualizar contraseña'}
          </Button>

          {/* Botón para volver */}
          <button
            type="button"
            onClick={() => navigate('/auth')}
            className="flex w-full items-center justify-center gap-2 text-sm text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-primary)]"
          >
            <ArrowLeft size={16} />
            <span>Volver al inicio</span>
          </button>
        </form>
      </motion.div>
    </div>
  )
}
