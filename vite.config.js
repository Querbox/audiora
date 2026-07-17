import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Auf GitHub Pages liegt die App unter /audiora/, lokal unter /
export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/audiora/' : '/',
  plugins: [react()],
  server: { port: 5180 },
}))
