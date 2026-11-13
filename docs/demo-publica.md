# Demo pública (portafolio): guía del portal de clientes

Cómo publicar el portal y la landing como parte de una **demostración real** de JS Logistics (por ejemplo, en `portal.ingenieroandrespineda.dev`), de modo que quien la pruebe pueda pedir un envío en `/register` y ver esa solicitud llegar a la campanita de la oficina.

La guía completa (base de datos, backend en Render, oficina, reinicio nocturno y experiencia del visitante) está en `js-logistics/docs/demo-publica.md`. Aquí solo va lo que toca a este repo. Es una guía: no cambia código.

> **Regla de oro:** la demo usa su **propia base y su propio backend**. Este sitio nunca debe apuntar al backend de producción ni cargar datos reales.

## Dos "demos" que no hay que confundir

| | Modo demo en memoria (`VITE_DEMO=true`) | Demo pública real (esta guía) |
|---|---|---|
| Datos | Inventados, dentro del navegador, sin backend | En una base de pruebas, a través de un backend real |
| Dónde se usa | `npm run dev:demo` y las **vistas previas de Vercel** de cada PR | El sitio del portafolio |
| ¿Llega la solicitud a la oficina? | **No**: cada app tiene su propia memoria | **Sí** |
| Cuenta de prueba del portal | `cliente@demo.co` / `demo1234` | `cliente@demo.co` / `demo-js-2026` (la crea `npm run db:demo` del backend) |

Para el portafolio se usa la columna de la derecha. El modo en memoria sigue siendo útil para revisar diseño en los PR.

> Desde el 2026-11-11 el formulario de `/register` **ya no tiene rama de demostración** en `src/api/solicitudes.ts`: siempre llama a `POST /api/solicitudes/publico`. En una vista previa de Vercel (que se construye en modo demo en memoria) el envío va a la API de `VITE_API_URL` del entorno Preview; como el dominio `*.vercel.app` de la vista previa no está en `CORS_ORIGENES`, responde 403. Es lo esperado: las vistas previas son para revisar diseño.

## Paso a paso

1. **Backend y base de la demo:** sigue la guía de `js-logistics/docs/demo-publica.md` (Supabase nuevo, Render nuevo, `db:migrar` y `db:demo -- --si`). Necesitas la dirección del servicio de Render de la demo.
2. **Proyecto de Vercel:** proyecto nuevo con este repo (raíz del repo, framework Vite).
3. **Variable `VITE_API_URL`** (Settings → Environment Variables, entorno Production): `https://api.ingenieroandrespineda.dev`, sin `/api` y sin barra final. Es el dominio propio del Render de la demo (ver la guía del backend); no uses el `onrender.com`, porque Safari de iPhone no guardaría la cookie. `vercel.json` es el mismo de producción: no hace falta una rama aparte.
4. **Modo de construcción:** el `buildCommand` construye en modo real (`npm run build`) en producción y en modo demo en memoria (`npm run build:demo`) solo cuando `VERCEL_ENV=preview`. El sitio del portafolio debe ser el **despliegue de producción** del proyecto de la demo (su rama de producción), no una vista previa. En las variables de entorno del proyecto no pongas `VITE_DEMO` (o ponla en `false`).
5. **Dominio:** agrega `portal.ingenieroandrespineda.dev` al proyecto y crea el CNAME que Vercel te indique.
6. **Backend:** en `CORS_ORIGENES` del Render de la demo incluye `https://portal.ingenieroandrespineda.dev` (con `https://`, sin barra final; varios orígenes se separan con coma). Sin eso, el envío de la solicitud da **403 "Origen no permitido"**. Con `TRUST_PROXY=1`.

## Cómo comprobar que quedó bien

1. Abre `https://portal.ingenieroandrespineda.dev/register`: arriba del título debe decir **"Sin crear cuenta"**. Si dice "Vista de demostración", el sitio está en modo demo en memoria.
2. En DevTools → Network, envía una solicitud con datos ficticios: debe salir un `POST /api/solicitudes/publico` con **201**.
   - **403:** el dominio no está en `CORS_ORIGENES`.
   - **404:** si la petición fue a `portal.ingenieroandrespineda.dev/api/…`, falta `VITE_API_URL` (agrégala y vuelve a publicar); si fue a `api.…`, el Render de la demo no tiene el código con las solicitudes.
   - **429:** el límite por IP (en la demo se baja a propósito).
3. En la oficina de la demo (`admin@demo.co`), la solicitud aparece en la campanita, como máximo 30 segundos después.

## Cosas para recordar

- Todo lo que el visitante escriba queda guardado en la base de la demo hasta el reinicio nocturno. Pídeles en la página del portafolio que usen **datos ficticios**.
- El formulario tiene un campo trampa contra robots (`sitio`); no lo quites.
- Los textos y la estructura del portal siguen las reglas de `AGENTS.md`. Si más adelante quieres un aviso visible de "esto es una demo" en el sitio, es un cambio de código aparte (por ejemplo, una franja condicionada a una variable `VITE_*` propia), no una parte de esta guía.
