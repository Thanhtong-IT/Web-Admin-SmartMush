import type { ReactNode } from 'react'
import dayjs from 'dayjs'
import {
  CheckOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  SafetyOutlined,
} from '@ant-design/icons'
import {
  Button,
  Flex,
  Popconfirm,
  Space,
  Tag,
  Tooltip,
  Typography,
} from 'antd'
import type {
  AlertCategory,
  AlertSeverity,
  SystemAlert,
} from '../../../types/alert.types'

interface AlertItemRowProps {
  alert: SystemAlert
  canManage: boolean
  onMarkRead: (alert: SystemAlert) => void
  onAcknowledge: (alert: SystemAlert) => void
}

const SEVERITY_CONFIG: Record<
  AlertSeverity,
  { color: string; label: string; icon: ReactNode }
> = {
  INFO: {
    color: 'processing',
    label: 'Thông tin',
    icon: <InfoCircleOutlined />,
  },
  WARNING: {
    color: 'warning',
    label: 'Cảnh báo',
    icon: <ExclamationCircleOutlined />,
  },
  CRITICAL: {
    color: 'error',
    label: 'Nghiêm trọng',
    icon: <SafetyOutlined />,
  },
}

const CATEGORY_LABELS: Record<AlertCategory, string> = {
  TEMPERATURE: 'Nhiệt độ',
  HUMIDITY: 'Độ ẩm không khí',
  CO2: 'Nồng độ CO₂',
  DEVICE_OFFLINE: 'ESP32 mất kết nối',
  HARDWARE_FAULT: 'Lỗi phần cứng',
}

function formatValue(alert: SystemAlert) {
  if (alert.currentValue === null) {
    return null
  }

  const unit =
    alert.category === 'TEMPERATURE'
      ? '°C'
      : alert.category === 'HUMIDITY'
        ? '%RH'
        : alert.category === 'CO2'
          ? ' ppm'
          : alert.category === 'DEVICE_OFFLINE'
            ? ' phút'
            : ' giây'

  return `${alert.currentValue}${unit}`
}

export function AlertItemRow({
  alert,
  canManage,
  onMarkRead,
  onAcknowledge,
}: AlertItemRowProps) {
  const severityConfig = SEVERITY_CONFIG[alert.severity]
  const currentValue = formatValue(alert)
  const thresholdValue = alert.thresholdValue
    ? formatValue({ ...alert, currentValue: alert.thresholdValue })
    : null

  const acknowledgeButton = (
    <Button
      type={alert.isAcknowledged ? 'default' : 'primary'}
      size="small"
      icon={alert.isAcknowledged ? <CheckCircleOutlined /> : <CheckOutlined />}
      disabled={alert.isAcknowledged}
      onClick={() => onAcknowledge(alert)}
    >
      {alert.isAcknowledged ? 'Đã xử lý' : 'Xác nhận xử lý'}
    </Button>
  )

  return (
    <Flex
      align="flex-start"
      justify="space-between"
      gap={16}
      wrap
      style={{
        padding: '16px 0',
        borderBottom: '1px solid #f0f0f0',
        opacity: alert.isAcknowledged ? 0.72 : 1,
        background: alert.isRead ? undefined : '#fffaf0',
      }}
    >
      <Flex align="flex-start" gap={12} style={{ flex: '1 1 560px' }}>
        <Tag
          color={severityConfig.color}
          icon={severityConfig.icon}
          style={{ marginTop: 2, whiteSpace: 'nowrap' }}
        >
          {severityConfig.label}
        </Tag>

        <div>
          <Flex align="center" gap={8} wrap>
            <Typography.Text strong>{alert.message}</Typography.Text>
            {!alert.isRead && <Tag color="gold">Chưa đọc</Tag>}
          </Flex>

          <Typography.Text type="secondary">
            {alert.trayName} · {alert.trayId} · {alert.deviceId}
          </Typography.Text>

          <br />

          <Typography.Text type="secondary">
            {CATEGORY_LABELS[alert.category]} ·{' '}
            {dayjs(alert.timestamp).format('DD/MM/YYYY HH:mm:ss')}
          </Typography.Text>

          {(currentValue || thresholdValue) && (
            <Typography.Paragraph style={{ margin: '4px 0 0' }}>
              Hiện tại: <strong>{currentValue}</strong>
              {thresholdValue && <> · Ngưỡng: {thresholdValue}</>}
            </Typography.Paragraph>
          )}

          {alert.isAcknowledged && alert.acknowledgedBy && (
            <Typography.Text type="secondary">
              Đã xử lý bởi {alert.acknowledgedBy} lúc{' '}
              {alert.acknowledgedAt
                ? dayjs(alert.acknowledgedAt).format('DD/MM/YYYY HH:mm')
                : 'không rõ'}
            </Typography.Text>
          )}
        </div>
      </Flex>

      {canManage && (
        <Space size={8} wrap>
          <Tooltip title={alert.isRead ? 'Đã đọc' : 'Đánh dấu đã đọc'}>
            <Button
              type="text"
              size="small"
              disabled={alert.isRead}
              onClick={() => onMarkRead(alert)}
              aria-label={`${alert.isRead ? 'Đã đọc' : 'Đánh dấu đã đọc'} cảnh báo`}
            >
              {alert.isRead ? 'Đã đọc' : 'Đánh dấu đã đọc'}
            </Button>
          </Tooltip>

          {alert.severity === 'CRITICAL' && !alert.isAcknowledged ? (
            <Popconfirm
              title="Xác nhận đã xử lý cảnh báo nghiêm trọng?"
              description="Chỉ xác nhận sau khi đã kiểm tra và can thiệp thiết bị."
              okText="Xác nhận"
              cancelText="Hủy"
              onConfirm={() => onAcknowledge(alert)}
            >
              {acknowledgeButton}
            </Popconfirm>
          ) : (
            acknowledgeButton
          )}
        </Space>
      )}
    </Flex>
  )
}
