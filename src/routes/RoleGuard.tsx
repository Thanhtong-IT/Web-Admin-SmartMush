import type { ReactNode } from 'react'
import { Result } from 'antd'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '../features/auth/store/auth.store'
import type { UserRole } from '../types/user.types'

interface RoleGuardProps {
  allowedRoles: readonly UserRole[]
  children?: ReactNode
}

function normalizeRole(role: string | undefined): UserRole | null {
  switch (role?.toUpperCase()) {
    case 'ADMIN':
      return 'ADMIN'
    case 'OPERATOR':
    case 'FARM_MANAGER':
      return 'OPERATOR'
    case 'CUSTOMER':
      return 'CUSTOMER'
    default:
      return null
  }
}

export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const location = useLocation()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const authUser = useAuthStore((state) => state.user)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  const currentRole = normalizeRole(authUser?.role)
  const hasPermission = currentRole
    ? allowedRoles.includes(currentRole)
    : false

  if (!hasPermission) {
    if (location.pathname !== '/') {
      return <Navigate to="/" replace />
    }

    return (
      <Result
        status="403"
        title="403"
        subTitle="Bạn không có quyền truy cập trang này."
      />
    )
  }

  return children ?? <Outlet />
}
