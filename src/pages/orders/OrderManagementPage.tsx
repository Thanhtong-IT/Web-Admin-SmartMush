import { useMemo, useState } from 'react'
import {
  EnvironmentOutlined,
  InboxOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import {
  Badge,
  Button,
  Empty,
  Flex,
  Input,
  Popconfirm,
  Segmented,
  Space,
  Tag,
  Typography,
  message,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { AppOrder, OrderStatus } from '../../types/order.types'
import { useOrderStore } from '../../stores/order.store'
import { TrayAssignmentModal } from './components/TrayAssignmentModal'

const STATUS_CONFIG: Record<
  OrderStatus,
  { color: string; label: string; badge: string }
> = {
  PENDING_TRAY_ASSIGNMENT: {
    color: 'warning',
    label: 'Chờ gán khay',
    badge: 'warning',
  },
  ASSIGNED: {
    color: 'processing',
    label: 'Đã gán khay',
    badge: 'processing',
  },
  GROWING: {
    color: 'success',
    label: 'Đang sinh trưởng',
    badge: 'success',
  },
  READY_TO_HARVEST: {
    color: 'error',
    label: 'Chờ thu hoạch',
    badge: 'error',
  },
  COMPLETED: {
    color: 'default',
    label: 'Hoàn thành',
    badge: 'default',
  },
  CANCELLED: {
    color: 'default',
    label: 'Đã hủy',
    badge: 'default',
  },
}

const PAYMENT_STATUS_CONFIG: Record<
  string,
  { color: string; label: string }
> = {
  PAID: { color: 'success', label: 'Đã thanh toán' },
  UNPAID: { color: 'warning', label: 'Chưa thanh toán' },
  REFUNDED: { color: 'error', label: 'Đã hoàn tiền' },
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  ONLINE_APP: 'App (MCMS)',
  BANK_TRANSFER: 'Chuyển khoản',
  COD: 'COD',
}

const VND = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
})

const DATE_FORMATTER = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

type OrderTab = 'ALL' | OrderStatus

const TAB_OPTIONS: Array<{ value: OrderTab; label: string }> = [
  { value: 'ALL', label: 'Tất cả' },
  { value: 'PENDING_TRAY_ASSIGNMENT', label: 'Chờ gán khay' },
  { value: 'ASSIGNED', label: 'Đã gán khay' },
  { value: 'GROWING', label: 'Đang trồng' },
  { value: 'READY_TO_HARVEST', label: 'Chờ thu hoạch' },
  { value: 'COMPLETED', label: 'Đã hoàn thành' },
]

export function OrderManagementPage() {
  const orders = useOrderStore((state) => state.orders)
  const assignTrayToOrder = useOrderStore((state) => state.assignTrayToOrder)
  const cancelOrder = useOrderStore((state) => state.cancelOrder)

  const [searchText, setSearchText] = useState('')
  const [activeTab, setActiveTab] = useState<OrderTab>('ALL')
  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [orderToAssign, setOrderToAssign] = useState<AppOrder | null>(null)

  const filteredOrders = useMemo(() => {
    const q = searchText.trim().toLowerCase()
    return orders.filter((order) => {
      const matchesSearch = q
        ? [
            order.orderCode,
            order.tenantName,
            order.tenantPhone,
            order.items.map((i) => i.mushroomType).join(' '),
          ].some((v) => v.toLowerCase().includes(q))
        : true

      const matchesTab =
        activeTab === 'ALL' || order.status === activeTab

      return matchesSearch && matchesTab
    })
  }, [activeTab, orders, searchText])

  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: orders.length }
    orders.forEach((order) => {
      counts[order.status] = (counts[order.status] ?? 0) + 1
    })
    return counts
  }, [orders])

  const handleOpenAssign = (order: AppOrder) => {
    setOrderToAssign(order)
    setAssignModalOpen(true)
  }

  const handleConfirmAssign = (trayId: string) => {
    if (!orderToAssign) return

    const batchId = `BATCH-${new Date().getFullYear()}-${Date.now().toString(36).toUpperCase()}`
    assignTrayToOrder(orderToAssign.id, trayId, batchId)
    message.success(
      `Đã gán đơn ${orderToAssign.orderCode} vào khay ${trayId}.`,
    )
    setAssignModalOpen(false)
    setOrderToAssign(null)
  }

  const handleCancelOrder = (order: AppOrder) => {
    cancelOrder(order.id)
    message.warning(`Đơn ${order.orderCode} đã bị hủy.`)
  }

  const columns: ColumnsType<AppOrder> = [
    {
      title: 'Mã đơn',
      dataIndex: 'orderCode',
      key: 'orderCode',
      width: 200,
      render: (code: string) => (
        <Typography.Text code style={{ fontSize: 13 }}>
          {code}
        </Typography.Text>
      ),
    },
    {
      title: 'Khách hàng',
      key: 'tenant',
      width: 200,
      render: (_, record) => (
        <Flex vertical gap={2}>
          <Typography.Text strong>{record.tenantName}</Typography.Text>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {record.tenantPhone}
          </Typography.Text>
        </Flex>
      ),
    },
    {
      title: 'Loại nấm & Thời gian',
      key: 'items',
      width: 260,
      render: (_, record) => (
        <Flex vertical gap={4}>
          {record.items.map((item, idx) => (
            <Flex key={idx} vertical gap={2}>
              <Flex gap={4} align="center" wrap>
                <Tag color="green">{item.mushroomType}</Tag>
                <Tag color="cyan">× {item.weeks} Tuần</Tag>
              </Flex>
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                ×{item.quantity} khay · {VND.format(item.unitPrice)}/kay/tuần
              </Typography.Text>
            </Flex>
          ))}
        </Flex>
      ),
    },
    {
      title: 'Nhận hàng',
      key: 'delivery',
      width: 180,
      render: (_, record) => {
        if (record.deliveryMethod === 'PICKUP') {
          return (
            <Tag icon={<EnvironmentOutlined />} color="blue">
              Tự đến hái
            </Tag>
          )
        }
        return (
          <Flex vertical gap={2}>
            <Tag color="orange">Giao tận nhà</Tag>
            <Typography.Text
              type="secondary"
              style={{ fontSize: 11 }}
              ellipsis={{ tooltip: record.deliveryAddress }}
            >
              {record.deliveryAddress ?? record.tenantAddress}
            </Typography.Text>
          </Flex>
        )
      },
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 160,
      render: (amount: number, record) => (
        <Flex vertical gap={2}>
          <Typography.Text strong type="danger">
            {VND.format(amount)}
          </Typography.Text>
          <Typography.Text type="secondary" style={{ fontSize: 11 }}>
            {PAYMENT_METHOD_LABELS[record.paymentMethod] ?? record.paymentMethod}
          </Typography.Text>
          <Tag
            color={PAYMENT_STATUS_CONFIG[record.paymentStatus]?.color}
            style={{ width: 'fit-content', fontSize: 11 }}
          >
            {PAYMENT_STATUS_CONFIG[record.paymentStatus]?.label}
          </Tag>
        </Flex>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 160,
      render: (status: OrderStatus, record) => {
        const config = STATUS_CONFIG[status]
        return (
          <Flex vertical gap={4}>
            <Tag color={config.color}>{config.label}</Tag>
            {record.trayId && (
              <Typography.Text code style={{ fontSize: 12 }}>
                {record.trayId}
              </Typography.Text>
            )}
          </Flex>
        )
      },
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 140,
      render: (date: string) => (
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          {DATE_FORMATTER.format(new Date(date))}
        </Typography.Text>
      ),
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 180,
      fixed: 'right',
      render: (_, record) => {
        if (record.status === 'PENDING_TRAY_ASSIGNMENT') {
          return (
            <Space direction="vertical" size={4} style={{ width: '100%' }}>
              <Button
                type="primary"
                size="small"
                icon={<InboxOutlined />}
                onClick={() => handleOpenAssign(record)}
              >
                Gán khay trống
              </Button>
              <Popconfirm
                title="Hủy đơn đặt này?"
                description="Thao tác này không thể hoàn tác."
                okText="Hủy đơn"
                cancelText="Giữ"
                okButtonProps={{ danger: true }}
                onConfirm={() => handleCancelOrder(record)}
              >
                <Button danger size="small">
                  Hủy đơn
                </Button>
              </Popconfirm>
            </Space>
          )
        }

        if (record.status === 'CANCELLED') {
          return <Typography.Text type="secondary">—</Typography.Text>
        }

        return (
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {record.trayId ? `Khay ${record.trayId}` : '—'}
          </Typography.Text>
        )
      },
    },
  ]

  return (
    <div>
      {/* Header */}
      <Flex
        align="center"
        justify="space-between"
        gap={16}
        wrap
        style={{ marginBottom: 20 }}
      >
        <div>
          <Typography.Title level={3} style={{ margin: 0 }}>
            Quản lý đơn đặt từ App
          </Typography.Title>
          <Typography.Text type="secondary">
            Danh sách đơn đặt khay từ ứng dụng khách hàng — Shopee-like order management
          </Typography.Text>
        </div>

        <Badge count={tabCounts['PENDING_TRAY_ASSIGNMENT'] ?? 0} overflowCount={99}>
          <Tag color="warning" style={{ fontSize: 13, padding: '4px 12px' }}>
            {tabCounts['PENDING_TRAY_ASSIGNMENT'] ?? 0} đơn chờ gán khay
          </Tag>
        </Badge>
      </Flex>

      {/* Filters */}
      <Flex gap={12} wrap style={{ marginBottom: 16 }}>
        <Input
          allowClear
          prefix={<SearchOutlined />}
          placeholder="Tìm mã đơn, tên khách, SĐT hoặc loại nấm"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 360, maxWidth: '100%' }}
        />
      </Flex>

      {/* Tabs */}
      <Segmented<OrderTab>
        value={activeTab}
        onChange={setActiveTab}
        options={TAB_OPTIONS.map((opt) => ({
          ...opt,
          label:
            opt.value === 'ALL'
              ? `Tất cả (${tabCounts.ALL})`
              : `${opt.label} (${tabCounts[opt.value] ?? 0})`,
        }))}
        style={{ marginBottom: 20 }}
      />

      {/* Table */}
      {filteredOrders.length === 0 ? (
        <Empty description="Không có đơn đặt nào" />
      ) : (
        <div
          style={{
            overflowX: 'auto',
            borderRadius: 8,
            border: '1px solid #f0f0f0',
          }}
        >
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              background: '#fff',
            }}
          >
            <thead>
              <tr
                style={{
                  background: '#fafafa',
                  borderBottom: '1px solid #f0f0f0',
                }}
              >
                {columns.map((col) => (
                  <th
                    key={col.key as string}
                    style={{
                      padding: '12px 8px',
                      textAlign: 'left' as const,
                      fontSize: 12,
                      fontWeight: 600,
                      color: '#6b7280',
                      whiteSpace: 'nowrap' as const,
                      width: (col as { width?: number | string }).width
                        ? (col as { width?: number | string }).width
                        : 'auto',
                    }}
                  >
                    {col.title as string}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => {
                const statusCfg = STATUS_CONFIG[order.status]
                return (
                  <tr
                    key={order.id}
                    style={{
                      borderBottom: '1px solid #f5f5f5',
                      background:
                        order.status === 'PENDING_TRAY_ASSIGNMENT'
                          ? '#fffbf0'
                          : undefined,
                    }}
                  >
                    {/* Mã đơn */}
                    <td style={{ padding: '12px 8px' }}>
                      <Typography.Text code style={{ fontSize: 13 }}>
                        {order.orderCode}
                      </Typography.Text>
                    </td>

                    {/* Khách hàng */}
                    <td style={{ padding: '12px 8px' }}>
                      <Flex vertical gap={2}>
                        <Typography.Text strong>
                          {order.tenantName}
                        </Typography.Text>
                        <Typography.Text
                          type="secondary"
                          style={{ fontSize: 12 }}
                        >
                          {order.tenantPhone}
                        </Typography.Text>
                      </Flex>
                    </td>

                    {/* Loại nấm & Thời gian */}
                    <td style={{ padding: '12px 8px' }}>
                      <Flex vertical gap={4}>
                        {order.items.map((item, idx) => (
                          <Flex key={idx} vertical gap={2}>
                            <Flex gap={4} align="center" wrap>
                              <Tag color="green">{item.mushroomType}</Tag>
                              <Tag color="cyan">× {item.weeks} Tuần</Tag>
                            </Flex>
                            <Typography.Text
                              type="secondary"
                              style={{ fontSize: 12 }}
                            >
                              ×{item.quantity} khay · {VND.format(item.unitPrice)}/kay/tuần
                            </Typography.Text>
                          </Flex>
                        ))}
                      </Flex>
                    </td>

                    {/* Nhận hàng */}
                    <td style={{ padding: '12px 8px' }}>
                      {order.deliveryMethod === 'PICKUP' ? (
                        <Tag icon={<EnvironmentOutlined />} color="blue">
                          Tự đến hái
                        </Tag>
                      ) : (
                        <Flex vertical gap={2}>
                          <Tag color="orange">Giao tận nhà</Tag>
                          <Typography.Text
                            type="secondary"
                            style={{ fontSize: 11 }}
                            ellipsis={{
                              tooltip:
                                order.deliveryAddress ?? order.tenantAddress,
                            }}
                          >
                            {order.deliveryAddress ?? order.tenantAddress}
                          </Typography.Text>
                        </Flex>
                      )}
                    </td>

                    {/* Tổng tiền */}
                    <td style={{ padding: '12px 8px' }}>
                      <Flex vertical gap={2}>
                        <Typography.Text strong type="danger">
                          {VND.format(order.totalAmount)}
                        </Typography.Text>
                        <Typography.Text
                          type="secondary"
                          style={{ fontSize: 11 }}
                        >
                          {PAYMENT_METHOD_LABELS[order.paymentMethod] ??
                            order.paymentMethod}
                        </Typography.Text>
                        <Tag
                          color={
                            PAYMENT_STATUS_CONFIG[order.paymentStatus]?.color
                          }
                          style={{ width: 'fit-content', fontSize: 11 }}
                        >
                          {PAYMENT_STATUS_CONFIG[order.paymentStatus]?.label}
                        </Tag>
                      </Flex>
                    </td>

                    {/* Trạng thái */}
                    <td style={{ padding: '12px 8px' }}>
                      <Flex vertical gap={4}>
                        <Tag color={statusCfg.color}>{statusCfg.label}</Tag>
                        {order.trayId && (
                          <Typography.Text code style={{ fontSize: 12 }}>
                            {order.trayId}
                          </Typography.Text>
                        )}
                      </Flex>
                    </td>

                    {/* Ngày tạo */}
                    <td style={{ padding: '12px 8px' }}>
                      <Typography.Text
                        type="secondary"
                        style={{ fontSize: 12 }}
                      >
                        {DATE_FORMATTER.format(new Date(order.createdAt))}
                      </Typography.Text>
                    </td>

                    {/* Hành động */}
                    <td style={{ padding: '12px 8px' }}>
                      {order.status === 'PENDING_TRAY_ASSIGNMENT' ? (
                        <Space direction="vertical" size={4}>
                          <Button
                            type="primary"
                            size="small"
                            icon={<InboxOutlined />}
                            onClick={() => handleOpenAssign(order)}
                          >
                            Gán khay trống
                          </Button>
                          <Popconfirm
                            title="Hủy đơn đặt này?"
                            description="Thao tác này không thể hoàn tác."
                            okText="Hủy đơn"
                            cancelText="Giữ"
                            okButtonProps={{ danger: true }}
                            onConfirm={() => handleCancelOrder(order)}
                          >
                            <Button danger size="small">
                              Hủy đơn
                            </Button>
                          </Popconfirm>
                        </Space>
                      ) : order.status === 'CANCELLED' ? (
                        <Typography.Text type="secondary">—</Typography.Text>
                      ) : (
                        <Typography.Text
                          type="secondary"
                          style={{ fontSize: 12 }}
                        >
                          {order.trayId ? `Khay ${order.trayId}` : '—'}
                        </Typography.Text>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Tray Assignment Modal */}
      <TrayAssignmentModal
        open={assignModalOpen}
        order={orderToAssign}
        onCancel={() => {
          setAssignModalOpen(false)
          setOrderToAssign(null)
        }}
        onConfirm={handleConfirmAssign}
      />
    </div>
  )
}
