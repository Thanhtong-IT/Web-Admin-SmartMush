import type { ReactNode } from 'react'
import {
  CloudOutlined,
  CloudServerOutlined,
  FireOutlined,
} from '@ant-design/icons'
import { Card, Col, Row, Statistic, Tag } from 'antd'
import type { TierTelemetry } from '../../../types/room.types'

interface DeviceMetricsGridProps {
  telemetry: TierTelemetry
}

type MetricTone = 'normal' | 'warning' | 'danger'

interface MetricDefinition {
  key: keyof Pick<TierTelemetry, 'temperature' | 'humidity' | 'co2'>
  title: string
  unit: string
  icon: ReactNode
  normalRange: string
  getTone: (value: number) => MetricTone
  precision?: number
}

const TONE_CONFIG: Record<MetricTone, { color: string; label: string }> = {
  normal: { color: '#16803b', label: 'Bình thường' },
  warning: { color: '#b45309', label: 'Cận ngưỡng' },
  danger: { color: '#c81e1e', label: 'Nguy hiểm' },
}

const METRICS: MetricDefinition[] = [
  {
    key: 'temperature',
    title: 'Nhiệt độ tầng',
    unit: '°C',
    icon: <FireOutlined />,
    normalRange: '20-28°C',
    precision: 1,
    getTone: (value) =>
      value < 18 || value > 32
        ? 'danger'
        : value < 20 || value > 28
          ? 'warning'
          : 'normal',
  },
  {
    key: 'humidity',
    title: 'Độ ẩm tầng',
    unit: '%RH',
    icon: <CloudOutlined />,
    normalRange: '75-95%RH',
    getTone: (value) =>
      value < 60 || value > 98
        ? 'danger'
        : value < 75 || value > 95
          ? 'warning'
          : 'normal',
  },
  {
    key: 'co2',
    title: 'Nồng độ CO₂',
    unit: 'ppm',
    icon: <CloudServerOutlined />,
    normalRange: '400-850ppm',
    getTone: (value) =>
      value > 1200 ? 'danger' : value > 850 ? 'warning' : 'normal',
  },
]

export function DeviceMetricsGrid({ telemetry }: DeviceMetricsGridProps) {
  return (
    <Row gutter={[10, 10]}>
      {METRICS.map((metric) => {
        const value = telemetry[metric.key]
        const tone = metric.getTone(value)
        const toneConfig = TONE_CONFIG[tone]

        return (
          <Col key={metric.key} xs={24} sm={8}>
            <Card
              size="small"
              style={{ height: '100%', borderTop: `3px solid ${toneConfig.color}` }}
            >
              <Statistic
                title={metric.title}
                value={value}
                precision={metric.precision}
                suffix={metric.unit}
                prefix={
                  <span aria-hidden="true" style={{ color: toneConfig.color }}>
                    {metric.icon}
                  </span>
                }
              />
              <Tag
                color={
                  tone === 'normal'
                    ? 'success'
                    : tone === 'warning'
                      ? 'warning'
                      : 'error'
                }
                style={{ marginTop: 8 }}
              >
                {toneConfig.label} · {metric.normalRange}
              </Tag>
            </Card>
          </Col>
        )
      })}
    </Row>
  )
}
