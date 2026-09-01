import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  StarFilled,
  StarOutlined,
} from '@ant-design/icons'
import {
  Button,
  Flex,
  Popconfirm,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
} from 'antd'
import type { TableColumnsType } from 'antd'
import type {
  BillingCycle,
  PackageStatus,
  RentalPackage,
} from '../../../types/package.types'

interface PackageComparisonTableProps {
  packages: RentalPackage[]
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

export function PackageComparisonTable({
  packages,
  canManage,
  onEdit,
  onDelete,
  onToggleStatus,
  onTogglePopular,
  onSelect,
}: PackageComparisonTableProps) {
  const columns: TableColumnsType<RentalPackage> = [
    {
      title: 'Gói cước',
      key: 'package',
      fixed: 'left',
      width: 220,
      render: (_, rentalPackage) => (
        <Flex vertical gap={2}>
          <Typography.Text strong>{rentalPackage.name}</Typography.Text>
          <Typography.Text type="secondary">{rentalPackage.code}</Typography.Text>
          {rentalPackage.isPopular && <Tag color="gold">Phổ biến nhất</Tag>}
        </Flex>
      ),
    },
    {
      title: 'Giá cước',
      dataIndex: 'price',
      key: 'price',
      width: 150,
      render: (price: number) => (
        <Typography.Text strong>{VND_FORMATTER.format(price)}</Typography.Text>
      ),
    },
    {
      title: 'Chu kỳ',
      dataIndex: 'billingCycle',
      key: 'billingCycle',
      width: 130,
      render: (cycle: BillingCycle) => BILLING_CYCLE_LABELS[cycle],
    },
    {
      title: 'Thời hạn',
      dataIndex: 'durationDays',
      key: 'durationDays',
      width: 100,
      render: (duration: number) => `${duration} ngày`,
    },
    {
      title: 'Số khay tối đa',
      dataIndex: 'maxTrays',
      key: 'maxTrays',
      width: 120,
      render: (maxTrays: number) => `${maxTrays} khay`,
    },
    {
      title: 'Giống nấm hỗ trợ',
      dataIndex: 'supportedMushrooms',
      key: 'supportedMushrooms',
      width: 250,
      render: (mushrooms: string[]) => (
        <Flex gap={4} wrap>
          {mushrooms.length > 0 ? (
            mushrooms.map((mushroom) => <Tag key={mushroom}>{mushroom}</Tag>)
          ) : (
            <Flex align="center" gap={4}>
              <CloseCircleOutlined style={{ color: '#9ca3af' }} />
              <Typography.Text type="secondary">Không hỗ trợ</Typography.Text>
            </Flex>
          )}
        </Flex>
      ),
    },
    {
      title: 'Dịch vụ đi kèm',
      dataIndex: 'features',
      key: 'features',
      width: 280,
      render: (features: string[]) => (
        <Space direction="vertical" size={4}>
          {features.length > 0 ? (
            features.map((feature) => (
              <Flex key={feature} align="flex-start" gap={6}>
                <CheckCircleOutlined style={{ color: '#16a34a', marginTop: 3 }} />
                <Typography.Text>{feature}</Typography.Text>
              </Flex>
            ))
          ) : (
            <Flex align="center" gap={6}>
              <CloseCircleOutlined style={{ color: '#9ca3af' }} />
              <Typography.Text type="secondary">Không có</Typography.Text>
            </Flex>
          )}
        </Space>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (status: PackageStatus) => {
        const config = STATUS_CONFIG[status]

        return <Tag color={config.color}>{config.label}</Tag>
      },
    },
    {
      title: 'Đăng ký',
      dataIndex: 'totalSubscribers',
      key: 'totalSubscribers',
      width: 100,
      render: (total: number) => `${total} khách`,
    },
    {
      title: 'Hành động',
      key: 'actions',
      fixed: 'right',
      width: canManage ? 190 : 130,
      align: 'right',
      render: (_, rentalPackage) =>
        canManage ? (
          <Space size={2}>
            <Tooltip title="Sửa gói cước">
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => onEdit(rentalPackage)}
                aria-label={`Sửa ${rentalPackage.name}`}
              />
            </Tooltip>

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
              <Tooltip
                title={
                  rentalPackage.status === 'INACTIVE'
                    ? 'Kích hoạt'
                    : 'Tạm ngưng'
                }
              >
                <Button
                  type="text"
                  icon={
                    rentalPackage.status === 'INACTIVE' ? (
                      <PlayCircleOutlined />
                    ) : (
                      <PauseCircleOutlined />
                    )
                  }
                  aria-label="Thay đổi trạng thái gói cước"
                />
              </Tooltip>
            </Popconfirm>

            <Tooltip title={rentalPackage.isPopular ? 'Gỡ nổi bật' : 'Đánh dấu nổi bật'}>
              <Button
                type="text"
                icon={
                  rentalPackage.isPopular ? <StarFilled /> : <StarOutlined />
                }
                onClick={() => onTogglePopular(rentalPackage)}
                aria-label="Thay đổi gói nổi bật"
              />
            </Tooltip>

            <Popconfirm
              title="Xóa gói cước?"
              description="Thao tác này không thể hoàn tác."
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
              onConfirm={() => onDelete(rentalPackage)}
            >
              <Tooltip title="Xóa gói cước">
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  aria-label={`Xóa ${rentalPackage.name}`}
                />
              </Tooltip>
            </Popconfirm>
          </Space>
        ) : (
          <Button
            type="primary"
            size="small"
            disabled={rentalPackage.status === 'INACTIVE'}
            onClick={() => onSelect(rentalPackage)}
          >
            Chọn gói
          </Button>
        ),
    },
  ]

  return (
    <Table<RentalPackage>
      rowKey="id"
      columns={columns}
      dataSource={packages}
      pagination={false}
      scroll={{ x: 1700 }}
    />
  )
}
