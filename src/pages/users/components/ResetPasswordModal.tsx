import { useState } from 'react'
import { CopyOutlined, KeyOutlined } from '@ant-design/icons'
import { Alert, Button, Input, Modal, Space, Typography, message } from 'antd'
import type { User } from '../../../types/user.types'

interface ResetPasswordModalProps {
  open: boolean
  user: User | null
  onCancel: () => void
  onReset: (userId: string) => Promise<string>
}

export function ResetPasswordModal({
  open,
  user,
  onCancel,
  onReset,
}: ResetPasswordModalProps) {
  const [temporaryPassword, setTemporaryPassword] = useState<string | null>(
    null,
  )
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleReset = async () => {
    if (!user) {
      return
    }

    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      const password = await onReset(user.id)
      setTemporaryPassword(password)
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Không thể đặt lại mật khẩu. Vui lòng thử lại.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCopy = async () => {
    if (!temporaryPassword) {
      return
    }

    try {
      await navigator.clipboard.writeText(temporaryPassword)
      message.success('Đã sao chép mật khẩu tạm thời.')
    } catch {
      message.error('Không thể sao chép. Hãy chọn và sao chép thủ công.')
    }
  }

  const handleCancel = () => {
    setTemporaryPassword(null)
    setErrorMessage(null)
    onCancel()
  }

  return (
    <Modal
      title="Đặt lại mật khẩu"
      open={open}
      onCancel={handleCancel}
      footer={
        temporaryPassword
          ? [
                <Button key="close" onClick={handleCancel}>
                Đóng
              </Button>,
            ]
          : [
              <Button
                key="cancel"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Hủy
              </Button>,
              <Button
                key="reset"
                type="primary"
                icon={<KeyOutlined />}
                loading={isSubmitting}
                onClick={() => void handleReset()}
              >
                Tạo mật khẩu tạm
              </Button>,
            ]
      }
      closable={!isSubmitting}
      maskClosable={!isSubmitting}
      keyboard={!isSubmitting}
      destroyOnHidden
    >
      {user && !temporaryPassword && (
        <Typography.Paragraph>
          Tạo mật khẩu tạm thời mới cho tài khoản <strong>{user.username}</strong>?
        </Typography.Paragraph>
      )}

      {errorMessage && (
        <Alert
          type="error"
          showIcon
          message={errorMessage}
          style={{ marginBottom: 16 }}
        />
      )}

      {temporaryPassword && (
        <Space direction="vertical" size={12} style={{ width: '100%' }}>
          <Alert
            type="success"
            showIcon
            message="Mật khẩu tạm thời đã được tạo"
            description="Hãy gửi mã này cho người dùng và yêu cầu đổi mật khẩu sau khi đăng nhập."
          />
          <Input
            value={temporaryPassword}
            readOnly
            addonAfter={
              <Button
                type="text"
                icon={<CopyOutlined />}
                onClick={() => void handleCopy()}
                aria-label="Sao chép mật khẩu tạm thời"
              />
            }
          />
        </Space>
      )}
    </Modal>
  )
}
