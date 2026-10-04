import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

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
