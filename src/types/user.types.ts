export const USER_ROLES = ['ADMIN', 'OPERATOR', 'CUSTOMER'] as const
export type UserRole = (typeof USER_ROLES)[number]

export const USER_STATUSES = ['ACTIVE', 'LOCKED', 'PENDING'] as const
export type UserStatus = (typeof USER_STATUSES)[number]

export interface User {
  id: string
  username: string
  name: string
  email: string
  phone: string
  role: UserRole
  status: UserStatus
  createdAt: string
}

export type UserFormValues = Omit<User, 'id' | 'createdAt'>
