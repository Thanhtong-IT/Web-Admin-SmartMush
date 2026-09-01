import dayjs from 'dayjs'
import {
  AlertOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  FlagOutlined,
  InboxOutlined,
  RightOutlined,
} from '@ant-design/icons'
import {
  Badge,
  Button,
  Card,
  Divider,
  Flex,
  Popconfirm,
  Progress,
  Tag,
  Timeline,
  Typography,
} from 'antd'
import { GROWTH_STAGE_ORDER } from '../../../stores/cultivation.store'
import type {
  CultivationBatch,
  GrowthStage,
  MushroomQuality,
} from '../../../types/cultivation.types'
import { GrowthStageTimeline } from './GrowthStageTimeline'

interface CultivationBatchCardProps {
  batch: CultivationBatch
  canManage: boolean
  onAdvanceStage: (batch: CultivationBatch) => void
  onAddLog: (batch: CultivationBatch) => void
  onScheduleHarvest: (batch: CultivationBatch) => void
  onRecordHarvest: (batch: CultivationBatch) => void
  onMarkContaminated: (batch: CultivationBatch) => void
}

const QUALITY_CONFIG: Record<
  MushroomQuality,
  { color: string; label: string }
> = {
  GRADE_A: { color: 'success', label: 'Grade A' },
  GRADE_B: { color: 'warning', label: 'Grade B' },
  WARNING_CONTAMINATED: {
    color: 'error',
    label: 'Cần xử lý sâu bệnh/mốc',
  },
}

const STAGE_LABELS: Record<GrowthStage, string> = {
  INCUBATION: 'Ủ tơ / Nuôi sợi',
  PINNING: 'Kích nụ / Ra ghim',
  FRUITING: 'Phát triển thể quả',
  READY_TO_HARVEST: 'Sẵn sàng thu hoạch',
  HARVESTED: 'Đã thu hoạch',
}

export function CultivationBatchCard({
  batch,
  canManage,
  onAdvanceStage,
  onAddLog,
  onScheduleHarvest,
  onRecordHarvest,
  onMarkContaminated,
}: CultivationBatchCardProps) {
  const qualityConfig = QUALITY_CONFIG[batch.healthStatus]
  const isHarvested = batch.currentStage === 'HARVESTED'
  const currentStageIndex = GROWTH_STAGE_ORDER.indexOf(batch.currentStage)
  const nextStage = GROWTH_STAGE_ORDER[currentStageIndex + 1]
  const daysRemaining = isHarvested
    ? 0
    : Math.max(0, dayjs(batch.estimatedHarvestDate).diff(dayjs(), 'day'))

  return (
    <Badge.Ribbon
      text={batch.healthStatus === 'WARNING_CONTAMINATED' ? 'Cảnh báo' : undefined}
      color="#dc2626"
      style={{ display: batch.healthStatus === 'WARNING_CONTAMINATED' ? undefined : 'none' }}
    >
      <Card
        title={
          <Flex align="center" gap={8} wrap>
            <InboxOutlined />
            <span>{batch.batchCode}</span>
            <Tag>{batch.trayName}</Tag>
          </Flex>
        }
        extra={<Tag color={qualityConfig.color}>{qualityConfig.label}</Tag>}
      >
        <Flex justify="space-between" gap={16} wrap>
          <div>
            <Typography.Text strong>{batch.mushroomType}</Typography.Text>
            <Typography.Paragraph type="secondary" style={{ margin: '4px 0 0' }}>
              Khay: {batch.trayId} · Khách thuê: {batch.tenantName}
            </Typography.Paragraph>
          </div>
          <Typography.Text type="secondary">
            Phụ trách: {batch.operatorInCharge}
          </Typography.Text>
        </Flex>

        <GrowthStageTimeline currentStage={batch.currentStage} />

        <Flex align="center" gap={16} style={{ marginTop: 20 }}>
          <Progress
            percent={batch.progressPercent}
            status={batch.healthStatus === 'WARNING_CONTAMINATED' ? 'exception' : 'active'}
            style={{ flex: 1 }}
          />
          <Typography.Text strong>{batch.progressPercent}%</Typography.Text>
        </Flex>

        <Flex gap={16} wrap style={{ marginTop: 16 }}>
          <Typography.Text>
            <CalendarOutlined /> Dự kiến thu hoạch:{' '}
            <strong>{dayjs(batch.estimatedHarvestDate).format('DD/MM/YYYY')}</strong>
          </Typography.Text>
          <Typography.Text type={daysRemaining <= 3 && !isHarvested ? 'warning' : 'secondary'}>
            {isHarvested ? 'Đã hoàn tất' : `Còn ${daysRemaining} ngày`}
          </Typography.Text>
          <Typography.Text>
            Sản lượng: {batch.actualYieldKg ?? batch.expectedYieldKg} kg
            {batch.actualYieldKg === null ? ' dự kiến' : ' thực thu'}
          </Typography.Text>
        </Flex>

        <Divider style={{ margin: '18px 0 12px' }} />

        <Typography.Text strong>Nhật ký gần nhất</Typography.Text>
        {batch.logs.length > 0 ? (
          <Timeline
            style={{ marginTop: 12 }}
            items={batch.logs.slice(0, 3).map((log) => ({
              color: log.stage === 'HARVESTED' ? 'green' : 'blue',
              dot: log.stage === 'HARVESTED' ? <CheckCircleOutlined /> : undefined,
              children: (
                <div>
                  <Typography.Text>{log.note}</Typography.Text>
                  <br />
                  <Typography.Text type="secondary">
                    {dayjs(log.timestamp).format('DD/MM/YYYY HH:mm')} · {log.loggedBy}
                  </Typography.Text>
                </div>
              ),
            }))}
          />
        ) : (
          <Typography.Paragraph type="secondary" style={{ marginTop: 12 }}>
            Chưa có nhật ký chăm sóc.
          </Typography.Paragraph>
        )}

        {canManage && (
          <Flex gap={8} wrap style={{ marginTop: 16 }}>
            {!isHarvested && (
              <Popconfirm
                title={
                  nextStage === 'READY_TO_HARVEST'
                    ? 'Chuyển sang sẵn sàng thu hoạch?'
                    : 'Chuyển sang giai đoạn tiếp theo?'
                }
                description="Hãy đảm bảo thông số sinh trưởng đã đạt yêu cầu."
                okText="Xác nhận"
                cancelText="Hủy"
                onConfirm={() => onAdvanceStage(batch)}
              >
                <Button icon={<RightOutlined />}>
                  {nextStage ? `Chuyển: ${STAGE_LABELS[nextStage]}` : 'Đã hoàn tất'}
                </Button>
              </Popconfirm>
            )}

            <Button icon={<FileTextOutlined />} onClick={() => onAddLog(batch)}>
              Thêm nhật ký
            </Button>

            {!isHarvested && (
              <Button
                icon={<CalendarOutlined />}
                onClick={() => onScheduleHarvest(batch)}
              >
                Đặt lịch thu hoạch
              </Button>
            )}

            {batch.currentStage === 'READY_TO_HARVEST' && (
              <Button
                type="primary"
                icon={<FlagOutlined />}
                onClick={() => onRecordHarvest(batch)}
              >
                Xác nhận thu hoạch
              </Button>
            )}

            {batch.healthStatus !== 'WARNING_CONTAMINATED' && !isHarvested && (
              <Popconfirm
                title="Đánh dấu mẻ cần xử lý?"
                description="Mẻ nấm sẽ được đánh dấu cảnh báo sâu bệnh/mốc."
                okText="Đánh dấu"
                cancelText="Hủy"
                okButtonProps={{ danger: true }}
                onConfirm={() => onMarkContaminated(batch)}
              >
                <Button danger icon={<AlertOutlined />}>
                  Đánh dấu hỏng
                </Button>
              </Popconfirm>
            )}
          </Flex>
        )}
      </Card>
    </Badge.Ribbon>
  )
}
