export type UserRole = 'admin' | 'farm_manager' | 'operator'

export interface User {
  id: string
  email: string
  role: UserRole
  name: string
}

export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}
