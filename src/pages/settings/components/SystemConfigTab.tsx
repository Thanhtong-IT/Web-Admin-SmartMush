import { useEffect, useState } from 'react'
import { Form, Select, Space, Switch, Typography, message, Popconfirm, Button } from 'antd'
import { useSettingStore } from '../../../stores/setting.store'
import type { SystemIoTConfig } from '../../../types/setting.types'

interface SystemConfigTabProps {
  canEdit: boolean
}

const TELEMETRY_OPTIONS = [
  { value: 5, label: 'Mỗi 5 giây' },
  { value: 10, label: 'Mỗi 10 giây' },
  { value: 30, label: 'Mỗi 30 giây' },
  { value: 60, label: 'Mỗi 60 giây' },
] satisfies Array<{ value: SystemIoTConfig['telemetryIntervalSeconds']; label: string }>

const HEARTBEAT_OPTIONS = [
  { value: 1, label: 'Sau 1 phút' },
  { value: 3, label: 'Sau 3 phút' },
  { value: 5, label: 'Sau 5 phút' },
] satisfies Array<{ value: SystemIoTConfig['deviceOfflineTimeoutMinutes']; label: string }>

const SNAPSHOT_OPTIONS = [
  { value: 5, label: 'Mỗi 5 phút' },
  { value: 15, label: 'Mỗi 15 phút' },
  { value: 60, label: 'Mỗi 60 phút' },
] satisfies Array<{ value: SystemIoTConfig['cameraSnapshotIntervalMinutes']; label: string }>

export function SystemConfigTab({ canEdit }: SystemConfigTabProps) {
  const [form] = Form.useForm<SystemIoTConfig>()
  const [isSaving, setIsSaving] = useState(false)
  const config = useSettingStore((state) => state.systemConfig)
  const updateConfig = useSettingStore((state) => state.updateSystemConfig)
  const resetConfig = useSettingStore((state) => state.resetSystemConfig)

  useEffect(() => {
    form.setFieldsValue(config)
  }, [config, form])

  const handleFinish = async (values: SystemIoTConfig) => {
    setIsSaving(true)

    try {
      await new Promise((resolve) => window.setTimeout(resolve, 250))
      updateConfig(values)
      message.success('Đã lưu cấu hình thiết bị & IoT.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div style={{ maxWidth: 720 }}>
      <Typography.Title level={4} style={{ marginTop: 0 }}>
        Cấu hình Thiết bị & IoT
      </Typography.Title>
      <Typography.Paragraph type="secondary">
        Thiết lập tần suất đồng bộ telemetry, heartbeat và snapshot camera.
      </Typography.Paragraph>

      {!canEdit && (
        <Typography.Paragraph type="warning">
          Bạn chỉ có quyền xem cấu hình hệ thống.
        </Typography.Paragraph>
      )}

      <Form<SystemIoTConfig>
        form={form}
        layout="vertical"
        requiredMark={false}
        disabled={!canEdit}
        onFinish={handleFinish}
      >
        <Form.Item
          label="Tần suất gửi Telemetry"
          name="telemetryIntervalSeconds"
          rules={[{ required: true, message: 'Vui lòng chọn tần suất.' }]}
        >
          <Select options={TELEMETRY_OPTIONS} />
        </Form.Item>

        <Form.Item
          label="Heartbeat Timeout"
          name="deviceOfflineTimeoutMinutes"
          rules={[{ required: true, message: 'Vui lòng chọn timeout.' }]}
        >
          <Select options={HEARTBEAT_OPTIONS} />
        </Form.Item>

        <Form.Item
          label="Tần suất Snapshot Camera"
          name="cameraSnapshotIntervalMinutes"
          rules={[{ required: true, message: 'Vui lòng chọn tần suất.' }]}
        >
          <Select options={SNAPSHOT_OPTIONS} />
        </Form.Item>

        <Form.Item
          label="Tự động kích Relay theo ngưỡng"
          name="autoRelayTriggerEnabled"
          valuePropName="checked"
        >
          <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
        </Form.Item>

        <Form.Item
          label="Chế độ Debug"
          name="debugMode"
          valuePropName="checked"
        >
          <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
        </Form.Item>

        {canEdit && (
          <Space>
            <Button type="primary" htmlType="submit" loading={isSaving}>
              Lưu cấu hình
            </Button>
            <Popconfirm
              title="Khôi phục cấu hình IoT mặc định?"
              description="Các giá trị tùy chỉnh hiện tại sẽ bị thay thế."
              okText="Khôi phục"
              cancelText="Hủy"
              onConfirm={() => {
                resetConfig()
                message.success('Đã khôi phục cấu hình IoT mặc định.')
              }}
            >
              <Button>Khôi phục mặc định</Button>
            </Popconfirm>
          </Space>
        )}
      </Form>
    </div>
  )
}
