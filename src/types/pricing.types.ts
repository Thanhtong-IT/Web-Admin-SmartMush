/**
 * Pricing Model của MCMS Admin
 *
 * - Phí dịch vụ vận hành (Service Fee) CỐ ĐỊNH áp dụng cho mọi loại nấm
 *   theo đơn vị khay × tuần.
 * - Yếu tố chênh lệch là LOẠI NẤM và SỐ LƯỢNG KHAY:
 *   Mỗi giống có giá phôi riêng và chu kỳ sinh trưởng chuẩn tính theo tuần.
 *
 * Công thức:
 *   pricePerTray = serviceFeePerTrayPerWeek * cycleWeeks + spawnPrice
 *   totalOrder   = pricePerTray * quantity + deliveryFee (nếu DELIVERY)
 */

export type MushroomAvailability = 'AVAILABLE' | 'OUT_OF_STOCK'

/**
 * Chu kỳ gói chuẩn cho từng giống nấm, tính theo số tuần.
 */
export type PricingCycleWeeks = 1 | 2 | 3 | 4

export interface MushroomVariety {
  /** Mã giống duy nhất (kebab/snake case) */
  id: string
  /** Tên giống nấm hiển thị trên UI */
  name: string
  /** URL ảnh đại diện giống nấm */
  imageUrl: string
  /** Mô tả điều kiện nuôi / đặc điểm */
  description: string
  /** Chu kỳ gói chuẩn (tuần) */
  cycleWeeks: PricingCycleWeeks
  /** Đơn giá phôi giống trên 1 khay (VNĐ) */
  spawnPricePerTray: number
  /** Trạng thái kinh doanh */
  availability: MushroomAvailability
  /** Ngày tạo */
  createdAt: string
}

export interface GlobalServiceFee {
  /** Phí dịch vụ vận hành trên 1 khay × 1 tuần (VNĐ) */
  serviceFeePerTrayPerWeek: number
  /** Phụ phí giao hàng tận nhà trên mỗi đơn (VNĐ). Tự hái = 0. */
  deliveryFeePerOrder: number
}

/**
 * Tính tổng đơn đặt cho khách hàng (Shopee-like checkout preview).
 */
export interface OrderPriceBreakdown {
  serviceFeeTotal: number
  spawnFeeTotal: number
  traySubtotal: number
  deliveryFee: number
  totalAmount: number
  /** Số tuần gói đang tính */
  cycleWeeks: PricingCycleWeeks
}

export interface CalculateOrderPriceInput {
  variety: MushroomVariety
  quantity: number
  serviceFee: GlobalServiceFee
  deliveryMethod: 'PICKUP' | 'DELIVERY'
}

export function calculateOrderPrice(
  input: CalculateOrderPriceInput,
): OrderPriceBreakdown {
  const { variety, quantity, serviceFee, deliveryMethod } = input

  const cycleWeeks = variety.cycleWeeks
  const serviceFeeTotal =
    serviceFee.serviceFeePerTrayPerWeek * cycleWeeks * quantity
  const spawnFeeTotal = variety.spawnPricePerTray * quantity
  const traySubtotal = serviceFeeTotal + spawnFeeTotal
  const deliveryFee = deliveryMethod === 'DELIVERY' ? serviceFee.deliveryFeePerOrder : 0
  const totalAmount = traySubtotal + deliveryFee

  return {
    serviceFeeTotal,
    spawnFeeTotal,
    traySubtotal,
    deliveryFee,
    totalAmount,
    cycleWeeks,
  }
}

/**
 * Tính đơn giá hiển thị trên App cho 1 khay (không gồm delivery).
 */
export function getPricePerTray(
  variety: MushroomVariety,
  serviceFee: GlobalServiceFee,
): number {
  return (
    serviceFee.serviceFeePerTrayPerWeek * variety.cycleWeeks +
    variety.spawnPricePerTray
  )
}
