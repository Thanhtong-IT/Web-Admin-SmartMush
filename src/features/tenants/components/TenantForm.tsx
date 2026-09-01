import { useEffect, useMemo, useState } from 'react'
import { Form, Input, Modal, Select } from 'antd'
import { useRoomStore } from '../../rooms/store/room.store'
import type { Tenant, TenantFormValues } from '../types/tenant.types'

interface TenantFormProps {
  visible: boolean
  onCancel: () => void
  onSubmit: (values: TenantFormValues) => Promise<void>
  initialValues?: Partial<TenantFormValues>
}

const STATUS_OPTIONS = [
  { value: 'active', label: 'Đang thuê' },
  { value: 'expired', label: 'Hết hạn' },
] satisfies Array<{ value: Tenant['status']; label: string }>

export function TenantForm({
  visible,
  onCancel,
  onSubmit,
  initialValues,
}: TenantFormProps) {
  const [form] = Form.useForm<TenantFormValues>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const trays = useRoomStore((state) => state.trays)

  const trayOptions = useMemo(
    () =>
      trays.map((tray) => ({
        value: tray.id,
        label: `${tray.id} - ${tray.name}`,
      })),
    [trays],
  )

  useEffect(() => {
    if (!visible) {
      return
    }

    form.resetFields()
    form.setFieldsValue({ status: 'active', ...initialValues })
  }, [form, initialValues, visible])

  const handleSubmit = async (values: TenantFormValues) => {
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
      title={initialValues ? 'Cập nhật khách thuê' : 'Thêm khách thuê'}
      open={visible}
      onCancel={onCancel}
      onOk={() => form.submit()}
      okText="Lưu"
      cancelText="Hủy"
      confirmLoading={isSubmitting}
      cancelButtonProps={{ disabled: isSubmitting }}
      closable={!isSubmitting}
      maskClosable={!isSubmitting}
      keyboard={!isSubmitting}
      destroyOnHidden
      afterClose={() => form.resetFields()}
    >
      <Form<TenantFormValues>
        form={form}
        layout="vertical"
        requiredMark={false}
        preserve={false}
        onFinish={handleSubmit}
      >
        <Form.Item
          label="Họ tên"
          name="name"
          rules={[
            { required: true, message: 'Vui lòng nhập họ tên khách thuê.' },
            { whitespace: true, message: 'Họ tên không được để trống.' },
          ]}
        >
          <Input placeholder="Nhập họ tên khách thuê" maxLength={100} />
        </Form.Item>

        <Form.Item
          label="Số điện thoại"
          name="phone"
          rules={[
            { required: true, message: 'Vui lòng nhập số điện thoại.' },
            {
              pattern: /^(0|\+84)\d{9,10}$/,
              message: 'Số điện thoại không đúng định dạng.',
            },
          ]}
        >
          <Input
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="Nhập số điện thoại"
            maxLength={14}
          />
        </Form.Item>

        <Form.Item
          label="Khay đang thuê"
          name="assignedTrayId"
          rules={[{ required: true, message: 'Vui lòng chọn khay đang thuê.' }]}
        >
          <Select
            options={trayOptions}
            placeholder="Chọn khay trồng"
            showSearch
            optionFilterProp="label"
          />
        </Form.Item>

        <Form.Item
          label="Trạng thái"
          name="status"
          rules={[{ required: true, message: 'Vui lòng chọn trạng thái.' }]}
        >
          <Select options={STATUS_OPTIONS} />
        </Form.Item>
      </Form>
    </Modal>
  )
}
