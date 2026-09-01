import type { ReactNode } from 'react'
import { Card, Statistic } from 'antd'

interface EnvironmentMetricCardProps {
  title: string
  value: number
  unit: string
  icon: ReactNode
  color: string
  precision?: number
}

export function EnvironmentMetricCard({
  title,
  value,
  unit,
  icon,
  color,
  precision,
}: EnvironmentMetricCardProps) {
  return (
    <Card style={{ height: '100%' }} styles={{ body: { padding: 20 } }}>
      <Statistic
        title={title}
        value={value}
        precision={precision}
        suffix={unit}
        prefix={
          <span
            aria-hidden="true"
            style={{ marginRight: 8, color, fontSize: 24 }}
          >
            {icon}
          </span>
        }
        styles={{ content: { color: '#1f2937' } }}
      />
    </Card>
  )
}
