import { useEffect, useState } from 'react'
import { Button, Form, Input, Popconfirm, Space, Switch, Typography, message } from 'antd'
import { useSettingStore } from '../../../stores/setting.store'
import type { NotificationChannelConfig } from '../../../types/setting.types'

interface NotificationConfigTabProps {
  canEdit: boolean
}

export function NotificationConfigTab({ canEdit }: NotificationConfigTabProps) {
  const [form] = Form.useForm<NotificationChannelConfig>()
  const [isSaving, setIsSaving] = useState(false)
  const config = useSettingStore((state) => state.notificationConfig)
  const updateConfig = useSettingStore(
    (state) => state.updateNotificationConfig,
  )
  const resetConfig = useSettingStore(
    (state) => state.resetNotificationConfig,
  )

  useEffect(() => {
    form.setFieldsValue(config)
  }, [config, form])

  const handleFinish = async (values: NotificationChannelConfig) => {
    setIsSaving(true)

    try {
      await new Promise((resolve) => window.setTimeout(resolve, 250))
      updateConfig(values)
      message.success('Đã lưu cấu hình kênh thông báo.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div style={{ maxWidth: 720 }}>
      <Typography.Title level={4} style={{ marginTop: 0 }}>
        Kênh Thông báo
      </Typography.Title>
      <Typography.Paragraph type="secondary">
        Chọn kênh nhận cảnh báo và báo cáo định kỳ của hệ thống.
      </Typography.Paragraph>

      {!canEdit && (
        <Typography.Paragraph type="warning">
          Chỉ ADMIN được thay đổi kênh thông báo toàn hệ thống.
        </Typography.Paragraph>
      )}

      <Form<NotificationChannelConfig>
        form={form}
        layout="vertical"
        requiredMark={false}
        disabled={!canEdit}
        onFinish={handleFinish}
      >
        <Form.Item
          label="Bật thông báo Email"
          name="emailEnabled"
          valuePropName="checked"
        >
          <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
        </Form.Item>

        <Form.Item
          label="Email quản trị nhận cảnh báo"
          name="adminEmail"
          rules={[
            { required: true, message: 'Vui lòng nhập email quản trị.' },
            { type: 'email', message: 'Email không đúng định dạng.' },
          ]}
        >
          <Input type="email" placeholder="admin@mcms.vn" />
        </Form.Item>

        <Form.Item
          label="Bật Telegram Bot"
          name="telegramEnabled"
          valuePropName="checked"
        >
          <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
        </Form.Item>

        <Form.Item label="Telegram Bot Token" name="telegramBotToken">
          <Input.Password placeholder="Nhập Bot Token" />
        </Form.Item>

        <Form.Item label="Telegram Chat ID" name="telegramChatId">
          <Input placeholder="Nhập Chat ID" />
        </Form.Item>

        <Form.Item
          label="Bật Zalo ZNS"
          name="zaloEnabled"
          valuePropName="checked"
        >
          <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
        </Form.Item>

        <Form.Item
          label="Chỉ gửi cảnh báo CRITICAL"
          name="criticalAlertsOnly"
          valuePropName="checked"
        >
          <Switch checkedChildren="Critical" unCheckedChildren="Tất cả" />
        </Form.Item>

        <Form.Item
          label="Email nhận báo cáo ngày"
          name="dailyReportEmail"
          rules={[{ type: 'email', message: 'Email không đúng định dạng.' }]}
        >
          <Input type="email" placeholder="reports@mcms.vn" />
        </Form.Item>

        {canEdit && (
          <Space>
            <Button type="primary" htmlType="submit" loading={isSaving}>
              Lưu cấu hình
            </Button>
            <Popconfirm
              title="Khôi phục kênh thông báo mặc định?"
              description="Các giá trị tùy chỉnh hiện tại sẽ bị thay thế."
              okText="Khôi phục"
              cancelText="Hủy"
              onConfirm={() => {
                resetConfig()
                message.success('Đã khôi phục kênh thông báo mặc định.')
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
