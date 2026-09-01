import { useEffect, useState } from 'react'
import { Form, Input, InputNumber, Modal, Space } from 'antd'
import type { ThresholdProfileInput } from '../../../types/setting.types'

interface ThresholdProfileModalProps {
  open: boolean
  onCancel: () => void
  onSubmit: (values: ThresholdProfileInput) => Promise<void>
  initialValues?: Partial<ThresholdProfileInput>
}

export function ThresholdProfileModal({
  open,
  onCancel,
  onSubmit,
  initialValues,
}: ThresholdProfileModalProps) {
  const [form] = Form.useForm<ThresholdProfileInput>()
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!open) {
      return
    }

    form.resetFields()
    form.setFieldsValue({
      tempMin: 20,
      tempMax: 28,
      humidityMin: 75,
      humidityMax: 95,
      co2Max: 1000,
      soilMoistureMin: 60,
      soilMoistureMax: 85,
      ...initialValues,
    })
  }, [form, initialValues, open])

  const handleFinish = async (values: ThresholdProfileInput) => {
    const rangeErrors: Array<{
      name: keyof ThresholdProfileInput
      errors: string[]
    }> = []

    if (values.tempMin >= values.tempMax) {
      rangeErrors.push({
        name: 'tempMin',
        errors: ['Nhiệt độ Min phải nhỏ hơn Max.'],
      })
    }

    if (values.humidityMin >= values.humidityMax) {
      rangeErrors.push({
        name: 'humidityMin',
        errors: ['Độ ẩm Min phải nhỏ hơn Max.'],
      })
    }

    if (values.soilMoistureMin >= values.soilMoistureMax) {
      rangeErrors.push({
        name: 'soilMoistureMin',
        errors: ['Độ ẩm giá thể Min phải nhỏ hơn Max.'],
      })
    }

    if (rangeErrors.length > 0) {
      form.setFields(rangeErrors)
      return
    }

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
      title={initialValues ? 'Cập nhật ngưỡng vi khí hậu' : 'Thêm giống nấm'}
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      okText="Lưu profile"
      cancelText="Hủy"
      confirmLoading={isSubmitting}
      cancelButtonProps={{ disabled: isSubmitting }}
      closable={!isSubmitting}
      maskClosable={!isSubmitting}
      keyboard={!isSubmitting}
      destroyOnHidden
      afterClose={() => form.resetFields()}
    >
      <Form<ThresholdProfileInput>
        form={form}
        layout="vertical"
        requiredMark={false}
        preserve={false}
        onFinish={handleFinish}
      >
        <Form.Item
          label="Loại nấm"
          name="mushroomType"
          rules={[
            { required: true, message: 'Vui lòng nhập loại nấm.' },
            { whitespace: true, message: 'Loại nấm không được để trống.' },
          ]}
        >
          <Input placeholder="Nấm Bào Ngư Xám" maxLength={100} />
        </Form.Item>

        <Form.Item
          label="Tên profile"
          name="name"
          rules={[
            { required: true, message: 'Vui lòng nhập tên profile.' },
            { whitespace: true, message: 'Tên profile không được để trống.' },
          ]}
        >
          <Input placeholder="Profile tiêu chuẩn" maxLength={120} />
        </Form.Item>

        <Space.Compact block>
          <Form.Item
            label="Nhiệt độ Min (°C)"
            name="tempMin"
            rules={[{ required: true, message: 'Nhập nhiệt độ Min.' }]}
            style={{ flex: 1 }}
          >
            <InputNumber style={{ width: '100%' }} precision={1} />
          </Form.Item>
          <Form.Item
            label="Nhiệt độ Max (°C)"
            name="tempMax"
            rules={[{ required: true, message: 'Nhập nhiệt độ Max.' }]}
            style={{ flex: 1 }}
          >
            <InputNumber style={{ width: '100%' }} precision={1} />
          </Form.Item>
        </Space.Compact>

        <Space.Compact block>
          <Form.Item
            label="Độ ẩm Min (%RH)"
            name="humidityMin"
            rules={[{ required: true, message: 'Nhập độ ẩm Min.' }]}
            style={{ flex: 1 }}
          >
            <InputNumber min={0} max={100} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            label="Độ ẩm Max (%RH)"
            name="humidityMax"
            rules={[{ required: true, message: 'Nhập độ ẩm Max.' }]}
            style={{ flex: 1 }}
          >
            <InputNumber min={0} max={100} style={{ width: '100%' }} />
          </Form.Item>
        </Space.Compact>

        <Form.Item
          label="CO₂ tối đa (ppm)"
          name="co2Max"
          rules={[{ required: true, message: 'Nhập ngưỡng CO₂.' }]}
        >
          <InputNumber min={1} style={{ width: '100%' }} />
        </Form.Item>

        <Space.Compact block>
          <Form.Item
            label="Độ ẩm giá thể Min (%)"
            name="soilMoistureMin"
            rules={[{ required: true, message: 'Nhập giá trị Min.' }]}
            style={{ flex: 1 }}
          >
            <InputNumber min={0} max={100} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            label="Độ ẩm giá thể Max (%)"
            name="soilMoistureMax"
            rules={[{ required: true, message: 'Nhập giá trị Max.' }]}
            style={{ flex: 1 }}
          >
            <InputNumber min={0} max={100} style={{ width: '100%' }} />
          </Form.Item>
        </Space.Compact>
      </Form>
    </Modal>
  )
}
