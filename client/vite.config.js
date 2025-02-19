import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    strictPort: true,
    watch: {
      usePolling: true,
    },
    headers: {
      "Access-Control-Allow-Origin": "*",
      // "Cache-Control": "no-cache", // Önbelleği devre dışı bırak
    },
    host: "0.0.0.0",
    port: 1342,
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
