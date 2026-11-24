import { fileURLToPath } from 'node:url';
export default {
  esbuild: { jsx: 'automatic' },
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  server: { proxy: { '/api': process.env.API_URL || 'http://localhost:3000' } },
};
