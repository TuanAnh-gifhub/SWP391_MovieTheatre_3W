import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


export default defineConfig({
  plugins: [react()],
  define: {
    global: {},
  },
  server: {
    host: true,
    allowedHosts: ['.trycloudflare.com'], // cho phép Cloudflare tunnel
    proxy: {
      '/api': {
        target: 'http://localhost:8080', 
        changeOrigin: true,
        secure: false , // bỏ kiểm tra SSL (vì dùng HTTPS với trycloudflare)
      },
    },
  },
})