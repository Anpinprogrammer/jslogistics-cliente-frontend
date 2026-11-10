import { lazy, Suspense } from 'react';
import { Spinner } from '../components/ui';

// El portal se descarga solo cuando se entra: trae su propio CSS (el de la app actual).
const PortalClasico = lazy(() => import('./clasico/PortalClasico'));

/** Portal del cliente: la vista clásica, la misma de la app actual. */
export default function PortalCliente() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>}>
      <PortalClasico />
    </Suspense>
  );
}
