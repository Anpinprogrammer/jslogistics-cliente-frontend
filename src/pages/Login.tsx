import React, { useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { portadaDe, useSesion } from '../auth/AuthProvider';
import { DEMO } from '../api/http';
import {
  MarcoAcceso, BotonAcceso, AvisoError,
  ETIQUETA, ENTRADA, ICONO, ENLACE, IcCorreo, IcCandado, IcOjo, IcOjoTachado, IcCopiar, IcOk,
} from '../components/acceso';
import { useIntroLogin } from '../components/intro/useIntroLogin';
import { escenaIntro } from '../components/intro/escena';
import { medir, type Medidas } from '../components/intro/medidas';

const DEMO_EMAIL = 'cliente@demo.co';
const DEMO_CLAVE = 'demo1234';
/** Título de la cabecera: la animación lo escribe letra por letra. */
const TITULO = 'Portal Empresarial';

/** Fila de la caja demo: etiqueta, valor y botón para copiarlo. */
const FilaDemo: React.FC<{ etiqueta: string; valor: string; mono?: boolean }> = ({ etiqueta, valor, mono }) => {
  const [copiado, setCopiado] = useState(false);
  const copiar = async () => {
    try { await navigator.clipboard.writeText(valor); setCopiado(true); window.setTimeout(() => setCopiado(false), 1600); }
    catch { /* sin permiso del portapapeles: el valor sigue visible para copiarlo a mano */ }
  };
  return (
    <div className="flex items-center justify-between gap-3">
      <p className="min-w-0 text-sm">
        <span className="text-slate-400">{etiqueta}: </span>
        <span className={`break-all font-medium text-slate-100 ${mono ? 'font-mono' : ''}`}>{valor}</span>
      </p>
      <button type="button" onClick={copiar} aria-label={`Copiar ${etiqueta.toLowerCase()}`}
        className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg border transition ${
          copiado ? 'border-emerald-400/50 bg-emerald-400/10 text-emerald-300' : 'border-sky-500/30 text-sky-300 hover:border-sky-400 hover:bg-sky-500/15'}`}>
        {copiado ? <IcOk /> : <IcCopiar />}
      </button>
    </div>
  );
};

const Login: React.FC = () => {
  const { ingresar } = useSesion();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;
  const idCorreo = useId();
  const idClave = useId();

  const [form, setForm] = useState({ email: '', password: '' });
  const [ver, setVer] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Animación de entrada: sale en cada carga del login y se salta con cualquier gesto; el fondo no se anima.
  // Mientras corre, `intro` trae el estilo del cuadro actual para cada pieza; al terminar es `undefined` y el login queda como siempre.
  const { salio, activa, cuadro, saltar } = useIntroLogin();
  const raiz = useRef<HTMLDivElement>(null), sede = useRef<HTMLDivElement>(null), contenido = useRef<HTMLDivElement>(null);
  const tarjeta = useRef<HTMLDivElement>(null), insignia = useRef<HTMLDivElement>(null), placa = useRef<HTMLSpanElement>(null);
  const tituloRef = useRef<HTMLHeadingElement>(null), boton = useRef<HTMLButtonElement>(null);
  const refs = useMemo(() => ({ raiz, sede, contenido, tarjeta, insignia, placa, titulo: tituloRef, boton }), []);
  const [medidas, setMedidas] = useState<Medidas | null>(null);
  useLayoutEffect(() => {
    if (!activa) return;
    const tomar = () => {
      const p = { raiz: raiz.current, contenido: contenido.current, tarjeta: tarjeta.current, insignia: insignia.current, placa: placa.current, titulo: tituloRef.current, boton: boton.current };
      if (p.raiz && p.contenido && p.tarjeta && p.insignia && p.placa && p.titulo && p.boton) {
        setMedidas(medir({ ...(p as Omit<Parameters<typeof medir>[0], 'sede'>), sede: sede.current }));
      }
    };
    tomar();
    // Si cambia el tamaño de la ventana o llega la letra a mitad de la animación, se mide otra vez.
    let vivo = true;
    window.addEventListener('resize', tomar);
    document.fonts?.ready.then(() => { if (vivo) tomar(); });
    return () => { vivo = false; window.removeEventListener('resize', tomar); };
  }, [activa]);
  const intro = activa ? escenaIntro(cuadro, medidas, refs, TITULO) : undefined;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    saltar();
    setError('');
    setLoading(true);
    try {
      const u = await ingresar(form.email, form.password);
      const portada = portadaDe(u);
      navigate(from && from.startsWith(portada) ? from : portada, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo ingresar. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MarcoAcceso
      titulo={TITULO}
      intro={intro?.marco}
      sinEntrada={salio}
      pie={
        <p className="mt-4 text-center text-sm text-slate-400 sm:mt-6">
          ¿Tu empresa aún no tiene acceso?{' '}
          <Link to="/register" className={ENLACE}>
            Registrarse
          </Link>
        </p>
      }
    >
      <div style={intro?.encabezado}>
        <h2 className="font-display text-lg font-700 text-white sm:text-xl">Iniciar sesión</h2>
        <p className="mb-4 mt-1 text-sm text-slate-400 sm:mb-6">Ingresa con las credenciales de tu empresa</p>
      </div>

      {DEMO && (
        <div className="mb-4 rounded-xl border border-sky-500/30 bg-sky-500/10 p-3 sm:mb-6 sm:p-3.5" style={intro?.demo}>
          <div className="mb-2.5 flex items-center gap-2">
            <span className="rounded-md bg-sky-400 px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-wider text-slate-950">DEMO</span>
            <span className="text-xs text-slate-300">Credenciales de prueba</span>
            <button type="button" onClick={() => setForm({ email: DEMO_EMAIL, password: DEMO_CLAVE })}
              className="ml-auto text-xs font-medium text-sky-300 underline-offset-4 hover:text-sky-200 hover:underline">
              Rellenar
            </button>
          </div>
          <div className="space-y-2">
            <FilaDemo etiqueta="Correo" valor={DEMO_EMAIL} />
            <FilaDemo etiqueta="Clave" valor={DEMO_CLAVE} mono />
          </div>
        </div>
      )}

      {error && <AvisoError>{error}</AvisoError>}

      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
        <div style={intro?.campos[0].estilo}>
          <label htmlFor={idCorreo} className={ETIQUETA}>Correo electrónico</label>
          <div className="relative">
            <input id={idCorreo} name="email" type="email" value={form.email} onChange={handleChange}
              className={`${ENTRADA} pr-4`} placeholder="correo@empresa.com" required autoComplete="email" disabled={loading} />
            {intro?.campos[0].escaner}
            <span className={ICONO}><IcCorreo /></span>
          </div>
        </div>
        <div style={intro?.campos[1].estilo}>
          <label htmlFor={idClave} className={ETIQUETA}>Contraseña</label>
          <div className="relative">
            <input id={idClave} name="password" type={ver ? 'text' : 'password'} value={form.password} onChange={handleChange}
              className={`${ENTRADA} pr-12`} placeholder="••••••••" required autoComplete="current-password" disabled={loading} />
            {intro?.campos[1].escaner}
            <span className={ICONO}><IcCandado /></span>
            <button type="button" onClick={() => setVer(v => !v)} aria-label={ver ? 'Ocultar contraseña' : 'Mostrar contraseña'} aria-pressed={ver}
              className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-700/50 hover:text-sky-400">
              {ver ? <IcOjoTachado /> : <IcOjo />}
            </button>
          </div>
        </div>

        {intro?.barra}
        <BotonAcceso cargando={loading} cargandoTexto="Ingresando…" intro={intro?.boton}>Ingresar al portal</BotonAcceso>
      </form>

      <p className="mt-3 text-center text-sm" style={intro?.enlace}>
        <Link to="/recuperar" className={ENLACE}>¿Olvidaste tu contraseña?</Link>
      </p>
    </MarcoAcceso>
  );
};

export default Login;
