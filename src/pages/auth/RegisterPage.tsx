import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useRegisterSimpleMutation } from '@/hooks/auth'

const simpleRegisterSchema = z.object({
  nombre: z.string().min(2, 'Ingresa tu nombre'),
  apellido: z.string().min(2, 'Ingresa tu apellido'),
  username: z.string().min(4, 'Mínimo 4 caracteres'),
  email: z.string().email('Correo inválido'),
  telefono: z.string().optional(),
  direccion: z.string().optional(),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  password_confirm: z.string().min(6, 'Confirma tu contraseña'),
}).refine((data) => data.password === data.password_confirm, {
  message: 'Las contraseñas no coinciden',
  path: ['password_confirm'],
})

type SimpleRegisterValues = z.infer<typeof simpleRegisterSchema>

export const RegisterPage = () => {
  const navigate = useNavigate()
  const { mutateAsync, isPending } = useRegisterSimpleMutation()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SimpleRegisterValues>({
    resolver: zodResolver(simpleRegisterSchema),
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

  const onSubmit = async (values: SimpleRegisterValues) => {
    await mutateAsync(values)
    navigate('/auth/login')
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <p className="text-xs uppercase tracking-[0.4em] text-white/40">Registro rápido</p>
        <h2 className="mt-2 text-3xl font-semibold leading-tight">Crea tu cuenta como cliente</h2>
        <p className="text-sm text-white/70">
          Este flujo llama a <code>/auth/register/</code> y deja tu usuario listo para iniciar sesión inmediatamente.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Input label="Nombre" {...register('nombre')} error={errors.nombre?.message} />
        <Input label="Apellido" {...register('apellido')} error={errors.apellido?.message} />
        <Input label="Nombre de usuario" {...register('username')} error={errors.username?.message} />
        <Input type="email" label="Correo electrónico" {...register('email')} error={errors.email?.message} />
        <Input label="Teléfono (opcional)" {...register('telefono')} error={errors.telefono?.message} />
        <Input label="Dirección (opcional)" {...register('direccion')} error={errors.direccion?.message} />
        <Input type="password" label="Contraseña" {...register('password')} error={errors.password?.message} />
        <Input
          type="password"
          label="Confirmar contraseña"
          {...register('password_confirm')}
          error={errors.password_confirm?.message}
        />
      </div>

      <Button type="submit" fullWidth disabled={isSubmitting || isPending}>
        {isSubmitting || isPending ? 'Creando cuenta...' : 'Registrar cliente'}
      </Button>

      <div className="text-center text-sm text-white/70">
        ¿Necesitas verificación por correo?{' '}
        <Link to="/auth/register/step" className="font-semibold text-primary hover:text-primary/80">
          Usa el flujo en dos pasos
        </Link>
      </div>

      <p className="text-center text-sm">
        <Link to="/auth/login" className="text-primary hover:text-primary/80">
          Volver a iniciar sesión
        </Link>
      </p>
    </form>
  )
}

