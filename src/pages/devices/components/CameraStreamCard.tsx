import { useEffect, useMemo, useRef, useState } from 'react'
import {
  CameraOutlined,
  DisconnectOutlined,
  FullscreenOutlined,
  PictureOutlined,
} from '@ant-design/icons'
import { Button, Flex, Space, Tag, Tooltip, Typography } from 'antd'
import type { CameraConfig } from '../../../types/device.types'
import type { Tier } from '../../../types/room.types'

interface CameraStreamCardProps {
  camera: CameraConfig
  tiers: Tier[]
  onSnapshot: () => void
}

export function CameraStreamCard({
  camera,
  tiers,
  onSnapshot,
}: CameraStreamCardProps) {
  const frameRef = useRef<HTMLDivElement>(null)
  const [currentTime, setCurrentTime] = useState(() => new Date())
  const orderedTiers = useMemo(
    () => [...tiers].sort((left, right) => right.tierId - left.tierId),
    [tiers],
  )

  useEffect(() => {
    const timer = window.setInterval(() => setCurrentTime(new Date()), 1000)

    return () => window.clearInterval(timer)
  }, [])

  const openFullscreen = () => {
    void frameRef.current?.requestFullscreen()
  }

  return (
    <div>
      <div ref={frameRef} className="camera-stage">
        {camera.isLive ? (
          <div className="camera-rack-overview">
            {orderedTiers.map((tier) => (
              <div key={tier.tierId} className="camera-tier-row">
                <span className="camera-tier-label">Tầng {tier.tierId}</span>
                <div className="camera-tray-row">
                  {tier.trays.map((tray) => (
                    <div
                      key={tray.id}
                      className="camera-tray"
                      data-status={tray.status}
                    >
                      <span>{tray.code}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Flex vertical align="center" justify="center" gap={8} className="camera-offline">
            <DisconnectOutlined />
            <Typography.Text>Camera mất kết nối</Typography.Text>
          </Flex>
        )}

        <Flex className="camera-hud-top" align="center" justify="space-between" gap={8}>
          <Tag color={camera.isLive ? 'success' : 'error'}>
            {camera.isLive ? 'LIVE' : 'OFFLINE'}
          </Tag>
          <Tag>{camera.resolution} · {camera.fps} FPS</Tag>
        </Flex>

        <Flex className="camera-hud-bottom" align="center" justify="space-between" gap={12}>
          <Space>
            <CameraOutlined />
            <span>{camera.name}</span>
          </Space>
          <span>{currentTime.toLocaleString('vi-VN')}</span>
        </Flex>
      </div>

      <Flex justify="space-between" align="center" gap={12} wrap style={{ marginTop: 12 }}>
        <Typography.Text type="secondary" ellipsis style={{ maxWidth: 560 }}>
          {camera.streamUrl}
        </Typography.Text>
        <Space>
          <Button
            icon={<PictureOutlined />}
            disabled={!camera.isLive}
            onClick={onSnapshot}
          >
            Chụp ảnh
          </Button>
          <Tooltip title="Mở toàn màn hình">
            <Button
              icon={<FullscreenOutlined />}
              onClick={openFullscreen}
              aria-label="Mở camera toàn màn hình"
            />
          </Tooltip>
        </Space>
      </Flex>
    </div>
  )
}
