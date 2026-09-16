export type PackageStatus = 'ACTIVE' | 'INACTIVE' | 'PROMOTION'

export type BillingCycle =
  | 'WEEKLY'
  | 'BIWEEKLY'
  | 'MONTHLY'
  | 'CROP_CYCLE'
  | 'QUARTERLY'
  | 'YEARLY'

export interface RentalPackage {
  id: string
  name: string
  code: string
  price: number
  billingCycle: BillingCycle
  durationDays: number
  maxTrays: number
  supportedMushrooms: string[]
  features: string[]
  status: PackageStatus
  isPopular: boolean
  totalSubscribers: number
  createdAt: string
  /** Phí giao nhận nếu khách chọn giao tận nhà (VNĐ). Mặc định 0 = miễn phí. */
  deliveryFee?: number
  /** Mô tả chính sách giao nhận / nhận hàng. */
  deliveryPolicy?: string
}

export type CreatePackageInput = Omit<
  RentalPackage,
  'id' | 'totalSubscribers' | 'createdAt'
>

export type UpdatePackageInput = Partial<CreatePackageInput>
