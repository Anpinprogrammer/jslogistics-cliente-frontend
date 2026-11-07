import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { Usuario } from '../types/dominio';
import { authApi } from '../api/auth';
import { alSalir } from '../api/http';

interface Sesion {
  usuario: Usuario | null;
  cargando: boolean;
  ingresar: (email: string, clave: string) => Promise<Usuario>;
  salir: () => Promise<void>;
}

const Ctx = createContext<Sesion | undefined>(undefined);

/** Sesión con cookie httpOnly: al abrir se pregunta /auth/yo; un 401 en cualquier llamada cierra la sesión local. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);
  const qc = useQueryClient();

  useEffect(() => {
    authApi.yo().then(setUsuario).catch(() => setUsuario(null)).finally(() => setCargando(false));
    const vencio = () => { setUsuario(null); qc.clear(); };
    alSalir.addEventListener('401', vencio);
    return () => alSalir.removeEventListener('401', vencio);
  }, [qc]);

  const ingresar = useCallback(async (email: string, clave: string) => {
    const u = await authApi.ingresar(email, clave);
    qc.clear();
    setUsuario(u);
    return u;
  }, [qc]);

  const salir = useCallback(async () => {
    try { await authApi.salir(); } finally { setUsuario(null); qc.clear(); }
  }, [qc]);

  return <Ctx.Provider value={{ usuario, cargando, ingresar, salir }}>{children}</Ctx.Provider>;
}

export function useSesion() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useSesion debe usarse dentro de AuthProvider');
  return c;
}

/** A dónde va cada rol después de iniciar sesión. Por ahora solo el portal del cliente está en React. */
export const portadaDe = (u: Usuario) => (u.rol === 'cliente' ? '/cliente' : '/equipo');
