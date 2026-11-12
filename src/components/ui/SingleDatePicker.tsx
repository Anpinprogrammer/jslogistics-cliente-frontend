/**
 * Selector de un día con calendario propio, en lugar del <input type="date"> nativo, que en iOS/Safari se
 * sale de su caja y no respeta el ancho. Trabaja con días 'AAAA-MM-DD' y "Hoy" es el día de Colombia.
 * Sus estilos (clases `sdp-*`) están al final de `portal/clasico/clasico.css`, porque hoy solo lo usa el portal.
 */
import { useEffect, useId, useRef, useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { hoy } from '../../lib/formato';

interface Props {
  value: string;
  onChange: (dia: string) => void;
  placeholder?: string;
  /** Último día que se puede elegir (por ejemplo, hoy). */
  max?: string;
  id?: string;
  /** Texto para lectores de pantalla cuando no hay un <label> visible. */
  etiqueta?: string;
  /** Oculta la palabra "Cambiar" del botón cuando hay poco espacio. */
  compacto?: boolean;
}

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const MESES_CORTOS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const DIAS_SEMANA = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];

const dos = (n: number) => String(n).padStart(2, '0');
const mostrar = (dia: string) => { const [a, m, d] = dia.split('-').map(Number); return `${dos(d)} ${MESES_CORTOS[m - 1]} ${a}`; };
/** Primer día del mes de `dia` como [año, mes 0-11]. */
const mesDe = (dia: string): [number, number] => { const [a, m] = dia.split('-').map(Number); return [a, m - 1]; };

export function SingleDatePicker({ value, onChange, placeholder = 'Elegir fecha', max, id, etiqueta, compacto }: Props) {
  const [abierto, setAbierto] = useState(false);
  // En escritorio el calendario se abre hacia arriba si abajo no cabe.
  const [arriba, setArriba] = useState(false);
  const [[anio, mes], setVista] = useState(() => mesDe(value || hoy()));
  const caja = useRef<HTMLDivElement>(null);
  const titulo = useId();

  // Al abrir, el calendario muestra el mes del día elegido (o el de hoy).
  useEffect(() => { if (abierto) setVista(mesDe(value || hoy())); }, [abierto, value]);
  useEffect(() => {
    if (!abierto) return;
    const fuera = (e: Event) => { if (caja.current && !caja.current.contains(e.target as Node)) setAbierto(false); };
    const tecla = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); e.preventDefault(); setAbierto(false); } };
    document.addEventListener('mousedown', fuera);
    document.addEventListener('touchstart', fuera);
    // En captura, para que Escape cierre solo el calendario y no la hoja (<dialog>) que lo contiene.
    document.addEventListener('keydown', tecla, true);
    return () => { document.removeEventListener('mousedown', fuera); document.removeEventListener('touchstart', fuera); document.removeEventListener('keydown', tecla, true); };
  }, [abierto]);

  const elegir = (dia: string) => { onChange(dia); setAbierto(false); };
  const mover = (n: number) => setVista(([a, m]) => { const f = new Date(a, m + n, 1); return [f.getFullYear(), f.getMonth()]; });
  const primero = new Date(anio, mes, 1).getDay(), desfase = primero === 0 ? 6 : primero - 1;
  const diasMes = new Date(anio, mes + 1, 0).getDate();
  const h = hoy();
  const ultimoMes = max ? mesDe(max) : null;
  const sinSiguiente = !!ultimoMes && (anio > ultimoMes[0] || (anio === ultimoMes[0] && mes >= ultimoMes[1]));

  return (
    <div className={'sdp' + (abierto ? ' abierto' : '')} ref={caja}>
      <button type="button" id={id} className="sdp-boton" onClick={e => { const r = e.currentTarget.getBoundingClientRect(); setArriba(window.innerHeight - r.bottom < 420 && r.top > 420); setAbierto(v => !v); }} aria-haspopup="dialog" aria-expanded={abierto}
        aria-label={etiqueta ? `${etiqueta}: ${value ? mostrar(value) : placeholder}` : undefined}>
        <span className="sdp-valor"><Calendar aria-hidden="true" /><span className={value ? '' : 'sdp-vacio'}>{value ? mostrar(value) : placeholder}</span></span>
        {!compacto && <span className="sdp-cambiar" aria-hidden="true">Cambiar</span>}
      </button>
      {abierto && <>
        <div className="sdp-velo" aria-hidden="true" onClick={() => setAbierto(false)} />
        <div className={'sdp-panel' + (arriba ? ' arriba' : '')} role="dialog" aria-labelledby={titulo}>
          <div className="sdp-mes">
            <button type="button" onClick={() => mover(-1)} aria-label="Mes anterior"><ChevronLeft aria-hidden="true" /></button>
            <b id={titulo} aria-live="polite">{MESES[mes]} {anio}</b>
            <button type="button" onClick={() => mover(1)} disabled={sinSiguiente} aria-label="Mes siguiente"><ChevronRight aria-hidden="true" /></button>
          </div>
          <div className="sdp-semana" aria-hidden="true">{DIAS_SEMANA.map(d => <span key={d}>{d}</span>)}</div>
          <div className="sdp-dias">
            {Array.from({ length: desfase }, (_, i) => <span key={'v' + i} />)}
            {Array.from({ length: diasMes }, (_, i) => {
              const dia = `${anio}-${dos(mes + 1)}-${dos(i + 1)}`;
              return <button key={dia} type="button" onClick={() => elegir(dia)} disabled={!!max && dia > max}
                aria-pressed={value === dia} aria-current={dia === h ? 'date' : undefined}
                aria-label={mostrar(dia)}>{i + 1}</button>;
            })}
          </div>
          <div className="sdp-pie">
            <button type="button" className="sdp-hoy" onClick={() => elegir(h)}>Hoy</button>
            <button type="button" className="sdp-cerrar" onClick={() => setAbierto(false)}>Cerrar</button>
          </div>
        </div>
      </>}
    </div>
  );
}
