export type GrowthStage =
  | 'INCUBATION'
  | 'PINNING'
  | 'FRUITING'
  | 'READY_TO_HARVEST'
  | 'HARVESTED'

export type MushroomQuality =
  | 'GRADE_A'
  | 'GRADE_B'
  | 'WARNING_CONTAMINATED'

export interface CultivationLog {
  id: string
  timestamp: string
  stage: GrowthStage
  note: string
  loggedBy: string
  actionTaken: string
}

export interface CultivationBatch {
  id: string
  batchCode: string
  trayId: string
  trayName: string
  mushroomType: string
  startDate: string
  estimatedHarvestDate: string
  actualHarvestDate: string | null
  currentStage: GrowthStage
  progressPercent: number
  expectedYieldKg: number
  actualYieldKg: number | null
  operatorInCharge: string
  tenantName: string
  healthStatus: MushroomQuality
  logs: CultivationLog[]
}

export type CultivationLogInput = Omit<CultivationLog, 'id' | 'timestamp'>

export interface HarvestScheduleInput {
  estimatedHarvestDate: string
  expectedYieldKg: number
  operatorInCharge: string
}

export interface RecordHarvestInput {
  actualHarvestDate: string
  actualYieldKg: number
  quality: MushroomQuality
  notes: string
}
