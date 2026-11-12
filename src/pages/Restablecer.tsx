import { useEffect, useId, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { authApi } from '../api/auth';
import { DEMO } from '../api/http';
import type { EnlaceCorreo } from '../types/dominio';
import { useSesion } from '../auth/AuthProvider';
import { clientToast } from '../utils/clientToast';
import {
  MarcoAcceso, BotonAcceso, AvisoError,
  ETIQUETA, ENTRADA, ICONO, ENLACE, IcCandado, IcOjo, IcOjoTachado, IcCheck, IcVolver,
} from '../components/acceso';

const CLAVE_MINIMA = 10;

/** Cambiar la contraseña con el enlace del correo, o crearla si es una activación. */
export default function Restablecer() {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const { salir } = useSesion();
  const idClave = useId();
  const idRepetir = useId();

  const [enlace, setEnlace] = useState<EnlaceCorreo | null>(null);
  const [revisando, setRevisando] = useState(true);
  const [errorEnlace, setErrorEnlace] = useState('');
  const [clave, setClave] = useState('');
  const [repetir, setRepetir] = useState('');
  const [ver, setVer] = useState(false);
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [listo, setListo] = useState(false);

  useEffect(() => {
    let vivo = true;
    if (!token && !DEMO) {
      setErrorEnlace('El enlace no trae el token. Pide uno nuevo.');
      setRevisando(false);
      return;
    }
    authApi.enlace(token)
      .then(e => { if (vivo) setEnlace(e); })
      .catch(e => { if (vivo) setErrorEnlace(e instanceof Error ? e.message : 'El enlace no sirve o ya venció.'); })
      .finally(() => { if (vivo) setRevisando(false); });
    return () => { vivo = false; };
  }, [token]);

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (clave.length < CLAVE_MINIMA) {
      setError(`La contraseña debe tener al menos ${CLAVE_MINIMA} caracteres.`);
      return;
    }
    if (clave !== repetir) {
      setError('Las dos contraseñas no coinciden.');
      return;
    }
    setEnviando(true);
    try {
      if (enlace?.tipo === 'activacion') await authApi.activar(token, clave);
      else await authApi.restablecer(token, clave);
      // El servidor cierra las sesiones al cambiar la contraseña: se limpia la sesión local si había una.
      await salir().catch(() => {});
      setListo(true);
      clientToast.success('Contraseña guardada. Ya puedes ingresar.');
    } catch (err) {
      clientToast.error(err instanceof Error ? err.message : 'No se pudo guardar la contraseña. Intenta de nuevo.');
    } finally {
      setEnviando(false);
    }
  };

  const botonPrimario =
    'group relative mt-2 flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-[#0284c7] to-[#38bdf8] px-5 py-3 font-bold sm:py-3.5 text-white shadow-[0_8px_24px_-8px_rgba(56,189,248,0.6)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_34px_-8px_rgba(56,189,248,0.85)] active:translate-y-0';

  const pie = (
    <p className="mt-4 text-center text-sm text-slate-400 sm:mt-6">
      <Link to="/login" className={`inline-flex items-center gap-1.5 ${ENLACE}`}>
        <IcVolver /> Volver al ingreso
      </Link>
    </p>
  );

  if (revisando) {
    return (
      <MarcoAcceso>
        <h2 className="font-display text-lg font-700 text-white sm:text-xl">Revisando el enlace</h2>
        <p className="mt-1 text-sm text-slate-400">Un momento, estamos comprobando que el enlace siga sirviendo.</p>
        <div className="flex justify-center py-4">
          <svg className="h-8 w-8 animate-spin text-sky-400" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity=".25" strokeWidth="3" />
            <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </div>
      </MarcoAcceso>
    );
  }

  if (errorEnlace || !enlace) {
    return (
      <MarcoAcceso pie={pie}>
        <h2 className="font-display text-lg font-700 text-white sm:text-xl">Este enlace no sirve</h2>
        <p className="mb-4 mt-1 text-sm text-slate-400 sm:mb-6">
          Puede que ya se haya usado o que lo haya reemplazado un correo más reciente. Usa el último que te llegó o pide uno nuevo.
        </p>
        {errorEnlace && <AvisoError>{errorEnlace}</AvisoError>}
        <Link to="/recuperar" className={botonPrimario}>Pedir un enlace nuevo</Link>
      </MarcoAcceso>
    );
  }

  if (listo) {
    return (
      <MarcoAcceso>
        <h2 className="font-display text-lg font-700 text-white sm:text-xl">Contraseña lista</h2>
        <p className="mb-4 mt-1 text-sm text-slate-400 sm:mb-6">Ya puedes entrar con tu contraseña nueva.</p>
        <div className="mb-4 flex justify-center py-1">
          <span className="grid h-14 w-14 place-items-center rounded-full border border-sky-400/40 bg-sky-400/10 text-sky-400">
            <IcCheck />
          </span>
        </div>
        <Link to="/login" className={botonPrimario}>Ingresar al portal</Link>
      </MarcoAcceso>
    );
  }

  const activacion = enlace.tipo === 'activacion';
  return (
    <MarcoAcceso pie={pie}>
      <h2 className="font-display text-lg font-700 text-white sm:text-xl">
        {activacion ? 'Activa tu cuenta' : 'Cambia tu contraseña'}
      </h2>
      <p className="mb-4 mt-1 text-sm text-slate-400 sm:mb-6">
        {activacion ? 'Crea la contraseña con la que entrarás' : 'Escribe una contraseña nueva'} para{' '}
        <b className="font-semibold text-slate-100">{enlace.email}</b>.
      </p>

      {error && <AvisoError>{error}</AvisoError>}

      <form onSubmit={enviar} className="space-y-3 sm:space-y-4">
        <div>
          <label htmlFor={idClave} className={ETIQUETA}>Contraseña nueva</label>
          <div className="relative">
            <input
              id={idClave} type={ver ? 'text' : 'password'} value={clave} onChange={e => setClave(e.target.value)}
              className={`${ENTRADA} pr-12`} placeholder="••••••••••" required autoComplete="new-password" autoFocus disabled={enviando}
            />
            <span className={ICONO}><IcCandado /></span>
            <button type="button" onClick={() => setVer(v => !v)} aria-label={ver ? 'Ocultar contraseña' : 'Mostrar contraseña'} aria-pressed={ver}
              className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-700/50 hover:text-sky-400">
              {ver ? <IcOjoTachado /> : <IcOjo />}
            </button>
          </div>
        </div>

        <div>
          <label htmlFor={idRepetir} className={ETIQUETA}>Repite la contraseña</label>
          <div className="relative">
            <input
              id={idRepetir} type={ver ? 'text' : 'password'} value={repetir} onChange={e => setRepetir(e.target.value)}
              className={`${ENTRADA} pr-12`} placeholder="••••••••••" required autoComplete="new-password" disabled={enviando}
            />
            <span className={ICONO}><IcCandado /></span>
            <button type="button" onClick={() => setVer(v => !v)} aria-label={ver ? 'Ocultar contraseñas' : 'Mostrar contraseñas'} aria-pressed={ver}
              className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-700/50 hover:text-sky-400">
              {ver ? <IcOjoTachado /> : <IcOjo />}
            </button>
          </div>
        </div>

        <p className="text-xs leading-relaxed text-slate-400">Mínimo {CLAVE_MINIMA} caracteres.</p>

        <BotonAcceso cargando={enviando} cargandoTexto="Guardando…">
          {activacion ? 'Crear contraseña' : 'Guardar contraseña'}
        </BotonAcceso>
      </form>
    </MarcoAcceso>
  );
}
