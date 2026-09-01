import { create } from 'zustand'
import type {
  EnvironmentHistoryPoint,
  ReportPeriod,
  RevenueSummary,
  SystemAlert,
  YieldSummary,
} from '../types/alert.types'

export const MOCK_ALERTS: SystemAlert[] = [
  {
    id: 'ALERT-001',
    trayId: 'TRAY-001',
    trayName: 'Khay tầng 1',
    deviceId: 'DEVICE-001',
    category: 'CO2',
    severity: 'CRITICAL',
    message: 'Nồng độ CO₂ vượt ngưỡng an toàn cho nấm bào ngư.',
    currentValue: 1420,
    thresholdValue: 1000,
    timestamp: '2026-09-01T08:35:00+07:00',
    isRead: false,
    isAcknowledged: false,
    acknowledgedBy: null,
    acknowledgedAt: null,
  },
  {
    id: 'ALERT-002',
    trayId: 'TRAY-004',
    trayName: 'Khay tầng 4',
    deviceId: 'DEVICE-004',
    category: 'TEMPERATURE',
    severity: 'WARNING',
    message: 'Nhiệt độ tăng đột biến trong khay nấm Hoàng Kim.',
    currentValue: 31.8,
    thresholdValue: 28,
    timestamp: '2026-09-01T08:22:00+07:00',
    isRead: true,
    isAcknowledged: false,
    acknowledgedBy: null,
    acknowledgedAt: null,
  },
  {
    id: 'ALERT-003',
    trayId: 'TRAY-003',
    trayName: 'Khay tầng 3',
    deviceId: 'DEVICE-003',
    category: 'DEVICE_OFFLINE',
    severity: 'CRITICAL',
    message: 'ESP32-03 mất kết nối quá 5 phút.',
    currentValue: 7,
    thresholdValue: 5,
    timestamp: '2026-09-01T08:10:00+07:00',
    isRead: false,
    isAcknowledged: false,
    acknowledgedBy: null,
    acknowledgedAt: null,
  },
  {
    id: 'ALERT-004',
    trayId: 'TRAY-002',
    trayName: 'Khay tầng 2',
    deviceId: 'DEVICE-002',
    category: 'HUMIDITY',
    severity: 'WARNING',
    message: 'Độ ẩm không khí đang tụt dưới vùng tối ưu.',
    currentValue: 68,
    thresholdValue: 75,
    timestamp: '2026-09-01T07:48:00+07:00',
    isRead: true,
    isAcknowledged: true,
    acknowledgedBy: 'Trần Quốc Huy',
    acknowledgedAt: '2026-09-01T07:55:00+07:00',
  },
  {
    id: 'ALERT-005',
    trayId: 'TRAY-006',
    trayName: 'Khay tầng 6',
    deviceId: 'DEVICE-006',
    category: 'HARDWARE_FAULT',
    severity: 'INFO',
    message: 'Relay quạt thông gió phản hồi chậm, cần theo dõi.',
    currentValue: 2.4,
    thresholdValue: 1,
    timestamp: '2026-09-01T07:30:00+07:00',
    isRead: false,
    isAcknowledged: false,
    acknowledgedBy: null,
    acknowledgedAt: null,
  },
  {
    id: 'ALERT-006',
    trayId: 'TRAY-001',
    trayName: 'Khay tầng 1',
    deviceId: 'DEVICE-001',
    category: 'HUMIDITY',
    severity: 'INFO',
    message: 'Chu kỳ phun sương buổi sáng đã hoàn tất.',
    currentValue: 86,
    thresholdValue: 80,
    timestamp: '2026-09-01T06:00:00+07:00',
    isRead: true,
    isAcknowledged: true,
    acknowledgedBy: 'Hệ thống tự động',
    acknowledgedAt: '2026-09-01T06:01:00+07:00',
  },
]

export const MOCK_ENVIRONMENT_HISTORY: EnvironmentHistoryPoint[] = [
  { time: '26/08', date: '2026-08-26', temperature: 24.1, humidity: 88, co2: 620, soilMoisture: 72, trayId: 'TRAY-001' },
  { time: '27/08', date: '2026-08-27', temperature: 24.8, humidity: 86, co2: 680, soilMoisture: 70, trayId: 'TRAY-001' },
  { time: '28/08', date: '2026-08-28', temperature: 25.4, humidity: 84, co2: 720, soilMoisture: 68, trayId: 'TRAY-001' },
  { time: '29/08', date: '2026-08-29', temperature: 26.2, humidity: 82, co2: 790, soilMoisture: 66, trayId: 'TRAY-001' },
  { time: '30/08', date: '2026-08-30', temperature: 27.1, humidity: 79, co2: 900, soilMoisture: 63, trayId: 'TRAY-001' },
  { time: '31/08', date: '2026-08-31', temperature: 26.4, humidity: 81, co2: 760, soilMoisture: 65, trayId: 'TRAY-001' },
  { time: '01/09', date: '2026-09-01', temperature: 25.6, humidity: 87, co2: 642, soilMoisture: 74, trayId: 'TRAY-001' },
  { time: '26/08', date: '2026-08-26', temperature: 25.8, humidity: 83, co2: 710, soilMoisture: 69, trayId: 'TRAY-002' },
  { time: '27/08', date: '2026-08-27', temperature: 26.2, humidity: 82, co2: 760, soilMoisture: 67, trayId: 'TRAY-002' },
  { time: '28/08', date: '2026-08-28', temperature: 26.8, humidity: 80, co2: 820, soilMoisture: 64, trayId: 'TRAY-002' },
  { time: '29/08', date: '2026-08-29', temperature: 27.1, humidity: 78, co2: 880, soilMoisture: 62, trayId: 'TRAY-002' },
  { time: '30/08', date: '2026-08-30', temperature: 27.6, humidity: 75, co2: 920, soilMoisture: 59, trayId: 'TRAY-002' },
  { time: '31/08', date: '2026-08-31', temperature: 27.2, humidity: 77, co2: 890, soilMoisture: 60, trayId: 'TRAY-002' },
  { time: '01/09', date: '2026-09-01', temperature: 27.4, humidity: 79, co2: 915, soilMoisture: 58, trayId: 'TRAY-002' },
]

export const MOCK_YIELD_SUMMARIES: YieldSummary[] = [
  { cropType: 'Nấm Bào Ngư Xám', gradeA_Kg: 42, gradeB_Kg: 9, spoiled_Kg: 2, successRate: 92, trayId: 'TRAY-001' },
  { cropType: 'Nấm Linh Chi', gradeA_Kg: 35, gradeB_Kg: 8, spoiled_Kg: 1, successRate: 95, trayId: 'TRAY-002' },
  { cropType: 'Nấm Hoàng Kim', gradeA_Kg: 28, gradeB_Kg: 11, spoiled_Kg: 4, successRate: 88, trayId: 'TRAY-004' },
  { cropType: 'Đông Trùng Hạ Thảo', gradeA_Kg: 21, gradeB_Kg: 3, spoiled_Kg: 1, successRate: 96, trayId: 'TRAY-005' },
]

export const MOCK_REVENUE_SUMMARIES: RevenueSummary[] = [
  { month: 'T04/2026', totalRevenue: 28500000, rentalCount: 42, popularPackage: 'CROP-STANDARD' },
  { month: 'T05/2026', totalRevenue: 33200000, rentalCount: 48, popularPackage: 'CROP-STANDARD' },
  { month: 'T06/2026', totalRevenue: 41800000, rentalCount: 56, popularPackage: 'FAMILY-PREMIUM' },
  { month: 'T07/2026', totalRevenue: 46700000, rentalCount: 63, popularPackage: 'FAMILY-PREMIUM' },
  { month: 'T08/2026', totalRevenue: 52400000, rentalCount: 71, popularPackage: 'CORPORATE-CORDY' },
  { month: 'T09/2026', totalRevenue: 38900000, rentalCount: 54, popularPackage: 'CROP-STANDARD' },
]

interface AlertState {
  alerts: SystemAlert[]
  reportPeriod: ReportPeriod
  markAlertRead: (id: string) => void
  markAllRead: () => void
  acknowledgeAlert: (id: string, acknowledgedBy: string) => void
  acknowledgeAll: (acknowledgedBy: string) => void
  setReportPeriod: (period: ReportPeriod) => void
}

export const useAlertStore = create<AlertState>((set) => ({
  alerts: MOCK_ALERTS,
  reportPeriod: 'LAST_7_DAYS',

  markAlertRead: (id) =>
    set((state) => ({
      alerts: state.alerts.map((alert) =>
        alert.id === id ? { ...alert, isRead: true } : alert,
      ),
    })),

  markAllRead: () =>
    set((state) => ({
      alerts: state.alerts.map((alert) => ({ ...alert, isRead: true })),
    })),

  acknowledgeAlert: (id, acknowledgedBy) =>
    set((state) => ({
      alerts: state.alerts.map((alert) =>
        alert.id === id
          ? {
              ...alert,
              isRead: true,
              isAcknowledged: true,
              acknowledgedBy,
              acknowledgedAt: new Date().toISOString(),
            }
          : alert,
      ),
    })),

  acknowledgeAll: (acknowledgedBy) =>
    set((state) => ({
      alerts: state.alerts.map((alert) =>
        alert.isAcknowledged
          ? alert
          : {
              ...alert,
              isRead: true,
              isAcknowledged: true,
              acknowledgedBy,
              acknowledgedAt: new Date().toISOString(),
            },
      ),
    })),

  setReportPeriod: (period) => set({ reportPeriod: period }),
}))
