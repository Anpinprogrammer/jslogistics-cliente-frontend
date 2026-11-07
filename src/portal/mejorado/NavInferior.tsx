import { NavLink } from 'react-router-dom';
import { cambioPendiente } from '../../lib/negocio';
import type { DatosCliente } from '../useDatosCliente';

const ICONOS: Record<string, string> = {
  inicio: '<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>',
  pedidos: '<path d="M21 8l-9-5-9 5v8l9 5 9-5V8z"/><path d="M3 8l9 5 9-5M12 13v8"/>',
  cuenta: '<path d="M3 7a2 2 0 0 1 2-2h13v2"/><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M16 13.5h2"/>',
};

/**
 * Menú de abajo en el celular, como la barra de pestañas de la app actual, con el estilo de la landing.
 * En computador no se muestra: ahí la navegación está en la barra de arriba.
 */
export default function NavInferior({ d }: { d: DatosCliente }) {
  const pendientes = d.pedidos.filter(p => p.estado === 'pendiente').length + d.pedidos.filter(cambioPendiente).length;
  const items: [string, string, string, number?][] = [
    ['/cliente', 'inicio', 'Inicio'],
    ['/cliente/pedidos', 'pedidos', 'Mis pedidos', pendientes],
    ['/cliente/cuenta', 'cuenta', 'Mi cuenta'],
  ];
  return (
    <nav aria-label="Secciones"
      className="md:hidden fixed inset-x-2.5 z-40 flex justify-around p-1.5 rounded-[22px] backdrop-blur-md
                 dark:bg-steel-900/95 dark:border dark:border-steel-700 bg-white/95 border border-gray-200 shadow-steel-lg-light dark:shadow-steel-lg"
      style={{ bottom: 'calc(10px + env(safe-area-inset-bottom, 0px))' }}>
      {items.map(([to, ico, t, n]) => (
        <NavLink key={to} to={to} end
          className={({ isActive }) =>
            `relative flex-1 max-w-[120px] flex flex-col items-center gap-0.5 pt-2 pb-1.5 rounded-2xl text-[11px] font-600 transition-colors ${isActive
              ? 'text-accent-500 dark:text-accent-400 bg-accent-500/10'
              : 'dark:text-silver-400 text-gray-500'}`}>
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
            aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICONOS[ico] }} />
          <span>{t}</span>
          {n ? <span className="absolute top-0.5 left-[calc(50%+6px)] min-w-[18px] h-[18px] px-1 rounded-full bg-danger text-white text-[10px] leading-[18px] text-center">{n}</span> : null}
        </NavLink>
      ))}
    </nav>
  );
}
