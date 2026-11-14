import { useEffect, useLayoutEffect, useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, ClipboardList, FileText, LogIn, PackageCheck, Search, Truck, type LucideIcon } from 'lucide-react';
import { DEMO } from '../api/http';
import { rastrearGuia } from '../api/rastreo';
import type { Pedido, PasoRastreo, Rastreo } from '../types/dominio';
import { hora } from '../lib/formato';
import Navbar from '../components/layout/Navbar';
import LandingFooter from '../components/layout/LandingFooter';
import { WhatsAppIcon } from '../components/icons/WhatsAppIcon';
import { clientToast } from '../utils/clientToast';

// Los datos de prueba solo se descargan en el modo demo.
const pedidosDemo = () => import('../demo/datos').then(m => m.demo.pedidos());

const iconos: Record<PasoRastreo['clave'], LucideIcon> = {
  solicitado: ClipboardList, guia_generada: FileText, recogido: PackageCheck, en_ruta: Truck, entregado: CheckCircle2, devuelto: AlertTriangle,
};
const fecha = (valor?: string | null) => valor ? hora(valor) : 'Pendiente';

/** Frase corta que explica en qué va el envío, para quien solo quiere saber "¿dónde está mi pedido?". */
const resumen: Record<Rastreo['estado'], string> = {
  guia_generada: 'Ya tiene guía y un mensajero lo recogerá pronto.',
  en_ruta: 'Un mensajero ya lo recogió y va camino a su destino.',
  entregado: 'El envío llegó a su destino.',
  devuelto: 'Hubo una novedad con tu envío.',
};

/** Estado actual en grande y, debajo, los pasos: vertical en el celular y en fila en pantallas anchas. */
function Pasos({ pasos }: { pasos: PasoRastreo[] }) {
  const ultimo = pasos.findLastIndex(p => p.completado);
  return (
    <ol className="flex flex-col md:flex-row" aria-label="Pasos del envío">
      {pasos.map((paso, i) => {
        const Icono = iconos[paso.clave];
        const actual = i === ultimo;
        const novedad = paso.clave === 'devuelto';
        const unido = paso.completado && pasos[i + 1]?.completado;
        const circulo = novedad ? 'border-rose-500 bg-rose-500 text-white'
          : actual ? 'border-sky-500 bg-sky-500 text-white ring-4 ring-sky-500/20'
          : paso.completado ? 'border-emerald-500 bg-emerald-500 text-white'
          : 'border-slate-300 bg-white text-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-500';
        return (
          <li key={paso.clave} aria-current={actual ? 'step' : undefined} className="relative flex min-w-0 gap-4 pb-7 last:pb-0 md:flex-1 md:flex-col md:items-center md:gap-3 md:pb-0 md:text-center">
            {i < pasos.length - 1 && <span aria-hidden="true" className={`absolute left-4 top-9 h-[calc(100%-1.5rem)] w-0.5 -translate-x-1/2 md:left-1/2 md:top-4 md:h-0.5 md:w-full md:translate-x-0 md:-translate-y-1/2 ${unido ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`} />}
            <span className={`relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 ${circulo}`}><Icono aria-hidden="true" className="h-4 w-4" /></span>
            <div className="min-w-0 pt-1 md:px-2 md:pt-0">
              <h4 className={`break-words text-sm font-bold ${novedad ? 'text-rose-700 dark:text-rose-300' : paso.completado ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>{paso.titulo}</h4>
              <span className="mt-0.5 block text-xs font-medium text-slate-600 dark:text-slate-400">{paso.completado ? fecha(paso.fecha) : 'Pendiente'}</span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export default function Track() {
  const [params] = useSearchParams();
  useLayoutEffect(() => { window.scrollTo(0, 0); }, []);
  const [guia, setGuia] = useState(params.get('n') || '');
  const [resultado, setResultado] = useState<Rastreo | null>(null);
  const [ejemplos, setEjemplos] = useState<string[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!DEMO) return;
    let activo = true;
    pedidosDemo().then(pedidos => {
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
      setResultado(await rastrearGuia(limpia));
    } catch (fallo) {
      clientToast.error(fallo instanceof Error ? fallo.message : 'No pudimos consultar esta guía. Intenta de nuevo.');
    } finally { setCargando(false); }
  }

  const enviar = (evento: FormEvent<HTMLFormElement>) => { evento.preventDefault(); void buscar(guia); };
  const actual = resultado?.pasos.findLast(paso => paso.completado);
  const tonoEstado = resultado?.estado === 'entregado'
    ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
    : resultado?.estado === 'devuelto'
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
            <span className={`inline-flex w-fit items-center gap-2 rounded-full border px-3.5 py-1 text-xs font-bold uppercase tracking-wider ${tonoEstado}`}><span className="h-2 w-2 rounded-full bg-current" />{resultado.estadoTexto}</span>
          </div>
          <p className="mb-8 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            <strong className="font-bold text-slate-900 dark:text-white">{resumen[resultado.estado]}</strong>
            {actual?.fecha && <span className="block text-xs text-slate-600 dark:text-slate-400">Desde el {fecha(actual.fecha)}</span>}
          </p>
          <h3 className="mb-5 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">Evolución del envío</h3>
          <Pasos pasos={resultado.pasos} />
          {resultado.novedad && <div role="note" className="mt-8 rounded-2xl border border-rose-300 bg-rose-50 p-4 text-sm text-rose-900 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-100">
            <p className="font-bold">Hay una novedad con tu envío</p>
            <p className="mt-1 leading-relaxed">Para ver el detalle inicia sesión en tu portal, o escríbenos por WhatsApp y te contamos qué pasó.</p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <Link to="/login" className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-sky-400 px-4 text-sm font-extrabold text-slate-950 transition-colors hover:bg-sky-300"><LogIn aria-hidden="true" className="h-4 w-4" />Iniciar sesión en mi portal</Link>
              {resultado.whatsapp && <a href={resultado.whatsapp} target="_blank" rel="noopener noreferrer" className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 text-sm font-bold text-emerald-800 transition-colors hover:bg-emerald-500/20 dark:text-emerald-300"><WhatsAppIcon className="h-4 w-4 shrink-0" />Escribir por WhatsApp</a>}
            </div>
          </div>}
        </div>}
      </div>
    </div>
      <LandingFooter />
    </div>
  );
}
