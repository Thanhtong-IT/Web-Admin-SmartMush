import { Suspense, lazy, type ReactElement } from 'react'
import { Navigate, createBrowserRouter } from 'react-router-dom'
import { LoginPage } from '../../features/auth/pages/LoginPage'
import { AdminLayout } from '../layouts/AdminLayout'
import { AuthGuard } from './guards/AuthGuard'
import { RoleGuard } from '../../routes/RoleGuard'
import { PageFallback } from './PageFallback'

// ──────────────────────────────────────────────────────────────────────────
// Route-level code splitting: mỗi page là một chunk riêng, chỉ tải khi user
// truy cập. Giúp giảm Initial JS payload từ ~2MB xuống ~400-500KB.
// ──────────────────────────────────────────────────────────────────────────

const DashboardPage = lazy(() =>
  import('../../features/dashboard/pages/DashboardPage').then((m) => ({
    default: m.DashboardPage,
  })),
)
const RoomListPage = lazy(() =>
  import('../../features/rooms/pages/RoomListPage').then((m) => ({
    default: m.RoomListPage,
  })),
)
const TenantListPage = lazy(() =>
  import('../../features/tenants/pages/TenantListPage').then((m) => ({
    default: m.TenantListPage,
  })),
)
const CameraOverviewPage = lazy(() =>
  import('../../pages/camera/CameraOverviewPage').then((m) => ({
    default: m.CameraOverviewPage,
  })),
)
const DeviceManagementPage = lazy(() =>
  import('../../pages/devices/DeviceManagementPage').then((m) => ({
    default: m.DeviceManagementPage,
  })),
)
const IoTHistoryPage = lazy(() =>
  import('../../pages/devices/IoTHistoryPage').then((m) => ({
    default: m.IoTHistoryPage,
  })),
)
const OrderManagementPage = lazy(() =>
  import('../../pages/orders/OrderManagementPage').then((m) => ({
    default: m.OrderManagementPage,
  })),
)
const PackageManagementPage = lazy(() =>
  import('../../pages/packages/PackageManagementPage').then((m) => ({
    default: m.PackageManagementPage,
  })),
)
const CultivationManagementPage = lazy(() =>
  import('../../pages/cultivation/CultivationManagementPage').then((m) => ({
    default: m.CultivationManagementPage,
  })),
)
const AlertManagementPage = lazy(() =>
  import('../../pages/alerts/AlertManagementPage').then((m) => ({
    default: m.AlertManagementPage,
  })),
)
const ReportsAnalyticsPage = lazy(() =>
  import('../../pages/reports/ReportsAnalyticsPage').then((m) => ({
    default: m.ReportsAnalyticsPage,
  })),
)
const ReportsErrorBoundary = lazy(() =>
  import('../../pages/reports/components/ReportsErrorBoundary').then((m) => ({
    default: m.ReportsErrorBoundary,
  })),
)
const UserManagementPage = lazy(() =>
  import('../../pages/users/UserManagementPage').then((m) => ({
    default: m.UserManagementPage,
  })),
)
const SettingsPage = lazy(() =>
  import('../../pages/settings/SettingsPage').then((m) => ({
    default: m.SettingsPage,
  })),
)

/** Bọc một element với Suspense fallback (full-screen PageFallback). */
function withSuspense(node: ReactElement) {
  return <Suspense fallback={<PageFallback />}>{node}</Suspense>
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: withSuspense(<LoginPage />),
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
        element: withSuspense(<DashboardPage />),
      },
      {
        path: 'rooms',
        element: withSuspense(<RoomListPage />),
      },
      {
        path: 'rooms/:id',
        element: withSuspense(<RoomListPage />),
      },
      {
        path: 'trays',
        element: <Navigate to="/rooms" replace />,
      },
      {
        path: 'devices',
        element: (
          <RoleGuard allowedRoles={['ADMIN', 'OPERATOR']}>
            {withSuspense(<DeviceManagementPage />)}
          </RoleGuard>
        ),
      },
      {
        path: 'devices/history',
        element: (
          <RoleGuard allowedRoles={['ADMIN', 'OPERATOR']}>
            {withSuspense(<IoTHistoryPage />)}
          </RoleGuard>
        ),
      },
      {
        path: 'packages',
        element: withSuspense(<PackageManagementPage />),
      },
      {
        path: 'orders',
        element: withSuspense(<OrderManagementPage />),
      },
      {
        path: 'cultivation',
        element: withSuspense(<CultivationManagementPage />),
      },
      {
        path: 'alerts',
        element: withSuspense(<AlertManagementPage />),
      },
      {
        path: 'reports',
        element: withSuspense(
          <ReportsErrorBoundary moduleName="Báo cáo & Phân tích">
            <ReportsAnalyticsPage />
          </ReportsErrorBoundary>,
        ),
      },
      {
        path: 'customers',
        element: withSuspense(<TenantListPage />),
      },
      {
        path: 'tenants',
        element: <Navigate to="/customers" replace />,
      },
      {
        path: 'camera',
        element: withSuspense(<CameraOverviewPage />),
      },
      {
        path: 'users',
        element: (
          <RoleGuard allowedRoles={['ADMIN']}>
            {withSuspense(<UserManagementPage />)}
          </RoleGuard>
        ),
      },
      {
        path: 'settings',
        element: withSuspense(<SettingsPage />),
      },
    ],
  },
])
