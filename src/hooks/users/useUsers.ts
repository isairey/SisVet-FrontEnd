import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSearchParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import type { AxiosError } from 'axios'

import type {
  UserCreatePayload,
  UserDetail,
  UserListResponse,
  UserQueryParams,
  UserStats,
  UserUpdatePayload,
} from '@/api/types/users'
import { userService } from '@/services/users/user.service'
import { roleService } from '@/services/users/role.service'

const useUsersFiltersInternal = () => {
  const [params, setParams] = useSearchParams()

  const filters: UserQueryParams = {
    page: Number(params.get('page') ?? 1),
    search: params.get('q') ?? '',
    estado: (params.get('estado') as UserQueryParams['estado']) ?? 'todos',
    rol: (() => {
      const rolParam = params.get('rol')
      return rolParam && rolParam !== 'todos' ? rolParam : undefined
    })(),
    ordering: params.get('ordering') ?? undefined,
  }

  const updateFilters = (next: Partial<UserQueryParams>) => {
    const newParams = new URLSearchParams(params)
    if (next.page) newParams.set('page', String(next.page))
    if (next.search !== undefined) newParams.set('q', next.search)
    if (next.estado !== undefined) newParams.set('estado', next.estado)
    if (next.rol !== undefined) {
      if (next.rol && next.rol.trim() !== '') {
        newParams.set('rol', next.rol)
      } else {
        newParams.delete('rol')
      }
    }
    if (next.ordering !== undefined) newParams.set('ordering', next.ordering)
    setParams(newParams, { replace: true })
  }

  return { filters, updateFilters }
}

const getError = (error: AxiosError<any>) => {
  if (error.response?.data) {
    const data = error.response.data as Record<string, unknown>
    if (typeof data.detail === 'string') return data.detail
    if (typeof data.message === 'string') return data.message
  }
  return 'Error al procesar la solicitud.'
}

export const useUsersQuery = (filters: UserQueryParams) =>
  useQuery<UserListResponse>({
    queryKey: ['users', filters],
    queryFn: () => userService.list(filters),
    placeholderData: keepPreviousData,
  })

export const useUserDetailQuery = (id?: string) =>
  useQuery<UserDetail>({
    queryKey: ['users', 'detail', id],
    queryFn: () => userService.retrieve(id!),
    enabled: Boolean(id),
  })

export const useUserCreateMutation = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (payload: UserCreatePayload) => userService.create(payload),
    onSuccess: () => {
      toast.success('Usuario creado correctamente')
      queryClient.invalidateQueries({ queryKey: ['users'] })
      navigate('/app/usuarios')
    },
    onError: (error: AxiosError) => toast.error(getError(error)),
  })
}

export const useUserUpdateMutation = (id: number | string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UserUpdatePayload) => userService.update(id, payload),
    onSuccess: (user) => {
      toast.success('Usuario actualizado')
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['users', 'detail', String(id)] })
      return user
    },
    onError: (error: AxiosError) => toast.error(getError(error)),
  })
}

export const useUserDeleteMutation = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (id: number | string) => userService.remove(id),
    onSuccess: () => {
      toast.success('Usuario eliminado')
      queryClient.invalidateQueries({ queryKey: ['users'] })
      navigate('/app/usuarios')
    },
    onError: (error: AxiosError) => toast.error(getError(error)),
  })
}

export const useUserActionMutation = (action: 'activate' | 'suspend') => {
  const queryClient = useQueryClient()
  const service = action === 'activate' ? userService.activate : userService.suspend

  return useMutation({
    mutationFn: (id: number | string) => service(id),
    onSuccess: (_, id) => {
      toast.success(action === 'activate' ? 'Usuario activado' : 'Usuario suspendido')
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['users', 'detail', String(id)] })
    },
    onError: (error: AxiosError) => toast.error(getError(error)),
  })
}

export const useUserStatsQuery = () =>
  useQuery<UserStats>({
    queryKey: ['users', 'stats'],
    queryFn: userService.stats,
  })

export const useUsersFilters = useUsersFiltersInternal

export const useRolesQuery = () =>
  useQuery({
    queryKey: ['roles'],
    queryFn: roleService.list,
    staleTime: 5 * 60 * 1000,
  })

