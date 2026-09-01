import { create } from 'zustand'
import type {
  CultivationRoom,
  RoomFormValues,
  Tray,
  TrayFormValues,
} from '../types/room.types'

export const MOCK_ROOMS: CultivationRoom[] = [
  {
    id: 'ROOM-001',
    name: 'Phòng nuôi A1',
    location: 'Tầng 1 · Khu A',
    capacity: 8,
    maxCapacity: 8,
    currentTraysCount: 3,
    status: 'ACTIVE',
  },
  {
    id: 'ROOM-002',
    name: 'Phòng nuôi B1',
    location: 'Tầng 1 · Khu B',
    capacity: 10,
    maxCapacity: 10,
    currentTraysCount: 2,
    status: 'ACTIVE',
  },
  {
    id: 'ROOM-003',
    name: 'Phòng cách ly',
    location: 'Tầng 2 · Khu kỹ thuật',
    capacity: 6,
    maxCapacity: 6,
    currentTraysCount: 1,
    status: 'MAINTENANCE',
  },
]

export const MOCK_TRAYS: Tray[] = [
  {
    id: 'TRAY-001',
    name: 'Khay tầng 1',
    roomId: 'ROOM-001',
    deviceId: 'ESP32-A1B2',
    mushroomType: 'Nấm Bào Ngư Xám',
    status: 'ACTIVE',
    tenantId: 'TENANT-001',
  },
  {
    id: 'TRAY-002',
    name: 'Khay tầng 2',
    roomId: 'ROOM-001',
    deviceId: 'ESP32-C3D4',
    mushroomType: 'Nấm Linh Chi',
    status: 'ACTIVE',
    tenantId: 'TENANT-002',
  },
  {
    id: 'TRAY-003',
    name: 'Khay tầng 3',
    roomId: 'ROOM-001',
    deviceId: 'ESP32-E5F6',
    mushroomType: 'Nấm Mối Đen',
    status: 'MAINTENANCE',
    tenantId: null,
  },
  {
    id: 'TRAY-004',
    name: 'Khay tầng 1',
    roomId: 'ROOM-002',
    deviceId: 'ESP32-G7H8',
    mushroomType: 'Nấm Hoàng Kim',
    status: 'ACTIVE',
    tenantId: 'TENANT-003',
  },
  {
    id: 'TRAY-005',
    name: 'Khay tầng 2',
    roomId: 'ROOM-002',
    deviceId: 'ESP32-H9J0',
    mushroomType: 'Đông Trùng Hạ Thảo',
    status: 'ACTIVE',
    tenantId: null,
  },
  {
    id: 'TRAY-006',
    name: 'Khay kiểm tra',
    roomId: 'ROOM-003',
    deviceId: 'ESP32-K1L2',
    mushroomType: 'Nấm Bào Ngư Xám',
    status: 'INACTIVE',
    tenantId: null,
  },
]

interface RoomState {
  rooms: CultivationRoom[]
  trays: Tray[]
  addRoom: (values: RoomFormValues) => void
  updateRoom: (id: string, values: RoomFormValues) => void
  deleteRoom: (id: string) => void
  addTray: (values: TrayFormValues) => void
  updateTray: (id: string, values: TrayFormValues) => void
  deleteTray: (id: string) => void
}

function getNextId(prefix: string, ids: string[]) {
  const highestId = ids.reduce((highest, id) => {
    const match = new RegExp(`^${prefix}-(\\d+)$`).exec(id)
    const numericId = match ? Number(match[1]) : 0

    return Math.max(highest, numericId)
  }, 0)

  return `${prefix}-${String(highestId + 1).padStart(3, '0')}`
}

function syncRoomCounts(rooms: CultivationRoom[], trays: Tray[]) {
  return rooms.map((room) => ({
    ...room,
    currentTraysCount: trays.filter((tray) => tray.roomId === room.id).length,
  }))
}

export const useRoomStore = create<RoomState>((set) => ({
  rooms: MOCK_ROOMS,
  trays: MOCK_TRAYS,

  addRoom: (values) =>
    set((state) => ({
      rooms: [
        {
          ...values,
          id: getNextId(
            'ROOM',
            state.rooms.map((room) => room.id),
          ),
          capacity: values.maxCapacity,
          currentTraysCount: 0,
        },
        ...state.rooms,
      ],
    })),

  updateRoom: (id, values) =>
    set((state) => ({
      rooms: state.rooms.map((room) =>
        room.id === id
          ? { ...room, ...values, capacity: values.maxCapacity }
          : room,
      ),
    })),

  deleteRoom: (id) =>
    set((state) => {
      const trays = state.trays.filter((tray) => tray.roomId !== id)
      const rooms = state.rooms.filter((room) => room.id !== id)

      return { trays, rooms: syncRoomCounts(rooms, trays) }
    }),

  addTray: (values) =>
    set((state) => {
      const trays = [
        {
          ...values,
          id: getNextId(
            'TRAY',
            state.trays.map((tray) => tray.id),
          ),
        },
        ...state.trays,
      ]

      return { trays, rooms: syncRoomCounts(state.rooms, trays) }
    }),

  updateTray: (id, values) =>
    set((state) => {
      const trays = state.trays.map((tray) =>
        tray.id === id ? { ...tray, ...values } : tray,
      )

      return { trays, rooms: syncRoomCounts(state.rooms, trays) }
    }),

  deleteTray: (id) =>
    set((state) => {
      const trays = state.trays.filter((tray) => tray.id !== id)

      return { trays, rooms: syncRoomCounts(state.rooms, trays) }
    }),
}))
