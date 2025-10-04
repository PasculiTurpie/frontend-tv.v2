import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), tailwindcss()],
    server: {
        proxy: {
            "/proxy": {
                target: "http://localhost:3001", // backend CommonJS
                changeOrigin: true,
            },
            "/api": {
                target: "http://localhost:3000", // si usas auth en otro puerto
                changeOrigin: true,
            },
        },
    },
});
 

