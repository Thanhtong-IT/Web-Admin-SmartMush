import {
  CameraOutlined,
  CloseOutlined,
  ExpandOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons'
import { Button, Modal, Segmented, Space, Tag, Tooltip, Typography } from 'antd'
import { useMemo, useState } from 'react'
import type { CameraConfig } from '../../../types/device.types'
import type { Tier, TierId } from '../../../types/room.types'

type CameraViewMode = 'focus' | 'overview'

interface FloorCameraModalProps {
  camera: CameraConfig
  tiers: Tier[]
  floorNumber: TierId | null
  onClose: () => void
  onFloorChange: (floorNumber: TierId) => void
}

const FLOOR_OPTIONS: Array<{ label: string; value: TierId }> = [
  { label: 'T1', value: 1 },
  { label: 'T2', value: 2 },
  { label: 'T3', value: 3 },
  { label: 'T4', value: 4 },
]

export function FloorCameraModal({
  camera,
  tiers,
  floorNumber,
  onClose,
  onFloorChange,
}: FloorCameraModalProps) {
  const [viewMode, setViewMode] = useState<CameraViewMode>('focus')
  const orderedTiers = useMemo(
    () => [...tiers].sort((left, right) => right.tierId - left.tierId),
    [tiers],
  )
  const activeFloor = floorNumber ?? 1

  return (
    <Modal
      className="floor-camera-modal"
      title={
        <div className="floor-camera-modal-title">
          <span className="floor-camera-modal-title-icon" aria-hidden="true">
            <VideoCameraOutlined />
          </span>
          <span>
            <strong>Camera kệ nấm · Tầng {activeFloor}</strong>
            <small>Digital Focus / một camera góc rộng</small>
          </span>
        </div>
      }
      open={floorNumber !== null}
      onCancel={onClose}
      closeIcon={<CloseOutlined aria-label="Đóng camera tầng" />}
      footer={null}
      width={900}
      centered
      destroyOnHidden
    >
      <div className="floor-camera-modal-body">
        <div className="floor-camera-toolbar">
          <div className="floor-camera-mode-control">
            <span className="floor-camera-control-label">Chế độ xem</span>
            <Segmented<CameraViewMode>
              value={viewMode}
              onChange={setViewMode}
              options={[
                { label: 'Cận cảnh', value: 'focus' },
                { label: 'Toàn cảnh', value: 'overview' },
              ]}
              aria-label="Chọn chế độ xem camera"
            />
          </div>

          <div className="floor-camera-quick-nav" aria-label="Chuyển nhanh giữa các tầng">
            <span className="floor-camera-control-label">Tầng</span>
            <Space.Compact>
              {FLOOR_OPTIONS.map((option) => (
                <Button
                  key={option.value}
                  type={activeFloor === option.value ? 'primary' : 'default'}
                  className="floor-camera-floor-button"
                  aria-pressed={activeFloor === option.value}
                  onClick={() => onFloorChange(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </Space.Compact>
          </div>

          <div className="floor-camera-status" role="status">
            <Tag color={camera.isLive ? 'error' : 'default'}>
              <span className="floor-camera-live-dot" aria-hidden="true" />
              {camera.isLive ? 'LIVE' : 'OFFLINE'}
            </Tag>
            <Tag>{camera.resolution === '1920x1080' ? '1080P' : camera.resolution}</Tag>
          </div>
        </div>

        <div
          className={`floor-camera-viewport floor-camera-viewport--${viewMode}`}
          aria-label={`Camera ${viewMode === 'focus' ? `cận cảnh tầng ${activeFloor}` : 'toàn cảnh kệ nấm'}`}
        >
          <div
            className={`floor-camera-scene floor-camera-scene--${viewMode} floor-camera-scene--focus-${activeFloor}`}
          >
            {orderedTiers.map((tier) => (
              <div
                key={tier.tierId}
                className={`floor-camera-tier-row ${tier.tierId === activeFloor ? 'is-selected' : ''}`}
                data-floor={tier.tierId}
              >
                <span className="floor-camera-tier-label">Tầng {tier.tierId}</span>
                <div className="floor-camera-tray-row">
                  {tier.trays.map((tray) => (
                    <div key={tray.id} className="floor-camera-tray" data-status={tray.status}>
                      <span>{tray.code}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="floor-camera-overlay">
            <Tag color={viewMode === 'focus' ? 'success' : 'processing'}>
              <CameraOutlined aria-hidden="true" />
              {viewMode === 'focus'
                ? `Đang xem: Cận cảnh Tầng ${activeFloor} (Focus)`
                : `Đang xem: Toàn cảnh kệ · Đang chọn Tầng ${activeFloor}`}
            </Tag>
            <span className="floor-camera-overlay-time">
              <span className="floor-camera-live-dot" aria-hidden="true" />
              {camera.name} · {camera.fps} FPS
            </span>
          </div>
        </div>

        <div className="floor-camera-modal-footer">
          <Typography.Text type="secondary">
            {viewMode === 'focus'
              ? 'Kéo thanh điều khiển tầng để đổi vùng quan sát cận cảnh.'
              : 'Khung xanh đánh dấu tầng đang được chọn trong toàn cảnh.'}
          </Typography.Text>
          <Tooltip title="Chế độ toàn màn hình trình duyệt">
            <Button
              type="text"
              icon={<ExpandOutlined />}
              aria-label="Mở video camera toàn màn hình"
              onClick={() => {
                const element = document.querySelector('.floor-camera-viewport')
                if (element instanceof HTMLElement) {
                  void element.requestFullscreen?.()
                }
              }}
            />
          </Tooltip>
        </div>
      </div>
    </Modal>
  )
}
