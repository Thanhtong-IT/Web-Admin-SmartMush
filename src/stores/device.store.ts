import { create } from 'zustand'
import type {
  Device,
  DeviceActuators,
  DeviceFormValues,
  DeviceTelemetry,
} from '../types/device.types'

export const MOCK_DEVICES: Device[] = [
  {
    id: 'DEVICE-001',
    trayId: 'TRAY-001',
    ipAddress: '192.168.1.101',
    macAddress: '24:6F:28:A1:B2:C3',
    firmwareVersion: 'v1.4.2',
    lastPingTimestamp: '2026-09-01T08:30:00+07:00',
    wifiRssi: -48,
    status: 'ONLINE',
    telemetry: {
      temperature: 25.6,
      humidity: 87,
      co2: 642,
      soilMoisture: 74,
      updatedAt: '2026-09-01T08:30:00+07:00',
    },
    actuators: {
      fanStatus: true,
      pumpStatus: false,
      lightStatus: true,
      mode: 'AUTO',
    },
    camera: {
      streamUrl: 'https://example.invalid/mcms/tray-001.m3u8',
      resolution: '1920x1080',
      fps: 25,
      isLive: true,
      lastSnapshotUrl: null,
    },
  },
  {
    id: 'DEVICE-002',
    trayId: 'TRAY-002',
    ipAddress: '192.168.1.102',
    macAddress: '24:6F:28:C3:D4:E5',
    firmwareVersion: 'v1.4.1',
    lastPingTimestamp: '2026-09-01T08:27:00+07:00',
    wifiRssi: -63,
    status: 'WARNING',
    telemetry: {
      temperature: 27.4,
      humidity: 79,
      co2: 915,
      soilMoisture: 58,
      updatedAt: '2026-09-01T08:27:00+07:00',
    },
    actuators: {
      fanStatus: false,
      pumpStatus: true,
      lightStatus: true,
      mode: 'MANUAL',
    },
    camera: {
      streamUrl: 'https://example.invalid/mcms/tray-002.m3u8',
      resolution: '1280x720',
      fps: 20,
      isLive: true,
      lastSnapshotUrl: null,
    },
  },
  {
    id: 'DEVICE-003',
    trayId: 'TRAY-003',
    ipAddress: '192.168.1.103',
    macAddress: '24:6F:28:E5:F6:A7',
    firmwareVersion: 'v1.3.8',
    lastPingTimestamp: '2026-09-01T07:55:00+07:00',
    wifiRssi: -82,
    status: 'OFFLINE',
    telemetry: {
      temperature: 24.8,
      humidity: 89,
      co2: 704,
      soilMoisture: 68,
      updatedAt: '2026-09-01T07:55:00+07:00',
    },
    actuators: {
      fanStatus: false,
      pumpStatus: false,
      lightStatus: false,
      mode: 'AUTO',
    },
    camera: {
      streamUrl: 'https://example.invalid/mcms/tray-003.m3u8',
      resolution: '1280x720',
      fps: 15,
      isLive: false,
      lastSnapshotUrl: null,
    },
  },
]

interface DeviceState {
  devices: Device[]
  telemetrySimulationEnabled: boolean
  addDevice: (values: DeviceFormValues) => void
  updateDevice: (id: string, values: DeviceFormValues) => void
  deleteDevice: (id: string) => void
  setTelemetrySimulationEnabled: (enabled: boolean) => void
  simulateTelemetry: () => void
  toggleActuator: (id: string, actuator: keyof Omit<DeviceActuators, 'mode'>) => void
  setControlMode: (id: string, mode: DeviceActuators['mode']) => void
  pingDevice: (id: string) => void
  restartDevice: (id: string) => void
  takeSnapshot: (id: string) => string | null
}

function getNextDeviceId(devices: Device[]) {
  const highestId = devices.reduce((highest, device) => {
    const match = /^DEVICE-(\d+)$/.exec(device.id)
    const numericId = match ? Number(match[1]) : 0

    return Math.max(highest, numericId)
  }, 0)

  return `DEVICE-${String(highestId + 1).padStart(3, '0')}`
}

function getNow() {
  return new Date().toISOString()
}

function getRandomDelta(range: number) {
  return (Math.random() - 0.5) * range
}

function createTelemetry(telemetry: DeviceTelemetry): DeviceTelemetry {
  return {
    temperature: Number(
      Math.max(18, Math.min(35, telemetry.temperature + getRandomDelta(0.8))).toFixed(1),
    ),
    humidity: Math.round(
      Math.max(40, Math.min(100, telemetry.humidity + getRandomDelta(4))),
    ),
    co2: Math.round(Math.max(350, Math.min(1800, telemetry.co2 + getRandomDelta(45)))),
    soilMoisture: Math.round(
      Math.max(0, Math.min(100, telemetry.soilMoisture + getRandomDelta(5))),
    ),
    updatedAt: getNow(),
  }
}

function createDevice(values: DeviceFormValues, id: string): Device {
  const now = getNow()

  return {
    id,
    trayId: values.trayId,
    ipAddress: values.ipAddress,
    macAddress: values.macAddress.toUpperCase(),
    firmwareVersion: values.firmwareVersion,
    lastPingTimestamp: now,
    wifiRssi: -55,
    status: 'ONLINE',
    telemetry: {
      temperature: 25,
      humidity: 85,
      co2: 600,
      soilMoisture: 70,
      updatedAt: now,
    },
    actuators: {
      fanStatus: false,
      pumpStatus: false,
      lightStatus: false,
      mode: 'AUTO',
    },
    camera: {
      streamUrl: values.streamUrl,
      resolution: values.resolution,
      fps: values.fps,
      isLive: true,
      lastSnapshotUrl: null,
    },
  }
}

export const useDeviceStore = create<DeviceState>((set) => ({
  devices: MOCK_DEVICES,
  telemetrySimulationEnabled: false,

  addDevice: (values) =>
    set((state) => ({
      devices: [createDevice(values, getNextDeviceId(state.devices)), ...state.devices],
    })),

  updateDevice: (id, values) =>
    set((state) => ({
      devices: state.devices.map((device) =>
        device.id === id
          ? {
              ...device,
              trayId: values.trayId,
              ipAddress: values.ipAddress,
              macAddress: values.macAddress.toUpperCase(),
              firmwareVersion: values.firmwareVersion,
              camera: {
                ...device.camera,
                streamUrl: values.streamUrl,
                resolution: values.resolution,
                fps: values.fps,
              },
            }
          : device,
      ),
    })),

  deleteDevice: (id) =>
    set((state) => ({
      devices: state.devices.filter((device) => device.id !== id),
    })),

  setTelemetrySimulationEnabled: (enabled) =>
    set({ telemetrySimulationEnabled: enabled }),

  simulateTelemetry: () =>
    set((state) => ({
      devices: state.devices.map((device) =>
        device.status === 'OFFLINE'
          ? device
          : { ...device, telemetry: createTelemetry(device.telemetry) },
      ),
    })),

  toggleActuator: (id, actuator) =>
    set((state) => ({
      devices: state.devices.map((device) =>
        device.id === id
          ? {
              ...device,
              actuators: {
                ...device.actuators,
                [actuator]: !device.actuators[actuator],
              },
            }
          : device,
      ),
    })),

  setControlMode: (id, mode) =>
    set((state) => ({
      devices: state.devices.map((device) =>
        device.id === id
          ? { ...device, actuators: { ...device.actuators, mode } }
          : device,
      ),
    })),

  pingDevice: (id) =>
    set((state) => ({
      devices: state.devices.map((device) =>
        device.id === id
          ? {
              ...device,
              status: device.status === 'ERROR' ? 'WARNING' : 'ONLINE',
              lastPingTimestamp: getNow(),
              wifiRssi: Math.max(-90, Math.min(-35, device.wifiRssi + Math.round(getRandomDelta(8)))),
            }
          : device,
      ),
    })),

  restartDevice: (id) =>
    set((state) => ({
      devices: state.devices.map((device) =>
        device.id === id
          ? {
              ...device,
              status: 'ONLINE',
              lastPingTimestamp: getNow(),
              camera: { ...device.camera, isLive: true },
            }
          : device,
      ),
    })),

  takeSnapshot: (id) => {
    const snapshotUrl = `https://placehold.co/1280x720/102a43/ffffff?text=${encodeURIComponent(
      `MCMS ${id} snapshot`,
    )}`

    set((state) => ({
      devices: state.devices.map((device) =>
        device.id === id
          ? { ...device, camera: { ...device.camera, lastSnapshotUrl: snapshotUrl } }
          : device,
      ),
    }))

    return snapshotUrl
  },
}))
