
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  define: {
    // Isso evita o erro "process is not defined" no navegador
    'process.env': {}
  }
});
