import { CalculatorOutlined, WarningOutlined } from '@ant-design/icons'
import { Typography } from 'antd'
import type { TrayRental } from '../../../types/room.types'
import type { RentalLifecycleMetrics } from '../utils/tray-rental.utils'
import { formatVnd } from '../utils/tray-rental.utils'

interface RentalCostSectionProps {
  rental: TrayRental
  lifecycle: RentalLifecycleMetrics
}

export function RentalCostSection({
  rental,
  lifecycle,
}: RentalCostSectionProps) {
  return (
    <section
      className="tray-detail-section rental-cost-section"
      aria-labelledby="rental-cost-heading"
    >
      <div className="tray-section-heading">
        <span className="tray-section-icon" aria-hidden="true">
          <CalculatorOutlined />
        </span>
        <div>
          <Typography.Title id="rental-cost-heading" level={4}>
            Chi phí & phí phát sinh
          </Typography.Title>
          <Typography.Text type="secondary">
            Đối soát tạm tính đến hôm nay
          </Typography.Text>
        </div>
      </div>

      <dl className="rental-cost-breakdown">
        <div>
          <dt>Giá thuê gói ban đầu</dt>
          <dd>{formatVnd(rental.basePrice)}</dd>
        </div>

        {lifecycle.overdueDays > 0 && (
          <div className="overdue-fee-row">
            <dt>
              <WarningOutlined aria-hidden="true" />
              Phí quá hạn / chăm sóc bổ sung
              <small>
                {lifecycle.overdueDays} ngày ×{' '}
                {formatVnd(rental.dailyOverdueFee)}
              </small>
            </dt>
            <dd>+ {formatVnd(lifecycle.overdueFee)}</dd>
          </div>
        )}

        <div className="rental-total-row">
          <dt>Tổng thanh toán dự kiến</dt>
          <dd>{formatVnd(lifecycle.totalAmount)}</dd>
        </div>
      </dl>
    </section>
  )
}
