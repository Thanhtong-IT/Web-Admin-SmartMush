import { Card, Typography } from 'antd'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { RevenueSummary } from '../../../types/alert.types'

interface RevenueBarChartProps {
  data: RevenueSummary[]
}

const VND_FORMATTER = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
})

export function RevenueBarChart({ data }: RevenueBarChartProps) {
  return (
    <Card
      title="Doanh thu cho thuê khay"
      extra={<Typography.Text type="secondary">Theo tháng</Typography.Text>}
    >
      <ResponsiveContainer width="100%" height={320}>
        <BarChart
          data={data}
          margin={{ top: 8, right: 12, left: 8, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 12 }} />
          <YAxis
            yAxisId="revenue"
            tickFormatter={(value: number) => `${value / 1000000}M`}
            tick={{ fill: '#6b7280', fontSize: 12 }}
          />
          <YAxis
            yAxisId="rentals"
            orientation="right"
            tick={{ fill: '#6b7280', fontSize: 12 }}
          />
          <Tooltip
            formatter={(value, name) => {
              const numericValue =
                typeof value === 'number' ? value : Number(value ?? 0)
              const label = String(name)

              return label === 'Doanh thu'
                ? [VND_FORMATTER.format(numericValue), label]
                : [`${numericValue} lượt`, label]
            }}
          />
          <Legend />
          <Bar
            yAxisId="revenue"
            dataKey="totalRevenue"
            name="Doanh thu"
            fill="#2563eb"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            yAxisId="rentals"
            dataKey="rentalCount"
            name="Lượt thuê"
            fill="#14b8a6"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  )
}
