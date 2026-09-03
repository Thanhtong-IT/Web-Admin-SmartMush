import { useEffect, useState } from 'react'
import { Form, Input, Modal, Select } from 'antd'
import type { DeviceFormValues } from '../../../types/device.types'

interface DeviceFormModalProps {
  open: boolean
  availableTrayOptions: Array<{ value: string; label: string }>
  onCancel: () => void
  onSubmit: (values: DeviceFormValues) => Promise<void>
  initialValues?: Partial<DeviceFormValues>
}

const RESOLUTION_OPTIONS = [
  { value: '1920x1080', label: '1920 × 1080 (Full HD)' },
  { value: '1280x720', label: '1280 × 720 (HD)' },
  { value: '640x480', label: '640 × 480 (VGA)' },
]

const FPS_OPTIONS = [
  { value: 15, label: '15 FPS' },
  { value: 20, label: '20 FPS' },
  { value: 25, label: '25 FPS' },
  { value: 30, label: '30 FPS' },
]

export function DeviceFormModal({
  open,
  availableTrayOptions,
  onCancel,
  onSubmit,
  initialValues,
}: DeviceFormModalProps) {
  const [form] = Form.useForm<DeviceFormValues>()
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!open) {
      return
    }

    form.resetFields()
    form.setFieldsValue({
      resolution: '1280x720',
      fps: 20,
      ...initialValues,
    })
  }, [form, initialValues, open])

  const handleFinish = async (values: DeviceFormValues) => {
    setIsSubmitting(true)

    try {
      await onSubmit(values)
      form.resetFields()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      title={initialValues ? 'Cập nhật Gateway Master' : 'Ghép nối Node STM32'}
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      okText="Lưu thiết bị"
      cancelText="Hủy"
      confirmLoading={isSubmitting}
      cancelButtonProps={{ disabled: isSubmitting }}
      closable={!isSubmitting}
      maskClosable={!isSubmitting}
      keyboard={!isSubmitting}
      destroyOnHidden
      afterClose={() => form.resetFields()}
    >
      <Form<DeviceFormValues>
        form={form}
        layout="vertical"
        requiredMark={false}
        preserve={false}
        onFinish={handleFinish}
      >
        <Form.Item
          label="Khay trồng / Node STM32"
          name="trayId"
          rules={[{ required: true, message: 'Vui lòng chọn khay trồng.' }]}
        >
          <Select
            showSearch
            optionFilterProp="label"
            options={availableTrayOptions}
            placeholder="Chọn khay chưa ghép thiết bị"
          />
        </Form.Item>

        <Form.Item
          label="Địa chỉ IP Gateway Master"
          name="ipAddress"
          rules={[
            { required: true, message: 'Vui lòng nhập địa chỉ IP.' },
            {
              pattern:
                /^(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/,
              message: 'Địa chỉ IPv4 không đúng định dạng.',
            },
          ]}
        >
          <Input placeholder="192.168.1.120" inputMode="decimal" />
        </Form.Item>

        <Form.Item
          label="Địa chỉ MAC Gateway Master"
          name="macAddress"
          rules={[
            { required: true, message: 'Vui lòng nhập địa chỉ MAC.' },
            {
              pattern: /^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$/,
              message: 'MAC phải có dạng AA:BB:CC:DD:EE:FF.',
            },
          ]}
        >
          <Input placeholder="24:6F:28:AA:BB:CC" maxLength={17} />
        </Form.Item>

        <Form.Item
          label="Phiên bản Firmware Gateway"
          name="firmwareVersion"
          rules={[{ required: true, message: 'Vui lòng nhập phiên bản firmware.' }]}
        >
          <Input placeholder="v1.4.2" maxLength={30} />
        </Form.Item>

        <Form.Item
          label="Stream URL"
          name="streamUrl"
          rules={[
            { required: true, message: 'Vui lòng nhập URL stream camera.' },
            {
              pattern: /^(https?|rtsp):\/\/\S+$/i,
              message: 'URL phải bắt đầu bằng http://, https:// hoặc rtsp://.',
            },
          ]}
        >
          <Input placeholder="rtsp://192.168.1.120/live" />
        </Form.Item>

        <Form.Item
          label="Độ phân giải"
          name="resolution"
          rules={[{ required: true, message: 'Vui lòng chọn độ phân giải.' }]}
        >
          <Select options={RESOLUTION_OPTIONS} />
        </Form.Item>

        <Form.Item
          label="Tốc độ khung hình"
          name="fps"
          rules={[{ required: true, message: 'Vui lòng chọn FPS.' }]}
        >
          <Select options={FPS_OPTIONS} />
        </Form.Item>
      </Form>
    </Modal>
  )
}
