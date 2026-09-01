import { useState } from 'react'
import {
  BulbOutlined,
  ExperimentOutlined,
  ThunderboltOutlined,
  WarningOutlined,
} from '@ant-design/icons'
import { Alert, Card, Flex, Modal, Segmented, Space, Switch, Tag, Typography } from 'antd'
import type {
  ControlMode,
  DeviceActuators,
  DeviceStatus,
} from '../../../types/device.types'

interface ActuatorControlPanelProps {
  actuators: DeviceActuators
  deviceStatus: DeviceStatus
  onToggle: (actuator: keyof Omit<DeviceActuators, 'mode'>) => void
  onModeChange: (mode: ControlMode) => void
}

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

  return (
    <>
      <Card
        title="Điều khiển thiết bị"
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

        <Flex vertical gap={14}>
          <Flex align="center" justify="space-between" gap={12}>
            <Space>
              <ThunderboltOutlined />
              <Typography.Text>Quạt thông gió</Typography.Text>
            </Space>
            <Switch
              checked={actuators.fanStatus}
              disabled={!isManual || isUnavailable}
              onChange={() => onToggle('fanStatus')}
              checkedChildren="Bật"
              unCheckedChildren="Tắt"
              aria-label="Bật hoặc tắt quạt thông gió"
            />
          </Flex>

          <Flex align="center" justify="space-between" gap={12}>
            <Space>
              <ExperimentOutlined />
              <Typography.Text>Máy phun sương</Typography.Text>
            </Space>
            <Switch
              checked={actuators.pumpStatus}
              disabled={!isManual || isUnavailable}
              onChange={() => onToggle('pumpStatus')}
              checkedChildren="Bật"
              unCheckedChildren="Tắt"
              aria-label="Bật hoặc tắt máy phun sương"
            />
          </Flex>

          <Flex align="center" justify="space-between" gap={12}>
            <Space>
              <BulbOutlined />
              <Typography.Text>Đèn LED quang phổ</Typography.Text>
            </Space>
            <Switch
              checked={actuators.lightStatus}
              disabled={!isManual || isUnavailable}
              onChange={() => onToggle('lightStatus')}
              checkedChildren="Bật"
              unCheckedChildren="Tắt"
              aria-label="Bật hoặc tắt đèn LED quang phổ"
            />
          </Flex>
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
          Khi ở chế độ thủ công, các relay sẽ không được bộ điều khiển AUTO tự động
          ghi đè. Bạn có chắc muốn tiếp tục?
        </Typography.Paragraph>
      </Modal>
    </>
  )
}
