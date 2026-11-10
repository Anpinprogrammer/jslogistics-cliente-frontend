# Estado del proyecto y memoria para agentes de IA

Memoria compartida entre sesiones y agentes de este repo (landing y portal de clientes). Léela después de [AGENTS.md](../AGENTS.md). Si cambias algo que otro agente necesitaría saber (una decisión, una trampa, algo pendiente), **actualízala en el mismo PR**. Última revisión: 2026-11-09.

La memoria del repo hermano (backend y app de oficina) está en `js-logistics/docs/ESTADO.md`; ahí están también las trampas del entorno local compartidas (puerto 4000 ocupado, 403 del backend, receta para medir desbordes).

## Qué hay hecho

- **Landing** (`pages/Home.tsx`): portada a pantalla completa con **carrusel de fotos** de fondo (`components/HeroCarrusel.tsx`), velo azul noche del 70–85 %, malla discreta, badge, título con resplandor, dos botones e indicadores de barra cian. Después: estadísticas, nosotros, servicios, cómo funciona, CTA y contacto.
- **Menú móvil** (`components/layout/Navbar.tsx`): overlay a pantalla completa, fondo `#070B19`/95 con blur, bloquea el scroll del `body`, cierra con Escape y al tocar un enlace, foco a la X al abrir. Se dibuja con `createPortal` en `document.body` porque el `<header>` usa `backdrop-filter`, que atrapa a los hijos `fixed` y rompería el "pantalla completa".
- **Login** (`pages/Login.tsx`): oscuro, mapa del mundo real (contorno de Natural Earth, punteado) con rutas animadas y un pin en la sede de Cali, tarjeta de cristal, caja DEMO con botones de copiar y "Rellenar" (solo con `VITE_DEMO=true`). Tiene el enlace "¿Olvidaste tu contraseña?", que abre `/recuperar`; las páginas `/restablecer` y `/activar` abren los enlaces del correo. Las tres comparten el marco de `components/acceso.tsx`.
- **Portal del cliente:** dos portales (`mejorado/` y `clasico/`) con los mismos datos; Mis pedidos pagina en el servidor (8 por página en celular, 20 en computador, `lib/pantalla.ts`); cada página se descarga cuando se visita.
- **Corrección de desbordes laterales en móvil** (portal y login revisados a 320–430 px).

## Decisiones que no son obvias (no las deshagas sin preguntar)

1. **El logo `public/img/icono-96.webp` solo se ve sobre fondo claro.** Es transparente: isotipo "JS" azul oscuro y letras "LOGISTICS CALI" **blancas**. Sobre fondo oscuro el isotipo se pierde; sobre un badge blanco las letras desaparecen. Por eso en el login y el menú móvil va en un **badge claro** (degradado blanco → `sky-100`, halo cian) con la imagen **recortada y agrandada** (`absolute left-[-10%] top-[3%] w-[120%] max-w-none` dentro de un contenedor `overflow-hidden`), y "Logistics · Cali" se escribe como texto aparte. La barra superior de la landing todavía usa `/img/logo.png`.
2. **La landing y el login son siempre oscuros a propósito**, aunque el sitio tenga modo claro. En esas pantallas los colores van explícitos (`#070B19`, `#38bdf8`, `#0284c7`) en vez de las variantes `dark:`. Consecuencia conocida: con el modo claro activo, la barra superior (transparente arriba) usa textos grises que se leen débil sobre el fondo oscuro del Hero y del login. Si se quiere arreglar, la barra debe usar colores claros mientras no haya hecho scroll en `/` y `/login`.
3. **Las fotos del carrusel son de ejemplo** (Wikimedia Commons, CC BY-SA y CC0). Antes de publicar hay que cambiarlas por fotos propias de JS Logistics, con los mismos nombres. Detalles, tamaños y créditos en `public/img/hero/LEEME.md`. Si falta una foto, la diapositiva muestra un fondo de color y no se rompe.
4. **Un `grid` siempre lleva su columna base** (`grid grid-cols-1 lg:grid-cols-12`); sin ella, en móvil la columna se ensancha al contenido más largo y la tarjeta se sale de la pantalla (pasó en el Inicio del portal). Los textos largos en flex llevan `min-w-0`. `html { overflow-x: clip }` es solo red de seguridad.
5. **El carrusel respeta `prefers-reduced-motion`** (no rota solo), se pausa con la pestaña oculta y al pasar el mouse por los indicadores. No cambies el intervalo (5,5 s) ni el desvanecimiento (1000 ms) sin que lo pidan.

6. **El mapa del login va anclado a la columna del formulario, no a la pantalla** (`MapaSede` en `components/acceso.tsx`). Así el pin de Cali queda siempre en un sitio libre: en celular, a la izquierda del logo (el mundo completo queda detrás de la cabecera, porque la tarjeta tapa el resto); desde `md`, a la izquierda de la tarjeta. Si cambias el tamaño del logo o de la tarjeta, revisa que el pin y su etiqueta no queden tapados a 320, 390, 820 y 1440 px. El contorno (`components/mapaMundo.ts`) es generado desde Natural Earth 1:50m en proyección equirrectangular; las ciudades se ubican con `punto(longitud, latitud)`, no a ojo.

7. **La animación de entrada del login vive en `components/intro/` y solo la usa `pages/Login.tsx`.** Es la misma de la oficina (`js-logistics/frontend/src/pages/intro/`, decisión 15 de su `docs/ESTADO.md`): un solo reloj con `requestAnimationFrame` a 60 cuadros por segundo, las mismas curvas y resortes (aquí escritos a mano en `tiempos.ts`, sin el paquete `motion`) y 4 s en total. Lo propio del portal: el primer mensajero sale del pin de Cali, la telemetría dice "ABRIENDO EL PORTAL DE CLIENTES…", la barra dice "CARGANDO PORTAL" y se vuelve "Ingresar al portal →". Reglas: (a) **el fondo (malla, luces y mapa) no se anima**: está igual desde el primer cuadro; la "cámara" y el temblor solo mueven el contenido. (b) Sale en cada carga del login, nunca con "reducir movimiento", y se salta con clic, toque, tecla, foco o al enviar. (c) El formulario, el badge y el botón son los reales; la animación solo les pasa estilos por la prop opcional `intro` de `MarcoAcceso` y `BotonAcceso`, y `Recuperar` y `Restablecer` no la pasan. No cambies el árbol de elementos entre "con intro" y "sin intro" (el botón real se tapa con `clip-path` y la barra es un hermano absoluto). (d) Con la animación, el bloque del contenido no lleva `animate-fade-up` sino `will-change: opacity`: la animación de siempre deja ese bloque como raíz del desenfoque de la tarjeta (el mapa se ve a través del vidrio) y sin eso el vidrio queda más opaco. Con eso el último cuadro es idéntico, píxel a píxel, al login sin animación (revisado en Chrome a 1440×900 y 390×844). (e) La marca blanca es `public/img/marca-blanca.webp`, copiada de la oficina.

## Trampas del entorno

- **Backend en el puerto 4000:** el proxy de `npm run dev` va a `http://localhost:4000`. Si otro proyecto ocupa ese puerto verás 403/404 que no son de nuestro backend (el nuestro responde `{ error: { code, message } }`). Se cambia con `VITE_PROXY_API` (ojo: en `js-logistics/frontend` la variable se llama `VITE_API_PROXY`).
- **Este repo corre en el puerto 3000** (`vite.config.ts`).
- **`npm run dev:demo` no necesita backend** y sirve para revisar todo el portal: `cliente@demo.co` / `demo1234`.
- **`Register` y `Track` siguen siendo la landing original** (axios en `services/api.ts`) y no tienen endpoint en el backend.
- Si interceptas `/api` en una prueba automática, filtra por `pathname.startsWith('/api/')`, no por `includes('/api/')`: Vite sirve `/src/api/*.ts` y se rompería la app.

## Qué falta

- Saldos calculados en el servidor, tiempo real (SSE) y subida de fotos y firmas (ver "Lo que viene" en [ARCHITECTURE.md](../ARCHITECTURE.md)).
- Fotos propias para el carrusel, y decidir si la barra superior se adapta al modo claro (decisión 2).
- Pasar `Register` y `Track` a `api/http.ts` cuando el backend tenga sus endpoints.
- No hay pruebas automáticas; la revisión es con `npm run build`, `npm run build:demo` y `dev:demo` a 375 px y en escritorio.

## Registro de sesiones (lo más reciente arriba)

- **2026-11-10:** login: animación de entrada como la del login de oficina (decisión 7), con el fondo intacto. Comparada cuadro a cuadro a 1440×900 y 390×844; último cuadro idéntico al login de antes; sin desborde a 320, 360 y 390 px.
- **2026-11-10:** login: el fondo ahora es un mapa del mundo real y lleva un pin en la sede principal (Cali). Revisado a 320, 390, 820 y 1440 px en modo demo.
- **2026-11-09:** login: enlace “¿Olvidaste tu contraseña?” y páginas públicas `/recuperar`, `/restablecer` y `/activar`, con el mismo diseño del login (marco compartido en `components/acceso.tsx`). Revisadas a 390 px en modo demo.
- **2026-11-09:** revisión de la documentación; se agregó este archivo y se corrigió en `AGENTS.md` la regla de la landing.
- **2026-11-07/08:** rediseño de la portada (carrusel), del menú móvil y del login; fotos de ejemplo; corrección de desbordes laterales en móvil.
