import {
  CheckCircleOutlined,
  DeleteOutlined,
  FileDoneOutlined,
  SafetyCertificateOutlined,
  ScissorOutlined,
  WarningOutlined,
} from '@ant-design/icons'
import { Alert, Button, Typography } from 'antd'
import type { HarvestStatus } from '../../../types/room.types'

interface TrayAdminActionsProps {
  status: HarvestStatus
  overdueDays: number
  onEarlyHarvest: () => void
  onOnTimeHarvest: () => void
  onForceCancel: () => void
  onLateHarvest: () => void
  onDestroyOverdue: () => void
}

export function TrayAdminActions({
  status,
  overdueDays,
  onEarlyHarvest,
  onOnTimeHarvest,
  onForceCancel,
  onLateHarvest,
  onDestroyOverdue,
}: TrayAdminActionsProps) {
  const isOverdue = status === 'OVERDUE'
  const isAutoHarvested = status === 'AUTO_HARVESTED'

  return (
    <section
      className="tray-detail-section tray-admin-section"
      aria-labelledby="tray-admin-actions-heading"
    >
      <div className="tray-section-heading">
        <span className="tray-section-icon" aria-hidden="true">
          <SafetyCertificateOutlined />
        </span>
        <div>
          <Typography.Title id="tray-admin-actions-heading" level={4}>
            Thao tác quản trị viên
          </Typography.Title>
          <Typography.Text type="secondary">
            Kết thúc mẻ, đối soát chi phí và giải phóng khay
          </Typography.Text>
        </div>
      </div>

      {isOverdue ? (
        <>
          <Alert
            type="error"
            showIcon
            title={`Mẻ đã quá hạn ${overdueDays} ngày`}
            description="Phí chăm sóc bổ sung đang được tính. Hãy lập hóa đơn phạt hoặc xử lý tiêu hủy nếu khách bỏ mẻ."
            className="tray-admin-alert"
          />
          <div className="tray-admin-actions tray-admin-actions--crisis">
            <Button
              type="primary"
              className="tray-action-button tray-action-button--late"
              icon={<FileDoneOutlined />}
              onClick={onLateHarvest}
            >
              Thu hoạch trễ & Xuất hóa đơn phạt
            </Button>
            <Button
              danger
              className="tray-action-button"
              icon={<DeleteOutlined />}
              onClick={onDestroyOverdue}
            >
              Cưỡng chế hủy & Tiêu hủy nấm
            </Button>
          </div>
        </>
      ) : isAutoHarvested ? (
        <>
          <div className="tray-action-note tray-action-note--success">
            <CheckCircleOutlined aria-hidden="true" />
            Nấm đã được thu hộ và lưu kho. Hoàn tất hóa đơn để bàn giao và giải
            phóng khay.
          </div>
          <div className="tray-admin-actions tray-admin-actions--single">
            <Button
              type="primary"
              className="tray-action-button"
              icon={<FileDoneOutlined />}
              onClick={onOnTimeHarvest}
            >
              Xuất hóa đơn & Giải phóng khay
            </Button>
          </div>
        </>
      ) : (
        <div className="tray-admin-actions tray-admin-actions--standard">
          <Button
            className="tray-action-button tray-action-button--early"
            icon={<ScissorOutlined />}
            onClick={onEarlyHarvest}
          >
            Thu hoạch sớm (Yêu cầu của khách)
          </Button>
          <Button
            type="primary"
            className="tray-action-button"
            icon={<FileDoneOutlined />}
            onClick={onOnTimeHarvest}
          >
            Thu hoạch đúng hạn & Xuất hóa đơn
          </Button>
          <Button
            danger
            className="tray-action-button tray-action-button--cancel"
            icon={<WarningOutlined />}
            onClick={onForceCancel}
          >
            Cưỡng chế hủy mẻ
          </Button>
        </div>
      )}
    </section>
  )
}
