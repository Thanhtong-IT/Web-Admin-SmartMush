import { useEffect, useState } from 'react'
import {
  CameraOutlined,
  DisconnectOutlined,
  FullscreenOutlined,
  PictureOutlined,
} from '@ant-design/icons'
import { Button, Card, Flex, Image, Segmented, Space, Tag, Typography } from 'antd'
import type {
  CameraConfig,
  CameraView,
  DeviceStatus,
} from '../../../types/device.types'

interface CameraStreamCardProps {
  deviceId: string
  status: DeviceStatus
  camera: CameraConfig
  onSnapshot: () => void
}

export function CameraStreamCard({
  deviceId,
  status,
  camera,
  onSnapshot,
}: CameraStreamCardProps) {
  const [currentTime, setCurrentTime] = useState(() => new Date())
  const [cameraView, setCameraView] = useState<CameraView>('OVERVIEW')
  const isOffline = status === 'OFFLINE' || status === 'ERROR' || !camera.isLive

  useEffect(() => {
    const timer = window.setInterval(() => setCurrentTime(new Date()), 1000)

    return () => window.clearInterval(timer)
  }, [])

  return (
    <Card
      title={
        <Space>
          <CameraOutlined />
          <span>Camera giám sát</span>
        </Space>
      }
      extra={
        <Segmented<CameraView>
          size="small"
          value={cameraView}
          options={[
            { label: 'Toàn cảnh', value: 'OVERVIEW' },
            { label: 'Cận cảnh', value: 'CLOSE_UP' },
          ]}
          onChange={setCameraView}
        />
      }
    >
      <div
        style={{
          position: 'relative',
          aspectRatio: '16 / 9',
          overflow: 'hidden',
          borderRadius: 6,
          background: cameraView === 'OVERVIEW' ? '#102a43' : '#243b53',
        }}
      >
        <Flex
          align="center"
          justify="center"
          vertical
          gap={8}
          style={{ height: '100%', color: '#d9e2ec' }}
        >
          {isOffline ? (
            <>
              <DisconnectOutlined style={{ fontSize: 28 }} />
              <Typography.Text style={{ color: '#d9e2ec' }}>
                Camera mất kết nối
              </Typography.Text>
            </>
          ) : (
            <>
              <CameraOutlined style={{ fontSize: 32 }} />
              <Typography.Text style={{ color: '#d9e2ec' }}>
                Live feed placeholder · {cameraView === 'OVERVIEW' ? 'Toàn cảnh' : 'Cận cảnh'}
              </Typography.Text>
            </>
          )}
        </Flex>

        <Flex
          justify="space-between"
          align="center"
          style={{
            position: 'absolute',
            inset: '12px 12px auto',
          }}
        >
          <Tag color={isOffline ? 'error' : 'success'}>
            {isOffline ? 'OFFLINE' : 'LIVE'}
          </Tag>
          <Tag color="default" style={{ marginInlineEnd: 0 }}>
            {camera.fps} FPS · {camera.resolution}
          </Tag>
        </Flex>

        <Flex
          justify="space-between"
          align="center"
          style={{
            position: 'absolute',
            inset: 'auto 12px 12px',
            color: '#ffffff',
          }}
        >
          <Typography.Text style={{ color: '#ffffff' }}>
            {deviceId} · {currentTime.toLocaleTimeString('vi-VN')}
          </Typography.Text>
          <Button
            type="primary"
            ghost
            size="small"
            icon={<PictureOutlined />}
            disabled={isOffline}
            onClick={onSnapshot}
          >
            Snapshot
          </Button>
        </Flex>
      </div>

      <Flex justify="space-between" align="center" gap={12} wrap style={{ marginTop: 12 }}>
        <Typography.Text type="secondary">
          Stream: {camera.streamUrl}
        </Typography.Text>
        {camera.lastSnapshotUrl && (
          <Image
            width={64}
            height={40}
            src={camera.lastSnapshotUrl}
            alt={`Snapshot ${deviceId}`}
            preview
            fallback="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="
          />
        )}
        <Button
          type="text"
          icon={<FullscreenOutlined />}
          aria-label="Mở camera toàn màn hình"
        />
      </Flex>
    </Card>
  )
}
