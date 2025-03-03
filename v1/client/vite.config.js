import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  define: {
    global: "window", // ✅ Define `global` for browser compatibility
  },
  optimizeDeps: {
    include: ["events", "util"], // ✅ Ensure required modules are available
  },
})