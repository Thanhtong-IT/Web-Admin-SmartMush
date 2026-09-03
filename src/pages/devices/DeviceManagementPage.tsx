import { useEffect, useMemo, useState } from 'react'
import {
  ApiOutlined,
  LinkOutlined,
  PlusOutlined,
  ReloadOutlined,
  WifiOutlined,
} from '@ant-design/icons'
import {
  Button,
  Empty,
  Flex,
  Input,
  Pagination,
  Select,
  Space,
  Switch,
  Tag,
  Typography,
  message,
} from 'antd'
import { ActuatorControlPanel } from './components/ActuatorControlPanel'
import { CameraStreamCard } from './components/CameraStreamCard'
import { DeviceFormModal } from './components/DeviceFormModal'
import { DeviceMetricsGrid } from './components/DeviceMetricsGrid'
import { useDeviceStore } from '../../stores/device.store'
import { useRoomStore } from '../../features/rooms/store/room.store'
import type {
  ActuatorKey,
  Device,
  DeviceActuators,
  DeviceStatus,
  DeviceFormValues,
} from '../../types/device.types'

const STATUS_OPTIONS = [
  { value: 'ONLINE', label: 'Online' },
  { value: 'OFFLINE', label: 'Offline' },
  { value: 'WARNING', label: 'Cảnh báo' },
  { value: 'ERROR', label: 'Lỗi' },
] satisfies Array<{ value: DeviceStatus; label: string }>

const STATUS_CONFIG: Record<
  DeviceStatus,
  { color: string; label: string }
> = {
  ONLINE: { color: 'success', label: 'Online' },
  OFFLINE: { color: 'default', label: 'Offline' },
  WARNING: { color: 'warning', label: 'Cảnh báo' },
  ERROR: { color: 'error', label: 'Lỗi' },
}

const PAGE_SIZE = 4

function formatTimestamp(timestamp: string | null) {
  if (!timestamp) {
    return 'Chưa có dữ liệu'
  }

  return new Date(timestamp).toLocaleString('vi-VN')
}

function getDefaultDeviceFormValues(device: Device): DeviceFormValues {
  return {
    trayId: device.node.trayId,
    ipAddress: device.gateway.ipAddress,
    macAddress: device.gateway.macAddress,
    firmwareVersion: device.firmwareVersion,
    streamUrl: device.camera.streamUrl,
    resolution: device.camera.resolution,
    fps: device.camera.fps,
  }
}

export function DeviceManagementPage() {
  const devices = useDeviceStore((state) => state.devices)
  const telemetrySimulationEnabled = useDeviceStore(
    (state) => state.telemetrySimulationEnabled,
  )
  const addDevice = useDeviceStore((state) => state.addDevice)
  const setTelemetrySimulationEnabled = useDeviceStore(
    (state) => state.setTelemetrySimulationEnabled,
  )
  const simulateTelemetry = useDeviceStore((state) => state.simulateTelemetry)
  const toggleActuator = useDeviceStore((state) => state.toggleActuator)
  const setControlMode = useDeviceStore((state) => state.setControlMode)
  const pingDevice = useDeviceStore((state) => state.pingDevice)
  const restartDevice = useDeviceStore((state) => state.restartDevice)
  const takeSnapshot = useDeviceStore((state) => state.takeSnapshot)
  const trays = useRoomStore((state) => state.trays)

  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState<DeviceStatus | undefined>()
  const [currentPage, setCurrentPage] = useState(1)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingDevice, setEditingDevice] = useState<Device | null>(null)
  const [pendingAction, setPendingAction] = useState<string | null>(null)

  const trayById = useMemo(
    () => new Map(trays.map((tray) => [tray.id, tray])),
    [trays],
  )

  const availableTrayOptions = useMemo(
    () =>
      trays
        .filter((tray) => !devices.some((device) => device.node.trayId === tray.id))
        .map((tray) => ({
          value: tray.id,
          label: `${tray.id} - ${tray.name}`,
        })),
    [devices, trays],
  )

  const filteredDevices = useMemo(() => {
    const normalizedSearch = searchText.trim().toLowerCase()

    return devices.filter((device) => {
      const tray = trayById.get(device.node.trayId)
      const searchableValues = [
        device.gateway.ipAddress,
        device.gateway.macAddress,
        device.id,
        device.node.trayId,
        device.gateway.id,
        tray?.name ?? '',
      ]
      const matchesSearch = normalizedSearch
        ? searchableValues.some((value) =>
            value.toLowerCase().includes(normalizedSearch),
          )
        : true
      const matchesStatus = statusFilter
        ? device.status === statusFilter
        : true

      return matchesSearch && matchesStatus
    })
  }, [devices, searchText, statusFilter, trayById])

  const maxPage = Math.max(1, Math.ceil(filteredDevices.length / PAGE_SIZE))
  const visiblePage = Math.min(currentPage, maxPage)
  const visibleDevices = filteredDevices.slice(
    (visiblePage - 1) * PAGE_SIZE,
    visiblePage * PAGE_SIZE,
  )

  useEffect(() => {
    if (!telemetrySimulationEnabled) {
      return
    }

    const timer = window.setInterval(simulateTelemetry, 5000)

    return () => window.clearInterval(timer)
  }, [simulateTelemetry, telemetrySimulationEnabled])

  const handleAddDevice = () => {
    setEditingDevice(null)
    setIsFormOpen(true)
  }

  const handleSubmit = async (values: DeviceFormValues) => {
    await new Promise((resolve) => window.setTimeout(resolve, 400))
    addDevice(values)
    setIsFormOpen(false)
    setEditingDevice(null)
    message.success('Đã ghép nối Node STM32 với khay trồng qua RS485.')
  }

  const handlePing = async (device: Device) => {
    const actionKey = `${device.id}:ping`
    setPendingAction(actionKey)

    try {
      await new Promise((resolve) => window.setTimeout(resolve, 350))
      pingDevice(device.id)
      message.success(`Đã ping ${device.id}.`)
    } finally {
      setPendingAction(null)
    }
  }

  const handleRestart = async (device: Device) => {
    const actionKey = `${device.id}:restart`
    setPendingAction(actionKey)

    try {
      await new Promise((resolve) => window.setTimeout(resolve, 500))
      restartDevice(device.id)
      message.success(`Đã gửi lệnh khởi động lại ${device.id}.`)
    } finally {
      setPendingAction(null)
    }
  }

  const handleSnapshot = (device: Device) => {
    takeSnapshot(device.id)
    message.success(`Đã chụp snapshot từ ${device.id}.`)
  }

  const handleToggleActuator = (
    device: Device,
    actuator: ActuatorKey,
  ) => {
    toggleActuator(device.id, actuator)
  }

  const handleModeChange = (device: Device, mode: DeviceActuators['mode']) => {
    setControlMode(device.id, mode)
  }

  return (
    <div>
      <Flex
        align="center"
        justify="space-between"
        gap={16}
        wrap
        style={{ marginBottom: 20 }}
      >
        <div>
          <Typography.Title level={3} style={{ margin: 0 }}>
            Thiết bị IoT & Camera
          </Typography.Title>
          <Typography.Text type="secondary">
            Quản lý Gateway Master ESP32-S3 và các Node STM32 trên bus RS485
          </Typography.Text>
        </div>

        <Space wrap>
          <Typography.Text>Giả lập telemetry</Typography.Text>
          <Switch
            checked={telemetrySimulationEnabled}
            onChange={setTelemetrySimulationEnabled}
            checkedChildren="Bật"
            unCheckedChildren="Tắt"
            aria-label="Bật hoặc tắt giả lập telemetry"
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddDevice}>
            Ghép nối Node STM32
          </Button>
        </Space>
      </Flex>

      <Flex gap={12} wrap style={{ marginBottom: 20 }}>
        <Input
          allowClear
          prefix={<LinkOutlined />}
          placeholder="Tìm IP, MAC, mã thiết bị hoặc tên khay"
          value={searchText}
          onChange={(event) => {
            setSearchText(event.target.value)
            setCurrentPage(1)
          }}
          style={{ width: 340, maxWidth: '100%' }}
        />

        <Select<DeviceStatus>
          allowClear
          placeholder="Lọc theo trạng thái"
          options={STATUS_OPTIONS}
          value={statusFilter}
          onChange={(value) => {
            setStatusFilter(value)
            setCurrentPage(1)
          }}
          style={{ width: 180 }}
          aria-label="Lọc thiết bị theo trạng thái"
        />
      </Flex>

      {visibleDevices.length === 0 ? (
        <Empty description="Không có thiết bị phù hợp" />
      ) : (
        <Flex vertical gap={20}>
          {visibleDevices.map((device) => {
            const statusConfig = STATUS_CONFIG[device.status]
            const tray = trayById.get(device.node.trayId)
            const pingActionKey = `${device.id}:ping`
            const restartActionKey = `${device.id}:restart`

            return (
              <section
                key={device.id}
                aria-labelledby={`${device.id}-title`}
                style={{
                  padding: 20,
                  border: '1px solid #e5e7eb',
                  borderRadius: 8,
                  background: '#ffffff',
                }}
              >
                <Flex
                  align="center"
                  justify="space-between"
                  gap={16}
                  wrap
                  style={{ marginBottom: 16 }}
                >
                  <div>
                    <Flex align="center" gap={8} wrap>
                      <Typography.Title
                        id={`${device.id}-title`}
                        level={4}
                        style={{ margin: 0 }}
                      >
                        {tray?.name ?? device.node.trayId}
                      </Typography.Title>
                      <Tag color={statusConfig.color}>{statusConfig.label}</Tag>
                      <Tag icon={<ApiOutlined />} color="processing">
                        Node {device.node.nodeAddress}
                      </Tag>
                    </Flex>
                    <Typography.Text type="secondary">
                      {device.node.trayId} · Địa chỉ RS485 (Node ID: #{device.node.nodeAddress}) ·
                      {' '}DIP {device.node.dipSwitch} · Firmware {device.firmwareVersion} · Ping cuối:{' '}
                      {formatTimestamp(device.lastPingTimestamp)}
                    </Typography.Text>
                    <Typography.Text type="secondary" style={{ display: 'block' }}>
                      Gateway Master ESP32-S3: {device.gateway.id} · IP {device.gateway.ipAddress} ·
                      {' '}MAC {device.gateway.macAddress}
                    </Typography.Text>
                  </div>

                  <Space wrap>
                    <Typography.Text type="secondary">
                      <WifiOutlined /> {device.wifiRssi} dBm
                    </Typography.Text>
                    <Button
                      icon={<ApiOutlined />}
                      loading={pendingAction === pingActionKey}
                      onClick={() => void handlePing(device)}
                    >
                      Ping
                    </Button>
                    <Button
                      icon={<ReloadOutlined />}
                      loading={pendingAction === restartActionKey}
                      onClick={() => void handleRestart(device)}
                    >
                      Restart
                    </Button>
                  </Space>
                </Flex>

                <DeviceMetricsGrid telemetry={device.telemetry} />

                <Flex gap={16} wrap style={{ marginTop: 16 }}>
                  <div style={{ flex: '1 1 560px', minWidth: 0 }}>
                    <CameraStreamCard
                      deviceId={device.id}
                      status={device.status}
                      camera={device.camera}
                      onSnapshot={() => handleSnapshot(device)}
                    />
                  </div>
                  <div style={{ flex: '1 1 360px', minWidth: 300 }}>
                    <ActuatorControlPanel
                      actuators={device.actuators}
                      deviceStatus={device.status}
                      onToggle={(actuator) =>
                        handleToggleActuator(device, actuator)
                      }
                      onModeChange={(mode) => handleModeChange(device, mode)}
                    />
                  </div>
                </Flex>
              </section>
            )
          })}
        </Flex>
      )}

      {filteredDevices.length > PAGE_SIZE && (
        <Flex justify="flex-end" style={{ marginTop: 20 }}>
          <Pagination
            current={visiblePage}
            pageSize={PAGE_SIZE}
            total={filteredDevices.length}
            showSizeChanger={false}
            showTotal={(total) => `${total} thiết bị`}
            onChange={setCurrentPage}
          />
        </Flex>
      )}

      <DeviceFormModal
        open={isFormOpen}
        initialValues={
          editingDevice ? getDefaultDeviceFormValues(editingDevice) : undefined
        }
        availableTrayOptions={availableTrayOptions}
        onCancel={() => {
          setIsFormOpen(false)
          setEditingDevice(null)
        }}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
