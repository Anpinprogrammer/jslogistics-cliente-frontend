# Estado del proyecto y memoria para agentes de IA

## `/api` de Vercel apunta a api.jslogistics.pro — 2026-11-13

- `vercel.json` reescribe `/api/:path*` hacia `https://api.jslogistics.pro`, el dominio propio del servicio de Render (el de Render es `jslogisticscali-api.onrender.com`). Antes apuntaba a `js-logistics.onrender.com`, que no es el servicio de producción. La app de oficina tiene el mismo cambio.
- En Vercel no va `VITE_API_URL` ni `REACT_APP_API_URL` (esta última no la lee Vite). En Render, `TRUST_PROXY=2`.

## Formato y consultas rápidas de JSBot — 2026-11-12

- `MensajeAsistente` renderiza párrafos, saltos, viñetas (-/•), negritas y cápsulas de guía sin HTML ni enlaces ejecutables; solo mensajes del bot. El historial enviado al servidor conserva el texto original.
- Panel compartido: fondo blanco/oscuro, burbujas con contraste y tres consultas rápidas persistentes encima del input, deshabilitadas al cargar sesión/enviar.

## Solicitar envío abre arriba — 2026-11-12

- `ScrollToHash` restablece arriba al entrar a `/register` o `/solicitar-envio`, igual que el login.
- El desplazamiento al formulario compara `pasoAnterior` con `currentStep`: solo se ejecuta al cambiar realmente de paso, nunca al montar ni al repetir efectos bajo StrictMode. No usar una bandera que se consume en el primer efecto para omitir el montaje.

## Solicitar envío en tres pasos en todas las pantallas — 2026-11-12

- `/register` (también su alias `/solicitar-envio`) usa un único formulario de tres pasos para móvil, tablet y escritorio: Recogida → Paquetes → Destino y confirmación. Se eliminó el formulario completo duplicado de escritorio.
- Se conservan validación por paso, avance con Enter, resumen final, regreso a pasos con errores del servidor y confirmación de envío. Cambiar el ancho ya no cambia el formulario ni oculta el progreso. Sustituye la decisión anterior de mantener el formulario largo en escritorio.

## Skeleton del Inicio del cliente — 2026-11-12

- `portal/clasico/InicioSkeleton.tsx` reproduce el saludo, cuatro KPIs, dona de efectividad, barras de 30 días y listas de pedidos/movimientos con las mismas clases/grid del Inicio. Usa únicamente variables del tema del portal (`--papel`, `--linea`); tarjetas blancas en claro, sin pulso sobre el contenedor, y movimiento reducido mediante los estilos `esq-*` existentes.
- Se muestra dentro del marco con sidebar/header visibles al cargar ficha en Inicio, en su Suspense y hasta recibir pedidos/cuenta. No se muestra a pantalla completa antes de la navegación; los errores conservan sus mensajes. La pestaña activa se precarga en paralelo con sus datos.

## Colores claros del rastreo de escritorio — 2026-11-12

- En `landing.css`, las reglas de `html:not(.dark) .landing-tracking` desde 1024 px (el corte real del box) cambian únicamente colores de superficie, borde, sombra, textos e input. No se modifica estructura, medidas, tipografía ni desenfoque; tampoco móvil ni ninguna regla oscura. Se conserva el botón cian original.

## Input de rastreo móvil claro, sin tarjeta — 2026-11-12

- Solo bajo md y en Light Mode, la cápsula original del input usa blanco, borde claro y texto oscuro; no se añade contenedor, padding ni tarjeta al formulario. Botón cian y enlace flotante originales. Escritorio y Dark Mode conservan sus estilos y espaciado.
- En móvil claro se reserva espacio bajo las métricas para JSBot; la separación superior original del Hero respecto al header se conserva.

## Superficie clara durante la intro del login — 2026-11-12

- La capa de revelado `login-intro-vidrio` usa blanco y sombra clara en Light Mode, igual que el formulario final, evitando el cambio brusco de gris a blanco. Sigue la clase `dark` que controla el Navbar, sin crear otra instancia del hook de tema.
- En oscuro conserva el fondo rgba(15,23,42,.6) y la sombra animada original mediante `--login-sombra-oscura`. No se tocaron el mapa, sus coordenadas ni sus animaciones.

## Contraste del login claro — 2026-11-12

- Tarjeta blanca sólida, labels en negrita, bordes de inputs y cápsulas claras bajo el subtítulo, la sede y el pie. Estilos oscuros conservados.
- La viñeta `loginVineta` está dentro del SVG: solo en el login claro se oculta su rectángulo, sin modificar gradiente, trazados, coordenadas, puntos ni animaciones del mapa. Esta excepción visual sustituye la exigencia anterior de conservar visible la viñeta interna en claro.

## Login con modo claro — 2026-11-12

- Por pedido explícito, el login ahora sigue el tema del Navbar: fondo blanco en claro, oscuro en dark, tarjeta de vidrio y textos/campos con contraste en ambos temas. `MarcoAcceso` lo activa con `seguirTema`; recuperar/restablecer conservan su diseño anterior.
- No modificar el mapa para adaptar el tema: `MapaSede`, SVG, viñeta interna, rutas, puntos, pin de Cali y animaciones permanecen intactos. Esta decisión sustituye la regla anterior de login siempre oscuro solo para `/login`.


## Detalle del pedido que se actualiza solo — 2026-11-12

- **Causa:** `VerPedido` tomaba el pedido de la lista completa (`d.pedidos`, que se refresca cada 1 a 5 min) y desactivaba la consulta propia del detalle cuando lo encontraba ahí. La tabla de "Mis pedidos" usa la página (cada 60 s), así que mostraba el estado nuevo mientras la barra de rastreo seguía con el viejo hasta varios F5.
- **Ahora:** `usePedidoDetalle(guia)` siempre pide `GET /pedidos/:guia` (`staleTime: 0`; lo que hay en memoria solo se muestra mientras llega), revisa cada 15 s mientras el pedido no esté cerrado o tenga cambio por recibir, y también al volver a la pestaña. TanStack no consulta con la pestaña oculta. Si el estado del detalle difiere del de la lista, se invalidan las listas. Las fotos (`usePruebas`) llevan el estado en la clave y se vuelven a pedir cuando cambia.
- El backend no cachea respuestas (no hay `Cache-Control` ni ETag propios en `/pedidos`); no hizo falta tocarlo.

## Carga bajo demanda y pestaña que sobrevive al F5 — 2026-11-12

- **Portal dividido por pestaña.** `PortalClasico.tsx` es solo el marco (menú, barra, campanita y rutas). `Inicio.tsx`, `Pedidos.tsx`, `MisSolicitudes.tsx`, `Cuenta.tsx`, `VerPedido.tsx` y `NuevoPedido.tsx` se cargan con `React.lazy` solo al abrirlos (fallback `CargandoVista` de `piezas.tsx`, estilos `esq-*` al final de `clasico.css`); el menú y el botón "Nuevo pedido" adelantan la descarga al pasar el puntero o el foco. `HojaFiltros.tsx` es la hoja de filtros compartida. `lineaPedido` y `LOGO` viven en `piezas.tsx`. Si agregas una pestaña, sigue el mismo patrón (`cargar` en el marco).
- **JSBot**: `JSBot.tsx` es solo la burbuja y el oyente de `JSBOT_ABRIR` (ahora en `jsbot/evento.ts`); el panel (`JSBotPanel.tsx`) se descarga y monta la primera vez que se abre y luego queda montado para no perder la conversación. Entra con la animación de siempre (se abre dos cuadros después de montarse).
- **Avisos**: el `ToastContainer` y el CSS de react-toastify están en `components/Avisos.tsx` (+ `avisos.css`, donde quedaron los ajustes `.jsl-toast`), que `App.tsx` monta cuando el navegador queda libre. Un aviso que salga antes queda en la cola de react-toastify y se muestra al montarse. `clientToast` no cambió.
- **`vite.config.ts`**: solo React (`react`) y router + TanStack Query (`librerias`) van en archivos fijos; lucide, react-toastify (`avisos`) y axios van con quien los usa. Antes todo `node_modules` iba en `librerias` y la portada bajaba los íconos del portal y los avisos. Resultado en la portada: de ~102 KB a ~87 KB de JS comprimido y 15 KB menos de CSS; el portal pasó de un archivo de 91 KB a un marco de 32 KB más la pestaña abierta (4–20 KB).
- **Datos bajo demanda**: la lista completa de pedidos (`usePedidosCliente`, la consulta más pesada) ya no bloquea el portal. Se pide de una vez en el Inicio; en Mis pedidos y Mi cuenta primero va lo de la pantalla y la lista sale cuando el navegador queda libre (contadores del menú y de los filtros), con refresco cada 5 min en vez de cada minuto. `useDatosCliente(cargarPedidos, refresco)` expone `pedidosListos`/`errorPedidos`; `cargando`/`error` ahora son solo de la ficha. El recibo de cuadre pide la lista si aún no está. El detalle de un pedido usa lo que ya está en memoria (lista o página) y, si no está (un F5 con `?ver=`), pide solo esa guía (`usePedidoDetalle`, `GET /pedidos/:guia`). La página de "Mis pedidos" no se pide estando en "Mis solicitudes", ni el historial estando en Configuración.
- **Caché**: es la de TanStack Query; `utils/queryCache.ts` define los tiempos (`FRESCO.corto` 30 s para listas, `medio` 60 s para la lista completa y el saldo, `largo` 5 min para la ficha; `EN_MEMORIA` 10 min) y `invalidar(qc, 'pedidos' | 'cuenta' | 'solicitudes' | 'ficha')` para después de cada mutación. No armes una segunda caché aparte.
- **Pestaña y sub-pestaña tras F5** (`hooks/usePersistedTab.ts`): la pestaña principal es la ruta y la sub-pestaña `?v=` (`solicitudes` en Mis pedidos, `configuracion` en Mi cuenta, que antes se perdía). `sessionStorage` `js_client_nav` guarda `{ usuario, rol, tab, subtabs }` como respaldo y solo se usa al llegar al portal sin nada en la URL (carga de página o justo después de iniciar sesión, `state.restaurarNav`): un clic en el menú o un acceso del Inicio (`?f=ruta`) no se cambian por lo guardado. Si la sesión es de otra persona o rol se descarta, y `salir()` lo borra. La app de oficina usará su propia clave (`js_admin_nav`), en el otro repo.
- Visto de paso, sin tocar: en escritorio con tema claro la campanita con avisos sin leer se ve en blanco sobre blanco (`.campana-cliente.con-nuevas{color:#fff}` le gana a la regla de escritorio).

## Logo de WhatsApp — 2026-11-12

- `src/components/icons/WhatsAppIcon.tsx` es el logotipo oficial de WhatsApp (SVG relleno con `currentColor`, `aria-hidden`). Lucide no trae logos de marcas: **todo botón, enlace o campo de WhatsApp usa este componente**, no `MessageCircle` ni `Phone`.
- Dónde está: el enlace "Hablar con una persona por WhatsApp" de JSBot (`className="w-4 h-4 shrink-0"`) y los campos "Teléfono / WhatsApp" de Mi cuenta y de Nuevo pedido. En el clásico se pasa `className=""` para no meter Tailwind: el tamaño lo da `.cuenta-input>svg` de `clasico.css`. El teléfono de quien recibe sigue con `Phone` (no es un WhatsApp).
## Nuevo pedido en 3 pasos — 2026-11-12

- `NuevoPedido.tsx` ya no es un formulario largo: son 3 pasos de a uno por pantalla (**Recogida** → **Entrega** → **Paquetes**) con indicador de progreso (barras y "1. Recogida"…; los pasos ya hechos se pueden tocar para volver). Pie fijo: Cancelar / "Siguiente: Entrega"; Atrás / "Siguiente: Paquetes"; Atrás / "Solicitar pedido" (con "Enviando…"). Enter en un campo avanza de paso; solo el último envía.
- **Validación por paso** (`PASOS` + `errores()`): "Siguiente" solo valida los campos del paso (recogida: nombre, teléfono, correo y dirección; entrega: quien recibe y dirección; paquetes: cantidad y peso), avisa con `clientToast.warning` y deja el cursor en el primer campo malo. Al enviar se vuelve a validar todo y, si algo falló en un paso anterior (o el servidor devuelve `campos`), se regresa a ese paso.
- **Modal centrado también en el celular**: `Dialogo` variante `nuevo` (`dialog.dialogo-nuevo`, máx. 512 px, 86 dvh, fondo `rgba(2,6,23,.75)` con desenfoque); es la única variante del portal que no sale como hoja desde abajo. Estilos `np-*` al final de `clasico.css`.
- No se agregaron campos: el backend (`POST /solicitudes/portal`) no recibe "indicaciones/referencia" ni "valor a cobrar / notas". Si se quieren, primero va el campo en el backend. Los estados, el precargado desde la ficha, la nota "Cali, Valle del Cauca", la petición y el aviso de éxito siguen igual.

## Filtros en Mis solicitudes — 2026-11-12

- "Mis solicitudes" tiene el mismo sistema de filtros que "Mis pedidos": buscador (con retraso de 400 ms), fecha con `SingleDatePicker` + "Hoy" y píldoras de estado en escritorio (Todas, Pendientes, Por confirmar, Aprobadas por JS, Rechazadas); en el celular, buscador + botón Filtros con contador y la misma hoja inferior (`HojaFiltros`, ahora genérica: recibe los textos y los estados). Los grupos salen de `estado`: pendientes = `pendiente`, por confirmar = `cotizada`, aprobadas = `confirmada` + `asignada`.
- **Se filtra en el navegador**: `GET /solicitudes/mias` todavía no acepta búsqueda, estado ni fecha (esos filtros solo existen en el `GET /solicitudes` de la oficina). Con algún filtro puesto se usan las últimas 50 solicitudes (`useSolicitudesRecientes`, la misma consulta de la campanita) y se pagina en el cliente; sin filtros se sigue paginando en el servidor. Los contadores de las píldoras solo se muestran si el cliente tiene menos de 50 (si no, serían inexactos) y, si hay 50, se avisa "Buscando entre tus últimas 50 solicitudes". Pendiente en el backend: `search`, `status` y `date` en `/solicitudes/mias`; cuando existan, pasarlos a la consulta y quitar el filtrado local (`filtrarSolicitudes`).

## Barra inferior y filtros de Mis pedidos en el celular — 2026-11-12

- **Barra inferior (`.pestanas`, < 960 px):** pegada abajo con las esquinas de arriba redondeadas (24 px), fondo `--papel` al 95 % con desenfoque, sombra hacia arriba y área segura (`max(.65rem, safe-area)`). Es un grid de 3 columnas de máximo 448 px centrado; el activo va en azul cielo (`rgba(14,165,233,.12)`, texto `#0284c7` / `#38bdf8` en oscuro) con el ícono más grueso. La burbuja roja va pegada al ícono con un anillo del color del fondo. Reglas al final de `clasico.css`. Ojo: como esas reglas van al final, el `display:none` de escritorio se repite ahí; si cambias el `display` de `.pestanas`, revisa que no aparezca en 1440 px.
- **Espacio para la barra:** `main` deja 112 px abajo en el celular (≈ `pb-28`) y vuelve a 56/64/72 px en escritorio.
- **Mis pedidos en el celular (< 960 px):** solo se ven el buscador (con botón para borrar) y el botón **Filtros** con una burbuja que cuenta los filtros activos (estado distinto de "Todos" y fecha). Las píldoras y la fecha se ocultan con CSS y pasan a una hoja inferior (`HojaFiltros` en `PortalClasico.tsx`, montada con `Dialogo` variante `filtros`): select de estado con sus contadores (Todos, Aceptados, En ruta, Entregados, Devueltos, Cambios por recibir), fecha con flechas, `input date` y "Hoy", y los botones Limpiar filtros / Aplicar filtros. Los cambios de la hoja son un borrador: solo se aplican con "Aplicar" (o "Limpiar", que aplica todo vacío) para no pedir la lista con cada flecha. El estado sigue en la URL (`?f=`), así los accesos del Inicio siguen funcionando.
- **`SingleDatePicker` (`src/components/ui/SingleDatePicker.tsx`):** calendario propio (botón con la fecha "12 nov 2026" + "Cambiar", meses en español, semana desde el lunes, "Hoy" con la hora de Colombia, `max` para no elegir días futuros). Reemplaza el `input type="date"` en la hoja de filtros de Mis pedidos y en "Fecha del recibo" (Mi cuenta → Recibo de cuadre), porque el nativo se sale de su caja en iOS/Safari. En el celular el calendario sale centrado abajo con un velo; desde 960 px es un popover bajo el botón (o arriba si no cabe). Escape cierra solo el calendario, no la hoja que lo contiene. Sus estilos (`sdp-*`) están al final de `clasico.css` porque hoy solo lo usa el portal; si se usa en la landing, hay que darle estilos fuera de `.clasico`. El historial de movimientos no tiene filtro de fecha ni píldoras, así que no hubo nada que cambiar ahí.
- **Escritorio sin cambios:** desde 960 px se ven el buscador, la fecha, "Hoy" y las píldoras como antes; el botón Filtros y la hoja no aparecen. La sub-pestaña "Mis solicitudes" no se tocó.

## Header móvil del portal y tipografía de Mis solicitudes — 2026-11-12

- **Header móvil (< 960 px, el mismo corte del escritorio de este portal):** la barra es un grid de tres zonas. Logo a la izquierda (sin el texto "JS Logistics"), botón JSBot en el centro exacto y a la derecha la campana y la burbuja de la cuenta. Tema y "Salir" ya no van sueltos en el celular: viven en el menú de la burbuja (`PerfilMovil` en `PortalClasico.tsx`: nombre, Modo claro/oscuro y Cerrar sesión en rojo; se cierra al tocar fuera —`mousedown`/`touchstart`—, con Escape y al elegir una opción). La burbuja se muestra siempre, aunque el cliente no tenga nombre (iniciales "CP").
- **Escritorio sin cambios:** `.barra-der` es `display: contents` desde 960 px y `.perfil-movil` se oculta, así que siguen el orden JSBot, campana, tema, avatar y Salir. Si agregas un botón a la barra, decide si va en el celular (grupo `.barra-der`) o solo en escritorio.
- **Mis solicitudes:** textos a 12 px en celular y 14 px desde 640 px (subpestañas, explicación, subtítulos, datos del modal); títulos y valor del domicilio a 14/16 px; encabezado "Razón del rechazo" a 16/18 px. Las reglas están al final de `clasico.css` (no en Tailwind). El estado y la fecha de la fila móvil ahora pasan a otra línea en vez de cortarse con "…".

## Campanita y propuesta de domicilio — 2026-11-12

- La barra del portal tiene una campanita (`CampanitaCliente`, en `portal/clasico/Notificaciones.tsx`) con contador de no leídas. El icono con novedades usa `color:inherit` (toma el color de la barra): no fijarlo en blanco porque en tema claro desaparece sobre el fondo blanco. El panel muestra un aviso por solicitud según su estado actual: recibida, propuesta de domicilio, propuesta aceptada, asignada con guía o rechazada. Se abre como panel fijo debajo de la barra; en móvil ocupa el ancho de la pantalla. El botón vive en `.barra-der` para que en celular quede junto a la burbuja de la cuenta.
- Las notificaciones se derivan de `GET /solicitudes/mias` (consulta `useSolicitudesRecientes`, página 1 con 50). El sondeo de 30 s queda como respaldo: `useEventosSolicitudes` abre `GET /api/eventos` y refresca al instante cuando el backend avisa de una solicitud propia. No hay tabla de avisos: la clave es `id:estado:actualizado`, y las leídas viven en `localStorage` (`jsl_cliente_notif_leidas_v1`). La primera carga marca como leído el historial; deja sin leer las propuestas y las asignaciones/rechazos de los últimos 7 días, por si el cliente estaba desconectado.
- Cuando aparece una propuesta nueva (`cotizada`) se abre solo un modal centrado con los datos de la solicitud y la misma tarjeta de respuesta. Dura 10 s con barra de progreso; si el cliente interactúa (puntero, foco, tecla, cambio o rueda) el tiempo se detiene y el aviso queda abierto. Se cierra con la X, Escape o al aceptar/rechazar. Si llegan varias, se encolan y se muestran de a una.
- Al quedar `asignada`, el cliente recibe otro aviso de 10 s: “Tu pedido fue aprobado y asignado”, con el nombre del mensajero (`mensajeroNombre`), el domicilio y la guía; el botón “Entendido” lo cierra. Si queda `rechazada`, el aviso final muestra la razón. Los dos son informativos y también quedan en la campanita.
- Solo las solicitudes `origen: "portal"` entran en estos avisos y en `RespuestaPropuesta`. Las de la landing que la oficina vincule a una ficha aparecen en “Mis solicitudes” como información, pero su confirmación sigue por WhatsApp.
- El cliente responde con `POST /solicitudes/mias/:id/responder` (`useResponderSolicitud`): aceptar deja la solicitud `confirmada` para que la oficina asigne mensajero; rechazar la deja `rechazada` con la razón opcional. La misma tarjeta `RespuestaPropuesta` se usa en la campanita, el aviso automático y el detalle de “Mis solicitudes”, así el cliente ya no depende solo de responder por WhatsApp.
- El panel y el aviso se montan con `createPortal` dentro de `.clasico` (el CSS del portal está prefijado; fuera de ese contenedor se pierden los estilos). Modo demo: `demo.responderSolicitud` aplica el cambio en memoria y las solicitudes de ejemplo usan una fecha fija por sesión para que la campanita no las vea “nuevas” en cada consulta.

## Avisos con react-toastify — 2026-11-12

- Dependencia nueva: `react-toastify`. `<ToastContainer>` está en `App.tsx` (arriba a la derecha, 3,5 s, pausa al pasar el mouse, máximo 3) y sus estilos base se importan ahí; el redondeo y la fuente están en `index.css` (`.jsl-toast`). El helper es `utils/clientToast.ts` (`success`, `error`, `info`, `warning` y `auto`).
- El `useToast` de `PortalClasico.tsx` (un `<div className="toast">` propio) se quitó: `toast(texto)` ahora es `clientToast.auto`, así que perfil actualizado, contraseña, cambio confirmado, reintento, copiar recibo, etc. salen como aviso de Toastify sin tocar esas llamadas. Las reglas `.toast` de `clasico.css` quedaron sin uso (es copia del prototipo; no las borres sin revisar).
- Login, Recuperar, Restablecer, Register (solicitar envío), NuevoPedido y Track: el error que llega del servidor o de la red (el `catch`) sale como aviso y se quitó el bloque rojo dentro del formulario y su estado `error`. Los errores de un campo (`campos`, validación por paso) siguen debajo del campo. Éxitos nuevos: solicitud recibida (Register y NuevoPedido), enlace de recuperación enviado y contraseña guardada.
- Pendiente a propósito: en Mi cuenta (`Cuenta` en `PortalClasico.tsx`) los errores de perfil y de contraseña siguen en el formulario (`errorPerfil`, `errorClave`); falta decidir si pasan a aviso.
- La oficina (otro repo) usa SweetAlert2 para lo mismo; no mezclar librerías.

## Reintento de pedidos devueltos — 2026-11-12
- En el detalle de un pedido **devuelto** el cliente ve: "Estamos confirmando tu paquete" (el mensajero aún no dice dónde quedó), el botón **Reintentar entrega** (con el aviso de que el reintento se cobra como un domicilio y la devolución se sigue cobrando igual), "Pediste el reintento" o "Reintento en camino" con la guía nueva. Pedir el reintento no crea la guía: llama a `POST /pedidos/:guia/pedir-reintento` (`usePedirReintento`) y la oficina lo asigna a un mensajero.
- La guía nueva está enlazada (`reintentoDe` / `reintentos`): el detalle muestra "Guías de esta entrega" (`cadenaGuias` en `lib/negocio.ts`) y se salta de una a otra con `?ver=`.
- Modo demo: `pedirReintento` guarda el pedido en `localStorage` (`jsl_demo_reintentos`) y los devueltos más recientes quedan en cada caso (por confirmar, con el cliente, en la oficina, ya reintentado).
- Necesita el backend con `destino-devolucion`, `reintento` y `pedir-reintento` (PR del mismo nombre en `js-logistics`); si no, el botón responde error y avisa.

## Estado "Aceptado" y Mis solicitudes — 2026-11-12

- **Paginación sin total en Pedidos:** las sub-pestañas “Mis pedidos” y “Mis solicitudes” piden **5 registros en celular y 10 en computador** con `sinTotal=true`. El backend no ejecuta `COUNT(*)`: trae una fila extra y responde `hayMas`. El `PaginadorSinTotal` muestra solo “Página X” y habilita Anterior/Siguiente sin mostrar el total. El resumen global del portal (contadores del dashboard y de las píldoras) sigue usando la carga existente; la tabla ya no la usa para paginar.
- El pedido tiene un estado nuevo antes de "En ruta": `aceptado` (la oficina aprobó la solicitud y asignó mensajero, pero todavía no la recoge). Pasa a `pendiente` ("En ruta") cuando el mensajero le toma la foto al paquete. Textos y clases en `ESTADO_PEDIDO` de `lib/negocio.ts` (clase `etq acep`). El tracker del detalle es Aceptado → En ruta → Entregado/Devuelto, y "Mis pedidos" tiene el filtro "Aceptados".
- **Mis pedidos** tiene dos sub-pestañas (`cuenta-tabs pedidos-tabs`, en la URL `?v=solicitudes`): "Mis pedidos" y "Mis solicitudes". Las solicitudes vienen de `GET /api/solicitudes/mias` (`useMisSolicitudes`, con `opcional()` por si el backend aún no la tiene) y cada tarjeta reutiliza el `pod-stepper`: Solicitado → Pendiente de aprobación JS / Pendiente de tu aprobación → Aprobada por JS / Rechazada (con la razón). Los pasos salen de `pasosSolicitud()` en `lib/negocio.ts`.
- `useNuevaSolicitud` ya tiene rama demo (antes llamaba a la API también en demo) y refresca "Mis solicitudes".
- Necesita el backend de `js-logistics` con `db:migrar` aplicado (estado `aceptado`, `/solicitudes/mias`).

## Nuevo pedido desde el portal — 2026-11-11

- En **Mis pedidos** hay un botón **Nuevo pedido** (arriba a la derecha; ancho completo en celular) que abre un `Dialogo` variante `pedido` con `portal/clasico/NuevoPedido.tsx`. Pide los mismos campos de `/register`, con nombre, teléfono, correo y dirección de recogida tomados de la ficha y la cuenta, editables solo para ese pedido (no cambian la ficha).
- Manda `POST /api/solicitudes/portal` (`useNuevaSolicitud` en `api/cliente.ts`; demo en `demo.nuevaSolicitud`). Nunca manda `clienteId`: el backend lo toma de la sesión. No crea guía; el pedido aparece en la lista cuando la oficina asigna al mensajero.
- Estilos en `clasico.css` (clases `pedidos-cab`, `nuevo-*`), reutilizando `cuenta-campos`/`cuenta-input` y la cabecera del modal de pedido. Sin Tailwind.

## Menú público móvil — 2026-11-11

- Las acciones públicas del Navbar usan áreas táctiles de 48–52 px en el drawer; “Iniciar Sesión” y “Solicitar envío” pasan a 14 px y el CTA lleva gradiente cian. En escritorio ambos botones usan al menos 44 px de alto y 14 px de texto. La CTA apunta al alias público `/solicitar-envio`. Todas las variantes públicas usan el drawer hasta 1023 px para evitar que los enlaces de escritorio se recorten a 768 px.
- El drawer de `Navbar.tsx` entra desde arriba y sale hacia arriba en 480 ms. Sigue presente durante la salida para que `visibility` no corte la transición; el scroll permanece bloqueado y el foco vuelve al botón hamburguesa al terminar. Respeta `prefers-reduced-motion`.
- El menú móvil incluye “Inicio” con icono `Home`: lleva a `/` y desplaza al Hero igual que el logo. En sesión de cliente, el enlace del panel se llama “Mi portal” para distinguirlo de la portada. Cambiar entre modo claro y oscuro cierra la cortina con su animación de salida.

## Demo pública para el portafolio — 2026-11-11

- Guía en [`demo-publica.md`](demo-publica.md): cómo publicar este portal junto con la oficina y un backend de pruebas para que el flujo completo se pueda probar. La guía completa vive en `js-logistics/docs/demo-publica.md`.
- `src/api/solicitudes.ts` ya no tiene rama `DEMO`: el formulario siempre llama a `POST /api/solicitudes/publico`. Las vistas previas de Vercel (modo demo en memoria) envían a la API a la que apunte la reescritura de `vercel.json`.

## Solicitar envío (`/register`) — 2026-11-11

- En móvil (`lg:hidden`) el formulario es ahora un **wizard de 3 pasos**: Datos de Recogida, Detalles de Paquetes y Destino y Confirmación. Muestra un solo paso a la vez, barra de progreso, validación antes de avanzar, resumen de la recogida antes de enviar y transiciones horizontales (`registro-paso-der`/`registro-paso-izq`, con `prefers-reduced-motion`). El escritorio (`lg:block`) conserva el formulario completo de una sola página.
- `/register` (y su alias `/solicitar-envio`) ya no es el registro empresarial con contraseña: es el formulario público **Solicitar envío**, sin cuenta. Campos: nombre, teléfono, correo, dirección de recogida, cantidad de paquetes, peso total (opcional), nombre y teléfono (opcional) de quien recibe y dirección de entrega. Se manda a `POST /api/solicitudes/publico` con `src/api/solicitudes.ts`; en la oficina aparece en la campanita de `js-logistics/frontend`, y administración responde por WhatsApp con el valor del domicilio.
- La página dibuja su propio `Navbar hero` y `LandingFooter`, igual que `/track`; por eso `App.tsx` la excluye del marco general (`esSolicitud`). Mismo estilo de tarjeta que el rastreo.
- Tiene un campo trampa `sitio` (fuera de pantalla, `tabIndex -1`): si un robot lo llena, el backend descarta la solicitud. No lo quites. El backend limita por IP (5/hora, 15/día), así que un 429 se muestra tal cual al usuario.
- Se quitó `authAPI.register` de `services/api.ts` (apuntaba a un endpoint que no existe). Los textos "Registrarse" / "Crear mi cuenta" de la landing, el menú, el pie y el login pasaron a "Solicitar envío"; las cuentas de cliente las crea administración con "Dar acceso".

## Mi cuenta — 2026-11-10

- La navegación inferior del portal en móvil vuelve a ser una cápsula flotante a 4 px del borde inferior (más el área segura). Un degradado fijo detrás de ella desvanece el contenido al acercarse y cubre el hueco inferior con el color del tema; el contenido conserva espacio para no quedar tapado.
- Configuración usa tarjetas de igual altura en escritorio, campos con íconos integrados, dirección como textarea y controles independientes para mostrar u ocultar cada contraseña. La confirmación de contraseña para cambiar el correo mantiene un estado separado del formulario de seguridad.
- En XL, “Mi cuenta” aprovecha hasta 1600 px: balance y recibo ocupan el tercio izquierdo, y el historial paginado los dos tercios derechos. En móvil y tablet conserva una sola columna; Configuración mantiene dos columnas desde escritorio.
- El portal clásico separa “Movimientos & Estado Financiero” y “Configuración de Cuenta” en dos pestañas responsivas. Saldo y movimientos siguen usando los cálculos existentes; el recibo por fecha conserva su diálogo.
- Configuración permite guardar nombre de tienda, correo, teléfono y dirección de recogida mediante `PATCH /api/clientes/mi-perfil`. Cambiar correo exige la contraseña actual. La contraseña de acceso se cambia con `POST /api/auth/clave`.
- La dirección vive en `clientes.direccion_recogida`; se requiere aplicar el esquema actualizado del backend antes de desplegar el frontend. La demo mantiene los cambios en memoria hasta recargar.

Memoria compartida entre sesiones y agentes de este repo (landing y portal de clientes). Léela después de [AGENTS.md](../AGENTS.md). Si cambias algo que otro agente necesitaría saber (una decisión, una trampa, algo pendiente), **actualízala en el mismo PR**. Última revisión: 2026-11-09.

La memoria del repo hermano (backend y app de oficina) está en `js-logistics/docs/ESTADO.md`; ahí están también las trampas del entorno local compartidas (puerto 4000 ocupado, 403 del backend, receta para medir desbordes).

## JSBot conectado — 2026-11-10

- `components/jsbot/JSBot.tsx` envía la conversación mediante `api()` (`credentials: include` y `X-JSL: 1`). Usa la respuesta JSON del endpoint, conserva hasta 19 mensajes por petición y muestra espera, errores, límites y enlace seguro de derivación a WhatsApp. La conversación se limpia cuando cambia la cuenta.
- Los clientes con sesión usan `POST /api/chatbot/mensajes` para consultas de sus pedidos. Los visitantes y otros roles usan `POST /api/chatbot/publico/mensajes` para información general y estado básico de una guía; el backend público ignora cookies y no expone detalles. En landing, login y rastreo se puede escribir sin sesión, con una invitación discreta a iniciar sesión para datos privados. El modo demo del frontend conserva una respuesta local rotulada como demostración; producción usa estos endpoints.
- Para que responda en producción, el backend necesita `ANTHROPIC_API_KEY` y datos reales en `chatbot/informacion-empresa.md`; ese archivo aún contiene ejemplos entre corchetes. No se añadieron llaves al frontend.

## Rastreo público — 2026-11-10

- `/track` usa el lenguaje visual claro/oscuro de la landing, búsqueda adaptable y seguimiento construido a partir de eventos reales del resultado; no inventa horas ni estados. En modo demo, los chips consultan tres guías generadas por `demo.pedidos()` y la vista está rotulada como demostración.
- JSBot aparece con la burbuja pública también en `/track`, `/rastrear` y `/tracking`; el portal del cliente conserva solo su acceso desde el header.
- Rastreo monta los mismos componentes `Navbar hero` y `LandingFooter` que la landing dentro de `.landing`; `App.tsx` omite allí su header y footer genéricos para evitar duplicados.
- La consulta heredada de producción sigue apuntando a `GET /api/track/:guia`; el backend actual no tiene ese endpoint. Está anotado en `README.md` como trabajo pendiente. No presentar la vista como rastreo en tiempo real hasta contar con un contrato y endpoint públicos.

## JSBot en el portal del cliente — 2026-11-10

- La misma instancia de JSBot se muestra en la landing, el login y todas las rutas `/cliente`, de modo que la conversación local se conserva al navegar entre ellas.
- El portal abre JSBot únicamente desde el botón de la barra superior en todos los tamaños; la burbuja flotante no se monta en ninguna vista del portal para no tapar tarjetas de pedidos ni pestañas. En landing y login se conserva la burbuja. El panel devuelve el foco al botón usado al cerrar.
- El botón del header muestra el icono `Bot` de Lucide y el texto «JSBot» incluso a 320 px; el punto verde queda como indicador secundario.

## Rediseño vigente de la landing — 2026-11-10

Por petición explícita del dueño, `Home.tsx` sustituye la composición anterior. Esta decisión prevalece sobre las descripciones históricas de stats, bento y Servicios más abajo.

- Portada editorial: hero a dos columnas con rastreo independiente, presentación con fotografía, servicios asimétricos, vista ilustrativa del portal, proceso en cuatro pasos, contacto y footer propios.
- React + TypeScript + Tailwind; `pages/landing.css` contiene tokens claro/oscuro y efectos limitados a `.landing`. Hero y cierre comercial mantienen paneles oscuros en ambos temas por contraste. No cambia el portal del cliente ni el acceso.
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

## Activación de cuentas en /activar-cuenta — 2026-11-11

- Los correos de activación del backend apuntan a `/activar-cuenta?token=…` (no a `/activar`). La ruta faltaba y el enlace caía en el 404: ahora abre `Restablecer`, igual que `/activar`, que se deja por los enlaces ya enviados. Hace falta para la migración del 16 de noviembre, cuando todos los clientes importados de Firebase reciben su invitación.

## Qué hay hecho

- **Landing** (`pages/Home.tsx`): Hero a 90vh/100vh con **navbar propio** (`<Navbar hero />`), carrusel de fotos con overlay `slate-950` (90/70/100 %), badge, título de 3xl a 8xl, barra de rastreo que lleva a `/track?n=...`, CTAs e indicador lateral de scroll. Después: estadísticas en tarjetas (`+12,000`, `99.3%`, `+180`, `24/7`), "Quiénes Somos" en bento 7/5 con iconos de **Lucide**, servicios en 3 columnas con iconos Lucide y entrada escalonada, cómo funciona, CTA y contacto.
- **Menú móvil** (`components/layout/Navbar.tsx`): overlay a pantalla completa, fondo `#070B19`/95 con blur, bloquea el scroll del `body`, cierra con Escape y al tocar un enlace, foco a la X al abrir. Se dibuja con `createPortal` en `document.body` porque el `<header>` usa `backdrop-filter`, que atrapa a los hijos `fixed` y rompería el "pantalla completa".
- **Login** (`pages/Login.tsx`): oscuro, mapa del mundo real (contorno de Natural Earth, punteado) con rutas animadas y un pin en la sede de Cali, tarjeta de cristal, caja DEMO con botones de copiar y "Rellenar" (solo con `VITE_DEMO=true`). Tiene el enlace "¿Olvidaste tu contraseña?", que abre `/recuperar`; las páginas `/restablecer`, `/activar` y `/activar-cuenta` abren los enlaces del correo. Las tres comparten el marco de `components/acceso.tsx`.
- **Portal del cliente:** un solo portal (`clasico/`), con el menú lateral de escritorio al estilo de la oficina, tema claro/oscuro con botón en la barra superior y layout fluido en XL/2XL; Mis pedidos pagina en el servidor (5 por página en celular, 10 en computador, `lib/pantalla.ts`) y su detalle tiene stepper, novedades y galería POD con lightbox; Mi cuenta pagina el historial de movimientos en el servidor (5 en celular, 10 en computador) y el recibo carga los movimientos completos solo al abrirlo; cada página se descarga cuando se visita. La vista de propuesta (`mejorado/`) se retiró.
- **Corrección de desbordes laterales en móvil** (portal y login revisados a 320–430 px).

## Decisiones que no son obvias (no las deshagas sin preguntar)

1. **El logo `public/img/icono-96.webp` solo se ve sobre fondo claro.** Es transparente: isotipo "JS" azul oscuro y letras "LOGISTICS CALI" **blancas**. Sobre fondo oscuro el isotipo se pierde; sobre un badge blanco las letras desaparecen. Por eso en el login, el menú móvil y el navbar del Hero va en un **badge claro** (degradado blanco → `sky-100`, halo cian) con la imagen **recortada y agrandada** (`absolute left-[-10%] top-[3%] w-[120%] max-w-none` dentro de un contenedor `overflow-hidden`), y "Logistics · Cali" se escribe como texto aparte. La barra global de las demás páginas sigue usando `/img/logo.png`.
2. **La landing y el login son siempre oscuros a propósito**, aunque el sitio tenga modo claro. En esas pantallas los colores van explícitos (`#070B19`, `#38bdf8`, `#0284c7`) en vez de las variantes `dark:`. La portada usa un **navbar propio dentro del Hero** con texto claro; el navbar global (login, registro, rastreo y portal) conserva los estilos por tema. Si se quiere arreglar el global, debe usar colores claros mientras no haya hecho scroll en `/` y `/login`; en `/` ya no aplica porque el navbar global se oculta.
3. **Las fotos del carrusel son de ejemplo** (Wikimedia Commons, CC BY-SA y CC0). Antes de publicar hay que cambiarlas por fotos propias de JS Logistics, con los mismos nombres. Detalles, tamaños y créditos en `public/img/hero/LEEME.md`. Si falta una foto, la diapositiva muestra un fondo de color y no se rompe.
4. **Un `grid` siempre lleva su columna base** (`grid grid-cols-1 lg:grid-cols-12`); sin ella, en móvil la columna se ensancha al contenido más largo y la tarjeta se sale de la pantalla (pasó en el Inicio del portal). Los textos largos en flex llevan `min-w-0`. `html { overflow-x: clip }` es solo red de seguridad.
5. **El carrusel respeta `prefers-reduced-motion`** (no rota solo), se pausa con la pestaña oculta y al pasar el mouse por los indicadores. No cambies el intervalo (5,5 s) ni el desvanecimiento (1000 ms) sin que lo pidan.

6. **El mapa del login va anclado a la columna del formulario, no a la pantalla** (`MapaSede` en `components/acceso.tsx`). Así el pin de Cali queda siempre en un sitio libre: en celular, a la izquierda del logo (el mundo completo queda detrás de la cabecera, porque la tarjeta tapa el resto); desde `md`, a la izquierda de la tarjeta. Si cambias el tamaño del logo o de la tarjeta, revisa que el pin y su etiqueta no queden tapados a 320, 390, 820 y 1440 px. El contorno (`components/mapaMundo.ts`) es generado desde Natural Earth 1:50m en proyección equirrectangular; las ciudades se ubican con `punto(longitud, latitud)`, no a ojo. En el celular (menos de 640 px) la columna llega a 320 px de ancho y deja al menos 20 px a cada lado (`px-5`), con badge de 56 px, título `text-xl` y espaciados más cortos; desde `sm` todo sigue igual. El mapa en celular va 4 px más arriba (`top-[calc(40px-33.05vw)]`) para que la etiqueta "Cali, Colombia" no toque el título a 320 px.
7. **La portada tiene su propio navbar dentro del Hero.** `App.tsx` oculta el `<Navbar />` global solo en `/`; `Home` renderiza `<Navbar hero />` como primer hijo del Hero para que la foto llegue hasta arriba. El navbar `hero` muestra los enlaces desde `lg`, botones redondeados y menú móvil a pantalla completa; el global sigue con `md` en las demás páginas. No dupliques navbars ni vuelvas a poner el global en `/` sin quitar el del Hero.
8. **Stats y “Quiénes Somos” usan `bg-slate-50 dark:bg-slate-950` y Lucide.** Las métricas van en tarjetas 2×2 en celular y 4 columnas desde `md`; los beneficios usan `ShieldCheck`, `Receipt`, `LocateFixed` y `Headset` (`lucide-react`, agregado como dependencia). No vuelvas a los emojis ni a los estilos del prototipo en esas secciones. Las stats se superponen al Hero (`-mt-12 sm:-mt-16`) y el fondo continuo vive en el contenedor de `Home` (`bg-slate-50 dark:bg-slate-950`); no pongas fondo propio en la sección de stats/about ni quites el gradiente inferior del Hero. La línea horizontal que cruza los KPIs va a `top-1/2` con `border-slate-300/80 dark:border-slate-700/60` y `z-0`; las tarjetas van en `z-10`. Las tarjetas tienen `p-4 sm:p-6` para que `+12,000` no desborde a 320 px. El Hero **no** tiene indicador central ni puntos de carrusel: el indicador lateral de mouse/“Scroll” aparece desde `sm`, abajo a la derecha (`bottom-24`, `z-20`) y con `pointer-events-none` para no chocar con los KPIs. La sección de Servicios se ajustó al mismo esquema claro/oscuro para no dejar texto blanco sobre fondo claro.
9. **Servicios usa Lucide y un reveal nativo.** Los seis servicios usan `Truck`, `Zap`, `Globe`, `Warehouse`, `Activity` y `FileText`; la cuadrícula es 1/2/3 columnas. El encabezado y las tarjetas aparecen con `useEnVista` (IntersectionObserver) + la animación CSS `servicio-entra`, con retrasos de 90 ms por tarjeta. No agregues Framer Motion solo por esta sección; si se necesita una animación más compleja, se evalúa aparte. El wrapper `.servicio-reveal` es independiente de la tarjeta para que el `hover:-translate-y` siga funcionando.

9. **La animación de entrada del login vive en `components/intro/` y solo la usa `pages/Login.tsx`.** Es la misma de la oficina (`js-logistics/frontend/src/pages/intro/`, decisión 15 de su `docs/ESTADO.md`): un solo reloj con `requestAnimationFrame` a 60 cuadros por segundo, las mismas curvas y resortes (aquí escritos a mano en `tiempos.ts`, sin el paquete `motion`) y 4 s en total. Lo propio del portal: el primer mensajero sale del pin de Cali, la telemetría dice "ABRIENDO EL PORTAL DE CLIENTES…", la barra dice "CARGANDO PORTAL" y se vuelve "Ingresar al portal →". Reglas: (a) **el fondo (malla, luces y mapa) no se anima**: está igual desde el primer cuadro; la "cámara" y el temblor solo mueven el contenido. (b) Sale en cada carga del login, nunca con "reducir movimiento", y se salta con clic, toque, tecla, foco o al enviar. (c) El formulario, el badge y el botón son los reales; la animación solo les pasa estilos por la prop opcional `intro` de `MarcoAcceso` y `BotonAcceso`, y `Recuperar` y `Restablecer` no la pasan. No cambies el árbol de elementos entre "con intro" y "sin intro" (el botón real se tapa con `clip-path` y la barra es un hermano absoluto). (d) Con la animación, el bloque del contenido no lleva `animate-fade-up` sino `will-change: opacity`: la animación de siempre deja ese bloque como raíz del desenfoque de la tarjeta (el mapa se ve a través del vidrio) y sin eso el vidrio queda más opaco. Con eso el último cuadro es idéntico, píxel a píxel, al login sin animación (revisado en Chrome a 1440×900 y 390×844). (e) La marca blanca es `public/img/marca-blanca.webp`, copiada de la oficina.
10. **El portal del cliente tiene tema propio y layout fluido.** El botón de la barra usa `useTheme` (la misma preferencia `jsl_theme` de la landing), pero el portal la aplica con `data-theme` en `.clasico`, no con la clase `dark`. El **menú lateral de escritorio se queda siempre oscuro** (`--lat-fijo-*`); la **barra superior sigue el tema en escritorio** (blanca en claro) y **siempre es oscura en móvil**; las pestañas móviles y el `theme-color` del navegador siguen el tema. Desde 1280 px `main` pierde el tope de 1240 px y usa todo el ancho; desde 1920 px el contenido se limita a 1600 px. La barra superior y el bloque del logo miden **76 px** y comparten el mismo borde inferior (`--shell-linea` en escritorio), para que la línea sea continua de lado a lado. El menú se colapsa a **76 px** con el botón del pie (solo escritorio) y queda solo con íconos. No agregues un segundo selector de tema, vuelvas al sidebar claro ni cambies una de las dos alturas por separado.
11. **Mis pedidos usa tarjetas y contadores globales.** La toolbar une búsqueda y fecha, las pills muestran el total de `d.pedidos` (todos los pedidos ya cargados, no solo la página visible) y la paginación sigue en el servidor. Cada pedido es un `button.pedido-card` con ícono de estado, badges, valor y chevron; no vuelvas al `button.fila` con la miniatura gris. La entrada escalonada usa la animación `pedido-entra` y respeta `prefers-reduced-motion`.
12. **El detalle del pedido es un modal de rastreo.** `Dialogo variante="pedido"` usa `.dlg-pedido` con cabecera fija y cuerpo con scroll; el stepper tiene tres pasos (Solicitado, En ruta, Entregado/Devuelto/Cambio) y una línea de progreso calculada con `progreso`. Las pruebas salen de `usePruebas` (URLs firmadas) y se abren en `.pod-visor`; no vuelvas a las cajas `.fotos`/`.visor` ni al `Cabecera` genérico en este detalle. La confirmación de la prenda de cambio es inline y no reemplaza el modal.
13. **Mi cuenta pagina el historial en el servidor.** `GET /clientes/:id/cuenta?pagina=&porPagina=` devuelve una página de `filas` (pedidos cerrados + movimientos), `total`, `paginas` y `saldo` calculado en SQL. El portal pide **5 en celular y 10 en computador** (`usePorPaginaCuenta`). `useDatosCliente` ya no trae todos los movimientos; el dashboard usa la primera página de 6 y el recibo pide los movimientos completos solo al pulsar “Ver recibo”. No vuelvas a `filasCuenta(d.pedidos, d.movimientos)` en la tabla ni al límite 1000 en la carga normal.

14. **“Nosotros” cambia de orden antes de `lg`.** En celular y tablet el orden es eyebrow + título, foto (con la tarjeta “Tu empresa tiene quién la mueva” *dentro* de la foto, con vidrio, y “Cali, Valle del Cauca” arriba) y luego texto, puntos y enlace. Se logra con un solo `grid` de tres hijos (título, foto, texto) en el orden del DOM; desde `lg` la foto va con `lg:col-start-1 lg:row-span-2` y el título y el texto en la columna 2 (`self-end` / `self-start`). Así hay un único `h2` y el escritorio queda idéntico píxel a píxel. No dupliques el título con `hidden`/`lg:hidden`.

15. **El rastreo del Hero es un solo formulario que cambia de forma.** Antes de `lg` es una barra de una línea (icono de paquete, campo y lupa a la derecha, con el enlace “¿Ya eres cliente?” debajo y los CTA justo después); desde `lg` es la tarjeta con título, texto y botón “Rastrear mi envío”. Es un único `<form>` con un único `#guiaHero` (sin duplicar por `block lg:hidden` / `hidden lg:block`); la etiqueta es `sr-only`. Envía a `/track?n=…` con Enter o con la lupa.

16. **Historial de movimientos en celular (≤ 600 px) muestra Fecha, Valor e info.** El detalle sale de la tabla (se cortaba y el Valor quedaba fuera de la vista) y se abre con el botón `Info` (solo el ícono, sin fondo, en el azul del tema) en una hoja inferior, que reutiliza `Dialogo` + `Cabecera` + `.datos` (ya es hoja inferior en celular). Se usa el corte de 600 px del portal, no el `sm` de 640 px de Tailwind, y las clases son de `clasico.css` (`.mov-det`, `.mov-info`, `.mov-info-btn`, `.mov-detalle`), nunca de Tailwind. Desde 601 px la tabla es la de siempre y el botón no se ve. Si agregas una columna a esa tabla, revisa que `th:nth-child(3)` (Valor) siga siendo la de 18 % en ≥ 1280 px.

17. **El `Paginador` es de solo flechas en celular (≤ 600 px).** Los botones miden 44 × 44 px con `ChevronLeft`/`ChevronRight` y el indicador (“Página 1 de 15 / 1–5 de 74”) ocupa el resto; desde 601 px sigue siendo “‹ Anterior … Siguiente ›” idéntico a antes (comparado píxel a píxel). Antes, en Mi cuenta a 320 px el paginador se salía de su tarjeta. El texto del botón va en `.pag-txt` y el ícono en `.pag-ico`; el nombre accesible sale del `aria-label`. Lo usan Mis pedidos y Mi cuenta.

18. **La barra inferior del portal en celular (`.pestanas`) es de vidrio y va de borde a borde.** Fondo `--papel` al 85 % con `backdrop-filter: blur(20px)`, borde superior `--linea` y sombra hacia arriba (más fuerte en oscuro); ya no es una píldora flotante y se quitó el degradado que la acompañaba. Sin `backdrop-filter` cae a `--papel` sólido. El acceso activo conserva su fondo `--mango-claro`. Sigue oculta desde 960 px.
19. **El botón de cerrar de JSBot es una cápsula circular de 44 px con borde degradado `sky-500 → cyan-400 → indigo-500`** (el mismo halo del avatar), relleno `slate-900` y la X en `sky-300`. La cabecera del panel es oscura en claro y en oscuro, así que es igual en los dos temas. Al pasar el mouse la X gira 90° (se desactiva con `motion-reduce`).
20. **La hamburguesa del Navbar y la X del menú abierto son cápsulas circulares (`rounded-full`) de 44 px con borde de degradado de JSBot (`sky-500 → cyan-400 → indigo-500`, `p-[1.5px]`) e interior `slate-950/90` con `backdrop-blur`.** Un círculo relleno con el degradado se probó y se descartó: era demasiado cargado y las líneas blancas se mimetizaban con el fondo. El ícono `Menu` es blanco (celeste al pasar el mouse) y la `X`, celeste. **Sin `outline` de foco**: al cerrar el menú el foco vuelve a la hamburguesa y `.landing :is(a, button, input):focus-visible` (en `landing.css`, `outline: 3px` con offset) dibujaba un segundo aro; por eso los dos botones llevan la clase `boton-menu`, que lo anula en `landing.css` (`focus-visible:outline-none` de Tailwind no alcanzaba, esa regla tiene más especificidad). Al agregar botones nuevos a la landing, revisa esa regla global; el foco con teclado solo intensifica el resplandor (`focus-visible:shadow`). Los dos botones comparten las mismas clases. El menú es de pantalla completa, por eso el botón no alterna a X.

21. **Las tarjetas de Mis pedidos son iguales sin importar el estado.** `.pedido-card` tiene un solo fondo (`--papel`), borde (`slate-200` al 80 % en claro, `--linea` en oscuro), radio de 16 px y sombra `shadow-sm` que sube a `shadow-md` al pasar el mouse; el estado solo cambia el ícono y la etiqueta. No agregues fondos ni bordes por `es-*`. El aviso ámbar (`.aviso.alerta`, también en Inicio) mide 16 px de padding y texto de 12 px en celular, y 14 × 20 px con texto de 14 px desde 601 px, con borde ámbar al 20 % y texto `amber-900` / `amber-300`. La píldora “Todos” ya arranca en el mismo borde izquierdo del buscador (medido a 320, 390, 768 y 1440 px); si tocas el padding de `.filtros` o del buscador, vuelve a medirlo.

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

- **2026-11-12:** cierre del flujo de solicitudes en el portal. El aviso automático ahora cubre `propuesta`, `asignada` y `rechazada` con la misma cola de 10 s; el de asignación muestra el mensajero, el domicilio y la guía, y el de rechazo la razón. `RespuestaPropuesta` solo aparece para solicitudes `origen: "portal"`; las de la landing quedan informativas y se confirman por WhatsApp. La campanita agrega `EventSource` a `/api/eventos` (con el sondeo de 30 s como respaldo) y el detalle muestra el mensajero. Probado en demo a 1440 y 390 px: asignada, rechazo, pausa real, “Entendido”, cierre automático y sin desbordes. Requiere el backend con `confirmadaPorCliente`, `mensajeroNombre` y el filtro SSE por cliente.

- **2026-11-12:** campanita de notificaciones en el portal y respuesta del cliente a la propuesta de domicilio. El panel deriva un aviso por solicitud desde `GET /solicitudes/mias` (refresco cada 30 s), guarda las leídas en `localStorage` y muestra la misma tarjeta `RespuestaPropuesta` en la campanita, el aviso automático y el detalle de “Mis solicitudes”. El aviso automático dura 10 s, se pausa al interactuar y se encola si llegan varios. Aceptar llama a `POST /solicitudes/mias/:id/responder` y deja la solicitud lista para asignar; rechazar guarda la razón opcional. Probado en demo a 1440 y 390 px: cierre automático, pausa real, aceptar, rechazar y sin desbordes. Requiere el backend del mismo cambio.
- **2026-11-11:** Pedidos y solicitudes: paginación sin `COUNT(*)` en `GET /pedidos` y `GET /solicitudes/mias` con `sinTotal=true`; la tabla pide **5 en celular y 10 en computador** y el `PaginadorSinTotal` muestra solo “Página X” con Anterior/Siguiente. El backend trae una fila extra y responde `hayMas`; el modo anterior con `total/paginas` se conserva para la oficina. Revisado en demo a 320, 390 y 1440 px y los modelos contra la base real.
- **2026-11-11:** Mis solicitudes: la lista paginada usa filas compactas en escritorio y dos líneas por solicitud en móvil. El seguimiento de tres pasos, direcciones, paquetes, valor y motivo de rechazo aparecen en un modal centrado o una hoja inferior; las solicitudes con guía enlazan al detalle del pedido. Se mantienen los estados y reglas existentes.
- **2026-11-11:** Solicitar envío: la vista móvil (`lg:hidden`) quedó como wizard de 3 pasos con barra de progreso, validación por paso, resumen de recogida antes de enviar y transiciones horizontales. El escritorio conserva el formulario completo. Revisado a 320, 390, 768 y 1440 px en claro/oscuro, sin desbordes.
- **2026-11-11:** Mis pedidos: tarjetas con fondo, borde, radio y sombra únicos para todos los estados, y aviso ámbar con más aire en computador (decisión 21). La píldora “Todos” ya estaba alineada con el buscador; se midió y no cambió. Revisado a 320, 390, 768 y 1440 px en claro/oscuro, sin desbordes.
- **2026-11-11:** Navbar: hamburguesa y X del menú circulares, con borde de degradado e interior oscuro, sin doble borde al cerrar el menú (decisión 20). Revisado a 390 px.
- **2026-11-11:** JSBot: botón de cerrar rediseñado como cápsula circular con borde degradado (decisión 19). Revisado a 390 y 1440 px.
- **2026-11-11:** barra inferior del portal en celular con vidrio, borde superior y sombra (decisión 18); se distingue de las tarjetas en claro y del fondo en oscuro. Revisada a 320 y 390 px en Mis pedidos, Mi cuenta e Inicio; escritorio sin cambios (la barra no se muestra).
- **2026-11-11:** `Paginador` compacto en celular (decisión 17): flechas de 44 px e indicador de dos líneas; corrige el desborde de Mi cuenta a 320 px. Revisado a 320, 390 y 1440 px en claro/oscuro en Mis pedidos y Mi cuenta; escritorio idéntico.
- **2026-11-11:** Mi cuenta: la tabla de movimientos en celular pasa a Fecha · Valor · botón de info, con el detalle completo en una hoja inferior (decisión 16). Revisado a 320, 390 y 1440 px en claro/oscuro, sin desbordes; a 320 px la fecha baja a dos líneas para que quepa el botón.
- **2026-11-11:** Hero: jerarquía tipográfica en celular (< 640 px): H1 de 32 px con interlineado 1,08, badge de 10 px más liviano (`py-1`, `sky-400/90`), bajada de 13 px, CTA en `text-xs` con `tracking-wide` y micro-badges `font-medium` con iconos de 14 px. Desde `sm` todo queda como antes (comparado píxel a píxel a 768 y 1440 px). El campo de rastreo se dejó en `text-sm`: bajo 16 px iOS ya hace zoom al enfocar, y `text-xs` lo empeoraría.
- **2026-11-11:** Hero: el rastreo en celular pasa de una tarjeta de ~300 px a una barra de una línea con lupa (decisión 15); en escritorio la tarjeta pierde el rótulo “Siempre cerca”, la etiqueta RASTREO y el reloj, y queda más ligera. Revisado a 320, 390, 768 y 1440 px, sin desbordes; Enter y lupa llevan a `/track?n=…`.
- **2026-11-11:** landing, sección “Nosotros” en celular: el título va antes de la foto, la tarjeta blanca queda dentro de la foto (vidrio, sin desbordarse) y el texto de Cali sube arriba (decisión 14). Foto cuadrada bajo 400 px y 5:4 hasta `sm` para que quepan. Revisado a 320, 390, 768 y 1024 px en claro/oscuro sin desbordes; a 1440 px idéntico píxel a píxel a antes.
- **2026-11-11:** login en celular más compacto: tarjeta de 320 px como máximo (antes casi todo el ancho) y unos 60 px más baja; la animación de entrada se mide sola sobre el nuevo tamaño. Revisado a 320, 360, 390 y 430 px; desde 640 px queda idéntico a antes.
- **2026-11-10:** Mi cuenta / Movimientos: historial paginado en backend y frontend (5 en celular, 10 en computador) con `GET /clientes/:id/cuenta?pagina=&porPagina=`, saldo calculado en SQL y paginador. El portal ya no carga los 1000 movimientos al entrar: el dashboard pide 6 filas, la tabla pide su página y el recibo carga los movimientos completos solo al pulsar “Ver recibo”. Verificado el SQL contra el cálculo anterior en 230 clientes (saldo, total y filas) y el flujo en demo a 390 y 1440 px.
- **2026-11-10:** portal del cliente: la **barra superior en móvil queda siempre oscura** (`slate-900`), mientras que en escritorio sigue el tema (blanca en claro, `slate-900` en oscuro). El sidebar de escritorio sigue siempre oscuro. Verificado a 390 y 1440 px en claro/oscuro, sin desbordes.
- **2026-11-10:** detalle del pedido: modal de rastreo con cabecera propia, stepper Solicitado → En ruta → Entregado/Devuelto/Cambio, registro de intentos y devolución, galería POD con lightbox y detalles del envío. La confirmación de prenda de cambio ahora es inline. Revisado a 390 y 1440 px en claro/oscuro, con pedidos entregados, devueltos, con intentos y con cambio pendiente.
- **2026-11-10:** Mis pedidos: toolbar unificada (búsqueda con icono, fecha y “Hoy”), pills de estado con contadores, y tarjetas con ícono semántico (camión/paquete/retorno), badges, valor y chevron. La paginación sigue en el servidor; los contadores salen de todos los pedidos cargados. Añadida entrada escalonada `pedido-entra`. Revisado a 320, 390 y 1440 px en claro/oscuro, con búsqueda, filtro, “Hoy” y paginación, sin desbordes.
- **2026-11-10:** portal del cliente: el sidebar de escritorio queda **siempre oscuro** (`slate-900`) en ambos temas, como el de la oficina; solo la barra superior y las pestañas cambian con el tema. Los textos y estados del menú usan `--lat-fijo-*` para mantener contraste. Verificado a 1440 px en claro/oscuro, expandido y colapsado.
- **2026-11-10:** portal del cliente: menú lateral colapsable en escritorio (76 px, solo íconos, `title`/`aria-label` y botón en el pie como la oficina). La barra superior, el sidebar, las pestañas y ahora el `theme-color` del navegador siguen el tema claro/oscuro; verificado en el build de producción. Medido a 1024 y 1440 px, expandido y colapsado, sin desbordes.
- **2026-11-10:** portal del cliente: la barra superior y el bloque del logo del sidebar ahora miden 76 px y comparten el mismo borde inferior, así que la línea de división es continua. Se quitó el padding superior extra del sidebar y se centró el contenido en la altura fija. Medido a 390, 1440 y 1920 px en claro/oscuro, sin desbordes.
- **2026-11-10:** portal del cliente: dashboard con tema claro/oscuro nativo y botón en la barra superior (misma preferencia `jsl_theme` de la landing, aplicada con `data-theme` en `.clasico`), sidebar y barra blancos en claro / `slate-900` en oscuro, banner de cambios en ámbar, tarjetas de métricas 1/2/4 columnas, gráficas 4/8 y listas 6/6. Desde 1280 px el contenido usa todo el ancho y desde 1920 px se limita a 1600 px. Revisado a 390, 1024, 1440, 1536 y 1920 px en ambos temas, sin desbordes ni valores cortados.
- **2026-11-10:** portal del cliente: se retiró la vista de propuesta (`portal/mejorado/`, `portal/config.ts`, `VITE_PORTAL_CLIENTE` y `VITE_PERMITIR_CAMBIO_PORTAL`) y quedó solo el clásico. Su menú lateral de escritorio se alineó al de la oficina: logo con separador, grupos “Principal” / “Mi cuenta”, títulos pequeños en mayúsculas y acceso activo con acento azul y borde izquierdo. En el celular se conservan las pestañas de abajo. Revisado en escritorio y celular.

- **2026-11-10:** login: animación de entrada como la del login de oficina (decisión 9), con el fondo intacto. Comparada cuadro a cuadro a 1440×900 y 390×844; último cuadro idéntico al login de antes; sin desborde a 320, 360 y 390 px.
- **2026-11-10:** Servicios: seis tarjetas con iconos Lucide (`Truck`, `Zap`, `Globe`, `Warehouse`, `Activity`, `FileText`), grid 1/2/3 columnas, encabezado centrado y reveal escalonado al hacer scroll con `IntersectionObserver` + CSS (`servicio-entra`, 90 ms por tarjeta), sin Framer Motion. Revisado a 320, 390, 640, 768, 1024 y 1440 px en claro/oscuro, sin desbordes.
- **2026-11-10:** Hero: se quitó el “Ver más” central y los puntos del carrusel; nuevo indicador lateral de mouse/“Scroll” desde `sm` en la esquina inferior derecha (`bottom-24`, `z-20`, `pointer-events-none`) para no chocar con los KPIs. Se mantienen el gradiente inferior, el solape `-mt-12/-16` y la línea Slate a la mitad de los KPIs. Revisado a 320, 390, 640, 1024 y 1440 px sin colisiones ni scroll horizontal.
- **2026-11-10:** landing: Stats en tarjetas 2×2/4 columnas y “Quiénes Somos” en bento 7/5 con iconos de Lucide (`lucide-react` agregado). Ambos adaptados a claro/oscuro; Servicios también se adaptó para no quedar con texto blanco sobre fondo claro. Revisado a 320, 360, 390, 640, 768, 1024 y 1440 px sin desbordes.
- **2026-11-10:** portada: Hero rediseñado con navbar propio, overlay `slate-950`, badge, escala 3xl–8xl y barra de rastreo que abre `/track?n=...`; se agregaron `xs` y `opacity-35` en Tailwind. La barra y los CTA inferiores escalan en `lg`/`xl` (`max-w-xl`/`2xl`, `text-base`, más padding) y conservan el apilado bajo 400 px. Revisado a 320, 360, 390, 400, 640, 768, 1024, 1280, 1440 y 1920 px sin desbordes. Carrusel conservado; indicadores ocultos en pantallas menores a 400 px.
- **2026-11-10:** login: el fondo ahora es un mapa del mundo real y lleva un pin en la sede principal (Cali). Revisado a 320, 390, 820 y 1440 px en modo demo.
- **2026-11-09:** login: enlace “¿Olvidaste tu contraseña?” y páginas públicas `/recuperar`, `/restablecer` y `/activar`, con el mismo diseño del login (marco compartido en `components/acceso.tsx`). Revisadas a 390 px en modo demo.
- **2026-11-09:** revisión de la documentación; se agregó este archivo y se corrigió en `AGENTS.md` la regla de la landing.
- **2026-11-07/08:** rediseño de la portada (carrusel), del menú móvil y del login; fotos de ejemplo; corrección de desbordes laterales en móvil.
