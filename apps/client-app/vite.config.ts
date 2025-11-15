import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@core': path.resolve(__dirname, './core'),
    },
  },
  server: {
    // Expose server on all network interfaces so local browsers can connect.
    // Use `--host` behavior: host:true binds to 0.0.0.0
    host: true,
    port: 5173,
    middlewareMode: false,
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 5173,
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  }
})
