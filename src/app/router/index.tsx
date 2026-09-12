import { Navigate, createBrowserRouter } from 'react-router-dom'
import { LoginPage } from '../../features/auth/pages/LoginPage'
import { DashboardPage } from '../../features/dashboard/pages/DashboardPage'
import { RoomListPage } from '../../features/rooms/pages/RoomListPage'
import { TenantListPage } from '../../features/tenants/pages/TenantListPage'
import { CameraOverviewPage } from '../../pages/camera/CameraOverviewPage'
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
        element: <RoomListPage />,
      },
      {
        path: 'trays',
        element: <Navigate to="/rooms" replace />,
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
        path: 'customers',
        element: <TenantListPage />,
      },
      {
        path: 'tenants',
        element: <Navigate to="/customers" replace />,
      },
      {
        path: 'camera',
        element: <CameraOverviewPage />,
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
