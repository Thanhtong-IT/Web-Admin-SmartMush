import { useState } from 'react'
import {
  CloseOutlined,
  InboxOutlined,
} from '@ant-design/icons'
import {
  Alert,
  Descriptions,
  Flex,
  Modal,
  Select,
  Space,
  Typography,
} from 'antd'
import type { AppOrder } from '../../../types/order.types'
import type { TierId, TrayPosition } from '../../../types/room.types'
import { TIER_IDS, TRAY_POSITIONS } from '../../../types/room.types'
import { getAvailableTrays } from '../../../stores/order.store'

interface TrayAssignmentModalProps {
  open: boolean
  order: AppOrder | null
  assignedTrayIds?: Set<string>
  onCancel: () => void
  onConfirm: (trayId: string) => void
}

/** Format mã khay hiển thị */
function formatTrayLabel(tierId: number, position: number) {
  return `Tầng ${tierId} · Khay ${position} (T${tierId}-K${position})`
}

export function TrayAssignmentModal({
  open,
  order,
  onCancel,
  onConfirm,
}: TrayAssignmentModalProps) {
  const [selectedTierId, setSelectedTierId] = useState<TierId | null>(null)
  const [selectedTrayId, setSelectedTrayId] = useState<string | null>(null)

  const availableTrays = getAvailableTrays([]) // luôn dùng state mới nhất

  const traysByTier = TIER_IDS.reduce<
    Record<TierId, Array<{ trayId: string; position: number }>>
  >((acc, tierId) => {
    acc[tierId] = availableTrays.filter((t) => t.tierId === tierId)
    return acc
  }, {} as Record<TierId, Array<{ trayId: string; position: number }>>)

  const currentTrays = selectedTierId != null ? traysByTier[selectedTierId] ?? [] : []

  const handleConfirm = () => {
    if (!selectedTrayId) return
    onConfirm(selectedTrayId)
    setSelectedTierId(null)
    setSelectedTrayId(null)
  }

  const handleCancel = () => {
    setSelectedTierId(null)
    setSelectedTrayId(null)
    onCancel()
  }

  if (!order) return null

  return (
    <Modal
      title="Gán khay cho đơn đặt"
      open={open}
      onCancel={handleCancel}
      onOk={handleConfirm}
      okText="Xác nhận gán khay"
      cancelText="Hủy"
      okButtonProps={{
        disabled: !selectedTrayId,
        icon: <InboxOutlined />,
      }}
      destroyOnHidden
      afterClose={() => {
        setSelectedTierId(null)
        setSelectedTrayId(null)
      }}
      width={560}
    >
      <Flex vertical gap={16}>
        {/* Thông tin đơn */}
        <Descriptions
          column={2}
          size="small"
          title="Thông tin đơn đặt"
          items={[
            {
              key: 'orderCode',
              label: 'Mã đơn',
              children: (
                <Typography.Text strong code>
                  {order.orderCode}
                </Typography.Text>
              ),
            },
            {
              key: 'tenant',
              label: 'Khách hàng',
              children: `${order.tenantName} · ${order.tenantPhone}`,
            },
            {
              key: 'item',
              label: 'Loại nấm & Thời gian',
              children: order.items
                .map((item) => `${item.mushroomType} · ${item.weeks} Tuần × ${item.quantity} khay`)
                .join(', '),
            },
            {
              key: 'total',
              label: 'Tổng tiền',
              children: (
                <Typography.Text strong type="danger">
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  }).format(order.totalAmount)}
                </Typography.Text>
              ),
            },
          ]}
        />

        <Alert
          type="info"
          showIcon
          icon={<InboxOutlined />}
          message="Chọn Tầng và Khay vật lý còn trống để gán vào đơn đặt này."
          description="Khay đã được gán cho đơn khác sẽ không hiển thị trong danh sách."
        />

        {/* Chọn tầng */}
        <Flex vertical gap={6}>
          <Typography.Text strong>1. Chọn Tầng</Typography.Text>
          <Select
            placeholder="— Chọn tầng —"
            value={selectedTierId}
            onChange={(value) => {
              setSelectedTierId(value)
              setSelectedTrayId(null)
            }}
            style={{ width: '100%' }}
            options={TIER_IDS.map((tierId) => ({
              value: tierId,
              label: `Tầng ${tierId}${traysByTier[tierId].length === 0 ? ' (đã đầy)' : ` (${traysByTier[tierId].length} khay trống)`}`,
              disabled: traysByTier[tierId].length === 0,
            }))}
          />
        </Flex>

        {/* Chọn khay */}
        {selectedTierId != null && (
          <Flex vertical gap={6}>
            <Typography.Text strong>2. Chọn Khay cụ thể</Typography.Text>
            <Select
              placeholder="— Chọn khay —"
              value={selectedTrayId}
              onChange={setSelectedTrayId}
              style={{ width: '100%' }}
              options={currentTrays.map((tray) => ({
                value: tray.trayId,
                label: formatTrayLabel(tray.tierId, tray.position),
              }))}
              notFoundContent={
                <Typography.Text type="secondary">
                  Tầng này không còn khay trống.
                </Typography.Text>
              }
            />
          </Flex>
        )}

        {/* Summary */}
        {selectedTrayId && (
          <Alert
            type="success"
            showIcon
            message={
              <Space>
                <InboxOutlined />
                <span>
                  Đơn <strong>{order.orderCode}</strong> sẽ được gán vào khay{' '}
                  <strong>{selectedTrayId}</strong>.
                </span>
              </Space>
            }
          />
        )}
      </Flex>
    </Modal>
  )
}
