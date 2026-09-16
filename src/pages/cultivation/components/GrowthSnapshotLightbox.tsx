import { DownloadOutlined, PictureOutlined } from '@ant-design/icons'
import { Button, Modal, Tag, Typography } from 'antd'
import dayjs from 'dayjs'
import { useMemo } from 'react'
import type { GallerySnapshot } from '../../../types/cultivation.types'

interface GrowthSnapshotLightboxProps {
  snapshot: GallerySnapshot | null
  onClose: () => void
}

const STAGE_LABELS: Record<GallerySnapshot['stage'], string> = {
  INCUBATION: 'Ủ tơ / Nuôi sợi',
  PINNING: 'Kích nụ / Ra ghim',
  FRUITING: 'Phát triển thể quả',
  HARVEST_READY: 'Sẵn sàng thu hoạch',
}

export function GrowthSnapshotLightbox({
  snapshot,
  onClose,
}: GrowthSnapshotLightboxProps) {
  const formattedTimestamp = useMemo(
    () => (snapshot ? dayjs(snapshot.timestamp).format('DD/MM/YYYY HH:mm') : ''),
    [snapshot],
  )

  const handleDownload = () => {
    if (!snapshot) return

    const link = document.createElement('a')
    link.href = snapshot.imageUrl
    link.download = `mcms-${snapshot.stage.toLowerCase()}-${snapshot.timestamp.slice(0, 10)}.jpg`
    link.target = '_blank'
    link.rel = 'noreferrer'
    link.click()
  }

  return (
    <Modal
      className="growth-snapshot-lightbox"
      title={
        <span className="visual-modal-title">
          <PictureOutlined aria-hidden="true" />
          Ảnh nhật ký giai đoạn
        </span>
      }
      open={Boolean(snapshot)}
      onCancel={onClose}
      footer={null}
      width={760}
      centered
      destroyOnHidden
    >
      {snapshot && (
        <div className="growth-lightbox-content">
          <div className="growth-lightbox-image-wrap">
            <img
              src={snapshot.imageUrl}
              alt={`Ảnh ${STAGE_LABELS[snapshot.stage]}`}
            />
          </div>
          <div className="growth-lightbox-meta">
            <div>
              <Typography.Text type="secondary">Thời gian chụp</Typography.Text>
              <strong>{formattedTimestamp}</strong>
            </div>
            <div>
              <Typography.Text type="secondary">Giai đoạn</Typography.Text>
              <Tag color="success">{STAGE_LABELS[snapshot.stage]}</Tag>
            </div>
            {snapshot.note && (
              <Typography.Paragraph type="secondary">
                {snapshot.note}
              </Typography.Paragraph>
            )}
          </div>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleDownload}
            block
          >
            Tải ảnh về
          </Button>
        </div>
      )}
    </Modal>
  )
}
