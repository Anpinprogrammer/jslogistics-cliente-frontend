/**
 * Marco visual de las pantallas de acceso del portal de clientes (login, recuperar y restablecer).
 * Usa exactamente las clases del Login original: aquí solo se reutiliza el diseño, no se cambia.
 */
import type { CSSProperties, ReactNode, Ref } from 'react';
import { TIERRA } from './mapaMundo';

export const ETIQUETA = 'mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-400';
export const ENTRADA =
  'peer w-full rounded-xl border border-slate-700/80 bg-slate-950/60 py-2.5 pl-11 text-base sm:py-3 sm:text-[15px] text-slate-100 placeholder:text-slate-500 ' +
  'transition duration-200 hover:border-slate-500 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400 disabled:opacity-60';
export const ICONO = 'pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 transition-colors peer-focus:text-sky-400';
export const ENLACE = 'font-semibold text-sky-400 underline-offset-4 transition-colors hover:text-sky-300 hover:underline';

const ic = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true };

export const IcCorreo = () => <svg {...ic} className="h-5 w-5"><rect x="3" y="5" width="18" height="14" rx="2.5" /><path d="m4 7.5 8 6 8-6" /></svg>;
export const IcCandado = () => <svg {...ic} className="h-5 w-5"><rect x="4.5" y="10.5" width="15" height="10" rx="2.5" /><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5M12 14.5v2" /></svg>;
export const IcOjo = () => <svg {...ic} className="h-5 w-5"><path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></svg>;
export const IcOjoTachado = () => <svg {...ic} className="h-5 w-5"><path d="M10.6 5.6A10 10 0 0 1 12 5.5c6.4 0 10 6.5 10 6.5a17 17 0 0 1-3.2 4M6.5 7A16.6 16.6 0 0 0 2 12s3.6 6.5 10 6.5c1.6 0 3-.4 4.3-1M9.9 9.9a3 3 0 0 0 4.2 4.2M3 3l18 18" /></svg>;
export const IcCopiar = () => <svg {...ic} className="h-4 w-4"><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V6a2 2 0 0 1 2-2h8" /></svg>;
export const IcOk = () => <svg {...ic} className="h-4 w-4"><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>;
export const IcAlerta = () => <svg {...ic} className="mt-0.5 h-5 w-5 shrink-0"><path d="M12 8v5M12 16.5v.1" /><path d="M10.3 3.9 2.4 17.5A2 2 0 0 0 4.1 20.5h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" /></svg>;
export const IcCheck = () => <svg {...ic} className="h-7 w-7"><circle cx="12" cy="12" r="9" /><path d="m8 12.5 2.8 2.8L16.5 9.5" /></svg>;
export const IcVolver = () => <svg {...ic} className="h-5 w-5"><path d="M19 12H5M11 18l-6-6 6-6" /></svg>;

/* Mapa del fondo: el contorno real está en mapaMundo.ts (lienzo 1000×500). Aquí se ubican las ciudades por longitud y latitud. */
const punto = (lon: number, lat: number): [number, number] => [
  Math.round(((lon + 180) / 360) * 10000) / 10,
  Math.round(((90 - lat) / 180) * 5000) / 10,
];
/** Sede principal: Cali, Colombia (3,4516° N, 76,5320° O). */
const CALI = punto(-76.532, 3.4516);
const CIUDADES = {
  mexico: punto(-99.13, 19.43), miami: punto(-80.19, 25.76), nuevaYork: punto(-74.0, 40.71), saoPaulo: punto(-46.63, -23.55),
  madrid: punto(-3.7, 40.42), dubai: punto(55.27, 25.2), shanghai: punto(121.47, 31.23), sidney: punto(151.21, -33.87),
};
/** Arco entre dos puntos, curvado hacia arriba en proporción a la distancia. */
const arco = ([x1, y1]: [number, number], [x2, y2]: [number, number]) => {
  const curva = Math.hypot(x2 - x1, y2 - y1) * 0.22;
  return `M${x1} ${y1}Q${(x1 + x2) / 2} ${(y1 + y2) / 2 - curva} ${x2} ${y2}`;
};
const RUTAS = [
  arco(CIUDADES.mexico, CALI), arco(CALI, CIUDADES.miami), arco(CALI, CIUDADES.nuevaYork), arco(CALI, CIUDADES.saoPaulo), arco(CALI, CIUDADES.madrid),
  arco(CIUDADES.madrid, CIUDADES.dubai), arco(CIUDADES.dubai, CIUDADES.shanghai), arco(CIUDADES.shanghai, CIUDADES.sidney),
];
/* El lienzo visible va de y = −35 a 465 (sin la Antártida, el mundo queda centrado). La sede, en porcentaje de ese lienzo: */
const VISTA_Y = -35;
const SEDE = { left: `${CALI[0] / 10}%`, top: `${(CALI[1] - VISTA_Y) / 5}%` };

/**
 * Mapa del mundo con el pin de la sede. Va anclado a la columna del formulario, no a la pantalla:
 * en celular el mundo queda detrás de la cabecera, con Cali a la izquierda del logo (la tarjeta tapa el resto de la pantalla);
 * desde `md` ocupa toda la pantalla, con Cali a la izquierda de la tarjeta.
 */
function MapaSede({ sedeRef }: { sedeRef?: Ref<HTMLDivElement> }) {
  return (
    <div aria-hidden="true"
      className="pointer-events-none absolute -z-10 aspect-[2/1] w-[120vw] max-w-none left-[calc(50%-62.49vw)] top-[calc(44px-33.05vw)] sm:top-[calc(60px-33.05vw)] md:left-1/2 md:top-1/2 md:w-[max(1500px,100vw)] md:-translate-x-1/2 md:-translate-y-1/2">
      <svg className="absolute inset-0 h-full w-full opacity-60" viewBox={`0 ${VISTA_Y} 1000 500`} fill="none">
        <defs>
          <pattern id="loginPuntos" width="6" height="6" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r="1" fill="#38bdf8" fillOpacity=".55" /></pattern>
          <linearGradient id="loginRuta" x1="0" x2="1">
            <stop offset="0" stopColor="#0284c7" stopOpacity=".15" /><stop offset=".5" stopColor="#7dd3fc" /><stop offset="1" stopColor="#0284c7" stopOpacity=".15" />
          </linearGradient>
          <radialGradient id="loginVineta" cx=".5" cy=".5" r=".72"><stop offset=".55" stopColor="#070B19" stopOpacity="0" /><stop offset="1" stopColor="#070B19" stopOpacity=".95" /></radialGradient>
        </defs>
        <path d={TIERRA} fill="#38bdf8" fillOpacity=".1" />
        <path d={TIERRA} fill="url(#loginPuntos)" stroke="#7dd3fc" strokeOpacity=".55" strokeWidth=".7" strokeLinejoin="round" />
        <g stroke="url(#loginRuta)" strokeWidth="1" strokeDasharray="3 6" strokeLinecap="round">
          {RUTAS.map((d, i) => <path key={i} className="login-ruta" d={d} />)}
        </g>
        {Object.values(CIUDADES).map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r="2.2" fill="#7dd3fc" />
            <circle className="login-pulso" cx={x} cy={y} r="2.2" stroke="#7dd3fc" strokeWidth=".8" style={{ animationDelay: `${i * 0.6}s` }} />
          </g>
        ))}
        <rect y={VISTA_Y} width="1000" height="500" fill="url(#loginVineta)" />
      </svg>

      {/* Pin de la sede: la punta queda justo sobre Cali */}
      <div ref={sedeRef} className="absolute h-0 w-0" style={SEDE}>
        <span className="login-sede absolute -left-2 -top-2 h-4 w-4 rounded-full border border-[#38bdf8]" />
        <span className="absolute -left-[3px] -top-[3px] h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_8px_2px_rgba(56,189,248,.9)]" />
        <svg viewBox="0 0 28 36" className="absolute -left-3.5 -top-9 h-9 w-7 max-w-none drop-shadow-[0_0_10px_rgba(56,189,248,.85)] md:-left-[18px] md:-top-[46px] md:h-[46px] md:w-9">
          <defs><linearGradient id="loginPin" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7dd3fc" /><stop offset="1" stopColor="#0284c7" /></linearGradient></defs>
          <path d="M14 35C14 35 3 21.5 3 13a11 11 0 0 1 22 0c0 8.5-11 22-11 22z" fill="url(#loginPin)" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
          <circle cx="14" cy="13" r="4.2" fill="#fff" />
        </svg>
        <p className="absolute left-0 top-2.5 -translate-x-1/2 whitespace-nowrap text-center text-[10px] font-semibold leading-tight text-white [text-shadow:0_1px_6px_#070B19,0_0_2px_#070B19] md:top-3.5 md:text-xs">
          <span className="block text-[9px] font-medium uppercase tracking-wider text-[#7dd3fc] md:text-[10px]">Sede principal</span>
          Cali, Colombia
        </p>
      </div>
    </div>
  );
}

/**
 * Lo que la animación de entrada del login le pone al marco en el cuadro actual (ver `components/intro/`).
 * Solo lo pasa el login; sin esta prop el marco queda exactamente igual. El fondo (malla, luces y mapa) nunca se toca.
 */
export type IntroMarco = {
  raiz: Ref<HTMLDivElement>;
  /** Punto exacto del pin de Cali, para que el primer mensajero salga de ahí. */
  sede: Ref<HTMLDivElement>;
  /** Capas decorativas detrás y delante del contenido (sin clics y ocultas a los lectores de pantalla). */
  detras: ReactNode;
  frente: ReactNode;
  contenido: { ref: Ref<HTMLDivElement>; style?: CSSProperties };
  insignia: Ref<HTMLDivElement>;
  halo: CSSProperties;
  placa: { ref: Ref<HTMLSpanElement>; style?: CSSProperties };
  icono: CSSProperties;
  titulo: { ref: Ref<HTMLHeadingElement>; style?: CSSProperties };
  letras: ReactNode;
  subtitulo: CSSProperties;
  tarjeta: { ref: Ref<HTMLDivElement>; style?: CSSProperties };
  borde: CSSProperties;
  haloTarjeta: CSSProperties;
  /** El vidrio que se revela mientras el cuerpo real de la tarjeta queda transparente. */
  vidrio: ReactNode;
  cuerpo: CSSProperties;
  pie: CSSProperties;
};

/** Fondo del login, cabecera con el logo, tarjeta de cristal y un pie opcional. */
export function MarcoAcceso({
  children,
  pie,
  titulo = 'Portal Empresarial',
  subtitulo = 'JS Logistics – Acceso de clientes',
  intro,
  sinEntrada = false,
}: {
  children: ReactNode;
  pie?: ReactNode;
  titulo?: string;
  subtitulo?: string;
  /** Animación de entrada del login, cuadro a cuadro. */
  intro?: IntroMarco;
  /** Quita la entrada suave de siempre (`animate-fade-up`): el login la cambia por su animación. */
  sinEntrada?: boolean;
}) {
  return (
    <div ref={intro?.raiz} className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-[#070B19] px-4 pb-10 pt-24 sm:pb-16 sm:pt-28">
      {/* Fondo: malla y luces ambientales (el mapa va en MapaSede, anclado a la columna) */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 opacity-[0.05]"
          style={{ backgroundImage: 'linear-gradient(rgba(148,176,207,1) 1px, transparent 1px), linear-gradient(90deg, rgba(148,176,207,1) 1px, transparent 1px)', backgroundSize: '56px 56px' }} />
        <div className="absolute -left-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-[#0284c7]/30 blur-[120px]" />
        <div className="absolute -bottom-40 -right-28 h-[32rem] w-[32rem] rounded-full bg-[#38bdf8]/20 blur-[130px]" />
      </div>
      {intro && <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">{intro.detras}</div>}

      <div className="relative w-full max-w-sm sm:max-w-md">
        <MapaSede sedeRef={intro?.sede} />
        {/* Con la animación del login no va `animate-fade-up`, pero se deja `will-change: opacity`: la animación de siempre
            deja este bloque como "raíz" del desenfoque de la tarjeta (el mapa se ve a través del vidrio), y sin eso
            el vidrio se vería más opaco que hoy. */}
        <div ref={intro?.contenido.ref} className={sinEntrada ? '[will-change:opacity]' : 'animate-fade-up'} style={intro?.contenido.style}>
        {/* Cabecera */}
        <div className="mb-5 text-center sm:mb-8">
          <div ref={intro?.insignia} className="relative mx-auto mb-3 grid h-16 w-16 place-items-center sm:mb-5 sm:h-24 sm:w-24">
            <span aria-hidden="true" className="absolute -inset-3 rounded-[2rem] bg-[#38bdf8]/50 blur-2xl" style={intro?.halo} />
            <span ref={intro?.placa.ref} style={intro?.placa.style} className="relative grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-white to-sky-100 p-1.5 sm:h-24 sm:w-24 sm:rounded-3xl sm:p-2.5 shadow-[0_0_0_1px_rgba(255,255,255,.7),0_0_28px_6px_rgba(56,189,248,.45),0_12px_28px_-6px_rgba(2,132,199,.55),inset_0_1px_0_#fff]">
              {/* El .webp trae "LOGISTICS CALI" en blanco (invisible sobre el badge claro): se recorta para mostrar solo el isotipo. */}
              <span className="relative block h-full w-full overflow-hidden rounded-2xl" style={intro?.icono}>
                <img src="/img/icono-96.webp" alt="JS Logistics" width={96} height={96} className="absolute left-[-10%] top-[3%] w-[120%] max-w-none" />
              </span>
            </span>
          </div>
          <h1 ref={intro?.titulo.ref} style={intro?.titulo.style} className="font-display text-2xl font-700 text-white sm:text-3xl">{titulo}{intro?.letras}</h1>
          <p className="mt-1 text-sm text-[#94a3b8]" style={intro?.subtitulo}>{subtitulo}</p>
        </div>

        {/* Tarjeta de cristal con borde brillante */}
        <div ref={intro?.tarjeta.ref} style={intro?.tarjeta.style} className="relative">
          <div aria-hidden="true" className="absolute -inset-px rounded-[1.4rem] bg-gradient-to-br from-sky-400/70 via-blue-600/30 to-cyan-300/50 opacity-70" style={intro?.borde} />
          <div aria-hidden="true" className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-blue-600/20 blur-3xl" style={intro?.haloTarjeta} />
          {intro?.vidrio}
          <div className="relative rounded-3xl bg-slate-900/60 p-5 shadow-[0_24px_80px_-20px_rgba(2,132,199,0.45),0_10px_30px_rgba(0,0,0,0.5)] backdrop-blur-xl sm:p-8" style={intro?.cuerpo}>
            {children}
          </div>
        </div>

        {pie && <div style={intro?.pie}>{pie}</div>}
        </div>
      </div>
      {intro && <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">{intro.frente}</div>}
    </div>
  );
}

/** Botón principal con el mismo degradado del login. */
export function BotonAcceso({ cargando, children, cargandoTexto, intro }: {
  cargando: boolean; children: ReactNode; cargandoTexto: string;
  /** Durante la animación del login el botón sigue ahí (teclado y lectores de pantalla), solo tapado a la vista. */
  intro?: { ref: Ref<HTMLButtonElement>; style?: CSSProperties };
}) {
  return (
    <button ref={intro?.ref} style={intro?.style} type="submit" disabled={cargando}
      className="group relative mt-2 flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-[#0284c7] to-[#38bdf8] px-5 py-3 font-bold sm:py-3.5 text-white shadow-[0_8px_24px_-8px_rgba(56,189,248,0.6)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_34px_-8px_rgba(56,189,248,0.85)] active:translate-y-0 disabled:cursor-wait disabled:opacity-90 disabled:hover:translate-y-0">
      <span aria-hidden="true" className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
      {cargando ? (
        <>
          <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity=".3" strokeWidth="3" />
            <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
          <span className="relative">{cargandoTexto}</span>
        </>
      ) : (
        <span className="relative">
          {children} <span aria-hidden="true" className="inline-block transition-transform duration-200 group-hover:translate-x-1">→</span>
        </span>
      )}
    </button>
  );
}

/** Aviso de error con el mismo formato del login. */
export function AvisoError({ children }: { children: ReactNode }) {
  return (
    <div role="alert" className="mb-4 flex gap-2.5 rounded-xl border border-red-400/30 bg-red-500/10 px-3.5 py-3 text-sm text-red-200">
      <IcAlerta /><span>{children}</span>
    </div>
  );
}
