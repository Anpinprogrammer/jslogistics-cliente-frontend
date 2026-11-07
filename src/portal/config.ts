import { useCallback, useState } from 'react';

/**
 * Qué portal ven los clientes después de iniciar sesión.
 * - "mejorado": el diseño nuevo (tema de la landing, con los datos y funciones de la app actual).
 * - "clasico": la vista del cliente de la app actual, tal cual se ve hoy.
 * El dueño lo elige con VITE_PORTAL_CLIENTE. Con VITE_PERMITIR_CAMBIO_PORTAL=true aparece un botón para
 * cambiar entre los dos (pensado para la demo y para mostrarle ambas opciones).
 */
export type Portal = 'mejorado' | 'clasico';

export const PORTAL_POR_DEFECTO: Portal = import.meta.env.VITE_PORTAL_CLIENTE === 'clasico' ? 'clasico' : 'mejorado';
export const PERMITE_CAMBIO = import.meta.env.VITE_PERMITIR_CAMBIO_PORTAL === 'true';
const CLAVE = 'jsl_portal';

function leer(): Portal {
  if (!PERMITE_CAMBIO) return PORTAL_POR_DEFECTO;
  try {
    const v = localStorage.getItem(CLAVE);
    return v === 'clasico' || v === 'mejorado' ? v : PORTAL_POR_DEFECTO;
  } catch {
    return PORTAL_POR_DEFECTO;
  }
}

export function usePortal() {
  const [portal, setPortal] = useState<Portal>(leer);
  const cambiar = useCallback((p: Portal) => {
    if (!PERMITE_CAMBIO) return;
    try { localStorage.setItem(CLAVE, p); } catch { /* sin almacenamiento */ }
    setPortal(p);
  }, []);
  return { portal, cambiar };
}
