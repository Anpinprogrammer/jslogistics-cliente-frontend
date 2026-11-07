import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { EmptyState } from '../../components/ui';
import { hoy, hora, moverDia, pesos } from '../../lib/formato';
import { cambioPendiente, delDia, MOTIVOS } from '../../lib/negocio';
import type { DatosCliente } from '../useDatosCliente';
import { EstadoBadge, Filtros, Miniatura } from './ui';

type Filtro = 'todos' | 'ruta' | 'ent' | 'dev' | 'cambio';

export default function Pedidos({ d }: { d: DatosCliente }) {
  const [sp, setSp] = useSearchParams();
  const f = (sp.get('f') as Filtro) || 'todos', q = sp.get('q') || '', dia = sp.get('dia') || '';
  const poner = (k: string, v: string) => setSp(prev => { const n = new URLSearchParams(prev); v ? n.set(k, v) : n.delete(k); return n; }, { replace: true });

  const lista = useMemo(() => {
    let ps = [...d.pedidos].sort((a, b) => b.n - a.n);
    if (f === 'cambio') ps = ps.filter(cambioPendiente);
    else if (f === 'ruta') ps = ps.filter(p => p.estado === 'pendiente');
    else if (f === 'ent') ps = ps.filter(p => p.estado === 'entregado');
    else if (f === 'dev') ps = ps.filter(p => p.estado === 'devuelto');
    if (q) ps = ps.filter(p => (p.guia + ' ' + (p.destinatario || '')).toLowerCase().includes(q.toLowerCase()));
    if (dia) ps = ps.filter(p => delDia(p, dia));
    return ps;
  }, [d.pedidos, f, q, dia]);
  const enRuta = d.pedidos.filter(p => p.estado === 'pendiente').length, cambios = d.pedidos.filter(cambioPendiente).length;

  return (
    <>
      <div className="mb-6 animate-fade-up">
        <p className="text-xs font-mono text-accent-400 uppercase tracking-widest mb-1">Mis pedidos</p>
        <h1 className="font-display font-800 text-3xl sm:text-4xl dark:text-white text-gray-700">Tus envíos</h1>
        <p className="text-silver-500 text-sm mt-1">Tus envíos con JS Logistics y sus pruebas de entrega.</p>
      </div>

      <div className="space-y-4 mb-6 animate-fade-up animate-delay-100">
        <Filtros<Filtro> valor={f} alCambiar={v => poner('f', v === 'todos' ? '' : v)}
          opciones={[['todos', 'Todos'], ['ruta', 'En ruta', enRuta], ['ent', 'Entregados'], ['dev', 'Devueltos'], ['cambio', 'Cambios por recibir', cambios]]} />
        <div className="flex flex-col sm:flex-row gap-3">
          <input type="search" value={q} onChange={e => poner('q', e.target.value)} placeholder="Buscar guía o quien recibió" aria-label="Buscar" className="input sm:max-w-sm" />
          <div className="flex items-center gap-2">
            <button className="btn-steel btn-sm" aria-label="Día anterior" onClick={() => poner('dia', moverDia(dia || hoy(), -1))}>‹</button>
            <input type="date" value={dia} max={hoy()} onChange={e => poner('dia', e.target.value)} aria-label="Filtrar por día" className="input w-auto" />
            <button className="btn-steel btn-sm" aria-label="Día siguiente" disabled={!dia || dia >= hoy()} onClick={() => poner('dia', moverDia(dia, 1))}>›</button>
            <button className="btn-ghost btn-sm" onClick={() => poner('dia', dia ? '' : hoy())}>{dia ? 'Ver todos' : 'Hoy'}</button>
          </div>
        </div>
        {dia && <p className="text-sm text-silver-500">{lista.length} envío{lista.length === 1 ? '' : 's'} de ese día</p>}
      </div>

      {lista.length === 0 ? <EmptyState message="No hay envíos aquí." sub="Prueba con otro filtro o con otro día." /> : (
        <div className="card divide-y dark:divide-steel-800 divide-gray-100 animate-fade-up animate-delay-200">
          {lista.slice(0, 300).map(p => (
            <Link key={p.guia} to={p.guia} className="flex items-center gap-4 px-5 py-4 dark:hover:bg-steel-800/30 hover:bg-gray-50 transition-colors group">
              <Miniatura src={p.mini} className="w-12 h-12" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-mono text-sm dark:text-silver-200 text-gray-700">{p.guia}</span>
                  <EstadoBadge p={p} />
                </div>
                <p className="text-xs text-silver-500 truncate">
                  {p.estado === 'entregado' ? `Recibió ${p.destinatario} · ${hora(p.entregado!)}`
                    : p.estado === 'devuelto' ? `${MOTIVOS[p.motivoDev] || 'Devuelto'} · ${hora(p.entregado!)}` : `Salió ${hora(p.creado)}`}
                </p>
              </div>
              <span className="text-sm font-700 dark:text-silver-200 text-gray-700 tabular-nums">{p.estado === 'entregado' ? pesos(p.valorCobrado) : ''}</span>
              <svg className="w-4 h-4 text-steel-500 group-hover:text-accent-400 transition-colors flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6" /></svg>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
