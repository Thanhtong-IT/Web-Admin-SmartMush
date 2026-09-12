import {
  ApiOutlined,
  CloudOutlined,
  FireOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons'
import {
  Descriptions,
  Drawer,
  Flex,
  Space,
  Statistic,
  Switch,
  Tag,
  Typography,
} from 'antd'
import { useDeviceStore } from '../../../stores/device.store'
import { useRoomStore } from '../../../stores/room.store'
import { getTrayPosition } from '../../../types/room.types'
import type { Tier } from '../../../types/room.types'
import { useTenantStore } from '../../tenants/store/tenant.store'
import { TrayStatusTag } from './TrayStatusTag'

interface TrayDetailDrawerProps {
  trayId: string | null
  onClose: () => void
}

export function TrayDetailDrawer({ trayId, onClose }: TrayDetailDrawerProps) {
  const tiers = useRoomStore((state) => state.tiers)
  const toggleTierFan = useRoomStore((state) => state.toggleTierFan)
  const toggleTrayValve = useRoomStore((state) => state.toggleTrayValve)
  const tenants = useTenantStore((state) => state.tenants)
  const nodes = useDeviceStore((state) => state.nodes)

  const detail = findTrayDetail(tiers, trayId)

  const customer = detail?.tray.customerId
    ? tenants.find((tenant) => tenant.id === detail.tray.customerId)
    : undefined
  const node = detail
    ? nodes.find((item) => item.id === detail.tier.nodeId)
    : undefined
  const trayPosition = detail ? getTrayPosition(detail.tray.code) : null
  const isNodeUnavailable =
    !node || node.status === 'OFFLINE' || node.status === 'ERROR'

  return (
    <Drawer
      title={detail ? `Chi tiết khay ${detail.tray.code}` : 'Chi tiết khay'}
      width={520}
      open={Boolean(detail)}
      onClose={onClose}
      destroyOnHidden
    >
      {detail && trayPosition && (
        <Flex vertical gap={24}>
          <Flex align="center" justify="space-between" gap={12} wrap>
            <TrayStatusTag status={detail.tray.status} />
            <Tag color={node?.status === 'ONLINE' ? 'success' : 'warning'}>
              RS485 {node?.status ?? 'UNKNOWN'}
            </Tag>
          </Flex>

          <Descriptions column={1} size="small" bordered>
            <Descriptions.Item label="Tầng">
              {detail.tier.name}
            </Descriptions.Item>
            <Descriptions.Item label="Node phụ trách">
              <ApiOutlined /> {detail.tier.nodeId}
            </Descriptions.Item>
            <Descriptions.Item label="Khách thuê">
              {customer ? `${customer.name} · ${customer.phone}` : 'Chưa có khách thuê'}
            </Descriptions.Item>
            <Descriptions.Item label="Mẻ trồng">
              {detail.tray.batchId ?? 'Chưa có mẻ trồng'}
            </Descriptions.Item>
          </Descriptions>

          <div>
            <Typography.Title level={5} style={{ marginTop: 0 }}>
              Vi khí hậu tại {detail.tier.name}
            </Typography.Title>
            <div className="tray-drawer-metrics">
              <Statistic
                title="Nhiệt độ"
                value={detail.tier.telemetry.temperature}
                precision={1}
                suffix="°C"
                prefix={<FireOutlined />}
              />
              <Statistic
                title="Độ ẩm"
                value={detail.tier.telemetry.humidity}
                suffix="%RH"
                prefix={<CloudOutlined />}
              />
              <Statistic
                title="CO₂"
                value={detail.tier.telemetry.co2}
                suffix="ppm"
              />
            </div>
          </div>

          <div className="tray-relay-panel">
            <Typography.Title level={5} style={{ marginTop: 0 }}>
              Điều khiển relay
            </Typography.Title>
            {isNodeUnavailable && (
              <Typography.Paragraph type="danger">
                Node không khả dụng, các lệnh điều khiển đang bị khóa.
              </Typography.Paragraph>
            )}
            <Flex vertical gap={18}>
              <Flex align="center" justify="space-between" gap={16}>
                <Space>
                  <CloudOutlined />
                  <Typography.Text>Van tưới {detail.tray.code}</Typography.Text>
                </Space>
                <Switch
                  checked={detail.tier.relays.irrigationValves[trayPosition]}
                  disabled={isNodeUnavailable}
                  onChange={() => toggleTrayValve(detail.tier.tierId, trayPosition)}
                  checkedChildren="Bật"
                  unCheckedChildren="Tắt"
                />
              </Flex>
              <Flex align="center" justify="space-between" gap={16}>
                <Space>
                  <ThunderboltOutlined />
                  <Typography.Text>Quạt {detail.tier.name}</Typography.Text>
                </Space>
                <Switch
                  checked={detail.tier.relays.fan}
                  disabled={isNodeUnavailable}
                  onChange={() => toggleTierFan(detail.tier.tierId)}
                  checkedChildren="Bật"
                  unCheckedChildren="Tắt"
                />
              </Flex>
            </Flex>
          </div>
        </Flex>
      )}
    </Drawer>
  )
}

function findTrayDetail(tiers: Tier[], trayId: string | null) {
  for (const tier of tiers) {
    const tray = tier.trays.find((item) => item.id === trayId)

    if (tray) {
      return { tier, tray }
    }
  }

  return null
}
