import { create } from 'zustand'
import type { User, UserFormValues, UserStatus } from '../types/user.types'

export const MOCK_USERS: User[] = [
  {
    id: 'USER-001',
    username: 'admin.mcms',
    name: 'Nguyễn Minh Quản',
    email: 'admin@mcms.vn',
    phone: '0901234567',
    role: 'ADMIN',
    status: 'ACTIVE',
    createdAt: '2025-08-12',
  },
  {
    id: 'USER-002',
    username: 'operator.huy',
    name: 'Trần Quốc Huy',
    email: 'huy.operator@mcms.vn',
    phone: '0912345678',
    role: 'OPERATOR',
    status: 'ACTIVE',
    createdAt: '2025-09-01',
  },
  {
    id: 'USER-003',
    username: 'customer.lan',
    name: 'Lê Thu Lan',
    email: 'lan.customer@example.com',
    phone: '0987654321',
    role: 'CUSTOMER',
    status: 'ACTIVE',
    createdAt: '2026-01-10',
  },
  {
    id: 'USER-004',
    username: 'operator.nam',
    name: 'Phạm Hoàng Nam',
    email: 'nam.operator@mcms.vn',
    phone: '0938123456',
    role: 'OPERATOR',
    status: 'LOCKED',
    createdAt: '2025-10-18',
  },
  {
    id: 'USER-005',
    username: 'customer.thao',
    name: 'Võ Ngọc Thảo',
    email: 'thao.customer@example.com',
    phone: '0977123456',
    role: 'CUSTOMER',
    status: 'PENDING',
    createdAt: '2026-02-06',
  },
]

interface UserState {
  users: User[]
  addUser: (values: UserFormValues) => void
  updateUser: (id: string, values: UserFormValues) => void
  deleteUser: (id: string) => void
  toggleUserStatus: (id: string) => void
  resetPassword: (id: string) => string
}

function getNextUserId(users: User[]) {
  const highestId = users.reduce((highest, user) => {
    const match = /^USER-(\d+)$/.exec(user.id)
    const numericId = match ? Number(match[1]) : 0

    return Math.max(highest, numericId)
  }, 0)

  return `USER-${String(highestId + 1).padStart(3, '0')}`
}

function getToday() {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function getSecureRandomIndex(max: number) {
  const randomValues = new Uint32Array(1)
  globalThis.crypto.getRandomValues(randomValues)

  return randomValues[0] % max
}

function generateTemporaryPassword() {
  const characterSets = [
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    'abcdefghijklmnopqrstuvwxyz',
    '0123456789',
    '!@#$%^&*',
  ]
  const allCharacters = characterSets.join('')
  const characters = characterSets.map(
    (characterSet) => characterSet[getSecureRandomIndex(characterSet.length)],
  )

  while (characters.length < 12) {
    characters.push(allCharacters[getSecureRandomIndex(allCharacters.length)])
  }

  for (let index = characters.length - 1; index > 0; index -= 1) {
    const swapIndex = getSecureRandomIndex(index + 1)
    const currentCharacter = characters[index]
    characters[index] = characters[swapIndex]
    characters[swapIndex] = currentCharacter
  }

  return characters.join('')
}

export const useUserStore = create<UserState>((set, get) => ({
  users: MOCK_USERS,

  addUser: (values) =>
    set((state) => ({
      users: [
        {
          ...values,
          id: getNextUserId(state.users),
          createdAt: getToday(),
        },
        ...state.users,
      ],
    })),

  updateUser: (id, values) =>
    set((state) => ({
      users: state.users.map((user) =>
        user.id === id ? { ...user, ...values } : user,
      ),
    })),

  deleteUser: (id) =>
    set((state) => ({
      users: state.users.filter((user) => user.id !== id),
    })),

  toggleUserStatus: (id) =>
    set((state) => ({
      users: state.users.map((user) => {
        if (user.id !== id) {
          return user
        }

        const nextStatus: UserStatus =
          user.status === 'ACTIVE' ? 'LOCKED' : 'ACTIVE'

        return { ...user, status: nextStatus }
      }),
    })),

  resetPassword: (id) => {
    const user = get().users.find((item) => item.id === id)

    if (!user) {
      throw new Error('Không tìm thấy người dùng cần đặt lại mật khẩu.')
    }

    return generateTemporaryPassword()
  },
}))
