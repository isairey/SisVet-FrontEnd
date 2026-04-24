import { appConfig } from '@/core/config/app-config'

type EndpointBuilder = (path?: string) => string

const withBase =
  (path: string): EndpointBuilder =>
  (suffix = '') =>
    `${appConfig.apiUrl}${path}${suffix}`

export const endpoints = {
  auth: {
    login: withBase('/auth/login/'),
    refresh: withBase('/auth/refresh/'),
    logout: withBase('/auth/logout/'),
    verifyToken: withBase('/auth/verify/'),
    register: withBase('/auth/register/'),
    registerStepOne: withBase('/auth/registro/'),
    registerVerify: withBase('/auth/verificar/'),
    registerResend: withBase('/auth/reenviar-codigo/'),
    profile: withBase('/perfil/'),
    changePassword: withBase('/perfil/cambiar-password/'),
    resetPasswordRequest: withBase('/auth/reset-password/request/'),
    resetPasswordConfirm: withBase('/auth/reset-password/confirm/'),
  },
  users: {
    base: withBase('/usuarios/'),
    detail: (id: number | string) => withBase(`/usuarios/${id}/`)(),
    me: withBase('/usuarios/me/'),
    search: withBase('/usuarios/buscar/'),
    stats: withBase('/usuarios/estadisticas/'),
    activate: (id: number | string) => withBase(`/usuarios/${id}/activar/`)(),
    suspend: (id: number | string) => withBase(`/usuarios/${id}/suspender/`)(),
    changePassword: (id: number | string) => withBase(`/usuarios/${id}/cambiar_password/`)(),
  },
  roles: {
    base: withBase('/roles/'),
    users: (roleId: number | string) => withBase(`/roles/${roleId}/usuarios/`)(),
  },
  pets: {
    base: withBase('/mascotas/'),
    detail: (id: number | string) => withBase(`/mascotas/${id}/`)(),
    species: withBase('/mascotas/especies/'),
    breeds: withBase('/mascotas/razas/'),
  },
  appointments: {
    base: withBase('/citas/'),
    detail: (id: number | string) => withBase(`/citas/${id}/`)(),
    cancel: (id: number | string) => withBase(`/citas/${id}/cancelar/`)(),
    reschedule: (id: number | string) => withBase(`/citas/${id}/reagendar/`)(),
    availability: withBase('/citas/disponibilidad/'),
    services: withBase('/servicios/'),
    availableForInvoice: withBase('/citas/disponibles-para-facturar/'),
  },
  histories: {
    base: withBase('/historias-clinicas/'),
    detail: (id: number | string) => withBase(`/historias-clinicas/${id}/`)(),
    byPet: (petId: number | string) => withBase(`/historias-clinicas/mascota/${petId}/`)(),
    lastConsult: (id: number | string) => withBase(`/historias-clinicas/${id}/ultima-consulta/`)(),
    search: withBase('/historias-clinicas/buscar/'),
    stats: withBase('/historias-clinicas/estadisticas/'),
  },
  consultations: {
    base: withBase('/consultas/'),
    detail: (id: number | string) => withBase(`/consultas/${id}/`)(),
    byPet: (petId: number | string) => withBase(`/consultas/mascota/${petId}/`)(),
    byVet: (vetId: number | string) => withBase(`/consultas/veterinario/${vetId}/`)(),
    consent: (id: number | string) => withBase(`/consultas/${id}/enviar-consentimiento/`)(),
    confirmConsent: withBase('/consultas/confirmar-consentimiento/'),
    stats: withBase('/consultas/estadisticas/'),
    availableForInvoice: withBase('/consultas/disponibles-para-facturar/'),
  },
  inventory: {
    products: withBase('/productos/'),
    productDetail: (id: number | string) => withBase(`/productos/${id}/`)(),
    categories: withBase('/categorias/'),
    brands: withBase('/marcas/'),
    kardex: withBase('/kardex/'),
    kardexDetail: (id: number | string) => withBase(`/kardex/${id}/`)(),
  },
  billing: {
    invoices: withBase('/facturas/'),
    invoiceDetail: (id: number | string) => withBase(`/facturas/${id}/`)(),
    createFromAppointment: (appointmentId: number | string) => withBase(`/facturas/crear-desde-cita/${appointmentId}/`)(),
    createFromConsultation: (consultationId: number | string) => withBase(`/facturas/crear-desde-consulta/${consultationId}/`)(),
    createFromProducts: withBase('/facturas/crear-desde-productos/'),
    payInvoice: (invoiceId: number | string) => withBase(`/facturas/${invoiceId}/pagar/`)(),
    cancelInvoice: (invoiceId: number | string) => withBase(`/facturas/${invoiceId}/anular/`)(),
    sendInvoiceEmail: (invoiceId: number | string) => withBase(`/facturas/${invoiceId}/enviar-email/`)(),
    invoiceReceipt: (invoiceId: number | string) => withBase(`/facturas/${invoiceId}/recibo/`)(),
    payments: withBase('/pagos/'),
    paymentMethods: withBase('/metodos-pago/'),
    financialReports: withBase('/reportes-financieros/'),
  },
  clinicConfig: {
    services: {
      base: withBase('/servicios/'),
      detail: (id: number | string) => withBase(`/servicios/${id}/`)(),
    },
    categories: {
      base: withBase('/categorias/'),
      detail: (id: number | string) => withBase(`/categorias/${id}/`)(),
    },
    brands: {
      base: withBase('/marcas/'),
      detail: (id: number | string) => withBase(`/marcas/${id}/`)(),
    },
    species: {
      base: withBase('/mascotas/especies/'),
    },
    breeds: {
      base: withBase('/mascotas/razas/'),
    },
    paymentMethods: {
      base: withBase('/metodos-pago/'),
    },
  },
}

export type EndpointGroups = typeof endpoints

