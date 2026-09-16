import { create } from 'zustand'
import { useRoomStore } from '../../../stores/room.store'
import type { Tenant, TenantFormValues } from '../types/tenant.types'

export const MOCK_TENANTS: Tenant[] = [
  {
    id: 'TENANT-001',
    name: 'Nguyễn Minh Anh',
    phone: '0901234567',
    assignedTrayId: 'T1-K1',
    startDate: '2026-01-15',
    status: 'active',
  },
  {
    id: 'TENANT-002',
    name: 'Trần Quốc Bảo',
    phone: '0912345678',
    assignedTrayId: 'T2-K1',
    startDate: '2025-11-02',
    status: 'active',
  },
  {
    id: 'TENANT-003',
    name: 'Lê Thu Hà',
    phone: '0987654321',
    assignedTrayId: 'T1-K3',
    startDate: '2026-02-20',
    status: 'active',
  },
  {
    id: 'TENANT-004',
    name: 'Võ Ngọc Thảo',
    phone: '0977123456',
    assignedTrayId: 'T3-K1',
    startDate: '2026-03-08',
    status: 'active',
  },
  {
    id: 'TENANT-005',
    name: 'Phạm Thanh Tùng',
    phone: '0938123456',
    assignedTrayId: 'T1-K2',
    startDate: '2025-06-20',
    status: 'active',
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

export const useTenantStore = create<TenantState>((set, get) => ({
  tenants: MOCK_TENANTS,

  addTenant: (values) => {
    const id = getNextTenantId(get().tenants)

    if (values.status === 'active') {
      useRoomStore.getState().assignCustomerToTray(values.assignedTrayId, id)
    }

    set((state) => ({
      tenants: [
        {
          ...values,
          id,
          startDate: getToday(),
        },
        ...state.tenants,
      ],
    }))
  },

  updateTenant: (id, values) => {
    const existingTenant = get().tenants.find((tenant) => tenant.id === id)

    if (!existingTenant) {
      throw new Error('Không tìm thấy khách thuê cần cập nhật.')
    }

    if (values.status === 'active') {
      useRoomStore.getState().assignCustomerToTray(values.assignedTrayId, id)
    } else {
      useRoomStore.getState().releaseCustomerTrays(id)
    }

    set((state) => ({
      tenants: state.tenants.map((tenant) =>
        tenant.id === id ? { ...tenant, ...values } : tenant,
      ),
    }))
  },

  deleteTenant: (id) => {
    useRoomStore.getState().releaseCustomerTrays(id)
    set((state) => ({
      tenants: state.tenants.filter((tenant) => tenant.id !== id),
    }))
  },
}))
