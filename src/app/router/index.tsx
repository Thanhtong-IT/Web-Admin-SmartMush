import { createBrowserRouter } from 'react-router-dom'
import { LoginPage } from '../../features/auth/pages/LoginPage'
import { DashboardPage } from '../../features/dashboard/pages/DashboardPage'
import { RoomListPage } from '../../features/rooms/pages/RoomListPage'
import { TrayDetailPage } from '../../features/rooms/pages/TrayDetailPage'
import { TenantListPage } from '../../features/tenants/pages/TenantListPage'
import { DeviceManagementPage } from '../../pages/devices/DeviceManagementPage'
import { PackageManagementPage } from '../../pages/packages/PackageManagementPage'
import { CultivationManagementPage } from '../../pages/cultivation/CultivationManagementPage'
import { AlertManagementPage } from '../../pages/alerts/AlertManagementPage'
import { ReportsAnalyticsPage } from '../../pages/reports/ReportsAnalyticsPage'
import { UserManagementPage } from '../../pages/users/UserManagementPage'
import { SettingsPage } from '../../pages/settings/SettingsPage'
import { AdminLayout } from '../layouts/AdminLayout'
import { AuthGuard } from './guards/AuthGuard'
import { RoleGuard } from '../../routes/RoleGuard'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <AuthGuard>
        <AdminLayout />
      </AuthGuard>
    ),
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'rooms',
        element: <RoomListPage />,
      },
      {
        path: 'rooms/:id',
        element: <TrayDetailPage />,
      },
      {
        path: 'devices',
        element: (
          <RoleGuard allowedRoles={['ADMIN', 'OPERATOR']}>
            <DeviceManagementPage />
          </RoleGuard>
        ),
      },
      {
        path: 'packages',
        element: <PackageManagementPage />,
      },
      {
        path: 'cultivation',
        element: <CultivationManagementPage />,
      },
      {
        path: 'alerts',
        element: <AlertManagementPage />,
      },
      {
        path: 'reports',
        element: <ReportsAnalyticsPage />,
      },
      {
        path: 'tenants',
        element: <TenantListPage />,
      },
      {
        path: 'users',
        element: (
          <RoleGuard allowedRoles={['ADMIN']}>
            <UserManagementPage />
          </RoleGuard>
        ),
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
    ],
  },
])
