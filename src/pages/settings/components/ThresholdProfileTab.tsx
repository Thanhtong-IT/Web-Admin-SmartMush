import { useMemo } from 'react'
import {
  BulbOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  StarFilled,
  StarOutlined,
} from '@ant-design/icons'
import {
  Alert,
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
      width: 240,
      render: (value: string, profile) => (
        <Flex vertical gap={4}>
          <Typography.Text strong>{value}</Typography.Text>
          <Flex gap={4} wrap>
            {profile.isDefault && <Tag color="gold">Mặc định</Tag>}
            <Tag color="cyan">
              Gói {profile.cycleWeeks ?? 1} tuần
            </Tag>
          </Flex>
          <Typography.Text type="secondary" style={{ fontSize: 11 }}>
            {profile.name}
          </Typography.Text>
        </Flex>
      ),
    },
    {
      title: (
        <HeaderWithHint
          text="Dải Nhiệt độ (°C)"
          hint="Dưới min → kích sưởi · Trên max → bật quạt làm mát"
        />
      ),
      key: 'temperature',
      width: 170,
      render: (_, profile) => (
        <ThresholdRangeCell
          min={profile.tempMin}
          max={profile.tempMax}
          unit="°C"
          minHint="Dưới min → kích sưởi"
          maxHint="Trên max → bật quạt làm mát"
        />
      ),
    },
    {
      title: (
        <HeaderWithHint
          text="Dải Độ ẩm KK (%RH)"
          hint="Dưới min → kích bơm phun sương tự động"
        />
      ),
      key: 'humidity',
      width: 180,
      render: (_, profile) => (
        <ThresholdRangeCell
          min={profile.humidityMin}
          max={profile.humidityMax}
          unit="%RH"
          minHint="Dưới min → kích bơm phun sương"
          maxHint="Trên max → giảm phun sương"
        />
      ),
    },
    {
      title: (
        <HeaderWithHint
          text="Ngưỡng CO₂ an toàn"
          hint="Vượt ngưỡng → kích hoạt quạt hút thông gió"
        />
      ),
      key: 'co2',
      width: 140,
      render: (_, profile) => (
        <Flex vertical gap={2}>
          <Typography.Text strong style={{ color: '#7c3aed' }}>
            &lt; {profile.co2Max} ppm
          </Typography.Text>
          <Typography.Text type="secondary" style={{ fontSize: 11 }}>
            Vượt → bật quạt hút
          </Typography.Text>
        </Flex>
      ),
    },
    {
      title: (
        <HeaderWithHint
          text="Độ ẩm cơ chất / giá thể (%)"
          hint="Duy trì độ ẩm giá thể trong dải này để phôi không khô / úng"
        />
      ),
      key: 'soilMoisture',
      width: 170,
      render: (_, profile) => (
        <Typography.Text>
          {profile.soilMoistureMin} - {profile.soilMoistureMax}{' '}
          <Typography.Text type="secondary">%</Typography.Text>
        </Typography.Text>
      ),
    },
    ...(canEdit
      ? [
          {
            title: 'Hành động',
            key: 'actions',
            width: 200,
            align: 'right' as const,
            render: (_: unknown, profile: MushroomThresholdProfile) => (
              <Space size={4}>
                <Button
                  size="small"
                  type="primary"
                  ghost
                  icon={<EditOutlined />}
                  onClick={() => onEdit(profile)}
                >
                  Tinh chỉnh thông số
                </Button>
                <Tooltip
                  title={
                    profile.isDefault
                      ? 'Đang là profile mặc định'
                      : 'Đặt làm mặc định'
                  }
                >
                  <Button
                    size="small"
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
                    size="small"
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    disabled={profile.isDefault}
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
      <Alert
        type="info"
        showIcon
        icon={<BulbOutlined />}
        message={
          <Typography.Text style={{ fontSize: 13 }}>
            <strong>Mẹo vận hành:</strong> Các tầng đang bật chế độ{' '}
            <Tag color="success" style={{ margin: '0 4px' }}>
              AUTO
            </Tag>
            sẽ tự động đồng bộ theo ngưỡng của giống nấm được gán trên khay.
          </Typography.Text>
        }
        style={{ marginBottom: 16, borderRadius: 10 }}
      />

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
        scroll={{ x: 1100 }}
        locale={{
          emptyText: <Empty description="Không có profile phù hợp" />,
        }}
      />
    </div>
  )
}

function HeaderWithHint({ text, hint }: { text: string; hint: string }) {
  return (
    <Tooltip title={hint} placement="topLeft">
      <span style={{ cursor: 'help', borderBottom: '1px dashed #94a3b8' }}>
        {text}
      </span>
    </Tooltip>
  )
}

interface ThresholdRangeCellProps {
  min: number
  max: number
  unit: string
  minHint: string
  maxHint: string
}

function ThresholdRangeCell({
  min,
  max,
  unit,
  minHint,
  maxHint,
}: ThresholdRangeCellProps) {
  return (
    <Flex vertical gap={2}>
      <Typography.Text strong style={{ color: '#059669' }}>
        {min} - {max} {unit}
      </Typography.Text>
      <Typography.Text type="secondary" style={{ fontSize: 11 }}>
        <Tooltip title={minHint}>
          <span style={{ cursor: 'help' }}>&lt; {min}</span>
        </Tooltip>{' '}
        → sưởi ·{' '}
        <Tooltip title={maxHint}>
          <span style={{ cursor: 'help' }}>&gt; {max}</span>
        </Tooltip>{' '}
        → làm mát
      </Typography.Text>
    </Flex>
  )
}
