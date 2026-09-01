import { useEffect, useState } from 'react'
import { Form, Input, Modal, Select } from 'antd'
import type {
  CultivationBatch,
  CultivationLogInput,
  GrowthStage,
} from '../../../types/cultivation.types'

interface CultivationLogModalProps {
  open: boolean
  batch: CultivationBatch | null
  onCancel: () => void
  onSubmit: (values: CultivationLogInput) => Promise<void>
}

interface LogFormValues {
  stage: GrowthStage
  note: string
  loggedBy: string
  actionTaken: string
}

const STAGE_OPTIONS = [
  { value: 'INCUBATION', label: 'Ủ tơ / Nuôi sợi' },
  { value: 'PINNING', label: 'Kích nụ / Ra ghim' },
  { value: 'FRUITING', label: 'Phát triển thể quả' },
  { value: 'READY_TO_HARVEST', label: 'Sẵn sàng thu hoạch' },
  { value: 'HARVESTED', label: 'Đã thu hoạch' },
] satisfies Array<{ value: GrowthStage; label: string }>

export function CultivationLogModal({
  open,
  batch,
  onCancel,
  onSubmit,
}: CultivationLogModalProps) {
  const [form] = Form.useForm<LogFormValues>()
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!open || !batch) {
      return
    }

    form.resetFields()
    form.setFieldsValue({
      stage: batch.currentStage,
      note: '',
      loggedBy: 'Quản trị viên MCMS',
      actionTaken: '',
    })
  }, [batch, form, open])

  const handleFinish = async (values: LogFormValues) => {
    setIsSubmitting(true)

    try {
      await onSubmit({
        stage: values.stage,
        note: values.note.trim(),
        loggedBy: values.loggedBy.trim(),
        actionTaken: values.actionTaken.trim(),
      })
      form.resetFields()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      title={batch ? `Thêm nhật ký · ${batch.batchCode}` : 'Thêm nhật ký'}
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      okText="Lưu nhật ký"
      cancelText="Hủy"
      confirmLoading={isSubmitting}
      cancelButtonProps={{ disabled: isSubmitting }}
      closable={!isSubmitting}
      maskClosable={!isSubmitting}
      keyboard={!isSubmitting}
      destroyOnHidden
      afterClose={() => form.resetFields()}
    >
      <Form<LogFormValues>
        form={form}
        layout="vertical"
        requiredMark={false}
        preserve={false}
        onFinish={handleFinish}
      >
        <Form.Item
          label="Giai đoạn"
          name="stage"
          rules={[{ required: true, message: 'Vui lòng chọn giai đoạn.' }]}
        >
          <Select options={STAGE_OPTIONS} />
        </Form.Item>

        <Form.Item
          label="Ghi chú quan sát"
          name="note"
          rules={[
            { required: true, message: 'Vui lòng nhập ghi chú.' },
            { whitespace: true, message: 'Ghi chú không được để trống.' },
          ]}
        >
          <Input.TextArea rows={3} placeholder="Mô tả tình trạng mẻ nấm" />
        </Form.Item>

        <Form.Item
          label="Hành động đã thực hiện"
          name="actionTaken"
          rules={[
            { required: true, message: 'Vui lòng nhập hành động.' },
            { whitespace: true, message: 'Hành động không được để trống.' },
          ]}
        >
          <Input.TextArea rows={2} placeholder="Ví dụ: Tăng thông gió 10 phút" />
        </Form.Item>

        <Form.Item
          label="Người ghi nhận"
          name="loggedBy"
          rules={[{ required: true, message: 'Vui lòng nhập người ghi nhận.' }]}
        >
          <Input placeholder="Tên người ghi nhận" />
        </Form.Item>
      </Form>
    </Modal>
  )
}
