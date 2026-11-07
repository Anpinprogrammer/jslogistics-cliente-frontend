import type { Usuario } from '../types/dominio';
import { api, ApiError, DEMO } from './http';
import { demo } from '../demo/datos';

/** Endpoints de sesión del backend (backend/README.md). */
export const authApi = {
  async yo(): Promise<Usuario | null> {
    if (DEMO) return demo.sesion();
    try {
      return (await api<{ usuario: Usuario }>('/auth/yo')).usuario;
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) return null;
      throw e;
    }
  },
  async ingresar(email: string, clave: string): Promise<Usuario> {
    if (DEMO) return demo.ingresar(email, clave);
    return (await api<{ usuario: Usuario }>('/auth/ingresar', { method: 'POST', json: { email, clave } })).usuario;
  },
  async salir(): Promise<void> {
    if (DEMO) return demo.salir();
    await api('/auth/salir', { method: 'POST' });
  },
};
