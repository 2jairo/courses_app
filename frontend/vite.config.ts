import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

const CHUNKS = [
  { id: 'hls.js', name: 'hls.js' }
]

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          for (const chunk of CHUNKS) {
            if (id.includes(chunk.id)) {
              return chunk.name
            }
          }
          return 'vendor'
        }
      }
    }
  }
})
