import {
  AlertOutlined,
  ApiOutlined,
  AppstoreOutlined,
  BarChartOutlined,
  DashboardOutlined,
  FundOutlined,
  SettingOutlined,
  TagsOutlined,
  TeamOutlined,
  UserOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons'
import { Layout, Menu, Typography } from 'antd'
import type { MenuProps } from 'antd'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'

const { Content, Header, Sider } = Layout

const MENU_ITEMS: MenuProps['items'] = [
  {
    key: '/',
    icon: <DashboardOutlined />,
    label: 'Dashboard',
  },
  {
    key: '/rooms',
    icon: <AppstoreOutlined />,
    label: 'Quản lý khay',
  },
  {
    key: '/devices',
    icon: <ApiOutlined />,
    label: 'Thiết bị IoT',
  },
  {
    key: '/camera',
    icon: <VideoCameraOutlined />,
    label: 'Camera toàn cảnh',
  },
  {
    key: '/packages',
    icon: <TagsOutlined />,
    label: 'Gói cước thuê',
  },
  {
    key: '/cultivation',
    icon: <FundOutlined />,
    label: 'Sinh trưởng & Thu hoạch',
  },
  {
    key: '/alerts',
    icon: <AlertOutlined />,
    label: 'Cảnh báo vi khí hậu',
  },
  {
    key: '/reports',
    icon: <BarChartOutlined />,
    label: 'Báo cáo & Phân tích',
  },
  {
    key: '/customers',
    icon: <UserOutlined />,
    label: 'Quản lý khách thuê',
  },
  {
    key: '/users',
    icon: <TeamOutlined />,
    label: 'Quản lý tài khoản',
  },
  {
    key: '/settings',
    icon: <SettingOutlined />,
    label: 'Cài đặt hệ thống',
  },
]

function getSelectedMenuKey(pathname: string) {
  if (pathname.startsWith('/rooms') || pathname.startsWith('/trays')) {
    return '/rooms'
  }

  if (pathname.startsWith('/customers') || pathname.startsWith('/tenants')) {
    return '/customers'
  }

  const matchingPath = [
    '/devices',
    '/camera',
    '/packages',
    '/cultivation',
    '/alerts',
    '/reports',
    '/users',
    '/settings',
  ].find((path) => pathname.startsWith(path))

  return matchingPath ?? '/'
}

export function AdminLayout() {
  const location = useLocation()
  const navigate = useNavigate()

  const selectedMenuKey = getSelectedMenuKey(location.pathname)

  return (
    <Layout style={{ minHeight: '100dvh' }}>
      <Sider width={232} breakpoint="lg" collapsedWidth={0}>
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            padding: '0 24px',
            color: '#ffffff',
            fontSize: 20,
            fontWeight: 700,
          }}
        >
          MCMS Admin
        </div>

        <Menu
          theme="dark"
          mode="inline"
          items={MENU_ITEMS}
          selectedKeys={[selectedMenuKey]}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            padding: '0 24px',
            background: '#ffffff',
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          <Typography.Title level={4} style={{ margin: 0 }}>
            Hệ thống quản lý trang trại nấm
          </Typography.Title>
        </Header>

        <Content style={{ padding: 24, background: '#f5f7f8' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
