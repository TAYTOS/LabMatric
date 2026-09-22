import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  server: { host: '0.0.0.0' },
  plugins: [react(), VitePWA({
    registerType: 'prompt',
    includeAssets: ['icons/*.png', 'icons/*.svg'],
    manifest: {
      id: '/',
      name: 'LabMatric - Matrícula de laboratorios',
      short_name: 'LabMatric',
      description: 'Organiza grupos de laboratorio, horarios y matrículas desde tu dispositivo.',
      lang: 'es-PE',
      start_url: '/',
      scope: '/',
      display: 'standalone',
      background_color: '#F4F7FB',
      theme_color: '#0F766E',
      categories: ['education'],
      shortcuts: [
        { name: 'Mis matrículas', short_name: 'Matrículas', description: 'Consulta tus matrículas activas', url: '/matriculas' },
        { name: 'Horario semanal', short_name: 'Horario', description: 'Consulta tu calendario de laboratorios', url: '/calendario' },
      ],
      icons: [
        { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
        { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
        { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,png,svg,woff2}'],
      navigateFallback: '/index.html',
      cleanupOutdatedCaches: true,
      clientsClaim: true,
    },
    devOptions: { enabled: true, navigateFallback: '/', suppressWarnings: true },
  })],
})
