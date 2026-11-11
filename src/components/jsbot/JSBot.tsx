import { useEffect, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { ArrowUpRight, MessageCircle, Send, ShieldCheck, Sparkles, X } from "lucide-react";
import { useSesion } from "../../auth/AuthProvider";
import { ApiError, DEMO } from "../../api/http";
import { derivacionDeError, enlaceWhatsApp, enviarChat, type DerivacionChat, type MensajeChat } from "../../api/chatbot";

interface Mensaje {
  id: number;
  autor: "bot" | "usuario";
  texto: string;
}
const SALUDO: Mensaje = {
  id: 0,
  autor: "bot",
  texto: "¡Hola! Soy JSBot, tu asistente de JS Logistics. ¿En qué puedo ayudarte hoy?",
};
const FOTO = "/img/jsbot/jsbot_4.webp";
export const JSBOT_ABRIR = "jsbot:abrir";

export default function JSBot({ enPortalCliente = false }: { enPortalCliente?: boolean }) {
  const { usuario, cargando: cargandoSesion } = useSesion();
  const esCliente = usuario?.rol === "cliente";
  const puedeConversar = !cargandoSesion;
  const [abierto, setAbierto] = useState(false);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [derivacion, setDerivacion] = useState<DerivacionChat | null>(null);
  const [mensajes, setMensajes] = useState<Mensaje[]>([SALUDO]);
  const burbuja = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLElement>(null);
  const cerrar = useRef<HTMLButtonElement>(null);
  const historial = useRef<HTMLDivElement>(null);
  const entrada = useRef<HTMLInputElement>(null);
  const origenApertura = useRef<HTMLElement | null>(null);
  const controlador = useRef<AbortController | null>(null);
  const siguienteId = useRef(1);
  const usuarioAnterior = useRef(usuario?.id ?? null);

  useEffect(() => () => controlador.current?.abort(), []);
  useEffect(() => {
    const id = usuario?.id ?? null;
    if (usuarioAnterior.current === id) return;
    usuarioAnterior.current = id;
    controlador.current?.abort();
    controlador.current = null;
    siguienteId.current = 1;
    setMensajes([SALUDO]);
    setTexto("");
    setError("");
    setDerivacion(null);
    setEnviando(false);
  }, [usuario?.id]);

  useEffect(() => {
    const abrirDesdeHeader = () => {
      origenApertura.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      setAbierto(true);
    };
    window.addEventListener(JSBOT_ABRIR, abrirDesdeHeader);
    return () => window.removeEventListener(JSBOT_ABRIR, abrirDesdeHeader);
  }, []);

  useEffect(() => {
    if (panel.current) panel.current.inert = !abierto;
    if (!abierto) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    cerrar.current?.focus();
    const alTeclado = (event: KeyboardEvent) => {
      if (event.key === "Escape") setAbierto(false);
      if (event.key !== "Tab") return;
      const items = panel.current?.querySelectorAll<HTMLElement>(
        "button:not(:disabled), input, a[href]",
      );
      if (!items?.length) return;
      const primero = items[0],
        ultimo = items[items.length - 1];
      if (event.shiftKey && document.activeElement === primero) {
        event.preventDefault();
        ultimo.focus();
      } else if (!event.shiftKey && document.activeElement === ultimo) {
        event.preventDefault();
        primero.focus();
      }
    };
    document.addEventListener("keydown", alTeclado);
    return () => {
      controlador.current?.abort();
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", alTeclado);
      requestAnimationFrame(() => {
        const origen = origenApertura.current;
        (origen?.isConnected ? origen : burbuja.current)?.focus();
        origenApertura.current = null;
      });
    };
  }, [abierto]);

  useEffect(() => {
    const el = historial.current;
    if (el) el.scrollTop = mensajes.length === 1 ? 0 : el.scrollHeight;
  }, [mensajes, abierto]);

  const enviar = async (mensaje: string) => {
    const limpio = mensaje.trim();
    if (!limpio || !puedeConversar || controlador.current) return;
    const historial: MensajeChat[] = mensajes.slice(1).slice(-18).map(m => ({
      rol: m.autor === "usuario" ? "user" : "assistant",
      contenido: m.texto,
    }));
    while (historial[0]?.rol === "assistant") historial.shift();
    const idUsuario = siguienteId.current++;
    const abortar = new AbortController();
    controlador.current = abortar;
    setMensajes(actuales => [...actuales, { id: idUsuario, autor: "usuario", texto: limpio }]);
    setTexto("");
    setError("");
    setDerivacion(null);
    setEnviando(true);
    try {
      const respuesta = await enviarChat([...historial, { rol: "user", contenido: limpio }], esCliente, abortar.signal);
      if (abortar.signal.aborted) return;
      setMensajes(actuales => [...actuales, { id: siguienteId.current++, autor: "bot", texto: respuesta.respuesta }]);
      setDerivacion(respuesta.derivar);
    } catch (fallo) {
      if (controlador.current !== abortar) return;
      setMensajes(actuales => actuales.filter(m => m.id !== idUsuario));
      setTexto(limpio);
      if (!abortar.signal.aborted) {
        setDerivacion(derivacionDeError(fallo));
        setError(fallo instanceof ApiError && fallo.status === 429
          ? fallo.message
          : esCliente && fallo instanceof ApiError && (fallo.status === 401 || fallo.status === 403)
            ? "Tu sesión de cliente terminó. Inicia sesión de nuevo para consultar tus pedidos."
            : fallo instanceof Error ? fallo.message : "No pudimos enviar el mensaje. Intenta de nuevo.");
      }
    } finally {
      if (controlador.current === abortar) {
        controlador.current = null;
        setEnviando(false);
        if (panel.current && !panel.current.inert) entrada.current?.focus();
      }
    }
  };
  const alEnviar = (event: FormEvent) => {
    event.preventDefault();
    void enviar(texto);
  };
  const whatsappUrl = enlaceWhatsApp(derivacion);

  return createPortal(
    <>
      {!enPortalCliente && <div
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
      </div>}
      <div
        className={`fixed inset-0 z-[70] overflow-hidden transition-[visibility] duration-300 motion-reduce:transition-none ${abierto ? "visible" : "invisible pointer-events-none"}`}
      >
        <div
          aria-hidden="true"
          onClick={() => setAbierto(false)}
          className={`absolute inset-0 bg-slate-950/40 backdrop-blur-sm transition-opacity duration-300 motion-reduce:transition-none ${abierto ? "opacity-100" : "opacity-0"}`}
        />
        <aside
          ref={panel}
          id="jsbot-panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby="jsbot-title"
          aria-hidden={!abierto}
          className={`absolute inset-y-0 right-0 flex h-dvh w-full flex-col border-l border-slate-200 bg-slate-50 text-slate-900 shadow-2xl transition-transform duration-300 ease-out motion-reduce:transition-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 sm:w-[420px] lg:w-[20vw] ${abierto ? "translate-x-0" : "translate-x-full"}`}
          style={{
            paddingTop: "env(safe-area-inset-top)",
            paddingBottom: "env(safe-area-inset-bottom)",
          }}
        >
          <header className="flex shrink-0 items-center justify-between gap-2 border-b border-slate-800/80 bg-slate-950/90 p-4 text-white backdrop-blur-md lg:px-3 xl:px-4">
            <h2
              id="jsbot-title"
              className="flex min-w-0 items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400"
            >
              <span
                aria-hidden="true"
                className="h-2 w-2 shrink-0 rounded-full bg-emerald-400 motion-safe:animate-pulse"
              />
              Asistente JSBot
            </h2>
            <button
              ref={cerrar}
              type="button"
              onClick={() => setAbierto(false)}
              aria-label="Cerrar JSBot"
              className="grid h-11 w-11 shrink-0 place-items-center rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-800/60 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500"
            >
              <X size={19} />
            </button>
          </header>
          <div className="flex shrink-0 items-center gap-2 border-b border-sky-100 bg-sky-50 px-4 py-2.5 text-[10px] font-medium text-sky-800 dark:border-sky-900/40 dark:bg-sky-950/30 dark:text-sky-200">
            <Sparkles size={13} className="shrink-0" />
            {DEMO ? "Vista previa de demostración" : cargandoSesion ? "Comprobando tu sesión…" : esCliente ? "Asistente para clientes de JS Logistics" : "Información general y estado de envíos"}
          </div>
          <div
            ref={historial}
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-6 lg:px-3 xl:px-4"
          >
            {mensajes.length === 1 && (
              <div className="flex animate-[landing-arrive_.3s_ease-out_both] flex-col items-center justify-center px-2 pb-4 pt-6 text-center motion-reduce:animate-none">
                <div className="group relative mb-4">
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 rounded-full bg-sky-500/20 blur-xl transition-colors group-hover:bg-sky-500/30"
                  />
                  <div className="relative h-24 w-24 rounded-full bg-gradient-to-tr from-sky-500 via-cyan-400 to-indigo-500 p-[2px] shadow-2xl shadow-sky-500/30 sm:h-28 sm:w-28">
                    <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-slate-950 p-1">
                      <img
                        src={FOTO}
                        alt="Avatar de JSBot"
                        className="h-full w-full scale-105 rounded-full object-contain drop-shadow-md"
                      />
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  JSBot
                </h3>
                <p className="mb-2 mt-1 text-xs font-semibold text-sky-700 dark:text-sky-400">
                  Tu asistente logístico inteligente
                </p>
                <p className="max-w-xs text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  Tus envíos, tus dudas. Conversemos.
                </p>
              </div>
            )}
            {mensajes.length === 1 && puedeConversar && (
              <div
                className="my-4 flex flex-col gap-2.5 px-2"
                aria-label="Preguntas sugeridas"
              >
                {[
                  "Quiero rastrear un envío",
                  "Conocer los servicios",
                  "Hablar con un asesor",
                ].map((pregunta) => (
                  <button
                    key={pregunta}
                    type="button"
                    onClick={() => void enviar(pregunta)}
                    disabled={enviando}
                    className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white p-3 text-left text-xs font-medium text-slate-600 transition-colors hover:border-sky-400 hover:text-sky-700 disabled:cursor-wait disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-sky-500 dark:hover:text-sky-300"
                  >
                    {pregunta}
                    <ArrowUpRight size={14} className="shrink-0" />
                  </button>
                ))}
              </div>
            )}
            {!cargandoSesion && !esCliente && mensajes.length === 1 && (
              <div className="mx-2 mt-4 rounded-2xl border border-sky-200 bg-sky-50 p-3 text-center dark:border-sky-900/50 dark:bg-sky-950/30">
                <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">Puedo ayudarte con información general y el estado de una guía. Para ver detalles de tus pedidos, <Link to="/login" onClick={() => setAbierto(false)} className="font-bold text-sky-700 underline underline-offset-2 dark:text-sky-300">inicia sesión</Link>.</p>
              </div>
            )}
            <div
              role="log"
              aria-label="Conversación con JSBot"
              aria-live="polite"
              aria-relevant="additions"
              className={mensajes.length === 1 ? "hidden" : "space-y-4"}
            >
              {mensajes.map((mensaje) => (
                <div
                  key={mensaje.id}
                  className={`flex ${mensaje.autor === "usuario" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[95%] rounded-2xl px-3.5 py-3 text-xs leading-relaxed [overflow-wrap:anywhere] ${mensaje.autor === "bot" ? "rounded-tl-sm border border-slate-200 bg-white text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200" : "rounded-tr-sm bg-sky-500 text-slate-950"}`}
                  >
                    <span className="sr-only">
                      {mensaje.autor === "bot" ? "JSBot" : "Tú"}:{" "}
                    </span>
                    {mensaje.texto}
                  </div>
                </div>
              ))}
              {enviando && <div className="flex justify-start" role="status"><div className="rounded-2xl rounded-tl-sm border border-slate-200 bg-white px-3.5 py-3 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">JSBot está escribiendo…</div></div>}
            </div>
          </div>
          <footer className="shrink-0 border-t border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
            {error && <p role="alert" className="mb-2 rounded-xl border border-rose-200 bg-rose-50 p-2.5 text-xs leading-relaxed text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">{error}</p>}
            {whatsappUrl && <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="mb-2 flex min-h-10 items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 text-xs font-bold text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-300"><MessageCircle size={15} /> Hablar con una persona por WhatsApp</a>}
            <form
              onSubmit={alEnviar}
              className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-1.5 focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-500/15 dark:border-slate-700 dark:bg-slate-950"
            >
              <label htmlFor="jsbot-message" className="sr-only">
                Tu mensaje para JSBot
              </label>
              <input
                ref={entrada}
                id="jsbot-message"
                value={texto}
                onChange={(event) => setTexto(event.target.value)}
                maxLength={2000}
                placeholder={puedeConversar ? "Escribe aquí…" : "Comprobando tu sesión…"}
                autoComplete="off"
                disabled={!puedeConversar || cargandoSesion || enviando}
                className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm outline-none placeholder:text-slate-500"
              />
              <button
                type="submit"
                disabled={!texto.trim() || !puedeConversar || enviando}
                aria-label="Enviar mensaje"
                className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-sky-400 text-slate-950 transition-colors hover:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Send size={17} />
              </button>
            </form>
            <p className="mt-2 flex items-center justify-center gap-1.5 text-[9px] text-slate-500 dark:text-slate-400">
              <ShieldCheck size={11} /> {DEMO ? "JS Logistics · Datos de demostración" : esCliente ? "JS Logistics · Conversación de cliente" : "JS Logistics · Consulta pública"}
            </p>
          </footer>
        </aside>
      </div>
    </>,
    document.body,
  );
}
