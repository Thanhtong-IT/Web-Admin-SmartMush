import { useMemo } from 'react'
import { Col, Row, Typography } from 'antd'
import { useAlertStore } from '../../../stores/alert.store'
import { useRoomStore } from '../../../stores/room.store'
import { EnvironmentChart } from '../components/EnvironmentChart'
import { EnvironmentMetricCard } from '../components/EnvironmentMetricCard'
import { QuickSummaryStats } from '../components/QuickSummaryStats'
import { RecentAlertsTable } from '../components/RecentAlertsTable'
import { CloudOutlined, FireOutlined } from '@ant-design/icons'

export function DashboardPage() {
  const rooms = useRoomStore((state) => state.rooms)
  const trays = useRoomStore((state) => state.trays)
  const alerts = useAlertStore((state) => state.alerts)

  const summary = useMemo(() => {
    const totalCapacity = rooms.reduce(
      (total, room) => total + room.maxCapacity,
      0,
    )
    const activeInUseTrays = trays.filter(
      (tray) => tray.status === 'ACTIVE' && tray.tenantId !== null,
    ).length
    const activeAlerts = alerts.filter(
      (alert) => !alert.isAcknowledged,
    ).length

    return {
      totalTrays: trays.length,
      activeInUseTrays,
      availableTrays: Math.max(totalCapacity - trays.length, 0),
      activeAlerts,
    }
  }, [alerts, rooms, trays])

  return (
    <div>
      <Typography.Title level={3} style={{ marginTop: 0, marginBottom: 20 }}>
        Tổng quan MCMS
      </Typography.Title>

      <QuickSummaryStats {...summary} />

      <section style={{ marginTop: 20 }}>
        <Typography.Title level={4} style={{ margin: '0 0 16px' }}>
          Giám sát môi trường
        </Typography.Title>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} xl={6}>
            <EnvironmentMetricCard
              title="Nhiệt độ trung bình"
              value={25.6}
              unit="°C"
              precision={1}
              icon={<FireOutlined />}
              color="#dc2626"
            />
          </Col>

          <Col xs={24} sm={12} xl={6}>
            <EnvironmentMetricCard
              title="Độ ẩm trung bình"
              value={87}
              unit="%"
              icon={<CloudOutlined />}
              color="#0f766e"
            />
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col span={24}>
            <EnvironmentChart />
          </Col>
        </Row>
      </section>

      <RecentAlertsTable />
    </div>
  )
}
