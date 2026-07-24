import { defineConfig, type UserConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { VitePWA } from 'vite-plugin-pwa';
import removeConsole from 'vite-plugin-remove-console';

export default defineConfig(({ mode }): UserConfig => {
  return {
    server: {
      host: '::',
      port: 3000,
      proxy: {
        '/api': {
          // target: 'https://ecommercecheckbe.vercel.app',
          target:"http://localhost:5000",
          changeOrigin: true,
          secure: false,
        },
      },
    },
     esbuild: {
    drop: ["console", "debugger"],
  },
    plugins: [
      react(),
      removeConsole(),
      VitePWA({
        registerType: 'autoUpdate', // Auto update service worker
        includeAssets: [
          'favicon.ico',
          'icon.png',
          'robots.txt',
          'apple-touch-icon.png'
        ],
        manifest: {
          name: 'Bebasthapan ERP - Business Management Platform',
          short_name: 'Bebasthapan',
          description: 'Business ERP system for accounting, inventory, sales, purchase, CRM, HR, attendance, and business insights.',
          start_url: '/home',
          scope: '/',
          display: 'standalone',
          orientation: 'portrait',
          background_color: '#ffffff',
          theme_color: '#4a90e2',
          icons: [
            {
              src: '/icons/icon-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: '/icons/icon-512x512.png',
              sizes: '512x512',
              type: 'image/png'
            },
            {
              src: '/icons/icon-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ]
        },
        workbox: {
          runtimeCaching: [
            {
              // Cache API requests
              urlPattern: ({ url }) => url.pathname.startsWith('/api'),
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-cache',
                networkTimeoutSeconds: 10,
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
                },
                cacheableResponse: {
                  statuses: [0, 200],
                }
              }
            },
            {
              // Cache static assets
              urlPattern: ({ request }) =>
                ['document', 'script', 'style', 'image', 'font'].includes(request.destination),
              handler: 'CacheFirst',
              options: {
                cacheName: 'static-assets-cache',
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
                },
              },
            }
          ]
        }
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              return id
                .toString()
                .split('node_modules/')[1]
                .split('/')[0]
                .replace('@', '');
            }
          }, 
        },
      },
    },
  };
});
