import {
  AlertOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons'
import { Badge, Button, Card, Empty, Table, Tag, Tooltip, Typography } from 'antd'
import type { TableColumnsType } from 'antd'
import dayjs from 'dayjs'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAlertStore } from '../../../stores/alert.store'
import type { AlertSeverity, SystemAlert } from '../../../types/alert.types'

const SEVERITY_CONFIG: Record<
  AlertSeverity,
  { color: string; label: string }
> = {
  INFO: { color: 'processing', label: 'Thông tin' },
  WARNING: { color: 'warning', label: 'Cảnh báo' },
  CRITICAL: { color: 'error', label: 'Nghiêm trọng' },
}

export function RecentAlertsTable() {
  const navigate = useNavigate()
  const alerts = useAlertStore((state) => state.alerts)

  const recentAlerts = useMemo(
    () =>
      [...alerts]
        .filter((alert) => !alert.isAcknowledged)
        .sort(
          (left, right) =>
            dayjs(right.timestamp).valueOf() - dayjs(left.timestamp).valueOf(),
        )
        .slice(0, 5),
    [alerts],
  )

  const columns: TableColumnsType<SystemAlert> = [
    {
      title: 'Mức độ',
      dataIndex: 'severity',
      key: 'severity',
      width: 130,
      render: (severity: AlertSeverity) => {
        const config = SEVERITY_CONFIG[severity]

        return <Tag color={config.color}>{config.label}</Tag>
      },
    },
    {
      title: 'Nội dung',
      dataIndex: 'message',
      key: 'message',
      ellipsis: true,
    },
    {
      title: 'Khay / Node STM32',
      key: 'target',
      width: 190,
      render: (_, alert) => `${alert.trayName} · ${alert.deviceId}`,
    },
    {
      title: 'Thời gian',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 150,
      render: (timestamp: string) => dayjs(timestamp).format('DD/MM HH:mm'),
    },
  ]

  return (
    <Card className="recent-alerts-card">
      <div className="recent-alerts-header">
        <div className="recent-alerts-title">
          <span className="recent-alerts-icon" aria-hidden="true">
            <AlertOutlined />
          </span>
          <div>
            <Typography.Title level={4}>Cảnh báo gần đây</Typography.Title>
            <Typography.Text type="secondary">
              Các sự kiện chưa được xác nhận
            </Typography.Text>
          </div>
          <Badge count={recentAlerts.length} className="recent-alerts-count" />
        </div>

        <Tooltip title="Mở danh sách cảnh báo">
          <Button
            type="link"
            icon={<ArrowRightOutlined />}
            iconPlacement="end"
            onClick={() => navigate('/alerts')}
          >
            Xem tất cả
          </Button>
        </Tooltip>
      </div>

      <Table<SystemAlert>
        className="recent-alerts-table"
        rowKey="id"
        columns={columns}
        dataSource={recentAlerts}
        pagination={false}
        scroll={{ x: 680 }}
        locale={{
          emptyText: (
            <Empty description="Không có cảnh báo đang chờ xử lý" />
          ),
        }}
      />
    </Card>
  )
}
