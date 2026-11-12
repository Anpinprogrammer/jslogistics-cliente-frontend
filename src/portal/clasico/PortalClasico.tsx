/**
 * Vista del cliente de la app actual (pintarCliente, pintarInicioCliente, verPedidoCliente y verRecibo de
 * js-logistics/app/js/app.js), pasada a React sin cambiar lo que se ve: mismo HTML, mismas clases y el mismo
 * estilos.css. Para el dueño que prefiere que sus clientes sigan viendo exactamente lo de siempre.
 *
 * Este archivo es solo el marco (menú, barra y rutas). Cada pestaña (Inicio, Mis pedidos, Mi cuenta) y el detalle de
 * un pedido son archivos aparte que se descargan al abrirlos: quien entra a Mis pedidos no baja Mi cuenta.
 */
import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Bot, LogOut, Moon, Sun } from 'lucide-react';
import './clasico.css';
import { useSesion } from '../../auth/AuthProvider';
import { fechaLarga, hoy } from '../../lib/formato';
import { cambioPendiente } from '../../lib/negocio';
import { useDatosCliente } from '../useDatosCliente';
import { useTheme } from '../../hooks/useTheme';
import { debeRestaurar, guardarPestana, pestanaGuardada, type PestanaCliente } from '../../hooks/usePersistedTab';
import { JSBOT_ABRIR } from '../../components/jsbot/evento';
import { Icono } from './iconos';
import { CargandoVista, Dialogo, LOGO } from './piezas';
import { CampanitaCliente } from './Notificaciones';
import { clientToast } from '../../utils/clientToast';

// Cada pestaña y el detalle del pedido van en su propio archivo: se descargan solo al abrirlos.
const cargar = {
  inicio: () => import('./Inicio'),
  pedidos: () => import('./Pedidos'),
  cuenta: () => import('./Cuenta'),
};
const Inicio = lazy(cargar.inicio);
const Pedidos = lazy(cargar.pedidos);
const Cuenta = lazy(cargar.cuenta);
const VerPedido = lazy(() => import('./VerPedido'));
/** Al acercar el puntero o el foco a una pestaña del menú se adelanta su descarga. */
const precargar = (k: string) => { cargar[k as PestanaCliente]?.().catch(() => { /* se reintenta al abrirla */ }); };

/** Espera a que el navegador quede libre (o, como mucho, `ms`). */
function alQuedarLibre(fn: () => void, ms: number) {
  if ('requestIdleCallback' in window) { const id = requestIdleCallback(fn, { timeout: ms }); return () => cancelIdleCallback(id); }
  const t = setTimeout(fn, ms / 2); return () => clearTimeout(t);
}

const pestanaDe = (path: string): PestanaCliente => (path.endsWith('/pedidos') ? 'pedidos' : path.endsWith('/cuenta') ? 'cuenta' : 'inicio');

export default function PortalClasico() {
  const { usuario, salir } = useSesion();
  const { theme, toggleTheme } = useTheme();
  const nav = useNavigate(), loc = useLocation();
  const [sp, setSp] = useSearchParams();
  const toast = clientToast.auto;
  const [menuColapsado, setMenuColapsado] = useState(false);
  const ver = sp.get('ver');
  const abrir = (guia: string) => setSp(prev => { const n = new URLSearchParams(prev); n.set('ver', guia); return n; });
  const cerrar = () => setSp(prev => { const n = new URLSearchParams(prev); n.delete('ver'); return n; }, { replace: true });

  const esRaiz = /^\/cliente\/?$/.test(loc.pathname);
  // F5 o vuelta a iniciar sesión en la misma pestaña: si se entra a /cliente sin nada más, se vuelve a la última pestaña.
  const [restaurarA, setRestaurarA] = useState<PestanaCliente | null>(() => {
    const t = esRaiz && debeRestaurar(loc) ? pestanaGuardada(usuario) : null;
    return t && t !== 'inicio' ? t : null;
  });
  const tab: PestanaCliente = restaurarA && esRaiz ? restaurarA : pestanaDe(loc.pathname);
  useEffect(() => { if (restaurarA) setRestaurarA(null); }, [restaurarA]);
  useEffect(() => { if (!restaurarA) guardarPestana(usuario, tab); }, [tab, restaurarA, usuario]);

  // La lista completa de pedidos es lo más pesado del portal. El Inicio la necesita de una vez; en las demás pestañas
  // primero va lo que se ve (la página de la lista, el saldo) y la lista se pide cuando el navegador queda libre,
  // para los contadores del menú y de los filtros. Fuera del Inicio se refresca cada 5 minutos en vez de cada minuto.
  const [diferida, setDiferida] = useState(false);
  useEffect(() => (tab === 'inicio' || diferida ? undefined : alQuedarLibre(() => setDiferida(true), 4000)), [tab, diferida]);
  const d = useDatosCliente(tab === 'inicio' || diferida, tab === 'inicio' ? 60_000 : 300_000);
  const enRuta = d.pedidos.filter(p => p.estado === 'pendiente' || p.estado === 'aceptado').length, cambios = d.pedidos.filter(cambioPendiente);
  const items: [string, string, number?][] = [['inicio', 'Inicio'], ['pedidos', 'Mis pedidos', enRuta + cambios.length], ['cuenta', 'Mi cuenta']];
  // En el escritorio el menú va agrupado por sección, como el de la oficina; en el celular se muestran las pestañas de siempre.
  const SECCIONES: [string, string[]][] = [['Principal', ['inicio', 'pedidos']], ['Mi cuenta', ['cuenta']]];
  const ir = (k: string, filtro?: string) => { nav('/cliente' + (k === 'inicio' ? '' : '/' + k) + (filtro ? '?f=' + filtro : '')); scrollTo(0, 0); };
  const boton = ([k, t, n]: [string, string, number?]) => (
    <button key={k} onClick={() => ir(k)} onPointerEnter={() => precargar(k)} onFocus={() => precargar(k)} aria-current={tab === k ? 'page' : undefined} aria-label={t} title={t}>
      <Icono n={k} /><span className="t">{t}</span>{n ? <span className="num">{n}</span> : null}
    </button>
  );
  const botones = items.map(boton);
  const grupos = SECCIONES.map(([titulo, claves]) => {
    const xs = items.filter(([k]) => claves.includes(k));
    return xs.length ? <div className="lat-grupo" key={titulo}><span className="lat-titulo">{titulo}</span>{xs.map(boton)}</div> : null;
  });

  const h = new Date().getHours(), nom = usuario?.nombre || '';
  const corto = nom.includes('@') ? nom.split('@')[0] : nom.split(' ')[0];
  const iniciales = nom.replace(/@.*/, '').split(/\s+/).filter(Boolean).slice(0, 2).map(x => x[0]).join('').toUpperCase();

  // La barra del navegador en celular (theme-color) también acompaña al tema del portal.
  useEffect(() => {
    const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (!meta) return;
    const anterior = meta.content;
    meta.content = theme === 'dark' ? '#0f172a' : '#f8fafc';
    return () => { meta.content = anterior; };
  }, [theme]);

  let vista;
  if (restaurarA && esRaiz) vista = <Navigate to={'/cliente/' + restaurarA} replace state={{ restaurarNav: true }} />;
  else if (d.error) vista = <><h1>Hola</h1><div className="vacio">{d.error.message}</div></>;
  else if (d.cargando) vista = <><h1>Hola</h1><div className="vacio">Cargando…</div></>;
  else if (!d.cliente) vista = <><h1>Hola</h1><div className="vacio">Tu cuenta todavía no está asociada a un cliente. Escríbele a JS Logistics.</div></>;
  else vista = (
    <Suspense fallback={<CargandoVista />}>
      <Routes>
        <Route index element={<Inicio d={d} ir={ir} abrir={abrir} />} />
        <Route path="pedidos" element={<Pedidos d={d} abrir={abrir} />} />
        <Route path="cuenta" element={<Cuenta d={d} toast={toast} />} />
        <Route path="*" element={<Inicio d={d} ir={ir} abrir={abrir} />} />
      </Routes>
    </Suspense>
  );

  return (
    <div className={'clasico' + (menuColapsado ? ' menu-colapsado' : '')} data-theme={theme}>
      <aside className="lateral">
        <div className="marca-lat">
          <img src={LOGO} alt="" />
          <div className="marca-lat-txt"><b>JS Logistics</b><small>Servir es nuestra labor</small></div>
        </div>
        <nav id="navLateral" aria-label="Menú principal">{grupos}</nav>
        <div className="lat-pie">
          <button type="button" className="plegar" onClick={() => setMenuColapsado(v => !v)}
            aria-label={menuColapsado ? 'Expandir menú' : 'Colapsar menú'}
            title={menuColapsado ? 'Expandir menú' : 'Colapsar menú'}>
            {menuColapsado ? <Icono n="expandir" /> : <><span>Colapsar menú</span><Icono n="contraer" /></>}
          </button>
        </div>
      </aside>
      <header className="barra">
        <div className="marca"><img src={LOGO} alt="" /><span>JS Logistics<small>Servir es nuestra labor</small></span></div>
        <div className="saludo"><b>{h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches'}{corto ? ', ' + corto : ''}</b><span>{fechaLarga(hoy())}</span></div>
        <button type="button" className="jsbot-acceso" onClick={() => window.dispatchEvent(new Event(JSBOT_ABRIR))}
          aria-label="Abrir asistente JSBot" title="Abrir asistente JSBot">
          <Bot aria-hidden="true" /><span>JSBot</span>
          <span className="jsbot-estado" aria-hidden="true" />
        </button>
        <div className="barra-der">
          <CampanitaCliente />
          <PerfilMovil nombre={nom} iniciales={iniciales} theme={theme} alCambiarTema={toggleTheme} alSalir={() => salir().then(() => nav('/'))} />
        </div>
        <button type="button" className="tema" data-tema={theme} onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}>
          {theme === 'dark' ? <Sun /> : <Moon />}
        </button>
        {nom && <span className="avatar" aria-hidden="true">{iniciales}</span>}
        <button className="salir" aria-label="Cerrar sesión" onClick={() => salir().then(() => nav('/'))}><Icono n="salir" /><span>Salir</span></button>
      </header>
      <main>{vista}</main>
      <nav className="pestanas" aria-label="Secciones">{botones}</nav>
      <Dialogo abierto={!!ver} alCerrar={cerrar} variante="pedido">
        {ver && <Suspense fallback={<CargandoVista modal />}><VerPedido guia={ver} d={d} alCerrar={cerrar} alVer={abrir} toast={toast} /></Suspense>}
      </Dialogo>
    </div>
  );
}

/** Cuenta del cliente en el celular: la burbuja con sus iniciales abre un menú con el tema y el cierre de sesión.
    En escritorio estos botones van sueltos en la barra y este menú no se muestra (clasico.css). */
function PerfilMovil({ nombre, iniciales, theme, alCambiarTema, alSalir }: { nombre: string; iniciales: string; theme: string; alCambiarTema: () => void; alSalir: () => void }) {
  const [abierto, setAbierto] = useState(false);
  const caja = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!abierto) return;
    const fuera = (e: Event) => { if (caja.current && !caja.current.contains(e.target as Node)) setAbierto(false); };
    const tecla = (e: KeyboardEvent) => { if (e.key === 'Escape') setAbierto(false); };
    document.addEventListener('mousedown', fuera);
    document.addEventListener('touchstart', fuera);
    document.addEventListener('keydown', tecla);
    return () => { document.removeEventListener('mousedown', fuera); document.removeEventListener('touchstart', fuera); document.removeEventListener('keydown', tecla); };
  }, [abierto]);
  const oscuro = theme === 'dark';
  return <div className="perfil-movil" ref={caja}>
    <button type="button" className={'avatar perfil-movil-btn' + (abierto ? ' abierto' : '')} onClick={() => setAbierto(v => !v)} aria-haspopup="menu" aria-expanded={abierto} aria-label="Menú de la cuenta">{iniciales || 'CP'}</button>
    {abierto && <div className="perfil-menu" role="menu">
      <div className="perfil-menu-cab"><b>{nombre.replace(/@.*/, '') || 'Mi cuenta'}</b><small>Portal de clientes</small></div>
      <button type="button" role="menuitem" onClick={() => { alCambiarTema(); setAbierto(false); }}>{oscuro ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}<span>{oscuro ? 'Modo claro' : 'Modo oscuro'}</span></button>
      <button type="button" role="menuitem" className="peligro" onClick={() => { setAbierto(false); alSalir(); }}><LogOut aria-hidden="true" /><span>Cerrar sesión</span></button>
    </div>}
  </div>;
}
