import { useMemo } from 'react'
import { Col, Row, Typography } from 'antd'
import { useAlertStore } from '../../../stores/alert.store'
import { getAllTrays, useRoomStore } from '../../../stores/room.store'
import { EnvironmentChart } from '../components/EnvironmentChart'
import { EnvironmentMetricCard } from '../components/EnvironmentMetricCard'
import { QuickSummaryStats } from '../components/QuickSummaryStats'
import { RecentAlertsTable } from '../components/RecentAlertsTable'
import { CloudOutlined, CloudServerOutlined, FireOutlined } from '@ant-design/icons'

export function DashboardPage() {
  const tiers = useRoomStore((state) => state.tiers)
  const alerts = useAlertStore((state) => state.alerts)

  const summary = useMemo(() => {
    const trays = getAllTrays(tiers)
    const activeInUseTrays = trays.filter(
      (tray) => tray.status === 'rented' || tray.status === 'harvesting',
    ).length
    const activeAlerts = alerts.filter(
      (alert) => !alert.isAcknowledged,
    ).length

    return {
      totalTrays: trays.length,
      activeInUseTrays,
      availableTrays: trays.filter((tray) => tray.status === 'empty').length,
      activeAlerts,
      averageTemperature:
        tiers.reduce((total, tier) => total + tier.telemetry.temperature, 0) /
        tiers.length,
      averageHumidity: Math.round(
        tiers.reduce((total, tier) => total + tier.telemetry.humidity, 0) /
          tiers.length,
      ),
      averageCo2: Math.round(
        tiers.reduce((total, tier) => total + tier.telemetry.co2, 0) /
          tiers.length,
      ),
    }
  }, [alerts, tiers])

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
          <Col xs={24} sm={12} xl={8}>
            <EnvironmentMetricCard
              title="Nhiệt độ trung bình"
              value={summary.averageTemperature}
              unit="°C"
              precision={1}
              icon={<FireOutlined />}
              color="#dc2626"
            />
          </Col>

          <Col xs={24} sm={12} xl={8}>
            <EnvironmentMetricCard
              title="Độ ẩm trung bình"
              value={summary.averageHumidity}
              unit="%"
              icon={<CloudOutlined />}
              color="#0f766e"
            />
          </Col>
          <Col xs={24} sm={12} xl={8}>
            <EnvironmentMetricCard
              title="CO₂ trung bình"
              value={summary.averageCo2}
              unit=" ppm"
              icon={<CloudServerOutlined />}
              color="#7c3d12"
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
