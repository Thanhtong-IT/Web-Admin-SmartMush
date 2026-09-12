import { useState } from 'react'
import { PlusOutlined } from '@ant-design/icons'
import { Button, Flex, Typography, message } from 'antd'
import { TenantForm } from '../components/TenantForm'
import { TenantTable } from '../components/TenantTable'
import { useTenantStore } from '../store/tenant.store'
import type { Tenant, TenantFormValues } from '../types/tenant.types'

export function TenantListPage() {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null)
  const addTenant = useTenantStore((state) => state.addTenant)
  const updateTenant = useTenantStore((state) => state.updateTenant)

  const handleAddTenant = () => {
    setEditingTenant(null)
    setIsModalVisible(true)
  }

  const handleEditTenant = (tenant: Tenant) => {
    setEditingTenant(tenant)
    setIsModalVisible(true)
  }

  const handleSubmit = async (values: TenantFormValues) => {
    await new Promise((resolve) => window.setTimeout(resolve, 500))

    if (editingTenant) {
      updateTenant(editingTenant.id, values)
      message.success('Đã cập nhật khách thuê và khay được gán.')
    } else {
      addTenant(values)
      message.success('Đã thêm khách thuê và gán khay.')
    }

    setIsModalVisible(false)
    setEditingTenant(null)
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
        <Typography.Title level={3} style={{ margin: 0 }}>
          Khách thuê khay
        </Typography.Title>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddTenant}
        >
          Thêm khách thuê mới
        </Button>
      </Flex>

      <TenantTable onEdit={handleEditTenant} />

      <TenantForm
        visible={isModalVisible}
        initialValues={editingTenant ?? undefined}
        editingCustomerId={editingTenant?.id}
        onCancel={() => {
          setIsModalVisible(false)
          setEditingTenant(null)
        }}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
