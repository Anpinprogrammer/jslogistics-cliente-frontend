import { Route, Routes } from 'react-router-dom';
import { Alert, Spinner } from '../../components/ui';
import { useDatosCliente } from '../useDatosCliente';
import Inicio from './Inicio';
import Pedidos from './Pedidos';
import Pedido from './Pedido';
import Cuenta from './Cuenta';
import NavInferior from './NavInferior';

/** Portal del cliente con el diseño de la landing. Usa el Navbar y el Footer del sitio (los pone App). */
export default function PortalMejorado() {
  const d = useDatosCliente();
  return (
    <div className="min-h-screen pt-24 pb-32 md:pb-12 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {d.error ? <Alert type="error" message={d.error.message} />
          : d.cargando ? <div className="py-32 flex justify-center"><Spinner size="lg" /></div>
          : !d.cliente ? <Alert type="info" message="Tu cuenta todavía no está asociada a un cliente. Escríbele a JS Logistics." />
          : (
            <Routes>
              <Route index element={<Inicio d={d} />} />
              <Route path="pedidos" element={<Pedidos d={d} />} />
              <Route path="pedidos/:guia" element={<Pedido d={d} />} />
              <Route path="cuenta" element={<Cuenta d={d} />} />
            </Routes>
          )}
      </div>
      {d.cliente && <NavInferior d={d} />}
    </div>
  );
}
