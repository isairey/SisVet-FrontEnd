import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { UserPlus, Mail, Lock, User, Phone, MapPin, Eye, EyeOff } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useRegisterStepMutation } from '@/hooks/auth'
import type { RegisterStepOnePayload } from '@/api/types/auth'

const registerSchema = z
  .object({
    nombre: z.string().min(2, 'Ingresa tu nombre'),
    apellido: z.string().min(2, 'Ingresa tu apellido'),
    username: z.string().min(4, 'Mínimo 4 caracteres'),
    email: z.string().email('Correo inválido'),
    telefono: z.string().optional(),
    direccion: z.string().optional(),
    password: z.string().min(6, 'Mínimo 6 caracteres'),
    password_confirm: z.string().min(6, 'Confirma tu contraseña'),
  })
  .refine((data) => data.password === data.password_confirm, {
    message: 'Las contraseñas no coinciden',
    path: ['password_confirm'],
  })

type RegisterFormValues = z.infer<typeof registerSchema>

interface RegisterFormProps {
  initialData?: RegisterFormValues
  onDataChange?: (data: RegisterFormValues) => void
  onRegisterSuccess?: (email: string) => void
}

export const RegisterForm = ({ initialData, onDataChange, onRegisterSuccess }: RegisterFormProps = {}) => {
  const navigate = useNavigate()
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)
  const mutation = useRegisterStepMutation()

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: initialData || {
      nombre: '',
      apellido: '',
      username: '',
      email: '',
      telefono: '',
      direccion: '',
      password: '',
      password_confirm: '',
    },
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
      const hasInitialValues = Object.values(initialData).some(val => val && typeof val === 'string' && val.trim() !== '')
      const isFormEmpty = !Object.values(watchedValues).some(val => val && typeof val === 'string' && val.trim() !== '')
      
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
          nombre: watchedValues.nombre || '',
          apellido: watchedValues.apellido || '',
          username: watchedValues.username || '',
          email: watchedValues.email || '',
          telefono: watchedValues.telefono || '',
          direccion: watchedValues.direccion || '',
          password: watchedValues.password || '',
          password_confirm: watchedValues.password_confirm || '',
        })
      }, 300) // Debounce de 300ms
      
      return () => clearTimeout(timeoutId)
    }
  }, [watchedValues, onDataChange])

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      // Preparar payload: limpiar datos y siempre incluir campos opcionales (pueden ser strings vacíos)
      const payload: RegisterStepOnePayload = {
        username: values.username.trim(),
        email: values.email.trim().toLowerCase(),
        password: values.password,
        password_confirm: values.password_confirm,
        nombre: values.nombre.trim(),
        apellido: values.apellido.trim(),
        // Siempre incluir campos opcionales (string vacío si no tienen valor)
        telefono: values.telefono?.trim() || '',
        direccion: values.direccion?.trim() || '',
      }
      
      await mutation.mutateAsync(payload)
      // Si hay callback, usarlo; si no, navegar a la página de verificación
      if (onRegisterSuccess) {
        onRegisterSuccess(values.email.trim().toLowerCase())
      } else {
        navigate(`/auth/register/verify?email=${encodeURIComponent(values.email.trim().toLowerCase())}`)
      }
    } catch (error) {
      console.error('Error en registro:', error)
      // El error ya está manejado por la mutación, pero logueamos aquí para debug
    }
  }

  return (
    <form 
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
        <h3 className="text-2xl font-bold text-[var(--color-text-heading)]">Crea tu cuenta</h3>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
          Registro seguro en 2 pasos con verificación
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="relative">
              <div className="pointer-events-none absolute left-3 top-[14px] z-10 text-[var(--color-secondary)]">
                <User size={18} />
              </div>
              <Input
                className="pl-10"
                placeholder="Nombre"
                {...register('nombre')}
                error={errors.nombre?.message}
              />
            </div>
          </div>
          <Input placeholder="Apellido" {...register('apellido')} error={errors.apellido?.message} />
        </div>

        <div>
          <div className="relative">
            <div className="pointer-events-none absolute left-3 top-[14px] z-10 text-[var(--color-secondary)]">
              <User size={18} />
            </div>
            <Input
              className="pl-10"
              placeholder="Nombre de usuario"
              {...register('username')}
              error={errors.username?.message}
            />
          </div>
        </div>

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
            />
          </div>
        </div>

        <div>
          <div className="relative">
            <div className="pointer-events-none absolute left-3 top-[14px] z-10 text-[var(--color-secondary)]">
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
              className="absolute right-3 top-[14px] z-10 text-[var(--color-secondary)] transition-colors hover:opacity-70"
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div>
          <div className="relative">
            <div className="pointer-events-none absolute left-3 top-[14px] z-10 text-[var(--color-secondary)]">
              <Lock size={18} />
            </div>
            <Input
              type={showPasswordConfirm ? 'text' : 'password'}
              className="pl-10 pr-10"
              placeholder="Confirmar contraseña"
              {...register('password_confirm')}
              error={errors.password_confirm?.message}
            />
            <button
              type="button"
              onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
              className="absolute right-3 top-[14px] z-10 text-[var(--color-secondary)] transition-colors hover:opacity-70"
              aria-label={showPasswordConfirm ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showPasswordConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {showAdvanced && (
          <>
            <div>
              <div className="relative">
                <div className="pointer-events-none absolute left-3 top-[14px] z-10 text-[var(--color-secondary)]">
                  <Phone size={18} />
                </div>
                <Input
                  className="pl-10"
                  placeholder="Teléfono (opcional)"
                  {...register('telefono')}
                  error={errors.telefono?.message}
                />
              </div>
            </div>
            <div>
              <div className="relative">
                <div className="pointer-events-none absolute left-3 top-[14px] z-10 text-[var(--color-secondary)]">
                  <MapPin size={18} />
                </div>
                <Input
                  className="pl-10"
                  placeholder="Dirección (opcional)"
                  {...register('direccion')}
                  error={errors.direccion?.message}
                />
              </div>
            </div>
          </>
        )}

        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full text-left text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-secondary)] transition-colors"
        >
          {showAdvanced ? 'Ocultar' : 'Mostrar'} campos opcionales
        </button>
      </div>

      <Button 
        type="submit" 
        fullWidth 
        disabled={isSubmitting || mutation.isPending} 
        startIcon={<UserPlus size={18} />}
        className="bg-[var(--color-secondary)] text-white hover:opacity-90 focus-visible:outline-[var(--color-secondary)]"
      >
        {isSubmitting || mutation.isPending ? 'Creando cuenta...' : 'Registrarse'}
      </Button>

      <p className="text-center text-xs text-[var(--color-text-tertiary)]">
        Al registrarte, recibirás un código de verificación en tu correo
      </p>
    </form>
  )
}

