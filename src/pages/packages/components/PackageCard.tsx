import {
  CheckOutlined,
  EditOutlined,
  StarFilled,
  StarOutlined,
  StopOutlined,
  DeleteOutlined,
} from '@ant-design/icons'
import {
  Badge,
  Button,
  Card,
  Divider,
  Flex,
  Popconfirm,
  Space,
  Tag,
  Typography,
} from 'antd'
import type { BillingCycle, PackageStatus, RentalPackage } from '../../../types/package.types'

interface PackageCardProps {
  rentalPackage: RentalPackage
  canManage: boolean
  onEdit: (rentalPackage: RentalPackage) => void
  onDelete: (rentalPackage: RentalPackage) => void
  onToggleStatus: (rentalPackage: RentalPackage) => void
  onTogglePopular: (rentalPackage: RentalPackage) => void
  onSelect: (rentalPackage: RentalPackage) => void
}

const BILLING_CYCLE_LABELS: Record<BillingCycle, string> = {
  MONTHLY: 'Theo tháng',
  CROP_CYCLE: 'Theo vụ mùa',
  QUARTERLY: 'Theo quý',
  YEARLY: 'Theo năm',
}

const STATUS_CONFIG: Record<
  PackageStatus,
  { color: string; label: string }
> = {
  ACTIVE: { color: 'success', label: 'Đang kinh doanh' },
  INACTIVE: { color: 'default', label: 'Tạm ngưng' },
  PROMOTION: { color: 'processing', label: 'Gói ưu đãi' },
}

const VND_FORMATTER = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
})

export function PackageCard({
  rentalPackage,
  canManage,
  onEdit,
  onDelete,
  onToggleStatus,
  onTogglePopular,
  onSelect,
}: PackageCardProps) {
  const statusConfig = STATUS_CONFIG[rentalPackage.status]
  const isAvailable = rentalPackage.status !== 'INACTIVE'

  return (
    <Badge.Ribbon
      text={rentalPackage.isPopular ? 'Phổ biến nhất' : rentalPackage.status === 'PROMOTION' ? 'Ưu đãi' : undefined}
      color={rentalPackage.isPopular ? '#d97706' : '#2563eb'}
      style={{ display: rentalPackage.isPopular || rentalPackage.status === 'PROMOTION' ? undefined : 'none' }}
    >
      <Card
        style={{ height: '100%', borderRadius: 8 }}
        styles={{ body: { padding: 20, height: '100%' } }}
      >
        <Flex vertical style={{ height: '100%' }}>
          <Flex align="flex-start" justify="space-between" gap={12}>
            <div>
              <Typography.Title level={4} style={{ margin: 0 }}>
                {rentalPackage.name}
              </Typography.Title>
              <Typography.Text type="secondary">{rentalPackage.code}</Typography.Text>
            </div>
            <Tag color={statusConfig.color}>{statusConfig.label}</Tag>
          </Flex>

          <Typography.Title level={2} style={{ margin: '20px 0 4px' }}>
            {VND_FORMATTER.format(rentalPackage.price)}
          </Typography.Title>
          <Typography.Text type="secondary">
            {BILLING_CYCLE_LABELS[rentalPackage.billingCycle]} · {rentalPackage.durationDays} ngày
          </Typography.Text>

          <Divider style={{ margin: '18px 0' }} />

          <Space direction="vertical" size={8} style={{ width: '100%' }}>
            <Typography.Text>
              Tối đa <strong>{rentalPackage.maxTrays} khay</strong>
            </Typography.Text>
            <Typography.Text type="secondary">
              {rentalPackage.totalSubscribers} khách đang đăng ký
            </Typography.Text>
          </Space>

          <Typography.Text strong style={{ display: 'block', marginTop: 18 }}>
            Giống nấm hỗ trợ
          </Typography.Text>
          <Flex gap={6} wrap style={{ marginTop: 8 }}>
            {rentalPackage.supportedMushrooms.map((mushroom) => (
              <Tag key={mushroom}>{mushroom}</Tag>
            ))}
          </Flex>

          <Typography.Text strong style={{ display: 'block', marginTop: 18 }}>
            Dịch vụ đi kèm
          </Typography.Text>
          <Space direction="vertical" size={6} style={{ marginTop: 8 }}>
            {rentalPackage.features.length > 0 ? (
              rentalPackage.features.map((feature) => (
                <Flex key={feature} align="flex-start" gap={8}>
                  <CheckOutlined style={{ color: '#16a34a', marginTop: 4 }} />
                  <Typography.Text>{feature}</Typography.Text>
                </Flex>
              ))
            ) : (
              <Flex align="flex-start" gap={8}>
                <StopOutlined style={{ color: '#9ca3af', marginTop: 4 }} />
                <Typography.Text type="secondary">Không có tiện ích bổ sung</Typography.Text>
              </Flex>
            )}
          </Space>

          <Flex gap={8} wrap style={{ marginTop: 'auto', paddingTop: 20 }}>
            {canManage ? (
              <>
                <Button icon={<EditOutlined />} onClick={() => onEdit(rentalPackage)}>
                  Sửa
                </Button>
                <Popconfirm
                  title={
                    rentalPackage.status === 'INACTIVE'
                      ? 'Kích hoạt gói cước?'
                      : 'Tạm ngưng gói cước?'
                  }
                  description="Thay đổi trạng thái sẽ ảnh hưởng khả năng đăng ký mới."
                  okText="Xác nhận"
                  cancelText="Hủy"
                  onConfirm={() => onToggleStatus(rentalPackage)}
                >
                  <Button icon={<StopOutlined />}>
                    {rentalPackage.status === 'INACTIVE' ? 'Kích hoạt' : 'Tạm ngưng'}
                  </Button>
                </Popconfirm>
                <Button
                  icon={rentalPackage.isPopular ? <StarFilled /> : <StarOutlined />}
                  onClick={() => onTogglePopular(rentalPackage)}
                  aria-label={`${rentalPackage.isPopular ? 'Gỡ' : 'Đánh dấu'} gói nổi bật`}
                />
                <Popconfirm
                  title="Xóa gói cước?"
                  description="Thao tác này không thể hoàn tác."
                  okText="Xóa"
                  cancelText="Hủy"
                  okButtonProps={{ danger: true }}
                  onConfirm={() => onDelete(rentalPackage)}
                >
                  <Button danger icon={<DeleteOutlined />} aria-label="Xóa gói cước" />
                </Popconfirm>
              </>
            ) : (
              <Button
                type="primary"
                block
                disabled={!isAvailable}
                onClick={() => onSelect(rentalPackage)}
              >
                {isAvailable ? 'Chọn gói này' : 'Tạm ngưng đăng ký'}
              </Button>
            )}
          </Flex>
        </Flex>
      </Card>
    </Badge.Ribbon>
  )
}
