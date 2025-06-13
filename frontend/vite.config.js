// vite.config.js (en la raíz de /frontend)
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(),  tailwindcss(),],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), 
    },
  },
})
