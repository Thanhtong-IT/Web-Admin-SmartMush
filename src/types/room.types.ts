export const TIER_IDS = [1, 2, 3, 4] as const
export type TierId = (typeof TIER_IDS)[number]

export const TRAY_POSITIONS = [1, 2, 3] as const
export type TrayPosition = (typeof TRAY_POSITIONS)[number]

export type TrayCode = `T${TierId}-K${TrayPosition}`
export type NodeId = `node-stm32-0${TierId}`
export type TrayStatus =
  | 'empty'
  | 'rented'
  | 'harvesting'
  | 'maintenance'

export interface Tray {
  id: string
  code: TrayCode
  tierId: TierId
  status: TrayStatus
  customerId: string | null
  batchId: string | null
}

export interface TierTelemetry {
  temperature: number
  humidity: number
  co2: number
  updatedAt: string
}

export interface TierRelayState {
  irrigationValves: Record<TrayPosition, boolean>
  fan: boolean
}

export interface Tier {
  tierId: TierId
  name: string
  nodeId: NodeId
  trays: Tray[]
  telemetry: TierTelemetry
  relays: TierRelayState
}

export function getTrayPosition(code: TrayCode): TrayPosition {
  return Number(code.at(-1)) as TrayPosition
}
