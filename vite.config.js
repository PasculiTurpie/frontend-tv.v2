import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/proxy": {
        target: "http://localhost:3001",
        changeOrigin: true,
        secure: false
      },
      // Mantén tu /api hacia 3000 si lo usas:
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false
      }
    }
  }
});
