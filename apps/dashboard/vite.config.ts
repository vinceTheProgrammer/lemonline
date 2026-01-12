import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import devtools from 'solid-devtools/vite';

export default defineConfig({
  plugins: [devtools(), solidPlugin()],
  // This block only matters when running in dev mode.
  server: {
    port: 3000,
    proxy: {
      "/auth": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
      "/oauth/callback": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
    },
  },
  build: {
    target: 'esnext',
  },
});
