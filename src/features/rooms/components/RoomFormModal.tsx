import { useEffect, useState } from 'react'
import { Form, Input, InputNumber, Modal, Select } from 'antd'
import type { Room, RoomFormValues } from '../../../types/room.types'

interface RoomFormModalProps {
  open: boolean
  onCancel: () => void
  onSubmit: (values: RoomFormValues) => Promise<void>
  initialValues?: Partial<RoomFormValues>
}

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Đang hoạt động' },
  { value: 'MAINTENANCE', label: 'Đang bảo trì' },
  { value: 'INACTIVE', label: 'Ngừng hoạt động' },
] satisfies Array<{ value: Room['status']; label: string }>

export function RoomFormModal({
  open,
  onCancel,
  onSubmit,
  initialValues,
}: RoomFormModalProps) {
  const [form] = Form.useForm<RoomFormValues>()
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!open) {
      return
    }

    form.resetFields()
    form.setFieldsValue({
      maxCapacity: 1,
      status: 'ACTIVE',
      ...initialValues,
    })
  }, [form, initialValues, open])

  const handleFinish = async (values: RoomFormValues) => {
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
      title={initialValues ? 'Cập nhật phòng nuôi' : 'Thêm phòng nuôi'}
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      okText="Lưu phòng"
      cancelText="Hủy"
      confirmLoading={isSubmitting}
      cancelButtonProps={{ disabled: isSubmitting }}
      closable={!isSubmitting}
      maskClosable={!isSubmitting}
      keyboard={!isSubmitting}
      destroyOnHidden
      afterClose={() => form.resetFields()}
    >
      <Form<RoomFormValues>
        form={form}
        layout="vertical"
        requiredMark={false}
        preserve={false}
        onFinish={handleFinish}
      >
        <Form.Item
          label="Tên phòng"
          name="name"
          rules={[
            { required: true, message: 'Vui lòng nhập tên phòng.' },
            { whitespace: true, message: 'Tên phòng không được để trống.' },
          ]}
        >
          <Input placeholder="Phòng nuôi A1" maxLength={100} />
        </Form.Item>

        <Form.Item
          label="Vị trí"
          name="location"
          rules={[
            { required: true, message: 'Vui lòng nhập vị trí phòng.' },
            { whitespace: true, message: 'Vị trí không được để trống.' },
          ]}
        >
          <Input placeholder="Tầng 1 · Khu A" maxLength={150} />
        </Form.Item>

        <Form.Item
          label="Sức chứa tối đa (khay)"
          name="maxCapacity"
          rules={[
            { required: true, message: 'Vui lòng nhập sức chứa.' },
            { type: 'number', min: 1, message: 'Sức chứa tối thiểu là 1.' },
          ]}
        >
          <InputNumber
            min={1}
            precision={0}
            style={{ width: '100%' }}
            placeholder="8"
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
