import { useMemo } from 'react';
import { useFichaCliente, usePedidosCliente } from '../api/cliente';
import type { Cliente, Pedido } from '../types/dominio';

export interface DatosCliente {
  cliente: Cliente | undefined;
  pedidos: Pedido[];
  cargando: boolean;
  error: Error | null;
}

/** Lo que necesita el portal del cliente, sin traer todos los movimientos: el historial se pagina aparte. */
export function useDatosCliente(): DatosCliente {
  const p = usePedidosCliente(), c = useFichaCliente();
  return useMemo(() => ({
    cliente: c.data,
    pedidos: p.data ?? [],
    cargando: p.isLoading || c.isLoading,
    error: (p.error || c.error) as Error | null,
  }), [p.data, p.isLoading, p.error, c.data, c.isLoading, c.error]);
}
