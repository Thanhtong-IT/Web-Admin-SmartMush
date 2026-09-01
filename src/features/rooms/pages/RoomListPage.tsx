import { useMemo, useState } from 'react'
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons'
import {
  Button,
  Flex,
  Modal,
  Select,
  Space,
  Table,
  Tooltip,
  Typography,
  message,
} from 'antd'
import type { TableColumnsType } from 'antd'
import { useRoomStore } from '../../../stores/room.store'
import type { CultivationRoom, RoomFormValues } from '../../../types/room.types'
import { RoomFormModal } from '../components/RoomFormModal'
import { RoomStatusTag } from '../components/RoomStatusTag'
import { RoomTable } from '../components/RoomTable'

export function RoomListPage() {
  const rooms = useRoomStore((state) => state.rooms)
  const addRoom = useRoomStore((state) => state.addRoom)
  const updateRoom = useRoomStore((state) => state.updateRoom)
  const deleteRoom = useRoomStore((state) => state.deleteRoom)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingRoom, setEditingRoom] = useState<CultivationRoom | null>(null)
  const [selectedRoomId, setSelectedRoomId] = useState<string | undefined>()

  const roomOptions = useMemo(
    () => [
      { value: 'ALL', label: 'Tất cả phòng nuôi' },
      ...rooms.map((room) => ({
        value: room.id,
        label: `${room.id} - ${room.name}`,
      })),
    ],
    [rooms],
  )

  const handleAddRoom = () => {
    setEditingRoom(null)
    setIsModalOpen(true)
  }

  const handleEditRoom = (room: CultivationRoom) => {
    setEditingRoom(room)
    setIsModalOpen(true)
  }

  const handleSubmit = async (values: RoomFormValues) => {
    await new Promise((resolve) => window.setTimeout(resolve, 300))

    if (editingRoom) {
      updateRoom(editingRoom.id, values)
      message.success('Đã cập nhật phòng nuôi.')
    } else {
      addRoom(values)
      message.success('Đã thêm phòng nuôi mới.')
    }

    setIsModalOpen(false)
    setEditingRoom(null)
  }

  const roomColumns = useMemo<TableColumnsType<CultivationRoom>>(
    () => [
      {
        title: 'Mã phòng',
        dataIndex: 'id',
        key: 'id',
        width: 140,
      },
      {
        title: 'Tên phòng',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: 'Vị trí',
        dataIndex: 'location',
        key: 'location',
        width: 200,
      },
      {
        title: 'Số khay',
        key: 'trayCount',
        width: 130,
        render: (_, room) => `${room.currentTraysCount} / ${room.maxCapacity}`,
      },
      {
        title: 'Trạng thái',
        dataIndex: 'status',
        key: 'status',
        width: 150,
        render: (status: CultivationRoom['status']) => (
          <RoomStatusTag status={status} />
        ),
      },
      {
        title: 'Hành động',
        key: 'actions',
        width: 110,
        align: 'right',
        render: (_, room) => (
          <Space size={4}>
            <Tooltip title="Sửa phòng">
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => handleEditRoom(room)}
                aria-label={`Sửa ${room.name}`}
              />
            </Tooltip>
            <Tooltip title="Xóa phòng và các khay bên trong">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={() =>
                  Modal.confirm({
                    title: 'Xóa phòng nuôi?',
                    content: `Các khay thuộc ${room.name} cũng sẽ bị xóa.`,
                    okText: 'Xóa',
                    cancelText: 'Hủy',
                    okButtonProps: { danger: true },
                    onOk: () => {
                      deleteRoom(room.id)
                      if (selectedRoomId === room.id) {
                        setSelectedRoomId(undefined)
                      }
                      message.success('Đã xóa phòng nuôi.')
                    },
                  })
                }
                aria-label={`Xóa ${room.name}`}
              />
            </Tooltip>
          </Space>
        ),
      },
    ],
    [deleteRoom, selectedRoomId],
  )

  return (
    <div>
      <Flex
        align="center"
        justify="space-between"
        gap={16}
        wrap
        style={{ marginBottom: 20 }}
      >
        <div>
          <Typography.Title level={3} style={{ margin: 0 }}>
            Quản lý phòng nuôi
          </Typography.Title>
          <Typography.Text type="secondary">
            Quản lý phòng và các khay trồng thuộc từng khu vực
          </Typography.Text>
        </div>

        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddRoom}>
          Thêm phòng nuôi
        </Button>
      </Flex>

      <Table<CultivationRoom>
        rowKey="id"
        columns={roomColumns}
        dataSource={rooms}
        pagination={false}
        scroll={{ x: 760 }}
        style={{ marginBottom: 24 }}
      />

      <Flex align="center" gap={12} wrap style={{ marginBottom: 16 }}>
        <Typography.Text strong>Lọc khay theo phòng:</Typography.Text>
        <Select
          value={selectedRoomId ?? 'ALL'}
          options={roomOptions}
          onChange={(value: string) =>
            setSelectedRoomId(value === 'ALL' ? undefined : value)
          }
          style={{ width: 280, maxWidth: '100%' }}
        />
      </Flex>

      <RoomTable roomId={selectedRoomId} />

      <RoomFormModal
        open={isModalOpen}
        initialValues={
          editingRoom
            ? {
                name: editingRoom.name,
                location: editingRoom.location,
                maxCapacity: editingRoom.maxCapacity,
                status: editingRoom.status,
              }
            : undefined
        }
        onCancel={() => {
          setIsModalOpen(false)
          setEditingRoom(null)
        }}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
