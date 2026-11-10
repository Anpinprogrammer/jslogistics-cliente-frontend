# Estado del proyecto y memoria para agentes de IA

Memoria compartida entre sesiones y agentes de este repo (landing y portal de clientes). Léela después de [AGENTS.md](../AGENTS.md). Si cambias algo que otro agente necesitaría saber (una decisión, una trampa, algo pendiente), **actualízala en el mismo PR**. Última revisión: 2026-11-09.

La memoria del repo hermano (backend y app de oficina) está en `js-logistics/docs/ESTADO.md`; ahí están también las trampas del entorno local compartidas (puerto 4000 ocupado, 403 del backend, receta para medir desbordes).

## Qué hay hecho

- **Landing** (`pages/Home.tsx`): Hero a 90vh/100vh con **navbar propio** (`<Navbar hero />`), carrusel de fotos con overlay `slate-950` (90/70/100 %), badge, título de 3xl a 8xl, barra de rastreo que lleva a `/track?n=...`, CTAs y "Ver más". Después: estadísticas en tarjetas (`+12,000`, `99.3%`, `+180`, `24/7`), "Quiénes Somos" en bento 7/5 con iconos de **Lucide**, servicios, cómo funciona, CTA y contacto.
- **Menú móvil** (`components/layout/Navbar.tsx`): overlay a pantalla completa, fondo `#070B19`/95 con blur, bloquea el scroll del `body`, cierra con Escape y al tocar un enlace, foco a la X al abrir. Se dibuja con `createPortal` en `document.body` porque el `<header>` usa `backdrop-filter`, que atrapa a los hijos `fixed` y rompería el "pantalla completa".
- **Login** (`pages/Login.tsx`): oscuro, mapa del mundo real (contorno de Natural Earth, punteado) con rutas animadas y un pin en la sede de Cali, tarjeta de cristal, caja DEMO con botones de copiar y "Rellenar" (solo con `VITE_DEMO=true`). Tiene el enlace "¿Olvidaste tu contraseña?", que abre `/recuperar`; las páginas `/restablecer` y `/activar` abren los enlaces del correo. Las tres comparten el marco de `components/acceso.tsx`.
- **Portal del cliente:** dos portales (`mejorado/` y `clasico/`) con los mismos datos; Mis pedidos pagina en el servidor (8 por página en celular, 20 en computador, `lib/pantalla.ts`); cada página se descarga cuando se visita.
- **Corrección de desbordes laterales en móvil** (portal y login revisados a 320–430 px).

## Decisiones que no son obvias (no las deshagas sin preguntar)

1. **El logo `public/img/icono-96.webp` solo se ve sobre fondo claro.** Es transparente: isotipo "JS" azul oscuro y letras "LOGISTICS CALI" **blancas**. Sobre fondo oscuro el isotipo se pierde; sobre un badge blanco las letras desaparecen. Por eso en el login, el menú móvil y el navbar del Hero va en un **badge claro** (degradado blanco → `sky-100`, halo cian) con la imagen **recortada y agrandada** (`absolute left-[-10%] top-[3%] w-[120%] max-w-none` dentro de un contenedor `overflow-hidden`), y "Logistics · Cali" se escribe como texto aparte. La barra global de las demás páginas sigue usando `/img/logo.png`.
2. **La landing y el login son siempre oscuros a propósito**, aunque el sitio tenga modo claro. En esas pantallas los colores van explícitos (`#070B19`, `#38bdf8`, `#0284c7`) en vez de las variantes `dark:`. La portada usa un **navbar propio dentro del Hero** con texto claro; el navbar global (login, registro, rastreo y portal) conserva los estilos por tema. Si se quiere arreglar el global, debe usar colores claros mientras no haya hecho scroll en `/` y `/login`; en `/` ya no aplica porque el navbar global se oculta.
3. **Las fotos del carrusel son de ejemplo** (Wikimedia Commons, CC BY-SA y CC0). Antes de publicar hay que cambiarlas por fotos propias de JS Logistics, con los mismos nombres. Detalles, tamaños y créditos en `public/img/hero/LEEME.md`. Si falta una foto, la diapositiva muestra un fondo de color y no se rompe.
4. **Un `grid` siempre lleva su columna base** (`grid grid-cols-1 lg:grid-cols-12`); sin ella, en móvil la columna se ensancha al contenido más largo y la tarjeta se sale de la pantalla (pasó en el Inicio del portal). Los textos largos en flex llevan `min-w-0`. `html { overflow-x: clip }` es solo red de seguridad.
5. **El carrusel respeta `prefers-reduced-motion`** (no rota solo), se pausa con la pestaña oculta y al pasar el mouse por los indicadores. No cambies el intervalo (5,5 s) ni el desvanecimiento (1000 ms) sin que lo pidan.

6. **El mapa del login va anclado a la columna del formulario, no a la pantalla** (`MapaSede` en `components/acceso.tsx`). Así el pin de Cali queda siempre en un sitio libre: en celular, a la izquierda del logo (el mundo completo queda detrás de la cabecera, porque la tarjeta tapa el resto); desde `md`, a la izquierda de la tarjeta. Si cambias el tamaño del logo o de la tarjeta, revisa que el pin y su etiqueta no queden tapados a 320, 390, 820 y 1440 px. El contorno (`components/mapaMundo.ts`) es generado desde Natural Earth 1:50m en proyección equirrectangular; las ciudades se ubican con `punto(longitud, latitud)`, no a ojo.
7. **La portada tiene su propio navbar dentro del Hero.** `App.tsx` oculta el `<Navbar />` global solo en `/`; `Home` renderiza `<Navbar hero />` como primer hijo del Hero para que la foto llegue hasta arriba. El navbar `hero` muestra los enlaces desde `lg`, botones redondeados y menú móvil a pantalla completa; el global sigue con `md` en las demás páginas. No dupliques navbars ni vuelvas a poner el global en `/` sin quitar el del Hero.
8. **Stats y “Quiénes Somos” usan `bg-slate-50 dark:bg-slate-950` y Lucide.** Las métricas van en tarjetas 2×2 en celular y 4 columnas desde `md`; los beneficios usan `ShieldCheck`, `Receipt`, `LocateFixed` y `Headset` (`lucide-react`, agregado como dependencia). No vuelvas a los emojis ni a los estilos del prototipo en esas secciones. Las stats se superponen al Hero (`-mt-12 sm:-mt-16`) y el fondo continuo vive en el contenedor de `Home` (`bg-slate-50 dark:bg-slate-950`); no pongas fondo propio en la sección de stats/about ni quites el gradiente inferior del Hero. Las tarjetas tienen `p-4 sm:p-6` para que `+12,000` no desborde a 320 px. La sección de Servicios se ajustó al mismo esquema claro/oscuro para no dejar texto blanco sobre fondo claro; sus tarjetas todavía usan los iconos SVG antiguos.

## Trampas del entorno

- **Backend en el puerto 4000:** el proxy de `npm run dev` va a `http://localhost:4000`. Si otro proyecto ocupa ese puerto verás 403/404 que no son de nuestro backend (el nuestro responde `{ error: { code, message } }`). Se cambia con `VITE_PROXY_API` (ojo: en `js-logistics/frontend` la variable se llama `VITE_API_PROXY`).
- **Este repo corre en el puerto 3000** (`vite.config.ts`).
- **`npm run dev:demo` no necesita backend** y sirve para revisar todo el portal: `cliente@demo.co` / `demo1234`.
- **`Register` y `Track` siguen siendo la landing original** (axios en `services/api.ts`) y no tienen endpoint en el backend.
- Si interceptas `/api` en una prueba automática, filtra por `pathname.startsWith('/api/')`, no por `includes('/api/')`: Vite sirve `/src/api/*.ts` y se rompería la app.

## Qué falta

- Saldos calculados en el servidor, tiempo real (SSE) y subida de fotos y firmas (ver "Lo que viene" en [ARCHITECTURE.md](../ARCHITECTURE.md)).
- Fotos propias para el carrusel; el navbar global de login/registro/rastreo todavía usa estilos por tema y podría necesitar texto claro sobre fondos oscuros (decisión 2).
- Pasar `Register` y `Track` a `api/http.ts` cuando el backend tenga sus endpoints.
- No hay pruebas automáticas; la revisión es con `npm run build`, `npm run build:demo` y `dev:demo` a 375 px y en escritorio.

## Registro de sesiones (lo más reciente arriba)

- **2026-11-10:** transición Hero → KPIs: gradiente inferior de 128 px, métricas superpuestas con `-mt-12 sm:-mt-16`, fondo continuo `bg-slate-50 dark:bg-slate-950` en el contenedor de la portada y “Ver más” separado 32 px de las tarjetas (48 px en celular). Indicadores del carrusel a `bottom-32`. Revisado a 320, 360, 390, 640, 768, 1024 y 1440 px sin colisiones ni scroll horizontal.
- **2026-11-10:** landing: Stats en tarjetas 2×2/4 columnas y “Quiénes Somos” en bento 7/5 con iconos de Lucide (`lucide-react` agregado). Ambos adaptados a claro/oscuro; Servicios también se adaptó para no quedar con texto blanco sobre fondo claro. Revisado a 320, 360, 390, 640, 768, 1024 y 1440 px sin desbordes.
- **2026-11-10:** portada: Hero rediseñado con navbar propio, overlay `slate-950`, badge, escala 3xl–8xl y barra de rastreo que abre `/track?n=...`; se agregaron `xs` y `opacity-35` en Tailwind. La barra y los CTA inferiores escalan en `lg`/`xl` (`max-w-xl`/`2xl`, `text-base`, más padding) y conservan el apilado bajo 400 px. Revisado a 320, 360, 390, 400, 640, 768, 1024, 1280, 1440 y 1920 px sin desbordes. Carrusel conservado; indicadores ocultos en pantallas menores a 400 px.
- **2026-11-10:** login: el fondo ahora es un mapa del mundo real y lleva un pin en la sede principal (Cali). Revisado a 320, 390, 820 y 1440 px en modo demo.
- **2026-11-09:** login: enlace “¿Olvidaste tu contraseña?” y páginas públicas `/recuperar`, `/restablecer` y `/activar`, con el mismo diseño del login (marco compartido en `components/acceso.tsx`). Revisadas a 390 px en modo demo.
- **2026-11-09:** revisión de la documentación; se agregó este archivo y se corrigió en `AGENTS.md` la regla de la landing.
- **2026-11-07/08:** rediseño de la portada (carrusel), del menú móvil y del login; fotos de ejemplo; corrección de desbordes laterales en móvil.
