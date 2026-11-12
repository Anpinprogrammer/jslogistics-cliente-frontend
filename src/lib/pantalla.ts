/* Cuántos pedidos caben por página según la pantalla: 5 en el celular y 10 en el computador. */
import { useSyncExternalStore } from 'react';

const COMPUTADOR = '(min-width: 768px)';
export const POR_PAGINA = { celular: 5, computador: 10 } as const;
export const POR_PAGINA_CUENTA = { celular: 5, computador: 10 } as const;

const consulta = () => (typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(COMPUTADOR) : null);
const suscribir = (aviso: () => void) => { const m = consulta(); m?.addEventListener('change', aviso); return () => m?.removeEventListener('change', aviso); };

/** 5 o 10 pedidos por página, y cambia solo si se gira el celular o se cambia el tamaño de la ventana. */
export function usePorPagina() {
  const esComputador = useSyncExternalStore(suscribir, () => !!consulta()?.matches, () => false);
  return esComputador ? POR_PAGINA.computador : POR_PAGINA.celular;
}

/** 5 o 10 movimientos por página en Mi cuenta: 5 en celular y 10 en computador. */
export function usePorPaginaCuenta() {
  const esComputador = useSyncExternalStore(suscribir, () => !!consulta()?.matches, () => false);
  return esComputador ? POR_PAGINA_CUENTA.computador : POR_PAGINA_CUENTA.celular;
}
