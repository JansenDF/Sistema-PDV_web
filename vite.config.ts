import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa' // Importa o plugin oficial corrigido
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    basicSsl(),
    VitePWA({
      registerType: 'autoUpdate', // Atualiza o app em segundo plano no celular quando houver código novo
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'PDV Distribuidora',
        short_name: 'PDV Bebidas',
        description: 'Sistema de vendas e controle para a garagem',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone', // Abre o app em tela cheia no celular (esconde o navegador)
        orientation: 'portrait',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})
