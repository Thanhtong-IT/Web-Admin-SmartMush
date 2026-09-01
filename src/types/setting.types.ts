export interface MushroomThresholdProfile {
  id: string
  mushroomType: string
  name: string
  tempMin: number
  tempMax: number
  humidityMin: number
  humidityMax: number
  co2Max: number
  soilMoistureMin: number
  soilMoistureMax: number
  isDefault: boolean
  updatedAt: string
}

export type ThresholdProfileInput = Omit<
  MushroomThresholdProfile,
  'id' | 'isDefault' | 'updatedAt'
>

export interface SystemIoTConfig {
  telemetryIntervalSeconds: 5 | 10 | 30 | 60
  deviceOfflineTimeoutMinutes: 1 | 3 | 5
  cameraSnapshotIntervalMinutes: 5 | 15 | 60
  autoRelayTriggerEnabled: boolean
  debugMode: boolean
}

export interface NotificationChannelConfig {
  emailEnabled: boolean
  adminEmail: string
  telegramEnabled: boolean
  telegramBotToken: string
  telegramChatId: string
  zaloEnabled: boolean
  criticalAlertsOnly: boolean
  dailyReportEmail: string
}
