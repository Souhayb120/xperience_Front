import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The front calls "/api/..." and Vite forwards it to the Spring Boot backend.
// So the browser never talks to another origin (no CORS problem in dev).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
})
