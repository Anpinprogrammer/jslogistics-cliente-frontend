import { useMemo } from 'react';
import { useFichaCliente, useMovimientosCliente, usePedidosCliente } from '../api/cliente';
import { saldoCliente } from '../lib/negocio';
import type { Cliente, Movimiento, Pedido } from '../types/dominio';

export interface DatosCliente {
  cliente: Cliente | undefined;
  pedidos: Pedido[];
  movimientos: Movimiento[];
  saldo: number;
  cargando: boolean;
  error: Error | null;
}

/** Todo lo que muestra el portal del cliente, desde las mismas consultas. */
export function useDatosCliente(): DatosCliente {
  const p = usePedidosCliente(), c = useFichaCliente(), m = useMovimientosCliente();
  return useMemo(() => {
    const pedidos = p.data ?? [], movimientos = m.data ?? [];
    return {
      cliente: c.data, pedidos, movimientos,
      saldo: saldoCliente(pedidos, movimientos),
      cargando: p.isLoading || c.isLoading || m.isLoading,
      error: (p.error || c.error || m.error) as Error | null,
    };
  }, [p.data, p.isLoading, p.error, c.data, c.isLoading, c.error, m.data, m.isLoading, m.error]);
}
