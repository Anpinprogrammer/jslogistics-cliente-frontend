import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    build: {
      rollupOptions: {
        output: {
          // Las librerías van en archivos aparte: cambian poco, así el navegador las guarda en caché entre despliegues
          // y solo vuelve a bajar el código de la página.
          manualChunks(id) {
            if (!id.includes('node_modules')) return undefined;
            if (/node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)) return 'react';
            if (id.includes('axios')) return undefined; // solo la usan Register y Track: va con ellas
            return 'librerias';
          },
        },
      },
    },
    server: {
      port: 3000,
      // En desarrollo, /api va al backend local: mismo origen, igual que en producción con la reescritura de Render.
      proxy: { '/api': { target: env.VITE_PROXY_API || 'http://localhost:4000', changeOrigin: true } },
    },
  };
});
