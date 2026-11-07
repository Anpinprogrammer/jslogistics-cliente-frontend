import { lazy, Suspense } from 'react';
import { Spinner } from '../components/ui';
import { PERMITE_CAMBIO, usePortal, type Portal } from './config';

// Cada portal se descarga solo si se usa: el clásico trae su propio CSS (el de la app actual).
const PortalMejorado = lazy(() => import('./mejorado/PortalMejorado'));
const PortalClasico = lazy(() => import('./clasico/PortalClasico'));

/** Elige el portal del cliente según la configuración del dueño (portal/config.ts). */
export default function PortalCliente({ portal, cambiar }: { portal: Portal; cambiar: (p: Portal) => void }) {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>}>
      {portal === 'clasico' ? <PortalClasico /> : <PortalMejorado />}
      {PERMITE_CAMBIO && <CambioPortal portal={portal} cambiar={cambiar} />}
    </Suspense>
  );
}

/** Botón flotante para comparar los dos portales. Solo aparece con VITE_PERMITIR_CAMBIO_PORTAL=true. */
function CambioPortal({ portal, cambiar }: { portal: Portal; cambiar: (p: Portal) => void }) {
  const otro: Portal = portal === 'clasico' ? 'mejorado' : 'clasico';
  return (
    <div role="group" aria-label="Versión del portal"
      style={{ position: 'fixed', zIndex: 80, right: 12, bottom: 'calc(96px + env(safe-area-inset-bottom, 0px))', display: 'flex', alignItems: 'center', gap: 8,
        background: '#0f1f3d', color: '#fff', borderRadius: 999, padding: '6px 6px 6px 14px', boxShadow: '0 6px 24px rgba(0,0,0,.3)', fontFamily: 'system-ui, sans-serif', fontSize: 13 }}>
      <span>Versión: <b>{portal === 'clasico' ? 'clásica' : 'mejorada'}</b></span>
      <button onClick={() => cambiar(otro)} style={{ border: 0, borderRadius: 999, padding: '6px 12px', background: '#0ea5e9', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
        Ver {otro === 'clasico' ? 'clásica' : 'mejorada'}
      </button>
    </div>
  );
}

export { usePortal };
