export const DEVICE_STATUSES = ['ONLINE', 'OFFLINE', 'WARNING', 'ERROR'] as const
export type DeviceStatus = (typeof DEVICE_STATUSES)[number]

export const CONTROL_MODES = ['AUTO', 'MANUAL'] as const
export type ControlMode = (typeof CONTROL_MODES)[number]

export const CAMERA_VIEWS = ['OVERVIEW', 'CLOSE_UP'] as const
export type CameraView = (typeof CAMERA_VIEWS)[number]

export const NODE_ADDRESSES = [1, 2, 3, 4] as const
export type NodeAddress = (typeof NODE_ADDRESSES)[number]

export const NODE_ADDRESS_DIP_SWITCHES: Record<NodeAddress, string> = {
  1: '001',
  2: '010',
  3: '011',
  4: '100',
}

export interface DeviceTelemetry {
  temperature: number
  humidity: number
  co2: number
  soilMoisture: number
  updatedAt: string
}

export interface CabinetActuators {
  exhaustFanStatus: boolean
  supplyFanStatus: boolean
  mainPumpStatus: boolean
  lightingStatus: boolean
}

export interface TrayActuators {
  valve1Status: boolean
  valve2Status: boolean
  valve3Status: boolean
  valve4Status: boolean
}

export type CabinetActuatorKey = keyof CabinetActuators
export type TrayValveKey = keyof TrayActuators
export type ActuatorKey = CabinetActuatorKey | TrayValveKey

export interface DeviceActuators {
  cabinet: CabinetActuators
  tray: TrayActuators
  mode: ControlMode
}

export interface GatewayMaster {
  id: string
  model: 'ESP32-S3'
  ipAddress: string
  macAddress: string
  firmwareVersion: string
  lastPingTimestamp: string | null
  wifiRssi: number
  status: DeviceStatus
}

export interface TrayNode {
  id: string
  model: 'STM32'
  protocol: 'RS485'
  nodeAddress: NodeAddress
  dipSwitch: string
  trayId: string
  status: DeviceStatus
}

const TRAY_VALVE_KEYS: Record<NodeAddress, TrayValveKey> = {
  1: 'valve1Status',
  2: 'valve2Status',
  3: 'valve3Status',
  4: 'valve4Status',
}

export function getTrayValveKey(nodeAddress: NodeAddress): TrayValveKey {
  return TRAY_VALVE_KEYS[nodeAddress]
}

export interface CameraConfig {
  streamUrl: string
  resolution: string
  fps: number
  isLive: boolean
  lastSnapshotUrl: string | null
}

export interface Device {
  id: string
  gateway: GatewayMaster
  node: TrayNode
  firmwareVersion: string
  lastPingTimestamp: string | null
  wifiRssi: number
  status: DeviceStatus
  telemetry: DeviceTelemetry
  actuators: DeviceActuators
  camera: CameraConfig
}

export interface DeviceFormValues {
  trayId: string
  ipAddress: string
  macAddress: string
  firmwareVersion: string
  streamUrl: string
  resolution: string
  fps: number
}
