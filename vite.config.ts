import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Antd + icons là chunk vendor lớn (~1.3MB), nhưng đã tách riêng khỏi
    // app code; cache hit rất tốt vì hiếm khi thay đổi → không cảnh báo.
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        /**
         * Phân tách bundle thành các vendor chunks độc lập:
         * - Cải thiện FCP/TTI (parallel download, cache hit tốt hơn).
         * - Vendor thay đổi ít hơn app code → user chỉ tải lại chunk app.
         *
         * Dùng function form để tương thích Vite 8 (rolldown bundler).
         */
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined

          // Thư viện biểu đồ (nặng nhất) → chunk riêng
          if (id.includes('recharts')) return 'vendor-charts'

          // UI framework + icons
          if (
            id.includes('/antd/') ||
            id.includes('@ant-design/icons')
          ) {
            return 'vendor-antd'
          }

          // Data layer: state, server-state, date, http
          if (
            id.includes('zustand') ||
            id.includes('@tanstack') ||
            id.includes('/dayjs/') ||
            id.includes('/axios/')
          ) {
            return 'vendor-data'
          }

          // React core + router
          if (
            id.includes('/react/') ||
            id.includes('/react-dom/') ||
            id.includes('/react-router')
          ) {
            return 'vendor-react'
          }

          return undefined
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
})
