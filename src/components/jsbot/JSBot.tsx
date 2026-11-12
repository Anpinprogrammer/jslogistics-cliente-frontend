import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { JSBOT_ABRIR } from "./evento";

export { JSBOT_ABRIR };

const FOTO = "/img/jsbot/jsbot_4.webp";
// El panel (la conversación, sus íconos y la llamada a la API) se descarga solo cuando alguien va a usar JSBot:
// la portada solo carga la burbuja.
const cargarPanel = () => import("./JSBotPanel");
const JSBotPanel = lazy(cargarPanel);
const precargar = () => { cargarPanel().catch(() => { /* se reintenta al abrirlo */ }); };

/**
 * JSBot: la burbuja flotante (landing, login y rastreo) y el panel, que se monta la primera vez que se abre y luego
 * se queda montado para no perder la conversación. En el portal no hay burbuja: se abre con el botón de la barra.
 */
export default function JSBot({ enPortalCliente = false }: { enPortalCliente?: boolean }) {
  const [abierto, setAbierto] = useState(false);
  const [montado, setMontado] = useState(false);
  const burbuja = useRef<HTMLButtonElement>(null);
  const origenApertura = useRef<HTMLElement | null>(null);

  useEffect(() => { if (abierto) setMontado(true); }, [abierto]);
  useEffect(() => {
    const abrirDesdeHeader = () => {
      origenApertura.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      setAbierto(true);
    };
    window.addEventListener(JSBOT_ABRIR, abrirDesdeHeader);
    return () => window.removeEventListener(JSBOT_ABRIR, abrirDesdeHeader);
  }, []);

  return <>
    {!enPortalCliente && createPortal(
      <div
        className={`group fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom))] right-5 z-50 flex items-center gap-3 sm:right-6 ${abierto ? "invisible pointer-events-none" : "visible"}`}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none hidden translate-x-2 items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/90 px-3.5 py-2 text-xs font-semibold text-slate-200 opacity-0 shadow-xl backdrop-blur-md transition-[opacity,transform] duration-200 group-hover:translate-x-0 group-hover:opacity-100 group-focus-within:translate-x-0 group-focus-within:opacity-100 motion-reduce:transform-none motion-reduce:transition-none sm:flex"
        >
          <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-400 motion-safe:animate-pulse" />
          <span>¿En qué podemos ayudarte?</span>
        </div>
        <div className="relative shrink-0">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-full bg-sky-500/20 blur-md motion-safe:animate-pulse"
          />
          <button
            ref={burbuja}
            type="button"
            onClick={() => { origenApertura.current = burbuja.current; setAbierto((actual) => !actual); }}
            onPointerEnter={precargar}
            onFocus={precargar}
            aria-label="Abrir JSBot"
            aria-expanded={abierto}
            aria-controls="jsbot-panel"
            className="group/btn relative flex h-20 w-20 cursor-pointer items-center justify-center rounded-full bg-gradient-to-tr from-sky-500 via-cyan-400 to-indigo-500 p-[2px] shadow-xl shadow-sky-500/25 transition-[transform,box-shadow] duration-300 hover:scale-105 hover:shadow-sky-500/40 active:scale-95 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-sky-400 motion-reduce:transform-none motion-reduce:transition-none"
          >
            <span className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-slate-950 p-0.5">
              <img
                src={FOTO}
                alt=""
                className="h-full w-full rounded-full object-cover mix-blend-normal transition-transform duration-300 group-hover/btn:scale-110 motion-reduce:transform-none motion-reduce:transition-none"
              />
            </span>
            <span
              aria-hidden="true"
              className="absolute right-0 top-0 h-3.5 w-3.5 rounded-full border-2 border-slate-950 bg-emerald-400 shadow-md"
            />
          </button>
        </div>
      </div>
      , document.body)}
    {(montado || abierto) && <Suspense fallback={null}>
      <JSBotPanel pedido={abierto} setAbierto={setAbierto} burbuja={burbuja} origenApertura={origenApertura} />
    </Suspense>}
  </>;
}
