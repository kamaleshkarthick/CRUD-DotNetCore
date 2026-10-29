import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Fixed port so it matches the CORS origin allowed in the API's Program.cs.
  server: { port: 3000, strictPort: true },
})
