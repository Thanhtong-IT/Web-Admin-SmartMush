export type RoomStatus = 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE'
export type TrayStatus = RoomStatus

export interface CultivationRoom {
  id: string
  name: string
  location: string
  capacity: number
  maxCapacity: number
  currentTraysCount: number
  status: RoomStatus
}

export interface Tray {
  id: string
  name: string
  roomId: string
  deviceId: string
  mushroomType: string
  status: TrayStatus
  tenantId: string | null
}

export type Room = CultivationRoom
export type RoomFormValues = Omit<
  CultivationRoom,
  'id' | 'capacity' | 'currentTraysCount'
>
export type TrayFormValues = Omit<Tray, 'id'>
