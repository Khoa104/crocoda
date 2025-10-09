import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: "/",
  build: {
    outDir: 'dist'
  },
  server: {
    allowedHosts: ['crocoda.qzz.io', 'crocoda-dev.vercel.app', 'http://localhost:5173/']
  }
})
