import { create } from 'zustand'
import type {
  CreatePackageInput,
  PackageStatus,
  RentalPackage,
  UpdatePackageInput,
} from '../types/package.types'

export const MOCK_PACKAGES: RentalPackage[] = [
  {
    id: 'PACKAGE-001',
    name: 'Gói Trải Nghiệm Khởi Động',
    code: 'STARTER-30',
    price: 490000,
    billingCycle: 'MONTHLY',
    durationDays: 30,
    maxTrays: 1,
    supportedMushrooms: ['Nấm Bào Ngư Xám', 'Nấm Hoàng Kim'],
    features: ['Camera stream HD 24/7', 'Tư vấn vi khí hậu cơ bản'],
    status: 'ACTIVE',
    isPopular: false,
    totalSubscribers: 24,
    createdAt: '2026-01-05',
  },
  {
    id: 'PACKAGE-002',
    name: 'Gói Vụ Mùa Tiêu Chuẩn',
    code: 'CROP-STANDARD',
    price: 1290000,
    billingCycle: 'CROP_CYCLE',
    durationDays: 90,
    maxTrays: 3,
    supportedMushrooms: [
      'Nấm Bào Ngư Xám',
      'Nấm Linh Chi',
      'Nấm Mối Đen',
    ],
    features: [
      'Camera stream HD 24/7',
      'Kỹ thuật viên hỗ trợ thu hoạch',
      'Tư vấn vi khí hậu',
    ],
    status: 'PROMOTION',
    isPopular: true,
    totalSubscribers: 86,
    createdAt: '2025-12-12',
  },
  {
    id: 'PACKAGE-003',
    name: 'Gói Gia Đình Cao Cấp',
    code: 'FAMILY-PREMIUM',
    price: 2490000,
    billingCycle: 'QUARTERLY',
    durationDays: 180,
    maxTrays: 6,
    supportedMushrooms: [
      'Nấm Bào Ngư Xám',
      'Nấm Linh Chi',
      'Nấm Hoàng Kim',
      'Nấm Mối Đen',
    ],
    features: [
      'Camera stream HD 24/7',
      'Kỹ thuật viên hỗ trợ thu hoạch',
      'Bảo hiểm nấm mốc/hỏng 1 đổi 1',
      'Tư vấn vi khí hậu nâng cao',
    ],
    status: 'ACTIVE',
    isPopular: false,
    totalSubscribers: 41,
    createdAt: '2025-11-20',
  },
  {
    id: 'PACKAGE-004',
    name: 'Gói Đông Trùng Doanh Nghiệp',
    code: 'CORPORATE-CORDY',
    price: 8990000,
    billingCycle: 'YEARLY',
    durationDays: 365,
    maxTrays: 20,
    supportedMushrooms: ['Đông Trùng Hạ Thảo', 'Nấm Linh Chi'],
    features: [
      'Camera stream HD 24/7',
      'Kỹ thuật viên riêng',
      'Bảo hiểm nấm mốc/hỏng 1 đổi 1',
      'Báo cáo sản lượng định kỳ',
    ],
    status: 'INACTIVE',
    isPopular: false,
    totalSubscribers: 7,
    createdAt: '2025-08-01',
  },
]

interface PackageState {
  packages: RentalPackage[]
  addPackage: (values: CreatePackageInput) => void
  updatePackage: (id: string, values: UpdatePackageInput) => void
  togglePackageStatus: (id: string) => void
  togglePackagePopular: (id: string) => void
  deletePackage: (id: string) => void
}

function getNextPackageId(packages: RentalPackage[]) {
  const highestId = packages.reduce((highest, rentalPackage) => {
    const match = /^PACKAGE-(\d+)$/.exec(rentalPackage.id)
    const numericId = match ? Number(match[1]) : 0

    return Math.max(highest, numericId)
  }, 0)

  return `PACKAGE-${String(highestId + 1).padStart(3, '0')}`
}

function getToday() {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export const usePackageStore = create<PackageState>((set) => ({
  packages: MOCK_PACKAGES,

  addPackage: (values) =>
    set((state) => ({
      packages: [
        {
          ...values,
          id: getNextPackageId(state.packages),
          totalSubscribers: 0,
          createdAt: getToday(),
        },
        ...state.packages,
      ],
    })),

  updatePackage: (id, values) =>
    set((state) => ({
      packages: state.packages.map((rentalPackage) =>
        rentalPackage.id === id
          ? {
              ...rentalPackage,
              ...values,
              supportedMushrooms: values.supportedMushrooms
                ? [...values.supportedMushrooms]
                : rentalPackage.supportedMushrooms,
              features: values.features
                ? [...values.features]
                : rentalPackage.features,
            }
          : rentalPackage,
      ),
    })),

  togglePackageStatus: (id) =>
    set((state) => ({
      packages: state.packages.map((rentalPackage) => {
        if (rentalPackage.id !== id) {
          return rentalPackage
        }

        const nextStatus: PackageStatus =
          rentalPackage.status === 'INACTIVE' ? 'ACTIVE' : 'INACTIVE'

        return { ...rentalPackage, status: nextStatus }
      }),
    })),

  togglePackagePopular: (id) =>
    set((state) => ({
      packages: state.packages.map((rentalPackage) =>
        rentalPackage.id === id
          ? { ...rentalPackage, isPopular: !rentalPackage.isPopular }
          : rentalPackage,
      ),
    })),

  deletePackage: (id) =>
    set((state) => ({
      packages: state.packages.filter((rentalPackage) => rentalPackage.id !== id),
    })),
}))
