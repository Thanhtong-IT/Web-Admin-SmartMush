export interface Tenant {
  id: string
  name: string
  phone: string
  assignedTrayId: string
  startDate: string
  status: 'active' | 'expired'
}

export type TenantFormValues = Omit<Tenant, 'id' | 'startDate'>
