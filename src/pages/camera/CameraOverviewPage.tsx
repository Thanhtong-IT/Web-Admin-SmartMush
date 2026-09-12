import { CameraOutlined, EyeOutlined } from '@ant-design/icons'
import { Flex, Tag, Typography, message } from 'antd'
import { useDeviceStore } from '../../stores/device.store'
import { useRoomStore } from '../../stores/room.store'
import { CameraStreamCard } from '../devices/components/CameraStreamCard'

export function CameraOverviewPage() {
  const camera = useDeviceStore((state) => state.camera)
  const takeSnapshot = useDeviceStore((state) => state.takeSnapshot)
  const tiers = useRoomStore((state) => state.tiers)

  const handleSnapshot = () => {
    takeSnapshot()
    message.success('Đã chụp ảnh toàn cảnh kệ nấm.')
  }

  return (
    <div>
      <Flex align="flex-start" justify="space-between" gap={16} wrap style={{ marginBottom: 20 }}>
        <div>
          <Typography.Title level={3} style={{ margin: 0 }}>
            Camera toàn cảnh
          </Typography.Title>
          <Typography.Text type="secondary">
            Góc nhìn chính diện bao quát toàn bộ bốn tầng kệ
          </Typography.Text>
        </div>

        <Flex gap={8} wrap>
          <Tag icon={<CameraOutlined />} color={camera.isLive ? 'success' : 'error'}>
            {camera.isLive ? 'Đang truyền hình' : 'Mất kết nối'}
          </Tag>
          <Tag icon={<EyeOutlined />}>1 camera duy nhất</Tag>
        </Flex>
      </Flex>

      <CameraStreamCard
        camera={camera}
        tiers={tiers}
        onSnapshot={handleSnapshot}
      />
    </div>
  )
}
