import { Card } from 'antd'
import type { ReactNode } from 'react'

type EnvironmentTone = 'coral' | 'teal' | 'amber'

interface EnvironmentMetricCardProps {
  title: string
  value: number
  unit: string
  icon: ReactNode
  tone: EnvironmentTone
  status: string
  target: string
  precision?: number
}

export function EnvironmentMetricCard({
  title,
  value,
  unit,
  icon,
  tone,
  status,
  target,
  precision = 0,
}: EnvironmentMetricCardProps) {
  const formattedValue = value.toLocaleString('vi-VN', {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  })

  return (
    <Card className={`environment-card environment-card--${tone}`}>
      <div className="environment-card-header">
        <span className="environment-card-icon" aria-hidden="true">
          {icon}
        </span>
        <span className="environment-status">{status}</span>
      </div>
      <span className="environment-card-title">{title}</span>
      <div className="environment-card-value">
        <strong>{formattedValue}</strong>
        <span>{unit}</span>
      </div>
      <span className="environment-card-target">{target}</span>
    </Card>
  )
}
