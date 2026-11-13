# JS Logistics: frontend

Landing pública y portal de clientes de JS Logistics, en **React 18 + TypeScript + Tailwind**, con **Vite**. Los avisos (guardado, envío, errores de conexión) salen con **react-toastify**.
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
movimientos y recibo de cuadre del día). Mi cuenta pagina el historial de movimientos en el servidor (5 en celular y
10 en computador) y el recibo carga los movimientos completos solo al abrirlo. En escritorio el menú lateral sigue el estilo de la app de oficina (logo con
separador, accesos agrupados por sección y el activo con acento azul); en el celular se usan las pestañas de abajo.
El dashboard permite cambiar entre **modo claro y oscuro** desde la barra superior, y desde 1280 px aprovecha todo el
ancho disponible (con un tope de 1600 px en monitores muy anchos). El menú lateral de escritorio **siempre es oscuro**;
la barra superior sigue el tema en escritorio y **permanece oscura en móvil**. El menú se puede **colapsar a solo
íconos** con el botón del pie.

El CSS del portal clásico es una copia de `js-logistics/app/css/estilos.css`. `postcss.config.js` encierra todas sus reglas
dentro de `.clasico`, así que no choca con Tailwind ni con la landing.

## Despliegue en Vercel

`vercel.json` fija Vite, la carpeta `dist` y la regla de SPA (toda ruta va a `index.html`).
Las vistas previas de cada PR (`VERCEL_ENV=preview`) se construyen en **modo demo**, con datos de prueba, así se le pueden
mostrar al dueño sin backend. Producción usa el modo normal y llama a `/api`, que Vercel reenvía a `https://api.jslogistics.pro`.

## Estructura

```text
src/
  api/          cliente fetch (cookies, X-JSL, errores) y consultas del portal con TanStack Query
  auth/         sesión (/api/auth/yo, ingresar, salir) y protección de rutas por rol
  lib/          formatos (pesos, horas de Colombia) y reglas de negocio copiadas de app.js
  portal/       useDatosCliente.ts y clasico/ (la vista del cliente)
  demo/         datos de prueba para VITE_DEMO=true
  pages/        landing (Home), Login, Registro, Recuperar, Restablecer, Rastreo y la página provisional del equipo
  components/   piezas de la landing (Navbar con menú móvil, Footer, ui, HeroCarrusel) y jsbot/ (el asistente)
  hooks/        useTheme (modo claro/oscuro)
  utils/        clientToast.ts: avisos con react-toastify (el contenedor está en App.tsx)
```

## Para quien cambie el código (personas o agentes de IA)

Lee [AGENTS.md](AGENTS.md) (convenciones y reglas), [docs/ESTADO.md](docs/ESTADO.md) (memoria: decisiones, trampas y últimos cambios) y [ARCHITECTURE.md](ARCHITECTURE.md) (cómo está armado y por qué).
El contrato de la API está en `js-logistics/backend/README.md`: cualquier cambio de API se hace primero allá.

## Lo que falta del backend

- Antes de activar JSBot en producción, reemplazar los ejemplos entre corchetes de `js-logistics/backend/chatbot/informacion-empresa.md` por horarios, cobertura y políticas confirmadas; configurar `ANTHROPIC_API_KEY` y, si se quiere derivación directa, `CHATBOT_WHATSAPP` en el backend.
- Saldos calculados en el servidor: por ahora el portal descarga los pedidos del cliente y calcula el saldo con `lib/negocio.ts`.
- Subida de fotos y firmas a Storage: la lectura (`GET /api/pedidos/:guia/archivos`) ya existe; si el backend desplegado aún no la tiene, el portal muestra el pedido sin fotos.
- Tiempo real (SSE): mientras tanto, los pedidos se refrescan cada 60 segundos.
- **Resumen del cliente en una sola consulta** (lo que más pesa hoy): el Inicio, la burbuja de "Mis pedidos", los contadores de los filtros y el recibo de cuadre bajan **todos** los pedidos del cliente (`GET /pedidos?limite=200` en serie, hasta 20 páginas). Haría falta algo como `GET /clientes/:id/resumen` con los conteos por estado (aceptados, en ruta, entregados, devueltos, cambios por recibir), las entregas por día de los últimos 30 días, los 6 últimos pedidos y los de hoy; y `GET /clientes/cuadre?dia=` abierto al propio cliente para el recibo. Con eso el portal deja de pedir la lista completa.
- `GET /solicitudes/mias` con `search`, `status` y `date` (hoy se filtran en el navegador las últimas 50).
- Listados del portal con solo las columnas de la fila: `GET /pedidos` del cliente puede omitir `intentos`, `solicitud` y las notas en la lista (el detalle ya se pide aparte con `GET /pedidos/:guia`), y `GET /clientes/:id/movimientos` del recibo podría aceptar `desde`/`hasta` de un solo día en vez de `limite=1000`.
- `/register` ahora es "Solicitar envío" y usa `POST /api/solicitudes/publico` (PR de `js-logistics`; hasta que se despliegue, el formulario responde error en producción). La vista `/track` ya está rediseñada y funciona con guías de demostración en modo demo; en producción conserva la consulta heredada `GET /api/track/:guia`, pero el backend aún no documenta ni implementa ese endpoint público. Hace falta definir una respuesta pública segura antes de habilitar el rastreo real.
