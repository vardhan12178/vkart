import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const reactAppEnv = Object.fromEntries(
    Object.entries(env).filter(([key]) => key.startsWith("REACT_APP_"))
  );

  return {
    plugins: [
      react({
        include: /\.[jt]sx?$/,
      }),
    ],
    esbuild: {
      loader: "jsx",
      include: /src\/.*\.[jt]sx?$/,
      exclude: [],
    },
    define: {
      "process.env": {
        ...reactAppEnv,
        NODE_ENV: mode,
      },
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
