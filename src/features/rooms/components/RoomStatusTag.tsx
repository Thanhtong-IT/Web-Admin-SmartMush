import { Tag } from 'antd'
import type { RoomStatus } from '../../../types/room.types'

interface RoomStatusTagProps {
  status: RoomStatus
}

const STATUS_CONFIG = {
  ACTIVE: {
    color: 'success',
    label: 'Đang hoạt động',
  },
  MAINTENANCE: {
    color: 'warning',
    label: 'Đang bảo trì',
  },
  INACTIVE: {
    color: 'default',
    label: 'Ngừng hoạt động',
  },
} as const satisfies Record<
  RoomStatus,
  { color: string; label: string }
>

export function RoomStatusTag({ status }: RoomStatusTagProps) {
  const config = STATUS_CONFIG[status]

  return <Tag color={config.color}>{config.label}</Tag>
}
