import { lazy, Suspense, useEffect, useLayoutEffect, useState } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './auth/AuthProvider';
import RequireRole from './auth/RequireRole';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import LandingFooter from './components/layout/LandingFooter';
import { Spinner } from './components/ui';
import Home from './pages/Home';
import JSBot from './components/jsbot/JSBot';
import { ApiError } from './api/http';
import { FRESCO, EN_MEMORIA } from './utils/queryCache';

// La portada va en el archivo principal porque es lo que más se abre. El resto de páginas se descarga solo cuando se visita:
// quien entra a la portada no baja el portal, y quien entra al portal no baja el registro ni el rastreo (ni axios, que solo usan ellos).
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Track = lazy(() => import('./pages/Track'));
const Equipo = lazy(() => import('./pages/Equipo'));
const Recuperar = lazy(() => import('./pages/Recuperar'));
const Restablecer = lazy(() => import('./pages/Restablecer'));
const PortalCliente = lazy(() => import('./portal/PortalCliente'));
// Los avisos (react-toastify y su CSS) tampoco van en el archivo principal: se montan cuando el navegador queda libre.
const Avisos = lazy(() => import('./components/Avisos'));

function AvisosDiferidos() {
  const [listo, setListo] = useState(false);
  useEffect(() => {
    if ('requestIdleCallback' in window) { const id = requestIdleCallback(() => setListo(true), { timeout: 2500 }); return () => cancelIdleCallback(id); }
    const t = setTimeout(() => setListo(true), 1200); return () => clearTimeout(t);
  }, []);
  return listo ? <Suspense fallback={null}><Avisos /></Suspense> : null;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Caché en memoria (utils/queryCache.ts): lo recién pedido no se vuelve a pedir al ir y volver entre pestañas.
      staleTime: FRESCO.corto,
      gcTime: EN_MEMORIA,
      refetchOnWindowFocus: true,
      retry: (n, e) => !(e instanceof ApiError && e.status >= 400 && e.status < 500) && n < 2,
    },
  },
});

function ScrollToHash() {
  const location = useLocation();
  useLayoutEffect(() => {
    if (['/login', '/register', '/solicitar-envio'].includes(location.pathname)) {
      const root = document.documentElement;
      const anterior = root.style.scrollBehavior;
      root.style.scrollBehavior = 'auto';
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      const frame = requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: 'instant' }));
      return () => { cancelAnimationFrame(frame); root.style.scrollBehavior = anterior; };
    }
  }, [location.pathname, location.key]);
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
  const { pathname } = useLocation();
  // El portal del cliente trae su propia barra y menú (los de la app actual); el resto usa los de la landing.
  const sinMarco = pathname.startsWith('/cliente');
  // La portada trae su propio navbar dentro del Hero, para que el fondo llegue hasta arriba.
  const esPortada = pathname === '/';
  const esRastreo = pathname === '/track' || pathname === '/rastrear' || pathname === '/tracking';
  // Solicitar envío (/register) dibuja su propio navbar y footer de la landing, igual que el rastreo.
  const esSolicitud = pathname === '/register' || pathname === '/solicitar-envio';
  // En el ingreso se va bajando el portal, para que al entrar no haya que esperarlo.
  useEffect(() => { if (pathname === '/login') import('./portal/PortalCliente').catch(() => { /* se reintenta al abrirlo */ }); }, [pathname]);
  return (
    <div className="flex flex-col min-h-screen">
      {!sinMarco && !esPortada && !esRastreo && !esSolicitud && <Navbar hero={pathname === '/login'} />}
      {(esPortada || pathname === '/login' || esRastreo || esSolicitud || sinMarco) && <JSBot enPortalCliente={sinMarco} />}
      <main className="flex-grow">
        <ScrollToHash />
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/recuperar" element={<Recuperar />} />
            <Route path="/restablecer" element={<Restablecer />} />
            <Route path="/activar" element={<Restablecer />} />
            {/* Los correos de activación del backend apuntan aquí (/activar se deja por los enlaces ya enviados). */}
            <Route path="/activar-cuenta" element={<Restablecer />} />
            <Route path="/register" element={<Register />} />
            <Route path="/solicitar-envio" element={<Register />} />
            <Route path="/track" element={<Track />} />
            <Route path="/rastrear" element={<Track />} />
            <Route path="/tracking" element={<Track />} />
            <Route path="/cliente/*" element={<RequireRole roles={['cliente']}><PortalCliente /></RequireRole>} />
            <Route path="/equipo" element={<RequireRole roles={['admin', 'asistente', 'mensajero']}><Equipo /></RequireRole>} />
            <Route path="*" element={
              <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
                <p className="font-display font-800 text-6xl text-steel-700">404</p>
                <p className="text-silver-400">Página no encontrada</p>
                <a href="/" className="btn-steel btn-sm">Volver al inicio</a>
              </div>
            } />
          </Routes>
        </Suspense>
      </main>
      {!sinMarco && !esPortada && !esRastreo && !esSolicitud && (pathname === '/login' ? <LandingFooter /> : <Footer />)}
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <BrowserRouter>
        <Rutas />
      </BrowserRouter>
      <AvisosDiferidos />
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
