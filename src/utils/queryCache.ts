/**
 * Caché en memoria de las consultas del portal.
 *
 * La caché es la de TanStack Query (el `QueryClient` de App.tsx): guarda cada respuesta en memoria, junta las
 * peticiones iguales que salen al mismo tiempo y, mientras un dato está "fresco", lo devuelve sin volver a pedirlo.
 * Pasado ese tiempo lo muestra igual y lo actualiza por detrás (stale-while-revalidate). Aquí se definen esos
 * tiempos y qué se invalida después de cada cambio, para no armar una segunda caché que se desincronice.
 */
import type { QueryClient, QueryKey } from '@tanstack/react-query';

/** Cuánto tiempo un dato se da por bueno sin volver a pedirlo (TTL), en milisegundos. */
export const FRESCO = {
  /** Listas que cambian seguido (pedidos y solicitudes): ir y volver entre pestañas en este tiempo no pide nada. */
  corto: 30_000,
  /** Lista completa de pedidos y el saldo: pesan más y la oficina no los cambia a cada segundo. */
  medio: 60_000,
  /** La ficha del cliente: solo cambia cuando él mismo la edita (y entonces se actualiza a mano). */
  largo: 5 * 60_000,
} as const;

/** Cuánto se guarda en memoria una consulta que ya nadie está mirando. */
export const EN_MEMORIA = 10 * 60_000;

/** Grupos de datos del portal y las claves que abarca cada uno. */
const GRUPOS = {
  pedidos: [['cliente', 'pedidos'], ['cliente', 'pedido']],
  cuenta: [['cliente', 'cuenta'], ['cliente', 'movimientos']],
  solicitudes: [['cliente', 'solicitudes']],
  ficha: [['cliente', 'ficha']],
} satisfies Record<string, QueryKey[]>;

export type GrupoDatos = keyof typeof GRUPOS;

/** Después de un cambio, marca como viejos los grupos afectados: lo que está en pantalla se vuelve a pedir y lo demás al abrirlo. */
export function invalidar(qc: QueryClient, ...grupos: GrupoDatos[]) {
  return Promise.all(grupos.flatMap(g => GRUPOS[g].map(queryKey => qc.invalidateQueries({ queryKey }))));
}
