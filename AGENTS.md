# Guía para agentes de IA: jslogistics-cliente-frontend

Lee esto completo antes de cambiar algo, y después [docs/ESTADO.md](docs/ESTADO.md): la memoria del proyecto (decisiones, trampas y últimos cambios). Lo mismo vale para Claude Code (que lo carga desde `CLAUDE.md`), Codex, Cursor u otro agente.
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
No hay pruebas automáticas todavía. Si cambias pantallas, revísalas con `npm run dev:demo` en el ancho de celular (unos 375 px) y en escritorio.

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
  portal/useDatosCliente.ts  junta pedidos, ficha y movimientos del portal
  portal/clasico/       portal del cliente: vista clásica de la app actual, con su menú de oficina
  demo/datos.ts         datos inventados para VITE_DEMO=true
  pages/                landing (Home), Login, Register, Recuperar, Restablecer, Track y Equipo
  components/           Navbar (con el menú móvil), Footer, ui, HeroCarrusel y acceso.tsx (marco del login)
  components/intro/     animación de entrada del login (reloj, medidas y escena), la misma de la oficina
  hooks/useTheme.ts     modo claro/oscuro (clase `dark` en <html>, guardado en localStorage `jsl_theme`)
  lib/pantalla.ts       cuántos pedidos por página: 8 en celular, 20 en computador
  services/, utils/, types/index.ts   herencia de la landing original (solo Register y Track)
```

## Reglas para cambiar código

1. **Hay un solo portal del cliente.**
   - El portal clásico (`portal/clasico/`) usa los datos de `useDatosCliente` y las reglas de `lib/negocio.ts`.
   - La "vista de propuesta" se retiró: no vuelvas a crear un segundo portal ni un selector de versión.
2. **El clásico debe verse igual a la app actual, salvo el menú de escritorio y el dashboard.**
   - Su HTML y sus clases salen de `js-logistics/app`.
   - El menú lateral de escritorio sigue el estilo de la app de oficina: logo con separador, grupos con título (`lat-grupo`, `lat-titulo`) y el activo con acento azul. Se puede **colapsar a 76 px** con el botón `plegar` del pie; los accesos conservan `title` y `aria-label`.
   - El Dashboard de Inicio tiene tema claro/oscuro con botón en la barra superior (`useTheme` + `data-theme` en `.clasico`). El **sidebar de escritorio permanece siempre oscuro** (`slate-900`); la barra superior sigue el tema en escritorio (blanca en claro) y **permanece oscura en móvil**; las pestañas móviles sí cambian. Las tarjetas tienen borde y el layout es fluido desde 1280 px. No lo devuelvas al estilo fijo anterior.
   - `clasico.css` es una copia de `js-logistics/app/css/estilos.css`. `postcss.config.js` antepone `.clasico` a todas sus reglas, así que no choca con Tailwind.
   - No metas clases de Tailwind en el clásico ni CSS global fuera de `clasico.css`; los ajustes propios van al final del archivo.
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
7. **Estilo visual de la landing.**
   - La paleta `steel`, `silver` y `accent` está en `tailwind.config.cjs`.
   - El modo oscuro va con la clase `dark`.
   - Las piezas compartidas están en `components/ui`; reúsalas antes de crear otras.
8. **TypeScript estricto.** No uses `any`, `// @ts-ignore` ni variables sin usar (`noUnusedLocals` está activo).
9. **Idioma.**
   - Textos de pantalla en español de Colombia, con tuteo y frases claras para alguien que no es técnico.
   - Nombres del dominio en español (`pedido`, `guia`, `cliente`, `saldo`, `ingresar`).
   - Comentarios en español, solo cuando explican un porqué.
10. **No cambies la landing, el login ni el menú sin que lo pidan.** Su diseño actual (portada con carrusel, menú móvil a pantalla completa, login oscuro) se hizo por pedido explícito del dueño y está descrito en [docs/ESTADO.md](docs/ESTADO.md). Respeta sus decisiones: pantallas siempre oscuras, el logo en badge claro recortado, el menú dibujado con `createPortal`, el intervalo y el desvanecimiento del carrusel.
11. **Sin desbordes laterales en móvil.** Todo `grid` lleva su columna base (`grid-cols-1`), los textos largos en flex llevan `min-w-0`, y se revisa a 320, 360 y 390 px. Ya hay un `overflow-x: clip` en `html` como red de seguridad, pero no sustituye arreglar la causa.

## Git y PR

- Trabaja en una rama y abre un PR a `main`. No hagas push directo a `main`.
- Los mensajes de commit van en español y en una línea que diga qué cambia para el usuario, por ejemplo: `Portal propuesto: menú de abajo en el celular`.
- En el PR, di qué cambió, en cuál portal y cómo se probó. Vercel publica una vista previa en modo demo para cada PR.
- Si el cambio necesita algo del backend, abre o enlaza primero el cambio en `js-logistics`.
- Si tomaste una decisión que otro agente debe respetar o dejaste algo pendiente, anótalo en `docs/ESTADO.md` en el mismo PR.
