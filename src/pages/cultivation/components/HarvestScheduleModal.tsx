import { useEffect, useState } from 'react'
import dayjs, { type Dayjs } from 'dayjs'
import { DatePicker, Form, Input, InputNumber, Modal, Select } from 'antd'
import type {
  CultivationBatch,
  HarvestScheduleInput,
  MushroomQuality,
  RecordHarvestInput,
} from '../../../types/cultivation.types'

type HarvestModalMode = 'schedule' | 'record'

interface HarvestScheduleModalProps {
  open: boolean
  mode: HarvestModalMode
  batch: CultivationBatch | null
  onCancel: () => void
  onSchedule: (values: HarvestScheduleInput) => Promise<void>
  onRecord: (values: RecordHarvestInput) => Promise<void>
}

interface HarvestFormValues {
  estimatedHarvestDate?: Dayjs
  expectedYieldKg?: number
  operatorInCharge?: string
  actualHarvestDate?: Dayjs
  actualYieldKg?: number
  quality?: MushroomQuality
  notes?: string
}

const QUALITY_OPTIONS = [
  { value: 'GRADE_A', label: 'Grade A' },
  { value: 'GRADE_B', label: 'Grade B' },
  { value: 'WARNING_CONTAMINATED', label: 'Cần xử lý sâu bệnh/mốc' },
] satisfies Array<{ value: MushroomQuality; label: string }>

export function HarvestScheduleModal({
  open,
  mode,
  batch,
  onCancel,
  onSchedule,
  onRecord,
}: HarvestScheduleModalProps) {
  const [form] = Form.useForm<HarvestFormValues>()
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!open || !batch) {
      return
    }

    form.resetFields()
    form.setFieldsValue(
      mode === 'schedule'
        ? {
            estimatedHarvestDate: dayjs(batch.estimatedHarvestDate),
            expectedYieldKg: batch.expectedYieldKg,
            operatorInCharge: batch.operatorInCharge,
          }
        : {
            actualHarvestDate: dayjs(),
            actualYieldKg: batch.expectedYieldKg,
            quality: batch.healthStatus,
            notes: '',
          },
    )
  }, [batch, form, mode, open])

  const handleFinish = async (values: HarvestFormValues) => {
    setIsSubmitting(true)

    try {
      if (
        mode === 'schedule' &&
        values.estimatedHarvestDate &&
        values.expectedYieldKg &&
        values.operatorInCharge
      ) {
        await onSchedule({
          estimatedHarvestDate: values.estimatedHarvestDate.format('YYYY-MM-DD'),
          expectedYieldKg: values.expectedYieldKg,
          operatorInCharge: values.operatorInCharge,
        })
      }

      if (
        mode === 'record' &&
        values.actualHarvestDate &&
        values.actualYieldKg &&
        values.quality
      ) {
        await onRecord({
          actualHarvestDate: values.actualHarvestDate.format('YYYY-MM-DD'),
          actualYieldKg: values.actualYieldKg,
          quality: values.quality,
          notes: values.notes?.trim() ?? '',
        })
      }

      form.resetFields()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      title={mode === 'schedule' ? 'Đặt lịch thu hoạch' : 'Xác nhận thu hoạch'}
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      okText={mode === 'schedule' ? 'Lưu lịch' : 'Xác nhận thu hoạch'}
      cancelText="Hủy"
      confirmLoading={isSubmitting}
      cancelButtonProps={{ disabled: isSubmitting }}
      closable={!isSubmitting}
      maskClosable={!isSubmitting}
      keyboard={!isSubmitting}
      destroyOnHidden
      afterClose={() => form.resetFields()}
    >
      <Form<HarvestFormValues>
        form={form}
        layout="vertical"
        requiredMark={false}
        preserve={false}
        onFinish={handleFinish}
      >
        {mode === 'schedule' ? (
          <>
            <Form.Item
              label="Ngày dự kiến thu hoạch"
              name="estimatedHarvestDate"
              rules={[{ required: true, message: 'Vui lòng chọn ngày.' }]}
            >
              <DatePicker
                format="DD/MM/YYYY"
                style={{ width: '100%' }}
                disabledDate={(date) => date.isBefore(dayjs().startOf('day'))}
              />
            </Form.Item>

            <Form.Item
              label="Khối lượng ước tính (kg)"
              name="expectedYieldKg"
              rules={[
                { required: true, message: 'Vui lòng nhập khối lượng.' },
                { type: 'number', min: 0.1, message: 'Khối lượng phải lớn hơn 0.' },
              ]}
            >
              <InputNumber
                min={0.1}
                precision={1}
                style={{ width: '100%' }}
                placeholder="4.5"
              />
            </Form.Item>

            <Form.Item
              label="Kỹ thuật viên phụ trách"
              name="operatorInCharge"
              rules={[
                { required: true, message: 'Vui lòng nhập người phụ trách.' },
                { whitespace: true, message: 'Tên không được để trống.' },
              ]}
            >
              <Input placeholder="Tên kỹ thuật viên" />
            </Form.Item>
          </>
        ) : (
          <>
            <Form.Item
              label="Ngày thực thu"
              name="actualHarvestDate"
              rules={[{ required: true, message: 'Vui lòng chọn ngày.' }]}
            >
              <DatePicker
                format="DD/MM/YYYY"
                style={{ width: '100%' }}
                disabledDate={(date) => date.isAfter(dayjs().endOf('day'))}
              />
            </Form.Item>

            <Form.Item
              label="Khối lượng thực thu (kg)"
              name="actualYieldKg"
              rules={[
                { required: true, message: 'Vui lòng nhập khối lượng.' },
                { type: 'number', min: 0.1, message: 'Khối lượng phải lớn hơn 0.' },
              ]}
            >
              <InputNumber
                min={0.1}
                precision={1}
                style={{ width: '100%' }}
                placeholder="4.2"
              />
            </Form.Item>

            <Form.Item
              label="Đánh giá chất lượng"
              name="quality"
              rules={[{ required: true, message: 'Vui lòng chọn chất lượng.' }]}
            >
              <Select options={QUALITY_OPTIONS} />
            </Form.Item>

            <Form.Item label="Ghi chú thu hoạch" name="notes">
              <Input.TextArea rows={3} placeholder="Ghi chú thực tế sau thu hoạch" />
            </Form.Item>
          </>
        )}
      </Form>
    </Modal>
  )
}
