import {
  AlertOutlined,
  AppstoreOutlined,
  CheckCircleOutlined,
  InboxOutlined,
} from '@ant-design/icons'
import { Card, Col, Row } from 'antd'
import type { ReactNode } from 'react'

interface QuickSummaryStatsProps {
  totalTrays: number
  activeInUseTrays: number
  availableTrays: number
  activeAlerts: number
}

type MetricTone = 'forest' | 'teal' | 'amber' | 'red'

interface SummaryMetric {
  title: string
  value: number
  suffix: string
  icon: ReactNode
  tone: MetricTone
  description: string
}

function getPercentage(value: number, total: number) {
  return total > 0 ? Math.round((value / total) * 100) : 0
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
      suffix: 'khay',
      icon: <AppstoreOutlined />,
      tone: 'forest',
      description: 'Công suất toàn trang trại',
    },
    {
      title: 'Đang vận hành',
      value: activeInUseTrays,
      suffix: 'khay',
      icon: <CheckCircleOutlined />,
      tone: 'teal',
      description: `${getPercentage(activeInUseTrays, totalTrays)}% tổng công suất`,
    },
    {
      title: 'Sẵn sàng cho thuê',
      value: availableTrays,
      suffix: 'khay',
      icon: <InboxOutlined />,
      tone: 'amber',
      description: `${getPercentage(availableTrays, totalTrays)}% công suất còn trống`,
    },
    {
      title: 'Cảnh báo chờ xử lý',
      value: activeAlerts,
      suffix: 'cảnh báo',
      icon: <AlertOutlined />,
      tone: 'red',
      description:
        activeAlerts > 0 ? 'Cần kiểm tra trong hôm nay' : 'Không có sự cố mới',
    },
  ]

  return (
    <Row className="summary-grid" gutter={[16, 16]}>
      {metrics.map((metric) => (
        <Col key={metric.title} xs={24} sm={12} xl={6}>
          <Card className={`summary-card summary-card--${metric.tone}`}>
            <div className="summary-card-topline">
              <span className="summary-card-title">{metric.title}</span>
              <span className="summary-card-icon" aria-hidden="true">
                {metric.icon}
              </span>
            </div>
            <div className="summary-card-value">
              <strong>{metric.value}</strong>
              <span>{metric.suffix}</span>
            </div>
            <div className="summary-card-description">{metric.description}</div>
          </Card>
        </Col>
      ))}
    </Row>
  )
}
