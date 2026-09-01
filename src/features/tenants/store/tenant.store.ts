import { create } from 'zustand'
import type { Tenant, TenantFormValues } from '../types/tenant.types'

export const MOCK_TENANTS: Tenant[] = [
  {
    id: 'TENANT-001',
    name: 'Nguyễn Minh Anh',
    phone: '0901234567',
    assignedTrayId: 'TRAY-001',
    startDate: '2026-01-15',
    status: 'active',
  },
  {
    id: 'TENANT-002',
    name: 'Trần Quốc Bảo',
    phone: '0912345678',
    assignedTrayId: 'TRAY-002',
    startDate: '2025-11-02',
    status: 'active',
  },
  {
    id: 'TENANT-003',
    name: 'Lê Thu Hà',
    phone: '0987654321',
    assignedTrayId: 'TRAY-003',
    startDate: '2025-06-20',
    status: 'expired',
  },
]

interface TenantState {
  tenants: Tenant[]
  addTenant: (values: TenantFormValues) => void
  updateTenant: (id: string, values: TenantFormValues) => void
  deleteTenant: (id: string) => void
}

function getNextTenantId(tenants: Tenant[]) {
  const highestId = tenants.reduce((highest, tenant) => {
    const match = /^TENANT-(\d+)$/.exec(tenant.id)
    const numericId = match ? Number(match[1]) : 0

    return Math.max(highest, numericId)
  }, 0)

  return `TENANT-${String(highestId + 1).padStart(3, '0')}`
}

function getToday() {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export const useTenantStore = create<TenantState>((set) => ({
  tenants: MOCK_TENANTS,

  addTenant: (values) =>
    set((state) => ({
      tenants: [
        {
          ...values,
          id: getNextTenantId(state.tenants),
          startDate: getToday(),
        },
        ...state.tenants,
      ],
    })),

  updateTenant: (id, values) =>
    set((state) => ({
      tenants: state.tenants.map((tenant) =>
        tenant.id === id ? { ...tenant, ...values } : tenant,
      ),
    })),

  deleteTenant: (id) =>
    set((state) => ({
      tenants: state.tenants.filter((tenant) => tenant.id !== id),
    })),
}))
