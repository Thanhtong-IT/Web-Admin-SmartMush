import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons'
import { Empty, Table, Tag, Tooltip, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { formatCurrency } from '../utils/executive-report.utils'
import type { VarietyPerformance } from '../utils/executive-report.utils'

interface VarietyPerformanceTableProps {
  data: VarietyPerformance[]
}

/** Làm sạch giá trị số trước khi render — đảm bảo không in `NaN`. */
function safeNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : fallback
  }
  return fallback
}

function safePercent(value: unknown): number {
  const num = safeNumber(value, 0)
  if (!Number.isFinite(num)) return 0
  return num
}

export function VarietyPerformanceTable({
  data,
}: VarietyPerformanceTableProps) {
  if (!data || data.length === 0) {
    return <Empty description="Chưa có dữ liệu giống nấm" />
  }

  const columns: ColumnsType<VarietyPerformance> = [
    {
      title: 'Giống nấm',
      key: 'varietyName',
      width: 230,
      render: (_, record) => {
        const name = record.varietyName || 'Không rõ'
        const id = record.varietyId || 'N/A'
        return (
          <div>
            <Typography.Text strong>{name}</Typography.Text>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>{id}</div>
          </div>
        )
      },
    },
    {
      title: 'Số khay đã trồng',
      dataIndex: 'traysRented',
      key: 'traysRented',
      align: 'right',
      width: 130,
      sorter: (a, b) => safeNumber(a.traysRented) - safeNumber(b.traysRented),
      render: (value: number) => (
        <Typography.Text strong>{safeNumber(value)} khay</Typography.Text>
      ),
    },
    {
      title: 'Tỷ lệ thành công',
      dataIndex: 'successRate',
      key: 'successRate',
      align: 'right',
      width: 150,
      sorter: (a, b) => safeNumber(a.successRate) - safeNumber(b.successRate),
      render: (rate: number) => {
        const safe = safeNumber(rate)
        const color =
          safe >= 90 ? 'success' : safe >= 80 ? 'processing' : 'warning'
        return <Tag color={color}>{safe.toFixed(1)}%</Tag>
      },
    },
    {
      title: 'Doanh thu kỳ này',
      dataIndex: 'currentRevenue',
      key: 'currentRevenue',
      align: 'right',
      width: 170,
      sorter: (a, b) =>
        safeNumber(a.currentRevenue) - safeNumber(b.currentRevenue),
      render: (value: number) => (
        <Typography.Text strong type="success">
          {formatCurrency(value)}
        </Typography.Text>
      ),
    },
    {
      title: 'Cùng kỳ',
      dataIndex: 'previousRevenue',
      key: 'previousRevenue',
      align: 'right',
      width: 170,
      render: (value: number) => (
        <Typography.Text type="secondary">
          {formatCurrency(value)}
        </Typography.Text>
      ),
    },
    {
      title: 'Tăng trưởng YoY',
      key: 'growth',
      align: 'right',
      width: 160,
      sorter: (a, b) =>
        safePercent(a.growthPercent) - safePercent(b.growthPercent),
      render: (_, record) => {
        const growth = safePercent(record.growthPercent)
        const isPositive = growth >= 0
        const color = isPositive ? '#16a34a' : '#dc2626'
        const bg = isPositive ? '#dcfce7' : '#fee2e2'
        const Icon = isPositive ? ArrowUpOutlined : ArrowDownOutlined
        return (
          <Tooltip
            title={`${formatCurrency(record.currentRevenue)} → ${formatCurrency(
              record.previousRevenue,
            )}`}
          >
            <span
              style={{
                background: bg,
                color,
                padding: '2px 10px',
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Icon style={{ fontSize: 10 }} />
              {isPositive ? '+' : ''}
              {growth.toFixed(1)}%
            </span>
          </Tooltip>
        )
      },
    },
  ]

  return (
    <Table<VarietyPerformance>
      dataSource={data}
      columns={columns}
      rowKey={(record) => record.varietyId || record.varietyName || 'row'}
      pagination={false}
      size="middle"
      scroll={{ x: 900 }}
    />
  )
}
