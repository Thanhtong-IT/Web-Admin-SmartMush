import { useMemo } from 'react'
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  StarFilled,
  StarOutlined,
} from '@ant-design/icons'
import {
  Button,
  Empty,
  Flex,
  Popconfirm,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
  message,
} from 'antd'
import type { TableColumnsType } from 'antd'
import { useSettingStore } from '../../../stores/setting.store'
import type { MushroomThresholdProfile } from '../../../types/setting.types'

interface ThresholdProfileTabProps {
  canEdit: boolean
  visibleMushroomTypes?: string[]
  onAdd: () => void
  onEdit: (profile: MushroomThresholdProfile) => void
}

export function ThresholdProfileTab({
  canEdit,
  visibleMushroomTypes,
  onAdd,
  onEdit,
}: ThresholdProfileTabProps) {
  const profiles = useSettingStore((state) => state.thresholdProfiles)
  const setDefaultProfile = useSettingStore(
    (state) => state.setDefaultThresholdProfile,
  )
  const deleteProfile = useSettingStore(
    (state) => state.deleteThresholdProfile,
  )

  const visibleProfiles = useMemo(
    () =>
      visibleMushroomTypes
        ? profiles.filter((profile) =>
            visibleMushroomTypes.includes(profile.mushroomType),
          )
        : profiles,
    [profiles, visibleMushroomTypes],
  )

  const columns: TableColumnsType<MushroomThresholdProfile> = [
    {
      title: 'Giống nấm',
      dataIndex: 'mushroomType',
      key: 'mushroomType',
      width: 210,
      render: (value: string, profile) => (
        <Flex vertical gap={2}>
          <Typography.Text strong>{value}</Typography.Text>
          <Typography.Text type="secondary">{profile.name}</Typography.Text>
        </Flex>
      ),
    },
    {
      title: 'Nhiệt độ',
      key: 'temperature',
      width: 130,
      render: (_, profile) => `${profile.tempMin} - ${profile.tempMax} °C`,
    },
    {
      title: 'Độ ẩm không khí',
      key: 'humidity',
      width: 150,
      render: (_, profile) =>
        `${profile.humidityMin} - ${profile.humidityMax} %RH`,
    },
    {
      title: 'CO₂ tối đa',
      dataIndex: 'co2Max',
      key: 'co2Max',
      width: 110,
      render: (value: number) => `${value} ppm`,
    },
    {
      title: 'Độ ẩm giá thể',
      key: 'soilMoisture',
      width: 150,
      render: (_, profile) =>
        `${profile.soilMoistureMin} - ${profile.soilMoistureMax}%`,
    },
    {
      title: 'Mặc định',
      dataIndex: 'isDefault',
      key: 'isDefault',
      width: 100,
      render: (isDefault: boolean) =>
        isDefault ? <Tag color="gold">Mặc định</Tag> : null,
    },
    ...(canEdit
      ? [
          {
            title: 'Hành động',
            key: 'actions',
            width: 170,
            align: 'right' as const,
            render: (_: unknown, profile: MushroomThresholdProfile) => (
              <Space size={2}>
                <Tooltip title="Đặt làm mặc định">
                  <Button
                    type="text"
                    icon={
                      profile.isDefault ? (
                        <StarFilled style={{ color: '#d97706' }} />
                      ) : (
                        <StarOutlined />
                      )
                    }
                    disabled={profile.isDefault}
                    onClick={() => {
                      setDefaultProfile(profile.id)
                      message.success('Đã đặt profile làm mặc định.')
                    }}
                    aria-label={`Đặt ${profile.mushroomType} làm mặc định`}
                  />
                </Tooltip>
                <Tooltip title="Chỉnh sửa profile">
                  <Button
                    type="text"
                    icon={<EditOutlined />}
                    onClick={() => onEdit(profile)}
                    aria-label={`Sửa profile ${profile.mushroomType}`}
                  />
                </Tooltip>
                <Popconfirm
                  title="Xóa profile giống nấm?"
                  description={
                    profile.isDefault
                      ? 'Profile mặc định không thể xóa.'
                      : 'Thao tác này không thể hoàn tác.'
                  }
                  okText="Xóa"
                  cancelText="Hủy"
                  okButtonProps={{ danger: true, disabled: profile.isDefault }}
                  onConfirm={() => {
                    deleteProfile(profile.id)
                    message.success('Đã xóa profile.')
                  }}
                >
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    disabled={profile.isDefault}
                    aria-label={`Xóa profile ${profile.mushroomType}`}
                  />
                </Popconfirm>
              </Space>
            ),
          } as const,
        ]
      : []),
  ]

  return (
    <div>
      <Flex
        align="center"
        justify="space-between"
        gap={12}
        wrap
        style={{ marginBottom: 16 }}
      >
        <div>
          <Typography.Title level={4} style={{ margin: 0 }}>
            Profile ngưỡng vi khí hậu
          </Typography.Title>
          <Typography.Text type="secondary">
            Dải an toàn được áp dụng cho relay AUTO và cảnh báo cảm biến
          </Typography.Text>
        </div>

        {canEdit && (
          <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>
            Thêm giống nấm
          </Button>
        )}
      </Flex>

      <Table<MushroomThresholdProfile>
        rowKey="id"
        columns={columns}
        dataSource={visibleProfiles}
        pagination={false}
        scroll={{ x: 1050 }}
        locale={{
          emptyText: <Empty description="Không có profile phù hợp" />,
        }}
      />
    </div>
  )
}
