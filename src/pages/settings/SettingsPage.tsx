import { useMemo, useState } from 'react'
import { SettingOutlined } from '@ant-design/icons'
import { Flex, Tabs, Tag, Typography, message } from 'antd'
import { useAuthStore } from '../../features/auth/store/auth.store'
import { useRoomStore } from '../../features/rooms/store/room.store'
import { useTenantStore } from '../../features/tenants/store/tenant.store'
import { useSettingStore } from '../../stores/setting.store'
import { NotificationConfigTab } from './components/NotificationConfigTab'
import { SystemConfigTab } from './components/SystemConfigTab'
import { ThresholdProfileModal } from './components/ThresholdProfileModal'
import { ThresholdProfileTab } from './components/ThresholdProfileTab'
import type {
  MushroomThresholdProfile,
  ThresholdProfileInput,
} from '../../types/setting.types'

function normalizeRole(role: string | undefined) {
  const normalizedRole = role?.toUpperCase()

  return normalizedRole === 'FARM_MANAGER' ? 'OPERATOR' : normalizedRole
}

export function SettingsPage() {
  const authUser = useAuthStore((state) => state.user)
  const trays = useRoomStore((state) => state.trays)
  const tenants = useTenantStore((state) => state.tenants)
  const addProfile = useSettingStore((state) => state.addThresholdProfile)
  const updateProfile = useSettingStore(
    (state) => state.updateThresholdProfile,
  )

  const role = normalizeRole(authUser?.role)
  const isAdmin = role === 'ADMIN'
  const canEditThresholds = isAdmin || role === 'OPERATOR'
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [editingProfile, setEditingProfile] =
    useState<MushroomThresholdProfile | null>(null)

  const visibleMushroomTypes = useMemo(() => {
    if (!authUser || role !== 'CUSTOMER') {
      return undefined
    }

    const assignedTrayIds = tenants
      .filter((tenant) => tenant.name === authUser.name)
      .map((tenant) => tenant.assignedTrayId)

    return trays
      .filter((tray) => assignedTrayIds.includes(tray.id))
      .map((tray) => tray.mushroomType)
  }, [authUser, role, tenants, trays])

  const handleAddProfile = () => {
    setEditingProfile(null)
    setIsProfileModalOpen(true)
  }

  const handleEditProfile = (profile: MushroomThresholdProfile) => {
    setEditingProfile(profile)
    setIsProfileModalOpen(true)
  }

  const handleProfileSubmit = async (values: ThresholdProfileInput) => {
    await new Promise((resolve) => window.setTimeout(resolve, 300))

    if (editingProfile) {
      updateProfile(editingProfile.id, values)
      message.success('Đã cập nhật profile ngưỡng vi khí hậu.')
    } else {
      addProfile(values)
      message.success('Đã thêm profile giống nấm.')
    }

    setIsProfileModalOpen(false)
    setEditingProfile(null)
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
            Cài đặt hệ thống
          </Typography.Title>
          <Typography.Text type="secondary">
            Quản lý ngưỡng vi khí hậu, kết nối IoT và kênh thông báo
          </Typography.Text>
        </div>

        <Tag icon={<SettingOutlined />} color={isAdmin ? 'processing' : 'default'}>
          {isAdmin
            ? 'ADMIN · Toàn quyền'
            : role === 'OPERATOR'
              ? 'OPERATOR · Chỉnh ngưỡng'
              : 'CUSTOMER · Chỉ xem'}
        </Tag>
      </Flex>

      <Tabs
        items={[
          {
            key: 'thresholds',
            label: 'Ngưỡng Vi khí hậu',
            children: (
              <ThresholdProfileTab
                canEdit={canEditThresholds}
                visibleMushroomTypes={visibleMushroomTypes}
                onAdd={handleAddProfile}
                onEdit={handleEditProfile}
              />
            ),
          },
          {
            key: 'system',
            label: 'Cấu hình Thiết bị & IoT',
            children: <SystemConfigTab canEdit={isAdmin} />,
          },
          {
            key: 'notifications',
            label: 'Kênh Thông báo',
            children: <NotificationConfigTab canEdit={isAdmin} />,
          },
        ]}
      />

      {canEditThresholds && (
        <ThresholdProfileModal
          open={isProfileModalOpen}
          initialValues={editingProfile ?? undefined}
          onCancel={() => {
            setIsProfileModalOpen(false)
            setEditingProfile(null)
          }}
          onSubmit={handleProfileSubmit}
        />
      )}
    </div>
  )
}
