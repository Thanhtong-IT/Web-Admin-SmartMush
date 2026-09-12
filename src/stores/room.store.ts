import { create } from 'zustand'
import type {
  Tier,
  TierId,
  TierTelemetry,
  Tray,
  TrayCode,
  TrayPosition,
  TrayStatus,
} from '../types/room.types'

interface TraySeed {
  position: TrayPosition
  status?: TrayStatus
  customerId?: string
  batchId?: string
}

function createTray(tierId: TierId, seed: TraySeed): Tray {
  const code = `T${tierId}-K${seed.position}` as TrayCode

  return {
    id: code,
    code,
    tierId,
    status: seed.status ?? 'empty',
    customerId: seed.customerId ?? null,
    batchId: seed.batchId ?? null,
  }
}

function createTier(
  tierId: TierId,
  telemetry: Omit<TierTelemetry, 'updatedAt'>,
  traySeeds: TraySeed[],
): Tier {
  return {
    tierId,
    name: `Tầng ${tierId}`,
    nodeId: `node-stm32-0${tierId}`,
    trays: traySeeds.map((seed) => createTray(tierId, seed)),
    telemetry: {
      ...telemetry,
      updatedAt: '2026-09-12T09:30:00+07:00',
    },
    relays: {
      irrigationValves: { 1: false, 2: false, 3: false },
      fan: tierId === 2,
    },
  }
}

export const MOCK_TIERS: Tier[] = [
  createTier(
    1,
    { temperature: 25.2, humidity: 88, co2: 630 },
    [
      { position: 1, status: 'rented', customerId: 'TENANT-001', batchId: 'BATCH-001' },
      { position: 2 },
      { position: 3, status: 'maintenance', batchId: 'BATCH-006' },
    ],
  ),
  createTier(
    2,
    { temperature: 26.4, humidity: 82, co2: 780 },
    [
      { position: 1, status: 'rented', customerId: 'TENANT-002', batchId: 'BATCH-002' },
      { position: 2 },
      { position: 3 },
    ],
  ),
  createTier(
    3,
    { temperature: 24.8, humidity: 90, co2: 710 },
    [
      { position: 1, status: 'rented', customerId: 'TENANT-004', batchId: 'BATCH-004' },
      { position: 2 },
      { position: 3 },
    ],
  ),
  createTier(
    4,
    { temperature: 25.9, humidity: 85, co2: 860 },
    [
      { position: 1, status: 'harvesting', customerId: 'TENANT-003', batchId: 'BATCH-003' },
      { position: 2 },
      { position: 3, status: 'maintenance' },
    ],
  ),
]

interface RoomState {
  tiers: Tier[]
  telemetrySimulationEnabled: boolean
  assignCustomerToTray: (trayId: string, customerId: string) => void
  releaseCustomerTrays: (customerId: string) => void
  toggleTierFan: (tierId: TierId) => void
  toggleTrayValve: (tierId: TierId, position: TrayPosition) => void
  setTelemetrySimulationEnabled: (enabled: boolean) => void
  simulateTelemetry: () => void
}

export function getAllTrays(tiers: Tier[]) {
  return tiers.flatMap((tier) => tier.trays)
}

export function findTray(tiers: Tier[], trayId: string) {
  return getAllTrays(tiers).find((tray) => tray.id === trayId)
}

function getRandomDelta(range: number) {
  return (Math.random() - 0.5) * range
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.max(minimum, Math.min(maximum, value))
}

export const useRoomStore = create<RoomState>((set, get) => ({
  tiers: MOCK_TIERS,
  telemetrySimulationEnabled: false,

  assignCustomerToTray: (trayId, customerId) => {
    const tray = findTray(get().tiers, trayId)

    if (!tray) {
      throw new Error('Không tìm thấy khay đã chọn.')
    }

    const isOwnedByAnotherCustomer =
      tray.customerId !== null && tray.customerId !== customerId
    const isUnavailableStatus =
      (tray.status === 'maintenance' || tray.status === 'harvesting') &&
      tray.customerId !== customerId

    if (isOwnedByAnotherCustomer || isUnavailableStatus) {
      throw new Error(`${tray.code} hiện không thể gán cho khách thuê.`)
    }

    set((state) => ({
      tiers: state.tiers.map((tier) => ({
        ...tier,
        trays: tier.trays.map((item) => {
          if (item.id === trayId) {
            return { ...item, customerId, status: 'rented' }
          }

          if (item.customerId === customerId) {
            return {
              ...item,
              customerId: null,
              status: item.batchId ? 'harvesting' : 'empty',
            }
          }

          return item
        }),
      })),
    }))
  },

  releaseCustomerTrays: (customerId) =>
    set((state) => ({
      tiers: state.tiers.map((tier) => ({
        ...tier,
        trays: tier.trays.map((tray) =>
          tray.customerId === customerId
            ? {
                ...tray,
                customerId: null,
                status: tray.batchId ? 'harvesting' : 'empty',
              }
            : tray,
        ),
      })),
    })),

  toggleTierFan: (tierId) =>
    set((state) => ({
      tiers: state.tiers.map((tier) =>
        tier.tierId === tierId
          ? { ...tier, relays: { ...tier.relays, fan: !tier.relays.fan } }
          : tier,
      ),
    })),

  toggleTrayValve: (tierId, position) =>
    set((state) => ({
      tiers: state.tiers.map((tier) =>
        tier.tierId === tierId
          ? {
              ...tier,
              relays: {
                ...tier.relays,
                irrigationValves: {
                  ...tier.relays.irrigationValves,
                  [position]: !tier.relays.irrigationValves[position],
                },
              },
            }
          : tier,
      ),
    })),

  setTelemetrySimulationEnabled: (enabled) =>
    set({ telemetrySimulationEnabled: enabled }),

  simulateTelemetry: () =>
    set((state) => ({
      tiers: state.tiers.map((tier) => ({
        ...tier,
        telemetry: {
          temperature: Number(
            clamp(tier.telemetry.temperature + getRandomDelta(0.6), 18, 34).toFixed(1),
          ),
          humidity: Math.round(
            clamp(tier.telemetry.humidity + getRandomDelta(3), 55, 99),
          ),
          co2: Math.round(
            clamp(tier.telemetry.co2 + getRandomDelta(60), 350, 1600),
          ),
          updatedAt: new Date().toISOString(),
        },
      })),
    })),
}))
