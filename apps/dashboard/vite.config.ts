import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import devtools from 'solid-devtools/vite';

export default defineConfig({
  plugins: [devtools(), solidPlugin()],
  server: {
    port: 3000,
    // TODO handle this with reverse proxy in production
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
