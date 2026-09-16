import { create } from 'zustand'
import type {
  MushroomThresholdProfile,
  ThresholdProfileInput,
} from '../types/setting.types'

const SETTINGS_STORAGE_KEY = 'mcms-threshold-profiles'

/** Chu kỳ gói (tuần) cho từng giống nấm — đồng bộ với Pricing Model. */
const CYCLE_WEEKS_BY_TYPE: Record<string, number> = {
  'Nấm Bào Ngư Xám': 1,
  'Nấm Bào Ngư Trắng': 1,
  'Nấm Hoàng Kim': 1,
  'Nấm Linh Chi': 3,
  'Nấm Mối Đen': 2,
  'Đông Trùng Hạ Thảo': 4,
}

export const DEFAULT_THRESHOLD_PROFILES: MushroomThresholdProfile[] = [
  {
    id: 'THRESHOLD-001',
    mushroomType: 'Nấm Bào Ngư Xám',
    name: 'Bào Ngư Xám tiêu chuẩn',
    cycleWeeks: 1,
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
    cycleWeeks: 3,
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
    cycleWeeks: 1,
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
    cycleWeeks: 2,
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
    cycleWeeks: 4,
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

/** Trả về chu kỳ gói (tuần) cho loại nấm, mặc định 1 tuần. */
export function getCycleWeeksFor(mushroomType: string): number {
  return CYCLE_WEEKS_BY_TYPE[mushroomType] ?? 1
}

interface PersistedSettings {
  thresholdProfiles: MushroomThresholdProfile[]
}

interface SettingState extends PersistedSettings {
  addThresholdProfile: (values: ThresholdProfileInput) => void
  updateThresholdProfile: (
    id: string,
    values: ThresholdProfileInput,
  ) => void
  setDefaultThresholdProfile: (id: string) => void
  deleteThresholdProfile: (id: string) => void
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
    cycleWeeks,
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
    cycleWeeks: isNumber(cycleWeeks) ? cycleWeeks : getCycleWeeksFor(mushroomType),
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

function readPersistedProfiles(): MushroomThresholdProfile[] {
  if (typeof window === 'undefined') {
    return DEFAULT_THRESHOLD_PROFILES
  }

  try {
    const rawValue = window.localStorage.getItem(SETTINGS_STORAGE_KEY)
    const parsedValue: unknown = rawValue ? JSON.parse(rawValue) : null

    if (!isRecord(parsedValue) || !Array.isArray(parsedValue.thresholdProfiles)) {
      return DEFAULT_THRESHOLD_PROFILES
    }

    const profiles = parsedValue.thresholdProfiles
      .map(parseThresholdProfile)
      .filter((profile): profile is MushroomThresholdProfile => profile !== null)

    return profiles.length > 0 ? profiles : DEFAULT_THRESHOLD_PROFILES
  } catch {
    return DEFAULT_THRESHOLD_PROFILES
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

const initialProfiles = readPersistedProfiles()

export const useSettingStore = create<SettingState>((set) => ({
  thresholdProfiles: initialProfiles,

  addThresholdProfile: (values) =>
    set((state) => ({
      thresholdProfiles: [
        {
          ...values,
          id: getNextProfileId(state.thresholdProfiles),
          cycleWeeks:
            values.cycleWeeks ?? getCycleWeeksFor(values.mushroomType),
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
          ? {
              ...profile,
              ...values,
              cycleWeeks:
                values.cycleWeeks ?? getCycleWeeksFor(values.mushroomType),
              updatedAt: getNow(),
            }
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
}))

useSettingStore.subscribe((state) => {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem(
      SETTINGS_STORAGE_KEY,
      JSON.stringify({ thresholdProfiles: state.thresholdProfiles }),
    )
  } catch {
    // Private mode or quota exhaustion should not break in-memory settings.
  }
})
