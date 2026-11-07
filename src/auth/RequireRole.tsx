import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import type { Rol } from '../types/dominio';
import { useSesion } from './AuthProvider';
import { Spinner } from '../components/ui';

export default function RequireRole({ roles, children }: { roles: Rol[]; children: ReactNode }) {
  const { usuario, cargando } = useSesion();
  const location = useLocation();
  if (cargando)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  if (!usuario) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (!roles.includes(usuario.rol)) return <Navigate to="/equipo" replace />;
  return <>{children}</>;
}
