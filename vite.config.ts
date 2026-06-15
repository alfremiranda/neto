import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/finanzas-amd/',
  plugins: [react()],
  resolve: {
    // Vite 8: native TypeScript path alias support
    tsconfigPaths: true,
  },
})
