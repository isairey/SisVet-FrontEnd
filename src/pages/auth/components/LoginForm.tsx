import { useState, useMemo, useEffect } from 'react'
import type { Location } from 'react-router-dom'
import { useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { LogIn, Lock, User, Eye, EyeOff } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useLoginMutation } from '@/hooks/auth'
import { ForgotPasswordForm } from './ForgotPasswordForm'

const loginSchema = z.object({
  username: z.string().min(2, 'Ingresa un usuario válido'),
  password: z.string().min(4, 'La contraseña es requerida'),
})

type LoginFormValues = z.infer<typeof loginSchema>

interface LoginFormProps {
  initialData?: { username: string; password: string }
  onDataChange?: (data: { username: string; password: string }) => void
}

export const LoginForm = ({ initialData, onDataChange }: LoginFormProps = {}) => {
  const navigate = useNavigate()
  const location = useLocation()
  const loginMutation = useLoginMutation()
  const [showPassword, setShowPassword] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: initialData || { username: '', password: '' },
  })

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = form

  // Observar cambios en los campos y guardarlos
  const watchedValues = watch()
  
  // Solo resetear cuando hay valores guardados y el formulario está completamente vacío
  useEffect(() => {
    if (initialData) {
      const hasInitialValues = (initialData.username?.trim()) || (initialData.password?.trim())
      const isFormEmpty = !watchedValues.username?.trim() && !watchedValues.password?.trim()
      
      // Solo restaurar si hay valores guardados Y el formulario está vacío
      if (hasInitialValues && isFormEmpty) {
        reset(initialData, { keepDefaultValues: false })
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData])

  // Guardar cambios con debounce para no causar re-renders constantes
  useEffect(() => {
    if (onDataChange) {
      const timeoutId = setTimeout(() => {
        onDataChange({
          username: watchedValues.username || '',
          password: watchedValues.password || '',
        })
      }, 300) // Debounce de 300ms
      
      return () => clearTimeout(timeoutId)
    }
  }, [watchedValues.username, watchedValues.password, onDataChange])

  const redirectPath = useMemo(() => {
    const state = location.state as { from?: Location }
    return state?.from?.pathname ?? '/app'
  }, [location.state])

  const onSubmit = async (values: LoginFormValues) => {
    await loginMutation.mutateAsync(values)
    navigate(redirectPath, { replace: true })
  }

  return (
    <div 
      className="w-full"
      onFocus={(e) => {
        // Prevenir que el formulario se cierre cuando hay focus en inputs
        e.stopPropagation()
      }}
      onBlur={(e) => {
        // Prevenir propagación de blur
        e.stopPropagation()
      }}
    >
      <AnimatePresence mode="wait">
        {showForgotPassword ? (
          <motion.div
            key="forgot-password"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          >
            <ForgotPasswordForm onBack={() => setShowForgotPassword(false)} />
          </motion.div>
        ) : (
          <motion.form
            key="login"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            onSubmit={handleSubmit(onSubmit)}
            className="w-full space-y-5"
          >
            <div className="text-center">
              <h3 className="text-2xl font-bold text-[var(--color-text-heading)]">Inicia sesión</h3>
              <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                Ingresa tus credenciales para acceder
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <div className="relative">
                  <div className="pointer-events-none absolute left-3 top-[14px] z-10 text-[var(--color-primary)]">
                    <User size={18} />
                  </div>
                  <Input
                    className="pl-10"
                    placeholder="Usuario o correo"
                    {...register('username')}
                    error={errors.username?.message}
                  />
                </div>
              </div>

              <div>
                <div className="relative">
                  <div className="pointer-events-none absolute left-3 top-[14px] z-10 text-[var(--color-primary)]">
                    <Lock size={18} />
                  </div>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    className="pl-10 pr-10"
                    placeholder="Contraseña"
                    {...register('password')}
                    error={errors.password?.message}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-[14px] z-10 text-[var(--color-primary)] transition-colors hover:opacity-70"
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <Button type="submit" fullWidth disabled={isSubmitting} startIcon={<LogIn size={18} />}>
              {isSubmitting ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </Button>

            <p className="text-center text-sm">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-primary)]"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </p>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  )
}

