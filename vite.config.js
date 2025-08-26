import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/twse': {
        target: 'https://openapi.twse.com.tw',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/twse/, ''),
      },
    },
  },
})