import { Flex } from 'antd'
import { useNavigate } from 'react-router-dom'
import { LoginForm } from '../components/LoginForm'

export function LoginPage() {
  const navigate = useNavigate()

  const handleLoginSuccess = () => {
    navigate('/', { replace: true })
  }

  return (
    <Flex
      align="center"
      justify="center"
      style={{ minHeight: '100dvh', padding: 24, background: '#f5f7f8' }}
    >
      <div style={{ width: '100%', maxWidth: 400 }}>
        <LoginForm onSuccess={handleLoginSuccess} />
      </div>
    </Flex>
  )
}
