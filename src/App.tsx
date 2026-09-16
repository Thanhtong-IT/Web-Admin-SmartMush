import { App as AntdApp, ConfigProvider } from 'antd'
import viVN from 'antd/locale/vi_VN'
import { RouterProvider } from 'react-router-dom'
import { router } from './app/router'
import { mcmsTheme } from './app/theme/theme'
import './App.css'

function App() {
  return (
    <ConfigProvider locale={viVN} theme={mcmsTheme}>
      <AntdApp>
        <RouterProvider router={router} />
      </AntdApp>
    </ConfigProvider>
  )
}

export default App
