import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  if (process.env.VERCEL && !env.VITE_API_URL && mode !== 'demo' && env.VITE_DEMO !== 'true') {
    console.warn('\n⚠️  Falta VITE_API_URL en este proyecto de Vercel: el portal llamará a /api en su propio dominio y no encontrará el backend.\n');
  }
  return {
    plugins: [react()],
    build: {
      rollupOptions: {
        output: {
          // Lo que usa toda página (React, el router y TanStack Query) va en archivos aparte: cambia poco, así el navegador
          // lo guarda en caché entre despliegues y solo vuelve a bajar el código de la página. Las demás librerías
          // (íconos de lucide, react-toastify, axios) van con la página o el componente que las usa, para que la
          // portada no descargue los íconos del portal ni los avisos.
          manualChunks(id) {
            if (!id.includes('node_modules')) return undefined;
            if (/node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)) return 'react';
            if (id.includes('react-toastify')) return 'avisos'; // solo la cargan las páginas que avisan algo
            if (/node_modules[\\/](react-router|react-router-dom|@remix-run|@tanstack)[\\/]/.test(id)) return 'librerias';
            return undefined;
          },
        },
      },
    },
    server: {
      port: 3000,
      // En desarrollo, /api va al backend local (mismo origen). En producción se llama directo a VITE_API_URL.
      proxy: { '/api': { target: env.VITE_PROXY_API || 'http://localhost:4000', changeOrigin: true } },
    },
  };
});
