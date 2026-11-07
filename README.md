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

Variables en `.env.example`.

## Dos portales para el cliente

Después de iniciar sesión desde la landing, el cliente ve uno de dos portales. Los dos muestran lo mismo que la app actual
(inicio con indicadores, mis pedidos con filtros y pruebas de entrega, confirmar prenda de cambio, mi cuenta con saldo,
movimientos y recibo de cuadre del día) y usan las mismas consultas; solo cambia el diseño.

| `VITE_PORTAL_CLIENTE` | Qué ve el cliente | Código |
| --- | --- | --- |
| `mejorado` (por defecto) | El diseño de la landing (tema steel, tarjetas, modo oscuro) con los datos y funciones de la app actual | `src/portal/mejorado/` |
| `clasico` | La vista del cliente de la app actual, tal cual: mismo HTML y mismo `estilos.css` | `src/portal/clasico/` |

Con `VITE_PERMITIR_CAMBIO_PORTAL=true` aparece un botón flotante para pasar de uno a otro (la demo lo trae activo).

El CSS del portal clásico es una copia de `js-logistics/app/css/estilos.css`. `postcss.config.js` encierra todas sus reglas
dentro de `.clasico`, así que no choca con Tailwind ni con la landing.

## Estructura

```text
src/
  api/          cliente fetch (cookies, X-JSL, errores) y consultas del portal con TanStack Query
  auth/         sesión (/api/auth/yo, ingresar, salir) y protección de rutas por rol
  lib/          formatos (pesos, horas de Colombia) y reglas de negocio copiadas de app.js
  portal/       config.ts (qué portal), useDatosCliente.ts, mejorado/ y clasico/
  demo/         datos de prueba para VITE_DEMO=true
  pages/        landing (Home), Login, Registro, Rastreo y la página provisional del equipo
  components/   piezas de la landing (Navbar, Footer, ui)
```

## Lo que falta del backend

- `GET /api/clientes/:id/movimientos`: mientras no exista, la cuenta muestra solo los pedidos.
- `GET /api/pedidos/:guia/archivos` (`{ archivos: [{ tipo, url }] }`, URL firmadas de Storage): mientras no exista, no hay fotos.
- Saldos calculados en el servidor: por ahora el portal descarga los pedidos del cliente y calcula el saldo con `lib/negocio.ts`.
- `/register` y `/track` siguen siendo las páginas de la landing original y no tienen endpoint todavía.
