import {
  AlertOutlined,
  ArrowRightOutlined,
  CheckOutlined,
  ExclamationCircleFilled,
  WarningFilled,
} from '@ant-design/icons'
import { Badge, Button, Card, Empty, List, Tooltip, Typography } from 'antd'
import dayjs from 'dayjs'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAlertStore } from '../../../stores/alert.store'
import type { AlertSeverity, SystemAlert } from '../../../types/alert.types'

interface SeverityVisuals {
  Icon: typeof ExclamationCircleFilled
  /** Tên hiển thị Tiếng Việt */
  label: string
  /** Màu badge/icon */
  tone: string
  /** CSS class cho icon-box */
  iconClass: string
}

const SEVERITY_CONFIG: Record<AlertSeverity, SeverityVisuals> = {
  CRITICAL: {
    Icon: ExclamationCircleFilled,
    label: 'Nghiêm trọng',
    tone: '#dc2626',
    iconClass: 'severity-icon--critical',
  },
  WARNING: {
    Icon: WarningFilled,
    label: 'Cảnh báo',
    tone: '#d97706',
    iconClass: 'severity-icon--warning',
  },
  INFO: {
    Icon: ExclamationCircleFilled,
    label: 'Thông tin',
    tone: '#0284c7',
    iconClass: 'severity-icon--info',
  },
}

/** Số cảnh báo hiển thị tối đa trong widget trên Dashboard. */
const MAX_VISIBLE_ALERTS = 3

export function RecentAlertsTable() {
  const navigate = useNavigate()
  const alerts = useAlertStore((state) => state.alerts)

  const recentAlerts = useMemo<SystemAlert[]>(
    () =>
      [...alerts]
        .filter((alert) => !alert.isAcknowledged)
        .sort(
          (left, right) =>
            dayjs(right.timestamp).valueOf() - dayjs(left.timestamp).valueOf(),
        )
        .slice(0, MAX_VISIBLE_ALERTS),
    [alerts],
  )

  /**
   * Tổng unacknowledged (toàn hệ thống) — dùng cho badge tiêu đề,
   * đảm bảo luôn khớp với thẻ KPI "Cảnh báo chờ xử lý".
   */
  const totalUnacknowledged = useMemo(
    () => alerts.filter((alert) => !alert.isAcknowledged).length,
    [alerts],
  )

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
              {totalUnacknowledged > 0
                ? `${totalUnacknowledged} sự cố chưa được xác nhận`
                : 'Không có sự cố đang chờ'}
            </Typography.Text>
          </div>
          <Badge count={totalUnacknowledged} className="recent-alerts-count" />
        </div>

        <Tooltip title="Mở trang quản lý cảnh báo">
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

      {recentAlerts.length === 0 ? (
        <Empty description="Không có cảnh báo đang chờ xử lý" />
      ) : (
        <List<SystemAlert>
          className="recent-alerts-list"
          itemLayout="horizontal"
          dataSource={recentAlerts}
          rowKey={(item) => item.id}
          renderItem={(alert) => (
            <RecentAlertItem
              alert={alert}
              onView={() => navigate('/alerts')}
            />
          )}
        />
      )}
    </Card>
  )
}

/* ──────────────────────────────────────────────────────────────────────────
 *  Item hiển thị 1 cảnh báo thu gọn — dùng trong widget Dashboard
 * ────────────────────────────────────────────────────────────────────────── */
interface RecentAlertItemProps {
  alert: SystemAlert
  onView: () => void
}

function formatRelativeTime(timestamp: string): string {
  const minutes = Math.floor(
    (Date.now() - dayjs(timestamp).valueOf()) / 60000,
  )
  if (minutes < 1) return 'Vừa xong'
  if (minutes < 60) return `${minutes} phút trước`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} giờ trước`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} ngày trước`
  return dayjs(timestamp).format('DD/MM HH:mm')
}

function RecentAlertItem({ alert, onView }: RecentAlertItemProps) {
  const visuals = SEVERITY_CONFIG[alert.severity]
  const { Icon } = visuals

  return (
    <List.Item className="recent-alerts-list-item">
      <div className="recent-alert-row">
        {/* Icon mức độ (Critical đỏ / Warning vàng / Info xanh) */}
        <span
          className={`severity-icon ${visuals.iconClass}`}
          aria-label={`Mức độ: ${visuals.label}`}
          role="img"
        >
          <Icon />
        </span>

        {/* Khối nội dung chính */}
        <div className="recent-alert-content">
          <Typography.Text strong className="recent-alert-message">
            {alert.message}
          </Typography.Text>
          <div className="recent-alert-meta">
            <span className="recent-alert-meta-chip" title="Vị trí">
              📍 {alert.trayName}
            </span>
            <span
              className="recent-alert-meta-chip"
              title="Thiết bị"
            >
              🖧 {alert.deviceId}
            </span>
            <Tooltip title={dayjs(alert.timestamp).format('DD/MM/YYYY HH:mm:ss')}>
              <span className="recent-alert-meta-time">
                ⏱ {formatRelativeTime(alert.timestamp)}
              </span>
            </Tooltip>
          </div>
        </div>

        {/* Nút thao tác */}
        <div className="recent-alert-actions">
          <Button
            type="primary"
            size="small"
            icon={<CheckOutlined />}
            onClick={onView}
            aria-label="Xác nhận cảnh báo"
          >
            Xác nhận
          </Button>
          <Button
            type="link"
            size="small"
            onClick={onView}
            aria-label="Xem chi tiết"
          >
            Xem
          </Button>
        </div>
      </div>
    </List.Item>
  )
}
