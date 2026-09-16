import { useEffect, useMemo, useState } from 'react'
import {
  CalculatorOutlined,
  DeleteOutlined,
  TruckOutlined,
  HomeOutlined,
} from '@ant-design/icons'
import {
  Alert,
  Button,
  Flex,
  Form,
  Input,
  InputNumber,
  Modal,
  Radio,
  Select,
  Space,
  Typography,
  message,
} from 'antd'
import type { MushroomVariety, PricingCycleWeeks } from '../../../types/pricing.types'
import { calculateOrderPrice } from '../../../types/pricing.types'
import { PRICING_CYCLE_OPTIONS } from '../../../stores/pricing.store'
import { usePricingStore } from '../../../stores/pricing.store'

interface MushroomVarietyFormModalProps {
  open: boolean
  initialValues?: MushroomVariety | null
  onCancel: () => void
}

type FormShape = {
  name: string
  description: string
  imageUrl: string
  cycleWeeks: PricingCycleWeeks
  spawnPricePerTray: number
}

const VND = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
})

export function MushroomVarietyFormModal({
  open,
  initialValues,
  onCancel,
}: MushroomVarietyFormModalProps) {
  const [form] = Form.useForm<FormShape>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [quantity, setQuantity] = useState<number>(1)
  const [deliveryMethod, setDeliveryMethod] =
    useState<'PICKUP' | 'DELIVERY'>('PICKUP')
  const [previewValues, setPreviewValues] = useState<FormShape | null>(null)

  const serviceFee = usePricingStore((state) => state.serviceFee)
  const addVariety = usePricingStore((state) => state.addVariety)
  const updateVariety = usePricingStore((state) => state.updateVariety)

  useEffect(() => {
    if (!open) return

    form.resetFields()

    if (initialValues) {
      form.setFieldsValue({
        name: initialValues.name,
        description: initialValues.description,
        imageUrl: initialValues.imageUrl,
        cycleWeeks: initialValues.cycleWeeks,
        spawnPricePerTray: initialValues.spawnPricePerTray,
      })
      setPreviewValues({
        name: initialValues.name,
        description: initialValues.description,
        imageUrl: initialValues.imageUrl,
        cycleWeeks: initialValues.cycleWeeks,
        spawnPricePerTray: initialValues.spawnPricePerTray,
      })
    } else {
      const defaults: FormShape = {
        name: '',
        description: '',
        imageUrl: '',
        cycleWeeks: 1,
        spawnPricePerTray: 50_000,
      }
      form.setFieldsValue(defaults)
      setPreviewValues(defaults)
    }
    setQuantity(1)
    setDeliveryMethod('PICKUP')
  }, [form, initialValues, open])

  /** Cập nhật preview khi người dùng sửa form */
  const handleValuesChange = (_changed: Partial<FormShape>, all: FormShape) => {
    setPreviewValues(all)
  }

  const handleFinish = async (values: FormShape) => {
    setIsSubmitting(true)
    try {
      await new Promise((resolve) => window.setTimeout(resolve, 250))

      if (initialValues) {
        updateVariety(initialValues.id, values)
        message.success(`Đã cập nhật giống nấm "${values.name}".`)
      } else {
        addVariety({ ...values, availability: 'AVAILABLE' })
        message.success(`Đã thêm giống nấm "${values.name}".`)
      }
      onCancel()
    } finally {
      setIsSubmitting(false)
    }
  }

  /** Tính toán giá preview */
  const previewBreakdown = useMemo(() => {
    if (!previewValues) return null

    const syntheticVariety: MushroomVariety = {
      id: initialValues?.id ?? 'PREVIEW',
      name: previewValues.name || 'Giống nấm (preview)',
      description: previewValues.description,
      imageUrl: previewValues.imageUrl,
      cycleWeeks: previewValues.cycleWeeks,
      spawnPricePerTray: previewValues.spawnPricePerTray ?? 0,
      availability: 'AVAILABLE',
      createdAt: initialValues?.createdAt ?? '',
    }

    return calculateOrderPrice({
      variety: syntheticVariety,
      quantity,
      serviceFee,
      deliveryMethod,
    })
  }, [deliveryMethod, initialValues, previewValues, quantity, serviceFee])

  const pricePerTray =
    serviceFee.serviceFeePerTrayPerWeek * (previewValues?.cycleWeeks ?? 1) +
    (previewValues?.spawnPricePerTray ?? 0)

  return (
    <Modal
      title={
        initialValues
          ? `Chỉnh sửa giống nấm: ${initialValues.name}`
          : 'Thêm giống nấm mới'
      }
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      okText="Lưu giống nấm"
      cancelText="Hủy"
      confirmLoading={isSubmitting}
      cancelButtonProps={{ disabled: isSubmitting }}
      closable={!isSubmitting}
      maskClosable={!isSubmitting}
      keyboard={!isSubmitting}
      destroyOnHidden
      width={780}
      afterClose={() => {
        form.resetFields()
        setPreviewValues(null)
      }}
    >
      <Form<FormShape>
        form={form}
        layout="vertical"
        requiredMark={false}
        preserve={false}
        onFinish={handleFinish}
        onValuesChange={handleValuesChange}
      >
        <Space.Compact block>
          <Form.Item
            label="Tên giống nấm"
            name="name"
            rules={[
              { required: true, message: 'Vui lòng nhập tên giống.' },
              { whitespace: true, message: 'Tên không được để trống.' },
            ]}
            style={{ flex: 2 }}
          >
            <Input placeholder="Nấm Bào Ngư Xám" maxLength={120} />
          </Form.Item>

          <Form.Item
            label="Chu kỳ gói chuẩn"
            name="cycleWeeks"
            rules={[{ required: true, message: 'Vui lòng chọn chu kỳ.' }]}
            style={{ flex: 1 }}
          >
            <Select options={PRICING_CYCLE_OPTIONS.map((o) => ({
              value: o.value,
              label: o.shortLabel,
            }))} />
          </Form.Item>
        </Space.Compact>

        <Form.Item
          label="Mô tả điều kiện nuôi"
          name="description"
          rules={[
            { required: true, message: 'Vui lòng nhập mô tả.' },
            { whitespace: true, message: 'Mô tả không được để trống.' },
          ]}
        >
          <Input.TextArea
            rows={2}
            placeholder="Giống PN-01, phù hợp khí hậu 22–28°C, ẩm 80–90%."
            maxLength={500}
          />
        </Form.Item>

        <Space.Compact block>
          <Form.Item
            label="Đơn giá phôi giống / khay (VNĐ)"
            name="spawnPricePerTray"
            rules={[
              { required: true, message: 'Vui lòng nhập đơn giá phôi.' },
              { type: 'number', min: 0, message: 'Giá phải ≥ 0.' },
            ]}
            style={{ flex: 1 }}
          >
            <InputNumber
              min={0}
              step={10_000}
              precision={0}
              style={{ width: '100%' }}
              placeholder="50.000"
              formatter={(value) =>
                value != null ? `${value} đ / khay` : ''
              }
              parser={(value) =>
                Number((value ?? '').replace(/[^\d]/g, '')) || 0
              }
            />
          </Form.Item>

          <Form.Item
            label="URL hình ảnh"
            name="imageUrl"
            tooltip="Để trống sẽ dùng ảnh mặc định theo tên giống."
            style={{ flex: 1 }}
          >
            <Input placeholder="https://images.unsplash.com/..." />
          </Form.Item>
        </Space.Compact>

        {/* Preview Calculator */}
        <Alert
          type="info"
          showIcon
          icon={<CalculatorOutlined />}
          style={{ marginBottom: 16, marginTop: 8 }}
          message={
            <Space size={8} wrap>
              <CalculatorOutlined />
              <Typography.Text strong>
                Preview Checkout — khách nhìn thấy trên App
              </Typography.Text>
            </Space>
          }
          description={
            <Space direction="vertical" size={10} style={{ width: '100%' }}>
              <Space size={12} wrap>
                <div>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    Số khay
                  </Typography.Text>
                  <InputNumber
                    min={1}
                    max={50}
                    value={quantity}
                    onChange={(v) => setQuantity(Math.max(1, Number(v ?? 1)))}
                    style={{ width: 80 }}
                  />
                </div>

                <div>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    Phương thức nhận
                  </Typography.Text>
                  <Radio.Group
                    value={deliveryMethod}
                    onChange={(e) =>
                      setDeliveryMethod(e.target.value)
                    }
                    style={{ marginLeft: 8 }}
                  >
                    <Radio.Button value="PICKUP">
                      <HomeOutlined /> Tự đến hái
                    </Radio.Button>
                    <Radio.Button value="DELIVERY">
                      <TruckOutlined /> Giao tận nhà
                    </Radio.Button>
                  </Radio.Group>
                </div>
              </Space>

              <div
                style={{
                  background: '#fafafa',
                  border: '1px dashed #d9d9d9',
                  borderRadius: 8,
                  padding: 12,
                }}
              >
                <Space direction="vertical" size={4} style={{ width: '100%' }}>
                  <Flex justify="space-between">
                    <Typography.Text type="secondary">
                      Phí dịch vụ ({previewValues?.cycleWeeks ?? 1} tuần ×{' '}
                      {quantity} khay):
                    </Typography.Text>
                    <Typography.Text>
                      {VND.format(previewBreakdown?.serviceFeeTotal ?? 0)}
                    </Typography.Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Typography.Text type="secondary">
                      Đơn giá phôi ({quantity} khay):
                    </Typography.Text>
                    <Typography.Text>
                      {VND.format(previewBreakdown?.spawnFeeTotal ?? 0)}
                    </Typography.Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Typography.Text strong>Đơn giá 1 khay:</Typography.Text>
                    <Typography.Text strong type="success">
                      {VND.format(pricePerTray)}
                    </Typography.Text>
                  </Flex>
                  {deliveryMethod === 'DELIVERY' && (
                    <Flex justify="space-between">
                      <Typography.Text type="secondary">
                        Phí giao tận nhà:
                      </Typography.Text>
                      <Typography.Text>
                        {VND.format(previewBreakdown?.deliveryFee ?? 0)}
                      </Typography.Text>
                    </Flex>
                  )}
                  <Flex
                    justify="space-between"
                    style={{
                      borderTop: '1px solid #d9d9d9',
                      paddingTop: 6,
                      marginTop: 4,
                    }}
                  >
                    <Typography.Text strong>TỔNG KHÁCH TRẢ:</Typography.Text>
                    <Typography.Title level={4} type="danger" style={{ margin: 0 }}>
                      {VND.format(previewBreakdown?.totalAmount ?? 0)}
                    </Typography.Title>
                  </Flex>
                </Space>
              </div>
            </Space>
          }
        />
      </Form>
    </Modal>
  )
}
