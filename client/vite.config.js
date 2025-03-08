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
    },
    host: "0.0.0.0",
    port: 80, // Port 80'e ayarlandı
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
