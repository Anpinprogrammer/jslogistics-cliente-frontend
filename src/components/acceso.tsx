/**
 * Marco visual de las pantallas de acceso del portal de clientes (login, recuperar y restablecer).
 * Usa exactamente las clases del Login original: aquí solo se reutiliza el diseño, no se cambia.
 */
import type { ReactNode } from 'react';

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

/* Continentes estilizados (equirrectangular, lienzo 1000×500) y nodos de la red logística. */
const CONTINENTES = [
  'M33 67 108 56 194 50 272 56 328 89 347 111 314 128 289 150 275 181 231 178 208 194 244 208 269 225 280 228 258 214 208 194 189 169 175 161 156 139 156 117 125 89 83 83 42 83Z',
  'M297 33 389 19 444 28 410 67 375 83 340 75Z',
  'M278 228 328 219 361 250 403 267 392 306 367 325 339 356 317 403 294 389 300 333 306 300 275 264Z',
  'M475 144 489 117 514 106 528 89 556 56 611 61 694 47 806 36 917 53 1000 61 972 83 944 106 894 122 861 133 839 167 833 189 800 217 789 244 772 228 756 189 722 214 703 194 683 181 658 181 639 167 600 150 572 144 528 128 495 147Z',
  'M453 192 483 150 528 147 589 164 619 217 642 219 611 258 611 292 589 328 556 347 533 300 525 239 478 239 453 211Z',
  'M817 311 861 283 894 281 925 322 906 358 822 347Z',
];
const NODOS: [number, number][] = [[303, 150], [385, 270], [500, 125], [585, 175], [715, 200], [855, 150], [880, 330]];

/** Fondo del login, cabecera con el logo, tarjeta de cristal y un pie opcional. */
export function MarcoAcceso({
  children,
  pie,
  titulo = 'Portal Empresarial',
  subtitulo = 'JS Logistics – Acceso de clientes',
}: {
  children: ReactNode;
  pie?: ReactNode;
  titulo?: string;
  subtitulo?: string;
}) {
  return (
    <div className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-[#070B19] px-4 pb-10 pt-24 sm:pb-16 sm:pt-28">
      {/* Fondo: mapa de conexiones, malla y luces ambientales */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <svg className="absolute inset-0 h-full w-full opacity-40" preserveAspectRatio="xMidYMid slice" viewBox="0 0 1000 500" fill="none">
          <defs>
            <pattern id="loginPuntos" width="7" height="7" patternUnits="userSpaceOnUse"><circle cx="3.5" cy="3.5" r="1.1" fill="#38bdf8" fillOpacity=".5" /></pattern>
            <linearGradient id="loginRuta" x1="0" x2="1">
              <stop offset="0" stopColor="#0284c7" stopOpacity="0" /><stop offset=".5" stopColor="#38bdf8" /><stop offset="1" stopColor="#0284c7" stopOpacity="0" />
            </linearGradient>
            <radialGradient id="loginVineta" cx=".5" cy=".5" r=".75"><stop offset=".3" stopColor="#070B19" stopOpacity="0" /><stop offset="1" stopColor="#070B19" stopOpacity=".9" /></radialGradient>
          </defs>
          {CONTINENTES.map((d, i) => <path key={i} d={d} fill="url(#loginPuntos)" stroke="#38bdf8" strokeOpacity=".25" strokeWidth=".8" strokeLinejoin="round" />)}
          <g stroke="url(#loginRuta)" strokeWidth=".9" strokeDasharray="3 6">
            <path className="login-ruta" d="M303 150 Q 400 60 500 125" />
            <path className="login-ruta" d="M500 125 Q 560 100 585 175" />
            <path className="login-ruta" d="M585 175 Q 650 120 715 200" />
            <path className="login-ruta" d="M715 200 Q 790 110 855 150" />
            <path className="login-ruta" d="M855 150 Q 900 230 880 330" />
            <path className="login-ruta" d="M303 150 Q 300 230 385 270" />
            <path className="login-ruta" d="M385 270 Q 440 200 500 125" />
            <path className="login-ruta" d="M585 175 Q 700 330 880 330" />
          </g>
          {NODOS.map(([x, y], i) => (
            <g key={i}>
              <circle cx={x} cy={y} r="2.4" fill="#38bdf8" />
              <circle className="login-pulso" cx={x} cy={y} r="2.4" stroke="#38bdf8" strokeWidth=".8" style={{ animationDelay: `${i * 0.6}s` }} />
            </g>
          ))}
          <rect width="1000" height="500" fill="url(#loginVineta)" />
        </svg>
        <div className="absolute inset-0 opacity-[0.05]"
          style={{ backgroundImage: 'linear-gradient(rgba(148,176,207,1) 1px, transparent 1px), linear-gradient(90deg, rgba(148,176,207,1) 1px, transparent 1px)', backgroundSize: '56px 56px' }} />
        <div className="absolute -left-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-[#0284c7]/30 blur-[120px]" />
        <div className="absolute -bottom-40 -right-28 h-[32rem] w-[32rem] rounded-full bg-[#38bdf8]/20 blur-[130px]" />
      </div>

      <div className="relative w-full max-w-sm animate-fade-up sm:max-w-md">
        {/* Cabecera */}
        <div className="mb-5 text-center sm:mb-8">
          <div className="relative mx-auto mb-3 grid h-16 w-16 place-items-center sm:mb-5 sm:h-24 sm:w-24">
            <span aria-hidden="true" className="absolute -inset-3 rounded-[2rem] bg-[#38bdf8]/50 blur-2xl" />
            <span className="relative grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-white to-sky-100 p-1.5 sm:h-24 sm:w-24 sm:rounded-3xl sm:p-2.5 shadow-[0_0_0_1px_rgba(255,255,255,.7),0_0_28px_6px_rgba(56,189,248,.45),0_12px_28px_-6px_rgba(2,132,199,.55),inset_0_1px_0_#fff]">
              {/* El .webp trae "LOGISTICS CALI" en blanco (invisible sobre el badge claro): se recorta para mostrar solo el isotipo. */}
              <span className="relative block h-full w-full overflow-hidden rounded-2xl">
                <img src="/img/icono-96.webp" alt="JS Logistics" width={96} height={96} className="absolute left-[-10%] top-[3%] w-[120%] max-w-none" />
              </span>
            </span>
          </div>
          <h1 className="font-display text-2xl font-700 text-white sm:text-3xl">{titulo}</h1>
          <p className="mt-1 text-sm text-[#94a3b8]">{subtitulo}</p>
        </div>

        {/* Tarjeta de cristal con borde brillante */}
        <div className="relative">
          <div aria-hidden="true" className="absolute -inset-px rounded-[1.4rem] bg-gradient-to-br from-sky-400/70 via-blue-600/30 to-cyan-300/50 opacity-70" />
          <div aria-hidden="true" className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-blue-600/20 blur-3xl" />
          <div className="relative rounded-3xl bg-slate-900/60 p-5 shadow-[0_24px_80px_-20px_rgba(2,132,199,0.45),0_10px_30px_rgba(0,0,0,0.5)] backdrop-blur-xl sm:p-8">
            {children}
          </div>
        </div>

        {pie}
      </div>
    </div>
  );
}

/** Botón principal con el mismo degradado del login. */
export function BotonAcceso({ cargando, children, cargandoTexto }: { cargando: boolean; children: ReactNode; cargandoTexto: string }) {
  return (
    <button type="submit" disabled={cargando}
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
