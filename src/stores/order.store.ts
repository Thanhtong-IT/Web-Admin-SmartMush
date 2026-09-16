import { create } from 'zustand'
import type { AppOrder, CreateOrderInput, OrderStatus } from '../types/order.types'
import { TIER_IDS, TRAY_POSITIONS } from '../types/room.types'
import { usePricingStore } from './pricing.store'
import type { MushroomVariety } from '../types/pricing.types'

/** Kiểm tra khay có đang trống hay không */
function isTrayAvailable(
  trayId: string,
  assignedTrays: Set<string>,
): boolean {
  return !assignedTrays.has(trayId)
}

/** Tạo orderCode theo format ORD-YYYY-MMDD-NNN */
function generateOrderCode(orders: AppOrder[]): string {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  const prefix = `ORD-${year}-${month}${day}`
  const countToday = orders.filter((o) => o.orderCode.startsWith(prefix)).length
  const seq = String(countToday + 1).padStart(3, '0')
  return `${prefix}-${seq}`
}

interface MockOrderSeed {
  id: string
  orderCode: string
  tenantId: string
  tenantName: string
  tenantPhone: string
  tenantAddress: string
  mushroomType: string
  quantity: number
  deliveryMethod: 'PICKUP' | 'DELIVERY'
  deliveryAddress?: string
  paymentMethod: 'ONLINE_APP' | 'BANK_TRANSFER' | 'COD'
  paymentStatus: 'PAID' | 'UNPAID' | 'REFUNDED'
  status: OrderStatus
  trayId?: string
  batchId?: string
  assignedAt?: string
  createdAt: string
  updatedAt: string
  notes?: string
}

const MOCK_ORDER_SEEDS: MockOrderSeed[] = [
  // ── Đơn PENDING — chờ gán khay ──────────────────────────────
  {
    id: 'ORD-001',
    orderCode: 'ORD-2026-0916-001',
    tenantId: 'TENANT-006',
    tenantName: 'Đỗ Hoàng Nam',
    tenantPhone: '0909876543',
    tenantAddress: '42 Nguyễn Trãi, Quận 1, TP.HCM',
    mushroomType: 'Nấm Bào Ngư Xám',
    quantity: 1,
    deliveryMethod: 'PICKUP',
    paymentMethod: 'ONLINE_APP',
    paymentStatus: 'PAID',
    status: 'PENDING_TRAY_ASSIGNMENT',
    createdAt: '2026-09-16T08:30:00+07:00',
    updatedAt: '2026-09-16T08:30:00+07:00',
    notes: 'Khách yêu cầu khay gần cửa ra vào (tầng 1 ưu tiên).',
  },
  {
    id: 'ORD-002',
    orderCode: 'ORD-2026-0915-001',
    tenantId: 'TENANT-007',
    tenantName: 'Bùi Khánh Linh',
    tenantPhone: '0912345999',
    tenantAddress: '88 Lý Thường Kiệt, Quận 10, TP.HCM',
    mushroomType: 'Nấm Linh Chi',
    quantity: 1,
    deliveryMethod: 'DELIVERY',
    deliveryAddress: '88 Lý Thường Kiệt, Quận 10, TP.HCM',
    paymentMethod: 'ONLINE_APP',
    paymentStatus: 'PAID',
    status: 'PENDING_TRAY_ASSIGNMENT',
    createdAt: '2026-09-15T14:20:00+07:00',
    updatedAt: '2026-09-15T14:20:00+07:00',
    notes: 'Giao nấm thu hoạch tận nhà sau 21 ngày.',
  },
  {
    id: 'ORD-003',
    orderCode: 'ORD-2026-0914-001',
    tenantId: 'TENANT-006',
    tenantName: 'Đỗ Hoàng Nam',
    tenantPhone: '0909876543',
    tenantAddress: '42 Nguyễn Trãi, Quận 1, TP.HCM',
    mushroomType: 'Nấm Hoàng Kim',
    quantity: 2,
    deliveryMethod: 'PICKUP',
    paymentMethod: 'BANK_TRANSFER',
    paymentStatus: 'PAID',
    status: 'PENDING_TRAY_ASSIGNMENT',
    createdAt: '2026-09-14T09:10:00+07:00',
    updatedAt: '2026-09-14T09:10:00+07:00',
  },
  // ── Đơn ASSIGNED — đã gán khay, đang chăm sóc ────────────────
  {
    id: 'ORD-004',
    orderCode: 'ORD-2026-0913-001',
    tenantId: 'TENANT-001',
    tenantName: 'Nguyễn Minh Anh',
    tenantPhone: '0901234567',
    tenantAddress: '18 Nguyễn Văn Linh, Hải Châu, Đà Nẵng',
    mushroomType: 'Nấm Bào Ngư Xám',
    quantity: 1,
    deliveryMethod: 'PICKUP',
    paymentMethod: 'ONLINE_APP',
    paymentStatus: 'PAID',
    status: 'ASSIGNED',
    trayId: 'T1-K1',
    batchId: 'MCMS-2608-A01',
    assignedAt: '2026-09-13T10:00:00+07:00',
    createdAt: '2026-09-13T09:00:00+07:00',
    updatedAt: '2026-09-13T10:00:00+07:00',
  },
  {
    id: 'ORD-005',
    orderCode: 'ORD-2026-0911-001',
    tenantId: 'TENANT-002',
    tenantName: 'Trần Quốc Bảo',
    tenantPhone: '0912345678',
    tenantAddress: '52 Lê Lợi, Ninh Kiều, Cần Thơ',
    mushroomType: 'Nấm Linh Chi',
    quantity: 1,
    deliveryMethod: 'DELIVERY',
    deliveryAddress: '52 Lê Lợi, Ninh Kiều, Cần Thơ',
    paymentMethod: 'ONLINE_APP',
    paymentStatus: 'PAID',
    status: 'ASSIGNED',
    trayId: 'T2-K1',
    batchId: 'MCMS-2607-L02',
    assignedAt: '2026-09-11T11:30:00+07:00',
    createdAt: '2026-09-11T08:00:00+07:00',
    updatedAt: '2026-09-11T11:30:00+07:00',
  },
  {
    id: 'ORD-006',
    orderCode: 'ORD-2026-0910-001',
    tenantId: 'TENANT-004',
    tenantName: 'Võ Ngọc Thảo',
    tenantPhone: '0977123456',
    tenantAddress: '106 Phan Xích Long, Phú Nhuận, TP.HCM',
    mushroomType: 'Nấm Bào Ngư Trắng',
    quantity: 1,
    deliveryMethod: 'PICKUP',
    paymentMethod: 'ONLINE_APP',
    paymentStatus: 'PAID',
    status: 'READY_TO_HARVEST',
    trayId: 'T3-K1',
    batchId: 'MCMS-2606-B03',
    assignedAt: '2026-09-10T09:00:00+07:00',
    createdAt: '2026-09-10T08:00:00+07:00',
    updatedAt: '2026-09-10T09:00:00+07:00',
  },
  // ── Đơn COMPLETED — đã thu hoạch ─────────────────────────────
  {
    id: 'ORD-007',
    orderCode: 'ORD-2026-0901-001',
    tenantId: 'TENANT-005',
    tenantName: 'Phạm Thanh Tùng',
    tenantPhone: '0938123456',
    tenantAddress: '71 Cách Mạng Tháng 8, Quận 3, TP.HCM',
    mushroomType: 'Nấm Hoàng Kim',
    quantity: 1,
    deliveryMethod: 'PICKUP',
    paymentMethod: 'ONLINE_APP',
    paymentStatus: 'PAID',
    status: 'COMPLETED',
    trayId: 'T4-K1',
    batchId: 'BATCH-2026-001',
    assignedAt: '2026-08-30T10:00:00+07:00',
    createdAt: '2026-08-30T09:00:00+07:00',
    updatedAt: '2026-09-05T16:00:00+07:00',
  },
]

/**
 * Build AppOrder từ seed + Pricing hiện tại.
 *
 * Công thức:
 *   unitPrice (1 khay × 1 tuần) = serviceFeePerWeek + spawnPrice
 *   totalAmount                  = unitPrice × weeks × quantity + deliveryFee
 *
 * `weeks` lấy từ cycleWeeks của MushroomVariety — không cần hard-code gói.
 */
function buildOrderFromSeed(
  seed: MockOrderSeed,
  varieties: MushroomVariety[],
  serviceFee: { serviceFeePerTrayPerWeek: number; deliveryFeePerOrder: number },
): AppOrder {
  const variety =
    varieties.find((v) => v.name === seed.mushroomType) ??
    varieties.find((v) => v.name.startsWith(seed.mushroomType))

  const weeks = variety?.cycleWeeks ?? 1
  const unitPrice = serviceFee.serviceFeePerTrayPerWeek + (variety?.spawnPricePerTray ?? 0)
  const deliveryFee =
    seed.deliveryMethod === 'DELIVERY' ? serviceFee.deliveryFeePerOrder : 0
  const totalAmount = unitPrice * weeks * seed.quantity + deliveryFee

  return {
    id: seed.id,
    orderCode: seed.orderCode,
    tenantId: seed.tenantId,
    tenantName: seed.tenantName,
    tenantPhone: seed.tenantPhone,
    tenantAddress: seed.tenantAddress,
    items: [
      {
        mushroomType: seed.mushroomType,
        weeks,
        quantity: seed.quantity,
        unitPrice,
      },
    ],
    deliveryMethod: seed.deliveryMethod,
    deliveryAddress: seed.deliveryAddress,
    deliveryFee,
    totalAmount,
    paymentMethod: seed.paymentMethod,
    paymentStatus: seed.paymentStatus,
    status: seed.status,
    trayId: seed.trayId,
    batchId: seed.batchId,
    assignedAt: seed.assignedAt,
    createdAt: seed.createdAt,
    updatedAt: seed.updatedAt,
    notes: seed.notes,
  }
}

/**
 * Helper expose cho UI: tính lại breakdown của đơn dựa trên pricing hiện tại.
 * Dùng khi admin thay đổi phí dịch vụ để xem trước số tiền mới.
 */
export function recalculateOrderTotal(
  order: AppOrder,
  varieties: MushroomVariety[],
  serviceFee: { serviceFeePerTrayPerWeek: number; deliveryFeePerOrder: number },
): AppOrder {
  const newItems = order.items.map((item) => {
    const variety = varieties.find((v) => v.name === item.mushroomType)
    const unitPrice =
      serviceFee.serviceFeePerTrayPerWeek + (variety?.spawnPricePerTray ?? 0)
    return { ...item, unitPrice }
  })

  const deliveryFee =
    order.deliveryMethod === 'DELIVERY' ? serviceFee.deliveryFeePerOrder : 0

  let trayTotal = 0
  newItems.forEach((item) => {
    trayTotal += item.unitPrice * item.weeks * item.quantity
  })

  return {
    ...order,
    items: newItems,
    deliveryFee,
    totalAmount: trayTotal + deliveryFee,
  }
}

interface OrderState {
  orders: AppOrder[]
  addOrder: (values: CreateOrderInput) => void
  assignTrayToOrder: (
    orderId: string,
    trayId: string,
    batchId: string,
  ) => void
  updateOrderStatus: (orderId: string, status: OrderStatus) => void
  cancelOrder: (orderId: string) => void
}

/** Trả về Set trayId đang được assigned trong orders */
function getAssignedTrayIds(orders: AppOrder[]): Set<string> {
  return new Set(
    orders
      .filter(
        (o) =>
          o.trayId != null &&
          ['ASSIGNED', 'GROWING', 'READY_TO_HARVEST', 'COMPLETED'].includes(
            o.status,
          ),
      )
      .map((o) => o.trayId!),
  )
}

/** Trả về danh sách khay trống chưa gán order nào */
export function getAvailableTrays(
  orders: AppOrder[],
): Array<{ tierId: number; position: number; trayId: string }> {
  const assigned = getAssignedTrayIds(orders)
  const available: Array<{ tierId: number; position: number; trayId: string }> = []

  for (const tierId of TIER_IDS) {
    for (const position of TRAY_POSITIONS) {
      const trayId = `T${tierId}-K${position}`
      if (isTrayAvailable(trayId, assigned)) {
        available.push({ tierId, position, trayId })
      }
    }
  }

  return available
}

/**
 * Build mock orders từ pricing store hiện tại.
 * Hàm này được gọi 1 lần khi khởi tạo — đảm bảo totals luôn khớp
 * với công thức định giá mới nhất.
 */
function buildMockOrders(): AppOrder[] {
  const { varieties, serviceFee } = usePricingStore.getState()
  return MOCK_ORDER_SEEDS.map((seed) =>
    buildOrderFromSeed(seed, varieties, serviceFee),
  )
}

// Tạo 1 dummy variety cho trường hợp pricing store chưa init — không xảy ra
// trong runtime nhưng giúp type-check.
export const MOCK_ORDERS: AppOrder[] = buildMockOrders()

export const useOrderStore = create<OrderState>((set) => ({
  orders: MOCK_ORDERS,

  addOrder: (values) =>
    set((state) => ({
      orders: [
        {
          ...values,
          id: `ORD-${Date.now()}`,
          orderCode: generateOrderCode(state.orders),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        ...state.orders,
      ],
    })),

  assignTrayToOrder: (orderId, trayId, batchId) =>
    set((state) => ({
      orders: state.orders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              trayId,
              batchId,
              status: 'ASSIGNED' as OrderStatus,
              assignedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
          : order,
      ),
    })),

  updateOrderStatus: (orderId, status) =>
    set((state) => ({
      orders: state.orders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status,
              updatedAt: new Date().toISOString(),
            }
          : order,
      ),
    })),

  cancelOrder: (orderId) =>
    set((state) => ({
      orders: state.orders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status: 'CANCELLED' as OrderStatus,
              updatedAt: new Date().toISOString(),
            }
          : order,
      ),
    })),
}))
