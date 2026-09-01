import dayjs from 'dayjs'
import { useMemo } from 'react'
import { AlertOutlined, ArrowRightOutlined } from '@ant-design/icons'
import { Button, Empty, Flex, Table, Tag, Tooltip, Typography } from 'antd'
import type { TableColumnsType } from 'antd'
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
            dayjs(right.timestamp).valueOf() -
            dayjs(left.timestamp).valueOf(),
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
      title: 'Khay / ESP32',
      key: 'target',
      width: 190,
      render: (_, alert) => `${alert.trayName} · ${alert.deviceId}`,
    },
    {
      title: 'Thời gian',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 150,
      render: (timestamp: string) =>
        dayjs(timestamp).format('DD/MM HH:mm'),
    },
  ]

  return (
    <div
      style={{
        marginTop: 20,
        padding: 20,
        border: '1px solid #f0f0f0',
        borderRadius: 8,
        background: '#ffffff',
      }}
    >
      <Flex
        align="center"
        justify="space-between"
        gap={12}
        wrap
        style={{ marginBottom: 16 }}
      >
        <Flex align="center" gap={8}>
          <AlertOutlined style={{ color: '#dc2626' }} />
          <Typography.Title level={4} style={{ margin: 0 }}>
            Cảnh báo gần đây
          </Typography.Title>
        </Flex>

        <Tooltip title="Mở danh sách cảnh báo">
          <Button
            type="link"
            icon={<ArrowRightOutlined />}
            onClick={() => navigate('/alerts')}
          >
            Xem tất cả
          </Button>
        </Tooltip>
      </Flex>

      <Table<SystemAlert>
        rowKey="id"
        columns={columns}
        dataSource={recentAlerts}
        pagination={false}
        scroll={{ x: 620 }}
        locale={{
          emptyText: (
            <Empty description="Không có cảnh báo đang chờ xử lý" />
          ),
        }}
      />
    </div>
  )
}
