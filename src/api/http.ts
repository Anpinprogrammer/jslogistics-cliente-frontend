/**
 * Cliente HTTP único: la sesión va en la cookie httpOnly `jsl_sesion`, así que el frontend nunca ve el JWT.
 * - credentials: 'include' en todas las llamadas.
 * - X-JSL: 1 en todo lo que no sea GET (protección CSRF que exige el backend).
 * - Errores con la forma del backend: { error: { code, message, campos? } }.
 */
export const BASE = (import.meta.env.VITE_API_URL as string | undefined) || '/api';
export const DEMO = import.meta.env.VITE_DEMO === 'true';

export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string, public campos?: { campo: string; mensaje: string }[]) {
    super(message);
  }
}

/** Avisa a la app cuando la sesión venció (401), para volver al login. */
export const alSalir = new EventTarget();

export async function api<T>(ruta: string, init: RequestInit & { json?: unknown } = {}): Promise<T> {
  const { json, headers, ...resto } = init;
  const metodo = (resto.method || 'GET').toUpperCase();
  let r: Response;
  try {
    r = await fetch(BASE + ruta, {
      ...resto,
      method: metodo,
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        ...(json !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(metodo !== 'GET' ? { 'X-JSL': '1' } : {}),
        ...headers,
      },
      body: json !== undefined ? JSON.stringify(json) : resto.body,
    });
  } catch {
    throw new ApiError(0, 'SIN_CONEXION', 'No hay conexión con el servidor. Revisa tu señal e intenta de nuevo.');
  }
  if (r.status === 204) return undefined as T;
  const cuerpo = await r.json().catch(() => null);
  if (!r.ok) {
    if (r.status === 401 && ruta !== '/auth/ingresar') alSalir.dispatchEvent(new Event('401'));
    const e = cuerpo?.error;
    throw new ApiError(r.status, e?.code || 'ERROR', e?.message || `Error ${r.status}`, e?.campos);
  }
  return cuerpo as T;
}
