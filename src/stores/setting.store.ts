import { create } from 'zustand'
import type {
  MushroomThresholdProfile,
  NotificationChannelConfig,
  SystemIoTConfig,
  ThresholdProfileInput,
} from '../types/setting.types'

const SETTINGS_STORAGE_KEY = 'mcms-system-settings'

export const DEFAULT_SYSTEM_CONFIG: SystemIoTConfig = {
  telemetryIntervalSeconds: 10,
  deviceOfflineTimeoutMinutes: 5,
  cameraSnapshotIntervalMinutes: 15,
  autoRelayTriggerEnabled: true,
  debugMode: false,
}

export const DEFAULT_NOTIFICATION_CONFIG: NotificationChannelConfig = {
  emailEnabled: true,
  adminEmail: 'admin@mcms.vn',
  telegramEnabled: false,
  telegramBotToken: '',
  telegramChatId: '',
  zaloEnabled: false,
  criticalAlertsOnly: true,
  dailyReportEmail: 'reports@mcms.vn',
}

export const DEFAULT_THRESHOLD_PROFILES: MushroomThresholdProfile[] = [
  {
    id: 'THRESHOLD-001',
    mushroomType: 'Nấm Bào Ngư Xám',
    name: 'Bào Ngư Xám tiêu chuẩn',
    tempMin: 20,
    tempMax: 28,
    humidityMin: 75,
    humidityMax: 95,
    co2Max: 1000,
    soilMoistureMin: 60,
    soilMoistureMax: 85,
    isDefault: true,
    updatedAt: '2026-08-20T08:00:00+07:00',
  },
  {
    id: 'THRESHOLD-002',
    mushroomType: 'Nấm Linh Chi',
    name: 'Linh Chi sinh trưởng dài ngày',
    tempMin: 22,
    tempMax: 30,
    humidityMin: 70,
    humidityMax: 90,
    co2Max: 900,
    soilMoistureMin: 55,
    soilMoistureMax: 80,
    isDefault: false,
    updatedAt: '2026-08-20T08:00:00+07:00',
  },
  {
    id: 'THRESHOLD-003',
    mushroomType: 'Nấm Hoàng Kim',
    name: 'Hoàng Kim ra quả nhanh',
    tempMin: 18,
    tempMax: 26,
    humidityMin: 80,
    humidityMax: 95,
    co2Max: 850,
    soilMoistureMin: 65,
    soilMoistureMax: 90,
    isDefault: false,
    updatedAt: '2026-08-21T08:00:00+07:00',
  },
  {
    id: 'THRESHOLD-004',
    mushroomType: 'Nấm Mối Đen',
    name: 'Mối Đen vi khí hậu ổn định',
    tempMin: 21,
    tempMax: 27,
    humidityMin: 78,
    humidityMax: 92,
    co2Max: 950,
    soilMoistureMin: 60,
    soilMoistureMax: 82,
    isDefault: false,
    updatedAt: '2026-08-21T08:00:00+07:00',
  },
  {
    id: 'THRESHOLD-005',
    mushroomType: 'Đông Trùng Hạ Thảo',
    name: 'Đông Trùng phòng nuôi chuyên dụng',
    tempMin: 18,
    tempMax: 24,
    humidityMin: 85,
    humidityMax: 95,
    co2Max: 700,
    soilMoistureMin: 50,
    soilMoistureMax: 75,
    isDefault: false,
    updatedAt: '2026-08-22T08:00:00+07:00',
  },
]

interface PersistedSettings {
  thresholdProfiles: MushroomThresholdProfile[]
  systemConfig: SystemIoTConfig
  notificationConfig: NotificationChannelConfig
}

interface SettingState extends PersistedSettings {
  addThresholdProfile: (values: ThresholdProfileInput) => void
  updateThresholdProfile: (
    id: string,
    values: ThresholdProfileInput,
  ) => void
  setDefaultThresholdProfile: (id: string) => void
  deleteThresholdProfile: (id: string) => void
  updateSystemConfig: (values: Partial<SystemIoTConfig>) => void
  resetSystemConfig: () => void
  updateNotificationConfig: (
    values: Partial<NotificationChannelConfig>,
  ) => void
  resetNotificationConfig: () => void
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function isString(value: unknown): value is string {
  return typeof value === 'string'
}

function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean'
}

function parseThresholdProfile(value: unknown): MushroomThresholdProfile | null {
  if (!isRecord(value)) {
    return null
  }

  const {
    id,
    mushroomType,
    name,
    tempMin,
    tempMax,
    humidityMin,
    humidityMax,
    co2Max,
    soilMoistureMin,
    soilMoistureMax,
    isDefault,
    updatedAt,
  } = value

  if (
    !isString(id) ||
    !isString(mushroomType) ||
    !isString(name) ||
    !isNumber(tempMin) ||
    !isNumber(tempMax) ||
    !isNumber(humidityMin) ||
    !isNumber(humidityMax) ||
    !isNumber(co2Max) ||
    !isNumber(soilMoistureMin) ||
    !isNumber(soilMoistureMax) ||
    !isBoolean(isDefault) ||
    !isString(updatedAt)
  ) {
    return null
  }

  return {
    id,
    mushroomType,
    name,
    tempMin,
    tempMax,
    humidityMin,
    humidityMax,
    co2Max,
    soilMoistureMin,
    soilMoistureMax,
    isDefault,
    updatedAt,
  }
}

function isTelemetryInterval(
  value: unknown,
): value is SystemIoTConfig['telemetryIntervalSeconds'] {
  return value === 5 || value === 10 || value === 30 || value === 60
}

function isOfflineTimeout(
  value: unknown,
): value is SystemIoTConfig['deviceOfflineTimeoutMinutes'] {
  return value === 1 || value === 3 || value === 5
}

function isSnapshotInterval(
  value: unknown,
): value is SystemIoTConfig['cameraSnapshotIntervalMinutes'] {
  return value === 5 || value === 15 || value === 60
}

function parseSystemConfig(value: unknown): SystemIoTConfig | null {
  if (!isRecord(value)) {
    return null
  }

  if (
    !isTelemetryInterval(value.telemetryIntervalSeconds) ||
    !isOfflineTimeout(value.deviceOfflineTimeoutMinutes) ||
    !isSnapshotInterval(value.cameraSnapshotIntervalMinutes) ||
    !isBoolean(value.autoRelayTriggerEnabled) ||
    !isBoolean(value.debugMode)
  ) {
    return null
  }

  return {
    telemetryIntervalSeconds: value.telemetryIntervalSeconds,
    deviceOfflineTimeoutMinutes: value.deviceOfflineTimeoutMinutes,
    cameraSnapshotIntervalMinutes: value.cameraSnapshotIntervalMinutes,
    autoRelayTriggerEnabled: value.autoRelayTriggerEnabled,
    debugMode: value.debugMode,
  }
}

function parseNotificationConfig(
  value: unknown,
): NotificationChannelConfig | null {
  if (!isRecord(value)) {
    return null
  }

  if (
    !isBoolean(value.emailEnabled) ||
    !isString(value.adminEmail) ||
    !isBoolean(value.telegramEnabled) ||
    !isString(value.telegramBotToken) ||
    !isString(value.telegramChatId) ||
    !isBoolean(value.zaloEnabled) ||
    !isBoolean(value.criticalAlertsOnly) ||
    !isString(value.dailyReportEmail)
  ) {
    return null
  }

  return {
    emailEnabled: value.emailEnabled,
    adminEmail: value.adminEmail,
    telegramEnabled: value.telegramEnabled,
    telegramBotToken: value.telegramBotToken,
    telegramChatId: value.telegramChatId,
    zaloEnabled: value.zaloEnabled,
    criticalAlertsOnly: value.criticalAlertsOnly,
    dailyReportEmail: value.dailyReportEmail,
  }
}

function readPersistedSettings(): PersistedSettings {
  if (typeof window === 'undefined') {
    return {
      thresholdProfiles: DEFAULT_THRESHOLD_PROFILES,
      systemConfig: DEFAULT_SYSTEM_CONFIG,
      notificationConfig: DEFAULT_NOTIFICATION_CONFIG,
    }
  }

  try {
    const rawValue = window.localStorage.getItem(SETTINGS_STORAGE_KEY)
    const parsedValue: unknown = rawValue ? JSON.parse(rawValue) : null

    if (!isRecord(parsedValue)) {
      throw new Error('Invalid persisted settings')
    }

    const profiles = Array.isArray(parsedValue.thresholdProfiles)
      ? parsedValue.thresholdProfiles
          .map(parseThresholdProfile)
          .filter((profile): profile is MushroomThresholdProfile => profile !== null)
      : []

    return {
      thresholdProfiles:
        profiles.length > 0 ? profiles : DEFAULT_THRESHOLD_PROFILES,
      systemConfig:
        parseSystemConfig(parsedValue.systemConfig) ?? DEFAULT_SYSTEM_CONFIG,
      notificationConfig:
        parseNotificationConfig(parsedValue.notificationConfig) ??
        DEFAULT_NOTIFICATION_CONFIG,
    }
  } catch {
    return {
      thresholdProfiles: DEFAULT_THRESHOLD_PROFILES,
      systemConfig: DEFAULT_SYSTEM_CONFIG,
      notificationConfig: DEFAULT_NOTIFICATION_CONFIG,
    }
  }
}

function getNextProfileId(profiles: MushroomThresholdProfile[]) {
  const highestId = profiles.reduce((highest, profile) => {
    const match = /^THRESHOLD-(\d+)$/.exec(profile.id)
    const numericId = match ? Number(match[1]) : 0

    return Math.max(highest, numericId)
  }, 0)

  return `THRESHOLD-${String(highestId + 1).padStart(3, '0')}`
}

function getNow() {
  return new Date().toISOString()
}

const initialSettings = readPersistedSettings()

export const useSettingStore = create<SettingState>((set) => ({
  ...initialSettings,

  addThresholdProfile: (values) =>
    set((state) => ({
      thresholdProfiles: [
        {
          ...values,
          id: getNextProfileId(state.thresholdProfiles),
          isDefault: false,
          updatedAt: getNow(),
        },
        ...state.thresholdProfiles,
      ],
    })),

  updateThresholdProfile: (id, values) =>
    set((state) => ({
      thresholdProfiles: state.thresholdProfiles.map((profile) =>
        profile.id === id
          ? { ...profile, ...values, updatedAt: getNow() }
          : profile,
      ),
    })),

  setDefaultThresholdProfile: (id) =>
    set((state) => ({
      thresholdProfiles: state.thresholdProfiles.map((profile) => ({
        ...profile,
        isDefault: profile.id === id,
        updatedAt: profile.id === id ? getNow() : profile.updatedAt,
      })),
    })),

  deleteThresholdProfile: (id) =>
    set((state) => ({
      thresholdProfiles: state.thresholdProfiles.filter(
        (profile) => profile.id !== id || profile.isDefault,
      ),
    })),

  updateSystemConfig: (values) =>
    set((state) => ({
      systemConfig: { ...state.systemConfig, ...values },
    })),

  resetSystemConfig: () =>
    set({ systemConfig: { ...DEFAULT_SYSTEM_CONFIG } }),

  updateNotificationConfig: (values) =>
    set((state) => ({
      notificationConfig: {
        ...state.notificationConfig,
        ...values,
      },
    })),

  resetNotificationConfig: () =>
    set({ notificationConfig: { ...DEFAULT_NOTIFICATION_CONFIG } }),
}))

useSettingStore.subscribe((state) => {
  if (typeof window === 'undefined') {
    return
  }

  const persistedSettings: PersistedSettings = {
    thresholdProfiles: state.thresholdProfiles,
    systemConfig: state.systemConfig,
    notificationConfig: state.notificationConfig,
  }

  try {
    window.localStorage.setItem(
      SETTINGS_STORAGE_KEY,
      JSON.stringify(persistedSettings),
    )
  } catch {
    // Private mode or quota exhaustion should not break in-memory settings.
  }
})
