import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    proxy: {
      // Todas las llamadas a /api se redirigen al BFF dentro de Docker
      '/api': {
        target: 'http://bff:4000',
        changeOrigin: true,
      }
    }
  }
})
