/** Piezas del portal mejorado: el estilo de la landing (steel / silver / accent) con los datos de la app actual. */
import type { ReactNode } from 'react';
import type { Pedido } from '../../types/dominio';
import { diaCorto, pesos } from '../../lib/formato';
import { EMPRESA, metodoTxt, textoDomi, type Recibo } from '../../lib/negocio';
import { fechaLarga } from '../../lib/formato';

export function EstadoBadge({ p, ruta }: { p: Pedido; ruta?: boolean }) {
  const [cls, txt] =
    p.estado === 'entregado' ? ['dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-600/40 bg-emerald-50 text-emerald-700 border-emerald-300', 'Entregado']
    : p.estado === 'devuelto' ? ['dark:bg-red-900/30 dark:text-red-300 dark:border-red-700/50 bg-red-50 text-red-700 border-red-300', 'Devuelto']
    : ruta ? ['dark:bg-accent-500/10 dark:text-accent-400 dark:border-accent-500/30 bg-cyan-50 text-cyan-700 border-cyan-300', 'En ruta']
    : ['dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-600/40 bg-amber-50 text-amber-700 border-amber-300', 'Por entregar'];
  return (
    <span className="inline-flex items-center gap-1.5 flex-wrap">
      <span className={`badge ${cls}`}>{txt}</span>
      {p.estado === 'pendiente' && p.intentos.length > 0 && (
        <span className="badge dark:bg-red-900/30 dark:text-red-300 dark:border-red-700/50 bg-red-50 text-red-700 border-red-300">
          {p.intentos.length} intento{p.intentos.length === 1 ? '' : 's'}
        </span>
      )}
      {p.cambio && (
        <span className={`badge ${p.cambioRecibido
          ? 'dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-600/40 bg-emerald-50 text-emerald-700 border-emerald-300'
          : 'dark:bg-red-900/30 dark:text-red-300 dark:border-red-700/50 bg-red-50 text-red-700 border-red-300'}`}>
          {p.cambioRecibido ? 'Cambio recibido' : 'Cambio por entregar'}
        </span>
      )}
    </span>
  );
}

export function Miniatura({ src, className = 'w-11 h-11' }: { src?: string | null; className?: string }) {
  return src
    ? <img src={src} alt="" className={`${className} rounded-lg object-cover flex-shrink-0`} />
    : (
      <div className={`${className} rounded-lg dark:bg-steel-800 bg-steel-50 flex items-center justify-center flex-shrink-0`}>
        <svg className="w-5 h-5 text-silver-500" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path d="M21 8l-9-5-9 5v8l9 5 9-5V8z" /><path d="M3 8l9 5 9-5M12 13v8" />
        </svg>
      </div>
    );
}

export function Tarjeta({ titulo, sub, accion, children, className = '' }: { titulo: string; sub?: string; accion?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`card p-5 flex flex-col ${className}`}>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="font-display font-600 text-lg dark:text-white text-gray-700">{titulo}</h2>
          {sub && <p className="text-xs text-silver-500 mt-0.5">{sub}</p>}
        </div>
        {accion}
      </div>
      {children}
    </section>
  );
}

/** Dona de efectividad: cada color con su nombre y su número al lado. */
export function Dona({ entregados, devueltos }: { entregados: number; devueltos: number }) {
  const tot = entregados + devueltos, r = 15.915;
  const pEnt = tot ? (entregados * 100) / tot : 0;
  const gap = entregados && devueltos ? 1.2 : 0;
  return (
    <div className="flex items-center justify-center gap-8 flex-wrap py-2">
      <div className="relative w-40 h-40">
        <svg viewBox="0 0 42 42" className="w-full h-full -rotate-90" role="img" aria-label={`Entregados: ${entregados}, devueltos: ${devueltos}`}>
          <circle cx="21" cy="21" r={r} fill="none" strokeWidth="6" className="stroke-steel-100 dark:stroke-steel-800" />
          {entregados > 0 && <circle cx="21" cy="21" r={r} fill="none" strokeWidth="6" stroke="#10b981" strokeDasharray={`${Math.max(0.5, pEnt - gap)} ${100 - Math.max(0.5, pEnt - gap)}`} />}
          {devueltos > 0 && <circle cx="21" cy="21" r={r} fill="none" strokeWidth="6" stroke="#ef4444" strokeDasharray={`${Math.max(0.5, 100 - pEnt - gap)} ${pEnt + gap}`} strokeDashoffset={-pEnt} />}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display font-800 text-3xl dark:text-white text-gray-800">{tot ? Math.round(pEnt) + '%' : '—'}</span>
          <span className="text-xs text-silver-500">entregado</span>
        </div>
      </div>
      <ul className="space-y-3">
        {[['Entregados', entregados, 'bg-success'], ['Devueltos', devueltos, 'bg-danger']].map(([t, n, c]) => (
          <li key={t as string} className="flex items-center gap-3">
            <i className={`w-2.5 h-2.5 rounded-full ${c}`} />
            <div>
              <p className="text-xs text-silver-500">{t}</p>
              <p className="font-display font-700 text-xl dark:text-white text-gray-800 leading-none">{n}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Entregas por día (una serie). El valor aparece al pasar el dedo o el mouse. */
export function Columnas({ datos }: { datos: { dia: string; n: number; hoy: boolean }[] }) {
  const max = Math.max(4, Math.ceil(Math.max(...datos.map(d => d.n)) / 4) * 4), cada = Math.ceil(datos.length / 8);
  return (
    <div>
      <div className="relative flex items-end gap-[3px] h-44 pt-2 border-b dark:border-steel-700 border-gray-200"
        role="img" aria-label={datos.map(d => `${diaCorto(d.dia)}: ${d.n}`).join(', ')}>
        <span className="absolute -top-2 left-0 text-[10px] text-silver-500">{max}</span>
        {datos.map(d => (
          <div key={d.dia} tabIndex={0} className="group relative flex-1 h-full flex items-end outline-none">
            <i className={`block w-full rounded-t ${d.hoy ? 'bg-accent-500' : 'bg-steel-400 dark:bg-steel-500'} group-hover:bg-accent-400 group-focus:bg-accent-400 transition-colors`}
              style={{ height: `${(d.n * 100) / max}%`, minHeight: 2 }} />
            <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block group-focus:block whitespace-nowrap rounded-md px-2 py-1 text-[11px] font-600 dark:bg-white dark:text-steel-900 bg-steel-900 text-white z-10">
              {diaCorto(d.dia)}: {d.n} entrega{d.n === 1 ? '' : 's'}
            </span>
          </div>
        ))}
      </div>
      <div className="flex gap-[3px] mt-1.5 text-[10px] text-silver-500" aria-hidden>
        {datos.map((d, i) => <span key={d.dia} className="flex-1 text-center">{(datos.length - 1 - i) % cada === 0 ? Number(d.dia.slice(8)) : ''}</span>)}
      </div>
    </div>
  );
}

export function Modal({ abierto, alCerrar, titulo, children }: { abierto: boolean; alCerrar: () => void; titulo: string; children: ReactNode }) {
  if (!abierto) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-steel-950/70 backdrop-blur-sm p-0 sm:p-4" onClick={alCerrar}>
      <div role="dialog" aria-modal="true" aria-label={titulo} onClick={e => e.stopPropagation()}
        className="card w-full sm:max-w-lg max-h-[92vh] overflow-y-auto p-6 rounded-b-none sm:rounded-xl animate-fade-up dark:bg-steel-900 bg-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-700 text-xl dark:text-white text-gray-800">{titulo}</h2>
          <button onClick={alCerrar} aria-label="Cerrar" className="w-9 h-9 rounded-full dark:bg-steel-800 bg-gray-100 dark:text-silver-300 text-gray-600 text-lg">×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

/** Recibo de cuadre del día: el mismo contenido del ticket de la app actual. */
export function ReciboTicket({ dia, nombre, r }: { dia: string; nombre: string; r: Recibo }) {
  const fila = 'flex justify-between gap-3 py-1.5 border-b border-gray-100 text-sm';
  return (
    <div className="bg-white text-gray-900 rounded-lg border border-gray-200 px-4 py-5 max-w-sm mx-auto font-body">
      <div className="flex flex-col items-center text-center gap-0.5 pb-3 border-b-2 border-dashed border-gray-300">
        <img src="/img/logo.png" alt="" className="w-12 h-12 object-contain mb-1" />
        <b>{EMPRESA.nombre}</b>
        <span className="text-sm text-gray-500">Recibo de cuadre</span>
        <span className="text-sm text-gray-500 first-letter:uppercase">{fechaLarga(dia)}</span>
      </div>
      <p className="font-800 text-lg text-center py-2.5 border-b-2 border-dashed border-gray-300">{nombre}</p>
      {r.anterior !== 0 && <div className={fila}><span>Saldo anterior</span><span className="font-600 tabular-nums">{pesos(r.anterior)}</span></div>}
      {r.lineas.map((l, i) => (
        <div key={i} className={fila}>
          <span>{l.t}{l.pedido && <small className="block text-xs text-gray-500">{l.pedido.guia} · {metodoTxt(l.pedido)} · cobró {pesos(l.pedido.valorCobrado)} · {textoDomi(l.pedido)}</small>}</span>
          <span className="font-600 tabular-nums whitespace-nowrap">{pesos(l.v)}</span>
        </div>
      ))}
      <div className={`${fila} font-800 border-b-2 border-dashed border-gray-300`}><span>Total</span><span>{pesos(r.total)}</span></div>
      {r.pagos !== 0 && <>
        <div className={fila}><span>Pagado</span><span className="font-600">{pesos(r.pagos)}</span></div>
        <div className={`${fila} font-800 border-b-2 border-dashed border-gray-300`}><span>Queda pendiente</span><span>{pesos(r.queda)}</span></div>
      </>}
      <p className="text-center text-sm text-gray-600 font-600 pt-3">{EMPRESA.lema}<br />{EMPRESA.tel}<br />{EMPRESA.ig}</p>
    </div>
  );
}

export function Filtros<T extends string>({ opciones, valor, alCambiar }: { opciones: [T, string, number?][]; valor: T; alCambiar: (v: T) => void }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
      {opciones.map(([k, t, n]) => (
        <button key={k} onClick={() => alCambiar(k)} aria-pressed={valor === k}
          className={`flex-none px-4 py-2 rounded-full text-sm font-600 transition-colors border ${valor === k
            ? 'bg-accent-500 text-white border-accent-500 shadow-accent'
            : 'dark:bg-steel-900/60 dark:border-steel-700 dark:text-silver-300 dark:hover:border-steel-500 bg-white border-gray-200 text-gray-600 hover:border-steel-300'}`}>
          {t}{n ? <span className={`ml-2 inline-block min-w-[20px] px-1.5 rounded-full text-xs ${valor === k ? 'bg-white/25' : 'bg-danger text-white'}`}>{n}</span> : null}
        </button>
      ))}
    </div>
  );
}
