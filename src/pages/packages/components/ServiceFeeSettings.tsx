import { useState } from 'react'
import {
  DollarOutlined,
  TagsOutlined,
  TruckOutlined,
} from '@ant-design/icons'
import {
  Button,
  Card,
  Flex,
  InputNumber,
  Space,
  Tag,
  Tooltip,
  Typography,
  message,
} from 'antd'

const VND = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
})

const FEE_PRESETS: Array<{
  label: string
  serviceFeePerTrayPerWeek: number
  deliveryFeePerOrder: number
  description: string
}> = [
  {
    label: 'Tiết kiệm',
    serviceFeePerTrayPerWeek: 80_000,
    deliveryFeePerOrder: 25_000,
    description: 'Phù hợp gói khuyến mãi, khách hàng mới.',
  },
  {
    label: 'Khuyên dùng',
    serviceFeePerTrayPerWeek: 100_000,
    deliveryFeePerOrder: 30_000,
    description: 'Mặc định — bao gồm IoT + camera + nhân công.',
  },
  {
    label: 'Cao cấp',
    serviceFeePerTrayPerWeek: 150_000,
    deliveryFeePerOrder: 45_000,
    description: 'Có kỹ thuật viên riêng, bảo hiểm mở rộng.',
  },
]

export function ServiceFeeSettings() {
  const [draftFee, setDraftFee] = useState(100_000)
  const [draftDelivery, setDraftDelivery] = useState(30_000)
  const [savedFee, setSavedFee] = useState(100_000)
  const [savedDelivery, setSavedDelivery] = useState(30_000)
  const [editing, setEditing] = useState(false)

  const isDirty = draftFee !== savedFee || draftDelivery !== savedDelivery
  const isValid = draftFee >= 0 && draftDelivery >= 0

  const handleEdit = () => {
    setEditing(true)
  }

  const handleCancel = () => {
    setDraftFee(savedFee)
    setDraftDelivery(savedDelivery)
    setEditing(false)
  }

  const handleSave = () => {
    if (!isValid) {
      message.error('Phí dịch vụ và phí giao nhận phải ≥ 0.')
      return
    }
    setSavedFee(draftFee)
    setSavedDelivery(draftDelivery)
    setEditing(false)
    message.success('Đã lưu cấu hình phí dịch vụ chung.')
  }

  return (
    <Card
      style={{
        borderRadius: 12,
        borderColor: '#d1fae5',
        background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfeff 100%)',
        boxShadow: '0 1px 3px rgba(16, 185, 129, 0.06)',
      }}
      styles={{ body: { padding: 24 } }}
    >
      <Flex align="center" justify="space-between" gap={12} wrap>
        <Flex align="center" gap={12}>
          <DollarOutlined style={{ fontSize: 24, color: '#059669' }} />
          <div>
            <Typography.Title level={4} style={{ margin: 0 }}>
              Cấu hình Phí dịch vụ chung
            </Typography.Title>
            <Typography.Text type="secondary" style={{ fontSize: 13 }}>
              Phí áp dụng cho mọi khay nuôi theo tuần — bao gồm điện, nước, IoT,
              camera và nhân sự vận hành.
            </Typography.Text>
          </div>
        </Flex>

        {!editing ? (
          <Button type="primary" onClick={handleEdit}>
            Chỉnh sửa phí chung
          </Button>
        ) : (
          <Space>
            <Button onClick={handleCancel}>Hủy</Button>
            <Tooltip title={!isDirty || !isValid ? 'Chưa có thay đổi hợp lệ' : ''}>
              <Button
                type="primary"
                disabled={!isDirty || !isValid}
                onClick={handleSave}
              >
                Lưu thay đổi
              </Button>
            </Tooltip>
          </Space>
        )}
      </Flex>

      <Flex gap={16} wrap="wrap" style={{ marginTop: 20 }}>
        <FeeField
          icon={<DollarOutlined />}
          label="Phí dịch vụ cơ bản"
          helperText="(đ / khay / tuần)"
          value={draftFee}
          displayValue={savedFee}
          editing={editing}
          onChange={setDraftFee}
        />

        <FeeField
          icon={<TruckOutlined />}
          label="Phụ phí giao hàng tận nhà"
          helperText="(đ / đơn)"
          value={draftDelivery}
          displayValue={savedDelivery}
          editing={editing}
          onChange={setDraftDelivery}
        />

        <div
          style={{
            flex: '1 1 220px',
            minWidth: 220,
            padding: '12px 14px',
            background: '#fff',
            border: '1px dashed #d1fae5',
            borderRadius: 8,
          }}
        >
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            Tự đến hái tại vườn
          </Typography.Text>
          <Typography.Title level={4} style={{ margin: '4px 0 0', color: '#059669' }}>
            {VND.format(0)} <Tag color="default">0 đ</Tag>
          </Typography.Title>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            Không phát sinh phí giao nhận.
          </Typography.Text>
        </div>
      </Flex>

      {/* Quick presets */}
      <div style={{ marginTop: 18 }}>
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          Thiết lập nhanh:
        </Typography.Text>
        <Space wrap style={{ marginTop: 6 }}>
          {FEE_PRESETS.map((preset) => (
            <Tag
              key={preset.label}
              color={
                preset.serviceFeePerTrayPerWeek === savedFee &&
                preset.deliveryFeePerOrder === savedDelivery
                  ? 'success'
                  : 'default'
              }
              style={{ cursor: editing ? 'pointer' : 'not-allowed' }}
              onClick={() => {
                if (!editing) return
                setDraftFee(preset.serviceFeePerTrayPerWeek)
                setDraftDelivery(preset.deliveryFeePerOrder)
              }}
            >
              {preset.label} · {VND.format(preset.serviceFeePerTrayPerWeek)}/k/tuần
            </Tag>
          ))}
        </Space>
      </div>
    </Card>
  )
}

interface FeeFieldProps {
  icon: React.ReactNode
  label: string
  helperText: string
  value: number
  displayValue: number
  editing: boolean
  onChange: (next: number) => void
}

function FeeField({
  icon,
  label,
  helperText,
  value,
  displayValue,
  editing,
  onChange,
}: FeeFieldProps) {
  return (
    <div
      style={{
        flex: '1 1 220px',
        minWidth: 220,
        padding: '12px 14px',
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: 8,
      }}
    >
      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
        {icon} {label} {helperText}
      </Typography.Text>

      {editing ? (
        <InputNumber
          value={value}
          min={0}
          step={5_000}
          precision={0}
          onChange={(v) => onChange(Number(v ?? 0))}
          style={{ width: '100%', marginTop: 4 }}
          formatter={(val) => (val != null ? `${val} đ` : '')}
          parser={(val) => Number((val ?? '').replace(/[^\d]/g, '')) || 0}
        />
      ) : (
        <Typography.Title level={3} style={{ margin: '4px 0 0', color: '#059669' }}>
          {VND.format(displayValue)}
        </Typography.Title>
      )}
    </div>
  )
}
