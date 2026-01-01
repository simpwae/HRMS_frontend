import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Dynamically set base: GitHub Pages needs repo subpath, Vercel/root needs '/'
// Use env var GITHUB_PAGES=1 (set in workflow) or fallback to VITE_BASE_URL
const isGhPages = process.env.GITHUB_PAGES === '1';
const explicitBase = process.env.VITE_BASE_URL; // action env injection
const base = explicitBase || (isGhPages ? '/HRMS-Cecos/' : '/');

export default defineConfig({
  plugins: [react()],
  base,
  server: { port: 5173 },
});
