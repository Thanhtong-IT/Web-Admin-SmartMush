import { create } from 'zustand'
import type { LoginCredentials, User } from '../types/auth.types'

const AUTH_STORAGE_KEY = 'mcms-auth-session'

interface PersistedAuthSession {
  user: User
  token: string
  rememberedEmail: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  rememberedEmail: string
  login: (credentials: LoginCredentials) => Promise<string>
  logout: () => void
}

const MOCK_CREDENTIALS: LoginCredentials = {
  email: 'admin@mcms.vn',
  password: 'Admin@123',
}

const MOCK_USER: User = {
  id: 'mcms-admin-001',
  email: MOCK_CREDENTIALS.email,
  role: 'admin',
  name: 'Quản trị viên MCMS',
}

const MOCK_TOKEN = 'mcms-mock-access-token'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isAuthRole(value: unknown): value is User['role'] {
  return (
    value === 'admin' ||
    value === 'farm_manager' ||
    value === 'operator'
  )
}

function readPersistedSession(): PersistedAuthSession | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const rawValue = window.localStorage.getItem(AUTH_STORAGE_KEY)
    const parsedValue: unknown = rawValue ? JSON.parse(rawValue) : null

    if (!isRecord(parsedValue) || !isRecord(parsedValue.user)) {
      return null
    }

    const userValue = parsedValue.user

    if (
      typeof userValue.id !== 'string' ||
      typeof userValue.email !== 'string' ||
      typeof userValue.name !== 'string' ||
      !isAuthRole(userValue.role) ||
      typeof parsedValue.token !== 'string' ||
      typeof parsedValue.rememberedEmail !== 'string'
    ) {
      return null
    }

    return {
      user: {
        id: userValue.id,
        email: userValue.email,
        role: userValue.role,
        name: userValue.name,
      },
      token: parsedValue.token,
      rememberedEmail: parsedValue.rememberedEmail,
    }
  } catch {
    return null
  }
}

function persistSession(session: PersistedAuthSession | null) {
  if (typeof window === 'undefined') {
    return
  }

  try {
    if (session) {
      window.localStorage.setItem(
        AUTH_STORAGE_KEY,
        JSON.stringify(session),
      )
    } else {
      window.localStorage.removeItem(AUTH_STORAGE_KEY)
    }
  } catch {
    // Memory state remains available when storage is blocked or full.
  }
}

const persistedSession = readPersistedSession()

export const useAuthStore = create<AuthState>((set) => ({
  user: persistedSession?.user ?? null,
  token: persistedSession?.token ?? null,
  isAuthenticated: Boolean(persistedSession),
  rememberedEmail: persistedSession?.rememberedEmail ?? '',
  login: async ({ email, password, rememberMe = false }) => {
    await new Promise((resolve) => window.setTimeout(resolve, 300))

    const normalizedEmail = email.trim().toLowerCase()
    const isValidCredentials =
      normalizedEmail === MOCK_CREDENTIALS.email &&
      password === MOCK_CREDENTIALS.password

    if (!isValidCredentials) {
      throw new Error('Email hoặc mật khẩu không chính xác.')
    }

    const rememberedEmail = rememberMe ? normalizedEmail : ''

    set({
      user: MOCK_USER,
      token: MOCK_TOKEN,
      isAuthenticated: true,
      rememberedEmail,
    })

    persistSession(
      rememberMe
        ? {
            user: MOCK_USER,
            token: MOCK_TOKEN,
            rememberedEmail,
          }
        : null,
    )

    return MOCK_TOKEN
  },
  logout: () => {
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      rememberedEmail: '',
    })
    persistSession(null)
  },
}))
