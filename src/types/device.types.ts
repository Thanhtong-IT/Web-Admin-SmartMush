export const DEVICE_STATUSES = ['ONLINE', 'OFFLINE', 'WARNING', 'ERROR'] as const
export type DeviceStatus = (typeof DEVICE_STATUSES)[number]

export const CONTROL_MODES = ['AUTO', 'MANUAL'] as const
export type ControlMode = (typeof CONTROL_MODES)[number]

export const CAMERA_VIEWS = ['OVERVIEW', 'CLOSE_UP'] as const
export type CameraView = (typeof CAMERA_VIEWS)[number]

export interface DeviceTelemetry {
  temperature: number
  humidity: number
  co2: number
  soilMoisture: number
  updatedAt: string
}

export interface DeviceActuators {
  fanStatus: boolean
  pumpStatus: boolean
  lightStatus: boolean
  mode: ControlMode
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
  trayId: string
  ipAddress: string
  macAddress: string
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
