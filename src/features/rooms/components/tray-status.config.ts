import type { TrayStatus } from '../../../types/room.types'

export const TRAY_STATUS_CONFIG = {
  empty: { color: 'default', label: 'Trống' },
  rented: { color: 'processing', label: 'Đang thuê' },
  harvesting: { color: 'warning', label: 'Chờ thu hoạch' },
  maintenance: { color: 'error', label: 'Nhiễm bệnh' },
} as const satisfies Record<TrayStatus, { color: string; label: string }>
