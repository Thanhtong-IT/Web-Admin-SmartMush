import { useMemo, useState } from 'react'
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
  StopOutlined,
} from '@ant-design/icons'
import {
  Button,
  Empty,
  Flex,
  Image,
  Input,
  Popconfirm,
  Segmented,
  Space,
  Switch,
  Table,
  Tag,
  Tooltip,
  Typography,
  message,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { MushroomVariety } from '../../../types/pricing.types'
import { getPricePerTray } from '../../../types/pricing.types'
import {
  PRICING_CYCLE_OPTIONS,
  usePricingStore,
} from '../../../stores/pricing.store'
import { MushroomVarietyFormModal } from './MushroomVarietyFormModal'

const VND = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
})

type FilterStatus = 'ALL' | 'AVAILABLE' | 'OUT_OF_STOCK'

interface MushroomVarietyCatalogProps {
  canManage: boolean
}

export function MushroomVarietyCatalog({
  canManage,
}: MushroomVarietyCatalogProps) {
  const varieties = usePricingStore((state) => state.varieties)
  const serviceFee = usePricingStore((state) => state.serviceFee)
  const toggleVarietyAvailability = usePricingStore(
    (state) => state.toggleVarietyAvailability,
  )
  const deleteVariety = usePricingStore((state) => state.deleteVariety)

  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('ALL')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingVariety, setEditingVariety] =
    useState<MushroomVariety | null>(null)

  const filteredVarieties = useMemo(() => {
    const q = searchText.trim().toLowerCase()
    return varieties.filter((variety) => {
      const matchesSearch = q
        ? variety.name.toLowerCase().includes(q) ||
          variety.description.toLowerCase().includes(q)
        : true
      const matchesStatus =
        statusFilter === 'ALL' || variety.availability === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [statusFilter, searchText, varieties])

  const handleOpenCreate = () => {
    setEditingVariety(null)
    setModalOpen(true)
  }

  const handleOpenEdit = (variety: MushroomVariety) => {
    setEditingVariety(variety)
    setModalOpen(true)
  }

  const handleToggleAvailability = (variety: MushroomVariety) => {
    toggleVarietyAvailability(variety.id)
    message.success(
      variety.availability === 'AVAILABLE'
        ? `Đã tạm ngưng nhận đơn cho "${variety.name}".`
        : `Đã mở nhận đơn cho "${variety.name}".`,
    )
  }

  const handleDelete = (variety: MushroomVariety) => {
    deleteVariety(variety.id)
    message.success(`Đã xóa giống nấm "${variety.name}".`)
  }

  const columns: ColumnsType<MushroomVariety> = [
    {
      title: 'Giống nấm',
      key: 'name',
      width: 260,
      render: (_, record) => (
        <Flex gap={12} align="center">
          <Image
            src={record.imageUrl}
            alt={record.name}
            width={56}
            height={56}
            style={{
              borderRadius: 8,
              objectFit: 'cover',
              border: '1px solid #e5e7eb',
              flexShrink: 0,
            }}
            fallback="🍄"
            preview={false}
          />
          <Flex vertical gap={2}>
            <Typography.Text strong>{record.name}</Typography.Text>
            <Typography.Text
              type="secondary"
              style={{ fontSize: 11, maxWidth: 180 }}
              ellipsis={{ tooltip: record.description }}
            >
              {record.description}
            </Typography.Text>
          </Flex>
        </Flex>
      ),
    },
    {
      title: 'Chu kỳ gói chuẩn',
      key: 'cycle',
      width: 150,
      render: (_, record) => {
        const opt = PRICING_CYCLE_OPTIONS.find((o) => o.value === record.cycleWeeks)
        const cycleLabel = opt?.label ?? `${record.cycleWeeks} tuần`
        return (
          <Flex vertical gap={2}>
            <Tag color="green" style={{ width: 'fit-content' }}>
              {cycleLabel}
            </Tag>
            <Typography.Text type="secondary" style={{ fontSize: 11 }}>
              {record.cycleWeeks * 7} ngày
            </Typography.Text>
          </Flex>
        )
      },
    },
    {
      title: 'Giá phôi / khay',
      dataIndex: 'spawnPricePerTray',
      key: 'spawnPricePerTray',
      width: 130,
      align: 'right',
      render: (price: number) => (
        <Tooltip title={`Giá phôi giống = ${VND.format(price)}`}>
          <Typography.Text strong>{VND.format(price)}</Typography.Text>
        </Tooltip>
      ),
    },
    {
      title: 'Tổng thuê 1 khay (Tự hái)',
      key: 'totalPickup',
      width: 200,
      render: (_, record) => {
        const total = getPricePerTray(record, serviceFee)
        const breakdown = `${VND.format(serviceFee.serviceFeePerTrayPerWeek)} × ${record.cycleWeeks} tuần + ${VND.format(record.spawnPricePerTray)}`
        return (
          <Flex vertical gap={2}>
            <Typography.Text strong type="success" style={{ fontSize: 16 }}>
              {VND.format(total)}
            </Typography.Text>
            <Typography.Text
              type="secondary"
              style={{ fontSize: 11 }}
              ellipsis={{ tooltip: breakdown }}
            >
              {breakdown}
            </Typography.Text>
          </Flex>
        )
      },
    },
    {
      title: 'Tổng thuê 1 khay (Giao tận nhà)',
      key: 'totalDelivery',
      width: 200,
      render: (_, record) => {
        const trayTotal = getPricePerTray(record, serviceFee)
        const total = trayTotal + serviceFee.deliveryFeePerOrder
        return (
          <Flex vertical gap={2}>
            <Typography.Text strong style={{ color: '#7c3aed' }}>
              {VND.format(total)}
            </Typography.Text>
            <Typography.Text type="secondary" style={{ fontSize: 11 }}>
              + Ship {VND.format(serviceFee.deliveryFeePerOrder)}
            </Typography.Text>
          </Flex>
        )
      },
    },
    {
      title: 'Trạng thái',
      key: 'availability',
      width: 130,
      render: (_, record) =>
        record.availability === 'AVAILABLE' ? (
          <Flex align="center" gap={6}>
            <CheckCircleOutlined style={{ color: '#16a34a' }} />
            <Typography.Text style={{ color: '#16a34a', fontWeight: 500 }}>
              Đang nhận đơn
            </Typography.Text>
          </Flex>
        ) : (
          <Flex align="center" gap={6}>
            <CloseCircleOutlined style={{ color: '#9ca3af' }} />
            <Typography.Text type="secondary">Tạm ngưng</Typography.Text>
          </Flex>
        ),
    },
    ...(canManage
      ? [
          {
            title: 'Hành động',
            key: 'actions',
            width: 220,
            render: (_: unknown, record: MushroomVariety) => (
              <Space size={6}>
                <Button
                  size="small"
                  type="primary"
                  ghost
                  icon={<EditOutlined />}
                  onClick={() => handleOpenEdit(record)}
                >
                  Sửa giá phôi
                </Button>

                <Tooltip
                  title={
                    record.availability === 'AVAILABLE'
                      ? 'Tạm ngưng nhận đơn'
                      : 'Mở nhận đơn trở lại'
                  }
                >
                  <Switch
                    size="small"
                    checked={record.availability === 'AVAILABLE'}
                    onChange={() => handleToggleAvailability(record)}
                  />
                </Tooltip>

                <Popconfirm
                  title="Xóa giống nấm?"
                  description="Thao tác này không thể hoàn tác."
                  okText="Xóa"
                  cancelText="Hủy"
                  okButtonProps={{ danger: true }}
                  onConfirm={() => handleDelete(record)}
                >
                  <Button
                    size="small"
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    aria-label="Xóa giống nấm"
                  />
                </Popconfirm>
              </Space>
            ),
          } as ColumnsType<MushroomVariety>[number],
        ]
      : []),
  ]

  return (
    <div>
      {/* Header */}
      <Flex align="center" justify="space-between" gap={16} wrap style={{ marginBottom: 16 }}>
        <div>
          <Typography.Title level={5} style={{ margin: 0 }}>
            Danh mục Bảng giá theo Giống nấm
          </Typography.Title>
          <Typography.Text type="secondary" style={{ fontSize: 13 }}>
            Tổng hợp giống nấm và đơn giá đồng bộ với logic đặt thuê trên App khách hàng.
          </Typography.Text>
        </div>

        {canManage && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleOpenCreate}
          >
            Thêm giống nấm mới
          </Button>
        )}
      </Flex>

      {/* Filters */}
      <Flex gap={12} wrap style={{ marginBottom: 16 }}>
        <Input
          allowClear
          prefix={<SearchOutlined />}
          placeholder="Tìm theo tên giống hoặc mô tả"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 320, maxWidth: '100%' }}
        />
        <Segmented<FilterStatus>
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { label: 'Tất cả', value: 'ALL' },
            { label: 'Đang nhận đơn', value: 'AVAILABLE' },
            { label: 'Tạm ngưng', value: 'OUT_OF_STOCK' },
          ]}
        />
      </Flex>

      {/* Table */}
      {filteredVarieties.length === 0 ? (
        <Empty description="Chưa có giống nấm nào" />
      ) : (
        <Table<MushroomVariety>
          dataSource={filteredVarieties}
          columns={columns}
          rowKey="id"
          pagination={false}
          scroll={{ x: 1100 }}
          size="middle"
        />
      )}

      <MushroomVarietyFormModal
        open={modalOpen}
        initialValues={editingVariety}
        onCancel={() => {
          setModalOpen(false)
          setEditingVariety(null)
        }}
      />
    </div>
  )
}
