# Arquitectura: landing y portal de clientes

Este documento explica cómo está armado este repo y por qué. Las reglas prácticas para cambiarlo están en [AGENTS.md](AGENTS.md).
La arquitectura general del sistema (backend, base de datos y migración desde Firebase) está en `js-logistics/ARCHITECTURE.md`. El contrato de la API está en `js-logistics/backend/README.md`.

## El sistema completo

```text
                    jslogistics.pro (Vercel)                 admin./app.jslogistics.pro (Vercel)
                    este repo: landing + portal clientes     js-logistics/frontend: oficina + mensajeros
                              │  VITE_API_URL                          │  VITE_API_URL
                              └──────── https://api.jslogistics.pro ───┘
                                                 ▼
                                Backend Express 5 en Render (js-logistics/backend)
                                                 ▼
                                Postgres + Storage en Supabase
```

- **Un solo backend.** Él decide quién puede ver qué y hace los cálculos. Los frontends solo muestran y piden.
- **Cada frontend llama directo a la API con `VITE_API_URL`** (decisión del 2026-11-13; antes era una reescritura de `vercel.json`). Así un mismo código y un mismo `vercel.json` sirven para producción y para la demo; cada proyecto de Vercel pone su URL.
  - La API va en un subdominio del mismo dominio (`api.jslogistics.pro`): es del mismo *sitio* que `jslogistics.pro`, así que la cookie (`SameSite=Lax`, sin `Domain`) es de *primera parte* y funciona en Safari de iPhone, que bloquea las cookies de terceros.
  - El backend permite los orígenes con CORS (`CORS_ORIGENES`, con credenciales) y además los revisa como defensa CSRF, junto con la cabecera `X-JSL: 1`.
  - Como el portal y la oficina usan el mismo host de API, en **un mismo navegador** comparten la sesión: entrar en uno cierra la del otro.

## Capas del frontend

```text
pages / portal/*   pantallas: solo muestran datos y llaman hooks
      │
portal/useDatosCliente.ts   junta lo que necesita el portal
      │
api/cliente.ts, api/auth.ts  hooks de TanStack Query (caché, reintentos, invalidación)
      │
api/http.ts        fetch con cookie, X-JSL, ApiError y aviso de 401        demo/datos.ts (VITE_DEMO)
      │
     /api  →  backend
```

- **`api/http.ts`** es el único punto que habla con la red. Centraliza la cookie (`credentials: 'include'`), la cabecera CSRF, la forma de los errores (`{ error: { code, message, campos } }` → `ApiError`) y el cierre de sesión cuando llega un 401.
- **TanStack Query** guarda la caché del servidor:
  - `staleTime` es de 30 s y se vuelve a pedir al enfocar la ventana.
  - Los pedidos se refrescan cada 60 s.
  - No se reintenta ante errores 4xx.
  - Mientras no haya tiempo real (SSE, pendiente en el backend), esto es lo que mantiene la pantalla al día.
- **`lib/negocio.ts`** porta las reglas de `js-logistics/app/js/app.js` que ve el cliente: saldo por pedido y por cliente, textos de método y domicilio, prendas de cambio pendientes, recibo de cuadre del día, entregas por día y resumen.
  - Hoy el portal descarga todos los pedidos del cliente, paginados de a 200 con un máximo de 4.000, junto con sus movimientos, y calcula el saldo aquí. Así da exactamente lo mismo que la app actual.
  - Cuando el backend devuelva saldos ya calculados, el portal los usa y deja de descargar el historial.
- **`utils/clientToast.ts`** (react-toastify) es el único camino para avisar el resultado de una acción: `clientToast.success/error/info/warning/auto`. `<ToastContainer>` está montado una vez en `App.tsx` y cada aviso toma el tema de la clase `dark` de `<html>` al mostrarse. `auto` decide por el texto (empieza con "No se pudo…": error) y existe para el `toast(texto)` del portal clásico. Los errores de campo no van aquí: se quedan junto al campo.
- **`lib/formato.ts`** fija la zona `America/Bogota` para todo lo que agrupa por día o muestra horas. Así un pedido de las 11 p. m. no cae en otro día por la hora del celular.

## Sesión

1. `AuthProvider` pide `GET /api/auth/yo` al cargar. Si responde, ya hay sesión. Si responde 401, no la hay.
2. `Login` llama `POST /api/auth/ingresar { email, clave }` y el backend responde con la cookie `jsl_sesion`.
3. `portadaDe(usuario)` manda a `/cliente` si el rol es `cliente`. Para otro rol, `/equipo` muestra un aviso, porque la oficina y los mensajeros usan su propia app.
4. Si cualquier petición responde 401, `alSalir` avisa y se vuelve al login.
5. `POST /api/auth/salir` borra la cookie.

El token nunca llega al JavaScript. La versión de sesión vive en el JWT, y el backend vuelve a cargar la cuenta en cada petición. Por eso, si la oficina desactiva una cuenta o cambia su clave, la sesión deja de servir al instante.

## Rutas

| Ruta | Quién | Qué |
| --- | --- | --- |
| `/` | público | Landing |
| `/login` | público | Ingreso |
| `/register`, `/track` | público | Páginas heredadas de la landing original. Todavía no tienen endpoint |
| `/cliente`, `/cliente/pedidos`, `/cliente/cuenta` | `cliente` | Portal del cliente |
| `/equipo` | admin, asistente, mensajero | Aviso de que usen la app de oficina |

## Portal del cliente

Después de iniciar sesión, el cliente ve el portal clásico: el de la app actual, con el mismo HTML, las mismas clases y
su `estilos.css`. En escritorio el menú lateral adopta el estilo de la app de oficina (logo con separador, accesos
agrupados por sección y el activo con acento azul); en el celular se mantienen las pestañas de abajo. El menú lateral
**permanece oscuro** en ambos temas; la barra superior sigue el tema en escritorio y **es oscura en móvil**. El Dashboard
de Inicio usa todo el ancho desde 1280 px (tope de 1600 px en monitores muy anchos).

- `PortalCliente.tsx` carga el portal con `lazy()`, así que su CSS y su código solo se descargan al entrar.
- **CSS del clásico.** `postcss.config.js` antepone `.clasico` a cada regla de `clasico.css` y convierte `:root`, `html` y `body` en `.clasico`. Gracias a eso, el CSS original se puede copiar casi sin tocarlo y no afecta a Tailwind ni a la landing. Si la app actual cambia su `estilos.css`, se vuelve a copiar; los ajustes propios van al final del archivo.

## Modo demo

Con `VITE_DEMO=true` (`npm run dev:demo`, `npm run build:demo`), `api/auth.ts` y `api/cliente.ts` responden con `demo/datos.ts` en lugar de llamar a la red.

- Los datos son inventados y salen de un generador con semilla: el cliente "Tienda Luna" con 30 días de pedidos, movimientos y fotos SVG.
- La cuenta es `cliente@demo.co` / `demo1234`.
- Las confirmaciones de prenda de cambio se guardan en `localStorage`.

Las vistas previas de Vercel se construyen así, para mostrarle al dueño el portal sin backend. Por eso toda consulta nueva necesita su versión demo.

## Despliegue

- **Vercel** (`vercel.json`):
  - Build con Vite y salida en `dist`.
  - Toda ruta que no sea `/api/`, `/assets/` ni `/img/` va a `index.html`, que es la regla de SPA.
  - En las vistas previas (`VERCEL_ENV=preview`) se corre `build:demo`. En producción, `build`.
- **API:** la da `VITE_API_URL` de cada proyecto de Vercel; `vercel.json` ya no la reenvía. Las vistas previas se construyen en modo demo y casi no llaman a la red (salvo `/register`, ver `docs/demo-publica.md`).
- **Variables**: ver `.env.example`. Todas las `VITE_*` son públicas porque quedan en el JavaScript, así que ninguna puede ser secreta.

## Lo que viene

- Saldos calculados en el servidor, para dejar de descargar el historial completo del cliente.
- Tiempo real con SSE (`GET /api/events`), en lugar de refrescar cada 60 s.
- Fotos y firmas en Supabase Storage. La lectura con URL firmadas ya funciona en el backend; falta la subida.
- Pasar `Register` y `Track` a `api/http.ts` cuando el backend tenga sus endpoints, y borrar `services/`, `utils/` y `types/index.ts`.
