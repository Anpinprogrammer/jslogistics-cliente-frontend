import { useEffect, useLayoutEffect, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle2, FileText, MapPin, Navigation, Search, Truck, Warehouse } from 'lucide-react';
import { ordersAPI } from '../services/api';
import { DEMO } from '../api/http';
import { demo } from '../demo/datos';
import type { Pedido } from '../types/dominio';
import type { Order } from '../types';
import { serviceLabel, statusLabel } from '../utils/format';
import { hora } from '../lib/formato';
import { ESTADO_PEDIDO } from '../lib/negocio';
import Navbar from '../components/layout/Navbar';
import LandingFooter from '../components/layout/LandingFooter';

interface Paso {
  titulo: string;
  lugar?: string;
  fecha: string | null;
  completado: boolean;
}
interface Resultado {
  guia: string;
  estado: string;
  origen?: string;
  destino?: string;
  servicio?: string;
  creado?: string;
  entregado?: string | null;
  pasos: Paso[];
}

const dePedidoDemo = (pedido: Pedido): Resultado => ({
  guia: pedido.guia,
  estado: ESTADO_PEDIDO[pedido.estado].texto,
  origen: pedido.clienteNombre || undefined,
  destino: pedido.destinatario || undefined,
  creado: pedido.creado,
  entregado: pedido.entregado,
  pasos: [
    { titulo: 'Aceptado', fecha: pedido.creado, completado: true },
    { titulo: 'En ruta', fecha: pedido.estado === 'aceptado' ? null : pedido.creado, completado: pedido.estado !== 'aceptado' },
    { titulo: pedido.estado === 'devuelto' ? 'Devuelto' : 'Entregado', fecha: pedido.entregado, completado: pedido.estado === 'entregado' || pedido.estado === 'devuelto' },
  ],
});

const deOrden = (orden: Order): Resultado => ({
  guia: orden.trackingNumber,
  estado: statusLabel[orden.status] || orden.status,
  origen: orden.senderAddress || orden.senderCompany,
  destino: orden.recipientCity || orden.recipientAddress,
  servicio: serviceLabel[orden.serviceType],
  creado: orden.createdAt,
  entregado: orden.deliveredAt,
  pasos: orden.timeline.map(evento => ({ titulo: evento.event, lugar: evento.location, fecha: evento.timestamp, completado: evento.completed })),
});

const iconos = [FileText, Warehouse, Truck, CheckCircle2];
const fecha = (valor?: string | null) => valor ? hora(valor) : 'Pendiente';

export default function Track() {
  const [params] = useSearchParams();
  useLayoutEffect(() => { window.scrollTo(0, 0); }, []);
  const [guia, setGuia] = useState(params.get('n') || '');
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [ejemplos, setEjemplos] = useState<string[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!DEMO) return;
    let activo = true;
    demo.pedidos().then(pedidos => {
      if (!activo) return;
      const muestra = [pedidos.find(p => p.estado === 'pendiente'), pedidos.find(p => p.estado === 'entregado'), pedidos.find(p => p.estado === 'devuelto')];
      setEjemplos(muestra.filter((p): p is Pedido => !!p).map(p => p.guia));
    });
    return () => { activo = false; };
  }, []);

  useEffect(() => {
    const numero = params.get('n');
    if (numero) { setGuia(numero); void buscar(numero); }
    // La URL de la landing entrega la guía inicial; una búsqueda posterior no se reinicia al teclear.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  async function buscar(numero: string) {
    const limpia = numero.trim().toUpperCase();
    if (!limpia) { setError('Ingresa un número de guía para continuar.'); return; }
    setGuia(limpia);
    setResultado(null);
    setError('');
    setCargando(true);
    try {
      if (DEMO) {
        const pedido = (await demo.pedidos()).find(p => p.guia.toUpperCase() === limpia);
        if (!pedido) throw new Error('No encontramos esa guía en la demostración. Prueba uno de los ejemplos.');
        setResultado(dePedidoDemo(pedido));
      } else {
        setResultado(deOrden(await ordersAPI.track(limpia)));
      }
    } catch (fallo) {
      setError(fallo instanceof Error ? fallo.message : 'No pudimos consultar esta guía. Intenta de nuevo.');
    } finally { setCargando(false); }
  }

  const enviar = (evento: FormEvent<HTMLFormElement>) => { evento.preventDefault(); void buscar(guia); };
  const ultimoCompletado = resultado?.pasos.findLastIndex(paso => paso.completado) ?? -1;
  const tonoEstado = resultado?.estado === 'Entregado'
    ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
    : resultado?.estado === 'Devuelto' || resultado?.estado === 'Cancelado'
      ? 'border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300'
      : 'border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-300';

  return (
    <div className="landing">
      <Navbar hero />
    <div className="relative flex min-h-screen w-full flex-col justify-center overflow-hidden bg-slate-50 pb-16 pt-28 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-white sm:pt-32 lg:pb-24">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] opacity-40 [background-size:24px_24px] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)]" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-20 top-1/4 h-96 w-96 rounded-full bg-sky-500/10 blur-3xl dark:bg-sky-500/15" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-20 bottom-1/4 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl dark:bg-indigo-500/15" />
      <div className="relative z-10 mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center motion-safe:animate-[landing-arrive_.5s_ease-out_both] sm:mb-10">
          <span className="mb-3 inline-block rounded-full border border-sky-500/20 bg-sky-500/10 px-3.5 py-1 text-[10px] font-bold uppercase tracking-widest text-sky-700 dark:text-sky-400 sm:text-xs">
            {DEMO ? 'Vista de demostración' : 'Rastreo público'}
          </span>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-5xl">Rastrear envío</h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-600 dark:text-slate-400">Ingresa tu número de guía para consultar el estado y los movimientos disponibles de tu envío.</p>
        </div>

        <div className="mb-8 rounded-3xl border border-slate-200/80 bg-white/85 p-4 shadow-xl backdrop-blur-xl motion-safe:animate-[landing-arrive_.6s_ease-out_both] dark:border-slate-800/80 dark:bg-slate-900/85 dark:shadow-slate-950/60 sm:p-6">
          <form onSubmit={enviar} className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label htmlFor="guia-rastreo" className="sr-only">Número de guía</label>
            <div className="relative min-w-0 flex-1">
              <Search aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
              <input id="guia-rastreo" value={guia} onChange={evento => setGuia(evento.target.value)} placeholder="Ingresa tu número de guía" autoComplete="off" spellCheck={false}
                className="w-full rounded-2xl border border-slate-200 bg-slate-100 py-3.5 pl-12 pr-4 font-mono text-base font-bold uppercase text-slate-900 outline-none transition-all placeholder:font-sans placeholder:font-normal placeholder:normal-case placeholder:text-slate-500 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-800 dark:bg-slate-950 dark:text-white" />
            </div>
            <button type="submit" disabled={cargando} className="flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-2xl bg-sky-400 px-8 py-3.5 text-sm font-extrabold text-slate-950 shadow-lg shadow-sky-500/20 transition-all hover:bg-sky-300 active:scale-95 disabled:cursor-wait disabled:opacity-60 sm:w-auto">
              <Search aria-hidden="true" className="h-4 w-4" />{cargando ? 'Buscando…' : 'Rastrear'}
            </button>
          </form>
          {DEMO && ejemplos.length > 0 && <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-medium">Prueba con:</span>
            {ejemplos.map(ejemplo => <button key={ejemplo} type="button" onClick={() => void buscar(ejemplo)} className="rounded-lg border border-slate-200 bg-slate-100 px-2.5 py-1 font-mono text-[11px] text-slate-700 transition-colors hover:border-sky-400 hover:text-sky-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:text-sky-300">{ejemplo}</button>)}
          </div>}
        </div>

        {error && <div role="alert" className="mb-6 rounded-2xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200">{error}</div>}

        {resultado && <div aria-live="polite" className="rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl motion-safe:animate-[landing-arrive_.35s_ease-out_both] dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          <div className="mb-6 flex flex-col gap-4 border-b border-slate-200 pb-6 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0"><span className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Guía de envío</span><h2 className="break-all font-mono text-xl font-black text-slate-900 dark:text-white sm:text-2xl">{resultado.guia}</h2></div>
            <span className={`inline-flex w-fit items-center gap-2 rounded-full border px-3.5 py-1 text-xs font-bold uppercase tracking-wider ${tonoEstado}`}><span className="h-2 w-2 rounded-full bg-current" />{resultado.estado}</span>
          </div>
          <div className="mb-8 grid grid-cols-1 gap-4 rounded-2xl border border-slate-200/80 bg-slate-50 p-4 dark:border-slate-800/80 dark:bg-slate-950/60 sm:grid-cols-2">
            <div className="flex min-w-0 items-center gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400"><MapPin className="h-4 w-4" /></span><div className="min-w-0"><span className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Origen</span><span className="break-words text-xs font-bold">{resultado.origen || 'No disponible'}</span></div></div>
            <div className="flex min-w-0 items-center gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"><Navigation className="h-4 w-4" /></span><div className="min-w-0"><span className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Destino</span><span className="break-words text-xs font-bold">{resultado.destino || 'No disponible'}</span></div></div>
          </div>
          <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">Evolución del envío</h3>
          {resultado.pasos.length ? <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            {resultado.pasos.map((paso, indice) => { const Icono = iconos[Math.min(indice, iconos.length - 1)]; const activo = indice === ultimoCompletado; return <div key={`${paso.titulo}-${indice}`} className={`min-w-0 rounded-2xl border p-4 ${activo ? 'border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-300' : paso.completado ? 'border-slate-200 bg-slate-50 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white' : 'border-slate-200/60 bg-slate-50/50 text-slate-500 dark:border-slate-800/60 dark:bg-slate-950/30 dark:text-slate-400'}`}>
              <div className="mb-2 flex items-start gap-2"><Icono aria-hidden="true" className="h-4 w-4 shrink-0" /><h4 className="break-words text-xs font-bold">{paso.titulo}</h4></div>
              {paso.lugar && <span className="block break-words text-[11px] text-slate-600 dark:text-slate-400">{paso.lugar}</span>}
              <span className="mt-1 block text-[10px] font-medium text-slate-500 dark:text-slate-400">{fecha(paso.fecha)}</span>
            </div>; })}
          </div> : <p className="text-sm text-slate-600 dark:text-slate-400">Aún no hay movimientos registrados para esta guía.</p>}
          <div className="mt-6 grid grid-cols-1 gap-3 border-t border-slate-200 pt-5 text-xs dark:border-slate-800 sm:grid-cols-3">
            {resultado.servicio && <div><span className="block font-bold uppercase tracking-wide text-slate-500">Servicio</span><span className="font-semibold">{resultado.servicio}</span></div>}
            {resultado.creado && <div><span className="block font-bold uppercase tracking-wide text-slate-500">Creado</span><span className="font-semibold">{fecha(resultado.creado)}</span></div>}
            {resultado.entregado && <div><span className="block font-bold uppercase tracking-wide text-slate-500">Cierre</span><span className="font-semibold">{fecha(resultado.entregado)}</span></div>}
          </div>
        </div>}
      </div>
    </div>
      <LandingFooter />
    </div>
  );
}
