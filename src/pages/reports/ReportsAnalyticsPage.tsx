import dayjs from 'dayjs'
import { useMemo } from 'react'
import {
  BarChartOutlined,
  DownloadOutlined,
  LineChartOutlined,
  PieChartOutlined,
} from '@ant-design/icons'
import {
  Button,
  Card,
  Empty,
  Flex,
  Row,
  Space,
  Statistic,
  Tabs,
  Tag,
  Typography,
  message,
} from 'antd'
import { useAuthStore } from '../../features/auth/store/auth.store'
import { useTenantStore } from '../../features/tenants/store/tenant.store'
import {
  MOCK_ENVIRONMENT_HISTORY,
  MOCK_REVENUE_SUMMARIES,
  MOCK_YIELD_SUMMARIES,
  useAlertStore,
} from '../../stores/alert.store'
import { EnvironmentTrendChart } from './components/EnvironmentTrendChart'
import { MushroomYieldPieChart } from './components/MushroomYieldPieChart'
import { RevenueBarChart } from './components/RevenueBarChart'
import type {
  EnvironmentHistoryPoint,
  ReportPeriod,
  RevenueSummary,
  YieldSummary,
} from '../../types/alert.types'

const PERIOD_OPTIONS: Array<{ value: ReportPeriod; label: string }> = [
  { value: 'TODAY', label: 'Hôm nay' },
  { value: 'LAST_7_DAYS', label: '7 ngày qua' },
  { value: 'LAST_30_DAYS', label: '30 ngày qua' },
  { value: 'CURRENT_CROP', label: 'Vụ mùa này' },
]

function canManageReports(role: string | undefined) {
  const normalizedRole = role?.toUpperCase()

  return (
    normalizedRole === 'ADMIN' ||
    normalizedRole === 'OPERATOR' ||
    normalizedRole === 'FARM_MANAGER'
  )
}

function getPeriodDays(period: ReportPeriod) {
  switch (period) {
    case 'TODAY':
      return 1
    case 'LAST_7_DAYS':
      return 7
    case 'LAST_30_DAYS':
      return 30
    case 'CURRENT_CROP':
      return 120
  }
}

function filterHistoryByPeriod(
  data: EnvironmentHistoryPoint[],
  period: ReportPeriod,
) {
  const cutoff = dayjs().subtract(getPeriodDays(period) - 1, 'day').startOf('day')

  return data.filter((point) => {
    if (!point.date) {
      return true
    }

    return !dayjs(point.date).isBefore(cutoff)
  })
}

function createCsv(
  history: EnvironmentHistoryPoint[],
  yields: YieldSummary[],
  revenue: RevenueSummary[],
) {
  const lines = [
    ['BÁO CÁO MCMS'],
    [],
    ['LỊCH SỬ VI KHÍ HẬU'],
    ['Thời gian', 'Nhiệt độ (°C)', 'Độ ẩm (%RH)', 'CO₂ (ppm)', 'Độ ẩm giá thể (%)'],
    ...history.map((point) => [
      point.time,
      point.temperature,
      point.humidity,
      point.co2,
      point.soilMoisture,
    ]),
    [],
    ['SẢN LƯỢNG THEO CHẤT LƯỢNG'],
    ['Loại nấm', 'Grade A (kg)', 'Grade B (kg)', 'Hỏng (kg)', 'Tỷ lệ đạt (%)'],
    ...yields.map((item) => [
      item.cropType,
      item.gradeA_Kg,
      item.gradeB_Kg,
      item.spoiled_Kg,
      item.successRate,
    ]),
    [],
    ['DOANH THU'],
    ['Tháng', 'Doanh thu (VNĐ)', 'Lượt thuê', 'Gói phổ biến'],
    ...revenue.map((item) => [
      item.month,
      item.totalRevenue,
      item.rentalCount,
      item.popularPackage,
    ]),
  ]

  return `\uFEFF${lines
    .map((line) => line.map((value) => `"${String(value ?? '').replaceAll('"', '""')}"`).join(','))
    .join('\n')}`
}

export function ReportsAnalyticsPage() {
  const period = useAlertStore((state) => state.reportPeriod)
  const setPeriod = useAlertStore((state) => state.setReportPeriod)
  const authUser = useAuthStore((state) => state.user)
  const tenants = useTenantStore((state) => state.tenants)
  const canManage = canManageReports(authUser?.role)

  const customerTrayIds = useMemo(() => {
    if (!authUser) {
      return []
    }

    return tenants
      .filter((tenant) => tenant.name === authUser.name)
      .map((tenant) => tenant.assignedTrayId)
  }, [authUser, tenants])

  const reportData = useMemo(() => {
    const filteredHistory = filterHistoryByPeriod(
      MOCK_ENVIRONMENT_HISTORY,
      period,
    ).filter(
      (point) => canManage || (point.trayId && customerTrayIds.includes(point.trayId)),
    )
    const filteredYields = MOCK_YIELD_SUMMARIES.filter(
      (item) => canManage || (item.trayId && customerTrayIds.includes(item.trayId)),
    )

    return {
      history: filteredHistory,
      yields: filteredYields,
      revenue: canManage ? MOCK_REVENUE_SUMMARIES : [],
    }
  }, [canManage, customerTrayIds, period])

  const handleExportCsv = () => {
    const csv = createCsv(
      reportData.history,
      reportData.yields,
      reportData.revenue,
    )
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = `mcms-report-${period.toLowerCase()}-${dayjs().format('YYYYMMDD')}.csv`
    link.click()
    URL.revokeObjectURL(url)
    message.success('Đã xuất báo cáo CSV.')
  }

  const overviewContent = (
    <Row gutter={[16, 16]}>
      <div style={{ width: '100%' }}>
        <EnvironmentTrendChart data={reportData.history} />
      </div>
      <div style={{ width: '100%' }}>
        <Flex gap={16} wrap>
          <div style={{ flex: '1 1 420px', minWidth: 0 }}>
            <MushroomYieldPieChart data={reportData.yields} />
          </div>
          {canManage && (
            <div style={{ flex: '1 1 620px', minWidth: 0 }}>
              <RevenueBarChart data={reportData.revenue} />
            </div>
          )}
        </Flex>
      </div>
    </Row>
  )

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
            Báo cáo & Phân tích
          </Typography.Title>
          <Typography.Text type="secondary">
            Xu hướng vi khí hậu, chất lượng mùa vụ và doanh thu cho thuê khay
          </Typography.Text>
        </div>

        <Space wrap>
          <Tag color={canManage ? 'processing' : 'default'}>
            {canManage ? 'Toàn hệ thống' : 'Khay đang thuê'}
          </Tag>
          <Button icon={<DownloadOutlined />} onClick={handleExportCsv}>
            Xuất CSV
          </Button>
        </Space>
      </Flex>

      <Flex gap={8} wrap style={{ marginBottom: 20 }}>
        {PERIOD_OPTIONS.map((option) => (
          <Button
            key={option.value}
            type={period === option.value ? 'primary' : 'default'}
            onClick={() => setPeriod(option.value)}
          >
            {option.label}
          </Button>
        ))}
      </Flex>

      <Flex gap={12} wrap style={{ marginBottom: 20 }}>
        <Card size="small">
          <Statistic
            title="Điểm dữ liệu môi trường"
            value={reportData.history.length}
            prefix={<LineChartOutlined />}
          />
        </Card>
        <Card size="small">
          <Statistic
            title="Loại nấm trong báo cáo"
            value={reportData.yields.length}
            prefix={<PieChartOutlined />}
          />
        </Card>
        {canManage && (
          <Card size="small">
            <Statistic
              title="Tháng doanh thu"
              value={reportData.revenue.length}
              prefix={<BarChartOutlined />}
            />
          </Card>
        )}
      </Flex>

      <Tabs
        items={[
          {
            key: 'overview',
            label: 'Tổng quan',
            children: overviewContent,
          },
          {
            key: 'environment',
            label: 'Vi khí hậu',
            children:
              reportData.history.length > 0 ? (
                <EnvironmentTrendChart data={reportData.history} />
              ) : (
                <Empty description="Chưa có dữ liệu vi khí hậu" />
              ),
          },
          {
            key: 'business',
            label: 'Sản lượng & Doanh thu',
            children: (
              <Flex gap={16} wrap>
                <div style={{ flex: '1 1 420px', minWidth: 0 }}>
                  <MushroomYieldPieChart data={reportData.yields} />
                </div>
                {canManage && (
                  <div style={{ flex: '1 1 620px', minWidth: 0 }}>
                    <RevenueBarChart data={reportData.revenue} />
                  </div>
                )}
              </Flex>
            ),
          },
        ]}
      />
    </div>
  )
}
