import { useEffect } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './auth/AuthProvider';
import RequireRole from './auth/RequireRole';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Track from './pages/Track';
import Equipo from './pages/Equipo';
import PortalCliente, { usePortal } from './portal/PortalCliente';
import { ApiError } from './api/http';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: true,
      retry: (n, e) => !(e instanceof ApiError && e.status >= 400 && e.status < 500) && n < 2,
    },
  },
});

function ScrollToHash() {
  const location = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, []);
  useEffect(() => {
    if (location.hash) {
      const element = document.querySelector(location.hash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        window.history.replaceState(null, '', location.pathname);
      }
    }
  }, [location]);
  return null;
}

function Rutas() {
  const { portal, cambiar } = usePortal();
  const { pathname } = useLocation();
  // El portal clásico trae su propia barra y menú (los de la app actual); el resto usa los de la landing.
  const sinMarco = portal === 'clasico' && pathname.startsWith('/cliente');
  return (
    <div className="flex flex-col min-h-screen">
      {!sinMarco && <Navbar />}
      <main className="flex-grow">
        <ScrollToHash />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/track" element={<Track />} />
          <Route path="/cliente/*" element={<RequireRole roles={['cliente']}><PortalCliente portal={portal} cambiar={cambiar} /></RequireRole>} />
          <Route path="/equipo" element={<RequireRole roles={['admin', 'asistente', 'mensajero']}><Equipo /></RequireRole>} />
          <Route path="*" element={
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
              <p className="font-display font-800 text-6xl text-steel-700">404</p>
              <p className="text-silver-400">Página no encontrada</p>
              <a href="/" className="btn-steel btn-sm">Volver al inicio</a>
            </div>
          } />
        </Routes>
      </main>
      {!sinMarco && <Footer />}
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <BrowserRouter>
        <Rutas />
      </BrowserRouter>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
