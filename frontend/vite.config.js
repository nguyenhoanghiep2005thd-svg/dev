import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // Dev local: proxy /api → Django
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  // Production build: VITE_API_URL inject lúc build
  // Nếu không có VITE_API_URL → dùng '' (relative, hoạt động với nginx proxy)
  define: {
    __API_BASE__: JSON.stringify(process.env.VITE_API_URL || ''),
  },
})
