import { RouterProvider, createBrowserRouter } from 'react-router-dom'

import { RequireAuth } from '@/core/auth/RequireAuth'
import { RoleGuard } from '@/core/auth/RoleGuard'
import { AuthLayout } from '@/layout/AuthLayout'
import { DashboardLayout } from '@/layout/DashboardLayout'
import { AuthWelcomePage } from '@/pages/auth/AuthWelcomePage'
import { RegisterStepPage } from '@/pages/auth/RegisterStepPage'
import { RegisterVerifyPage } from '@/pages/auth/RegisterVerifyPage'
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage'
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage'
import { DashboardHome } from '@/pages/dashboard/DashboardHome'
import { ProfilePage } from '@/pages/dashboard/ProfilePage'
import { UsersListPage } from '@/pages/users/UsersListPage'
import { UserDetailPage } from '@/pages/users/UserDetailPage'
import { UserCreatePage } from '@/pages/users/UserCreatePage'
import { PetsListPage } from '@/pages/pets/PetsListPage'
import { PetCreatePage } from '@/pages/pets/PetCreatePage'
import { PetDetailPage } from '@/pages/pets/PetDetailPage'
import { AppointmentsPage } from '@/pages/appointments/AppointmentsPage'
import { AppointmentCreatePage } from '@/pages/appointments/AppointmentCreatePage'
import { AppointmentDetailPage } from '@/pages/appointments/AppointmentDetailPage'
import { HistoriesListPage } from '@/pages/histories/HistoriesListPage'
import { HistoryDetailPage } from '@/pages/histories/HistoryDetailPage'
import { ConsultationsListPage } from '@/pages/consultations/ConsultationsListPage'
import { ConsultationCreatePage } from '@/pages/consultations/ConsultationCreatePage'
import { ConsultationDetailPage } from '@/pages/consultations/ConsultationDetailPage'
import { InventoryListPage } from '@/pages/inventory/InventoryListPage'
import { InventoryCreatePage } from '@/pages/inventory/InventoryCreatePage'
import { InventoryDetailPage } from '@/pages/inventory/InventoryDetailPage'
import { InventoryKardexPage } from '@/pages/inventory/InventoryKardexPage'
import { KardexMovementCreatePage } from '@/pages/inventory/KardexMovementCreatePage'
import { InvoicesListPage } from '@/pages/billing/InvoicesListPage'
import { InvoiceDetailPage } from '@/pages/billing/InvoiceDetailPage'
import { ClinicConfigPage } from '@/pages/clinic-config/ClinicConfigPage'
import { LandingRedirect } from '@/pages/misc/LandingRedirect'
import { NotFoundPage } from '@/pages/misc/NotFoundPage'
import { ConfirmConsentPage } from '@/pages/consultations/ConfirmConsentPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingRedirect />,
  },
  {
    path: '/confirmar-consentimiento',
    element: <ConfirmConsentPage />,
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      { index: true, element: <AuthWelcomePage /> },
      { path: 'register/step', element: <RegisterStepPage /> },
      { path: 'register/verify', element: <RegisterVerifyPage /> },
      { path: 'forgot-password', element: <ForgotPasswordPage /> },
      { path: 'reset-password', element: <ResetPasswordPage /> },
    ],
  },
  {
    path: '/app',
    element: (
      <RequireAuth>
        <DashboardLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <DashboardHome /> },
      { path: 'perfil', element: <ProfilePage /> },
      {
        path: 'usuarios',
        element: (
          <RoleGuard allowedRoles={['administrador']}>
            <UsersListPage />
          </RoleGuard>
        ),
      },
      {
        path: 'usuarios/nuevo',
        element: (
          <RoleGuard allowedRoles={['administrador']}>
            <UserCreatePage />
          </RoleGuard>
        ),
      },
      {
        path: 'usuarios/:id',
        element: (
          <RoleGuard allowedRoles={['administrador']}>
            <UserDetailPage />
          </RoleGuard>
        ),
      },
      { path: 'mascotas', element: <PetsListPage /> },
      { path: 'mascotas/nueva', element: <PetCreatePage /> },
      { path: 'mascotas/:id', element: <PetDetailPage /> },
      { path: 'citas', element: <AppointmentsPage /> },
      { path: 'citas/nueva', element: <AppointmentCreatePage /> },
      { path: 'citas/:id', element: <AppointmentDetailPage /> },
      { path: 'historias', element: <HistoriesListPage /> },
      { path: 'historias/:id', element: <HistoryDetailPage /> },
      { path: 'consultas', element: <ConsultationsListPage /> },
      {
        path: 'consultas/nueva',
        element: (
          <RoleGuard allowedRoles={['administrador', 'veterinario', 'practicante']}>
            <ConsultationCreatePage />
          </RoleGuard>
        ),
      },
      {
        path: 'consultas/:id/editar',
        element: (
          <RoleGuard allowedRoles={['administrador', 'veterinario', 'practicante']}>
            <ConsultationCreatePage />
          </RoleGuard>
        ),
      },
      { path: 'consultas/:id', element: <ConsultationDetailPage /> },
      {
        path: 'inventario',
        element: (
          <RoleGuard allowedRoles={['administrador', 'veterinario', 'recepcionista']}>
            <InventoryListPage />
          </RoleGuard>
        ),
      },
      {
        path: 'inventario/nuevo',
        element: (
          <RoleGuard allowedRoles={['administrador']}>
            <InventoryCreatePage />
          </RoleGuard>
        ),
      },
      {
        path: 'inventario/kardex',
        element: (
          <RoleGuard allowedRoles={['administrador', 'veterinario', 'recepcionista']}>
            <InventoryKardexPage />
          </RoleGuard>
        ),
      },
      {
        path: 'inventario/movimientos/nuevo',
        element: (
          <RoleGuard allowedRoles={['administrador']}>
            <KardexMovementCreatePage />
          </RoleGuard>
        ),
      },
      {
        path: 'inventario/:id',
        element: (
          <RoleGuard allowedRoles={['administrador', 'veterinario', 'recepcionista']}>
            <InventoryDetailPage />
          </RoleGuard>
        ),
      },
      {
        path: 'facturacion',
        element: <InvoicesListPage />,
      },
      {
        path: 'facturacion/:id',
        element: <InvoiceDetailPage />,
      },
      {
        path: 'configuracion',
        element: (
          <RoleGuard allowedRoles={['administrador']}>
            <ClinicConfigPage />
          </RoleGuard>
        ),
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])

export const AppRouter = () => <RouterProvider router={router} />

