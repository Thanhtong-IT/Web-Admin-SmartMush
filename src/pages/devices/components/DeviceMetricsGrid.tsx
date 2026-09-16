import type { ReactNode } from 'react'
import {
  CheckCircleOutlined,
  CloudOutlined,
  CloudServerOutlined,
  FireOutlined,
  WarningOutlined,
} from '@ant-design/icons'
import { Card, Col, Row, Statistic, Tag, Tooltip } from 'antd'
import type { TierTelemetry } from '../../../types/room.types'
import type { FloorTargetThresholds } from '../utils/floor-climate.utils'

interface DeviceMetricsGridProps {
  telemetry: TierTelemetry
  thresholds: FloorTargetThresholds
}

type MetricTone = 'normal' | 'warning' | 'danger'

interface MetricDefinition {
  key: keyof Pick<TierTelemetry, 'temperature' | 'humidity' | 'co2'>
  title: string
  unit: string
  icon: ReactNode
  getTargetLabel: (thresholds: FloorTargetThresholds) => string
  getTone: (
    value: number,
    thresholds: FloorTargetThresholds,
  ) => MetricTone
  precision?: number
}

const TONE_CONFIG: Record<MetricTone, { color: string; label: string }> = {
  normal: { color: 'var(--mcms-primary)', label: 'Bình thường' },
  warning: { color: 'var(--mcms-amber)', label: 'Cận ngưỡng' },
  danger: { color: 'var(--mcms-coral)', label: 'Nguy hiểm' },
}

function formatThresholdValue(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1)
}

const METRICS: MetricDefinition[] = [
  {
    key: 'temperature',
    title: 'Nhiệt độ tầng',
    unit: '°C',
    icon: <FireOutlined />,
    getTargetLabel: (thresholds) =>
      `Mục tiêu TB: ${formatThresholdValue(thresholds.tempMin)} - ${formatThresholdValue(thresholds.tempMax)}°C`,
    precision: 1,
    getTone: (value, thresholds) =>
      value < thresholds.tempMin - 2 || value > thresholds.tempMax + 2
        ? 'danger'
        : value < thresholds.tempMin || value > thresholds.tempMax
          ? 'warning'
          : 'normal',
  },
  {
    key: 'humidity',
    title: 'Độ ẩm tầng',
    unit: '%RH',
    icon: <CloudOutlined />,
    getTargetLabel: (thresholds) =>
      `Mục tiêu TB: ${formatThresholdValue(thresholds.humidityMin)} - ${formatThresholdValue(thresholds.humidityMax)}%RH`,
    getTone: (value, thresholds) =>
      value < thresholds.humidityMin - 10 || value > thresholds.humidityMax + 3
        ? 'danger'
        : value < thresholds.humidityMin || value > thresholds.humidityMax
          ? 'warning'
          : 'normal',
  },
  {
    key: 'co2',
    title: 'Nồng độ CO₂',
    unit: 'ppm',
    icon: <CloudServerOutlined />,
    getTargetLabel: (thresholds) =>
      `Ngưỡng an toàn: < ${formatThresholdValue(thresholds.co2Max)} ppm`,
    getTone: (value, thresholds) =>
      value > thresholds.co2Max * 1.3
        ? 'danger'
        : value > thresholds.co2Max
          ? 'warning'
          : 'normal',
  },
]

function getThresholdSourceTooltip(thresholds: FloorTargetThresholds) {
  if (thresholds.source === 'SYSTEM_DEFAULT') {
    return `Tầng chưa có mẻ đang trồng. Đang dùng profile mặc định: ${thresholds.defaultProfileName}.`
  }

  const fallbackNote =
    thresholds.missingProfileMushroomTypes.length > 0
      ? ` Chưa có profile cho ${thresholds.missingProfileMushroomTypes.join(', ')}, hệ thống dùng profile mặc định thay thế.`
      : ''

  return `Được tính trung bình từ ${thresholds.activeTrayCount} giống nấm đang trồng: ${thresholds.mushroomTypes.join(', ')}.${fallbackNote}`
}

export function DeviceMetricsGrid({
  telemetry,
  thresholds,
}: DeviceMetricsGridProps) {
  const thresholdSourceTooltip = getThresholdSourceTooltip(thresholds)
  const varianceWarning =
    'Có độ lệch sinh thái giữa các khay, nên cân nhắc gom giống tương đồng.'

  return (
    <Row gutter={[10, 10]}>
      {METRICS.map((metric) => {
        const value = telemetry[metric.key]
        const tone = metric.getTone(value, thresholds)
        const toneConfig = TONE_CONFIG[tone]
        const targetLabel = metric.getTargetLabel(thresholds)

        return (
          <Col key={metric.key} xs={24} sm={8}>
            <Card
              className="device-metric-card"
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
              <div className="device-metric-status-row">
                <span
                  className={`device-metric-tone device-metric-tone--${tone}`}
                >
                  {tone === 'normal' ? (
                    <CheckCircleOutlined aria-hidden="true" />
                  ) : (
                    <WarningOutlined aria-hidden="true" />
                  )}
                  {toneConfig.label}
                </span>
                <div className="device-metric-target-row">
                  <Tooltip title={thresholdSourceTooltip}>
                    <span
                      className="device-metric-target-trigger"
                      tabIndex={0}
                    >
                      <Tag
                        className="device-metric-target-tag"
                        color={
                          tone === 'normal'
                            ? 'success'
                            : tone === 'warning'
                              ? 'warning'
                              : 'error'
                        }
                      >
                        {targetLabel}
                      </Tag>
                    </span>
                  </Tooltip>
                  {thresholds.hasEcologicalVariance && (
                    <Tooltip title={varianceWarning}>
                      <span
                        className="device-metric-variance-warning"
                        role="img"
                        tabIndex={0}
                        aria-label={varianceWarning}
                      >
                        <WarningOutlined aria-hidden="true" />
                      </span>
                    </Tooltip>
                  )}
                </div>
              </div>
            </Card>
          </Col>
        )
      })}
    </Row>
  )
}
