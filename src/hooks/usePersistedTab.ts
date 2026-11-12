/**
 * Pestaña y sub-pestaña del portal que sobreviven a un F5.
 *
 * La URL manda: la pestaña principal es la ruta (`/cliente/pedidos`) y la sub-pestaña un parámetro (`?v=solicitudes`),
 * así un enlace o un F5 abren justo ahí. `sessionStorage` (`js_client_nav`) es el respaldo: si se entra a `/cliente`
 * sin nada más (por ejemplo, al volver a iniciar sesión en la misma pestaña), se vuelve a donde estaba.
 * El respaldo es de la persona y del rol: si cambia la sesión se descarta, y al cerrar sesión se borra.
 */
import { useCallback, useEffect, useRef } from 'react';
import { useLocation, useSearchParams, type Location } from 'react-router-dom';
import { useSesion } from '../auth/AuthProvider';
import type { Usuario } from '../types/dominio';

export const CLAVE_NAV_CLIENTE = 'js_client_nav';

/** Pestañas principales del portal (las rutas de PortalClasico). */
export const PESTANAS_CLIENTE = ['inicio', 'pedidos', 'cuenta'] as const;
export type PestanaCliente = (typeof PESTANAS_CLIENTE)[number];

interface NavGuardada {
  usuario: string;
  rol: string;
  tab?: string;
  subtabs: Record<string, string>;
}

function leer(u: Usuario | null): NavGuardada | null {
  if (!u) return null;
  try {
    const crudo = sessionStorage.getItem(CLAVE_NAV_CLIENTE);
    if (!crudo) return null;
    const n = JSON.parse(crudo) as Partial<NavGuardada>;
    // Otra persona u otro rol en la misma pestaña del navegador: lo guardado no le sirve.
    if (n.usuario !== u.id || n.rol !== u.rol || typeof n.subtabs !== 'object' || !n.subtabs) {
      sessionStorage.removeItem(CLAVE_NAV_CLIENTE);
      return null;
    }
    return n as NavGuardada;
  } catch {
    return null;
  }
}

function guardar(u: Usuario | null, cambio: (n: NavGuardada) => void) {
  if (!u) return;
  try {
    const n = leer(u) ?? { usuario: u.id, rol: u.rol, subtabs: {} };
    cambio(n);
    sessionStorage.setItem(CLAVE_NAV_CLIENTE, JSON.stringify(n));
  } catch { /* modo privado o almacenamiento lleno: la URL sigue funcionando */ }
}

/**
 * Lo guardado solo se usa al llegar al portal: al cargar la página (F5, un enlace abierto en una pestaña nueva) o
 * justo después de iniciar sesión, y siempre que la URL no traiga nada. Un clic en el menú o un acceso del Inicio
 * (`?f=ruta`) no se cambian por lo guardado.
 */
export function debeRestaurar(loc: Location) {
  const st = loc.state as { restaurarNav?: boolean } | null;
  return !loc.search && (loc.key === 'default' || !!st?.restaurarNav);
}

/** Se llama al cerrar sesión. */
export function limpiarNavCliente() {
  try { sessionStorage.removeItem(CLAVE_NAV_CLIENTE); } catch { /* sin almacenamiento */ }
}

/** La pestaña principal guardada, si es válida para este portal. */
export function pestanaGuardada(u: Usuario | null): PestanaCliente | null {
  const t = leer(u)?.tab;
  return (PESTANAS_CLIENTE as readonly string[]).includes(t ?? '') ? (t as PestanaCliente) : null;
}

/** Sub-pestaña guardada de una pestaña (`ambito`), o null. */
export function subtabGuardada(u: Usuario | null, ambito: string): string | null {
  return leer(u)?.subtabs[ambito] ?? null;
}

export function guardarPestana(u: Usuario | null, tab: PestanaCliente) {
  guardar(u, n => { n.tab = tab; });
}

/**
 * Sub-pestaña sincronizada con `?param=` y con `sessionStorage`.
 * Orden al cargar: la URL, después lo guardado y por último `porDefecto`. Un valor que no está en `valores` se ignora.
 * El valor por defecto no se escribe en la URL, para que los enlaces de siempre sigan iguales.
 */
export function usePersistedTab<T extends string>({ ambito, valores, porDefecto, param = 'v' }: {
  ambito: string;
  valores: readonly T[];
  porDefecto: T;
  param?: string;
}): [T, (v: T) => void] {
  const { usuario } = useSesion();
  const [sp, setSp] = useSearchParams();
  const loc = useLocation();
  const valido = (v: string | null): v is T => v != null && (valores as readonly string[]).includes(v);
  const enUrl = sp.get(param);

  // Sin nada en la URL, lo guardado se usa desde el primer dibujo (sin mostrar antes la sub-pestaña por defecto
  // ni pedir sus datos) y enseguida se escribe en la URL para que un F5 lo conserve.
  const restaurar = useRef<T | null | undefined>(undefined);
  if (restaurar.current === undefined) {
    const g = valido(enUrl) || !debeRestaurar(loc) ? null : subtabGuardada(usuario, ambito);
    restaurar.current = valido(g) && g !== porDefecto ? g : null;
  }
  const actual: T = valido(enUrl) ? enUrl : restaurar.current ?? porDefecto;

  const escribirUrl = useCallback((v: T) => setSp(prev => {
    const n = new URLSearchParams(prev);
    if (v === porDefecto) n.delete(param); else n.set(param, v);
    return n;
  }, { replace: true }), [setSp, porDefecto, param]);

  const poner = useCallback((v: T) => {
    restaurar.current = null;
    escribirUrl(v);
    guardar(usuario, n => { n.subtabs[ambito] = v; });
  }, [escribirUrl, usuario, ambito]);

  useEffect(() => {
    if (restaurar.current) {
      if (enUrl !== restaurar.current) { escribirUrl(restaurar.current); return; }
      restaurar.current = null;
    }
    // Lo guardado sigue a la URL, también si cambia por otra vía (atrás/adelante, un enlace).
    guardar(usuario, n => { n.subtabs[ambito] = valido(enUrl) ? enUrl : porDefecto; });
  }, [enUrl]);

  return [actual, poner];
}
