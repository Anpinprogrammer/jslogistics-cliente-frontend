import { useId, useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../api/auth';
import { clientToast } from '../utils/clientToast';
import {
  MarcoAcceso, BotonAcceso, AvisoError,
  ETIQUETA, ENTRADA, ICONO, ENLACE, IcCorreo, IcCandado, IcOjo, IcOjoTachado, IcCheck, IcVolver,
} from '../components/acceso';

const CLAVE_MINIMA = 10;
const BOTON_OJO = 'absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-700/50 hover:text-sky-400 focus-visible:outline-2 focus-visible:outline-sky-400';

type Paso = 'correo' | 'codigo' | 'listo';

/**
 * Recuperar la contraseña con un código de 6 dígitos que llega al correo:
 * 1) se pide con el correo, 2) se escribe el código con la contraseña nueva, 3) listo.
 */
export default function Recuperar() {
  const idCorreo = useId();
  const idCodigo = useId();
  const idClave = useId();
  const idRepetir = useId();
  const [paso, setPaso] = useState<Paso>('correo');
  const [email, setEmail] = useState('');
  const [codigo, setCodigo] = useState('');
  const [clave, setClave] = useState('');
  const [repetir, setRepetir] = useState('');
  const [ver, setVer] = useState(false);
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  const enviarCorreo = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setEnviando(true);
    try {
      await authApi.recuperar(email.trim());
      setPaso('codigo');
      clientToast.success('Si el correo está registrado, te enviamos un código.');
    } catch (err) {
      clientToast.error(err instanceof Error ? err.message : 'No se pudo enviar el código. Intenta de nuevo.');
    } finally {
      setEnviando(false);
    }
  };

  const reenviar = async () => {
    setError(''); setEnviando(true);
    try {
      await authApi.recuperar(email.trim());
      setCodigo('');
      clientToast.success('Si el correo está registrado, te mandamos un código nuevo. El anterior ya no sirve.');
    } catch (err) {
      clientToast.error(err instanceof Error ? err.message : 'No se pudo enviar el código. Intenta de nuevo.');
    } finally {
      setEnviando(false);
    }
  };

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!/^\d{6}$/.test(codigo)) { setError('El código tiene 6 números.'); return; }
    if (clave.length < CLAVE_MINIMA) { setError(`La contraseña debe tener al menos ${CLAVE_MINIMA} caracteres.`); return; }
    if (clave !== repetir) { setError('Las dos contraseñas no coinciden.'); return; }
    setEnviando(true);
    try {
      await authApi.restablecerConCodigo(email.trim(), codigo, clave);
      setPaso('listo');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cambiar la contraseña. Intenta de nuevo.');
    } finally {
      setEnviando(false);
    }
  };

  const pie = (
    <p className="mt-4 text-center text-sm text-slate-400 sm:mt-6">
      <Link to="/login" className={`inline-flex items-center gap-1.5 ${ENLACE}`}>
        <IcVolver /> Volver al ingreso
      </Link>
    </p>
  );

  const ojo = (
    <button
      type="button" onClick={() => setVer(v => !v)}
      aria-label={ver ? 'Ocultar contraseñas' : 'Mostrar contraseñas'} aria-pressed={ver}
      className={BOTON_OJO}
    >
      {ver ? <IcOjoTachado /> : <IcOjo />}
    </button>
  );

  return (
    <MarcoAcceso pie={pie}>
      {paso === 'listo' && (
        <>
          <h2 className="font-display text-lg font-700 text-white sm:text-xl">Contraseña cambiada</h2>
          <p className="mb-4 mt-1 text-sm text-slate-400 sm:mb-6">
            Ya puedes entrar con tu contraseña nueva. Cerramos las sesiones que tenías abiertas.
          </p>
          <div className="flex justify-center py-1">
            <span className="grid h-14 w-14 place-items-center rounded-full border border-sky-400/40 bg-sky-400/10 text-sky-400">
              <IcCheck />
            </span>
          </div>
        </>
      )}

      {paso === 'codigo' && (
        <>
          <h2 className="font-display text-lg font-700 text-white sm:text-xl">Escribe el código</h2>
          <p className="mb-4 mt-1 text-sm text-slate-400 sm:mb-6">
            Si <b className="font-semibold text-slate-100">{email.trim()}</b> tiene una cuenta, te enviamos un código de 6 números. Vence en 10 minutos.
          </p>

          <form onSubmit={guardar} className="space-y-3 sm:space-y-4">
            <div>
              <label htmlFor={idCodigo} className={ETIQUETA}>Código del correo</label>
              <input
                id={idCodigo} inputMode="numeric" pattern="\d{6}" maxLength={6} autoComplete="one-time-code" placeholder="000000" autoFocus
                value={codigo} onChange={e => setCodigo(e.target.value.replace(/\D/g, '').slice(0, 6))} required disabled={enviando}
                className={`${ENTRADA} !px-4 text-center font-mono text-2xl tracking-[0.5em]`}
              />
            </div>
            <div>
              <label htmlFor={idClave} className={ETIQUETA}>Contraseña nueva</label>
              <div className="relative">
                <input
                  id={idClave} type={ver ? 'text' : 'password'} value={clave} onChange={e => setClave(e.target.value)}
                  className={`${ENTRADA} pr-12`} placeholder="••••••••••" required autoComplete="new-password" disabled={enviando}
                />
                <span className={ICONO}><IcCandado /></span>
                {ojo}
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
              </div>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">Mínimo {CLAVE_MINIMA} caracteres. Si no llega, revisa la carpeta de spam.</p>

            {error && <AvisoError>{error}</AvisoError>}

            <BotonAcceso cargando={enviando} cargandoTexto="Guardando…">Guardar contraseña</BotonAcceso>

            <p className="text-center text-sm text-slate-400">
              ¿No te llegó?{' '}
              <button type="button" onClick={reenviar} disabled={enviando} className={ENLACE}>Pedir otro código</button>
              {' · '}
              <button type="button" onClick={() => { setPaso('correo'); setError(''); setCodigo(''); }} className={ENLACE}>Cambiar correo</button>
            </p>
          </form>
        </>
      )}

      {paso === 'correo' && (
        <>
          <h2 className="font-display text-lg font-700 text-white sm:text-xl">Recuperar contraseña</h2>
          <p className="mb-4 mt-1 text-sm text-slate-400 sm:mb-6">
            Escribe el correo de tu cuenta y te enviamos un código de 6 números para crear una contraseña nueva.
          </p>

          <form onSubmit={enviarCorreo} className="space-y-3 sm:space-y-4">
            <div>
              <label htmlFor={idCorreo} className={ETIQUETA}>Correo electrónico</label>
              <div className="relative">
                <input
                  id={idCorreo} type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className={`${ENTRADA} pr-4`} placeholder="correo@empresa.com" required autoComplete="email" autoFocus disabled={enviando}
                />
                <span className={ICONO}><IcCorreo /></span>
              </div>
            </div>

            <BotonAcceso cargando={enviando} cargandoTexto="Enviando…">Enviar código</BotonAcceso>
          </form>
        </>
      )}
    </MarcoAcceso>
  );
}
