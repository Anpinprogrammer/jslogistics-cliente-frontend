import { useNavigate } from 'react-router-dom';
import { useSesion } from '../auth/AuthProvider';

/** Las pantallas del equipo (mensajeros, oficina, administración) se migran en las siguientes fases. */
export default function Equipo() {
  const { usuario, salir } = useSesion();
  const nav = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20">
      <div className="card p-8 max-w-md text-center">
        <h1 className="font-display font-700 text-2xl dark:text-white text-gray-700 mb-2">Hola, {usuario?.nombre}</h1>
        <p className="text-silver-500 text-sm mb-6">
          Las pantallas de mensajeros, oficina y administración todavía están en la app actual. Por ahora, en esta versión nueva solo está el portal de clientes.
        </p>
        <button className="btn-steel" onClick={() => salir().then(() => nav('/'))}>Cerrar sesión</button>
      </div>
    </div>
  );
}
