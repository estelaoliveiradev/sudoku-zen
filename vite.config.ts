
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Substitua 'sudoku-zen' pelo nome do seu repositório no GitHub
export default defineConfig({
  plugins: [react()],
  base: './', 
});
