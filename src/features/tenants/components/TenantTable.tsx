import { useMemo } from 'react'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons'
import { Button, Modal, Space, Table, Tag, Tooltip } from 'antd'
import type { TableColumnsType } from 'antd'
import { useTenantStore } from '../store/tenant.store'
import type { Tenant } from '../types/tenant.types'

interface TenantTableProps {
  onEdit: (tenant: Tenant) => void
}

const STATUS_CONFIG = {
  active: {
    color: 'success',
    label: 'Đang thuê',
  },
  expired: {
    color: 'default',
    label: 'Hết hạn',
  },
} as const satisfies Record<
  Tenant['status'],
  { color: string; label: string }
>

export function TenantTable({ onEdit }: TenantTableProps) {
  const tenants = useTenantStore((state) => state.tenants)
  const deleteTenant = useTenantStore((state) => state.deleteTenant)

  const columns = useMemo<TableColumnsType<Tenant>>(
    () => [
      {
        title: 'Mã khách',
        dataIndex: 'id',
        key: 'id',
        width: 140,
      },
      {
        title: 'Họ tên',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: 'SĐT',
        dataIndex: 'phone',
        key: 'phone',
        width: 140,
      },
      {
        title: 'Khay đang thuê',
        dataIndex: 'assignedTrayId',
        key: 'assignedTrayId',
        width: 160,
      },
      {
        title: 'Ngày bắt đầu',
        dataIndex: 'startDate',
        key: 'startDate',
        width: 140,
      },
      {
        title: 'Trạng thái',
        dataIndex: 'status',
        key: 'status',
        width: 130,
        render: (status: Tenant['status']) => {
          const config = STATUS_CONFIG[status]

          return <Tag color={config.color}>{config.label}</Tag>
        },
      },
      {
        title: 'Hành động',
        key: 'actions',
        width: 120,
        align: 'right',
        render: (_, tenant) => (
          <Space size={4}>
            <Tooltip title="Sửa khách thuê">
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => onEdit(tenant)}
                aria-label={`Sửa ${tenant.name}`}
              />
            </Tooltip>

            <Tooltip title="Xóa khách thuê">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={() =>
                  Modal.confirm({
                    title: 'Xóa khách thuê?',
                    content: `Bạn có chắc muốn xóa ${tenant.name} không?`,
                    okText: 'Xóa',
                    cancelText: 'Hủy',
                    okButtonProps: { danger: true },
                    onOk: () => deleteTenant(tenant.id),
                  })
                }
                aria-label={`Xóa ${tenant.name}`}
              />
            </Tooltip>
          </Space>
        ),
      },
    ],
    [deleteTenant, onEdit],
  )

  return (
    <Table<Tenant>
      rowKey="id"
      columns={columns}
      dataSource={tenants}
      pagination={false}
      scroll={{ x: 900 }}
    />
  )
}
