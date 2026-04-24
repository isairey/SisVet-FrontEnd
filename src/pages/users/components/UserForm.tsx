import { useEffect, useState, useMemo } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { z, type ZodType } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Lock, CheckCircle2, AlertCircle } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Spinner } from '@/components/ui/Spinner'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { useRolesQuery } from '@/hooks/users'
import type { UserCreatePayload, UserUpdatePayload } from '@/api/types/users'

type FormValues = {
  nombre: string
  apellido: string
  email: string
  username: string
  estado: 'activo' | 'inactivo' | 'suspendido'
  roles: string[]
  telefono?: string
  direccion?: string
  password?: string
  password_confirm?: string
  licencia?: string
  especialidad?: string
}

const buildSchema = (mode: 'create' | 'edit'): ZodType<FormValues> =>
  z
    .object({
      nombre: z.string().min(2, 'Requerido'),
      apellido: z.string().min(2, 'Requerido'),
      email: z.string().email('Correo inválido'),
      username: z.string().min(3, 'Mínimo 3 caracteres'),
      estado: z.enum(['activo', 'inactivo', 'suspendido']),
      roles: z.array(z.string()).min(1, 'Selecciona al menos un rol'),
      telefono: z.string().optional(),
      direccion: z.string().optional(),
      password: z.string().optional(),
      password_confirm: z.string().optional(),
      licencia: z.string().optional(),
      especialidad: z.string().optional(),
    })
    .superRefine((values, ctx) => {
      const requiresPassword = mode === 'create'
      if (requiresPassword && !values.password) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Requerido', path: ['password'] })
      }
      if (requiresPassword && !values.password_confirm) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Requerido', path: ['password_confirm'] })
      }
      if ((values.password || values.password_confirm) && values.password !== values.password_confirm) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Las contraseñas no coinciden', path: ['password_confirm'] })
      }
      if (values.password && values.password.length < 6) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Mínimo 6 caracteres', path: ['password'] })
      }
      if (values.password_confirm && values.password_confirm.length < 6) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Mínimo 6 caracteres', path: ['password_confirm'] })
      }
      // Validar que si se selecciona rol veterinario, se requiera licencia y especialidad
      if (values.roles.includes('veterinario')) {
        if (!values.licencia || values.licencia.trim() === '') {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'La licencia es requerida para veterinarios', path: ['licencia'] })
        }
        if (!values.especialidad || values.especialidad.trim() === '') {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'La especialidad es requerida para veterinarios', path: ['especialidad'] })
        }
      }
    }) as ZodType<FormValues>

interface UserFormProps {
  mode: 'create' | 'edit'
  initialValues?: Partial<FormValues>
  onSubmit: (payload: UserCreatePayload | UserUpdatePayload) => Promise<unknown> | unknown
  isSubmitting?: boolean
}

export const UserForm = ({ mode, initialValues, onSubmit, isSubmitting }: UserFormProps) => {
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)

  const schema = buildSchema(mode)
  const resolver = zodResolver(schema as any) as Resolver<FormValues>
  const form = useForm<FormValues>({
    resolver,
    defaultValues: {
      nombre: '',
      apellido: '',
      username: '',
      email: '',
      estado: 'activo',
      roles: ['cliente'],
      telefono: '',
      direccion: '',
      password: '',
      password_confirm: '',
      licencia: '',
      especialidad: '',
      ...initialValues,
    },
  })

  const { data: roles, isLoading: rolesLoading } = useRolesQuery()

  // Indicador de fortaleza de contraseña
  const password = form.watch('password')
  const passwordConfirm = form.watch('password_confirm')

  const passwordStrength = useMemo(() => {
    if (!password) return 0
    let strength = 0
    if (password.length >= 6) strength += 1
    if (password.length >= 10) strength += 1
    if (/[A-Z]/.test(password)) strength += 1
    if (/[0-9]/.test(password)) strength += 1
    if (/[^A-Za-z0-9]/.test(password)) strength += 1
    return strength
  }, [password])

  const passwordsMatch = useMemo(() => {
    if (!password || !passwordConfirm) return null
    return password === passwordConfirm
  }, [password, passwordConfirm])

  useEffect(() => {
    if (initialValues) {
      form.reset({
        roles: ['cliente'],
        estado: initialValues.estado ?? 'activo',
        licencia: '',
        especialidad: '',
        ...initialValues,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValues])

  // La validación de roles se hace en el schema de Zod, no necesitamos useEffect

  const handleSubmit = form.handleSubmit(async (values) => {
    const payload: UserCreatePayload | UserUpdatePayload = {
      nombre: values.nombre,
      apellido: values.apellido,
      email: values.email,
      username: values.username,
      estado: values.estado ?? 'activo',
      roles: values.roles ?? [],
    }

    // Agregar perfil de cliente solo si tiene el rol cliente (campos opcionales)
    if (values.roles.includes('cliente')) {
      payload.perfil_cliente = {
        telefono: values.telefono,
        direccion: values.direccion,
      }
    }

    // Agregar perfil de veterinario si el rol está seleccionado (licencia y especialidad obligatorias)
    if (values.roles.includes('veterinario')) {
      payload.perfil_veterinario = {
        licencia: values.licencia,
        especialidad: values.especialidad,
      }
    }

    if (mode === 'create') {
      ;(payload as UserCreatePayload).password = values.password as string
      ;(payload as UserCreatePayload).password_confirm = values.password_confirm as string
    }

    await onSubmit(payload)
  })

  return (
    <form 
      onSubmit={handleSubmit} 
      className="space-y-6" 
      noValidate
      style={{ position: 'relative', zIndex: 1 }}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Input 
          label="Nombre" 
          placeholder="Nombre del usuario"
          {...form.register('nombre')} 
          error={form.formState.errors.nombre?.message} 
        />
        <Input 
          label="Apellido" 
          placeholder="Apellido del usuario"
          {...form.register('apellido')} 
          error={form.formState.errors.apellido?.message} 
        />
        <Input 
          label="Nombre de usuario" 
          placeholder="username"
          {...form.register('username')} 
          error={form.formState.errors.username?.message} 
        />
        <Input 
          type="email" 
          label="Correo electrónico" 
          placeholder="usuario@correo.com"
          {...form.register('email')} 
          error={form.formState.errors.email?.message} 
        />
        <label className="space-y-2 text-sm text-[var(--color-text-heading)]">
          <span className="font-medium">Estado</span>
          <select
            className="w-full rounded-lg border border-[var(--border-subtle-color)] bg-[var(--color-surface-200)] px-4 py-2 text-base transition-all focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
            style={{
              borderWidth: 'var(--border-subtle-width)',
              borderStyle: 'var(--border-subtle-style)',
              color: '#000000',
            }}
            {...form.register('estado')}
          >
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
            <option value="suspendido">Suspendido</option>
          </select>
        </label>
        <div className="space-y-2 md:col-span-2">
          <p className="text-sm font-medium text-[var(--color-text-heading)]">Roles</p>
          {rolesLoading ? (
            <div className="flex items-center gap-2 py-2">
              <Spinner size="sm" />
              <span className="text-sm text-[var(--color-text-secondary)]">Cargando roles...</span>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {(Array.isArray(roles) ? roles : []).map((rol) => {
                const checked = form.watch('roles')?.includes(rol.nombre)
                return (
                  <label
                    key={rol.id}
                    className={`cursor-pointer rounded-full border px-3 py-1.5 text-sm font-medium transition-all ${
                      checked 
                        ? 'bg-[var(--color-primary)]/20 text-[var(--color-primary)] border-[var(--color-primary)]/40 shadow-sm' 
                        : 'text-[var(--color-text-secondary)] border-[var(--border-subtle-color)] hover:border-[var(--color-primary)]/30 hover:bg-[var(--color-surface-200)]'
                    }`}
                    style={{ 
                      borderWidth: 'var(--border-subtle-width)',
                      borderStyle: 'var(--border-subtle-style)',
                    }}
                  >
                    <input
                      type="checkbox"
                      value={rol.nombre}
                      className="sr-only"
                      checked={checked}
                      onChange={(event) => {
                        const current = form.getValues('roles') ?? []
                        if (event.target.checked) {
                          form.setValue('roles', [...current, rol.nombre], { shouldValidate: true })
                        } else {
                          form.setValue(
                            'roles',
                            current.filter((r) => r !== rol.nombre),
                            { shouldValidate: true },
                          )
                        }
                      }}
                    />
                    {rol.nombre.charAt(0).toUpperCase() + rol.nombre.slice(1)}
                  </label>
                )
              })}
            </div>
          )}
          {form.formState.errors.roles && (
            <p className="text-xs text-red-600 mt-1">{form.formState.errors.roles.message as string}</p>
          )}
        </div>
        
        {/* Campos de perfil cliente - solo mostrar si el rol cliente está seleccionado */}
        {form.watch('roles')?.includes('cliente') && (
          <div className="space-y-4 pt-4 border-t md:col-span-2" style={{ borderColor: 'var(--border-subtle-color)' }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="rounded-lg bg-[var(--color-primary)]/10 p-1.5 text-[var(--color-primary)]">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <h4 className="text-sm font-semibold text-[var(--color-text-heading)]">Perfil de Cliente</h4>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Input 
                label="Teléfono" 
                placeholder="+57 300 000 0000"
                {...form.register('telefono')} 
                error={form.formState.errors.telefono?.message} 
              />
              <Input 
                label="Dirección" 
                placeholder="Dirección completa"
                {...form.register('direccion')} 
                error={form.formState.errors.direccion?.message} 
              />
            </div>
          </div>
        )}

        {/* Campos de perfil veterinario - solo mostrar si el rol veterinario está seleccionado */}
        {form.watch('roles')?.includes('veterinario') && (
          <div className="space-y-4 pt-4 border-t md:col-span-2" style={{ borderColor: 'var(--border-subtle-color)' }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="rounded-lg bg-[var(--color-primary)]/10 p-1.5 text-[var(--color-primary)]">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                  <path d="M2 17l10 5 10-5"></path>
                  <path d="M2 12l10 5 10-5"></path>
                </svg>
              </div>
              <h4 className="text-sm font-semibold text-[var(--color-text-heading)]">Perfil de Veterinario</h4>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Input 
                label="Licencia *" 
                placeholder="Número de licencia veterinaria"
                {...form.register('licencia')} 
                error={form.formState.errors.licencia?.message} 
              />
              <Input 
                label="Especialidad *" 
                placeholder="Ej: Cirugía, Medicina interna, etc."
                {...form.register('especialidad')} 
                error={form.formState.errors.especialidad?.message} 
              />
            </div>
          </div>
        )}
      </div>

      {mode === 'create' && (
        <div className="space-y-4 pt-2 border-t" style={{ borderColor: 'var(--border-subtle-color)' }}>
          <div>
            <label className="block text-sm" htmlFor="password">
              <span className="font-medium text-[var(--color-text-heading)] block mb-2">Contraseña</span>
              <div className="relative">
                <div className="pointer-events-none absolute left-3 top-[14px] z-10 flex items-center text-[var(--color-primary)]">
                  <Lock size={18} />
                </div>
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="pl-10 pr-10 relative z-0"
                  placeholder="Mínimo 6 caracteres"
                  {...form.register('password')}
                  error={form.formState.errors.password?.message}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[14px] z-10 flex items-center text-[var(--color-primary)] transition-colors hover:opacity-70"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>
            {password && (
              <div className="mt-2 space-y-2">
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
          </div>

          <div>
            <label className="block text-sm" htmlFor="password_confirm">
              <span className="font-medium text-[var(--color-text-heading)] block mb-2">Confirmar contraseña</span>
              <div className="relative">
                <div className="pointer-events-none absolute left-3 top-[14px] z-10 flex items-center text-[var(--color-primary)]">
                  <Lock size={18} />
                </div>
                <Input
                  id="password_confirm"
                  type={showPasswordConfirm ? 'text' : 'password'}
                  className="pl-10 pr-10 relative z-0"
                  placeholder="Repite la contraseña"
                  {...form.register('password_confirm')}
                  error={form.formState.errors.password_confirm?.message}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                  className="absolute right-3 top-[14px] z-10 flex items-center text-[var(--color-primary)] transition-colors hover:opacity-70"
                  aria-label={showPasswordConfirm ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPasswordConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>
            {passwordConfirm && passwordsMatch !== null && (
              <div className={`mt-2 flex items-center gap-2 text-xs ${passwordsMatch ? 'text-emerald-600' : 'text-red-600'}`}>
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
          </div>
        </div>
      )}

      {initialValues?.estado && (
        <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
          <span>Estado actual:</span> <StatusBadge status={initialValues.estado as 'activo' | 'inactivo' | 'suspendido'} />
        </div>
      )}

      <div className="flex justify-end pt-4 border-t" style={{ borderColor: 'var(--border-subtle-color)' }}>
        <Button type="submit" disabled={form.formState.isSubmitting || Boolean(isSubmitting)} className="min-w-[160px]">
          {form.formState.isSubmitting || isSubmitting ? 'Guardando...' : mode === 'create' ? 'Crear usuario' : 'Guardar cambios'}
        </Button>
      </div>
    </form>
  )
}

