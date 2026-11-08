# Guía para agentes de IA: jslogistics-cliente-frontend

Lee esto completo antes de cambiar algo. Lo mismo vale para Claude Code (que lo carga desde `CLAUDE.md`), Codex, Cursor u otro agente.
Para entender el porqué de cada decisión, lee [ARCHITECTURE.md](ARCHITECTURE.md).

## Qué es este repo

La **landing pública** y el **portal de clientes** de JS Logistics: React 18, TypeScript estricto, Tailwind 3, Vite 6, React Router 6 y TanStack Query 5.
Se publica en Vercel en **jslogistics.pro**.

Es una de tres piezas. No mezcles responsabilidades:

| Pieza | Dónde | Quién la usa |
| --- | --- | --- |
| Backend (Express 5 + Postgres/Supabase, en Render) | repo `js-logistics`, carpeta `backend/` | todos, por `/api` |
| App de oficina y mensajeros | repo `js-logistics`, carpeta `frontend/`, en un subdominio (`admin.` o `app.jslogistics.pro`) | admin, asistente, mensajero |
| **Landing y portal de clientes (este repo)** | `jslogistics.pro` | público y rol `cliente` |

Si un cambio es para la oficina o los mensajeros, va en `js-logistics/frontend`, no aquí.

## Comandos

```bash
npm install
npm run dev:demo     # datos de prueba, sin backend: http://localhost:3000 (cliente@demo.co / demo1234)
npm run dev          # contra el backend local (Vite manda /api a VITE_PROXY_API, por defecto http://localhost:4000)
npm run typecheck    # tsc -b
npm run build        # typecheck + build de producción
npm run build:demo   # build en modo demo (así se construyen las vistas previas de Vercel)
```

**Antes de dar por terminado un cambio**, corre `npm run build` y `npm run build:demo`, y los dos deben pasar.
No hay pruebas automáticas todavía. Si cambias pantallas, revísalas con `npm run dev:demo` en el ancho de celular (unos 375 px) y en escritorio, y en los dos portales.

## El contrato con la API

- **La fuente de verdad del contrato es `js-logistics/backend/README.md`**: endpoints, quién puede llamar cada uno y la forma de las respuestas.
- **Cualquier cambio de API se hace primero en el backend.** No inventes endpoints ni campos en el frontend. Si algo falta, déjalo anotado en "Lo que falta del backend" en `README.md`. Si un endpoint ya está documentado pero puede no estar desplegado todavía, usa `opcional()`, de `src/api/cliente.ts`, para tratar un 404 como "sin datos".
- Los tipos del dominio están en `src/types/dominio.ts` y reflejan las respuestas del backend. Si el backend cambia un campo, actualízalos aquí.
- Convenciones del backend que el frontend respeta:
  - Todo cuelga de `/api`.
  - El JSON va en camelCase.
  - El dinero va en **pesos enteros** (`number`) y las fechas en ISO 8601.
  - Los errores llegan como `{ "error": { "code", "message", "campos"? } }`.
  - Las listas son paginadas: `{ pedidos, siguiente }`, donde `siguiente` es el cursor o `null`.
  - Los nombres de rutas, campos y códigos están en español: `/auth/ingresar`, `clienteId`, `POSIBLE_REPETIDO`.

## Sesión y seguridad (no negociable)

- La sesión es la cookie **`jsl_sesion`**, que es HttpOnly, Secure y SameSite=Lax y la pone el backend. **El frontend nunca ve ni guarda el token**: nada de JWT en `localStorage`, en `sessionStorage` ni en el estado.
- **Toda llamada nueva pasa por `api()` de `src/api/http.ts`.** Esa función ya hace tres cosas:
  - manda `credentials: 'include'`;
  - agrega `X-JSL: 1` en todo lo que no sea GET, que es la protección CSRF que exige el backend;
  - convierte los errores en `ApiError`, y ante un 401 avisa para volver al login.

  No uses `fetch` ni `axios` directamente.
- `src/services/api.ts` (axios) es herencia de la landing original. Solo lo usan `Register` y `Track`. No le agregues nada; si tocas esas páginas, pásalas a `api()`.
- La API se llama en **el mismo sitio** (`/api`, con una reescritura de Vercel hacia Render). No pongas una URL absoluta del backend en el código. `VITE_API_URL` existe solo para casos especiales.
- Las variables `VITE_*` terminan en el navegador, así que **nunca** pongas secretos en ellas. La service role key de Supabase y el `JWT_SECRET` solo van en el backend.
- El rol se revisa con `<RequireRole roles={[...]}>` en `src/App.tsx`. Es solo comodidad: quien de verdad autoriza es el backend.

## Dominios y despliegue

- `jslogistics.pro` (y `www.`) es este repo, en Vercel. El subdominio de oficina y mensajeros (`admin.` o `app.`, por decidir) es `js-logistics/frontend`.
- Cada frontend reescribe `/api/*` hacia el mismo servicio de Render. Así la cookie queda *host-only*: la sesión de clientes y la de oficina no se mezclan, no hace falta CORS en el navegador y funciona en Safari de iPhone.
- En el backend:
  - `COOKIE_DOMINIO` va vacío y `COOKIE_SAMESITE=lax`.
  - `CORS_ORIGENES` incluye `https://jslogistics.pro`, `https://www.jslogistics.pro` y el subdominio de oficina.
  - `TRUST_PROXY=2`, porque Vercel y Render son dos proxies.
- `vercel.json`:
  - Fija Vite, la carpeta `dist` y la regla de SPA.
  - Las vistas previas (`VERCEL_ENV=preview`) se construyen en modo demo.
  - Reescribe `/api/:path*` → `https://js-logistics.onrender.com/api/:path*`. Esa regla va **antes** de la regla de SPA. Si el backend cambia de URL, se cambia aquí y en la app de oficina.

## Estructura y dónde va cada cosa

```text
src/
  api/http.ts           cliente HTTP único (cookies, X-JSL, ApiError, aviso de 401)
  api/auth.ts           /auth/yo, /auth/ingresar, /auth/salir
  api/cliente.ts        consultas y mutaciones del portal (hooks de TanStack Query)
  auth/                 AuthProvider (useSesion) y RequireRole
  types/dominio.ts      tipos del dominio, iguales a las respuestas del backend
  lib/formato.ts        pesos, días y horas en America/Bogota
  lib/negocio.ts        reglas de negocio copiadas de js-logistics/app/js/app.js
  portal/config.ts      qué portal se ve (VITE_PORTAL_CLIENTE) y el botón para cambiarlo
  portal/useDatosCliente.ts  junta pedidos, ficha y movimientos para los dos portales
  portal/mejorado/      portal "propuesta": diseño de la landing con Tailwind
  portal/clasico/       portal "clásico": copia fiel de la vista de cliente de la app actual
  demo/datos.ts         datos inventados para VITE_DEMO=true
  pages/                landing (Home), Login, Register, Track, Equipo (aviso para cuentas que no son de cliente)
  components/           Navbar, Footer y ui de la landing
  services/, utils/, types/index.ts   herencia de la landing original (solo Register y Track)
```

## Reglas para cambiar código

1. **Los dos portales muestran lo mismo.**
   - "Propuesta" (`mejorado/`) y "clásico" (`clasico/`) usan los mismos datos (`useDatosCliente`, `api/cliente.ts`) y las mismas reglas (`lib/negocio.ts`); solo cambia el diseño.
   - Un cambio de **funcionalidad** (un dato nuevo, una acción nueva) va en los dos.
   - Un cambio de **diseño** va solo en el portal que se pidió.
2. **El clásico debe verse igual a la app actual.**
   - Su HTML y sus clases salen de `js-logistics/app`.
   - `clasico.css` es una copia de `js-logistics/app/css/estilos.css`. `postcss.config.js` antepone `.clasico` a todas sus reglas, así que no choca con Tailwind.
   - No metas clases de Tailwind en el clásico ni CSS global fuera de `clasico.css`.
3. **Nada de lógica de negocio en los componentes.**
   - Saldos, totales, textos de estado y reglas de cobro van en `lib/negocio.ts` y deben dar lo mismo que `app.js`.
   - Cuando el backend calcule algo (por ejemplo, los saldos), se usa su valor y se deja de calcular aquí.
4. **Formatos.**
   - Dinero con `pesos()`.
   - Fechas y días con las funciones de `lib/formato.ts`, que siempre usan la hora de Colombia. No uses `new Date().toLocaleDateString()` suelto ni la hora del navegador para agrupar por día.
5. **Datos del servidor con TanStack Query**, no con `useEffect` + `useState`.
   - Las claves de caché siguen `['cliente', 'pedidos']`, `['cliente', 'ficha', id]` o `['pedido', guia, 'archivos']`.
   - Después de una mutación, invalida las claves afectadas.
6. **Modo demo.**
   - Toda consulta o mutación nueva necesita su rama `if (DEMO)` con datos en `src/demo/datos.ts`.
   - Si no la tiene, las vistas previas de Vercel se rompen, y son las que se le muestran al dueño.
7. **Estilo visual del portal propuesto y de la landing.**
   - La paleta `steel`, `silver` y `accent` está en `tailwind.config.cjs`.
   - El modo oscuro va con la clase `dark`.
   - Las piezas compartidas están en `portal/mejorado/ui.tsx` y `components/ui`; reúsalas antes de crear otras.
   - El menú de abajo en el celular (`NavInferior`) debe quedar visible, así que deja espacio con `pb-*`.
8. **TypeScript estricto.** No uses `any`, `// @ts-ignore` ni variables sin usar (`noUnusedLocals` está activo).
9. **Idioma.**
   - Textos de pantalla en español de Colombia, con tuteo y frases claras para alguien que no es técnico.
   - Nombres del dominio en español (`pedido`, `guia`, `cliente`, `saldo`, `ingresar`).
   - Comentarios en español, solo cuando explican un porqué.
10. **No cambies la landing sin que lo pidan.** La landing (`pages/Home.tsx` y `components/`) se aprobó tal cual.

## Git y PR

- Trabaja en una rama y abre un PR a `main`. No hagas push directo a `main`.
- Los mensajes de commit van en español y en una línea que diga qué cambia para el usuario, por ejemplo: `Portal propuesto: menú de abajo en el celular`.
- En el PR, di qué cambió, en cuál portal y cómo se probó. Vercel publica una vista previa en modo demo para cada PR.
- Si el cambio necesita algo del backend, abre o enlaza primero el cambio en `js-logistics`.
