import { useId, useState, type FormEvent, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, MapPin, Package, Send, User } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import LandingFooter from '../components/layout/LandingFooter';
import { ApiError, DEMO } from '../api/http';
import { solicitudesApi, type DatosSolicitud } from '../api/solicitudes';

const ENTRADA = 'w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-base text-slate-900 outline-none transition-all placeholder:text-slate-500 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 disabled:opacity-60 dark:border-slate-800 dark:bg-slate-950 dark:text-white sm:text-[15px]';
const ETIQUETA = 'mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 sm:text-xs';

const VACIO = { nombre: '', telefono: '', email: '', direccionRecogida: '', paquetes: '1', pesoKg: '', destinatarioNombre: '', destinatarioTelefono: '', direccionEntrega: '' };
type Formulario = typeof VACIO;

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

/** Solicitar un envío sin crear cuenta: la oficina recibe la solicitud, te confirma el valor por WhatsApp y asigna al mensajero. */
export default function Register() {
  const [f, setF] = useState<Formulario>(VACIO);
  const [sitio, setSitio] = useState(''); // trampa para robots
  const [enviando, setEnviando] = useState(false);
  const [enviada, setEnviada] = useState(false);
  const [error, setError] = useState('');
  const [campos, setCampos] = useState<Record<string, string>>({});

  const poner = (k: keyof Formulario) => (e: { target: { value: string } }) => setF(a => ({ ...a, [k]: e.target.value }));

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    setError(''); setCampos({});
    const paquetes = Number(f.paquetes);
    const peso = f.pesoKg.trim() === '' ? null : Number(f.pesoKg.replace(',', '.'));
    if (!Number.isInteger(paquetes) || paquetes < 1) { setCampos({ paquetes: 'Escribe cuántos paquetes son (mínimo 1).' }); return; }
    if (peso !== null && (!Number.isFinite(peso) || peso <= 0)) { setCampos({ pesoKg: 'El peso debe ser un número mayor que 0, o déjalo vacío.' }); return; }
    const datos: DatosSolicitud = {
      nombre: f.nombre.trim(), telefono: f.telefono.trim(), email: f.email.trim(), direccionRecogida: f.direccionRecogida.trim(),
      paquetes, pesoKg: peso, destinatarioNombre: f.destinatarioNombre.trim(), destinatarioTelefono: f.destinatarioTelefono.trim(),
      direccionEntrega: f.direccionEntrega.trim(), sitio,
    };
    setEnviando(true);
    try {
      await solicitudesApi.enviar(datos);
      setEnviada(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      if (err instanceof ApiError && err.campos?.length) setCampos(Object.fromEntries(err.campos.map(c => [c.campo, c.mensaje])));
      setError(err instanceof Error ? err.message : 'No pudimos enviar la solicitud. Intenta de nuevo.');
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
                <button type="button" onClick={() => { setF(VACIO); setEnviada(false); }} className="flex min-h-[44px] items-center justify-center gap-2 rounded-2xl bg-sky-400 px-6 py-3 text-sm font-extrabold text-slate-950 shadow-lg shadow-sky-500/20 transition-all hover:bg-sky-300 active:scale-95">
                  Hacer otra solicitud
                </button>
                <Link to="/" className="flex min-h-[44px] items-center justify-center gap-2 rounded-2xl border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Volver al inicio
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={enviar} noValidate={false} className="space-y-8 rounded-3xl border border-slate-200/80 bg-white/85 p-5 shadow-xl backdrop-blur-xl motion-safe:animate-[landing-arrive_.6s_ease-out_both] dark:border-slate-800/80 dark:bg-slate-900/85 dark:shadow-slate-950/60 sm:p-8">
              {error && <div role="alert" className="rounded-2xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200">{error}</div>}

              <Seccion numero={1} titulo="Tus datos y la recogida" icono={<User className="h-4 w-4" />}>
                <Campo etiqueta="Nombre *" error={campos.nombre}>{id => <input id={id} className={ENTRADA} value={f.nombre} onChange={poner('nombre')} maxLength={120} required autoComplete="name" placeholder="Laura Gómez" disabled={enviando} />}</Campo>
                <Campo etiqueta="Teléfono (WhatsApp) *" error={campos.telefono}>{id => <input id={id} className={ENTRADA} value={f.telefono} onChange={poner('telefono')} maxLength={30} required type="tel" inputMode="tel" autoComplete="tel" placeholder="300 123 4567" disabled={enviando} />}</Campo>
                <Campo etiqueta="Correo *" error={campos.email} ancho>{id => <input id={id} className={ENTRADA} value={f.email} onChange={poner('email')} maxLength={254} required type="email" autoComplete="email" placeholder="correo@ejemplo.com" disabled={enviando} />}</Campo>
                <Campo etiqueta="Dirección de recogida *" error={campos.direccionRecogida} ancho>{id => <input id={id} className={ENTRADA} value={f.direccionRecogida} onChange={poner('direccionRecogida')} maxLength={200} required autoComplete="street-address" placeholder="Cra 10 # 5-20, barrio, Cali" disabled={enviando} />}</Campo>
              </Seccion>

              <Seccion numero={2} titulo="Los paquetes" icono={<Package className="h-4 w-4" />}>
                <Campo etiqueta="Cantidad de paquetes *" error={campos.paquetes}>{id => <input id={id} className={ENTRADA} value={f.paquetes} onChange={poner('paquetes')} required type="number" inputMode="numeric" min={1} max={100} step={1} disabled={enviando} />}</Campo>
                <Campo etiqueta="Peso total en kg (opcional)" error={campos.pesoKg}>{id => <input id={id} className={ENTRADA} value={f.pesoKg} onChange={poner('pesoKg')} type="text" inputMode="decimal" placeholder="Ej: 3,5" disabled={enviando} />}</Campo>
              </Seccion>

              <Seccion numero={3} titulo="Quién recibe" icono={<MapPin className="h-4 w-4" />}>
                <Campo etiqueta="Nombre de quien recibe *" error={campos.destinatarioNombre}>{id => <input id={id} className={ENTRADA} value={f.destinatarioNombre} onChange={poner('destinatarioNombre')} maxLength={120} required placeholder="Pedro Ruiz" disabled={enviando} />}</Campo>
                <Campo etiqueta="Teléfono de quien recibe (opcional)" error={campos.destinatarioTelefono}>{id => <input id={id} className={ENTRADA} value={f.destinatarioTelefono} onChange={poner('destinatarioTelefono')} maxLength={30} type="tel" inputMode="tel" placeholder="311 000 0000" disabled={enviando} />}</Campo>
                <Campo etiqueta="Dirección de entrega *" error={campos.direccionEntrega} ancho>{id => <input id={id} className={ENTRADA} value={f.direccionEntrega} onChange={poner('direccionEntrega')} maxLength={200} required placeholder="Calle 70 # 1-10, barrio, Cali" disabled={enviando} />}</Campo>
              </Seccion>

              <button type="submit" disabled={enviando} className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl bg-sky-400 px-8 py-3.5 text-sm font-extrabold text-slate-950 shadow-lg shadow-sky-500/20 transition-all hover:bg-sky-300 active:scale-95 disabled:cursor-wait disabled:opacity-60">
                <Send className="h-4 w-4" aria-hidden="true" />{enviando ? 'Enviando…' : 'Enviar solicitud'}
              </button>
              <p className="text-center text-xs text-slate-500 dark:text-slate-400">
                Usamos tus datos solo para atender esta solicitud. ¿Ya tienes cuenta?{' '}
                <Link to="/login" className="font-semibold text-sky-700 underline-offset-4 hover:underline dark:text-sky-400">Iniciar sesión</Link>
              </p>
              {/* Campo trampa: las personas no lo ven; los robots lo llenan y la solicitud se descarta. */}
              <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                <label>No llenes esto<input tabIndex={-1} autoComplete="off" value={sitio} onChange={e => setSitio(e.target.value)} /></label>
              </div>
            </form>
          )}
        </div>
      </div>
      <LandingFooter />
    </div>
  );
}
