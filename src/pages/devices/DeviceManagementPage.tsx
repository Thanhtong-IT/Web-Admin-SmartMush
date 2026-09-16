import { useEffect, useState } from 'react'
import {
  ApiOutlined,
  BulbOutlined,
  CameraOutlined,
  CloudOutlined,
  HistoryOutlined,
  ReloadOutlined,
  SettingOutlined,
  ThunderboltOutlined,
  WifiOutlined,
} from '@ant-design/icons'
import {
  Button,
  Card,
  Flex,
  Space,
  Switch,
  Tag,
  Tooltip,
  Typography,
  message,
} from 'antd'
import { useNavigate } from 'react-router-dom'
import { useDeviceStore } from '../../stores/device.store'
import { useRoomStore } from '../../stores/room.store'
import { useSettingStore } from '../../stores/setting.store'
import type {
  DeviceStatus,
  GatewayRelayKey,
  Rs485Node,
} from '../../types/device.types'
import type { TierId } from '../../types/room.types'
import { TRAY_POSITIONS } from '../../types/room.types'
import { DeviceMetricsGrid } from './components/DeviceMetricsGrid'
import { FloorCameraModal } from './components/FloorCameraModal'
import { FloorClimateConfigModal } from './components/FloorClimateConfigModal'
import {
  calculateFloorTargetThresholds,
} from './utils/floor-climate.utils'

const STATUS_CONFIG: Record<
  DeviceStatus,
  { color: string; label: string }
> = {
  ONLINE: { color: 'success', label: 'Ổn định' },
  OFFLINE: { color: 'default', label: 'Mất kết nối' },
  WARNING: { color: 'warning', label: 'Đường truyền yếu' },
  ERROR: { color: 'error', label: 'Lỗi' },
}

const GATEWAY_RELAYS: Array<{
  key: GatewayRelayKey
  label: string
  icon: React.ReactNode
}> = [
  { key: 'mainPump', label: 'Bơm tưới tổng', icon: <CloudOutlined /> },
  { key: 'exhaustFan', label: 'Quạt hút tổng', icon: <ThunderboltOutlined /> },
  { key: 'rackLighting', label: 'Đèn toàn kệ', icon: <BulbOutlined /> },
]

function formatTimestamp(timestamp: string) {
  return new Date(timestamp).toLocaleString('vi-VN')
}

export function DeviceManagementPage() {
  const navigate = useNavigate()
  const gateway = useDeviceStore((state) => state.gateway)
  const nodes = useDeviceStore((state) => state.nodes)
  const camera = useDeviceStore((state) => state.camera)
  const toggleGatewayRelay = useDeviceStore((state) => state.toggleGatewayRelay)
  const pingNode = useDeviceStore((state) => state.pingNode)
  const restartNode = useDeviceStore((state) => state.restartNode)
  const floorClimateConfigs = useDeviceStore(
    (state) => state.floorClimateConfigs,
  )
  const updateFloorClimateConfig = useDeviceStore(
    (state) => state.updateFloorClimateConfig,
  )
  const tiers = useRoomStore((state) => state.tiers)
  const thresholdProfiles = useSettingStore(
    (state) => state.thresholdProfiles,
  )
  const telemetrySimulationEnabled = useRoomStore(
    (state) => state.telemetrySimulationEnabled,
  )
  const setTelemetrySimulationEnabled = useRoomStore(
    (state) => state.setTelemetrySimulationEnabled,
  )
  const simulateTelemetry = useRoomStore((state) => state.simulateTelemetry)
  const toggleTierFan = useRoomStore((state) => state.toggleTierFan)
  const toggleTrayValve = useRoomStore((state) => state.toggleTrayValve)
  const [pendingAction, setPendingAction] = useState<string | null>(null)
  const [cameraFloor, setCameraFloor] = useState<TierId | null>(null)
  const [climateConfigFloor, setClimateConfigFloor] =
    useState<TierId | null>(null)

  const selectedClimateTier =
    tiers.find((tier) => tier.tierId === climateConfigFloor) ?? null

  useEffect(() => {
    if (!telemetrySimulationEnabled) {
      return
    }

    const timer = window.setInterval(simulateTelemetry, 5000)

    return () => window.clearInterval(timer)
  }, [simulateTelemetry, telemetrySimulationEnabled])

  const handleNodeAction = async (
    node: Rs485Node,
    action: 'ping' | 'restart',
  ) => {
    const actionKey = `${node.id}:${action}`
    setPendingAction(actionKey)

    try {
      await new Promise((resolve) => window.setTimeout(resolve, 350))

      if (action === 'ping') {
        pingNode(node.id)
      } else {
        restartNode(node.id)
      }

      message.success(
        action === 'ping'
          ? `Đã kiểm tra kết nối ${node.id}.`
          : `Đã khởi động lại ${node.id}.`,
      )
    } finally {
      setPendingAction(null)
    }
  }

  return (
    <div>
      <Flex align="flex-start" justify="space-between" gap={16} wrap style={{ marginBottom: 20 }}>
        <div>
          <Typography.Title level={3} style={{ margin: 0 }}>
            Gateway & mạng RS485
          </Typography.Title>
          <Typography.Text type="secondary">
            1 ESP32-S3 Master · 4 STM32 Slave · mỗi Node quản lý cố định một tầng
          </Typography.Text>
        </div>

        <Flex align="center" gap={16} wrap>
          <Button
            icon={<HistoryOutlined />}
            onClick={() => navigate('/devices/history')}
          >
            Lịch sử Telemetry
          </Button>
          <Space>
            <Typography.Text>Giả lập telemetry</Typography.Text>
            <Switch
              checked={telemetrySimulationEnabled}
              onChange={setTelemetrySimulationEnabled}
              checkedChildren="Bật"
              unCheckedChildren="Tắt"
            />
          </Space>
        </Flex>
      </Flex>

      <Card
        title={
          <Space>
            <WifiOutlined />
            <span>Gateway Master ESP32-S3</span>
          </Space>
        }
        extra={<Tag color="success">{gateway.status}</Tag>}
        style={{ marginBottom: 20 }}
      >
        <Flex gap={24} wrap justify="space-between">
          <div>
            <Typography.Text strong>{gateway.id}</Typography.Text>
            <Typography.Paragraph type="secondary" style={{ margin: '4px 0 0' }}>
              IP {gateway.ipAddress} · MAC {gateway.macAddress} · Firmware {gateway.firmwareVersion}
            </Typography.Paragraph>
            <Typography.Text type="secondary">
              Wi-Fi {gateway.wifiRssi} dBm · Ping cuối {formatTimestamp(gateway.lastPingTimestamp)}
            </Typography.Text>
          </div>

          <Flex gap={24} wrap>
            {GATEWAY_RELAYS.map((relay) => (
              <Flex key={relay.key} vertical gap={6} align="center">
                <Space>{relay.icon}<Typography.Text>{relay.label}</Typography.Text></Space>
                <Switch
                  checked={gateway.relays[relay.key]}
                  onChange={() => toggleGatewayRelay(relay.key)}
                  checkedChildren="Bật"
                  unCheckedChildren="Tắt"
                />
              </Flex>
            ))}
          </Flex>
        </Flex>
      </Card>

      <section className="rs485-topology" aria-label="Sơ đồ kết nối RS485">
        <div className="rs485-master">
          <WifiOutlined />
          <strong>ESP32-S3</strong>
          <span>RS485 Master</span>
        </div>
        <div className="rs485-bus-line" aria-hidden="true">
          <span>RS485 BUS</span>
        </div>
        <div className="rs485-node-grid">
          {nodes.map((node) => {
            const status = STATUS_CONFIG[node.status]

            return (
              <div key={node.id} className="rs485-node">
                <Tag color={status.color}>{status.label}</Tag>
                <strong>Node {node.address}</strong>
                <span>Tầng {node.tierId}</span>
              </div>
            )
          })}
        </div>
      </section>

      <Flex vertical gap={16} style={{ marginTop: 20 }}>
        {tiers.map((tier) => {
          const node = nodes.find((item) => item.tierId === tier.tierId)

          if (!node) {
            return null
          }

          const status = STATUS_CONFIG[node.status]
          const isUnavailable = node.status === 'OFFLINE' || node.status === 'ERROR'
          const floorThresholds = calculateFloorTargetThresholds(
            tier.trays,
            thresholdProfiles,
          )

          return (
            <section key={node.id} className="device-tier-section">
              <Flex align="flex-start" justify="space-between" gap={16} wrap style={{ marginBottom: 16 }}>
                <div>
                  <Flex align="center" gap={8} wrap>
                    <Typography.Title level={4} style={{ margin: 0 }}>
                      {tier.name}
                    </Typography.Title>
                    <Tag icon={<ApiOutlined />} color={status.color}>{node.id}</Tag>
                    <Tag color={status.color}>{status.label}</Tag>
                  </Flex>
                  <Typography.Text type="secondary">
                    Địa chỉ RS485 #{node.address} · Firmware {node.firmwareVersion} ·
                    {' '}Độ trễ {node.latencyMs} ms · Mất gói {node.packetLossPercent}%
                  </Typography.Text>
                </div>

                <Space wrap>
                  <Button
                    icon={<ApiOutlined />}
                    loading={pendingAction === `${node.id}:ping`}
                    onClick={() => void handleNodeAction(node, 'ping')}
                  >
                    Ping
                  </Button>
                  <Tooltip title={`Xem camera ${tier.name}`}>
                    <Button
                      className="floor-camera-trigger"
                      icon={<CameraOutlined />}
                      aria-label={`Xem camera ${tier.name}`}
                      onClick={() => setCameraFloor(tier.tierId)}
                    />
                  </Tooltip>
                  <Button
                    className="floor-climate-config-trigger"
                    icon={<SettingOutlined />}
                    onClick={() => setClimateConfigFloor(tier.tierId)}
                  >
                    Cấu hình AUTO
                  </Button>
                  <Button
                    icon={<ReloadOutlined />}
                    loading={pendingAction === `${node.id}:restart`}
                    onClick={() => void handleNodeAction(node, 'restart')}
                  >
                    Restart
                  </Button>
                </Space>
              </Flex>

              <DeviceMetricsGrid
                telemetry={tier.telemetry}
                thresholds={floorThresholds}
              />

              <Flex gap={24} wrap style={{ marginTop: 16 }}>
                <Flex vertical gap={6} align="center">
                  <Typography.Text strong>Quạt {tier.name}</Typography.Text>
                  <Switch
                    checked={tier.relays.fan}
                    disabled={isUnavailable}
                    onChange={() => toggleTierFan(tier.tierId)}
                    checkedChildren="Bật"
                    unCheckedChildren="Tắt"
                  />
                </Flex>
                {TRAY_POSITIONS.map((position) => (
                  <Flex key={position} vertical gap={6} align="center">
                    <Typography.Text strong>
                      Van T{tier.tierId}-K{position}
                    </Typography.Text>
                    <Switch
                      checked={tier.relays.irrigationValves[position]}
                      disabled={isUnavailable}
                      onChange={() => toggleTrayValve(tier.tierId, position)}
                      checkedChildren="Bật"
                      unCheckedChildren="Tắt"
                    />
                  </Flex>
                ))}
              </Flex>
            </section>
          )
        })}
      </Flex>

      <FloorCameraModal
        key={cameraFloor ?? 'floor-camera-closed'}
        camera={camera}
        tiers={tiers}
        floorNumber={cameraFloor}
        onClose={() => setCameraFloor(null)}
        onFloorChange={setCameraFloor}
      />

      {selectedClimateTier && (
        <FloorClimateConfigModal
          key={selectedClimateTier.tierId}
          open
          floorName={selectedClimateTier.name}
          config={floorClimateConfigs[selectedClimateTier.tierId]}
          trays={selectedClimateTier.trays}
          mushroomProfiles={thresholdProfiles}
          onCancel={() => setClimateConfigFloor(null)}
          onSubmit={(values) => {
            updateFloorClimateConfig(selectedClimateTier.tierId, values)
            setClimateConfigFloor(null)
          }}
        />
      )}
    </div>
  )
}
