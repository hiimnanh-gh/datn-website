import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// Force Vite restart
export default defineConfig({
  plugins: [react()],
})
