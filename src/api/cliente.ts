/**
 * Lo que necesita el portal del cliente: todas sus consultas salen de aquí.
 *
 * Estado del backend (rama del backend, backend/README.md):
 * - Listo: GET /pedidos (el cliente solo ve los suyos), GET /pedidos/:guia, POST /pedidos/:guia/cambio-recibido, GET /clientes/:id.
 * - Listo: POST /solicitudes/portal (pedir un envío nuevo desde el portal; la oficina lo aprueba), GET /solicitudes/mias ("Mis solicitudes")
 *   y POST /solicitudes/mias/:id/responder (aceptar o rechazar la propuesta de domicilio).
 * - Listo también: GET /clientes/:id/cuenta (saldo e historial paginado) y GET /pedidos/:guia/archivos (fotos firmadas de Storage, vencen en 1 hora).
 *   Si el backend desplegado aún no los tiene, un 404 se toma como lista vacía.
 */
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Archivo, Cliente, Movimiento, PaginaPedidos, PaginaSolicitudes, Pedido, SolicitudCliente } from '../types/dominio';
import { cambioPendiente, delDia } from '../lib/negocio';
import { api, ApiError, DEMO } from './http';
import { demo } from '../demo/datos';
import { useSesion } from '../auth/AuthProvider';
import type { DatosSolicitudPortal } from './solicitudes';

const MAX_PAGINAS = 20; // 20 × 200 = 4.000 pedidos: suficiente mientras el backend no devuelva el saldo

async function todosLosPedidos(): Promise<Pedido[]> {
  if (DEMO) return demo.pedidos();
  const todos: Pedido[] = [];
  let cursor: number | null | undefined;
  for (let i = 0; i < MAX_PAGINAS; i++) {
    const q = new URLSearchParams({ limite: '200', ...(cursor ? { cursor: String(cursor) } : {}) });
    const r = await api<{ pedidos: Pedido[]; siguiente: number | null }>(`/pedidos?${q}`);
    todos.push(...r.pedidos);
    if (!r.siguiente) break;
    cursor = r.siguiente;
  }
  return todos;
}

/** Endpoints que el backend todavía no tiene: un 404 se trata como "aún no hay datos". */
async function opcional<T>(fn: () => Promise<T>, vacio: T): Promise<T> {
  try { return await fn(); } catch (e) { if (e instanceof ApiError && e.status === 404) return vacio; throw e; }
}

export function usePedidosCliente() {
  return useQuery({ queryKey: ['cliente', 'pedidos'], queryFn: todosLosPedidos, refetchInterval: 60_000 });
}

/** Filtros de la pestaña de pedidos. */
export type FiltroPedidos = 'todos' | 'acep' | 'ruta' | 'ent' | 'dev' | 'cambio';
export interface ConsultaPedidos { filtro: FiltroPedidos; buscar: string; dia: string; pagina: number; porPagina: number }

/** Lo que el servidor entiende de cada filtro. El servidor filtra y corta la página; no cuenta el total. */
function parametros({ filtro, buscar, dia, pagina, porPagina }: ConsultaPedidos) {
  const q = new URLSearchParams({ pagina: String(pagina), porPagina: String(porPagina), sinTotal: 'true' });
  if (filtro === 'acep') q.set('estado', 'aceptado');
  else if (filtro === 'ruta') q.set('estado', 'pendiente');
  else if (filtro === 'ent') q.set('estado', 'entregado');
  else if (filtro === 'dev') q.set('estado', 'devuelto');
  else if (filtro === 'cambio') q.set('cambioPendiente', 'true');
  if (buscar.trim()) q.set('buscar', buscar.trim());
  if (dia) q.set('dia', dia);
  return q;
}

/** La misma página armada en el navegador: solo para el modo demo y para un backend que aún no tenga el paginador. */
function paginarAqui(todos: Pedido[], { filtro, buscar, dia, pagina, porPagina }: ConsultaPedidos): PaginaPedidos {
  let ps = [...todos].sort((a, b) => b.n - a.n);
  if (filtro === 'cambio') ps = ps.filter(cambioPendiente);
  else if (filtro === 'acep') ps = ps.filter(p => p.estado === 'aceptado');
  else if (filtro === 'ruta') ps = ps.filter(p => p.estado === 'pendiente');
  else if (filtro === 'ent') ps = ps.filter(p => p.estado === 'entregado');
  else if (filtro === 'dev') ps = ps.filter(p => p.estado === 'devuelto');
  const q = buscar.trim().toLowerCase();
  if (q) ps = ps.filter(p => (p.guia + ' ' + (p.destinatario || '')).toLowerCase().includes(q));
  if (dia) ps = ps.filter(p => delDia(p, dia));
  const paginas = Math.max(1, Math.ceil(ps.length / porPagina)), actual = Math.min(pagina, paginas);
  const desde = (actual - 1) * porPagina;
  const pedidos = ps.slice(desde, desde + porPagina);
  return { pedidos, pagina: actual, porPagina, hayMas: desde + pedidos.length < ps.length };
}

/** Una página de "Mis pedidos". Mientras llega la siguiente se sigue viendo la anterior. */
export function usePaginaPedidos(c: ConsultaPedidos) {
  return useQuery({
    queryKey: ['cliente', 'pedidos', 'pagina', c],
    placeholderData: keepPreviousData,
    refetchInterval: 60_000,
    queryFn: async () => {
      if (DEMO) return paginarAqui(await demo.pedidos(), c);
      const r = await api<Partial<PaginaPedidos> & { pedidos: Pedido[] }>(`/pedidos?${parametros(c)}`);
      // El paginador nuevo responde `hayMas` y no consulta el total.
      if (typeof r.hayMas === 'boolean') return { ...r, pedidos: r.pedidos ?? [] } as PaginaPedidos;
      // Compatibilidad con un backend anterior que todavía devuelve páginas y total.
      if (typeof r.total === 'number' && typeof r.paginas === 'number') return { ...r, hayMas: (r.pagina ?? 1) < r.paginas } as PaginaPedidos;
      // Backend muy anterior, sin paginador: se pagina aquí con la lista completa.
      return paginarAqui(await todosLosPedidos(), c);
    },
  });
}

export function useFichaCliente() {
  const { usuario } = useSesion();
  const id = usuario?.clienteId;
  return useQuery({
    queryKey: ['cliente', 'ficha', id],
    enabled: !!id,
    queryFn: () => (DEMO ? demo.cliente() : api<{ cliente: Cliente }>(`/clientes/${id}`).then(r => r.cliente)),
  });
}

export interface CambiosPerfilCliente {
  nombre: string;
  telefono: string;
  direccionRecogida: string;
  email: string;
  claveActual?: string;
}

export function useActualizarPerfilCliente() {
  const qc = useQueryClient();
  const { usuario } = useSesion();
  return useMutation({
    mutationFn: (datos: CambiosPerfilCliente) =>
      DEMO ? demo.actualizarPerfil(datos)
        : api<{ cliente: Cliente }>('/clientes/mi-perfil', { method: 'PATCH', json: datos }).then(r => r.cliente),
    onSuccess: cliente => qc.setQueryData(['cliente', 'ficha', usuario?.clienteId], cliente),
  });
}

/** Una fila del historial de Mi cuenta (pedido cerrado o movimiento). */
export interface FilaCuentaCliente {
  fecha: string;
  det: string;
  v: number;
  guia?: string;
  nom: string;
}

/** Respuesta paginada de GET /clientes/:id/cuenta. */
export interface CuentaCliente {
  cliente?: Cliente;
  saldo: number;
  filas: FilaCuentaCliente[];
  enRuta: number;
  pagina: number;
  porPagina: number;
  total: number;
  paginas: number;
}

/** Página del historial y saldo del cliente. El servidor corta las filas. */
export function useCuentaCliente(pagina: number, porPagina: number) {
  const { usuario } = useSesion();
  const id = usuario?.clienteId;
  return useQuery<CuentaCliente>({
    queryKey: ['cliente', 'cuenta', id, pagina, porPagina],
    enabled: !!id,
    placeholderData: keepPreviousData,
    queryFn: () => {
      if (DEMO) return demo.cuenta(pagina, porPagina);
      return opcional(
        () => api<CuentaCliente>(`/clientes/${id}/cuenta?pagina=${pagina}&porPagina=${porPagina}`).then(r => {
          const filas = r.filas ?? [];
          const total = r.total ?? filas.length;
          const actual = r.pagina ?? pagina;
          const paginas = r.paginas ?? Math.max(1, Math.ceil(total / porPagina));
          // Compatibilidad con un backend anterior que devolvía todas las filas.
          return {
            ...r, saldo: r.saldo ?? 0, enRuta: r.enRuta ?? 0,
            filas: r.total === undefined ? filas.slice((actual - 1) * porPagina, actual * porPagina) : filas,
            pagina: actual, porPagina: r.porPagina ?? porPagina, total, paginas,
          };
        }),
        { saldo: 0, filas: [], enRuta: 0, pagina, porPagina, total: 0, paginas: 1 }
      );
    },
  });
}

export function useMovimientosCliente(enabled = true) {
  const { usuario } = useSesion();
  const id = usuario?.clienteId;
  return useQuery({
    queryKey: ['cliente', 'movimientos', id],
    enabled: !!id && enabled,
    queryFn: () =>
      DEMO ? demo.movimientos()
        : opcional(() => api<{ movimientos: Movimiento[] }>(`/clientes/${id}/movimientos?limite=1000`).then(r => r.movimientos), []),
  });
}

export function usePruebas(guia: string | null) {
  return useQuery({
    queryKey: ['pedido', guia, 'archivos'],
    enabled: !!guia,
    queryFn: () =>
      DEMO ? demo.archivos(guia!)
        : opcional(() => api<{ archivos: Archivo[] }>(`/pedidos/${guia}/archivos`).then(r => r.archivos), []),
  });
}

export function useConfirmarCambio() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (guia: string) =>
      DEMO ? demo.confirmarCambio(guia) : api<{ pedido: Pedido }>(`/pedidos/${guia}/cambio-recibido`, { method: 'POST' }).then(() => undefined),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cliente', 'pedidos'] });
      qc.invalidateQueries({ queryKey: ['cliente', 'cuenta'] });
    },
  });
}

/** Pide el reintento de un pedido devuelto. No crea la guía: la oficina lo asigna a un mensajero y la crea enlazada a la original.
    El reintento se cobra como un domicilio normal; la devolución se sigue cobrando como siempre. */
export function usePedirReintento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (guia: string) =>
      DEMO ? demo.pedirReintento(guia) : api<{ pedido: Pedido }>(`/pedidos/${guia}/pedir-reintento`, { method: 'POST' }).then(() => undefined),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['cliente', 'pedidos'] }); },
  });
}

/** "Nuevo pedido" del portal: manda la solicitud a la oficina. No crea la guía: la crea la oficina al asignar el mensajero. */
export function useNuevaSolicitud() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (datos: DatosSolicitudPortal) =>
      DEMO ? demo.nuevaSolicitud(datos) : api('/solicitudes/portal', { method: 'POST', json: datos }).then(() => undefined),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['cliente', 'solicitudes'] }); },
  });
}

/** Pide una página de "Mis solicitudes"; `opcional` deja lista vacía si el backend aún no tiene la ruta. */
function pedirSolicitudes(pagina: number, porPagina: number): Promise<PaginaSolicitudes> {
  const q = new URLSearchParams({ pagina: String(pagina), porPagina: String(porPagina), sinTotal: 'true' });
  return opcional(
    () => api<PaginaSolicitudes>(`/solicitudes/mias?${q}`).then(r => ({
      ...r, solicitudes: r.solicitudes ?? [],
      hayMas: r.hayMas ?? (typeof r.total === 'number' && typeof r.paginas === 'number' ? (r.pagina ?? 1) < r.paginas : false),
    })),
    { solicitudes: [], pagina: 1, porPagina, hayMas: false }
  );
}

/** "Mis solicitudes": las solicitudes de envío del cliente con su estado y, si se rechazó, la razón.
    El backend solo devuelve las de la ficha de la sesión. Con `sinTotal` no cuenta el total: usa `hayMas`.
    Un backend que aún no tenga la ruta responde 404: lista vacía. */
export function useMisSolicitudes(pagina: number, porPagina: number) {
  return useQuery({
    queryKey: ['cliente', 'solicitudes', pagina, porPagina],
    placeholderData: keepPreviousData,
    refetchInterval: 60_000,
    queryFn: () => DEMO ? demo.solicitudes(pagina, porPagina) : pedirSolicitudes(pagina, porPagina),
  });
}

/** Las últimas solicitudes, para la campanita y el aviso automático. Se refresca más seguido que la pantalla. */
export function useSolicitudesRecientes() {
  return useQuery({
    queryKey: ['cliente', 'solicitudes', 'recientes'],
    refetchInterval: 30_000,
    queryFn: () => DEMO ? demo.solicitudes(1, 50) : pedirSolicitudes(1, 50),
  });
}

/** El cliente acepta o rechaza desde su portal la propuesta de domicilio que hizo la oficina. */
export function useResponderSolicitud() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, aceptar, motivo }: { id: string; aceptar: boolean; motivo?: string }): Promise<SolicitudCliente> =>
      DEMO
        ? demo.responderSolicitud(id, aceptar, motivo)
        : api<{ solicitud: SolicitudCliente }>(`/solicitudes/mias/${id}/responder`, { method: 'POST', json: { aceptar, ...(motivo ? { motivo } : {}) } }).then(r => r.solicitud),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['cliente', 'solicitudes'] }); },
  });
}
