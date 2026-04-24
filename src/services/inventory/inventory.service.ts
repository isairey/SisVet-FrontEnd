import { apiClient } from '@/api/httpClient'
import { endpoints } from '@/api/endpoints'
import type {
  InventoryBrand,
  InventoryCategory,
  InventoryProduct,
  InventoryProductPayload,
  ProductsResponse,
  KardexResponse,
  KardexMovement,
  KardexMovementPayload,
} from '@/api/types/inventory'

export interface ProductQueryParams {
  buscador?: string
  categoria?: string
  marca?: string
}

const normalizeProducts = (data: ProductsResponse | unknown): InventoryProduct[] => {
  if (Array.isArray(data)) return data
  if (data && typeof data === 'object' && 'results' in data && Array.isArray(data.results)) {
    return data.results
  }
  console.warn('Unexpected products response format:', data)
  return []
}

const normalizeKardex = (data: KardexResponse) => {
  if (Array.isArray(data)) return data
  if (data?.results) return data.results
  return []
}

const listProducts = async (params: ProductQueryParams = {}) => {
  const { data } = await apiClient.get<ProductsResponse>(endpoints.inventory.products(), {
    params: {
      buscador: params.buscador,
      categoria: params.categoria,
      marca: params.marca,
    },
  })
  return normalizeProducts(data)
}

const productDetail = async (id: number | string) => {
  const { data } = await apiClient.get<InventoryProduct>(endpoints.inventory.productDetail(id))
  return data
}

const createProduct = async (payload: InventoryProductPayload) => {
  const { data } = await apiClient.post<InventoryProduct>(endpoints.inventory.products(), payload)
  return data
}

const updateProduct = async (id: number | string, payload: InventoryProductPayload) => {
  const { data } = await apiClient.put<InventoryProduct>(endpoints.inventory.productDetail(id), payload)
  return data
}

const deactivateProduct = async (id: number | string) => {
  await apiClient.delete(endpoints.inventory.productDetail(id))
}

const listCategories = async () => {
  const { data } = await apiClient.get<InventoryCategory[] | { results: InventoryCategory[] }>(
    endpoints.inventory.categories(),
  )
  if (Array.isArray(data)) return data
  if (data && Array.isArray((data as any).results)) return (data as any).results
  return []
}

const listBrands = async () => {
  const { data } = await apiClient.get<InventoryBrand[] | { results: InventoryBrand[] }>(endpoints.inventory.brands())
  if (Array.isArray(data)) return data
  if (data && Array.isArray((data as any).results)) return (data as any).results
  return []
}

const listKardex = async (buscador?: string) => {
  const { data } = await apiClient.get<KardexResponse>(endpoints.inventory.kardex(), {
    params: { buscador },
  })
  return normalizeKardex(data)
}

const kardexDetail = async (id: number | string) => {
  const { data } = await apiClient.get<KardexMovement>(endpoints.inventory.kardexDetail(id))
  return data
}

const createKardexMovement = async (payload: KardexMovementPayload) => {
  const { data } = await apiClient.post<KardexMovement>(endpoints.inventory.kardex(), payload)
  return data
}

const anularKardexMovement = async (id: number | string) => {
  await apiClient.delete(endpoints.inventory.kardexDetail(id))
}

export const inventoryService = {
  listProducts,
  productDetail,
  createProduct,
  updateProduct,
  deactivateProduct,
  listCategories,
  listBrands,
  listKardex,
  kardexDetail,
  createKardexMovement,
  anularKardexMovement,
}

