import { useState } from 'react'
import {
  ApiOutlined,
  ArrowLeftOutlined,
  CloudOutlined,
  ExperimentOutlined,
  FireOutlined,
  SyncOutlined,
} from '@ant-design/icons'
import {
  Button,
  Card,
  Col,
  Divider,
  Flex,
  Row,
  Space,
  Switch,
  Tag,
  Typography,
} from 'antd'
import { useNavigate, useParams } from 'react-router-dom'
import { EnvironmentChart } from '../../dashboard/components/EnvironmentChart'
import type { EnvironmentDataPoint } from '../../dashboard/components/EnvironmentChart'
import { EnvironmentMetricCard } from '../../dashboard/components/EnvironmentMetricCard'
import { RoomStatusTag } from '../components/RoomStatusTag'
import { useRoomStore } from '../../../stores/room.store'
import type { Tray } from '../../../types/room.types'

interface TrayDetail
  extends Pick<Tray, 'name' | 'deviceId' | 'mushroomType' | 'status'> {
  temperature: number
  humidity: number
}

const MOCK_TRAY_DETAILS: Record<string, TrayDetail> = {
  'TRAY-001': {
    name: 'Khay tầng 1',
    deviceId: 'ESP32-A1B2',
    mushroomType: 'Nấm bào ngư',
    status: 'ACTIVE',
    temperature: 25.6,
    humidity: 87,
  },
  'TRAY-002': {
    name: 'Khay tầng 2',
    deviceId: 'ESP32-C3D4',
    mushroomType: 'Nấm linh chi',
    status: 'ACTIVE',
    temperature: 26.1,
    humidity: 84,
  },
  'TRAY-003': {
    name: 'Khay tầng 3',
    deviceId: 'ESP32-E5F6',
    mushroomType: 'Nấm mối',
    status: 'MAINTENANCE',
    temperature: 24.8,
    humidity: 89,
  },
  'TRAY-004': {
    name: 'Khay tầng 4',
    deviceId: 'ESP32-G7H8',
    mushroomType: 'Nấm hương',
    status: 'INACTIVE',
    temperature: 23.9,
    humidity: 82,
  },
}

function createTrayEnvironmentData(
  temperature: number,
  humidity: number,
): EnvironmentDataPoint[] {
  const offsets = [-1.2, -1.5, -1.1, -0.8, -0.4, 0.2, 0.6, 0.8, 0.5, 0.2, -0.1, -0.3]
  const humidityOffsets = [4, 5, 3, 4, 2, 1, -1, -2, -1, 0, 1, 2]
  const times = [
    '00:00',
    '02:00',
    '04:00',
    '06:00',
    '08:00',
    '10:00',
    '12:00',
    '14:00',
    '16:00',
    '18:00',
    '20:00',
    '22:00',
  ]

  return [
    ...times.map((time, index) => ({
      time,
      temperature: Number((temperature + offsets[index]).toFixed(1)),
      humidity: humidity + humidityOffsets[index],
    })),
    { time: 'Hiện tại', temperature, humidity },
  ]
}

export function TrayDetailPage() {
  const { id = '' } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const storedTray = useRoomStore((state) =>
    state.trays.find((tray) => tray.id === id),
  )
  const [isFanEnabled, setIsFanEnabled] = useState(true)
  const [isMistingEnabled, setIsMistingEnabled] = useState(false)

  const fallbackTray: TrayDetail = {
    name: id ? `Khay ${id}` : 'Khay không xác định',
    deviceId: 'Chưa kết nối',
    mushroomType: 'Chưa xác định',
    status: 'INACTIVE',
    temperature: 0,
    humidity: 0,
  }
  const tray: TrayDetail = {
    ...fallbackTray,
    ...MOCK_TRAY_DETAILS[id],
    ...storedTray,
  }
  const chartData = createTrayEnvironmentData(tray.temperature, tray.humidity)

  return (
    <div>
      <Flex
        align="flex-end"
        justify="space-between"
        gap={16}
        wrap
        style={{ marginBottom: 24 }}
      >
        <div>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/rooms')}
            style={{ marginBottom: 8, paddingInline: 0 }}
          >
            Quay lại
          </Button>

          <Typography.Title level={3} style={{ margin: 0 }}>
            {tray.name}
          </Typography.Title>
          <Typography.Text type="secondary">
            Loại nấm: {tray.mushroomType}
          </Typography.Text>
        </div>

        <Space wrap>
          <RoomStatusTag status={tray.status} />
          <Tag icon={<ApiOutlined />} color="processing">
            ESP32: {tray.deviceId}
          </Tag>
        </Space>
      </Flex>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <Row gutter={[16, 16]}>
            <Col xs={12} lg={24}>
              <EnvironmentMetricCard
                title="Nhiệt độ"
                value={tray.temperature}
                unit="°C"
                precision={1}
                icon={<FireOutlined />}
                color="#dc2626"
              />
            </Col>

            <Col xs={12} lg={24}>
              <EnvironmentMetricCard
                title="Độ ẩm"
                value={tray.humidity}
                unit="%"
                icon={<CloudOutlined />}
                color="#0f766e"
              />
            </Col>

            <Col span={24}>
              <Card title="Điều khiển thiết bị">
                <Flex align="center" justify="space-between" gap={16}>
                  <Space>
                    <SyncOutlined />
                    <Typography.Text>Quạt thông gió</Typography.Text>
                  </Space>
                  <Switch
                    checked={isFanEnabled}
                    onChange={setIsFanEnabled}
                    checkedChildren="Bật"
                    unCheckedChildren="Tắt"
                    aria-label="Bật hoặc tắt quạt thông gió"
                  />
                </Flex>

                <Divider style={{ margin: '16px 0' }} />

                <Flex align="center" justify="space-between" gap={16}>
                  <Space>
                    <ExperimentOutlined />
                    <Typography.Text>Bơm sương</Typography.Text>
                  </Space>
                  <Switch
                    checked={isMistingEnabled}
                    onChange={setIsMistingEnabled}
                    checkedChildren="Bật"
                    unCheckedChildren="Tắt"
                    aria-label="Bật hoặc tắt bơm sương"
                  />
                </Flex>
              </Card>
            </Col>
          </Row>
        </Col>

        <Col xs={24} lg={16}>
          <EnvironmentChart data={chartData} />
        </Col>
      </Row>
    </div>
  )
}
