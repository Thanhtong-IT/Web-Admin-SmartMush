import { create } from 'zustand'
import type {
  CreatePackageInput,
  PackageStatus,
  RentalPackage,
  UpdatePackageInput,
} from '../types/package.types'

/**
 * Legacy package store — chỉ giữ lại 2 gói chuẩn được tham chiếu bởi App mobile.
 * Trang /packages đã chuyển sang Pricing Model mới (xem pricing.store.ts),
 * nhưng vẫn giữ store này cho tương thích ngược với các màn hình admin cũ.
 */
export const MOCK_PACKAGES: RentalPackage[] = [
  {
    id: 'PACKAGE-001',
    name: 'Gói Chuẩn 1 Tuần',
    code: 'CROP-STANDARD',
    price: 150_000,
    billingCycle: 'WEEKLY',
    durationDays: 7,
    maxTrays: 1,
    supportedMushrooms: ['Nấm Bào Ngư Xám', 'Nấm Bào Ngư Trắng'],
    features: [
      'Camera giám sát sinh trưởng 24/7',
      'Tư vấn vi khí hậu cơ bản',
      'Nhắc lịch thu hoạch tự động',
    ],
    status: 'ACTIVE',
    isPopular: true,
    totalSubscribers: 124,
    createdAt: '2025-10-01',
    deliveryFee: 0,
    deliveryPolicy:
      'Miễn phí giao nhận. Khách tự đến vườn hái khi đến độ.',
  },
  {
    id: 'PACKAGE-002',
    name: 'Gói Chuyên Sâu 3 Tuần',
    code: 'CROP-PRO-21',
    price: 350_000,
    billingCycle: 'BIWEEKLY',
    durationDays: 21,
    maxTrays: 2,
    supportedMushrooms: ['Nấm Linh Chi', 'Đông Trùng Hạ Thảo'],
    features: [
      'Camera giám sát sinh trưởng 24/7',
      'Kỹ thuật viên hỗ trợ theo dõi 2 lần/tuần',
      'Bảo hiểm nấm mốc/hỏng 1 đổi 1',
      'Tư vấn vi khí hậu nâng cao',
    ],
    status: 'ACTIVE',
    isPopular: false,
    totalSubscribers: 38,
    createdAt: '2025-10-01',
    deliveryFee: 30_000,
    deliveryPolicy: 'Phí giao tận nhà 30.000 đ. Áp dụng khu vực nội thành.',
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
          deliveryFee: values.deliveryFee ?? 0,
          deliveryPolicy: values.deliveryPolicy ?? '',
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
