import { Tag } from 'antd'
import type { TrayStatus } from '../../../types/room.types'
import { TRAY_STATUS_CONFIG } from './tray-status.config'

interface TrayStatusTagProps {
  status: TrayStatus
}

export function TrayStatusTag({ status }: TrayStatusTagProps) {
  const config = TRAY_STATUS_CONFIG[status]

  return <Tag color={config.color}>{config.label}</Tag>
}
