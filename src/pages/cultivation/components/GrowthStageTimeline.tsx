import {
  CheckCircleOutlined,
  ExperimentOutlined,
  FieldTimeOutlined,
  FlagOutlined,
  RiseOutlined,
} from '@ant-design/icons'
import { Steps } from 'antd'
import type { GrowthStage } from '../../../types/cultivation.types'

interface GrowthStageTimelineProps {
  currentStage: GrowthStage
}

const STAGE_ITEMS = [
  {
    key: 'INCUBATION',
    title: 'Ủ tơ / Nuôi sợi',
    description: 'Tối, ẩm cao, CO₂ cao',
    icon: <ExperimentOutlined />,
  },
  {
    key: 'PINNING',
    title: 'Kích nụ / Ra ghim',
    description: 'Tăng sáng, giảm CO₂',
    icon: <FieldTimeOutlined />,
  },
  {
    key: 'FRUITING',
    title: 'Phát triển thể quả',
    description: 'Ẩm ổn định, thông khí',
    icon: <RiseOutlined />,
  },
  {
    key: 'READY_TO_HARVEST',
    title: 'Sẵn sàng thu hoạch',
    description: 'Đạt chuẩn kích thước',
    icon: <FlagOutlined />,
  },
  {
    key: 'HARVESTED',
    title: 'Đã thu hoạch',
    description: 'Vệ sinh tái đàn',
    icon: <CheckCircleOutlined />,
  },
]

export function GrowthStageTimeline({ currentStage }: GrowthStageTimelineProps) {
  const currentIndex = STAGE_ITEMS.findIndex((item) => item.key === currentStage)

  return (
    <Steps
      size="small"
      current={Math.max(currentIndex, 0)}
      responsive
      items={STAGE_ITEMS.map((item) => ({
        title: item.title,
        description: item.description,
        icon: item.icon,
      }))}
    />
  )
}
