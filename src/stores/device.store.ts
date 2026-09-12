import { create } from 'zustand'
import type {
  CameraConfig,
  GatewayMaster,
  GatewayRelayKey,
  Rs485Node,
} from '../types/device.types'

export const MOCK_GATEWAY_MASTER: GatewayMaster = {
  id: 'gateway-esp32-s3-master',
  model: 'ESP32-S3',
  ipAddress: '192.168.1.100',
  macAddress: '7C:DF:A1:10:20:30',
  firmwareVersion: 'v2.2.0',
  lastPingTimestamp: '2026-09-12T09:30:00+07:00',
  wifiRssi: -46,
  status: 'ONLINE',
  relays: {
    mainPump: true,
    exhaustFan: true,
    rackLighting: false,
  },
}

export const MOCK_RS485_NODES: Rs485Node[] = [
  {
    id: 'node-stm32-01',
    model: 'STM32',
    protocol: 'RS485',
    address: 1,
    tierId: 1,
    firmwareVersion: 'v1.5.0',
    status: 'ONLINE',
    lastSeenAt: '2026-09-12T09:30:00+07:00',
    latencyMs: 18,
    packetLossPercent: 0,
  },
  {
    id: 'node-stm32-02',
    model: 'STM32',
    protocol: 'RS485',
    address: 2,
    tierId: 2,
    firmwareVersion: 'v1.5.0',
    status: 'ONLINE',
    lastSeenAt: '2026-09-12T09:29:58+07:00',
    latencyMs: 21,
    packetLossPercent: 0.2,
  },
  {
    id: 'node-stm32-03',
    model: 'STM32',
    protocol: 'RS485',
    address: 3,
    tierId: 3,
    firmwareVersion: 'v1.4.8',
    status: 'WARNING',
    lastSeenAt: '2026-09-12T09:29:42+07:00',
    latencyMs: 86,
    packetLossPercent: 3.4,
  },
  {
    id: 'node-stm32-04',
    model: 'STM32',
    protocol: 'RS485',
    address: 4,
    tierId: 4,
    firmwareVersion: 'v1.5.0',
    status: 'ONLINE',
    lastSeenAt: '2026-09-12T09:29:59+07:00',
    latencyMs: 24,
    packetLossPercent: 0.1,
  },
]

export const MOCK_OVERVIEW_CAMERA: CameraConfig = {
  id: 'camera-front-overview',
  name: 'Front Overview Camera',
  streamUrl: 'rtsp://192.168.1.110/live/front-overview',
  resolution: '1920x1080',
  fps: 25,
  isLive: true,
  lastSnapshotUrl: null,
}

interface DeviceState {
  gateway: GatewayMaster
  nodes: Rs485Node[]
  camera: CameraConfig
  toggleGatewayRelay: (relay: GatewayRelayKey) => void
  pingNode: (nodeId: Rs485Node['id']) => void
  restartNode: (nodeId: Rs485Node['id']) => void
  takeSnapshot: () => string
}

function getNow() {
  return new Date().toISOString()
}

export const useDeviceStore = create<DeviceState>((set) => ({
  gateway: MOCK_GATEWAY_MASTER,
  nodes: MOCK_RS485_NODES,
  camera: MOCK_OVERVIEW_CAMERA,

  toggleGatewayRelay: (relay) =>
    set((state) => ({
      gateway: {
        ...state.gateway,
        relays: {
          ...state.gateway.relays,
          [relay]: !state.gateway.relays[relay],
        },
      },
    })),

  pingNode: (nodeId) =>
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              status: 'ONLINE',
              lastSeenAt: getNow(),
              latencyMs: Math.max(10, Math.round(node.latencyMs * 0.65)),
              packetLossPercent: 0,
            }
          : node,
      ),
    })),

  restartNode: (nodeId) =>
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              status: 'ONLINE',
              lastSeenAt: getNow(),
              latencyMs: 20,
              packetLossPercent: 0,
            }
          : node,
      ),
    })),

  takeSnapshot: () => {
    const snapshotUrl = `https://placehold.co/1280x720/17211b/e8f5e9?text=${encodeURIComponent(
      'MCMS Rack Overview',
    )}`

    set((state) => ({
      camera: { ...state.camera, lastSnapshotUrl: snapshotUrl },
    }))

    return snapshotUrl
  },
}))
