import { LockOutlined, MailOutlined } from '@ant-design/icons'
import { Alert, Button, Card, Checkbox, Form, Input, Typography } from 'antd'
import { useState } from 'react'
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
    <Card className="login-card" variant="outlined">
      <div className="login-mobile-brand" aria-hidden="true">
        <img src="/mcms-mark.svg" alt="" width="38" height="38" />
        <strong>MCMS</strong>
      </div>
      <span className="login-form-kicker">CHÀO MỪNG TRỞ LẠI</span>
      <Typography.Title level={2}>Đăng nhập quản trị</Typography.Title>
      <Typography.Paragraph>
        Sử dụng tài khoản được cấp để tiếp tục vào hệ thống.
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
        className="login-form"
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
            prefix={<MailOutlined aria-hidden="true" />}
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
            prefix={<LockOutlined aria-hidden="true" />}
            size="large"
          />
        </Form.Item>

        <Form.Item<LoginCredentials>
          name="rememberMe"
          valuePropName="checked"
          className="login-remember-row"
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

      <div className="login-security-note">
        <LockOutlined aria-hidden="true" />
        Phiên đăng nhập được bảo vệ và tự động xác thực.
      </div>
    </Card>
  )
}
