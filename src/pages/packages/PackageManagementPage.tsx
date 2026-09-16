import {
  DollarOutlined,
  TagsOutlined,
} from '@ant-design/icons'
import {
  Space,
  Tag,
  Typography,
} from 'antd'
import { useAuthStore } from '../../features/auth/store/auth.store'
import { ServiceFeeSettings } from './components/ServiceFeeSettings'
import { MushroomVarietyCatalog } from './components/MushroomVarietyCatalog'

function canManagePackages(role: string | undefined) {
  const normalizedRole = role?.toUpperCase()
  return (
    normalizedRole === 'ADMIN' ||
    normalizedRole === 'OPERATOR' ||
    normalizedRole === 'FARM_MANAGER'
  )
}

export function PackageManagementPage() {
  const authRole = useAuthStore((state) => state.user?.role)
  const canManage = canManagePackages(authRole)

  return (
    <div>
      <Space
        align="center"
        style={{
          marginBottom: 20,
          width: '100%',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <Typography.Title level={3} style={{ margin: 0 }}>
            <TagsOutlined /> Cấu hình Bảng giá & Dịch vụ Thuê
          </Typography.Title>
          <Typography.Text type="secondary">
            Phí dịch vụ chung và bảng giá từng giống nấm — đồng bộ trực tiếp với App đặt thuê.
          </Typography.Text>
        </div>

        <Tag color="success" style={{ fontSize: 13, padding: '4px 12px' }}>
          <DollarOutlined /> Công thức: (Phí DV × tuần + Phôi) × số khay + Ship
        </Tag>
      </Space>

      <Space direction="vertical" size={20} style={{ width: '100%' }}>
        <ServiceFeeSettings />

        <div
          style={{
            background: '#fff',
            border: '1px solid #f0f0f0',
            borderRadius: 12,
            padding: 20,
          }}
        >
          <MushroomVarietyCatalog canManage={canManage} />
        </div>
      </Space>
    </div>
  )
}
