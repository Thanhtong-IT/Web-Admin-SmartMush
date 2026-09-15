import {
  CheckCircleFilled,
  CloudOutlined,
  FireOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { LoginForm } from '../components/LoginForm'

export function LoginPage() {
  const navigate = useNavigate()

  const handleLoginSuccess = () => {
    navigate('/', { replace: true })
  }

  return (
    <main className="login-page">
      <section className="login-brand-panel" aria-labelledby="login-brand-title">
        <div className="login-brand-lockup">
          <img
            className="login-brand-mark"
            src="/mcms-mark.svg"
            alt=""
            width="46"
            height="46"
          />
          <span>
            <strong>MCMS</strong>
            <small>Mushroom Cultivation Management System</small>
          </span>
        </div>

        <div className="login-brand-content">
          <span className="login-eyebrow">QUẢN LÝ TRANG TRẠI IOT</span>
          <h1 id="login-brand-title">
            Môi trường tối ưu,
            <br />
            mùa vụ bền vững.
          </h1>
          <p>
            Một không gian điều hành tập trung cho toàn bộ trang trại nấm.
          </p>

          <div className="login-status-panel" role="status">
            <div className="login-status-heading">
              <span>
                <CheckCircleFilled aria-hidden="true" />
                Môi trường ổn định
              </span>
              <small>4 tầng đang kết nối</small>
            </div>
            <div className="login-status-metrics">
              <div>
                <FireOutlined aria-hidden="true" />
                <span>
                  <strong>25,6°C</strong>
                  <small>Nhiệt độ</small>
                </span>
              </div>
              <div>
                <CloudOutlined aria-hidden="true" />
                <span>
                  <strong>87%</strong>
                  <small>Độ ẩm</small>
                </span>
              </div>
              <div>
                <SafetyCertificateOutlined aria-hidden="true" />
                <span>
                  <strong>An toàn</strong>
                  <small>Trạng thái</small>
                </span>
              </div>
            </div>
          </div>
        </div>

        <span className="login-copyright">© 2026 MCMS · Smart Farm Platform</span>
      </section>

      <section className="login-form-panel" aria-label="Đăng nhập hệ thống">
        <LoginForm onSuccess={handleLoginSuccess} />
      </section>
    </main>
  )
}
