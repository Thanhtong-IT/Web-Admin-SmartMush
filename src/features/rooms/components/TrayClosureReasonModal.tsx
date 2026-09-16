import {
  DeleteOutlined,
  ScissorOutlined,
} from '@ant-design/icons'
import { Alert, Form, Input, Modal, Select } from 'antd'
import { useState } from 'react'

export type ClosureDialogAction =
  | 'EARLY_HARVEST'
  | 'FORCED_CANCEL'

interface ClosureReasonValues {
  reason: string
  note: string
}

interface TrayClosureReasonModalProps {
  action: ClosureDialogAction
  batchLabel: string
  onCancel: () => void
  onConfirm: (values: ClosureReasonValues) => Promise<void>
}

const ACTION_CONFIG: Record<
  ClosureDialogAction,
  {
    title: string
    description: string
    okText: string
    danger: boolean
    icon: React.ReactNode
    reasons: Array<{ label: string; value: string }>
    defaultReason: string
    noteRequired: boolean
    notePlaceholder: string
  }
> = {
  EARLY_HARVEST: {
    title: 'Xác nhận thu hoạch sớm',
    description:
      'Mẻ sẽ được đóng sớm và chuyển sang bước lập hóa đơn. Hãy ghi rõ yêu cầu của khách để lưu hồ sơ.',
    okText: 'Đóng mẻ & xem hóa đơn',
    danger: false,
    icon: <ScissorOutlined />,
    reasons: [
      {
        label: 'Khách yêu cầu hái sớm',
        value: 'Khách yêu cầu hái sớm',
      },
    ],
    defaultReason: 'Khách yêu cầu hái sớm',
    noteRequired: false,
    notePlaceholder: 'Ví dụ: Khách cần nhận hàng sớm để kịp sự kiện...',
  },
  FORCED_CANCEL: {
    title: 'Xác nhận tiêu hủy mẻ (Chính sách ngày 7)',
    description:
      'Xác nhận tiêu hủy theo chính sách ngày 7: khách không nhận hoặc không liên lạc được sau 3 cuộc gọi. Mẻ sẽ bị đóng, khay chuyển sang Trống.',
    okText: 'Tiêu hủy & giải phóng khay',
    danger: true,
    icon: <DeleteOutlined />,
    reasons: [
      {
        label: 'Khách thuê từ chối nhận nấm',
        value: 'Khách thuê từ chối nhận nấm',
      },
      {
        label: 'Không liên lạc được sau 3 cuộc gọi',
        value: 'Không liên lạc được sau 3 cuộc gọi',
      },
      {
        label: 'Khách không đến nhận đúng hạn',
        value: 'Khách không đến nhận đúng hạn',
      },
      {
        label: 'Lý do khác (ghi rõ bên dưới)',
        value: 'Lý do khác',
      },
    ],
    defaultReason: 'Khách thuê từ chối nhận nấm',
    noteRequired: false,
    notePlaceholder:
      'Ghi chú chi tiết về tình trạng liên hệ khách (số cuộc gọi, thời gian, nội dung)...',
  },
}

export function TrayClosureReasonModal({
  action,
  batchLabel,
  onCancel,
  onConfirm,
}: TrayClosureReasonModalProps) {
  const [form] = Form.useForm<ClosureReasonValues>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const config = ACTION_CONFIG[action]

  const handleSubmit = async (values: ClosureReasonValues) => {
    setIsSubmitting(true)

    try {
      await onConfirm({
        reason: values.reason,
        note: values.note?.trim() ?? '',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      className="tray-closure-reason-modal"
      title={
        <span className="tray-dialog-title">
          <span aria-hidden="true">{config.icon}</span>
          {config.title}
        </span>
      }
      open
      onCancel={onCancel}
      onOk={() => form.submit()}
      okText={config.okText}
      cancelText="Quay lại"
      okButtonProps={{ danger: config.danger }}
      confirmLoading={isSubmitting}
      cancelButtonProps={{ disabled: isSubmitting }}
      closable={!isSubmitting}
      mask={{ closable: !isSubmitting }}
      keyboard={!isSubmitting}
      centered
      destroyOnHidden
    >
      <Alert
        type={config.danger ? 'warning' : 'info'}
        title={`Mẻ ${batchLabel}`}
        description={config.description}
        showIcon
        style={{ marginBottom: 18 }}
      />
      <Form<ClosureReasonValues>
        form={form}
        layout="vertical"
        requiredMark={false}
        initialValues={{ reason: config.defaultReason, note: '' }}
        onFinish={handleSubmit}
      >
        <Form.Item
          name="reason"
          label="Lý do xử lý"
          rules={[{ required: true, message: 'Vui lòng chọn lý do.' }]}
        >
          <Select
            options={config.reasons}
            disabled={config.reasons.length === 1}
          />
        </Form.Item>
        <Form.Item
          name="note"
          label={`Ghi chú nghiệp vụ${config.noteRequired ? '' : ' (không bắt buộc)'}`}
          rules={
            config.noteRequired
              ? [
                  { required: true, message: 'Vui lòng nhập ghi chú.' },
                  { whitespace: true, message: 'Ghi chú không được để trống.' },
                  { min: 8, message: 'Ghi chú cần ít nhất 8 ký tự.' },
                ]
              : undefined
          }
        >
          <Input.TextArea
            rows={3}
            maxLength={500}
            showCount
            placeholder={config.notePlaceholder}
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}
