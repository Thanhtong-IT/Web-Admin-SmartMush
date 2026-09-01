import { useState } from 'react'
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Form,
  Input,
  Typography,
} from 'antd'
import { useAuthStore } from '../store/auth.store'
import type { LoginCredentials } from '../types/auth.types'

interface LoginFormProps {
  onSuccess?: () => void
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const login = useAuthStore((state) => state.login)
  const rememberedEmail = useAuthStore((state) => state.rememberedEmail)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (credentials: LoginCredentials) => {
    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      await login(credentials)
      onSuccess?.()
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Không thể đăng nhập. Vui lòng thử lại.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card
      variant="outlined"
      styles={{ body: { padding: 32 } }}
      style={{ borderRadius: 8, boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)' }}
    >
      <Typography.Title level={2} style={{ margin: '0 0 8px', fontSize: 24 }}>
        Đăng nhập MCMS
      </Typography.Title>
      <Typography.Paragraph type="secondary" style={{ marginBottom: 24 }}>
        Truy cập hệ thống quản lý trang trại nấm
      </Typography.Paragraph>

      {errorMessage && (
        <Alert
          type="error"
          message={errorMessage}
          showIcon
          style={{ marginBottom: 20 }}
        />
      )}

      <Form<LoginCredentials>
        layout="vertical"
        requiredMark={false}
        initialValues={{
          email: rememberedEmail,
          rememberMe: Boolean(rememberedEmail),
        }}
        onFinish={handleSubmit}
      >
        <Form.Item<LoginCredentials>
          label="Email"
          name="email"
          rules={[
            { required: true, message: 'Vui lòng nhập email.' },
            { type: 'email', message: 'Email không đúng định dạng.' },
          ]}
        >
          <Input
            type="email"
            autoComplete="email"
            placeholder="admin@mcms.vn"
            size="large"
          />
        </Form.Item>

        <Form.Item<LoginCredentials>
          label="Mật khẩu"
          name="password"
          rules={[{ required: true, message: 'Vui lòng nhập mật khẩu.' }]}
        >
          <Input.Password
            autoComplete="current-password"
            placeholder="Nhập mật khẩu"
            size="large"
          />
        </Form.Item>

        <Form.Item<LoginCredentials>
          name="rememberMe"
          valuePropName="checked"
          style={{ marginBottom: 20 }}
        >
          <Checkbox>Ghi nhớ đăng nhập</Checkbox>
        </Form.Item>

        <Button
          type="primary"
          htmlType="submit"
          size="large"
          block
          loading={isSubmitting}
        >
          Đăng nhập
        </Button>
      </Form>
    </Card>
  )
}
