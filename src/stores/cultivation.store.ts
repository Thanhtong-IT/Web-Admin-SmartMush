import { create } from 'zustand'
import type {
  CultivationBatch,
  CultivationLogInput,
  GrowthStage,
  HarvestScheduleInput,
  MushroomQuality,
  RecordHarvestInput,
} from '../types/cultivation.types'

export const GROWTH_STAGE_ORDER: GrowthStage[] = [
  'INCUBATION',
  'PINNING',
  'FRUITING',
  'READY_TO_HARVEST',
  'HARVESTED',
]

const STAGE_PROGRESS: Record<GrowthStage, number> = {
  INCUBATION: 15,
  PINNING: 38,
  FRUITING: 65,
  READY_TO_HARVEST: 90,
  HARVESTED: 100,
}

const createLog = (
  id: string,
  stage: GrowthStage,
  note: string,
  loggedBy: string,
  actionTaken: string,
  timestamp: string,
) => ({ id, stage, note, loggedBy, actionTaken, timestamp })

export const MOCK_CULTIVATION_BATCHES: CultivationBatch[] = [
  {
    id: 'BATCH-001',
    batchCode: 'MCMS-2608-A01',
    trayId: 'TRAY-001',
    trayName: 'Khay tầng 1',
    mushroomType: 'Nấm Bào Ngư Xám',
    startDate: '2026-08-10',
    estimatedHarvestDate: '2026-09-08',
    actualHarvestDate: null,
    currentStage: 'PINNING',
    progressPercent: 42,
    expectedYieldKg: 4.5,
    actualYieldKg: null,
    operatorInCharge: 'Trần Quốc Huy',
    tenantName: 'Nguyễn Minh Anh',
    healthStatus: 'GRADE_A',
    logs: [
      createLog(
        'LOG-001',
        'INCUBATION',
        'Sợi nấm phủ đều bề mặt giá thể.',
        'Trần Quốc Huy',
        'Duy trì ẩm 88% và giảm thông gió.',
        '2026-08-18T08:00:00+07:00',
      ),
      createLog(
        'LOG-002',
        'PINNING',
        'Đã xuất hiện các điểm ghim đầu tiên.',
        'Trần Quốc Huy',
        'Tăng chu kỳ chiếu sáng lên 10 giờ/ngày.',
        '2026-08-28T09:15:00+07:00',
      ),
    ],
  },
  {
    id: 'BATCH-002',
    batchCode: 'MCMS-2607-L02',
    trayId: 'TRAY-002',
    trayName: 'Khay tầng 2',
    mushroomType: 'Nấm Linh Chi',
    startDate: '2026-07-20',
    estimatedHarvestDate: '2026-09-18',
    actualHarvestDate: null,
    currentStage: 'FRUITING',
    progressPercent: 68,
    expectedYieldKg: 6.2,
    actualYieldKg: null,
    operatorInCharge: 'Phạm Hoàng Nam',
    tenantName: 'Trần Quốc Bảo',
    healthStatus: 'GRADE_A',
    logs: [
      createLog(
        'LOG-003',
        'FRUITING',
        'Tai nấm phát triển đồng đều, màu sắc ổn định.',
        'Phạm Hoàng Nam',
        'Giữ CO₂ dưới 800 ppm.',
        '2026-08-30T14:20:00+07:00',
      ),
    ],
  },
  {
    id: 'BATCH-003',
    batchCode: 'MCMS-2607-H03',
    trayId: 'TRAY-004',
    trayName: 'Khay tầng 4',
    mushroomType: 'Nấm Hoàng Kim',
    startDate: '2026-07-28',
    estimatedHarvestDate: '2026-09-04',
    actualHarvestDate: null,
    currentStage: 'READY_TO_HARVEST',
    progressPercent: 92,
    expectedYieldKg: 3.8,
    actualYieldKg: null,
    operatorInCharge: 'Trần Quốc Huy',
    tenantName: 'Lê Thu Hà',
    healthStatus: 'GRADE_B',
    logs: [
      createLog(
        'LOG-004',
        'READY_TO_HARVEST',
        'Mũ nấm đạt kích thước tiêu chuẩn.',
        'Trần Quốc Huy',
        'Đã đặt lịch thu hoạch đợt đầu.',
        '2026-08-31T07:45:00+07:00',
      ),
    ],
  },
  {
    id: 'BATCH-004',
    batchCode: 'MCMS-2608-M04',
    trayId: 'TRAY-003',
    trayName: 'Khay tầng 3',
    mushroomType: 'Nấm Mối Đen',
    startDate: '2026-08-25',
    estimatedHarvestDate: '2026-10-08',
    actualHarvestDate: null,
    currentStage: 'INCUBATION',
    progressPercent: 16,
    expectedYieldKg: 4.1,
    actualYieldKg: null,
    operatorInCharge: 'Phạm Hoàng Nam',
    tenantName: 'Võ Ngọc Thảo',
    healthStatus: 'GRADE_A',
    logs: [],
  },
  {
    id: 'BATCH-005',
    batchCode: 'MCMS-2605-C05',
    trayId: 'TRAY-005',
    trayName: 'Khay tầng 5',
    mushroomType: 'Đông Trùng Hạ Thảo',
    startDate: '2026-05-01',
    estimatedHarvestDate: '2026-08-28',
    actualHarvestDate: '2026-08-27',
    currentStage: 'HARVESTED',
    progressPercent: 100,
    expectedYieldKg: 2.5,
    actualYieldKg: 2.3,
    operatorInCharge: 'Trần Quốc Huy',
    tenantName: 'Nguyễn Minh Anh',
    healthStatus: 'GRADE_A',
    logs: [
      createLog(
        'LOG-005',
        'HARVESTED',
        'Đã hoàn tất thu hoạch, chất lượng đạt Grade A.',
        'Trần Quốc Huy',
        'Đóng gói và chuyển kho mát.',
        '2026-08-27T16:00:00+07:00',
      ),
    ],
  },
  {
    id: 'BATCH-006',
    batchCode: 'MCMS-2607-W06',
    trayId: 'TRAY-006',
    trayName: 'Khay tầng 6',
    mushroomType: 'Nấm Bào Ngư Xám',
    startDate: '2026-07-30',
    estimatedHarvestDate: '2026-09-12',
    actualHarvestDate: null,
    currentStage: 'FRUITING',
    progressPercent: 61,
    expectedYieldKg: 4.8,
    actualYieldKg: null,
    operatorInCharge: 'Phạm Hoàng Nam',
    tenantName: 'Trần Quốc Bảo',
    healthStatus: 'WARNING_CONTAMINATED',
    logs: [
      createLog(
        'LOG-006',
        'FRUITING',
        'Phát hiện đốm mốc xanh ở góc khay.',
        'Phạm Hoàng Nam',
        'Cách ly khay và giảm độ ẩm xuống 78%.',
        '2026-08-29T10:30:00+07:00',
      ),
    ],
  },
]

interface CultivationState {
  batches: CultivationBatch[]
  advanceStage: (batchId: string) => void
  addLog: (batchId: string, values: CultivationLogInput) => void
  scheduleHarvest: (batchId: string, values: HarvestScheduleInput) => void
  recordHarvest: (batchId: string, values: RecordHarvestInput) => void
  markContaminated: (batchId: string) => void
}

function getNextLogId(logs: CultivationBatch['logs']) {
  return `LOG-${String(logs.length + 1).padStart(3, '0')}-${Date.now()}`
}

export const useCultivationStore = create<CultivationState>((set) => ({
  batches: MOCK_CULTIVATION_BATCHES,

  advanceStage: (batchId) =>
    set((state) => ({
      batches: state.batches.map((batch) => {
        if (batch.id !== batchId) {
          return batch
        }

        const currentIndex = GROWTH_STAGE_ORDER.indexOf(batch.currentStage)
        const nextStage =
          GROWTH_STAGE_ORDER[Math.min(currentIndex + 1, GROWTH_STAGE_ORDER.length - 1)]

        return {
          ...batch,
          currentStage: nextStage,
          progressPercent: Math.max(batch.progressPercent, STAGE_PROGRESS[nextStage]),
        }
      }),
    })),

  addLog: (batchId, values) =>
    set((state) => ({
      batches: state.batches.map((batch) =>
        batch.id === batchId
          ? {
              ...batch,
              logs: [
                {
                  ...values,
                  id: getNextLogId(batch.logs),
                  timestamp: new Date().toISOString(),
                },
                ...batch.logs,
              ],
            }
          : batch,
      ),
    })),

  scheduleHarvest: (batchId, values) =>
    set((state) => ({
      batches: state.batches.map((batch) =>
        batch.id === batchId
          ? {
              ...batch,
              estimatedHarvestDate: values.estimatedHarvestDate,
              expectedYieldKg: values.expectedYieldKg,
              operatorInCharge: values.operatorInCharge,
            }
          : batch,
      ),
    })),

  recordHarvest: (batchId, values) =>
    set((state) => ({
      batches: state.batches.map((batch) => {
        if (batch.id !== batchId) {
          return batch
        }

        const harvestLog = {
          id: getNextLogId(batch.logs),
          timestamp: new Date().toISOString(),
          stage: 'HARVESTED' as const,
          note: values.notes || 'Đã hoàn tất thu hoạch.',
          loggedBy: 'Quản trị viên MCMS',
          actionTaken: `Ghi nhận thực thu ${values.actualYieldKg} kg - ${values.quality}.`,
        }

        return {
          ...batch,
          currentStage: 'HARVESTED',
          progressPercent: 100,
          actualHarvestDate: values.actualHarvestDate,
          actualYieldKg: values.actualYieldKg,
          healthStatus: values.quality,
          logs: [harvestLog, ...batch.logs],
        }
      }),
    })),

  markContaminated: (batchId) =>
    set((state) => ({
      batches: state.batches.map((batch) => {
        if (batch.id !== batchId) {
          return batch
        }

        const warningLog = {
          id: getNextLogId(batch.logs),
          timestamp: new Date().toISOString(),
          stage: batch.currentStage,
          note: 'Mẻ nấm được đánh dấu cần xử lý sâu bệnh hoặc mốc.',
          loggedBy: 'Quản trị viên MCMS',
          actionTaken: 'Cách ly mẻ và tạo cảnh báo kiểm tra thủ công.',
        }

        return {
          ...batch,
          healthStatus: 'WARNING_CONTAMINATED' as MushroomQuality,
          logs: [warningLog, ...batch.logs],
        }
      }),
    })),
}))
