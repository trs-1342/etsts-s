import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    strictPort: true,
    port: 80,
    watch: {
      usePolling: true,
    },
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    host: "0.0.0.0",
    cors: true,
  },
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  build: {
    target: "esnext",
  },
});
