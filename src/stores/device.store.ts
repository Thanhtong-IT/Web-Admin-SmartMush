import { create } from 'zustand'
import type {
  ActuatorKey,
  CabinetActuatorKey,
  Device,
  DeviceActuators,
  DeviceFormValues,
  DeviceTelemetry,
  GatewayMaster,
  NodeAddress,
} from '../types/device.types'
import {
  NODE_ADDRESS_DIP_SWITCHES,
  NODE_ADDRESSES,
  getTrayValveKey,
} from '../types/device.types'

export const MOCK_GATEWAY_MASTER: GatewayMaster = {
  id: 'GATEWAY-MASTER-001',
  model: 'ESP32-S3',
  ipAddress: '192.168.1.100',
  macAddress: '7C:DF:A1:10:20:30',
  firmwareVersion: 'v2.1.0',
  lastPingTimestamp: '2026-09-01T08:30:00+07:00',
  wifiRssi: -48,
  status: 'ONLINE',
}

export const MOCK_DEVICES: Device[] = [
  {
    id: 'DEVICE-001',
    gateway: MOCK_GATEWAY_MASTER,
    node: {
      id: 'NODE-001',
      model: 'STM32',
      protocol: 'RS485',
      nodeAddress: 1,
      dipSwitch: NODE_ADDRESS_DIP_SWITCHES[1],
      trayId: 'TRAY-001',
      status: 'ONLINE',
    },
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
      cabinet: {
        exhaustFanStatus: true,
        supplyFanStatus: false,
        mainPumpStatus: true,
        lightingStatus: true,
      },
      tray: {
        valve1Status: false,
        valve2Status: false,
        valve3Status: false,
        valve4Status: false,
      },
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
    gateway: MOCK_GATEWAY_MASTER,
    node: {
      id: 'NODE-002',
      model: 'STM32',
      protocol: 'RS485',
      nodeAddress: 2,
      dipSwitch: NODE_ADDRESS_DIP_SWITCHES[2],
      trayId: 'TRAY-002',
      status: 'WARNING',
    },
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
      cabinet: {
        exhaustFanStatus: true,
        supplyFanStatus: false,
        mainPumpStatus: true,
        lightingStatus: true,
      },
      tray: {
        valve1Status: false,
        valve2Status: true,
        valve3Status: false,
        valve4Status: false,
      },
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
    gateway: MOCK_GATEWAY_MASTER,
    node: {
      id: 'NODE-003',
      model: 'STM32',
      protocol: 'RS485',
      nodeAddress: 3,
      dipSwitch: NODE_ADDRESS_DIP_SWITCHES[3],
      trayId: 'TRAY-003',
      status: 'OFFLINE',
    },
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
      cabinet: {
        exhaustFanStatus: true,
        supplyFanStatus: false,
        mainPumpStatus: true,
        lightingStatus: true,
      },
      tray: {
        valve1Status: false,
        valve2Status: false,
        valve3Status: false,
        valve4Status: false,
      },
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
  {
    id: 'DEVICE-004',
    gateway: MOCK_GATEWAY_MASTER,
    node: {
      id: 'NODE-004',
      model: 'STM32',
      protocol: 'RS485',
      nodeAddress: 4,
      dipSwitch: NODE_ADDRESS_DIP_SWITCHES[4],
      trayId: 'TRAY-004',
      status: 'ONLINE',
    },
    firmwareVersion: 'v1.4.0',
    lastPingTimestamp: '2026-09-01T08:25:00+07:00',
    wifiRssi: -51,
    status: 'ONLINE',
    telemetry: {
      temperature: 25.1,
      humidity: 86,
      co2: 680,
      soilMoisture: 71,
      updatedAt: '2026-09-01T08:25:00+07:00',
    },
    actuators: {
      cabinet: {
        exhaustFanStatus: true,
        supplyFanStatus: false,
        mainPumpStatus: true,
        lightingStatus: true,
      },
      tray: {
        valve1Status: false,
        valve2Status: false,
        valve3Status: false,
        valve4Status: false,
      },
      mode: 'AUTO',
    },
    camera: {
      streamUrl: 'https://example.invalid/mcms/tray-004.m3u8',
      resolution: '1280x720',
      fps: 20,
      isLive: true,
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
  toggleActuator: (id: string, actuator: ActuatorKey) => void
  setTrayMisting: (id: string, enabled: boolean) => void
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

function getNextNodeAddress(devices: Device[]): NodeAddress {
  const usedAddresses = new Set(devices.map((device) => device.node.nodeAddress))
  return NODE_ADDRESSES.find((address) => !usedAddresses.has(address)) ?? 4
}

function isCabinetActuator(actuator: ActuatorKey): actuator is CabinetActuatorKey {
  return (
    actuator === 'exhaustFanStatus' ||
    actuator === 'supplyFanStatus' ||
    actuator === 'mainPumpStatus' ||
    actuator === 'lightingStatus'
  )
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

function createDevice(
  values: DeviceFormValues,
  id: string,
  nodeAddress: NodeAddress,
): Device {
  const now = getNow()

  return {
    id,
    gateway: {
      ...MOCK_GATEWAY_MASTER,
      ipAddress: values.ipAddress,
      macAddress: values.macAddress.toUpperCase(),
      firmwareVersion: values.firmwareVersion,
      lastPingTimestamp: now,
    },
    node: {
      id: `NODE-${String(nodeAddress).padStart(3, '0')}`,
      model: 'STM32',
      protocol: 'RS485',
      nodeAddress,
      dipSwitch: NODE_ADDRESS_DIP_SWITCHES[nodeAddress],
      trayId: values.trayId,
      status: 'ONLINE',
    },
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
      cabinet: {
        exhaustFanStatus: false,
        supplyFanStatus: false,
        mainPumpStatus: false,
        lightingStatus: false,
      },
      tray: {
        valve1Status: false,
        valve2Status: false,
        valve3Status: false,
        valve4Status: false,
      },
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
    set((state) => {
      const nodeAddress = getNextNodeAddress(state.devices)
      return {
        devices: [
          createDevice(values, getNextDeviceId(state.devices), nodeAddress),
          ...state.devices,
        ],
      }
    }),

  updateDevice: (id, values) =>
    set((state) => ({
      devices: state.devices.map((device) =>
        device.id === id
          ? {
              ...device,
              gateway: {
                ...device.gateway,
                ipAddress: values.ipAddress,
                macAddress: values.macAddress.toUpperCase(),
                firmwareVersion: values.firmwareVersion,
              },
              node: { ...device.node, trayId: values.trayId },
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
    set((state) => {
      const targetDevice = state.devices.find((device) => device.id === id)

      if (!targetDevice) {
        return state
      }

      if (isCabinetActuator(actuator)) {
        const nextValue = !targetDevice.actuators.cabinet[actuator]
        return {
          devices: state.devices.map((device) =>
            device.gateway.id === targetDevice.gateway.id
              ? {
                  ...device,
                  actuators: {
                    ...device.actuators,
                    cabinet: {
                      ...device.actuators.cabinet,
                      [actuator]: nextValue,
                    },
                  },
                }
              : device,
          ),
        }
      }

      return {
        devices: state.devices.map((device) =>
          device.id === id
            ? {
                ...device,
                actuators: {
                  ...device.actuators,
                  tray: {
                    ...device.actuators.tray,
                    [actuator]: !device.actuators.tray[actuator],
                  },
                },
              }
            : device,
        ),
      }
    }),

  setTrayMisting: (id, enabled) =>
    set((state) => {
      const targetDevice = state.devices.find((device) => device.id === id)

      if (!targetDevice) {
        return state
      }

      const valveKey = getTrayValveKey(targetDevice.node.nodeAddress)
      const updatedDevices = state.devices.map((device) => {
        if (device.id !== id) {
          return device
        }

        const trayActuators: DeviceActuators['tray'] = {
          ...device.actuators.tray,
          [valveKey]: enabled,
        }

        return {
          ...device,
          actuators: { ...device.actuators, tray: trayActuators },
        }
      })
      const hasActiveValve = updatedDevices
        .filter((device) => device.gateway.id === targetDevice.gateway.id)
        .some((device) => Object.values(device.actuators.tray).some(Boolean))

      return {
        devices: updatedDevices.map((device) =>
          device.gateway.id === targetDevice.gateway.id
            ? {
                ...device,
                actuators: {
                  ...device.actuators,
                  cabinet: {
                    ...device.actuators.cabinet,
                    mainPumpStatus: hasActiveValve,
                  },
                },
              }
            : device,
        ),
      }
    }),

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
      devices: state.devices.map((device) => {
        if (device.id !== id) {
          return device
        }

        const status = device.status === 'ERROR' ? 'WARNING' : 'ONLINE'
        const lastPingTimestamp = getNow()
        const wifiRssi = Math.max(
          -90,
          Math.min(-35, device.wifiRssi + Math.round(getRandomDelta(8))),
        )

        return {
          ...device,
          status,
          lastPingTimestamp,
          wifiRssi,
          node: { ...device.node, status },
          gateway: { ...device.gateway, lastPingTimestamp, wifiRssi },
        }
      }),
    })),

  restartDevice: (id) =>
    set((state) => ({
      devices: state.devices.map((device) => {
        if (device.id !== id) {
          return device
        }

        const lastPingTimestamp = getNow()
        return {
          ...device,
          status: 'ONLINE',
          lastPingTimestamp,
          node: { ...device.node, status: 'ONLINE' },
          gateway: {
            ...device.gateway,
            status: 'ONLINE',
            lastPingTimestamp,
          },
          camera: { ...device.camera, isLive: true },
        }
      }),
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
