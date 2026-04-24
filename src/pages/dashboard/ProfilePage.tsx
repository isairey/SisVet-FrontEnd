import { useEffect, useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { User, Mail, Phone, MapPin, Lock, Eye, EyeOff, Shield, Calendar, UserCircle, AlertCircle, CheckCircle2, Settings } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { RoleBadge } from '@/components/ui/RoleBadge'
import {
  useChangePasswordMutation,
  useProfileQuery,
  useUpdateProfileMutation,
} from '@/hooks/auth'

const passwordSchema = z
  .object({
    password_actual: z.string().min(6, 'Ingresa tu contraseña actual'),
    password_nueva: z.string().min(6, 'Mínimo 6 caracteres'),
    password_nueva_confirm: z.string().min(6, 'Confirma la contraseña'),
  })
  .refine((values) => values.password_nueva === values.password_nueva_confirm, {
    path: ['password_nueva_confirm'],
    message: 'Las contraseñas no coinciden',
  })

type PasswordValues = z.infer<typeof passwordSchema>

type ProfileFormValues = {
  nombre: string
  apellido: string
  email: string
  telefono?: string | null
  direccion?: string | null
}

export const ProfilePage = () => {
  const { data, isLoading } = useProfileQuery()
  const updateProfileMutation = useUpdateProfileMutation()
  const changePasswordMutation = useChangePasswordMutation()

  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors: profileErrors, isSubmitting: isSavingProfile },
  } = useForm<ProfileFormValues>({
    defaultValues: {
      nombre: '',
      apellido: '',
      email: '',
      telefono: '',
      direccion: '',
    },
  })

  useEffect(() => {
    if (data) {
      reset({
        nombre: data.nombre,
        apellido: data.apellido,
        email: data.email,
        telefono: data.perfil_cliente?.telefono ?? '',
        direccion: data.perfil_cliente?.direccion ?? '',
      })
    }
  }, [data, reset])

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    watch: watchPassword,
    formState: { errors: passwordErrors, isSubmitting: isSavingPassword },
    reset: resetPasswordForm,
  } = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password_actual: '',
      password_nueva: '',
      password_nueva_confirm: '',
    },
  })

  const newPassword = watchPassword('password_nueva')
  const confirmPassword = watchPassword('password_nueva_confirm')
  
  const passwordStrength = useMemo(() => {
    if (!newPassword) return 0
    let strength = 0
    if (newPassword.length >= 6) strength += 1
    if (newPassword.length >= 10) strength += 1
    if (/[A-Z]/.test(newPassword)) strength += 1
    if (/[0-9]/.test(newPassword)) strength += 1
    if (/[^A-Za-z0-9]/.test(newPassword)) strength += 1
    return strength
  }, [newPassword])

  const passwordsMatch = useMemo(() => {
    if (!newPassword || !confirmPassword) return null
    return newPassword === confirmPassword
  }, [newPassword, confirmPassword])

  const onProfileSubmit = async (values: ProfileFormValues) => {
    await updateProfileMutation.mutateAsync({
      nombre: values.nombre,
      apellido: values.apellido,
      email: values.email,
      perfil_cliente: {
        telefono: values.telefono ?? undefined,
        direccion: values.direccion ?? undefined,
      },
    })
  }

  const onPasswordSubmit = async (values: PasswordValues) => {
    await changePasswordMutation.mutateAsync(values)
    resetPasswordForm()
  }

  // Calcular fecha de registro formateada
  const fechaRegistro = useMemo(() => {
    if (!data?.created_at) return null
    return new Date(data.created_at).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }, [data?.created_at])

  if (isLoading || !data) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  const userInitials = `${data.nombre?.[0] || ''}${data.apellido?.[0] || ''}`.toUpperCase() || 'U'

  return (
    <div className="space-y-6">
      {/* Header del perfil mejorado */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[var(--color-accent-lavender)] text-2xl font-bold text-[var(--color-primary)] shadow-lg">
            {userInitials}
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-[var(--color-text-heading)]">
              {data.nombre} {data.apellido}
            </h1>
            <p className="mt-1 flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
              <Mail size={14} />
              {data.email}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {data.roles
                .filter((rol) => rol?.nombre) // Filtrar roles sin nombre
                .map((rol) => (
                  <RoleBadge key={rol.id} role={rol.nombre} />
                ))}
              <StatusBadge status={data.estado as 'activo' | 'inactivo' | 'suspendido'} />
            </div>
          </div>
        </div>
        {fechaRegistro && (
          <Card className="bg-[var(--color-surface-200)]">
            <div className="flex items-center gap-3 p-4">
              <div className="rounded-xl bg-[var(--color-primary)]/20 p-2.5 text-[var(--color-primary)]">
                <Calendar size={18} />
              </div>
              <div>
                <p className="text-xs text-[var(--color-text-muted)]">Miembro desde</p>
                <p className="text-sm font-semibold text-[var(--color-text-heading)]">{fechaRegistro}</p>
              </div>
            </div>
          </Card>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        {/* Sección principal - Información personal */}
        <Card
          header={
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-[var(--color-primary)]/20 p-2.5 text-[var(--color-primary)]">
                <UserCircle size={20} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-[var(--color-text-muted)] font-medium">Configuración</p>
                <h2 className="mt-2 text-xl font-semibold text-[var(--color-text-heading)]">Información personal</h2>
                <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Actualiza tu información de contacto y perfil</p>
              </div>
            </div>
          }
        >
          <form onSubmit={handleSubmit(onProfileSubmit)} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm" htmlFor="nombre">
                  <span className="font-medium text-[var(--color-text-heading)] block mb-2">Nombre</span>
                  <div className="relative">
                    <div className="pointer-events-none absolute left-3 top-[14px] z-10 flex items-center text-[var(--color-primary)]">
                      <User size={18} />
                    </div>
                    <Input
                      id="nombre"
                      className="pl-10 relative z-0"
                      placeholder="Tu nombre"
                      {...register('nombre', { required: 'El nombre es requerido' })}
                      error={profileErrors.nombre?.message}
                    />
                  </div>
                </label>
              </div>

              <div>
                <label className="block text-sm" htmlFor="apellido">
                  <span className="font-medium text-[var(--color-text-heading)] block mb-2">Apellido</span>
                  <div className="relative">
                    <div className="pointer-events-none absolute left-3 top-[14px] z-10 flex items-center text-[var(--color-primary)]">
                      <User size={18} />
                    </div>
                    <Input
                      id="apellido"
                      className="pl-10 relative z-0"
                      placeholder="Tu apellido"
                      {...register('apellido', { required: 'El apellido es requerido' })}
                      error={profileErrors.apellido?.message}
                    />
                  </div>
                </label>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm" htmlFor="email">
                  <span className="font-medium text-[var(--color-text-heading)] block mb-2">Correo electrónico</span>
                  <div className="relative">
                    <div className="pointer-events-none absolute left-3 top-[14px] z-10 flex items-center text-[var(--color-primary)]">
                      <Mail size={18} />
                    </div>
                    <Input
                      id="email"
                      type="email"
                      className="pl-10 relative z-0"
                      placeholder="tu@correo.com"
                      {...register('email', { required: 'El correo es requerido', pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Correo inválido' } })}
                      error={profileErrors.email?.message}
                    />
                  </div>
                </label>
              </div>

              <div>
                <label className="block text-sm" htmlFor="telefono">
                  <span className="font-medium text-[var(--color-text-heading)] block mb-2">Teléfono</span>
                  <div className="relative">
                    <div className="pointer-events-none absolute left-3 top-[14px] z-10 flex items-center text-[var(--color-primary)]">
                      <Phone size={18} />
                    </div>
                    <Input
                      id="telefono"
                      type="tel"
                      className="pl-10 relative z-0"
                      placeholder="+57 300 000 0000"
                      {...register('telefono')}
                      error={profileErrors.telefono?.message}
                    />
                  </div>
                </label>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm" htmlFor="direccion">
                  <span className="font-medium text-[var(--color-text-heading)] block mb-2">Dirección</span>
                  <div className="relative">
                    <div className="pointer-events-none absolute left-3 top-[14px] z-10 flex items-center text-[var(--color-primary)]">
                      <MapPin size={18} />
                    </div>
                    <Input
                      id="direccion"
                      className="pl-10 relative z-0"
                      placeholder="Tu dirección completa"
                      {...register('direccion')}
                      error={profileErrors.direccion?.message}
                    />
                  </div>
                </label>
              </div>
            </div>

            <div className="flex justify-end border-t pt-4" style={{ borderColor: 'var(--border-subtle-color)' }}>
              <Button type="submit" disabled={isSavingProfile || updateProfileMutation.isPending} className="min-w-[160px]">
                {isSavingProfile || updateProfileMutation.isPending ? 'Guardando...' : 'Guardar cambios'}
              </Button>
            </div>
          </form>
        </Card>

        {/* Sección lateral - Información adicional */}
        <div className="space-y-6">
          {/* Información de cuenta */}
          <Card
            header={
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-[var(--color-secondary)]/20 p-2.5 text-[var(--color-secondary)]">
                  <Shield size={18} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-[var(--color-text-muted)] font-medium">Cuenta</p>
                  <h3 className="mt-2 text-lg font-semibold text-[var(--color-text-heading)]">Detalles de cuenta</h3>
                </div>
              </div>
            }
          >
            <div className="space-y-4">
              <div className="rounded-xl bg-[var(--color-surface-200)] p-4">
                <p className="text-xs text-[var(--color-text-muted)] mb-1">Nombre de usuario</p>
                <p className="font-semibold text-[var(--color-text-heading)]">@{data.username}</p>
                <p className="text-xs text-[var(--color-text-secondary)] mt-1">Usado para iniciar sesión</p>
              </div>

              {data.perfil_veterinario && (
                <div className="rounded-xl bg-[var(--color-surface-200)] p-4 space-y-2">
                  <p className="text-xs text-[var(--color-text-muted)] mb-2 font-medium">Perfil Veterinario</p>
                  {data.perfil_veterinario.licencia && (
                    <div>
                      <p className="text-xs text-[var(--color-text-muted)]">Licencia</p>
                      <p className="text-sm font-semibold text-[var(--color-text-heading)]">
                        {data.perfil_veterinario.licencia}
                      </p>
                    </div>
                  )}
                  {data.perfil_veterinario.especialidad && (
                    <div>
                      <p className="text-xs text-[var(--color-text-muted)] mt-2">Especialidad</p>
                      <p className="text-sm font-semibold text-[var(--color-text-heading)]">
                        {data.perfil_veterinario.especialidad}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {data.perfil_practicante && (
                <div className="rounded-xl bg-[var(--color-surface-200)] p-4 space-y-2">
                  <p className="text-xs text-[var(--color-text-muted)] mb-2 font-medium">Perfil Practicante</p>
                  {data.perfil_practicante.universidad && (
                    <div>
                      <p className="text-xs text-[var(--color-text-muted)]">Universidad</p>
                      <p className="text-sm font-semibold text-[var(--color-text-heading)]">
                        {data.perfil_practicante.universidad}
                      </p>
                    </div>
                  )}
                  {data.perfil_practicante.tutor_veterinario && (
                    <div>
                      <p className="text-xs text-[var(--color-text-muted)] mt-2">Tutor</p>
                      <p className="text-sm font-semibold text-[var(--color-text-heading)]">
                        {data.perfil_practicante.tutor_veterinario}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>

          {/* Cambio de contraseña */}
          <Card
            header={
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-[var(--color-accent-pink)]/20 p-2.5 text-[var(--color-accent-pink)]">
                  <Lock size={18} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-[var(--color-text-muted)] font-medium">Seguridad</p>
                  <h3 className="mt-2 text-lg font-semibold text-[var(--color-text-heading)]">Cambiar contraseña</h3>
                </div>
              </div>
            }
          >
            <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm" htmlFor="password_actual">
                  <span className="font-medium text-[var(--color-text-heading)] block mb-2">Contraseña actual</span>
                  <div className="relative">
                    <div className="pointer-events-none absolute left-3 top-[14px] z-10 flex items-center text-[var(--color-primary)]">
                      <Lock size={18} />
                    </div>
                    <Input
                      id="password_actual"
                      type={showCurrentPassword ? 'text' : 'password'}
                      className="pl-10 pr-10 relative z-0"
                      placeholder="••••••••"
                      {...registerPassword('password_actual')}
                      error={passwordErrors.password_actual?.message}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-[14px] z-10 flex items-center text-[var(--color-primary)] transition-colors hover:opacity-70"
                      aria-label={showCurrentPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                      {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </label>
              </div>

              <div>
                <label className="block text-sm" htmlFor="password_nueva">
                  <span className="font-medium text-[var(--color-text-heading)] block mb-2">Nueva contraseña</span>
                  <div className="relative">
                    <div className="pointer-events-none absolute left-3 top-[14px] z-10 flex items-center text-[var(--color-primary)]">
                      <Lock size={18} />
                    </div>
                    <Input
                      id="password_nueva"
                      type={showNewPassword ? 'text' : 'password'}
                      className="pl-10 pr-10 relative z-0"
                      placeholder="••••••••"
                      {...registerPassword('password_nueva')}
                      error={passwordErrors.password_nueva?.message}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-[14px] z-10 flex items-center text-[var(--color-primary)] transition-colors hover:opacity-70"
                      aria-label={showNewPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                      {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </label>
              </div>

              {newPassword && (
                <div className="space-y-2">
                  <div className="w-full bg-[var(--color-surface-200)] rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-300 ${
                        passwordStrength <= 2
                          ? 'w-1/3 bg-red-500'
                          : passwordStrength === 3
                            ? 'w-2/3 bg-yellow-500'
                            : 'w-full bg-emerald-500'
                      }`}
                    ></div>
                  </div>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {passwordStrength <= 2 && 'Contraseña débil'}
                    {passwordStrength === 3 && 'Contraseña moderada'}
                    {passwordStrength >= 4 && 'Contraseña fuerte'}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm" htmlFor="password_nueva_confirm">
                  <span className="font-medium text-[var(--color-text-heading)] block mb-2">Confirmar nueva contraseña</span>
                  <div className="relative">
                    <div className="pointer-events-none absolute left-3 top-[14px] z-10 flex items-center text-[var(--color-primary)]">
                      <Lock size={18} />
                    </div>
                    <Input
                      id="password_nueva_confirm"
                      type={showConfirmPassword ? 'text' : 'password'}
                      className="pl-10 pr-10 relative z-0"
                      placeholder="••••••••"
                      {...registerPassword('password_nueva_confirm')}
                      error={passwordErrors.password_nueva_confirm?.message}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-[14px] z-10 flex items-center text-[var(--color-primary)] transition-colors hover:opacity-70"
                      aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </label>
              </div>

              {confirmPassword && passwordsMatch !== null && (
                <div className={`flex items-center gap-2 text-xs ${passwordsMatch ? 'text-emerald-600' : 'text-red-600'}`}>
                  {passwordsMatch ? (
                    <>
                      <CheckCircle2 size={16} />
                      <span>Las contraseñas coinciden</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle size={16} />
                      <span>Las contraseñas no coinciden</span>
                    </>
                  )}
                </div>
              )}

              <div className="rounded-xl bg-[var(--color-surface-200)] border border-blue-200/50 p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle size={16} className="text-[var(--color-primary)] flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    Asegúrate de usar una contraseña segura con al menos 6 caracteres, incluyendo mayúsculas, números y símbolos.
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button 
                  type="submit" 
                  disabled={isSavingPassword || changePasswordMutation.isPending}
                  className="min-w-[160px] bg-emerald-500 hover:bg-emerald-600 text-white border-0 shadow-lg"
                  style={{
                    backgroundColor: '#10B981',
                    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#059669'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#10B981'
                  }}
                >
                  {isSavingPassword || changePasswordMutation.isPending ? 'Actualizando...' : 'Actualizar contraseña'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  )
}
