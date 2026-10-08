import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

/**
 * Permet d'acceder a la page d'edition via /edit (en plus de /edit.html)
 * aussi bien en dev qu'en preview.
 */
function editRoute() {
  const rewrite = (req) => {
    if (!req.url) return;
    const [path, query] = req.url.split('?');
    if (path === '/edit' || path === '/edit/') {
      req.url = '/edit.html' + (query ? '?' + query : '');
    }
  };
  return {
    name: 'vcards-edit-route',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        rewrite(req);
        next();
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, _res, next) => {
        rewrite(req);
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [
    editRoute(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['favicon.png', 'logo.png', 'apple-touch-icon.png'],
      manifest: {
        name: 'Carte de visite',
        short_name: 'VCard',
        description: 'Carte de visite numerique avec QR Code',
        lang: 'fr',
        theme_color: '#0f172a',
        background_color: '#f1f5f9',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          { src: 'app-icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'app-icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'app-icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,webmanifest,ico}'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/edit/],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        edit: 'edit.html',
      },
    },
  },
});
