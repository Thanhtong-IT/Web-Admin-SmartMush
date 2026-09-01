export type PackageStatus = 'ACTIVE' | 'INACTIVE' | 'PROMOTION'

export type BillingCycle =
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
}

export type CreatePackageInput = Omit<
  RentalPackage,
  'id' | 'totalSubscribers' | 'createdAt'
>

export type UpdatePackageInput = Partial<CreatePackageInput>
