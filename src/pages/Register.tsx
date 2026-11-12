import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, ChevronLeft, ChevronRight, MapPin, Package, Send, User } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import LandingFooter from '../components/layout/LandingFooter';
import { ApiError, DEMO } from '../api/http';
import { solicitudesApi, type DatosSolicitud } from '../api/solicitudes';
import { clientToast } from '../utils/clientToast';

const ENTRADA = 'w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-base text-slate-900 outline-none transition-all placeholder:text-slate-500 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 disabled:opacity-60 dark:border-slate-800 dark:bg-slate-950 dark:text-white sm:text-[15px]';
const ETIQUETA = 'mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 sm:text-xs';
const TARJETA_FORM = 'rounded-3xl border border-slate-200/80 bg-white/85 p-5 shadow-xl backdrop-blur-xl motion-safe:animate-[landing-arrive_.6s_ease-out_both] dark:border-slate-800/80 dark:bg-slate-900/85 dark:shadow-slate-950/60 sm:p-8';

const VACIO = { nombre: '', telefono: '', email: '', direccionRecogida: '', paquetes: '1', pesoKg: '', destinatarioNombre: '', destinatarioTelefono: '', direccionEntrega: '' };
type Formulario = typeof VACIO;
type Poner = (k: keyof Formulario) => (e: { target: { value: string } }) => void;

const TITULOS_PASO: Record<number, string> = {
  1: 'Datos de Recogida',
  2: 'Detalles de Paquetes',
  3: 'Destino y Confirmación',
};

const PASO_DE_CAMPO: Record<string, number> = {
  nombre: 1, telefono: 1, email: 1, direccionRecogida: 1,
  paquetes: 2, pesoKg: 2,
  destinatarioNombre: 3, destinatarioTelefono: 3, direccionEntrega: 3,
};

function Campo({ etiqueta, error, children, ancho }: { etiqueta: string; error?: string; children: (id: string) => ReactNode; ancho?: boolean }) {
  const id = useId();
  return (
    <div className={`min-w-0 ${ancho ? 'sm:col-span-2' : ''}`}>
      <label htmlFor={id} className={ETIQUETA}>{etiqueta}</label>
      {children(id)}
      {error && <p role="alert" className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-300">{error}</p>}
    </div>
  );
}

const Seccion = ({ numero, titulo, icono, children }: { numero: number; titulo: string; icono: ReactNode; children: ReactNode }) => (
  <fieldset className="min-w-0 border-0 p-0">
    <legend className="mb-4 flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400">
      <span className="grid h-7 w-7 place-items-center rounded-xl bg-sky-500/10" aria-hidden="true">{icono}</span>
      {numero}. {titulo}
    </legend>
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
  </fieldset>
);

type PropsCampos = { f: Formulario; campos: Record<string, string>; poner: Poner; enviando: boolean };

function CamposRecogida({ f, campos, poner, enviando }: PropsCampos) {
  return (
    <Seccion numero={1} titulo="Tus datos y la recogida" icono={<User className="h-4 w-4" />}>
      <Campo etiqueta="Nombre *" error={campos.nombre}>{id => <input id={id} className={ENTRADA} value={f.nombre} onChange={poner('nombre')} maxLength={120} required autoComplete="name" placeholder="Laura Gómez" disabled={enviando} />}</Campo>
      <Campo etiqueta="Teléfono (WhatsApp) *" error={campos.telefono}>{id => <input id={id} className={ENTRADA} value={f.telefono} onChange={poner('telefono')} maxLength={30} required type="tel" inputMode="tel" autoComplete="tel" placeholder="300 123 4567" disabled={enviando} />}</Campo>
      <Campo etiqueta="Correo *" error={campos.email} ancho>{id => <input id={id} className={ENTRADA} value={f.email} onChange={poner('email')} maxLength={254} required type="email" autoComplete="email" placeholder="correo@ejemplo.com" disabled={enviando} />}</Campo>
      <Campo etiqueta="Dirección de recogida *" error={campos.direccionRecogida} ancho>{id => <input id={id} className={ENTRADA} value={f.direccionRecogida} onChange={poner('direccionRecogida')} maxLength={200} required autoComplete="street-address" placeholder="Cra 10 # 5-20, barrio, Cali" disabled={enviando} />}</Campo>
    </Seccion>
  );
}

function CamposPaquetes({ f, campos, poner, enviando }: PropsCampos) {
  return (
    <Seccion numero={2} titulo="Los paquetes" icono={<Package className="h-4 w-4" />}>
      <Campo etiqueta="Cantidad de paquetes *" error={campos.paquetes}>{id => <input id={id} className={ENTRADA} value={f.paquetes} onChange={poner('paquetes')} required type="number" inputMode="numeric" min={1} max={100} step={1} disabled={enviando} />}</Campo>
      <Campo etiqueta="Peso total en kg (opcional)" error={campos.pesoKg}>{id => <input id={id} className={ENTRADA} value={f.pesoKg} onChange={poner('pesoKg')} type="text" inputMode="decimal" placeholder="Ej: 3,5" disabled={enviando} />}</Campo>
    </Seccion>
  );
}

function CamposDestino({ f, campos, poner, enviando }: PropsCampos) {
  return (
    <Seccion numero={3} titulo="Quién recibe" icono={<MapPin className="h-4 w-4" />}>
      <Campo etiqueta="Nombre de quien recibe *" error={campos.destinatarioNombre}>{id => <input id={id} className={ENTRADA} value={f.destinatarioNombre} onChange={poner('destinatarioNombre')} maxLength={120} required placeholder="Pedro Ruiz" disabled={enviando} />}</Campo>
      <Campo etiqueta="Teléfono de quien recibe (opcional)" error={campos.destinatarioTelefono}>{id => <input id={id} className={ENTRADA} value={f.destinatarioTelefono} onChange={poner('destinatarioTelefono')} maxLength={30} type="tel" inputMode="tel" placeholder="311 000 0000" disabled={enviando} />}</Campo>
      <Campo etiqueta="Dirección de entrega *" error={campos.direccionEntrega} ancho>{id => <input id={id} className={ENTRADA} value={f.direccionEntrega} onChange={poner('direccionEntrega')} maxLength={200} required placeholder="Calle 70 # 1-10, barrio, Cali" disabled={enviando} />}</Campo>
    </Seccion>
  );
}

const PieFormulario = () => (
  <p className="text-center text-xs text-slate-500 dark:text-slate-400">
    Usamos tus datos solo para atender esta solicitud. ¿Ya tienes cuenta?{' '}
    <Link to="/login" className="font-semibold text-sky-700 underline-offset-4 hover:underline dark:text-sky-400">Iniciar sesión</Link>
  </p>
);

const Trampa = ({ sitio, setSitio }: { sitio: string; setSitio: (v: string) => void }) => (
  <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
    <label>No llenes esto<input tabIndex={-1} autoComplete="off" value={sitio} onChange={e => setSitio(e.target.value)} /></label>
  </div>
);

/** Solicitar un envío sin crear cuenta: la oficina recibe la solicitud, te confirma el valor por WhatsApp y asigna al mensajero. */
export default function Register() {
  const [f, setF] = useState<Formulario>(VACIO);
  const [sitio, setSitio] = useState(''); // trampa para robots
  const [enviando, setEnviando] = useState(false);
  const [enviada, setEnviada] = useState(false);
  const [campos, setCampos] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(1);
  const [direccion, setDireccion] = useState<1 | -1>(1);
  const pasoRef = useRef<HTMLFormElement>(null);
  const primerPaso = useRef(true);

  const poner: Poner = (k) => (e) => {
    const valor = e.target.value;
    setF(a => ({ ...a, [k]: valor }));
    setCampos(a => {
      if (!a[k]) return a;
      const n = { ...a };
      delete n[k];
      return n;
    });
  };

  const irAPaso = (paso: number, dir: 1 | -1) => {
    setDireccion(dir);
    setCurrentStep(paso);
  };

  const erroresPaso = (paso: number) => {
    const e: Record<string, string> = {};
    if (paso === 1) {
      if (!f.nombre.trim()) e.nombre = 'Escribe tu nombre.';
      if (!f.telefono.trim()) e.telefono = 'Escribe tu teléfono.';
      else if (f.telefono.replace(/\D/g, '').length < 7) e.telefono = 'Escribe un teléfono válido.';
      if (!f.email.trim()) e.email = 'Escribe tu correo.';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) e.email = 'Escribe un correo válido.';
      if (!f.direccionRecogida.trim()) e.direccionRecogida = 'Escribe la dirección de recogida.';
    }
    if (paso === 2) {
      const paquetes = Number(f.paquetes);
      if (!Number.isInteger(paquetes) || paquetes < 1 || paquetes > 100) e.paquetes = 'Escribe cuántos paquetes son (entre 1 y 100).';
      if (f.pesoKg.trim() !== '') {
        const peso = Number(f.pesoKg.replace(',', '.'));
        if (!Number.isFinite(peso) || peso <= 0) e.pesoKg = 'El peso debe ser un número mayor que 0, o déjalo vacío.';
      }
    }
    if (paso === 3) {
      if (!f.destinatarioNombre.trim()) e.destinatarioNombre = 'Escribe el nombre de quien recibe.';
      if (!f.direccionEntrega.trim()) e.direccionEntrega = 'Escribe la dirección de entrega.';
    }
    return e;
  };

  const validarTodo = () => {
    const errs = { ...erroresPaso(1), ...erroresPaso(2), ...erroresPaso(3) };
    setCampos(errs);
    if (!Object.keys(errs).length) return true;
    const primero = Object.keys(errs)[0];
    const paso = PASO_DE_CAMPO[primero] ?? 1;
    irAPaso(paso, paso < currentStep ? -1 : 1);
    return false;
  };

  const siguiente = () => {
    const errs = erroresPaso(currentStep);
    setCampos(errs);
    if (Object.keys(errs).length) return;
    irAPaso(Math.min(3, currentStep + 1), 1);
  };

  const atras = () => {
    irAPaso(Math.max(1, currentStep - 1), -1);
  };

  useEffect(() => {
    if (primerPaso.current) { primerPaso.current = false; return; }
    pasoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [currentStep]);

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    if (!validarTodo()) return;
    const paquetes = Number(f.paquetes);
    const peso = f.pesoKg.trim() === '' ? null : Number(f.pesoKg.replace(',', '.'));
    const datos: DatosSolicitud = {
      nombre: f.nombre.trim(), telefono: f.telefono.trim(), email: f.email.trim(), direccionRecogida: f.direccionRecogida.trim(),
      paquetes, pesoKg: peso, destinatarioNombre: f.destinatarioNombre.trim(), destinatarioTelefono: f.destinatarioTelefono.trim(),
      direccionEntrega: f.direccionEntrega.trim(), sitio,
    };
    setEnviando(true);
    try {
      await solicitudesApi.enviar(datos);
      setEnviada(true);
      clientToast.success('Recibimos tu solicitud de envío. Te contactamos pronto.');
      setCurrentStep(1);
      setDireccion(1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      if (err instanceof ApiError && err.campos?.length) {
        const errs = Object.fromEntries(err.campos.map(c => [c.campo, c.mensaje]));
        setCampos(errs);
        const paso = PASO_DE_CAMPO[err.campos[0].campo] ?? currentStep;
        irAPaso(paso, paso < currentStep ? -1 : 1);
      }
      clientToast.error(err instanceof Error ? err.message : 'No pudimos enviar la solicitud. Intenta de nuevo.');
    } finally { setEnviando(false); }
  };

  return (
    <div className="landing">
      <Navbar hero />
      <div className="relative flex min-h-screen w-full flex-col overflow-hidden bg-slate-50 pb-16 pt-28 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-white sm:pt-32 lg:pb-24">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] opacity-40 [background-size:24px_24px] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)]" />
        <div aria-hidden="true" className="pointer-events-none absolute -left-20 top-1/4 h-96 w-96 rounded-full bg-sky-500/10 blur-3xl dark:bg-sky-500/15" />
        <div aria-hidden="true" className="pointer-events-none absolute -right-20 bottom-1/4 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl dark:bg-indigo-500/15" />

        <div className="relative z-10 mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center motion-safe:animate-[landing-arrive_.5s_ease-out_both] sm:mb-10">
            <span className="mb-3 inline-block rounded-full border border-sky-500/20 bg-sky-500/10 px-3.5 py-1 text-[10px] font-bold uppercase tracking-widest text-sky-700 dark:text-sky-400 sm:text-xs">
              {DEMO ? 'Vista de demostración' : 'Sin crear cuenta'}
            </span>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-5xl">Solicitar envío</h1>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Cuéntanos qué recogemos y a dónde va. Te escribimos por WhatsApp con el valor del domicilio y, si estás de acuerdo, enviamos un mensajero.
            </p>
          </div>

          {enviada ? (
            <div aria-live="polite" className="rounded-3xl border border-slate-200/80 bg-white/90 p-6 text-center shadow-xl backdrop-blur-xl motion-safe:animate-[landing-arrive_.4s_ease-out_both] dark:border-slate-800/80 dark:bg-slate-900/85 sm:p-10">
              <span className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"><CheckCircle2 className="h-7 w-7" aria-hidden="true" /></span>
              <h2 className="text-xl font-black sm:text-2xl">¡Recibimos tu solicitud!</h2>
              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                Revisaremos las direcciones y te escribiremos al <b className="font-semibold text-slate-900 dark:text-white">{f.telefono.trim()}</b> por WhatsApp con el valor del domicilio. Cuando nos confirmes, asignamos al mensajero.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <button type="button" onClick={() => { setF(VACIO); setSitio(''); setEnviada(false); setCurrentStep(1); setDireccion(1); setCampos({}); }} className="flex min-h-[44px] items-center justify-center gap-2 rounded-2xl bg-sky-400 px-6 py-3 text-sm font-extrabold text-slate-950 shadow-lg shadow-sky-500/20 transition-all hover:bg-sky-300 active:scale-95">
                  Hacer otra solicitud
                </button>
                <Link to="/" className="flex min-h-[44px] items-center justify-center gap-2 rounded-2xl border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Volver al inicio
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Vista móvil: wizard de un paso a la vez */}
              <form
                ref={pasoRef}
                onSubmit={enviar}
                noValidate
                onKeyDown={e => { if (e.key === 'Enter' && currentStep < 3 && (e.target as HTMLElement).tagName === 'INPUT') { e.preventDefault(); siguiente(); } }}
                className={`block scroll-mt-24 space-y-5 overflow-hidden lg:hidden ${TARJETA_FORM}`}
              >
                <div className="block w-full lg:hidden">
                  <div className="mb-2 flex items-center justify-between gap-3 text-[11px] font-bold">
                    <span className="text-sky-600 dark:text-sky-400">Paso {currentStep} de 3</span>
                    <span className="text-right text-slate-500 dark:text-slate-400">{TITULOS_PASO[currentStep]}</span>
                  </div>
                  <div
                    role="progressbar"
                    aria-valuemin={1}
                    aria-valuemax={3}
                    aria-valuenow={currentStep}
                    aria-valuetext={`Paso ${currentStep} de 3: ${TITULOS_PASO[currentStep]}`}
                    className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800"
                  >
                    <div className="h-full bg-gradient-to-r from-sky-500 to-cyan-400 transition-all duration-300 ease-out" style={{ width: `${(currentStep / 3) * 100}%` }} />
                  </div>
                </div>


                <div key={currentStep} className={`space-y-4 ${direccion === 1 ? 'registro-paso-der' : 'registro-paso-izq'}`}>
                  {currentStep === 1 && <CamposRecogida f={f} campos={campos} poner={poner} enviando={enviando} />}
                  {currentStep === 2 && <CamposPaquetes f={f} campos={campos} poner={poner} enviando={enviando} />}
                  {currentStep === 3 && (
                    <>
                      <div className="rounded-2xl border border-slate-200/80 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                        <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Recogida</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{f.nombre}</p>
                        <p className="mt-0.5 break-words text-xs text-slate-600 dark:text-slate-400">{f.telefono} · {f.email}</p>
                        <p className="mt-0.5 break-words text-xs text-slate-600 dark:text-slate-400">{f.direccionRecogida}</p>
                        <p className="mt-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {f.paquetes} paquete{Number(f.paquetes) === 1 ? '' : 's'}{f.pesoKg.trim() ? ` · ${f.pesoKg} kg` : ''}
                        </p>
                      </div>
                      <CamposDestino f={f} campos={campos} poner={poner} enviando={enviando} />
                    </>
                  )}
                </div>

                <div className={`flex gap-3 pt-1 ${currentStep === 3 ? 'flex-col sm:flex-row' : ''}`}>
                  {currentStep > 1 && (
                    <button type="button" onClick={atras} className="flex min-h-[48px] flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
                      <ChevronLeft className="h-4 w-4" aria-hidden="true" /> Atrás
                    </button>
                  )}
                  {currentStep < 3 ? (
                    <button type="button" onClick={siguiente} className="flex min-h-[48px] flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-2xl bg-sky-400 px-4 py-3 text-sm font-extrabold text-slate-950 shadow-lg shadow-sky-500/20 transition-all hover:bg-sky-300 active:scale-95">
                      Siguiente <ChevronRight className="h-4 w-4" aria-hidden="true" />
                    </button>
                  ) : (
                    <button type="submit" disabled={enviando} className="flex min-h-[48px] flex-[1.6] items-center justify-center gap-2 whitespace-nowrap rounded-2xl bg-sky-400 px-4 py-3 text-sm font-extrabold text-slate-950 shadow-lg shadow-sky-500/20 transition-all hover:bg-sky-300 active:scale-95 disabled:cursor-wait disabled:opacity-60">
                      <Send className="h-4 w-4" aria-hidden="true" />{enviando ? 'Enviando…' : 'Enviar solicitud'}
                    </button>
                  )}
                </div>

                <PieFormulario />
                <Trampa sitio={sitio} setSitio={setSitio} />
              </form>

              {/* Escritorio: el formulario completo, igual que antes */}
              <form onSubmit={enviar} noValidate={false} className={`hidden space-y-8 lg:block ${TARJETA_FORM}`}>
                <CamposRecogida f={f} campos={campos} poner={poner} enviando={enviando} />
                <CamposPaquetes f={f} campos={campos} poner={poner} enviando={enviando} />
                <CamposDestino f={f} campos={campos} poner={poner} enviando={enviando} />
                <button type="submit" disabled={enviando} className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl bg-sky-400 px-8 py-3.5 text-sm font-extrabold text-slate-950 shadow-lg shadow-sky-500/20 transition-all hover:bg-sky-300 active:scale-95 disabled:cursor-wait disabled:opacity-60">
                  <Send className="h-4 w-4" aria-hidden="true" />{enviando ? 'Enviando…' : 'Enviar solicitud'}
                </button>
                <PieFormulario />
                <Trampa sitio={sitio} setSitio={setSitio} />
              </form>
            </>
          )}
        </div>
      </div>
      <LandingFooter />
    </div>
  );
}
