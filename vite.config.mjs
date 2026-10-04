import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  // Expose each REACT_APP_* var individually instead of replacing the whole
  // `process.env` object, so we don't shadow other `process.env.*` lookups that
  // dependencies may rely on at runtime.
  const envDefines = Object.fromEntries(
    Object.entries(env)
      .filter(([key]) => key.startsWith("REACT_APP_"))
      .map(([key, value]) => [`process.env.${key}`, JSON.stringify(value)])
  );

  return {
    plugins: [
      react({
        include: /\.[jt]sx?$/,
      }),
      tailwindcss(),
      VitePWA({
        // Ask before activating a new version (see PwaUpdatePrompt) rather than
        // swapping assets under an open tab — e.g. mid-checkout.
        registerType: "prompt",
        injectRegister: false,
        // public/manifest.json (linked from index.html) stays the source of truth.
        manifest: false,
        workbox: {
          globPatterns: ["**/*.{js,css,html,webp,png,svg,ico,woff2}"],
          // Shoppers don't need the admin panel offline; it loads on demand.
          globIgnores: ["**/assets/Admin*.js", "**/assets/sentryClient-*.js", "**/*.map"],
          navigateFallback: "/index.html",
          navigateFallbackDenylist: [/^\/api\//, /^\/socket\.io\//, /^\/sitemap\.xml$/, /^\/robots\.txt$/],
          cleanupOutdatedCaches: true,
          runtimeCaching: [
            {
              // Product data: always try the network (prices/stock change),
              // fall back to the last copy so viewed products open offline.
              urlPattern: ({ url, request }) =>
                request.method === "GET" && /^\/api\/(products|home)(\/|$|\?)/.test(url.pathname),
              handler: "NetworkFirst",
              options: {
                cacheName: "vk-api-catalog",
                networkTimeoutSeconds: 4,
                expiration: { maxEntries: 120, maxAgeSeconds: 7 * 24 * 60 * 60 },
                cacheableResponse: { statuses: [200] },
              },
            },
            {
              // Product photos (S3 / external hosts).
              urlPattern: ({ request, url }) => request.destination === "image" && url.origin !== self.location.origin,
              handler: "StaleWhileRevalidate",
              options: {
                cacheName: "vk-images",
                expiration: { maxEntries: 300, maxAgeSeconds: 30 * 24 * 60 * 60 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
            {
              urlPattern: ({ url }) => url.origin === "https://fonts.googleapis.com" || url.origin === "https://fonts.gstatic.com",
              handler: "StaleWhileRevalidate",
              options: {
                cacheName: "vk-fonts",
                expiration: { maxEntries: 20, maxAgeSeconds: 365 * 24 * 60 * 60 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
          ],
        },
        devOptions: { enabled: false },
      }),
    ],
    esbuild: {
      loader: "jsx",
      include: /src\/.*\.[jt]sx?$/,
      exclude: [],
    },
    define: {
      ...envDefines,
      "process.env.NODE_ENV": JSON.stringify(mode),
    },
    test: {
      environment: "jsdom",
      globals: true,
      setupFiles: ["./src/setupTests.js"],
      include: ["src/**/*.test.{js,jsx}"],
      css: false,
      // Component suites are independent; keep a modest pool so CI stays stable.
      maxWorkers: 4,
    },
    server: {
      port: 3000,
      proxy: {
        "/api": {
          target: env.VITE_DEV_API_PROXY || "http://localhost:5000",
          changeOrigin: true,
          secure: false,
        },
        "/socket.io": {
          target: env.VITE_DEV_API_PROXY || "http://localhost:5000",
          changeOrigin: true,
          secure: false,
          ws: true,
        },
      },
    },
  };
});
