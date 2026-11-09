import type { EnlaceCorreo, Usuario } from '../types/dominio';
import { api, ApiError, DEMO } from './http';
import { demo } from '../demo/datos';

/** Endpoints de sesión y de enlaces por correo del backend (backend/README.md). */
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
  /** Pide el enlace. El backend responde 204 exista o no la cuenta, para no revelar correos. */
  async recuperar(email: string): Promise<void> {
    if (DEMO) { await new Promise(r => setTimeout(r, 250)); return; }
    await api('/auth/recuperar', { method: 'POST', json: { email } });
  },
  /** Revisa el enlace antes de mostrar el formulario. */
  async enlace(token: string): Promise<EnlaceCorreo> {
    if (DEMO) {
      return {
        tipo: 'clave',
        nombre: 'Cliente demo',
        email: 'c***@demo.co',
        expira: new Date(Date.now() + 3_600_000).toISOString(),
      };
    }
    return (await api<{ enlace: EnlaceCorreo }>(`/auth/enlace/${encodeURIComponent(token)}`)).enlace;
  },
  async restablecer(token: string, clave: string): Promise<void> {
    if (DEMO) { await new Promise(r => setTimeout(r, 250)); return; }
    await api('/auth/restablecer', { method: 'POST', json: { token, clave } });
  },
  async activar(token: string, clave: string): Promise<void> {
    if (DEMO) { await new Promise(r => setTimeout(r, 250)); return; }
    await api('/auth/activar', { method: 'POST', json: { token, clave } });
  },
};
