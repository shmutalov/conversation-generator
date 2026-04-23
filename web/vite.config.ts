import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  root: path.resolve(__dirname),
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "../src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/render": "http://localhost:3838",
      "/status": "http://localhost:3838",
    },
  },
  build: {
    outDir: path.resolve(__dirname, "../web-dist"),
    emptyOutDir: true,
  },
});
