/* Hoja inferior de filtros del celular, compartida por "Mis pedidos" y "Mis solicitudes". */
import { useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, SlidersHorizontal, X } from 'lucide-react';
import { SingleDatePicker } from '../../components/ui/SingleDatePicker';
import { diaCorto, hoy, moverDia } from '../../lib/formato';

export interface TextosHoja { titulo: string; estado: string; fecha: string; solo: string }
export const TEXTOS_PEDIDOS: TextosHoja = { titulo: 'Filtrar mis pedidos', estado: 'Estado del envío', fecha: 'Fecha', solo: 'Solo los envíos de ' };
export const TEXTOS_SOLICITUDES: TextosHoja = { titulo: 'Filtrar mis solicitudes', estado: 'Estado de la solicitud', fecha: 'Fecha de solicitud', solo: 'Solo las solicitudes de ' };

/** Hoja inferior del celular con el estado y la fecha de "Mis pedidos". Los cambios se guardan en un borrador y
    solo se aplican con "Aplicar filtros", así la lista de atrás no se vuelve a pedir con cada flecha. */
export function HojaFiltros<T extends string>({ estados, filtro, sinFiltro, dia, alCerrar, alAplicar, textos = TEXTOS_PEDIDOS }: {
  estados: [T, string, number | null][]; filtro: T; sinFiltro: T; dia: string; alCerrar: () => void; alAplicar: (f: T, dia: string) => void; textos?: TextosHoja;
}) {
  const [f, setF] = useState(filtro), [d, setD] = useState(dia), h = hoy();
  const base = d || h;
  return <>
    <header className="hoja-cab">
      <h2><SlidersHorizontal aria-hidden="true" />{textos.titulo}</h2>
      <button type="button" className="hoja-cerrar" onClick={alCerrar} aria-label="Cerrar filtros"><X aria-hidden="true" /></button>
    </header>
    <div className="hoja-campo">
      <label htmlFor="hoja-estado">{textos.estado}</label>
      <div className="hoja-select">
        <select id="hoja-estado" value={f} onChange={e => setF(e.target.value as T)}>
          {estados.map(([k, t, n]) => <option key={k} value={k}>{n == null ? t : `${t} (${n})`}</option>)}
        </select>
        <ChevronDown aria-hidden="true" />
      </div>
    </div>
    <div className="hoja-campo">
      <label htmlFor="hoja-dia">{textos.fecha}</label>
      <div className="hoja-fecha">
        <button type="button" className="hoja-flecha" onClick={() => setD(moverDia(base, -1))} aria-label="Día anterior"><ChevronLeft aria-hidden="true" /></button>
        <span className="hoja-dia"><SingleDatePicker id="hoja-dia" value={d} onChange={setD} max={h} placeholder="Sin fecha" compacto /></span>
        <button type="button" className="hoja-flecha" onClick={() => setD(moverDia(d, 1))} disabled={!d || d >= h} aria-label="Día siguiente"><ChevronRight aria-hidden="true" /></button>
        <button type="button" className="hoja-hoy" aria-pressed={d === h} onClick={() => setD(h)}>Hoy</button>
      </div>
      <small>{d ? textos.solo + diaCorto(d) + '.' : 'Sin fecha: se ven todos los días.'}</small>
    </div>
    <div className="hoja-pie">
      <button type="button" className="btn sec" onClick={() => alAplicar(sinFiltro, '')}>Limpiar filtros</button>
      <button type="button" className="btn" onClick={() => alAplicar(f, d)}>Aplicar filtros</button>
    </div>
  </>;
}
