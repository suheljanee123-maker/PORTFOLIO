import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/artstation-api': {
        target: 'https://www.artstation.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/artstation-api/, ''),
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'en-US,en;q=0.9',
          'Referer': 'https://www.artstation.com/',
          'Origin': 'https://www.artstation.com',
        },
      },
    },
  },
})

