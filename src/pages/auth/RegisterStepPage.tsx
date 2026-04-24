import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useRegisterStepMutation } from '@/hooks/auth'

const stepSchema = z
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

type StepValues = z.infer<typeof stepSchema>

export const RegisterStepPage = () => {
  const navigate = useNavigate()
  const mutation = useRegisterStepMutation()
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<StepValues>({
    resolver: zodResolver(stepSchema),
    defaultValues: {
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

  const emailValue = watch('email')

  const onSubmit = async (values: StepValues) => {
    await mutation.mutateAsync(values)
    navigate(`/auth/register/verify?email=${encodeURIComponent(values.email)}`)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <p className="text-xs uppercase tracking-[0.4em] text-white/40">Registro con verificación</p>
        <h2 className="mt-2 text-3xl font-semibold leading-tight">Activa tu cuenta con código de seguridad</h2>
        <p className="text-sm text-white/70">
          Esta ruta usa <code>/auth/registro/</code> y enviará un código de 6 dígitos. Luego, dirígete a la pantalla de
          verificación.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Input label="Nombre" {...register('nombre')} error={errors.nombre?.message} />
        <Input label="Apellido" {...register('apellido')} error={errors.apellido?.message} />
        <Input label="Nombre de usuario" {...register('username')} error={errors.username?.message} />
        <Input type="email" label="Correo" {...register('email')} error={errors.email?.message} />
        <Input label="Teléfono" {...register('telefono')} error={errors.telefono?.message} />
        <Input label="Dirección" {...register('direccion')} error={errors.direccion?.message} />
        <Input type="password" label="Contraseña" {...register('password')} error={errors.password?.message} />
        <Input
          type="password"
          label="Confirmar contraseña"
          {...register('password_confirm')}
          error={errors.password_confirm?.message}
        />
      </div>

      <Button type="submit" fullWidth disabled={isSubmitting || mutation.isPending}>
        {isSubmitting || mutation.isPending ? 'Enviando código...' : 'Registrar y enviar código'}
      </Button>

      <div className="text-center text-sm text-white/70">
        ¿Ya tienes el código?
        {' '}
        <Link
          to={`/auth/register/verify${emailValue ? `?email=${encodeURIComponent(emailValue)}` : ''}`}
          className="font-semibold text-primary hover:text-primary/80"
        >
          Ve a verificar
        </Link>
      </div>

      <p className="text-center text-sm">
        <Link to="/auth/login" className="text-primary hover:text-primary/80">
          Volver al inicio de sesión
        </Link>
      </p>
    </form>
  )
}

