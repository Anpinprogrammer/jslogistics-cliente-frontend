# Estado del proyecto y memoria para agentes de IA

Memoria compartida entre sesiones y agentes de este repo (landing y portal de clientes). Léela después de [AGENTS.md](../AGENTS.md). Si cambias algo que otro agente necesitaría saber (una decisión, una trampa, algo pendiente), **actualízala en el mismo PR**. Última revisión: 2026-11-09.

La memoria del repo hermano (backend y app de oficina) está en `js-logistics/docs/ESTADO.md`; ahí están también las trampas del entorno local compartidas (puerto 4000 ocupado, 403 del backend, receta para medir desbordes).

## Rediseño vigente de la landing — 2026-11-10

Por petición explícita del dueño, `Home.tsx` sustituye la composición anterior. Esta decisión prevalece sobre las descripciones históricas de stats, bento y Servicios más abajo.

- Portada editorial: hero a dos columnas con rastreo independiente, presentación con fotografía, servicios asimétricos, vista ilustrativa del portal, proceso en cuatro pasos, contacto y footer propios.
- React + TypeScript + Tailwind; `pages/landing.css` contiene tokens claro/oscuro y efectos limitados a `.landing`. Hero y cierre comercial mantienen paneles oscuros en ambos temas por contraste. No cambia los dos portales ni el acceso.
- `App.tsx` omite el footer compartido únicamente en `/`: Home incluye uno propio sin NIT ni teléfonos de ejemplo.
- Se retiran cifras y garantías comerciales sin verificar. El portal dibujado está rotulado como ilustrativo, con datos de ejemplo. Las imágenes existentes siguen siendo fotografías de referencia: sustituir por material propio cuando esté disponible.
- Cada bloque usa su propio IntersectionObserver. Entradas con opacity/transform, estados de foco visibles y modo de movimiento reducido; no se agregaron dependencias.
- Se conserva el carrusel y su intervalo de 5,5 s / fundido de 1 s, además del menú móvil existente.
- Contacto por `mailto:info@jslogistics.co`, con explicación explícita de que abre el correo. No simula enviar formularios ni introduce endpoints.

- Validación del rediseño: `npm run build` y `npm run build:demo` pasan. Chromium en claro/oscuro a 320, 375, 400, 640, 768, 1024, 1280, 1440 y 1920 px: sin desbordes ni errores JS; menú móvil, navegación a rastreo con guía y movimiento reducido comprobados. Capturas de escritorio y móvil revisadas.

## Ritmo cromático de la landing — 2026-11-10

- Fondos por sección: hero oscuro con fundido al tema activo; franja flotante `-mt-12/-mt-16`; Nosotros `slate-50/slate-950` con glow cian; Servicios `slate-100/80` / `#0B1120` con glow índigo y tarjetas blancas/slate-900; Plataforma blanca/slate-950; Proceso elevado con malla lineal; Contacto y footer oscuros en ambos temas con trama radial de 16 px.
- Franja de puntos clave (Pedidos, Seguimiento, Movimientos y Cali), sin reintroducir cifras comerciales no verificadas. Las métricas numéricas anteriores siguen retiradas.
- Texturas decorativas aisladas con `isolate`, `aria-hidden` y `pointer-events-none`. Tokens del cierre ajustan textos secundarios, enlaces e iconos claros incluso cuando el tema general es claro.
- Cambios limitados a Home y su hoja de estilos; carrusel, menú, login y portales conservados. Ambas compilaciones pasan. Revisión Chromium en ambos temas a 320, 375, 400, 640, 768, 1024, 1280, 1440 y 1920 px sin desbordes ni errores JS; navegación móvil, rastreo y movimiento reducido comprobados.

## Hero: prioridad del rastreo — 2026-11-10

- Un único formulario: orden DOM descripción → rastreo → CTA. Bajo `lg`, flex vertical; desde `lg`, grid de 12 columnas con widget a la derecha ocupando las dos filas y CTA a la izquierda.
- Titular uppercase 3xl/5xl/6xl/7xl, sin punto final en “Nosotros lo movemos”. Se retira `.landing-title` para evitar que CSS sobrescriba las utilidades responsivas.
- Widget compacto slate-900/90, input con icono absoluto, botones a todo el ancho en móvil y secundario ghost. Se mantiene el ajuste global de inputs a 16 px en móvil para evitar zoom de Safari.
- Micro-footer `py-3 lg:py-4` y borde slate-800/60. Menú existente a z-60 con transición de 300 ms.
- Verificado en Chromium claro/oscuro entre 320 y 1920 px: sin desbordes, rastreo antes de CTA en móvil, guía navegable y menú a z-60. Compilaciones normal y demo correctas.

## Navbar fijo y espacio vertical — 2026-11-10

- Navbar de portada fijo a z-50, cristal slate-950, altura 64/80 px y sombra/borde reforzados al superar 20 px. Fuera del hero aislado para no quedar detrás de otras secciones; menú sigue en portal a z-60. Variantes de otras rutas conservadas.
- Hero con padding superior compensatorio, min-height 90vh/100vh y crecimiento natural. Grid con separación amplia, franja de impacto en flujo normal y tarjetas inferiores sin margen negativo, con `py-12 lg:py-16`.
- Anclas con scroll-margin 96/112 px para evitar que la navegación tape los encabezados.
- Ambas compilaciones pasan.

## Menú móvil con Lucide — 2026-11-10

- Enlaces con iconos Lucide, contenedores sky y ChevronRight; cambio de tema con Sun/Moon y sin emojis; cierre con X, acceso LogIn y registro UserPlus. Variantes autenticadas conservadas con iconos propios.
- Overlay de pantalla completa en portal a z-60, fondo slate-950/95, transición de opacidad/escala de 200 ms y movimiento reducido. Cabecera, lista y bloque inferior separados, áreas táctiles de al menos 44 px y scroll interno para pantallas bajas.
- Se conserva bloqueo/restauración del overflow del body, cierre con Escape/enlace y devolución del foco. Rastrear mantiene `/track`.
- Validado en Chromium a 320×568, 375×812, 640×640 y 768×900 en ambos temas: sin desbordes, sin emojis ni errores JS; tema, Escape, navegación y bloqueo/restauración de scroll correctos. `build` y `build:demo` pasan.

## Micro-footer con contadores — 2026-11-10

- Por petición explícita del dueño, se reemplazan slogans por cifras suministradas: 15.000+ envíos mensuales, 99,4 % entregas a tiempo, 180+ municipios, < 15 min soporte. Esta decisión sustituye la retirada previa de métricas en ese bloque; los valores son proporcionados por el usuario.
- `components/ui/AnimatedCounter.tsx`: props end/duration/decimals/prefix/suffix, requestAnimationFrame y ease-out quad en 2 s, formato es-CO y cancelación al desmontar. Movimiento reducido o duración no positiva muestra el valor final directamente.
- Tamaño reservado con valor invisible y cifras tabulares para evitar saltos; valor final accesible separado de los cuadros animados.
- Grid de dos columnas en xs/sm y cuatro desde md, separadores por fila/columna y fondo slate-950/90. Mantiene los puntos clave en la franja posterior.
- Validado en Chromium en claro/oscuro a 320, 375, 640, 768, 1024 y 1440 px sin desbordes ni errores JS: columnas correctas, valores finales y movimiento reducido. `build` y `build:demo` pasan.

## JSBot: interfaz inicial — 2026-11-10

- `components/jsbot/JSBot.tsx`, montado únicamente en Home. Burbuja inferior derecha con `/img/jsbot/jsbot.webp`; panel de cortina desde el borde derecho a 20vw desde lg, 420 px en tablet y ancho completo en móvil.
- Interfaz en claro/oscuro con bienvenida, preguntas sugeridas, mensajes locales y respuesta explícita de demostración. Sin API ni persistencia. No se simula un servicio activo.
- Portal al body a z-70, transición transform de 300 ms y movimiento reducido. Bloquea/restaura el scroll; cierra por X, Escape o fondo. Foco contenido en diálogo, restaurado al cerrar; panel cerrado inert y oculto a lectores de pantalla. Historial desplazable, entrada y pie fijos dentro del panel, safe areas.
- Chromium: claro/oscuro a 320, 375, 640, 1024, 1440 y 1920 px sin desbordes ni errores JS; ancho 20 % en escritorio, envío local, Escape y retorno del foco comprobados. Compilaciones normal y demo correctas.

## Burbuja JSBot con cristal — 2026-11-10

- Trigger a z-50 de 56 px con icono Bot de Lucide, sin imagen ni fondo blanco. Borde degradado sky/cyan/indigo, interior slate-950 translúcido, halo pulsante y badge verde decorativo (no indica conexión real).
- Tooltip desde sm visible en hover y foco; margen inferior suma safe-area. Animaciones respetan movimiento reducido. Se oculta al abrir el diálogo a z-70; cierre y retorno del foco conservados. Avatar del encabezado del panel conservado.
- Verificado con Chromium en ambos temas a 320, 375, 640 y 1440 px: sin desbordes ni errores JS; sin img en trigger, z-50, tooltip al foco, apertura/cierre y restauración del foco correctos. Movimiento reducido desactiva el halo. `build` y `build:demo` pasan.

## Avatar JSBot integrado — 2026-11-10

- Por petición explícita del dueño se recupera la imagen actual `jsbot_2.webp` en la burbuja, conservando el tooltip, halo y controles anteriores. Tanto trigger como cabecera usan recorte circular, interior slate-950, borde degradado sky/cyan/indigo y badge decorativo verde.
- Cabecera oscura en ambos temas con texto blanco/slate-400 y X sobria. Se conserva el área táctil de cierre de 44 px. No se modifica el archivo de imagen.
- Comprobado en claro/oscuro de 320 a 1920 px sin desbordes ni errores JS; envío local, Escape y restauración del foco funcionan. `build` y `build:demo` pasan.

## Bienvenida JSBot con avatar destacado — 2026-11-10

- Header compacto “Asistente JSBot”, sin avatar pequeño. Bienvenida centrada en cuerpo con imagen de 96/112 px, halo cian y borde degradado; título y sugerencias justo debajo.
- Solo aparece antes del primer envío. Al conversar se retira bienvenida y sugerencias, se muestra historial y se desplaza al último mensaje. Al abrir la bienvenida se conserva scroll superior para mostrar el avatar incluso en pantallas bajas.
- Badge “Demo” coherente con la interfaz sin conectar. Colores adaptados a claro/oscuro, movimiento reducido y cierre accesible conservados.
- Chromium en ambos temas a 320–1920 px sin desbordes ni errores JS; comprobado avatar visible inicialmente y retirado al enviar, historial, Escape y retorno del foco. Compilaciones normal y demo correctas.

## Hero de alto de pantalla — 2026-11-10

- Hero completo, incluida franja de contadores, a `h-dvh`; padding superior 64/80 px compensa navbar fijo. Retirados márgenes y padding inferiores que extendían el bloque después de los KPIs.
- Área central flex-1 min-h-0, centrado seguro y overflow vertical interno cuando no cabe (móviles y ventanas bajas). Los KPIs no se encogen y terminan al borde inferior de la pantalla; no se oculta contenido.

## Corrección del scroll del hero — 2026-11-10

- Sustituye la decisión anterior de alto rígido: `min-h-dvh` en el hero, sin área central con overflow/scroll interno. Ocupa como mínimo la pantalla y crece si hace falta. KPIs en flujo normal con el resto de la página.

## Proceso en timeline responsivo — 2026-11-10

- Sección “Del clic a la entrega” con tres pasos solicitados: registro, pedido y seguimiento. Se retira el cuarto paso de control de este bloque.
- Timeline vertical hasta lg: iconos de 56/64 px, badges numéricos de 28 px, número decorativo junto al título y texto flex-1 min-w-0 sin max-width. Lista ordenada y entradas independientes conservadas.
- Desde lg, tres columnas con conexión horizontal. Encabezado compacto con badge y contraste claro/oscuro.
- Verificado en Chromium en ambos temas a 320–1920 px: sin desbordes ni errores JS, timeline de una columna hasta md y tres desde lg. `build` y `build:demo` pasan.

## Corrección de pasos del proceso — 2026-11-10

- Se recupera el cuarto paso “Mantén el control” con CheckCheck y el texto anterior. Escritorio vuelve a cuatro columnas; móvil conserva timeline vertical.
- Eliminados badges numéricos sobre los iconos. Solo se muestran los números grandes junto a los títulos.

## Footer de landing compartido con login — 2026-11-10

- `components/layout/LandingFooter.tsx` extrae el footer de Home y lo reutiliza en `/login` desde App, sin duplicación. Otros accesos y portales conservan Footer anterior.
- Enlaces Nosotros/Servicios/Contacto apuntan a `/#...` para volver correctamente a la landing desde login. Conserva aspecto, textura radial y soporte de tema.

## Header de landing en login — 2026-11-10

- `/login` reutiliza `<Navbar hero />`: cabecera fija de cristal, logo, enlaces, acciones y menú móvil iguales a la landing. El marco del formulario conserva su padding superior. Otras rutas mantienen su variante anterior.

## JSBot compartido con login — 2026-11-10

- App monta una única instancia de JSBot en `/` y `/login`; se retira su montaje directo de Home. Comparte burbuja, panel y conversación local entre esas dos rutas, sin duplicación. Otras rutas no muestran el chatbot.

## Scroll al entrar a login — 2026-11-10

- ScrollToHash reinicia la posición a 0 de forma instantánea con useLayoutEffect en cada navegación a `/login` (pathname y location.key), evitando heredar el scroll de la landing y el desplazamiento suave global. Los enlaces a secciones de la landing conservan su comportamiento.

## Qué hay hecho

- **Landing** (`pages/Home.tsx`): Hero a 90vh/100vh con **navbar propio** (`<Navbar hero />`), carrusel de fotos con overlay `slate-950` (90/70/100 %), badge, título de 3xl a 8xl, barra de rastreo que lleva a `/track?n=...`, CTAs e indicador lateral de scroll. Después: estadísticas en tarjetas (`+12,000`, `99.3%`, `+180`, `24/7`), "Quiénes Somos" en bento 7/5 con iconos de **Lucide**, servicios en 3 columnas con iconos Lucide y entrada escalonada, cómo funciona, CTA y contacto.
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
8. **Stats y “Quiénes Somos” usan `bg-slate-50 dark:bg-slate-950` y Lucide.** Las métricas van en tarjetas 2×2 en celular y 4 columnas desde `md`; los beneficios usan `ShieldCheck`, `Receipt`, `LocateFixed` y `Headset` (`lucide-react`, agregado como dependencia). No vuelvas a los emojis ni a los estilos del prototipo en esas secciones. Las stats se superponen al Hero (`-mt-12 sm:-mt-16`) y el fondo continuo vive en el contenedor de `Home` (`bg-slate-50 dark:bg-slate-950`); no pongas fondo propio en la sección de stats/about ni quites el gradiente inferior del Hero. La línea horizontal que cruza los KPIs va a `top-1/2` con `border-slate-300/80 dark:border-slate-700/60` y `z-0`; las tarjetas van en `z-10`. Las tarjetas tienen `p-4 sm:p-6` para que `+12,000` no desborde a 320 px. El Hero **no** tiene indicador central ni puntos de carrusel: el indicador lateral de mouse/“Scroll” aparece desde `sm`, abajo a la derecha (`bottom-24`, `z-20`) y con `pointer-events-none` para no chocar con los KPIs. La sección de Servicios se ajustó al mismo esquema claro/oscuro para no dejar texto blanco sobre fondo claro.
9. **Servicios usa Lucide y un reveal nativo.** Los seis servicios usan `Truck`, `Zap`, `Globe`, `Warehouse`, `Activity` y `FileText`; la cuadrícula es 1/2/3 columnas. El encabezado y las tarjetas aparecen con `useEnVista` (IntersectionObserver) + la animación CSS `servicio-entra`, con retrasos de 90 ms por tarjeta. No agregues Framer Motion solo por esta sección; si se necesita una animación más compleja, se evalúa aparte. El wrapper `.servicio-reveal` es independiente de la tarjeta para que el `hover:-translate-y` siga funcionando.

9. **La animación de entrada del login vive en `components/intro/` y solo la usa `pages/Login.tsx`.** Es la misma de la oficina (`js-logistics/frontend/src/pages/intro/`, decisión 15 de su `docs/ESTADO.md`): un solo reloj con `requestAnimationFrame` a 60 cuadros por segundo, las mismas curvas y resortes (aquí escritos a mano en `tiempos.ts`, sin el paquete `motion`) y 4 s en total. Lo propio del portal: el primer mensajero sale del pin de Cali, la telemetría dice "ABRIENDO EL PORTAL DE CLIENTES…", la barra dice "CARGANDO PORTAL" y se vuelve "Ingresar al portal →". Reglas: (a) **el fondo (malla, luces y mapa) no se anima**: está igual desde el primer cuadro; la "cámara" y el temblor solo mueven el contenido. (b) Sale en cada carga del login, nunca con "reducir movimiento", y se salta con clic, toque, tecla, foco o al enviar. (c) El formulario, el badge y el botón son los reales; la animación solo les pasa estilos por la prop opcional `intro` de `MarcoAcceso` y `BotonAcceso`, y `Recuperar` y `Restablecer` no la pasan. No cambies el árbol de elementos entre "con intro" y "sin intro" (el botón real se tapa con `clip-path` y la barra es un hermano absoluto). (d) Con la animación, el bloque del contenido no lleva `animate-fade-up` sino `will-change: opacity`: la animación de siempre deja ese bloque como raíz del desenfoque de la tarjeta (el mapa se ve a través del vidrio) y sin eso el vidrio queda más opaco. Con eso el último cuadro es idéntico, píxel a píxel, al login sin animación (revisado en Chrome a 1440×900 y 390×844). (e) La marca blanca es `public/img/marca-blanca.webp`, copiada de la oficina.

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

- **2026-11-10:** login: animación de entrada como la del login de oficina (decisión 9), con el fondo intacto. Comparada cuadro a cuadro a 1440×900 y 390×844; último cuadro idéntico al login de antes; sin desborde a 320, 360 y 390 px.
- **2026-11-10:** Servicios: seis tarjetas con iconos Lucide (`Truck`, `Zap`, `Globe`, `Warehouse`, `Activity`, `FileText`), grid 1/2/3 columnas, encabezado centrado y reveal escalonado al hacer scroll con `IntersectionObserver` + CSS (`servicio-entra`, 90 ms por tarjeta), sin Framer Motion. Revisado a 320, 390, 640, 768, 1024 y 1440 px en claro/oscuro, sin desbordes.
- **2026-11-10:** Hero: se quitó el “Ver más” central y los puntos del carrusel; nuevo indicador lateral de mouse/“Scroll” desde `sm` en la esquina inferior derecha (`bottom-24`, `z-20`, `pointer-events-none`) para no chocar con los KPIs. Se mantienen el gradiente inferior, el solape `-mt-12/-16` y la línea Slate a la mitad de los KPIs. Revisado a 320, 390, 640, 1024 y 1440 px sin colisiones ni scroll horizontal.
- **2026-11-10:** landing: Stats en tarjetas 2×2/4 columnas y “Quiénes Somos” en bento 7/5 con iconos de Lucide (`lucide-react` agregado). Ambos adaptados a claro/oscuro; Servicios también se adaptó para no quedar con texto blanco sobre fondo claro. Revisado a 320, 360, 390, 640, 768, 1024 y 1440 px sin desbordes.
- **2026-11-10:** portada: Hero rediseñado con navbar propio, overlay `slate-950`, badge, escala 3xl–8xl y barra de rastreo que abre `/track?n=...`; se agregaron `xs` y `opacity-35` en Tailwind. La barra y los CTA inferiores escalan en `lg`/`xl` (`max-w-xl`/`2xl`, `text-base`, más padding) y conservan el apilado bajo 400 px. Revisado a 320, 360, 390, 400, 640, 768, 1024, 1280, 1440 y 1920 px sin desbordes. Carrusel conservado; indicadores ocultos en pantallas menores a 400 px.
- **2026-11-10:** login: el fondo ahora es un mapa del mundo real y lleva un pin en la sede principal (Cali). Revisado a 320, 390, 820 y 1440 px en modo demo.
- **2026-11-09:** login: enlace “¿Olvidaste tu contraseña?” y páginas públicas `/recuperar`, `/restablecer` y `/activar`, con el mismo diseño del login (marco compartido en `components/acceso.tsx`). Revisadas a 390 px en modo demo.
- **2026-11-09:** revisión de la documentación; se agregó este archivo y se corrigió en `AGENTS.md` la regla de la landing.
- **2026-11-07/08:** rediseño de la portada (carrusel), del menú móvil y del login; fotos de ejemplo; corrección de desbordes laterales en móvil.
