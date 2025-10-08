import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: "./",
  server: {
    allowedHosts: ['crocoda.qzz.io', 'crocoda-dev.vercel.app']
  }
})
