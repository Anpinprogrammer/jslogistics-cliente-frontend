/** Piezas de la vista del cliente de la app actual, con el mismo HTML y las mismas clases de estilos.css. */
import { useEffect, useRef, type ReactNode } from 'react';
import type { Pedido } from '../../types/dominio';
import { diaCorto, hoy, moverDia } from '../../lib/formato';

export const EtqEstado = ({ p }: { p: Pedido }) =>
  p.estado === 'entregado' ? <span className="etq ent">Entregado</span>
  : p.estado === 'devuelto' ? <span className="etq dev">Devuelto</span>
  : <><span className="etq pend">Por entregar</span>{p.intentos.length > 0 && <> <span className="etq sin">{p.intentos.length} intento{p.intentos.length === 1 ? '' : 's'}</span></>}</>;

export const EtqCambio = ({ p }: { p: Pedido }) =>
  p.cambio ? <> {p.cambioRecibido ? <span className="etq ent">Cambio recibido</span> : <span className="etq sin">Cambio por entregar</span>}</> : null;

export const EtqDash = ({ p }: { p: Pedido }) => (p.estado === 'pendiente' ? <span className="etq ruta">En ruta</span> : <EtqEstado p={p} />);

export const Foto = ({ src }: { src?: string | null }) => (src ? <img src={src} alt="" /> : <span className="sinfoto" />);

/** Dona por estado (donaHtml). */
export function Dona({ segs, centro, sub }: { segs: { t: string; n: number; c: string }[]; centro: string; sub: string }) {
  const tot = segs.reduce((a, x) => a + x.n, 0), r = 15.915, gap = segs.filter(x => x.n).length > 1 ? 1.2 : 0;
  let acum = 0;
  return (
    <div className="dona">
      <div className="dona-svg">
        <svg viewBox="0 0 42 42" role="img" aria-label={segs.map(x => x.t + ': ' + x.n).join(', ')}>
          <circle cx="21" cy="21" r={r} fill="none" stroke="var(--hueco)" strokeWidth="6" />
          {segs.filter(x => x.n).map(x => {
            const p = (x.n * 100) / tot, l = Math.max(0.5, p - gap), o = -acum; acum += p;
            return <circle key={x.t} cx="21" cy="21" r={r} fill="none" stroke={x.c} strokeWidth="6" strokeDasharray={`${l} ${100 - l}`} strokeDashoffset={o} data-tip=""><title>{x.t}: {x.n}</title></circle>;
          })}
        </svg>
        <div className="dona-centro"><b>{centro}</b><span>{sub}</span></div>
      </div>
      <ul className="leyenda">{segs.map(x => <li key={x.t}><i style={{ background: x.c }} />{x.t}<b>{x.n}</b></li>)}</ul>
    </div>
  );
}

/** Columnas por día (columnasHtml). */
export function Columnas({ datos }: { datos: { dia: string; n: number; hoy: boolean }[] }) {
  const max = Math.max(4, Math.ceil(Math.max(...datos.map(d => d.n)) / 4) * 4), cada = Math.ceil(datos.length / 8);
  const tip = (d: { dia: string; n: number }) => `${diaCorto(d.dia)}: ${d.n} entrega${d.n === 1 ? '' : 's'}`;
  return (
    <>
      <div className="colbar" role="img" aria-label={'Entregas por día: ' + datos.map(tip).join(', ')}>
        <span className="colbar-max">{max}</span>
        {datos.map(d => <div key={d.dia} className={'cb' + (d.hoy ? ' hoy' : '')} tabIndex={0} data-tip={tip(d)}><i style={{ height: `${(d.n * 100) / max}%` }} /></div>)}
      </div>
      <div className="colbar-ejes" aria-hidden="true">{datos.map((d, i) => <span key={d.dia}>{(datos.length - 1 - i) % cada === 0 ? String(Number(d.dia.slice(8))) : ''}</span>)}</div>
    </>
  );
}

/** Filtro por día (filtroDiaHtml). */
export function FiltroDia({ dia, poner }: { dia: string; poner: (d: string) => void }) {
  return (
    <div className="filtro-dia">
      <button className="btn sec chico" aria-label="Día anterior" onClick={() => poner(moverDia(dia || hoy(), -1))}>‹</button>
      <input type="date" value={dia} max={hoy()} aria-label="Filtrar por día" onChange={e => poner(e.target.value)} />
      <button className="btn sec chico" aria-label="Día siguiente" disabled={!dia || dia >= hoy()} onClick={() => poner(moverDia(dia, 1))}>›</button>
      {dia ? <button className="btn sec chico" onClick={() => poner('')}>Ver todos</button> : <button className="btn sec chico" onClick={() => poner(hoy())}>Hoy</button>}
    </div>
  );
}

/** El <dialog> de la app (#dlg): hoja de abajo en el celular y ventana en el computador. */
export function Dialogo({ abierto, alCerrar, children }: { abierto: boolean; alCerrar: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current; if (!d) return;
    if (abierto && !d.open) { d.showModal(); d.querySelector('.dlg')?.scrollTo(0, 0); }
    if (!abierto && d.open) d.close();
  }, [abierto]);
  return (
    <dialog ref={ref} onClose={alCerrar} onClick={e => { if (e.target === ref.current) alCerrar(); }}>
      <div className="dlg">{abierto && children}</div>
    </dialog>
  );
}

export const Cabecera = ({ children, alCerrar }: { children: ReactNode; alCerrar: () => void }) => (
  <header>{children}<button className="cerrar" aria-label="Cerrar" onClick={alCerrar}>×</button></header>
);
