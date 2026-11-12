import { useId, useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../api/auth';
import { clientToast } from '../utils/clientToast';
import {
  MarcoAcceso, BotonAcceso,
  ETIQUETA, ENTRADA, ICONO, ENLACE, IcCorreo, IcCheck, IcVolver,
} from '../components/acceso';

/** Pedir por correo el enlace para recuperar la contraseña (o activar una cuenta que nunca se abrió). */
export default function Recuperar() {
  const idCorreo = useId();
  const [email, setEmail] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    try {
      await authApi.recuperar(email.trim());
      setEnviado(true);
      clientToast.success('Si el correo está registrado, te enviamos el enlace.');
    } catch (err) {
      clientToast.error(err instanceof Error ? err.message : 'No se pudo enviar el enlace. Intenta de nuevo.');
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

  return (
    <MarcoAcceso pie={pie}>
      {enviado ? (
        <>
          <h2 className="font-display text-lg font-700 text-white sm:text-xl">Revisa tu correo</h2>
          <p className="mb-4 mt-1 text-sm text-slate-400 sm:mb-6">
            Si <b className="font-semibold text-slate-100">{email.trim()}</b> tiene una cuenta, te enviamos un enlace para crear una contraseña nueva.
          </p>
          <div className="mb-4 flex justify-center py-1">
            <span className="grid h-14 w-14 place-items-center rounded-full border border-sky-400/40 bg-sky-400/10 text-sky-400">
              <IcCheck />
            </span>
          </div>
          <p className="rounded-xl border border-sky-500/25 bg-sky-500/10 px-3.5 py-3 text-center text-sm leading-relaxed text-slate-300">
            El enlace vence en 60 minutos. Si pides otro, el anterior deja de servir. Si no llega, revisa la carpeta de spam.
          </p>
          <p className="mt-4 text-center text-sm text-slate-400">
            ¿Escribiste mal el correo?{' '}
            <button type="button" onClick={() => setEnviado(false)} className={ENLACE}>
              Intentar de nuevo
            </button>
          </p>
        </>
      ) : (
        <>
          <h2 className="font-display text-lg font-700 text-white sm:text-xl">Recuperar contraseña</h2>
          <p className="mb-4 mt-1 text-sm text-slate-400 sm:mb-6">
            Escribe el correo de tu cuenta y te enviamos un enlace para crear una contraseña nueva.
          </p>

          <form onSubmit={enviar} className="space-y-3 sm:space-y-4">
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

            <BotonAcceso cargando={enviando} cargandoTexto="Enviando…">Enviar enlace</BotonAcceso>
          </form>
        </>
      )}
    </MarcoAcceso>
  );
}
