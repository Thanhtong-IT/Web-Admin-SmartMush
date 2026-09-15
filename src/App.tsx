import { ConfigProvider } from 'antd'
import viVN from 'antd/locale/vi_VN'
import { RouterProvider } from 'react-router-dom'
import { router } from './app/router'
import { mcmsTheme } from './app/theme/theme'
import './App.css'

function App() {
  return (
    <ConfigProvider locale={viVN} theme={mcmsTheme}>
      <RouterProvider router={router} />
    </ConfigProvider>
  )
}

export default App
