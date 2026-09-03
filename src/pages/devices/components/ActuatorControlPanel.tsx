import { useState } from 'react'
import {
  ApiOutlined,
  BulbOutlined,
  ExperimentOutlined,
  SwapOutlined,
  ThunderboltOutlined,
  WarningOutlined,
} from '@ant-design/icons'
import {
  Alert,
  Card,
  Divider,
  Flex,
  Modal,
  Segmented,
  Space,
  Switch,
  Tag,
  Typography,
} from 'antd'
import type {
  ActuatorKey,
  CabinetActuatorKey,
  ControlMode,
  DeviceActuators,
  DeviceStatus,
  TrayValveKey,
} from '../../../types/device.types'

interface ActuatorControlPanelProps {
  actuators: DeviceActuators
  deviceStatus: DeviceStatus
  onToggle: (actuator: ActuatorKey) => void
  onModeChange: (mode: ControlMode) => void
}

interface ActuatorDefinition<Key extends ActuatorKey> {
  key: Key
  label: string
  icon: React.ReactNode
}

const CABINET_ACTUATORS: Array<ActuatorDefinition<CabinetActuatorKey>> = [
  { key: 'exhaustFanStatus', label: 'Quạt hút', icon: <ThunderboltOutlined /> },
  { key: 'supplyFanStatus', label: 'Quạt đẩy', icon: <SwapOutlined /> },
  { key: 'lightingStatus', label: 'Đèn chiếu sáng', icon: <BulbOutlined /> },
  { key: 'mainPumpStatus', label: 'Bơm chính', icon: <ExperimentOutlined /> },
]

const TRAY_VALVES: Array<ActuatorDefinition<TrayValveKey>> = [
  { key: 'valve1Status', label: 'Van 1', icon: <ApiOutlined /> },
  { key: 'valve2Status', label: 'Van 2', icon: <ApiOutlined /> },
  { key: 'valve3Status', label: 'Van 3', icon: <ApiOutlined /> },
  { key: 'valve4Status', label: 'Van 4', icon: <ApiOutlined /> },
]

export function ActuatorControlPanel({
  actuators,
  deviceStatus,
  onToggle,
  onModeChange,
}: ActuatorControlPanelProps) {
  const [isModeDialogOpen, setIsModeDialogOpen] = useState(false)
  const isManual = actuators.mode === 'MANUAL'
  const isUnavailable = deviceStatus === 'OFFLINE' || deviceStatus === 'ERROR'

  const handleModeChange = (mode: ControlMode) => {
    if (mode === 'MANUAL' && actuators.mode === 'AUTO') {
      setIsModeDialogOpen(true)
      return
    }

    onModeChange(mode)
  }

  const confirmManualMode = () => {
    onModeChange('MANUAL')
    setIsModeDialogOpen(false)
  }

  const renderSwitch = (control: ActuatorDefinition<ActuatorKey>, checked: boolean) => (
    <Flex align="center" justify="space-between" gap={12} key={control.key}>
      <Space>
        {control.icon}
        <Typography.Text>{control.label}</Typography.Text>
      </Space>
      <Switch
        checked={checked}
        disabled={!isManual || isUnavailable}
        onChange={() => onToggle(control.key)}
        checkedChildren="Bật"
        unCheckedChildren="Tắt"
        aria-label={`Bật hoặc tắt ${control.label.toLowerCase()}`}
      />
    </Flex>
  )

  return (
    <>
      <Card
        title="Điều khiển 8 relay SSR"
        extra={
          <Segmented<ControlMode>
            size="small"
            value={actuators.mode}
            options={[
              { label: 'Tự động', value: 'AUTO' },
              { label: 'Thủ công', value: 'MANUAL' },
            ]}
            onChange={handleModeChange}
          />
        }
      >
        {isManual ? (
          <Alert
            type="warning"
            showIcon
            icon={<WarningOutlined />}
            message="Chế độ thủ công đang bật"
            description="Các relay bên dưới sẽ không được hệ thống tự động ghi đè."
            style={{ marginBottom: 16 }}
          />
        ) : (
          <Typography.Paragraph type="secondary" style={{ marginBottom: 16 }}>
            Chế độ tự động đang điều khiển relay theo ngưỡng môi trường.
          </Typography.Paragraph>
        )}

        {isUnavailable && (
          <Tag color="error" style={{ marginBottom: 12 }}>
            Thiết bị không khả dụng
          </Tag>
        )}

        <Typography.Title level={5} style={{ margin: '0 0 12px' }}>
          Thiết bị dùng chung toàn tủ
        </Typography.Title>
        <Flex vertical gap={14}>
          {CABINET_ACTUATORS.map((control) =>
            renderSwitch(control, actuators.cabinet[control.key]),
          )}
        </Flex>

        <Divider />

        <Typography.Title level={5} style={{ margin: '0 0 12px' }}>
          Van tưới riêng từng khay
        </Typography.Title>
        <Flex vertical gap={14}>
          {TRAY_VALVES.map((control) =>
            renderSwitch(control, actuators.tray[control.key]),
          )}
        </Flex>
      </Card>

      <Modal
        title="Chuyển sang chế độ thủ công?"
        open={isModeDialogOpen}
        onCancel={() => setIsModeDialogOpen(false)}
        onOk={confirmManualMode}
        okText="Chuyển chế độ"
        cancelText="Hủy"
      >
        <Typography.Paragraph>
          Khi ở chế độ thủ công, các relay sẽ không được bộ điều khiển AUTO tự động ghi đè.
          Bạn có chắc muốn tiếp tục?
        </Typography.Paragraph>
      </Modal>
    </>
  )
}
