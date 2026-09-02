// vite.config.ts
import { defineConfig } from "file:///C:/project/ecommercemanage/frontend%20-%20Copy/node_modules/vite/dist/node/index.js";
import react from "file:///C:/project/ecommercemanage/frontend%20-%20Copy/node_modules/@vitejs/plugin-react-swc/index.js";
import path from "path";
import { VitePWA } from "file:///C:/project/ecommercemanage/frontend%20-%20Copy/node_modules/vite-plugin-pwa/dist/index.js";
import removeConsole from "file:///C:/project/ecommercemanage/frontend%20-%20Copy/node_modules/vite-plugin-remove-console/dist/index.mjs";
var __vite_injected_original_dirname = "C:\\project\\ecommercemanage\\frontend - Copy";
var vite_config_default = defineConfig(({ mode }) => {
  return {
    server: {
      host: "::",
      port: 3e3,
      proxy: {
        "/api": {
          // target: 'https://ecommercecheckbe.vercel.app',
          target: "http://localhost:5000",
          changeOrigin: true,
          secure: false
        }
      }
    },
    esbuild: {
      drop: ["console", "debugger"]
    },
    plugins: [
      react(),
      removeConsole(),
      VitePWA({
        registerType: "autoUpdate",
        // Auto update service worker
        includeAssets: [
          "favicon.ico",
          "icon.png",
          "robots.txt",
          "apple-touch-icon.png"
        ],
        manifest: {
          name: "Bebasthapan ERP - Business Management Platform",
          short_name: "Bebasthapan",
          description: "Business ERP system for accounting, inventory, sales, purchase, CRM, HR, attendance, and business insights.",
          start_url: "/home",
          scope: "/",
          display: "standalone",
          orientation: "portrait",
          background_color: "#ffffff",
          theme_color: "#4a90e2",
          icons: [
            {
              src: "/icons/icon-192x192.png",
              sizes: "192x192",
              type: "image/png"
            },
            {
              src: "/icons/icon-512x512.png",
              sizes: "512x512",
              type: "image/png"
            },
            {
              src: "/icons/icon-512x512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "any maskable"
            }
          ]
        },
        workbox: {
          runtimeCaching: [
            {
              // Cache API requests
              urlPattern: ({ url }) => url.pathname.startsWith("/api"),
              handler: "NetworkFirst",
              options: {
                cacheName: "api-cache",
                networkTimeoutSeconds: 10,
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 24 * 7
                  // 7 days
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            {
              // Cache static assets
              urlPattern: ({ request }) => ["document", "script", "style", "image", "font"].includes(request.destination),
              handler: "CacheFirst",
              options: {
                cacheName: "static-assets-cache",
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24 * 30
                  // 30 days
                }
              }
            }
          ]
        }
      })
    ],
    resolve: {
      alias: {
        "@": path.resolve(__vite_injected_original_dirname, "./src")
      }
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules")) {
              return id.toString().split("node_modules/")[1].split("/")[0].replace("@", "");
            }
          }
        }
      }
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxwcm9qZWN0XFxcXGVjb21tZXJjZW1hbmFnZVxcXFxmcm9udGVuZCAtIENvcHlcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXHByb2plY3RcXFxcZWNvbW1lcmNlbWFuYWdlXFxcXGZyb250ZW5kIC0gQ29weVxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovcHJvamVjdC9lY29tbWVyY2VtYW5hZ2UvZnJvbnRlbmQlMjAtJTIwQ29weS92aXRlLmNvbmZpZy50c1wiO2ltcG9ydCB7IGRlZmluZUNvbmZpZywgdHlwZSBVc2VyQ29uZmlnIH0gZnJvbSAndml0ZSc7XHJcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2MnO1xyXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcclxuaW1wb3J0IHsgVml0ZVBXQSB9IGZyb20gJ3ZpdGUtcGx1Z2luLXB3YSc7XHJcbmltcG9ydCByZW1vdmVDb25zb2xlIGZyb20gJ3ZpdGUtcGx1Z2luLXJlbW92ZS1jb25zb2xlJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBtb2RlIH0pOiBVc2VyQ29uZmlnID0+IHtcclxuICByZXR1cm4ge1xyXG4gICAgc2VydmVyOiB7XHJcbiAgICAgIGhvc3Q6ICc6OicsXHJcbiAgICAgIHBvcnQ6IDMwMDAsXHJcbiAgICAgIHByb3h5OiB7XHJcbiAgICAgICAgJy9hcGknOiB7XHJcbiAgICAgICAgICAvLyB0YXJnZXQ6ICdodHRwczovL2Vjb21tZXJjZWNoZWNrYmUudmVyY2VsLmFwcCcsXHJcbiAgICAgICAgICB0YXJnZXQ6XCJodHRwOi8vbG9jYWxob3N0OjUwMDBcIixcclxuICAgICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcclxuICAgICAgICAgIHNlY3VyZTogZmFsc2UsXHJcbiAgICAgICAgfSxcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICAgZXNidWlsZDoge1xyXG4gICAgZHJvcDogW1wiY29uc29sZVwiLCBcImRlYnVnZ2VyXCJdLFxyXG4gIH0sXHJcbiAgICBwbHVnaW5zOiBbXHJcbiAgICAgIHJlYWN0KCksXHJcbiAgICAgIHJlbW92ZUNvbnNvbGUoKSxcclxuICAgICAgVml0ZVBXQSh7XHJcbiAgICAgICAgcmVnaXN0ZXJUeXBlOiAnYXV0b1VwZGF0ZScsIC8vIEF1dG8gdXBkYXRlIHNlcnZpY2Ugd29ya2VyXHJcbiAgICAgICAgaW5jbHVkZUFzc2V0czogW1xyXG4gICAgICAgICAgJ2Zhdmljb24uaWNvJyxcclxuICAgICAgICAgICdpY29uLnBuZycsXHJcbiAgICAgICAgICAncm9ib3RzLnR4dCcsXHJcbiAgICAgICAgICAnYXBwbGUtdG91Y2gtaWNvbi5wbmcnXHJcbiAgICAgICAgXSxcclxuICAgICAgICBtYW5pZmVzdDoge1xyXG4gICAgICAgICAgbmFtZTogJ0JlYmFzdGhhcGFuIEVSUCAtIEJ1c2luZXNzIE1hbmFnZW1lbnQgUGxhdGZvcm0nLFxuICAgICAgICAgIHNob3J0X25hbWU6ICdCZWJhc3RoYXBhbicsXG4gICAgICAgICAgZGVzY3JpcHRpb246ICdCdXNpbmVzcyBFUlAgc3lzdGVtIGZvciBhY2NvdW50aW5nLCBpbnZlbnRvcnksIHNhbGVzLCBwdXJjaGFzZSwgQ1JNLCBIUiwgYXR0ZW5kYW5jZSwgYW5kIGJ1c2luZXNzIGluc2lnaHRzLicsXG4gICAgICAgICAgc3RhcnRfdXJsOiAnL2hvbWUnLFxuICAgICAgICAgIHNjb3BlOiAnLycsXHJcbiAgICAgICAgICBkaXNwbGF5OiAnc3RhbmRhbG9uZScsXHJcbiAgICAgICAgICBvcmllbnRhdGlvbjogJ3BvcnRyYWl0JyxcclxuICAgICAgICAgIGJhY2tncm91bmRfY29sb3I6ICcjZmZmZmZmJyxcclxuICAgICAgICAgIHRoZW1lX2NvbG9yOiAnIzRhOTBlMicsXHJcbiAgICAgICAgICBpY29uczogW1xyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgc3JjOiAnL2ljb25zL2ljb24tMTkyeDE5Mi5wbmcnLFxyXG4gICAgICAgICAgICAgIHNpemVzOiAnMTkyeDE5MicsXHJcbiAgICAgICAgICAgICAgdHlwZTogJ2ltYWdlL3BuZydcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgIHNyYzogJy9pY29ucy9pY29uLTUxMng1MTIucG5nJyxcclxuICAgICAgICAgICAgICBzaXplczogJzUxMng1MTInLFxyXG4gICAgICAgICAgICAgIHR5cGU6ICdpbWFnZS9wbmcnXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICBzcmM6ICcvaWNvbnMvaWNvbi01MTJ4NTEyLnBuZycsXHJcbiAgICAgICAgICAgICAgc2l6ZXM6ICc1MTJ4NTEyJyxcclxuICAgICAgICAgICAgICB0eXBlOiAnaW1hZ2UvcG5nJyxcclxuICAgICAgICAgICAgICBwdXJwb3NlOiAnYW55IG1hc2thYmxlJ1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICBdXHJcbiAgICAgICAgfSxcclxuICAgICAgICB3b3JrYm94OiB7XHJcbiAgICAgICAgICBydW50aW1lQ2FjaGluZzogW1xyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgLy8gQ2FjaGUgQVBJIHJlcXVlc3RzXHJcbiAgICAgICAgICAgICAgdXJsUGF0dGVybjogKHsgdXJsIH0pID0+IHVybC5wYXRobmFtZS5zdGFydHNXaXRoKCcvYXBpJyksXHJcbiAgICAgICAgICAgICAgaGFuZGxlcjogJ05ldHdvcmtGaXJzdCcsXHJcbiAgICAgICAgICAgICAgb3B0aW9uczoge1xyXG4gICAgICAgICAgICAgICAgY2FjaGVOYW1lOiAnYXBpLWNhY2hlJyxcclxuICAgICAgICAgICAgICAgIG5ldHdvcmtUaW1lb3V0U2Vjb25kczogMTAsXHJcbiAgICAgICAgICAgICAgICBleHBpcmF0aW9uOiB7XHJcbiAgICAgICAgICAgICAgICAgIG1heEVudHJpZXM6IDUwLFxyXG4gICAgICAgICAgICAgICAgICBtYXhBZ2VTZWNvbmRzOiA2MCAqIDYwICogMjQgKiA3IC8vIDcgZGF5c1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGNhY2hlYWJsZVJlc3BvbnNlOiB7XHJcbiAgICAgICAgICAgICAgICAgIHN0YXR1c2VzOiBbMCwgMjAwXSxcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAvLyBDYWNoZSBzdGF0aWMgYXNzZXRzXHJcbiAgICAgICAgICAgICAgdXJsUGF0dGVybjogKHsgcmVxdWVzdCB9KSA9PlxyXG4gICAgICAgICAgICAgICAgWydkb2N1bWVudCcsICdzY3JpcHQnLCAnc3R5bGUnLCAnaW1hZ2UnLCAnZm9udCddLmluY2x1ZGVzKHJlcXVlc3QuZGVzdGluYXRpb24pLFxyXG4gICAgICAgICAgICAgIGhhbmRsZXI6ICdDYWNoZUZpcnN0JyxcclxuICAgICAgICAgICAgICBvcHRpb25zOiB7XHJcbiAgICAgICAgICAgICAgICBjYWNoZU5hbWU6ICdzdGF0aWMtYXNzZXRzLWNhY2hlJyxcclxuICAgICAgICAgICAgICAgIGV4cGlyYXRpb246IHtcclxuICAgICAgICAgICAgICAgICAgbWF4RW50cmllczogMTAwLFxyXG4gICAgICAgICAgICAgICAgICBtYXhBZ2VTZWNvbmRzOiA2MCAqIDYwICogMjQgKiAzMCwgLy8gMzAgZGF5c1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICBdXHJcbiAgICAgICAgfVxyXG4gICAgICB9KSxcclxuICAgIF0sXHJcbiAgICByZXNvbHZlOiB7XHJcbiAgICAgIGFsaWFzOiB7XHJcbiAgICAgICAgJ0AnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMnKSxcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICBidWlsZDoge1xyXG4gICAgICByb2xsdXBPcHRpb25zOiB7XHJcbiAgICAgICAgb3V0cHV0OiB7XHJcbiAgICAgICAgICBtYW51YWxDaHVua3MoaWQpIHtcclxuICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMnKSkge1xyXG4gICAgICAgICAgICAgIHJldHVybiBpZFxyXG4gICAgICAgICAgICAgICAgLnRvU3RyaW5nKClcclxuICAgICAgICAgICAgICAgIC5zcGxpdCgnbm9kZV9tb2R1bGVzLycpWzFdXHJcbiAgICAgICAgICAgICAgICAuc3BsaXQoJy8nKVswXVxyXG4gICAgICAgICAgICAgICAgLnJlcGxhY2UoJ0AnLCAnJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0sIFxyXG4gICAgICAgIH0sXHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIH07XHJcbn0pO1xyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQTRULFNBQVMsb0JBQXFDO0FBQzFXLE9BQU8sV0FBVztBQUNsQixPQUFPLFVBQVU7QUFDakIsU0FBUyxlQUFlO0FBQ3hCLE9BQU8sbUJBQW1CO0FBSjFCLElBQU0sbUNBQW1DO0FBTXpDLElBQU8sc0JBQVEsYUFBYSxDQUFDLEVBQUUsS0FBSyxNQUFrQjtBQUNwRCxTQUFPO0FBQUEsSUFDTCxRQUFRO0FBQUEsTUFDTixNQUFNO0FBQUEsTUFDTixNQUFNO0FBQUEsTUFDTixPQUFPO0FBQUEsUUFDTCxRQUFRO0FBQUE7QUFBQSxVQUVOLFFBQU87QUFBQSxVQUNQLGNBQWM7QUFBQSxVQUNkLFFBQVE7QUFBQSxRQUNWO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxJQUNDLFNBQVM7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
