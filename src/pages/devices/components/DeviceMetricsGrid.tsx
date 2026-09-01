import type { ReactNode } from 'react'
import {
  CloudOutlined,
  CloudServerOutlined,
  ExperimentOutlined,
  FireOutlined,
} from '@ant-design/icons'
import { Card, Col, Row, Statistic, Tag } from 'antd'
import type { DeviceTelemetry } from '../../../types/device.types'

interface DeviceMetricsGridProps {
  telemetry: DeviceTelemetry
}

type MetricTone = 'normal' | 'warning' | 'danger'

interface MetricDefinition {
  key: keyof Pick<
    DeviceTelemetry,
    'temperature' | 'humidity' | 'co2' | 'soilMoisture'
  >
  title: string
  unit: string
  icon: ReactNode
  normalRange: string
  getTone: (value: number) => MetricTone
  precision?: number
}

const TONE_CONFIG: Record<MetricTone, { color: string; label: string }> = {
  normal: { color: '#16a34a', label: 'Bình thường' },
  warning: { color: '#ca8a04', label: 'Cận ngưỡng' },
  danger: { color: '#dc2626', label: 'Nguy hiểm' },
}

const METRICS: MetricDefinition[] = [
  {
    key: 'temperature',
    title: 'Nhiệt độ',
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
    title: 'Độ ẩm không khí',
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
    normalRange: '400-800ppm',
    getTone: (value) =>
      value > 1200 ? 'danger' : value > 800 ? 'warning' : 'normal',
  },
  {
    key: 'soilMoisture',
    title: 'Độ ẩm giá thể',
    unit: '%',
    icon: <ExperimentOutlined />,
    normalRange: '60-85%',
    getTone: (value) =>
      value < 40 || value > 95
        ? 'danger'
        : value < 60 || value > 85
          ? 'warning'
          : 'normal',
  },
]

export function DeviceMetricsGrid({ telemetry }: DeviceMetricsGridProps) {
  return (
    <Row gutter={[12, 12]}>
      {METRICS.map((metric) => {
        const value = telemetry[metric.key]
        const tone = metric.getTone(value)
        const toneConfig = TONE_CONFIG[tone]

        return (
          <Col key={metric.key} xs={12} xl={6}>
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
                  <span
                    aria-hidden="true"
                    style={{ color: toneConfig.color, marginRight: 4 }}
                  >
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
