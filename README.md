# JS Logistics: frontend

Landing pública y portal de clientes de JS Logistics, en **React 18 + TypeScript + Tailwind**, con **Vite**.
Habla con el backend de Express (repo `js-logistics`, carpeta `backend/`) por `/api`, con la sesión en una cookie httpOnly.

## Comandos

```bash
npm install
npm run dev:demo   # con datos de prueba, sin backend: http://localhost:3000 (cliente@demo.co / demo1234)
npm run dev        # contra el backend local (Vite manda /api a VITE_PROXY_API, por defecto http://localhost:4000)
npm run build      # revisa los tipos y genera dist/
```

Variables en `.env.example`. Si `npm run dev` da 403 o 404 raros, revisa que el puerto 4000 sea del backend de JS Logistics (ver [docs/ESTADO.md](docs/ESTADO.md#trampas-del-entorno)).

## Portal del cliente

Después de iniciar sesión desde la landing, el cliente ve el **portal clásico**: la misma vista de la app actual
(inicio con indicadores, mis pedidos con filtros y pruebas de entrega, confirmar prenda de cambio, mi cuenta con saldo,
movimientos y recibo de cuadre del día). En escritorio el menú lateral sigue el estilo de la app de oficina (logo con
separador, accesos agrupados por sección y el activo con acento azul); en el celular se usan las pestañas de abajo.
El dashboard permite cambiar entre **modo claro y oscuro** desde la barra superior, y desde 1280 px aprovecha todo el
ancho disponible (con un tope de 1600 px en monitores muy anchos). En escritorio el menú lateral **siempre es oscuro**
(como el de la oficina) y se puede **colapsar a solo íconos** con el botón del pie.

El CSS del portal clásico es una copia de `js-logistics/app/css/estilos.css`. `postcss.config.js` encierra todas sus reglas
dentro de `.clasico`, así que no choca con Tailwind ni con la landing.

## Despliegue en Vercel

`vercel.json` fija Vite, la carpeta `dist` y la regla de SPA (toda ruta va a `index.html`).
Las vistas previas de cada PR (`VERCEL_ENV=preview`) se construyen en **modo demo**, con datos de prueba, así se le pueden
mostrar al dueño sin backend. Producción usa el modo normal y llama a `/api`, que Vercel reenvía a `https://js-logistics.onrender.com`.

## Estructura

```text
src/
  api/          cliente fetch (cookies, X-JSL, errores) y consultas del portal con TanStack Query
  auth/         sesión (/api/auth/yo, ingresar, salir) y protección de rutas por rol
  lib/          formatos (pesos, horas de Colombia) y reglas de negocio copiadas de app.js
  portal/       useDatosCliente.ts y clasico/ (la vista del cliente)
  demo/         datos de prueba para VITE_DEMO=true
  pages/        landing (Home), Login, Registro, Recuperar, Restablecer, Rastreo y la página provisional del equipo
  components/   piezas de la landing (Navbar con menú móvil, Footer, ui, HeroCarrusel)
  hooks/        useTheme (modo claro/oscuro)
```

## Para quien cambie el código (personas o agentes de IA)

Lee [AGENTS.md](AGENTS.md) (convenciones y reglas), [docs/ESTADO.md](docs/ESTADO.md) (memoria: decisiones, trampas y últimos cambios) y [ARCHITECTURE.md](ARCHITECTURE.md) (cómo está armado y por qué).
El contrato de la API está en `js-logistics/backend/README.md`: cualquier cambio de API se hace primero allá.

## Lo que falta del backend

- Saldos calculados en el servidor: por ahora el portal descarga los pedidos del cliente y calcula el saldo con `lib/negocio.ts`.
- Subida de fotos y firmas a Storage: la lectura (`GET /api/pedidos/:guia/archivos`) ya existe; si el backend desplegado aún no la tiene, el portal muestra el pedido sin fotos.
- Tiempo real (SSE): mientras tanto, los pedidos se refrescan cada 60 segundos.
- `/register` y `/track` siguen siendo las páginas de la landing original y no tienen endpoint todavía.
