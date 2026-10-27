import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Firebase Hosting and Capacitor serve from "/". The GitHub Pages workflow
// sets VITE_BASE=/CureAid/ for its subpath build.
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE || '/',
  server: { host: true, port: 5173, strictPort: true },
  preview: { host: true, port: 4173, strictPort: true },
})
