import {
  ArrowDownOutlined,
  ArrowUpOutlined,
} from '@ant-design/icons'
import { Card, Flex, Tooltip, Typography } from 'antd'
import type { ReactNode } from 'react'

interface KpiVarianceCardProps {
  icon: ReactNode
  iconBg: string
  iconColor: string
  title: string
  currentLabel: string
  currentValue: string
  previousLabel: string
  previousValue: string
  /** Phần trăm chênh lệch (có thể âm) */
  deltaPercent: number
  /** Ngữ cảnh đánh giá — true = tăng là tốt, false = giảm mới là tốt */
  higherIsBetter?: boolean
  /** Sub-text phụ (vd: "10/12 khay") */
  subtitle?: string
}

export function KpiVarianceCard({
  icon,
  iconBg,
  iconColor,
  title,
  currentLabel: _currentLabel,
  currentValue,
  previousLabel,
  previousValue,
  deltaPercent,
  higherIsBetter = true,
  subtitle,
}: KpiVarianceCardProps) {
  const isImprovement = higherIsBetter
    ? deltaPercent >= 0
    : deltaPercent <= 0

  const deltaColor = isImprovement ? '#16a34a' : '#dc2626'
  const deltaBg = isImprovement ? '#dcfce7' : '#fee2e2'
  const ArrowIcon = deltaPercent >= 0 ? ArrowUpOutlined : ArrowDownOutlined
  const formattedDelta = `${Math.abs(deltaPercent).toFixed(1)}%`
  const directionArrow = deltaPercent >= 0 ? '↑' : '↓'

  return (
    <Card
      hoverable
      style={{
        borderRadius: 12,
        borderColor: '#e5e7eb',
        height: '100%',
      }}
      styles={{ body: { padding: 20 } }}
    >
      <Flex align="flex-start" gap={12} style={{ marginBottom: 12 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: iconBg,
            color: iconColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20,
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {title}
          </Typography.Text>
          {subtitle && (
            <Typography.Text
              type="secondary"
              style={{ fontSize: 11, display: 'block' }}
            >
              {subtitle}
            </Typography.Text>
          )}
        </div>
      </Flex>

      <Typography.Title
        level={2}
        style={{ margin: '0 0 6px', color: '#0f172a', fontWeight: 600 }}
      >
        {currentValue}
      </Typography.Title>

      <Flex align="center" gap={8} wrap>
        <Tooltip title={`${previousLabel}: ${previousValue}`}>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {previousLabel}: <strong>{previousValue}</strong>
          </Typography.Text>
        </Tooltip>

        <span
          style={{
            background: deltaBg,
            color: deltaColor,
            padding: '2px 8px',
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <ArrowIcon style={{ fontSize: 10 }} />
          {directionArrow} {formattedDelta}
        </span>
      </Flex>
    </Card>
  )
}
