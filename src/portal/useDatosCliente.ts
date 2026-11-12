import { useMemo } from 'react';
import { useFichaCliente, usePedidosCliente } from '../api/cliente';
import type { Cliente, Pedido } from '../types/dominio';

export interface DatosCliente {
  cliente: Cliente | undefined;
  /** La lista completa de pedidos: vacía hasta que llega (ver `pedidosListos`). */
  pedidos: Pedido[];
  pedidosListos: boolean;
  errorPedidos: Error | null;
  /** Solo la ficha: sin ella no se puede dibujar ninguna pestaña. */
  cargando: boolean;
  error: Error | null;
}

/**
 * Lo que necesita el portal del cliente, sin traer todos los movimientos: el historial se pagina aparte.
 * La ficha va siempre. La lista completa de pedidos (para el Inicio, los contadores y el recibo) solo se pide con
 * `cargarPedidos`: el portal la pide de una vez en el Inicio y, en las demás pestañas, cuando el navegador queda libre.
 */
export function useDatosCliente(cargarPedidos = true, refresco = 60_000): DatosCliente {
  const p = usePedidosCliente(cargarPedidos, refresco), c = useFichaCliente();
  return useMemo(() => ({
    cliente: c.data,
    pedidos: p.data ?? [],
    pedidosListos: !!p.data,
    errorPedidos: p.error as Error | null,
    cargando: c.isLoading,
    error: c.error as Error | null,
  }), [p.data, p.error, c.data, c.isLoading, c.error]);
}
