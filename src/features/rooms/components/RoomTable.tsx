import { useMemo } from 'react'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons'
import { Button, Modal, Space, Table, Tooltip } from 'antd'
import type { TableColumnsType } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useRoomStore } from '../../../stores/room.store'
import type { Tray, TrayStatus } from '../../../types/room.types'
import { RoomStatusTag } from './RoomStatusTag'

interface RoomTableProps {
  roomId?: string
  onEdit?: (tray: Tray) => void
}

export function RoomTable({ roomId, onEdit }: RoomTableProps) {
  const navigate = useNavigate()
  const trays = useRoomStore((state) => state.trays)
  const deleteTray = useRoomStore((state) => state.deleteTray)

  const visibleTrays = useMemo(
    () => (roomId ? trays.filter((tray) => tray.roomId === roomId) : trays),
    [roomId, trays],
  )

  const columns = useMemo<TableColumnsType<Tray>>(
    () => [
      {
        title: 'Mã khay',
        dataIndex: 'id',
        key: 'id',
        width: 140,
      },
      {
        title: 'Tên khay',
        dataIndex: 'name',
        key: 'name',
        render: (name: string, tray) => (
          <Button
            type="link"
            onClick={() => navigate(`/rooms/${tray.id}`)}
            style={{ height: 'auto', padding: 0 }}
          >
            {name}
          </Button>
        ),
      },
      {
        title: 'Mã thiết bị ESP32',
        dataIndex: 'deviceId',
        key: 'deviceId',
        width: 170,
      },
      {
        title: 'Loại nấm',
        dataIndex: 'mushroomType',
        key: 'mushroomType',
        width: 170,
      },
      {
        title: 'Trạng thái',
        dataIndex: 'status',
        key: 'status',
        width: 160,
        render: (status: TrayStatus) => (
          <RoomStatusTag status={status} />
        ),
      },
      {
        title: 'Hành động',
        key: 'actions',
        width: 120,
        align: 'right',
        render: (_, tray) => (
          <Space size={4}>
            {onEdit && (
              <Tooltip title="Sửa khay">
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  onClick={() => onEdit(tray)}
                  aria-label={`Sửa ${tray.name}`}
                />
              </Tooltip>
            )}
            <Tooltip title="Xóa khay">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={() =>
                  Modal.confirm({
                    title: 'Xóa khay trồng?',
                    content: `Bạn có chắc muốn xóa ${tray.name} không?`,
                    okText: 'Xóa',
                    cancelText: 'Hủy',
                    okButtonProps: { danger: true },
                    onOk: () => deleteTray(tray.id),
                  })
                }
                aria-label={`Xóa ${tray.name}`}
              />
            </Tooltip>
          </Space>
        ),
      },
    ],
    [deleteTray, navigate, onEdit],
  )

  return (
    <Table<Tray>
      rowKey="id"
      columns={columns}
      dataSource={visibleTrays}
      pagination={false}
      scroll={{ x: 980 }}
    />
  )
}
