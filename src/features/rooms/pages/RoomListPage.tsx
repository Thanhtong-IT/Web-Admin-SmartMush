import {
  ApiOutlined,
  CheckCircleOutlined,
  InboxOutlined,
  WarningOutlined,
} from '@ant-design/icons'
import { Card, Col, Flex, Row, Statistic, Tag, Typography } from 'antd'
import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getAllTrays, useRoomStore } from '../../../stores/room.store'
import type { TrayStatus } from '../../../types/room.types'
import { RackView } from '../components/RackView'
import { TrayDetailDrawer } from '../components/TrayDetailDrawer'
import { TRAY_STATUS_CONFIG } from '../components/tray-status.config'

const STATUS_ORDER: TrayStatus[] = [
  'empty',
  'rented',
  'harvesting',
  'maintenance',
]

export function RoomListPage() {
  const tiers = useRoomStore((state) => state.tiers)
  const navigate = useNavigate()
  const { id = null } = useParams<{ id: string }>()

  const summary = useMemo(() => {
    const trays = getAllTrays(tiers)

    return {
      total: trays.length,
      empty: trays.filter((tray) => tray.status === 'empty').length,
      occupied: trays.filter(
        (tray) => tray.status === 'rented' || tray.status === 'harvesting',
      ).length,
      attention: trays.filter((tray) => tray.status === 'maintenance').length,
    }
  }, [tiers])

  return (
    <div>
      <Flex align="flex-start" justify="space-between" gap={16} wrap style={{ marginBottom: 20 }}>
        <div>
          <Typography.Title level={3} style={{ margin: 0 }}>
            Kệ nấm 4 tầng
          </Typography.Title>
          <Typography.Text type="secondary">
            12 khay · 3 khay mỗi tầng · 1 Node STM32 phụ trách mỗi tầng
          </Typography.Text>
        </div>

        <Flex gap={6} wrap>
          {STATUS_ORDER.map((status) => (
            <Tag key={status} color={TRAY_STATUS_CONFIG[status].color}>
              {TRAY_STATUS_CONFIG[status].label}
            </Tag>
          ))}
        </Flex>
      </Flex>

      <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
        <Col xs={12} lg={6}>
          <Card size="small"><Statistic title="Tổng khay" value={summary.total} prefix={<ApiOutlined />} /></Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card size="small"><Statistic title="Còn trống" value={summary.empty} prefix={<InboxOutlined />} /></Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card size="small"><Statistic title="Đang vận hành" value={summary.occupied} prefix={<CheckCircleOutlined />} /></Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card size="small"><Statistic title="Cần chú ý" value={summary.attention} prefix={<WarningOutlined />} /></Card>
        </Col>
      </Row>

      <RackView
        tiers={tiers}
        selectedTrayId={id}
        onSelectTray={(tray) => navigate(`/rooms/${tray.id}`)}
      />

      <TrayDetailDrawer
        trayId={id}
        onClose={() => navigate('/rooms', { replace: true })}
      />
    </div>
  )
}
