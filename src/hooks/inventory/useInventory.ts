import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import type { AxiosError } from 'axios'

import { inventoryService } from '@/services/inventory'
import type { ProductQueryParams } from '@/services/inventory/inventory.service'
import type { InventoryProductPayload, KardexMovementPayload } from '@/api/types/inventory'

/**
 * Extrae mensajes de error legibles para operaciones de inventario.
 */
const getErrorMessage = (error: AxiosError<any>) => {
  const data = error.response?.data
  if (data) {
    if (typeof data.detail === 'string') return data.detail
    if (typeof data.message === 'string') return data.message
    if (typeof data.mensaje === 'string') return data.mensaje
    
    if (Array.isArray(data.mensaje) && data.mensaje.length > 0) {
      return data.mensaje
        .map((msg: string) => msg.replace(/^\['(.+)'\]$/, '$1'))
        .join(', ')
    }
  }
  return 'Ocurrió un error en inventario.'
}

/**
 * Hook para listar productos con soporte de filtrado.
 * La `queryKey` incluye los parámetros de filtro para cachear búsquedas específicas.
 */
export const useProductsQuery = (params: ProductQueryParams = {}) =>
  useQuery({
    queryKey: ['inventory', 'products', params],
    queryFn: () => inventoryService.listProducts(params),
    retry: 1,
  })

/**
 * Obtiene el detalle de un producto específico, incluyendo su stock actual.
 */
export const useProductDetailQuery = (id?: string) =>
  useQuery({
    queryKey: ['inventory', 'product', id],
    queryFn: () => inventoryService.productDetail(id!),
    enabled: Boolean(id),
  })

/**
 * Crea un nuevo producto en el catálogo.
 * Invalida la lista general para mostrar el nuevo ítem.
 */
export const useProductCreateMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: InventoryProductPayload) => inventoryService.createProduct(payload),
    onSuccess: () => {
      toast.success('Producto registrado')
      queryClient.invalidateQueries({ queryKey: ['inventory', 'products'] })
    },
    onError: (error: AxiosError) => toast.error(getErrorMessage(error)),
  })
}

/**
 * Actualiza la información básica de un producto.
 * Refresca tanto la lista general como el detalle individual para evitar datos obsoletos.
 */
export const useProductUpdateMutation = (id: number | string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: InventoryProductPayload) => inventoryService.updateProduct(id, payload),
    onSuccess: () => {
      toast.success('Producto actualizado')
      queryClient.invalidateQueries({ queryKey: ['inventory', 'products'] })
      queryClient.invalidateQueries({ queryKey: ['inventory', 'product', String(id)] })
    },
    onError: (error: AxiosError) => toast.error(getErrorMessage(error)),
  })
}

/**
 * Realiza un borrado lógico (desactivación) del producto.
 */
export const useProductDeactivateMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number | string) => inventoryService.deactivateProduct(id),
    onSuccess: () => {
      toast.success('Producto desactivado')
      queryClient.invalidateQueries({ queryKey: ['inventory', 'products'] })
    },
    onError: (error: AxiosError) => toast.error(getErrorMessage(error)),
  })
}

/**
 * Carga las categorías para selectores. Cache prolongado (10 min).
 */
export const useCategoriesQuery = () =>
  useQuery({
    queryKey: ['inventory', 'categories'],
    queryFn: inventoryService.listCategories,
    staleTime: 10 * 60 * 1000,
  })

/**
 * Carga las marcas para selectores. Cache prolongado (10 min).
 */
export const useBrandsQuery = () =>
  useQuery({
    queryKey: ['inventory', 'brands'],
    queryFn: inventoryService.listBrands,
    staleTime: 10 * 60 * 1000,
  })

/**
 * Consulta el historial de movimientos (Kardex).
 */
export const useKardexQuery = (buscador?: string) =>
  useQuery({
    queryKey: ['inventory', 'kardex', buscador],
    queryFn: () => inventoryService.listKardex(buscador),
  })

export const useKardexDetailQuery = (id?: number | string) =>
  useQuery({
    queryKey: ['inventory', 'kardex', id],
    queryFn: () => inventoryService.kardexDetail(id!),
    enabled: Boolean(id),
  })

/**
 * Registra un movimiento de entrada o salida.
 * * IMPORTANTE:
 * Esta mutación afecta el stock del producto. Por eso invalidamos:
 * 1. 'kardex': Para mostrar el nuevo movimiento en el historial.
 * 2. 'products': Para que la lista de productos refleje el NUEVO STOCK inmediatamente.
 */
export const useKardexCreateMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: KardexMovementPayload) => inventoryService.createKardexMovement(payload),
    onSuccess: () => {
      toast.success('Movimiento registrado correctamente')
      queryClient.invalidateQueries({ queryKey: ['inventory', 'kardex'] })
      queryClient.invalidateQueries({ queryKey: ['inventory', 'products'] }) // Actualiza stock visual
    },
    onError: (error: AxiosError) => toast.error(getErrorMessage(error)),
  })
}

/**
 * Anula un movimiento previo (reversión).
 * Al igual que la creación, esto modifica el stock, por lo que debemos refrescar los productos.
 */
export const useKardexAnularMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number | string) => inventoryService.anularKardexMovement(id),
    onSuccess: () => {
      toast.success('Movimiento anulado correctamente')
      queryClient.invalidateQueries({ queryKey: ['inventory', 'kardex'] })
      queryClient.invalidateQueries({ queryKey: ['inventory', 'products'] }) // Actualiza stock visual
    },
    onError: (error: AxiosError) => toast.error(getErrorMessage(error)),
  })
}