import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'), // landing en /
        app:  resolve(__dirname, 'app.html'),   // React en /app
      }
    }
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    watch: {
      usePolling: true,
      interval: 300,
    },
    proxy: {
      // Llamadas a la API
      '/api': {
        target: 'http://bff:4000',
        changeOrigin: true,
      },
      // Archivos de evidencias subidos al BFF
      '/uploads': {
        target: 'http://bff:4000',
        changeOrigin: true,
      }
    }
  }
})