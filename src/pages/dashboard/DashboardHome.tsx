import { Link } from 'react-router-dom'
import { CalendarDays, ClipboardList, NotebookTabs, PawPrint, Users, PlusCircle, TrendingUp, DollarSign, Clock, UserPlus } from 'lucide-react'
import { useMemo } from 'react'
import dayjs from 'dayjs'

import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { TodayAppointments } from '@/components/dashboard/TodayAppointments'
import { useSessionStore } from '@/core/store/session-store'
import { usePermissions } from '@/hooks/permissions'
import { usePetsQuery } from '@/hooks/pets'
import { useAppointmentsQuery } from '@/hooks/appointments'
import { useConsultationsQuery } from '@/hooks/consultations'
import { useUsersQuery } from '@/hooks/users'
import { useFinancialReportsQuery } from '@/hooks/billing'
import { useHistoriesQuery, useHistoriesStatsQuery } from '@/hooks/histories'
import type { UserListResponse } from '@/api/types/users'
import type { AppointmentSummary } from '@/api/types/appointments'
import { formatDateTime } from '@/utils/datetime'

export const DashboardHome = () => {
  const user = useSessionStore((state) => state.user)
  const { userRoles, isAdmin, navigationItems } = usePermissions()

  // Queries para datos según el rol
  const { data: pets, isLoading: petsLoading } = usePetsQuery({ search: '', especie: null })
  const { data: appointments, isLoading: appointmentsLoading } = useAppointmentsQuery()
  const { data: consultations, isLoading: consultationsLoading } = useConsultationsQuery({})
  const { data: usersData, isLoading: usersLoading } = useUsersQuery({})
  const { data: financialReports, isLoading: reportsLoading } = useFinancialReportsQuery()
  const { data: histories, isLoading: historiesLoading } = useHistoriesQuery({ search: '' })
  const { data: historiesStats, isLoading: historiesStatsLoading, isError: historiesStatsError } = useHistoriesStatsQuery()
  
  // Usar estadísticas si están disponibles, sino usar el conteo del listado
  const historiesCount = useMemo(() => {
    if (historiesStats?.total !== undefined) {
      return historiesStats.total
    }
    if (histories && Array.isArray(histories)) {
      return histories.length
    }
    return null
  }, [historiesStats, histories])
  
  const historiesIsLoading = historiesStatsLoading || (historiesStatsError && historiesLoading)

  // Normalizar datos de usuarios
  const users = Array.isArray(usersData) ? usersData : (usersData as UserListResponse)?.results ?? []

  // Filtrar citas de hoy (para estadísticas)
  const todayAppointments = useMemo(() => {
    if (!appointments || appointments.length === 0) return []
    const today = dayjs().startOf('day')
    return appointments.filter((app: AppointmentSummary) => {
      const appointmentDate = dayjs(app.fecha_hora).startOf('day')
      return appointmentDate.isSame(today)
    })
  }, [appointments])

  // Datos de facturación desde el backend
  const billingData = useMemo(() => {
    if (!financialReports?.resumen) {
      return {
        total: 0,
        ingresosMes: 0,
        ingresosSemana: 0,
        promedio: 0,
        growth: '0',
        todayBilling: 0,
        facturasPagadas: 0,
        facturasPendientes: 0,
        facturasAnuladas: 0,
      }
    }

    const resumen = financialReports.resumen

    // Calcular crecimiento (semana vs mes aproximado)
    const crecimiento = resumen.ingresos_mes_actual > 0 
      ? ((resumen.ingresos_semana_actual / (resumen.ingresos_mes_actual / 4)) - 1) * 100 
      : 0

    return {
      total: resumen.ingresos_totales || 0,
      ingresosMes: resumen.ingresos_mes_actual || 0,
      ingresosSemana: resumen.ingresos_semana_actual || 0,
      promedio: resumen.promedio_factura || 0,
      growth: crecimiento.toFixed(1),
      todayBilling: resumen.ingresos_semana_actual || 0,
      facturasPagadas: resumen.facturas_pagadas || 0,
      facturasPendientes: resumen.facturas_pendientes || 0,
      facturasAnuladas: resumen.facturas_anuladas || 0,
    }
  }, [financialReports])


  // Generar actualizaciones recientes del sistema
  interface UpdateItem {
    type: string
    icon: typeof UserPlus
    message: string
    time: string
    color: string
  }

  const recentUpdates = useMemo(() => {
    const updates: UpdateItem[] = []
    
    // Últimos usuarios registrados
    if (users && users.length > 0) {
      const recentUsers = users.slice(0, 3)
      recentUsers.forEach((u: any) => {
        updates.push({
          type: 'user',
          icon: UserPlus,
          message: `Nuevo usuario registrado: ${u.nombre_completo || u.username}`,
          time: 'Hace unos minutos',
          color: 'text-blue-500',
        })
      })
    }

    // Últimas mascotas registradas
    if (pets && pets.length > 0) {
      const recentPets = pets.slice(0, 2)
      recentPets.forEach((p: any) => {
        updates.push({
          type: 'pet',
          icon: PawPrint,
          message: `Nueva mascota registrada: ${p.nombre}`,
          time: 'Hace unos minutos',
          color: 'text-green-500',
        })
      })
    }

    return updates.slice(0, 5) // Máximo 5 actualizaciones
  }, [users, pets])

  // Determinar el rol principal del usuario
  const primaryRole = isAdmin
    ? 'administrador'
    : userRoles.includes('veterinario')
      ? 'veterinario'
      : userRoles.includes('recepcionista')
        ? 'recepcionista'
        : userRoles.includes('practicante')
          ? 'practicante'
          : userRoles.includes('cliente')
            ? 'cliente'
            : 'usuario'

  const roleLabels: Record<string, string> = {
    administrador: 'Administrador',
    veterinario: 'Veterinario',
    recepcionista: 'Recepcionista',
    practicante: 'Practicante',
    cliente: 'Cliente',
    usuario: 'Usuario',
  }

  // Calcular estadísticas según el rol
  const stats = []
  
  if (isAdmin) {
    // Filtrar solo usuarios activos
    const activeUsers = users.filter((u: any) => u.estado === 'activo')
    
    stats.push(
      {
        label: 'Usuarios activos',
        value: activeUsers ? String(activeUsers.length) : '—',
        icon: Users,
        href: '/app/usuarios',
        isLoading: usersLoading,
        color: 'text-blue-500',
        bgColor: 'bg-blue-500/10',
      },
      {
        label: 'Mascotas registradas',
        value: pets ? String(pets.length) : '—',
        icon: PawPrint,
        href: '/app/mascotas',
        isLoading: petsLoading,
        color: 'text-green-500',
        bgColor: 'bg-green-500/10',
      },
      {
        label: 'Citas agendadas',
        value: appointments ? String(appointments.length) : '—',
        icon: CalendarDays,
        href: '/app/citas',
        isLoading: appointmentsLoading,
        color: 'text-purple-500',
        bgColor: 'bg-purple-500/10',
      },
      {
        label: 'Consultas realizadas',
        value: consultations ? String(consultations.length) : '—',
        icon: ClipboardList,
        href: '/app/consultas',
        isLoading: consultationsLoading,
        color: 'text-orange-500',
        bgColor: 'bg-orange-500/10',
      },
    )
  } else if (userRoles.includes('cliente')) {
    stats.push(
      {
        label: 'Mis mascotas',
        value: pets ? String(pets.length) : '—',
        icon: PawPrint,
        href: '/app/mascotas',
        isLoading: petsLoading,
        color: 'text-green-500',
        bgColor: 'bg-green-500/10',
      },
      {
        label: 'Mis citas',
        value: appointments ? String(appointments.length) : '—',
        icon: CalendarDays,
        href: '/app/citas',
        isLoading: appointmentsLoading,
        color: 'text-purple-500',
        bgColor: 'bg-purple-500/10',
      },
      {
        label: 'Mis consultas',
        value: consultations ? String(consultations.length) : '—',
        icon: ClipboardList,
        href: '/app/consultas',
        isLoading: consultationsLoading,
        color: 'text-orange-500',
        bgColor: 'bg-orange-500/10',
      },
      {
        label: 'Historias clínicas',
        value: historiesCount !== null ? String(historiesCount) : '—',
        icon: NotebookTabs,
        href: '/app/historias',
        isLoading: historiesIsLoading,
        color: 'text-indigo-500',
        bgColor: 'bg-indigo-500/10',
      },
    )
  } else {
    stats.push(
      {
        label: 'Mascotas',
        value: pets ? String(pets.length) : '—',
        icon: PawPrint,
        href: '/app/mascotas',
        isLoading: petsLoading,
        color: 'text-green-500',
        bgColor: 'bg-green-500/10',
      },
      {
        label: 'Citas del día',
        value: todayAppointments ? String(todayAppointments.length) : '—',
        icon: CalendarDays,
        href: '/app/citas',
        isLoading: appointmentsLoading,
        color: 'text-purple-500',
        bgColor: 'bg-purple-500/10',
      },
      {
        label: 'Consultas pendientes',
        value: consultations ? String(consultations.length) : '—',
        icon: ClipboardList,
        href: '/app/consultas',
        isLoading: consultationsLoading,
        color: 'text-orange-500',
        bgColor: 'bg-orange-500/10',
      },
      {
        label: 'Historias clínicas',
        value: historiesCount !== null ? String(historiesCount) : '—',
        icon: NotebookTabs,
        href: '/app/historias',
        isLoading: historiesIsLoading,
        color: 'text-indigo-500',
        bgColor: 'bg-indigo-500/10',
      },
    )
  }

  // Accesos rápidos según el rol
  const quickActions = navigationItems
    .filter((item) => item.href !== '/app') // Excluir inicio
    .slice(0, 6) // Máximo 6 accesos rápidos

  return (
    <div className="space-y-8">
      {/* Bienvenida personalizada */}
      <div>
        <h1 className="text-3xl font-bold text-[var(--color-text-heading)]">
          Bienvenido, {user?.nombre_completo || 'Usuario'}
        </h1>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
          {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Estadísticas - Cards mejoradas y alineadas */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, href, isLoading, color, bgColor }) => (
          <Link key={label} to={href} className="group block">
            <Card
              className="h-full cursor-pointer"
              style={{
                transition: 'all 0.35s cubic-bezier(0.25, 0.1, 0.25, 1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.setProperty('box-shadow', 'var(--shadow-card-hover)')
                e.currentTarget.style.setProperty('transform', 'translateY(-2px)')
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.setProperty('box-shadow', 'var(--shadow-card)')
                e.currentTarget.style.setProperty('transform', 'translateY(0)')
              }}
            >
              <div className="px-5 py-6">
                <div className="flex items-center justify-between mb-4 gap-3">
                  <span className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] font-medium flex-1">
                    {label}
                  </span>
                  <div className={`rounded-xl ${bgColor} p-2.5 flex-shrink-0`}>
                    <Icon className={color} size={18} />
                  </div>
                </div>
                <div className="flex items-baseline">
                  {isLoading ? (
                    <Spinner size="sm" />
                  ) : (
                    <p className="text-3xl font-bold text-[var(--color-text-heading)] group-hover:text-[var(--color-primary)] transition-colors duration-300">
                      {value}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Accesos rápidos - Hover mejorado */}
      <Card
        className="transition-shadow duration-500"
        style={{
          transition: 'box-shadow 0.5s cubic-bezier(0.25, 0.1, 0.25, 1), transform 0.35s cubic-bezier(0.25, 0.1, 0.25, 1)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.setProperty('box-shadow', 'var(--shadow-card-hover)')
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.setProperty('box-shadow', 'var(--shadow-card)')
        }}
        header={
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-[var(--color-text-muted)] font-medium">Acceso rápido</p>
            <h3 className="mt-2 text-xl font-semibold text-[var(--color-text-heading)]">Navega rápidamente</h3>
          </div>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((item) => {
            const Icon = item.icon
            return (
              <Link key={item.href} to={item.href}>
                <div
                  className="group flex items-center gap-3 rounded-xl bg-surface px-4 py-3 cursor-pointer"
                  style={{
                    boxShadow: 'var(--shadow-card)',
                    transition: 'all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.setProperty('box-shadow', 'var(--shadow-soft)')
                    e.currentTarget.style.setProperty('background-color', 'var(--color-surface-200)')
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.setProperty('box-shadow', 'var(--shadow-card)')
                    e.currentTarget.style.setProperty('background-color', 'var(--color-surface)')
                  }}
                >
                  <div className="rounded-lg bg-[var(--color-primary)]/20 p-2 text-[var(--color-primary)] transition-transform duration-300 group-hover:scale-110">
                    <Icon size={20} />
                  </div>
                  <span className="font-medium text-[var(--color-text-secondary)] group-hover:text-[var(--color-primary)] transition-colors">
                    {item.label}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </Card>

      {/* Solo para administrador: Resumen financiero */}
      {isAdmin && (
        <>
          {/* Resumen financiero */}
          <Card
            className="transition-shadow duration-500"
            style={{
              transition: 'box-shadow 0.5s cubic-bezier(0.25, 0.1, 0.25, 1)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.setProperty('box-shadow', 'var(--shadow-card-hover)')
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.setProperty('box-shadow', 'var(--shadow-card)')
            }}
            header={
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-[var(--color-text-muted)] font-medium">Facturación</p>
                <h3 className="mt-2 text-xl font-semibold text-[var(--color-text-heading)]">Resumen financiero</h3>
              </div>
            }
          >
            {reportsLoading ? (
              <div className="flex justify-center py-10">
                <Spinner size="lg" />
              </div>
            ) : (
              <div className="space-y-6">
                {/* Resumen rápido */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-[var(--color-surface-200)] p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign size={18} className="text-green-500" />
                      <span className="text-xs text-[var(--color-text-muted)]">Semana</span>
                    </div>
                    <p className="text-2xl font-bold text-[var(--color-text-heading)]">
                      ${billingData.ingresosSemana.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="rounded-lg bg-[var(--color-surface-200)] p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp size={18} className="text-blue-500" />
                      <span className="text-xs text-[var(--color-text-muted)]">Promedio</span>
                    </div>
                    <p className="text-2xl font-bold text-[var(--color-text-heading)]">
                      ${billingData.promedio.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>

                {/* Estadísticas de facturas */}
                <div className="grid grid-cols-3 gap-3 pt-3 border-t" style={{ borderColor: 'var(--border-subtle-color)' }}>
                  <div className="text-center">
                    <p className="text-xs text-[var(--color-text-muted)] mb-1">Pagadas</p>
                    <p className="text-lg font-bold text-emerald-600">{billingData.facturasPagadas}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-[var(--color-text-muted)] mb-1">Pendientes</p>
                    <p className="text-lg font-bold text-amber-600">{billingData.facturasPendientes}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-[var(--color-text-muted)] mb-1">Anuladas</p>
                    <p className="text-lg font-bold text-red-600">{billingData.facturasAnuladas}</p>
                  </div>
                </div>


                {/* Totales */}
                <div className="pt-3 border-t space-y-2" style={{ borderColor: 'var(--border-subtle-color)' }}>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[var(--color-text-secondary)]">Ingresos del mes:</span>
                    <span className="text-base font-bold text-[var(--color-text-heading)]">
                      ${billingData.ingresosMes.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[var(--color-text-secondary)]">Ingresos totales:</span>
                    <span className="text-base font-bold text-[var(--color-primary)]">
                      ${billingData.total.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Link a facturación */}
                <div className="pt-3 border-t" style={{ borderColor: 'var(--border-subtle-color)' }}>
                  <Button asChild variant="ghost" className="w-full">
                    <Link to="/app/facturacion">
                      Ver todas las facturas
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </>
      )}

      {/* Citas de hoy - Para administrador, veterinario y usuario/cliente */}
      {(isAdmin || userRoles.includes('veterinario') || userRoles.includes('cliente')) && (
        <TodayAppointments />
      )}

      {/* Solo para administrador: Actualizaciones recientes */}
      {isAdmin && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Actualizaciones recientes */}
          <div className="space-y-6">

            <Card
              className="transition-shadow duration-500"
              style={{
                transition: 'box-shadow 0.5s cubic-bezier(0.25, 0.1, 0.25, 1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.setProperty('box-shadow', 'var(--shadow-card-hover)')
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.setProperty('box-shadow', 'var(--shadow-card)')
              }}
              header={
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-[var(--color-text-muted)] font-medium">Sistema</p>
                  <h3 className="mt-2 text-xl font-semibold text-[var(--color-text-heading)]">Actualizaciones recientes</h3>
                </div>
              }
            >
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {recentUpdates.length > 0 ? (
                  recentUpdates.map((update, idx) => {
                    const Icon = update.icon
                    return (
                      <div
                        key={idx}
                        className="flex items-start gap-3 rounded-lg bg-[var(--color-surface-200)] p-3"
                      >
                        <div className={`rounded-lg ${update.color.replace('text-', 'bg-')}/20 p-2 ${update.color}`}>
                          <Icon size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-[var(--color-text-heading)]">{update.message}</p>
                          <p className="text-xs text-[var(--color-text-muted)] mt-1">{update.time}</p>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <p className="text-sm text-center text-[var(--color-text-muted)] py-8">
                    No hay actualizaciones recientes
                  </p>
                )}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Información específica del rol - Cliente */}
      {userRoles.includes('cliente') && (
        <Card
          header={
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-[var(--color-text-muted)] font-medium">Información</p>
              <h3 className="mt-2 text-xl font-semibold text-[var(--color-text-heading)]">Tu información</h3>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg bg-[var(--color-surface-200)] px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-emerald-500/20 p-2 text-emerald-400">
                  <PawPrint size={20} />
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-heading)]">Mascotas registradas</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    {petsLoading ? 'Cargando...' : pets && pets.length > 0 ? `${pets.length} mascota${pets.length !== 1 ? 's' : ''}` : 'No tienes mascotas registradas'}
                  </p>
                </div>
              </div>
              <Button asChild variant="ghost">
                <Link to="/app/mascotas/nueva">
                  <PlusCircle size={16} className="mr-2" />
                  Registrar
                </Link>
              </Button>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-[var(--color-surface-200)] px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-500/20 p-2 text-blue-400">
                  <CalendarDays size={20} />
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-heading)]">Próximas citas</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    {appointmentsLoading ? 'Cargando...' : appointments && appointments.length > 0 ? `${appointments.length} cita${appointments.length !== 1 ? 's' : ''} agendada${appointments.length !== 1 ? 's' : ''}` : 'No tienes citas agendadas'}
                  </p>
                </div>
              </div>
              <Button asChild variant="ghost">
                <Link to="/app/citas/nueva">
                  <PlusCircle size={16} className="mr-2" />
                  Agendar
                </Link>
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
