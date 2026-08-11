import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Proxy API and health calls to the Express backend.
      '/health': 'http://localhost:8765',
      '/api': 'http://localhost:8765',
    },
  },
});
