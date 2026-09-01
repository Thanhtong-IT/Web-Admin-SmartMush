import { useMemo, useState } from 'react'
import {
  AppstoreOutlined,
  PlusOutlined,
  SearchOutlined,
  TableOutlined,
} from '@ant-design/icons'
import {
  Button,
  Col,
  Empty,
  Flex,
  Input,
  Pagination,
  Row,
  Select,
  Segmented,
  Space,
  Typography,
  message,
} from 'antd'
import { useAuthStore } from '../../features/auth/store/auth.store'
import { usePackageStore } from '../../stores/package.store'
import { PackageCard } from './components/PackageCard'
import { PackageComparisonTable } from './components/PackageComparisonTable'
import { PackageFormModal } from './components/PackageFormModal'
import type {
  BillingCycle,
  CreatePackageInput,
  PackageStatus,
  RentalPackage,
} from '../../types/package.types'

type ViewMode = 'cards' | 'table'

const BILLING_CYCLE_OPTIONS = [
  { value: 'MONTHLY', label: 'Theo tháng' },
  { value: 'CROP_CYCLE', label: 'Theo vụ mùa' },
  { value: 'QUARTERLY', label: 'Theo quý' },
  { value: 'YEARLY', label: 'Theo năm' },
] satisfies Array<{ value: BillingCycle; label: string }>

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Đang kinh doanh' },
  { value: 'INACTIVE', label: 'Tạm ngưng' },
  { value: 'PROMOTION', label: 'Gói ưu đãi' },
] satisfies Array<{ value: PackageStatus; label: string }>

const PAGE_SIZE = 6

function canManagePackages(role: string | undefined) {
  const normalizedRole = role?.toUpperCase()

  return (
    normalizedRole === 'ADMIN' ||
    normalizedRole === 'OPERATOR' ||
    normalizedRole === 'FARM_MANAGER'
  )
}

export function PackageManagementPage() {
  const packages = usePackageStore((state) => state.packages)
  const addPackage = usePackageStore((state) => state.addPackage)
  const updatePackage = usePackageStore((state) => state.updatePackage)
  const togglePackageStatus = usePackageStore(
    (state) => state.togglePackageStatus,
  )
  const togglePackagePopular = usePackageStore(
    (state) => state.togglePackagePopular,
  )
  const deletePackage = usePackageStore((state) => state.deletePackage)
  const authRole = useAuthStore((state) => state.user?.role)
  const canManage = canManagePackages(authRole)

  const [searchText, setSearchText] = useState('')
  const [billingCycleFilter, setBillingCycleFilter] = useState<
    BillingCycle | undefined
  >()
  const [statusFilter, setStatusFilter] = useState<PackageStatus | undefined>()
  const [viewMode, setViewMode] = useState<ViewMode>('cards')
  const [currentPage, setCurrentPage] = useState(1)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingPackage, setEditingPackage] = useState<RentalPackage | null>(
    null,
  )

  const filteredPackages = useMemo(() => {
    const normalizedSearch = searchText.trim().toLowerCase()

    return packages.filter((rentalPackage) => {
      const isVisibleToCustomer =
        canManage || rentalPackage.status !== 'INACTIVE'
      const matchesSearch = normalizedSearch
        ? rentalPackage.name.toLowerCase().includes(normalizedSearch) ||
          rentalPackage.code.toLowerCase().includes(normalizedSearch)
        : true
      const matchesBillingCycle = billingCycleFilter
        ? rentalPackage.billingCycle === billingCycleFilter
        : true
      const matchesStatus = statusFilter
        ? rentalPackage.status === statusFilter
        : true

      return (
        isVisibleToCustomer &&
        matchesSearch &&
        matchesBillingCycle &&
        matchesStatus
      )
    })
  }, [billingCycleFilter, canManage, packages, searchText, statusFilter])

  const maxPage = Math.max(1, Math.ceil(filteredPackages.length / PAGE_SIZE))
  const visiblePage = Math.min(currentPage, maxPage)
  const visiblePackages = filteredPackages.slice(
    (visiblePage - 1) * PAGE_SIZE,
    visiblePage * PAGE_SIZE,
  )

  const handleAddPackage = () => {
    setEditingPackage(null)
    setIsFormOpen(true)
  }

  const handleEditPackage = (rentalPackage: RentalPackage) => {
    setEditingPackage(rentalPackage)
    setIsFormOpen(true)
  }

  const handleSubmit = async (values: CreatePackageInput) => {
    await new Promise((resolve) => window.setTimeout(resolve, 350))

    if (editingPackage) {
      updatePackage(editingPackage.id, values)
      message.success('Đã cập nhật gói cước.')
    } else {
      addPackage(values)
      message.success('Đã thêm gói cước mới.')
    }

    setIsFormOpen(false)
    setEditingPackage(null)
  }

  const handleToggleStatus = (rentalPackage: RentalPackage) => {
    togglePackageStatus(rentalPackage.id)
    message.success(
      rentalPackage.status === 'INACTIVE'
        ? 'Đã kích hoạt gói cước.'
        : 'Đã tạm ngưng gói cước.',
    )
  }

  const handleTogglePopular = (rentalPackage: RentalPackage) => {
    togglePackagePopular(rentalPackage.id)
    message.success(
      rentalPackage.isPopular
        ? 'Đã gỡ đánh dấu gói nổi bật.'
        : 'Đã đánh dấu gói nổi bật.',
    )
  }

  const handleDelete = (rentalPackage: RentalPackage) => {
    deletePackage(rentalPackage.id)
    message.success('Đã xóa gói cước.')
  }

  const handleSelect = (rentalPackage: RentalPackage) => {
    message.success(`Đã chọn ${rentalPackage.name}.`)
  }

  const resetFilters = () => {
    setSearchText('')
    setBillingCycleFilter(undefined)
    setStatusFilter(undefined)
    setCurrentPage(1)
  }

  return (
    <div>
      <Flex
        align="center"
        justify="space-between"
        gap={16}
        wrap
        style={{ marginBottom: 20 }}
      >
        <div>
          <Typography.Title level={3} style={{ margin: 0 }}>
            Gói cước thuê
          </Typography.Title>
          <Typography.Text type="secondary">
            So sánh và quản lý các gói thuê khay trồng thông minh
          </Typography.Text>
        </div>

        <Space wrap>
          <Segmented<ViewMode>
            value={viewMode}
            options={[
              { value: 'cards', icon: <AppstoreOutlined />, label: 'Thẻ' },
              { value: 'table', icon: <TableOutlined />, label: 'Bảng' },
            ]}
            onChange={setViewMode}
          />

          {canManage && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddPackage}
            >
              Thêm gói cước
            </Button>
          )}
        </Space>
      </Flex>

      <Flex gap={12} wrap style={{ marginBottom: 20 }}>
        <Input
          allowClear
          prefix={<SearchOutlined />}
          placeholder="Tìm theo tên hoặc mã gói"
          value={searchText}
          onChange={(event) => {
            setSearchText(event.target.value)
            setCurrentPage(1)
          }}
          style={{ width: 300, maxWidth: '100%' }}
        />

        <Select<BillingCycle>
          allowClear
          placeholder="Lọc theo chu kỳ"
          options={BILLING_CYCLE_OPTIONS}
          value={billingCycleFilter}
          onChange={(value) => {
            setBillingCycleFilter(value)
            setCurrentPage(1)
          }}
          style={{ width: 180 }}
        />

        <Select<PackageStatus>
          allowClear
          placeholder="Lọc theo trạng thái"
          options={STATUS_OPTIONS}
          value={statusFilter}
          onChange={(value) => {
            setStatusFilter(value)
            setCurrentPage(1)
          }}
          style={{ width: 180 }}
        />

        {(searchText || billingCycleFilter || statusFilter) && (
          <Button onClick={resetFilters}>Xóa bộ lọc</Button>
        )}
      </Flex>

      {visiblePackages.length === 0 ? (
        <Empty description="Không có gói cước phù hợp" />
      ) : viewMode === 'cards' ? (
        <Row gutter={[16, 16]}>
          {visiblePackages.map((rentalPackage) => (
            <Col key={rentalPackage.id} xs={24} md={12} xl={8}>
              <PackageCard
                rentalPackage={rentalPackage}
                canManage={canManage}
                onEdit={handleEditPackage}
                onDelete={handleDelete}
                onToggleStatus={handleToggleStatus}
                onTogglePopular={handleTogglePopular}
                onSelect={handleSelect}
              />
            </Col>
          ))}
        </Row>
      ) : (
        <PackageComparisonTable
          packages={visiblePackages}
          canManage={canManage}
          onEdit={handleEditPackage}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
          onTogglePopular={handleTogglePopular}
          onSelect={handleSelect}
        />
      )}

      {filteredPackages.length > PAGE_SIZE && (
        <Flex justify="flex-end" style={{ marginTop: 20 }}>
          <Pagination
            current={visiblePage}
            pageSize={PAGE_SIZE}
            total={filteredPackages.length}
            showSizeChanger={false}
            showTotal={(total) => `${total} gói cước`}
            onChange={setCurrentPage}
          />
        </Flex>
      )}

      {canManage && (
        <PackageFormModal
          open={isFormOpen}
          initialValues={
            editingPackage
              ? {
                  name: editingPackage.name,
                  code: editingPackage.code,
                  price: editingPackage.price,
                  billingCycle: editingPackage.billingCycle,
                  durationDays: editingPackage.durationDays,
                  maxTrays: editingPackage.maxTrays,
                  supportedMushrooms: [...editingPackage.supportedMushrooms],
                  features: [...editingPackage.features],
                  status: editingPackage.status,
                  isPopular: editingPackage.isPopular,
                }
              : undefined
          }
          onCancel={() => {
            setIsFormOpen(false)
            setEditingPackage(null)
          }}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  )
}
