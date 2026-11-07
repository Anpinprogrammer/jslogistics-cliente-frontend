/**
 * Lo que necesita el portal del cliente. Los dos portales (mejorado y clásico) usan exactamente estas
 * mismas consultas: solo cambia cómo se ve.
 *
 * Estado del backend (rama del backend, backend/README.md):
 * - Listo: GET /pedidos (el cliente solo ve los suyos), GET /pedidos/:guia, POST /pedidos/:guia/cambio-recibido, GET /clientes/:id.
 * - Listo también: GET /clientes/:id/movimientos y GET /pedidos/:guia/archivos (fotos firmadas de Storage, vencen en 1 hora).
 *   Si el backend desplegado aún no los tiene, un 404 se toma como lista vacía.
 * - Pendiente: saldos calculados en el servidor. Mientras tanto se calculan aquí con lib/negocio.ts, igual que la app actual.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Archivo, Cliente, Movimiento, Pedido } from '../types/dominio';
import { api, ApiError, DEMO } from './http';
import { demo } from '../demo/datos';
import { useSesion } from '../auth/AuthProvider';

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

export function useFichaCliente() {
  const { usuario } = useSesion();
  const id = usuario?.clienteId;
  return useQuery({
    queryKey: ['cliente', 'ficha', id],
    enabled: !!id,
    queryFn: () => (DEMO ? demo.cliente() : api<{ cliente: Cliente }>(`/clientes/${id}`).then(r => r.cliente)),
  });
}

export function useMovimientosCliente() {
  const { usuario } = useSesion();
  const id = usuario?.clienteId;
  return useQuery({
    queryKey: ['cliente', 'movimientos', id],
    enabled: !!id,
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
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cliente', 'pedidos'] }),
  });
}
