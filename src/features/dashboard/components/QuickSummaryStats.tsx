import {
  AlertOutlined,
  AppstoreOutlined,
  CheckCircleOutlined,
  InboxOutlined,
} from '@ant-design/icons'
import { Card, Col, Row, Statistic } from 'antd'
import type { ReactNode } from 'react'

interface QuickSummaryStatsProps {
  totalTrays: number
  activeInUseTrays: number
  availableTrays: number
  activeAlerts: number
}

interface SummaryMetric {
  title: string
  value: number
  suffix?: string
  icon: ReactNode
  color: string
}

export function QuickSummaryStats({
  totalTrays,
  activeInUseTrays,
  availableTrays,
  activeAlerts,
}: QuickSummaryStatsProps) {
  const metrics: SummaryMetric[] = [
    {
      title: 'Tổng số khay nuôi',
      value: totalTrays,
      suffix: ' khay',
      icon: <AppstoreOutlined />,
      color: '#2563eb',
    },
    {
      title: 'Khay đang hoạt động / thuê',
      value: activeInUseTrays,
      suffix: ' khay',
      icon: <CheckCircleOutlined />,
      color: '#16a34a',
    },
    {
      title: 'Khay còn trống',
      value: availableTrays,
      suffix: ' khay',
      icon: <InboxOutlined />,
      color: '#ca8a04',
    },
    {
      title: 'Cảnh báo chờ xử lý',
      value: activeAlerts,
      suffix: ' cảnh báo',
      icon: <AlertOutlined />,
      color: '#dc2626',
    },
  ]

  return (
    <Row gutter={[16, 16]}>
      {metrics.map((metric) => (
        <Col key={metric.title} xs={24} sm={12} xl={6}>
          <Card style={{ height: '100%' }}>
            <Statistic
              title={metric.title}
              value={metric.value}
              suffix={metric.suffix}
              prefix={
                <span
                  aria-hidden="true"
                  style={{ color: metric.color, marginRight: 8 }}
                >
                  {metric.icon}
                </span>
              }
            />
          </Card>
        </Col>
      ))}
    </Row>
  )
}
