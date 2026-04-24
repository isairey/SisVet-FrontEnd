import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FileText, PlusCircle, RefreshCw, ChevronRight, Stethoscope, Calendar, Package, X, Plus, Minus } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Spinner } from '@/components/ui/Spinner'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useInvoicesQuery, useInvoiceCreateFromConsultationMutation, useInvoiceCreateFromAppointmentMutation, useInvoiceCreateFromProductsMutation } from '@/hooks/billing'
import { useConsultationsAvailableForInvoiceQuery } from '@/hooks/consultations'
import { useAppointmentsAvailableForInvoiceQuery } from '@/hooks/appointments'
import { useProductsQuery } from '@/hooks/inventory'
import { useUsersQuery } from '@/hooks/users'
import { formatDateTime } from '@/utils/datetime'
import type { Invoice } from '@/api/types/billing'
import { useSessionStore } from '@/core/store/session-store'
import { useDisclosure } from '@/hooks/useDisclosure'

const statusMap: Record<string, { tone: 'success' | 'warning' | 'info' | 'neutral'; label: string }> = {
  PENDIENTE: { tone: 'warning', label: 'Pendiente' },
  PAGADA: { tone: 'success', label: 'Pagada' },
  ANULADA: { tone: 'info', label: 'Anulada' },
}

// Schema para crear factura desde productos
const createFromProductsSchema = z.object({
  cliente_id: z.string().min(1, 'Selecciona un cliente'),
  productos: z
    .array(
      z.object({
        producto_id: z.string().min(1, 'Selecciona un producto'),
        cantidad: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
          message: 'La cantidad debe ser mayor a 0',
        }),
      }),
    )
    .min(1, 'Agrega al menos un producto'),
})

type CreateFromProductsFormValues = z.infer<typeof createFromProductsSchema>

export const InvoicesListPage = () => {
  const navigate = useNavigate()
  const [searchValue, setSearchValue] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('todos')
  const debouncedSearch = useDebouncedValue(searchValue, 500)
  const generateInvoiceModal = useDisclosure()
  const [invoiceSourceType, setInvoiceSourceType] = useState<'consulta' | 'cita' | 'productos'>('consulta')

  const user = useSessionStore((state) => state.user)
  const isClient = user?.roles?.includes('cliente') ?? false

  // Queries para consultas y citas disponibles para facturar (solo cuando el modal está abierto)
  const { data: consultations, isLoading: consultationsLoading, error: consultationsError } = useConsultationsAvailableForInvoiceQuery(generateInvoiceModal.isOpen)
  const { data: appointments, isLoading: appointmentsLoading, error: appointmentsError } = useAppointmentsAvailableForInvoiceQuery(generateInvoiceModal.isOpen)
  
  // Normalizar las listas para asegurar que sean arrays
  const consultationsList = useMemo(() => {
    if (!consultations) return []
    return Array.isArray(consultations) ? consultations : []
  }, [consultations])
  
  const appointmentsList = useMemo(() => {
    if (!appointments) return []
    return Array.isArray(appointments) ? appointments : []
  }, [appointments])
  
  // Query para productos (solo activos)
  const { data: products, isLoading: productsLoading } = useProductsQuery({})
  const filteredProducts = useMemo(() => {
    if (!products) return []
    return products.filter((p) => p.activo && p.stock > 0)
  }, [products])

  // Query para usuarios (clientes) - traer todos los activos y filtrar clientes
  const { data: usersData, isLoading: usersLoading, error: usersError } = useUsersQuery({ 
    search: '', 
    estado: 'activo',
    page: 1,
  })
  
  const clients = useMemo(() => {
    if (!usersData?.results || !Array.isArray(usersData.results)) return []
    
    // Filtrar solo clientes - manejar diferentes formatos de roles
    const filteredClients = usersData.results.filter((u: any) => {
      if (!u.roles) return false
      
      // Si roles es un array
      if (Array.isArray(u.roles)) {
        return u.roles.some((role: any) => {
          if (typeof role === 'string') {
            return role.toLowerCase() === 'cliente'
          }
          if (typeof role === 'object' && role !== null) {
            return role.nombre?.toLowerCase() === 'cliente' || role.id?.toLowerCase() === 'cliente'
          }
          return false
        })
      }
      return false
    })
    
    // Ordenar alfabéticamente por nombre completo
    return filteredClients.sort((a: any, b: any) => {
      const nameA = `${a.nombre || ''} ${a.apellido || ''}`.trim().toLowerCase()
      const nameB = `${b.nombre || ''} ${b.apellido || ''}`.trim().toLowerCase()
      return nameA.localeCompare(nameB)
    })
  }, [usersData])
  
  // Mutations para crear facturas
  const createFromConsultationMutation = useInvoiceCreateFromConsultationMutation()
  const createFromAppointmentMutation = useInvoiceCreateFromAppointmentMutation()
  const createFromProductsMutation = useInvoiceCreateFromProductsMutation()

  // Form para crear factura desde productos
  const productsForm = useForm<CreateFromProductsFormValues>({
    resolver: zodResolver(createFromProductsSchema),
    defaultValues: {
      cliente_id: '',
      productos: [{ producto_id: '', cantidad: '1' }],
    },
  })

  const selectedProducts = productsForm.watch('productos')

  const filters = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      estado: statusFilter !== 'todos' ? statusFilter : undefined,
      cliente: isClient && user?.id ? String(user.id) : undefined,
      ordering: '-fecha',
    }),
    [debouncedSearch, statusFilter, isClient, user?.id],
  )

  const { data, isLoading, isFetching, refetch, error } = useInvoicesQuery(filters)

  const invoices: Invoice[] = data?.results || []


  const handleStatusChange = (status: string) => {
    setStatusFilter(status)
  }

  const handleGenerateFromConsultation = async (consultationId: number) => {
    try {
      const invoice = await createFromConsultationMutation.mutateAsync(consultationId)
      generateInvoiceModal.close()
      navigate(`/app/facturacion/${invoice.id}`)
    } catch (error) {
      // El error ya se maneja en el hook con toast
    }
  }

  const handleGenerateFromAppointment = async (appointmentId: number) => {
    try {
      const invoice = await createFromAppointmentMutation.mutateAsync(appointmentId)
      generateInvoiceModal.close()
      navigate(`/app/facturacion/${invoice.id}`)
    } catch (error) {
      // El error ya se maneja en el hook con toast
    }
  }

  const handleGenerateFromProducts = async (values: CreateFromProductsFormValues) => {
    try {
      // Validar stock antes de enviar
      const stockErrors: string[] = []
      values.productos.forEach((item, index) => {
        const product = filteredProducts.find((p) => p.id === Number(item.producto_id))
        if (product) {
          const cantidad = Number(item.cantidad) || 0
          if (cantidad > product.stock) {
            stockErrors.push(`${product.nombre}: cantidad (${cantidad}) excede stock disponible (${product.stock})`)
          }
        }
      })

      if (stockErrors.length > 0) {
        toast.error(`Error de stock:\n${stockErrors.join('\n')}`)
        return
      }

      const payload = {
        cliente_id: Number(values.cliente_id),
        productos: values.productos.map((p) => ({
          producto_id: Number(p.producto_id),
          cantidad: Number(p.cantidad),
        })),
      }
      
      await createFromProductsMutation.mutateAsync(payload)
      
      // Mostrar mensaje de éxito
      toast.success('Factura creada correctamente')
      
      // Cerrar modal y resetear formulario
      generateInvoiceModal.close()
      productsForm.reset()
      
      // Redireccionar a la lista de facturas
      navigate('/app/facturacion')
    } catch (error: any) {
      // El error ya se maneja en el hook con toast
      console.error('Error al crear factura desde productos:', error)
    }
  }

  const addProductRow = () => {
    productsForm.setValue('productos', [...selectedProducts, { producto_id: '', cantidad: '1' }])
  }

  const removeProductRow = (index: number) => {
    if (selectedProducts.length > 1) {
      const newProducts = selectedProducts.filter((_, i) => i !== index)
      productsForm.setValue('productos', newProducts)
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-label">Facturación</p>
          <h1 className="text-3xl font-semibold text-heading">Gestión de facturas</h1>
          <p className="text-description">
            {isClient
              ? 'Visualiza tus facturas y realiza pagos'
              : 'Administra facturas, pagos y recibos del sistema'}
          </p>
        </div>
        <div className="flex gap-3">
          {!isClient && (
            <Button
              variant="primary"
              onClick={generateInvoiceModal.open}
              startIcon={<PlusCircle size={18} />}
            >
              Generar factura
            </Button>
          )}
          <Button variant="ghost" onClick={() => refetch()} startIcon={<RefreshCw size={16} className="text-black" />}>
            Refrescar
          </Button>
        </div>
      </header>

      <section className="rounded-3xl bg-surface p-5" style={{ boxShadow: 'var(--shadow-card)' }}>
        <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
          <Input
            label="Buscar"
            placeholder="Buscar por número, cliente..."
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
          />
          <label className="space-y-2 text-sm text-primary">
            <span>Estado</span>
            <select
              className="w-full rounded-lg border border-[var(--border-subtle-color)] bg-[var(--color-surface-200)] px-4 py-2 text-base text-primary transition-all focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/30"
              style={{
                borderWidth: 'var(--border-subtle-width)',
                borderStyle: 'var(--border-subtle-style)',
              }}
              value={statusFilter}
              onChange={(event) => handleStatusChange(event.target.value)}
            >
              <option value="todos">Todos los estados</option>
              <option value="PENDIENTE">Pendiente</option>
              <option value="PAGADA">Pagada</option>
              <option value="ANULADA">Anulada</option>
            </select>
          </label>
        </div>
      </section>

      <section className="rounded-3xl bg-surface p-5" style={{ boxShadow: 'var(--shadow-card)' }}>
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-4 text-red-800">
            <p className="font-medium">Error al cargar facturas</p>
            <p className="text-sm">
              {error instanceof Error ? error.message : typeof error === 'string' ? error : 'Error desconocido'}
            </p>
            {error && typeof error === 'object' && 'response' in error && (
              <pre className="mt-2 text-xs overflow-auto">
                {JSON.stringify((error as any).response?.data, null, 2)}
              </pre>
            )}
          </div>
        )}
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Spinner size="lg" />
          </div>
        ) : invoices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left">
              <thead>
                <tr className="text-sm uppercase tracking-wide text-subtle">
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--border-subtle-color)' }}>
                {invoices.map((invoice) => {
                  const status = statusMap[invoice.estado] || { tone: 'neutral' as const, label: invoice.estado }
                  return (
                    <tr
                      key={invoice.id}
                      className="text-sm text-secondary hover:bg-[var(--color-surface-200)]/50 transition-colors"
                    >
                      <td className="px-4 py-3 text-primary">
                        <span className="font-medium text-[var(--color-text-heading)]">
                          {invoice.cliente_nombre || (typeof invoice.cliente === 'string' ? invoice.cliente : `Cliente #${invoice.cliente}`)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-primary">{formatDateTime(invoice.fecha)}</td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-heading">
                          ${typeof invoice.total === 'number' ? invoice.total.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : Number(invoice.total || 0).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={status.tone}>{status.label}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button asChild variant="ghost" startIcon={<ChevronRight size={16} className="text-[var(--color-text-heading)]" />}>
                          <Link to={`/app/facturacion/${invoice.id}`}>Ver detalle</Link>
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[var(--border-subtle-color)] px-6 py-12 text-center text-secondary" style={{ borderWidth: 'var(--border-subtle-width)', borderStyle: 'dashed' }}>
            <FileText size={48} className="mx-auto mb-4 text-[var(--color-muted)] opacity-40" />
            <p className="text-lg font-medium text-heading">No hay facturas registradas</p>
            <p className="text-sm text-secondary mt-2">
              {isClient ? 'No tienes facturas pendientes' : 'Comienza creando una nueva factura'}
            </p>
            {!isLoading && data && data.count === 0 && (
              <p className="text-xs text-[var(--color-text-muted)] mt-4">
                Total de facturas: {data.count}
              </p>
            )}
          </div>
        )}

        {isFetching && !isLoading && (
          <div className="mt-4 flex justify-center">
            <Spinner size="sm" />
          </div>
        )}
      </section>

      {/* Modal para generar factura */}
      <Modal
        isOpen={generateInvoiceModal.isOpen}
        onClose={() => {
          generateInvoiceModal.close()
          productsForm.reset()
          setInvoiceSourceType('consulta')
        }}
        title="Generar factura"
        size="lg"
      >
        <div className="space-y-6">
          {/* Selector de tipo */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-heading)] mb-2">
              Seleccionar origen
            </label>
            <div className="grid grid-cols-3 gap-3">
              <Button
                variant={invoiceSourceType === 'consulta' ? 'primary' : 'ghost'}
                onClick={() => {
                  setInvoiceSourceType('consulta')
                  productsForm.reset()
                }}
                startIcon={<Stethoscope size={16} />}
                className="w-full"
              >
                Desde consulta
              </Button>
              <Button
                variant={invoiceSourceType === 'cita' ? 'primary' : 'ghost'}
                onClick={() => {
                  setInvoiceSourceType('cita')
                  productsForm.reset()
                }}
                startIcon={<Calendar size={16} />}
                className="w-full"
              >
                Desde cita
              </Button>
              <Button
                variant={invoiceSourceType === 'productos' ? 'primary' : 'ghost'}
                onClick={() => {
                  setInvoiceSourceType('productos')
                  productsForm.reset({
                    cliente_id: '',
                    productos: [{ producto_id: '', cantidad: '1' }],
                  })
                }}
                startIcon={<Package size={16} />}
                className="w-full"
              >
                Desde productos
              </Button>
            </div>
          </div>

          {/* Lista de consultas */}
          {invoiceSourceType === 'consulta' && (
            <div>
              <h3 className="text-lg font-semibold text-[var(--color-text-heading)] mb-4">
                Selecciona una consulta
              </h3>
              {consultationsLoading ? (
                <div className="flex justify-center py-10">
                  <Spinner size="lg" />
                </div>
              ) : consultationsError ? (
                <div className="text-center py-10 text-red-600">
                  <Stethoscope size={48} className="mx-auto mb-4 opacity-40" />
                  <p>Error al cargar consultas disponibles</p>
                  <p className="text-sm mt-2">Por favor, intenta nuevamente</p>
                </div>
              ) : consultationsList.length === 0 ? (
                <div className="text-center py-10 text-[var(--color-text-muted)]">
                  <Stethoscope size={48} className="mx-auto mb-4 opacity-40" />
                  <p>No hay consultas disponibles para facturar</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {consultationsList.map((consultation) => (
                    <Card
                      key={consultation.id}
                      className="p-4 hover:bg-[var(--color-surface-200)] transition-colors cursor-pointer"
                      onClick={() => handleGenerateFromConsultation(consultation.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-[var(--color-text-heading)]">
                              Consulta #{consultation.id}
                            </h4>
                            <Badge tone="info">{consultation.total_prescripciones} prescripción(es)</Badge>
                          </div>
                          <p className="text-sm text-[var(--color-text-secondary)] mb-1">
                            <span className="font-medium">Mascota:</span> {consultation.mascota_nombre}
                          </p>
                          <p className="text-sm text-[var(--color-text-secondary)] mb-1">
                            <span className="font-medium">Veterinario:</span> {consultation.veterinario_nombre}
                          </p>
                          <p className="text-sm text-[var(--color-text-secondary)]">
                            <span className="font-medium">Fecha:</span> {formatDateTime(consultation.fecha_consulta)}
                          </p>
                          {consultation.diagnostico && (
                            <p className="text-sm text-[var(--color-text-muted)] mt-2">
                              <span className="font-medium">Diagnóstico:</span> {consultation.diagnostico}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleGenerateFromConsultation(consultation.id)
                          }}
                          disabled={createFromConsultationMutation.isPending}
                        >
                          {createFromConsultationMutation.isPending ? 'Generando...' : 'Generar'}
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Lista de citas */}
          {invoiceSourceType === 'cita' && (
            <div>
              <h3 className="text-lg font-semibold text-[var(--color-text-heading)] mb-4">
                Selecciona una cita
              </h3>
              {appointmentsLoading ? (
                <div className="flex justify-center py-10">
                  <Spinner size="lg" />
                </div>
              ) : appointmentsError ? (
                <div className="text-center py-10 text-red-600">
                  <Calendar size={48} className="mx-auto mb-4 opacity-40" />
                  <p>Error al cargar citas disponibles</p>
                  <p className="text-sm mt-2">Por favor, intenta nuevamente</p>
                </div>
              ) : appointmentsList.length === 0 ? (
                <div className="text-center py-10 text-[var(--color-text-muted)]">
                  <Calendar size={48} className="mx-auto mb-4 opacity-40" />
                  <p>No hay citas disponibles para facturar</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {appointmentsList.map((appointment) => (
                    <Card
                      key={appointment.id}
                      className="p-4 hover:bg-[var(--color-surface-200)] transition-colors cursor-pointer"
                      onClick={() => handleGenerateFromAppointment(appointment.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-[var(--color-text-heading)]">
                              Cita #{appointment.id}
                            </h4>
                            <Badge
                              tone={
                                appointment.estado === 'COMPLETADA'
                                  ? 'success'
                                  : appointment.estado === 'CANCELADA'
                                  ? 'info'
                                  : 'warning'
                              }
                            >
                              {appointment.estado}
                            </Badge>
                          </div>
                          <p className="text-sm text-[var(--color-text-secondary)] mb-1">
                            <span className="font-medium">Mascota:</span> {appointment.mascota_nombre}
                          </p>
                          <p className="text-sm text-[var(--color-text-secondary)] mb-1">
                            <span className="font-medium">Servicio:</span> {appointment.servicio_nombre || 'Sin servicio'}
                          </p>
                          {appointment.veterinario_nombre && (
                            <p className="text-sm text-[var(--color-text-secondary)] mb-1">
                              <span className="font-medium">Veterinario:</span> {appointment.veterinario_nombre}
                            </p>
                          )}
                          <p className="text-sm text-[var(--color-text-secondary)]">
                            <span className="font-medium">Fecha:</span> {formatDateTime(appointment.fecha_hora)}
                          </p>
                        </div>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleGenerateFromAppointment(appointment.id)
                          }}
                          disabled={createFromAppointmentMutation.isPending || !appointment.servicio_nombre}
                        >
                          {createFromAppointmentMutation.isPending ? 'Generando...' : 'Generar'}
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Formulario para crear factura desde productos */}
          {invoiceSourceType === 'productos' && (
            <form onSubmit={productsForm.handleSubmit(handleGenerateFromProducts)} className="space-y-4">
              {/* Selector de cliente */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-[var(--color-text-heading)]">
                  Cliente <span className="text-red-500">*</span>
                </label>
                {usersLoading ? (
                  <div className="flex justify-center py-4">
                    <Spinner size="sm" />
                  </div>
                ) : (
                  <div className="relative">
                    <select
                      className="w-full appearance-none rounded-lg border bg-white px-3 py-2.5 text-sm text-[var(--color-text-primary)] transition-all focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
                      style={{
                        borderWidth: 'var(--border-subtle-width)',
                        borderStyle: 'var(--border-subtle-style)',
                        borderColor: 'var(--border-subtle-color)',
                        paddingRight: '2rem',
                        cursor: 'pointer',
                      }}
                      value={productsForm.watch('cliente_id') || ''}
                      onChange={(e) => {
                        const value = e.target.value
                        productsForm.setValue('cliente_id', value, { shouldValidate: true })
                      }}
                    >
                      <option value="" disabled>
                        Selecciona un cliente
                      </option>
                      {clients.length > 0 ? (
                        clients.map((client) => (
                          <option key={client.id} value={String(client.id)}>
                            {client.nombre} {client.apellido} - {client.email}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>
                          No hay clientes disponibles
                        </option>
                      )}
                    </select>
                    {/* Icono de flecha */}
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                      <svg
                        className="h-4 w-4 text-[var(--color-text-secondary)]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                )}
                {productsForm.formState.errors.cliente_id && (
                  <p className="mt-1 text-xs font-medium text-red-600">
                    {productsForm.formState.errors.cliente_id.message}
                  </p>
                )}
                {usersError && (
                  <p className="mt-1 text-xs font-medium text-red-600">
                    Error al cargar clientes. Por favor, intenta nuevamente.
                  </p>
                )}
                {!usersLoading && !usersError && clients.length === 0 && (
                  <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                    No hay clientes activos disponibles. Por favor, crea un cliente primero.
                  </p>
                )}
                {!usersLoading && !usersError && clients.length > 0 && (
                  <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                    {clients.length} cliente{clients.length !== 1 ? 's' : ''} disponible{clients.length !== 1 ? 's' : ''}
                  </p>
                )}
              </div>

              {/* Lista de productos */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-semibold text-[var(--color-text-heading)]">
                    Productos <span className="text-red-500">*</span>
                  </label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={addProductRow}
                    startIcon={<Plus size={16} />}
                  >
                    Agregar producto
                  </Button>
                </div>

                {/* Tabla/Lista de productos sin cards */}
                <div className="overflow-hidden rounded-xl border border-[var(--border-subtle-color)] bg-white">
                  {/* Encabezados de la tabla */}
                  <div className="grid grid-cols-12 gap-4 border-b border-[var(--border-subtle-color)] bg-[var(--color-surface-200)] px-4 py-3">
                    <div className="col-span-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
                      #
                    </div>
                    <div className="col-span-5 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
                      Producto
                    </div>
                    <div className="col-span-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
                      Cantidad
                    </div>
                    <div className="col-span-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
                      Precio
                    </div>
                    <div className="col-span-1"></div>
                  </div>

                  {/* Lista de productos */}
                  <div className="max-h-[450px] overflow-y-auto">
                    {selectedProducts.map((productItem, index) => {
                      const selectedProduct = filteredProducts.find((p) => p.id === Number(productItem.producto_id))
                      const hasStockError = selectedProduct && Number(productItem.cantidad) > selectedProduct.stock
                      const subtotal = selectedProduct 
                        ? Number(selectedProduct.precio_venta) * Number(productItem.cantidad || 1)
                        : 0

                      return (
                        <div
                          key={index}
                          className={`grid grid-cols-12 gap-4 border-b border-[var(--border-subtle-color)] px-4 py-4 transition-colors last:border-b-0 ${
                            hasStockError ? 'bg-red-50/50' : 'hover:bg-[var(--color-surface-200)]/50'
                          }`}
                        >
                          {/* Número */}
                          <div className="col-span-1 flex items-center">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-primary)]/10 text-sm font-semibold text-[var(--color-primary)]">
                              {index + 1}
                            </div>
                          </div>

                          {/* Selector de producto */}
                          <div className="col-span-5 space-y-1">
                            {productsLoading ? (
                              <div className="flex items-center justify-center py-3">
                                <Spinner size="sm" />
                              </div>
                            ) : (
                              <div className="relative">
                                <select
                                  className={`w-full appearance-none rounded-lg border bg-white px-3 py-2.5 text-sm text-[var(--color-text-primary)] transition-all focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 ${
                                    hasStockError ? 'border-red-300' : 'border-[var(--border-subtle-color)]'
                                  }`}
                                  style={{
                                    borderWidth: 'var(--border-subtle-width)',
                                    borderStyle: 'var(--border-subtle-style)',
                                    paddingRight: '2rem',
                                    cursor: 'pointer',
                                  }}
                                  value={productItem.producto_id}
                                  onChange={(e) => productsForm.setValue(`productos.${index}.producto_id`, e.target.value)}
                                >
                                  <option value="">Selecciona un producto</option>
                                  {filteredProducts.map((product) => (
                                    <option key={product.id} value={String(product.id)}>
                                      {product.nombre}
                                    </option>
                                  ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                  <svg className="h-4 w-4 text-[var(--color-text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </div>
                              </div>
                            )}
                            {selectedProduct && (
                              <div className="flex items-center gap-3 text-xs text-[var(--color-text-secondary)]">
                                <span className="flex items-center gap-1">
                                  <span className="font-medium">Stock:</span>
                                  <span className={`font-semibold ${selectedProduct.stock < 10 ? 'text-orange-600' : 'text-green-600'}`}>
                                    {selectedProduct.stock}
                                  </span>
                                </span>
                              </div>
                            )}
                            {hasStockError && (
                              <p className="text-xs font-medium text-red-600">
                                ⚠️ Stock insuficiente
                              </p>
                            )}
                            {productsForm.formState.errors.productos?.[index]?.producto_id && (
                              <p className="text-xs font-medium text-red-600">
                                {productsForm.formState.errors.productos[index]?.producto_id?.message}
                              </p>
                            )}
                          </div>

                          {/* Control de cantidad */}
                          <div className="col-span-3 space-y-1">
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  const currentQty = Number(productItem.cantidad) || 1
                                  if (currentQty > 1) {
                                    productsForm.setValue(`productos.${index}.cantidad`, String(currentQty - 1))
                                  }
                                }}
                                disabled={Number(productItem.cantidad) <= 1}
                                className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded border border-[var(--border-subtle-color)] bg-white text-[var(--color-text-heading)] transition-all hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 disabled:opacity-40 disabled:cursor-not-allowed"
                                style={{
                                  borderWidth: 'var(--border-subtle-width)',
                                  borderStyle: 'var(--border-subtle-style)',
                                }}
                              >
                                <Minus size={12} />
                              </button>
                              <Input
                                type="number"
                                min="1"
                                max={selectedProduct?.stock || undefined}
                                className="flex-1 text-center text-base font-bold text-black"
                                value={productItem.cantidad}
                                onChange={(e) => {
                                  const value = e.target.value
                                  if (value && Number(value) > 0) {
                                    productsForm.setValue(`productos.${index}.cantidad`, value)
                                  } else if (value === '') {
                                    productsForm.setValue(`productos.${index}.cantidad`, '1')
                                  }
                                }}
                                style={{ minWidth: '60px' }}
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const currentQty = Number(productItem.cantidad) || 1
                                  const maxQty = selectedProduct?.stock || 999
                                  if (currentQty < maxQty) {
                                    productsForm.setValue(`productos.${index}.cantidad`, String(currentQty + 1))
                                  }
                                }}
                                disabled={selectedProduct ? Number(productItem.cantidad) >= selectedProduct.stock : false}
                                className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded border border-[var(--border-subtle-color)] bg-white text-[var(--color-text-heading)] transition-all hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 disabled:opacity-40 disabled:cursor-not-allowed"
                                style={{
                                  borderWidth: 'var(--border-subtle-width)',
                                  borderStyle: 'var(--border-subtle-style)',
                                }}
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                            {productsForm.formState.errors.productos?.[index]?.cantidad && (
                              <p className="text-xs font-medium text-red-600">
                                {productsForm.formState.errors.productos[index]?.cantidad?.message}
                              </p>
                            )}
                          </div>

                          {/* Precio y subtotal */}
                          <div className="col-span-2 flex flex-col justify-center space-y-1">
                            {selectedProduct ? (
                              <>
                                <span className="text-sm font-medium text-[var(--color-text-secondary)]">
                                  ${Number(selectedProduct.precio_venta).toLocaleString('es-CO', { minimumFractionDigits: 2 })}
                                </span>
                                {subtotal > 0 && (
                                  <span className="text-xs font-semibold text-[var(--color-text-heading)]">
                                    Total: ${subtotal.toLocaleString('es-CO', { minimumFractionDigits: 2 })}
                                  </span>
                                )}
                              </>
                            ) : (
                              <span className="text-sm text-[var(--color-text-muted)]">-</span>
                            )}
                          </div>

                          {/* Botón eliminar */}
                          <div className="col-span-1 flex items-center justify-end">
                            {selectedProducts.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeProductRow(index)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-red-600 transition-all hover:bg-red-50"
                                title="Eliminar producto"
                              >
                                <X size={16} />
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {productsForm.formState.errors.productos && typeof productsForm.formState.errors.productos === 'object' && 'message' in productsForm.formState.errors.productos && (
                  <p className="mt-2 text-xs text-red-600">{productsForm.formState.errors.productos.message as string}</p>
                )}

                {/* Botones */}
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t" style={{ borderColor: 'var(--border-subtle-color)' }}>
                  <Button type="button" variant="ghost" onClick={generateInvoiceModal.close}>
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={createFromProductsMutation.isPending}
                  >
                    {createFromProductsMutation.isPending ? 'Generando...' : 'Generar factura'}
                  </Button>
                </div>
              </div>
            </form>
          )}
        </div>
      </Modal>
    </div>
  )
}

