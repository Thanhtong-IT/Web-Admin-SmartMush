/** Trạng thái đơn đặt từ App khách hàng */
export type OrderStatus =
  | 'PENDING_TRAY_ASSIGNMENT' // Chờ gán khay trống
  | 'ASSIGNED'               // Đã gán khay, đang chăm sóc
  | 'GROWING'                // Đang sinh trưởng
  | 'READY_TO_HARVEST'       // Đến độ thu hoạch
  | 'COMPLETED'              // Hoàn tất / đã thu hoạch
  | 'CANCELLED'              // Hủy đơn

/** Phương thức nhận hàng */
export type DeliveryMethod = 'PICKUP' | 'DELIVERY'

/**
 * Mỗi item đặt thuê dựa trên Loại nấm cụ thể — không còn khái niệm "gói".
 *
 * Công thức giá:
 *   totalAmount = (serviceFeePerWeek + spawnPrice) * weeks * quantity + deliveryFee
 *
 * Trong đó `weeks` được quy định bởi chu kỳ gói chuẩn của từng giống nấm.
 */
export interface OrderItem {
  /** Tên loại nấm (vd: "Nấm Bào Ngư Xám", "Nấm Linh Chi") */
  mushroomType: string
  /** Số tuần gói — lấy theo cycleWeeks của MushroomVariety */
  weeks: number
  /** Số khay đặt */
  quantity: number
  /** Đơn giá trên 1 khay × 1 tuần (đã gồm phí dịch vụ + phôi) */
  unitPrice: number
}

export interface AppOrder {
  id: string
  orderCode: string
  tenantId: string
  tenantName: string
  tenantPhone: string
  tenantAddress: string
  items: OrderItem[]
  deliveryMethod: DeliveryMethod
  deliveryAddress?: string
  deliveryFee: number
  totalAmount: number
  paymentMethod: 'ONLINE_APP' | 'BANK_TRANSFER' | 'COD'
  paymentStatus: 'PAID' | 'UNPAID' | 'REFUNDED'
  status: OrderStatus
  trayId?: string // được gán khi status chuyển sang ASSIGNED
  batchId?: string
  assignedAt?: string
  createdAt: string
  updatedAt: string
  notes?: string
}

export type CreateOrderInput = Omit<
  AppOrder,
  'id' | 'orderCode' | 'createdAt' | 'updatedAt'
>
