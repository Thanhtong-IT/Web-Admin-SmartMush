import { useMemo, useState } from 'react'
import {
  FilterOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import {
  Button,
  Empty,
  Flex,
  Input,
  Pagination,
  Select,
  Tag,
  Typography,
  message,
} from 'antd'
import { useAuthStore } from '../../features/auth/store/auth.store'
import { useCultivationStore } from '../../stores/cultivation.store'
import { CultivationBatchCard } from './components/CultivationBatchCard'
import { CultivationLogModal } from './components/CultivationLogModal'
import { HarvestScheduleModal } from './components/HarvestScheduleModal'
import type {
  CultivationBatch,
  CultivationLogInput,
  GrowthStage,
  HarvestScheduleInput,
  MushroomQuality,
  RecordHarvestInput,
} from '../../types/cultivation.types'

const STAGE_OPTIONS = [
  { value: 'INCUBATION', label: 'Ủ tơ / Nuôi sợi' },
  { value: 'PINNING', label: 'Kích nụ / Ra ghim' },
  { value: 'FRUITING', label: 'Phát triển thể quả' },
  { value: 'READY_TO_HARVEST', label: 'Sẵn sàng thu hoạch' },
  { value: 'HARVESTED', label: 'Đã thu hoạch' },
] satisfies Array<{ value: GrowthStage; label: string }>

const QUALITY_OPTIONS = [
  { value: 'GRADE_A', label: 'Grade A' },
  { value: 'GRADE_B', label: 'Grade B' },
  { value: 'WARNING_CONTAMINATED', label: 'Cần xử lý sâu bệnh/mốc' },
] satisfies Array<{ value: MushroomQuality; label: string }>

const PAGE_SIZE = 4

function canManageCultivation(role: string | undefined) {
  const normalizedRole = role?.toUpperCase()

  return (
    normalizedRole === 'ADMIN' ||
    normalizedRole === 'OPERATOR' ||
    normalizedRole === 'FARM_MANAGER'
  )
}

export function CultivationManagementPage() {
  const batches = useCultivationStore((state) => state.batches)
  const advanceStage = useCultivationStore((state) => state.advanceStage)
  const addLog = useCultivationStore((state) => state.addLog)
  const scheduleHarvest = useCultivationStore(
    (state) => state.scheduleHarvest,
  )
  const recordHarvest = useCultivationStore((state) => state.recordHarvest)
  const markContaminated = useCultivationStore(
    (state) => state.markContaminated,
  )
  const authUser = useAuthStore((state) => state.user)
  const canManage = canManageCultivation(authUser?.role)

  const [searchText, setSearchText] = useState('')
  const [stageFilter, setStageFilter] = useState<GrowthStage | undefined>()
  const [mushroomFilter, setMushroomFilter] = useState<string | undefined>()
  const [qualityFilter, setQualityFilter] = useState<
    MushroomQuality | undefined
  >()
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedBatch, setSelectedBatch] = useState<CultivationBatch | null>(
    null,
  )
  const [isLogModalOpen, setIsLogModalOpen] = useState(false)
  const [isHarvestModalOpen, setIsHarvestModalOpen] = useState(false)
  const [harvestModalMode, setHarvestModalMode] = useState<
    'schedule' | 'record'
  >('schedule')

  const mushroomOptions = useMemo(
    () =>
      [...new Set(batches.map((batch) => batch.mushroomType))].map((type) => ({
        value: type,
        label: type,
      })),
    [batches],
  )

  const filteredBatches = useMemo(() => {
    const normalizedSearch = searchText.trim().toLowerCase()

    return batches.filter((batch) => {
      const isVisibleToCustomer =
        canManage || batch.tenantName === authUser?.name
      const matchesSearch = normalizedSearch
        ? [batch.batchCode, batch.trayId, batch.trayName].some((value) =>
            value.toLowerCase().includes(normalizedSearch),
          )
        : true
      const matchesStage = stageFilter
        ? batch.currentStage === stageFilter
        : true
      const matchesMushroom = mushroomFilter
        ? batch.mushroomType === mushroomFilter
        : true
      const matchesQuality = qualityFilter
        ? batch.healthStatus === qualityFilter
        : true

      return (
        isVisibleToCustomer &&
        matchesSearch &&
        matchesStage &&
        matchesMushroom &&
        matchesQuality
      )
    })
  }, [authUser?.name, batches, canManage, mushroomFilter, qualityFilter, searchText, stageFilter])

  const maxPage = Math.max(1, Math.ceil(filteredBatches.length / PAGE_SIZE))
  const visiblePage = Math.min(currentPage, maxPage)
  const visibleBatches = filteredBatches.slice(
    (visiblePage - 1) * PAGE_SIZE,
    visiblePage * PAGE_SIZE,
  )

  const handleAdvanceStage = (batch: CultivationBatch) => {
    advanceStage(batch.id)
    message.success(`Đã chuyển giai đoạn cho ${batch.batchCode}.`)
  }

  const handleOpenLog = (batch: CultivationBatch) => {
    setSelectedBatch(batch)
    setIsLogModalOpen(true)
  }

  const handleOpenHarvest = (
    batch: CultivationBatch,
    mode: 'schedule' | 'record',
  ) => {
    setSelectedBatch(batch)
    setHarvestModalMode(mode)
    setIsHarvestModalOpen(true)
  }

  const handleLogSubmit = async (values: CultivationLogInput) => {
    if (!selectedBatch) {
      return
    }

    await new Promise((resolve) => window.setTimeout(resolve, 250))
    addLog(selectedBatch.id, values)
    setIsLogModalOpen(false)
    setSelectedBatch(null)
    message.success('Đã thêm nhật ký chăm sóc.')
  }

  const handleSchedule = async (values: HarvestScheduleInput) => {
    if (!selectedBatch) {
      return
    }

    await new Promise((resolve) => window.setTimeout(resolve, 250))
    scheduleHarvest(selectedBatch.id, values)
    setIsHarvestModalOpen(false)
    setSelectedBatch(null)
    message.success('Đã cập nhật lịch thu hoạch.')
  }

  const handleRecord = async (values: RecordHarvestInput) => {
    if (!selectedBatch) {
      return
    }

    await new Promise((resolve) => window.setTimeout(resolve, 250))
    recordHarvest(selectedBatch.id, values)
    setIsHarvestModalOpen(false)
    setSelectedBatch(null)
    message.success('Đã ghi nhận hoàn tất thu hoạch.')
  }

  const handleMarkContaminated = (batch: CultivationBatch) => {
    markContaminated(batch.id)
    message.warning(`Đã đánh dấu cảnh báo cho ${batch.batchCode}.`)
  }

  const resetFilters = () => {
    setSearchText('')
    setStageFilter(undefined)
    setMushroomFilter(undefined)
    setQualityFilter(undefined)
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
            Tiến trình sinh trưởng & Thu hoạch
          </Typography.Title>
          <Typography.Text type="secondary">
            Theo dõi vòng đời, nhật ký chăm sóc và sản lượng từng mẻ nấm
          </Typography.Text>
        </div>

        <Tag icon={<FilterOutlined />} color={canManage ? 'processing' : 'default'}>
          {canManage ? 'Toàn quyền vận hành' : 'Chỉ xem mẻ của bạn'}
        </Tag>
      </Flex>

      <Flex gap={12} wrap style={{ marginBottom: 20 }}>
        <Input
          allowClear
          prefix={<SearchOutlined />}
          placeholder="Tìm mã mẻ, mã khay hoặc tên khay"
          value={searchText}
          onChange={(event) => {
            setSearchText(event.target.value)
            setCurrentPage(1)
          }}
          style={{ width: 320, maxWidth: '100%' }}
        />

        <Select<GrowthStage>
          allowClear
          placeholder="Lọc theo giai đoạn"
          options={STAGE_OPTIONS}
          value={stageFilter}
          onChange={(value) => {
            setStageFilter(value)
            setCurrentPage(1)
          }}
          style={{ width: 190 }}
        />

        <Select
          allowClear
          placeholder="Lọc theo loại nấm"
          options={mushroomOptions}
          value={mushroomFilter}
          onChange={(value: string | undefined) => {
            setMushroomFilter(value)
            setCurrentPage(1)
          }}
          style={{ width: 190 }}
        />

        <Select<MushroomQuality>
          allowClear
          placeholder="Lọc theo sức khỏe"
          options={QUALITY_OPTIONS}
          value={qualityFilter}
          onChange={(value) => {
            setQualityFilter(value)
            setCurrentPage(1)
          }}
          style={{ width: 190 }}
        />

        {(searchText || stageFilter || mushroomFilter || qualityFilter) && (
          <Button onClick={resetFilters}>Xóa bộ lọc</Button>
        )}
      </Flex>

      {visibleBatches.length === 0 ? (
        <Empty description="Không có mẻ nấm phù hợp" />
      ) : (
        <Flex vertical gap={20}>
          {visibleBatches.map((batch) => (
            <CultivationBatchCard
              key={batch.id}
              batch={batch}
              canManage={canManage}
              onAdvanceStage={handleAdvanceStage}
              onAddLog={handleOpenLog}
              onScheduleHarvest={(selected) =>
                handleOpenHarvest(selected, 'schedule')
              }
              onRecordHarvest={(selected) =>
                handleOpenHarvest(selected, 'record')
              }
              onMarkContaminated={handleMarkContaminated}
            />
          ))}
        </Flex>
      )}

      {filteredBatches.length > PAGE_SIZE && (
        <Flex justify="flex-end" style={{ marginTop: 20 }}>
          <Pagination
            current={visiblePage}
            pageSize={PAGE_SIZE}
            total={filteredBatches.length}
            showSizeChanger={false}
            showTotal={(total) => `${total} mẻ nấm`}
            onChange={setCurrentPage}
          />
        </Flex>
      )}

      {canManage && (
        <>
          <CultivationLogModal
            open={isLogModalOpen}
            batch={selectedBatch}
            onCancel={() => {
              setIsLogModalOpen(false)
              setSelectedBatch(null)
            }}
            onSubmit={handleLogSubmit}
          />

          <HarvestScheduleModal
            open={isHarvestModalOpen}
            mode={harvestModalMode}
            batch={selectedBatch}
            onCancel={() => {
              setIsHarvestModalOpen(false)
              setSelectedBatch(null)
            }}
            onSchedule={handleSchedule}
            onRecord={handleRecord}
          />
        </>
      )}
    </div>
  )
}
