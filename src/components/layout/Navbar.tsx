import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Menu, Sun, Moon, Users, Briefcase, PhoneCall, Search, LogIn, UserPlus, ChevronRight, X, LogOut, Home, Package, UserRound } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSesion } from '../../auth/AuthProvider';
import { useTheme } from '../../hooks/useTheme';

const Navbar: React.FC<{ hero?: boolean }> = ({ hero = false }) => {
  const { usuario, salir } = useSesion();
  const isAuthenticated = !!usuario;
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobilePresent, setMobilePresent] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  // Mantener la cortina presente hasta que acabe su salida evita un cierre brusco.
  useEffect(() => {
    if (mobileOpen || !mobilePresent) return;
    const timer = window.setTimeout(() => setMobilePresent(false),
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 480);
    return () => window.clearTimeout(timer);
  }, [mobileOpen, mobilePresent]);

  // Menú móvil: bloquea el scroll durante toda la animación y devuelve el foco al terminar.
  const cerrarRef = useRef<HTMLButtonElement>(null);
  const hamburguesaRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!mobilePresent) return;
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMobileOpen(false); };
    document.addEventListener('keydown', onKey);
    const hamburguesa = hamburguesaRef.current;
    return () => {
      document.body.style.overflow = overflowAnterior;
      document.removeEventListener('keydown', onKey);
      hamburguesa?.focus();
    };
  }, [mobilePresent]);
  useEffect(() => { if (mobileOpen) cerrarRef.current?.focus(); }, [mobileOpen]);

  const handleLogoClick = () => {
    navigate("/");
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleLogout = () => { salir().then(() => navigate('/')); };

  const navLinks = isAuthenticated
    ? [
        ...(usuario?.rol === 'cliente'
          ? [
              { to: '/cliente', label: 'Inicio' },
              { to: '/cliente/pedidos', label: 'Mis pedidos' },
              { to: '/cliente/cuenta', label: 'Mi cuenta' },
            ]
          : [{ to: '/equipo', label: 'Panel' }]),
      ]
    : [
        { to: '/#nosotros', label: 'Nosotros' },
        { to: '/#servicios', label: 'Servicios' },
        { to: '/#contacto', label: 'Contacto' },
        { to: '/track', label: 'Rastrear' },
      ];
  const mobileNavLinks = [
    { to: '/', label: 'Inicio' },
    ...navLinks.map(link => link.to === '/cliente' ? { ...link, label: 'Mi portal' } : link),
  ];

  const activo = (to: string) => to.startsWith('/#') ? location.hash === to.slice(1) : location.pathname === to;

  const cerrarMenu = () => setMobileOpen(false);
  const irPortada = () => { cerrarMenu(); handleLogoClick(); };

  const menuMovil = (
    <div id="menu-movil" role="dialog" aria-modal="true" aria-label="Menú de navegación" aria-hidden={!mobileOpen}
      // @ts-expect-error `inert` aún no está en los tipos de React 18: evita el foco en el menú cerrado.
      inert={mobileOpen ? undefined : ''}
      data-open={mobileOpen}
      className="lg:hidden menu-cortina fixed inset-0 z-[60] flex h-dvh w-screen flex-col overflow-x-hidden overflow-y-auto bg-slate-950/95 backdrop-blur-xl">
      {/* Malla discreta, igual que la portada */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{ backgroundImage: 'linear-gradient(rgba(148,176,207,1) 1px, transparent 1px), linear-gradient(90deg, rgba(148,176,207,1) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
      <div aria-hidden="true" className="pointer-events-none absolute right-0 top-0 h-72 w-72 rounded-full bg-[#0284c7]/25 blur-[100px]" />

      {/* Cabecera */}
      <div className="relative flex min-h-20 shrink-0 items-center justify-between gap-4 px-6"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <Link to="/" onClick={e => { e.preventDefault(); irPortada(); }} className="flex items-center gap-3">
          {/* Badge claro: el isotipo es azul oscuro y el .webp trae el texto en blanco, por eso se recorta. */}
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-white to-sky-100 p-1 shadow-[0_0_14px_2px_rgba(56,189,248,0.35)]">
            <span className="relative block h-full w-full overflow-hidden rounded-lg">
              <img src="/img/icono-96.webp" alt="" width={96} height={96} className="absolute left-[-10%] top-[3%] w-[120%] max-w-none" />
            </span>
          </span>
          <span className="font-display text-lg font-800 uppercase tracking-wide text-white">JS Logistics</span>
        </Link>
        <button ref={cerrarRef} type="button" onClick={cerrarMenu} aria-label="Cerrar menú"
          className="boton-menu group relative grid h-11 w-11 shrink-0 cursor-pointer place-items-center rounded-full bg-gradient-to-tr from-sky-500 via-cyan-400 to-indigo-500 p-[1.5px] shadow-lg shadow-sky-500/10 transition-[transform,box-shadow] duration-200 hover:scale-105 hover:shadow-sky-500/30 active:scale-95 focus-visible:outline-none focus-visible:shadow-lg focus-visible:shadow-sky-400/50 motion-reduce:transform-none motion-reduce:transition-none">
          <span className="grid h-full w-full place-items-center rounded-full bg-slate-950/90 backdrop-blur-md transition-colors group-hover:bg-slate-900">
            <X className="h-5 w-5 text-sky-300 transition-[transform,color] duration-300 group-hover:rotate-90 group-hover:text-white motion-reduce:transform-none" strokeWidth={2.5} aria-hidden="true" />
          </span>
        </button>
      </div>

      <div className="relative flex flex-1 flex-col px-6" style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}>
        <nav aria-label="Menú móvil" className="my-auto py-6">
          <ul className="flex flex-col gap-2">
            {mobileNavLinks.map(({ to, label }) => {
              const Icon = to === '/' || to === '/cliente' ? Home : to === '/#nosotros' ? Users : to === '/#servicios' ? Briefcase : to === '/#contacto' ? PhoneCall : to === '/track' ? Search : to === '/cliente/pedidos' ? Package : to === '/cliente/cuenta' ? UserRound : Briefcase;
              return <li key={to}>
                <Link to={to} onClick={e => { if (to === '/') { e.preventDefault(); irPortada(); } else cerrarMenu(); }} aria-current={activo(to) ? 'page' : undefined}
                  className={`group flex min-h-[64px] items-center justify-between gap-3 rounded-2xl border p-3.5 text-base font-semibold transition-all hover:border-sky-500/40 hover:bg-slate-900 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-400 ${activo(to) ? 'border-sky-500/40 bg-slate-900 text-sky-300' : 'border-slate-800/60 bg-slate-900/40 text-slate-200'}`}>
                  <span className="flex min-w-0 items-center gap-3.5"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-sky-500/20 bg-sky-500/10 text-sky-400 transition-transform group-hover:scale-110 motion-reduce:transform-none"><Icon className="h-4 w-4" aria-hidden="true" /></span><span>{label}</span></span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-slate-600 transition-all group-hover:translate-x-0.5 group-hover:text-sky-400 motion-reduce:transform-none" aria-hidden="true" />
                </Link>
              </li>;
            })}
          </ul>
        </nav>
        <div className="flex flex-col gap-3 border-t border-slate-800/80 pt-4">
          <button type="button" onClick={() => { toggleTheme(); cerrarMenu(); }}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/90 px-4 py-3 text-xs font-semibold text-slate-300 transition-all hover:bg-slate-800 active:scale-95 sm:text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-400">
            {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" aria-hidden="true" /> : <Moon className="h-4 w-4 text-sky-400" aria-hidden="true" />}
            <span>{theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}</span>
          </button>
          {isAuthenticated ? (
            <button type="button" onClick={() => { cerrarMenu(); handleLogout(); }}
              className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-red-400/40 bg-red-500/10 py-3 text-xs font-semibold text-red-300 transition-all hover:bg-red-500/20">
              <LogOut className="h-4 w-4" aria-hidden="true" /> Cerrar sesión
            </button>
          ) : (
            <>
              <Link to="/login" onClick={cerrarMenu}
                className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl border border-slate-700/80 bg-slate-900/90 px-4 py-3.5 text-sm font-extrabold text-white shadow-md transition-all hover:bg-slate-800 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-400">
                <LogIn className="h-[18px] w-[18px] text-sky-400" aria-hidden="true" /> Iniciar Sesión
              </Link>
              <Link to="/solicitar-envio" onClick={cerrarMenu}
                className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-400 via-cyan-400 to-sky-500 px-4 py-3.5 text-sm font-black text-slate-950 shadow-lg shadow-sky-500/25 transition-all hover:shadow-sky-500/40 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white">
                <UserPlus className="h-[18px] w-[18px]" aria-hidden="true" /> Solicitar envío
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <header className={hero
      ? `fixed top-0 inset-x-0 z-50 w-full border-b bg-slate-950/80 dark:bg-slate-950/85 backdrop-blur-md transition-all duration-300 ${scrolled ? 'border-slate-700/80 shadow-xl shadow-slate-950/30' : 'border-slate-800/60'}`
      : `fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'dark:bg-steel-950/95 dark:shadow-steel dark:border-b dark:border-steel-800 bg-white/95 shadow-steel-light border-b border-gray-200 backdrop-blur-md'
            : 'bg-transparent'
        }`}>
      <nav className={hero
        ? 'relative mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:h-20 lg:px-8'
        : 'max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between'}>
        {/* Logo */}
        <div onClick={handleLogoClick} className="flex cursor-pointer items-center gap-3 group">
          {hero ? (
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-white to-sky-100 p-1 shadow-[0_0_14px_2px_rgba(56,189,248,0.35)]">
              <span className="relative block h-full w-full overflow-hidden rounded-lg">
                <img src="/img/icono-96.webp" alt="" width={96} height={96} className="absolute left-[-10%] top-[3%] w-[120%] max-w-none" />
              </span>
            </span>
          ) : (
            <div className="w-9 h-9 rounded-lg bg-steel-gradient dark:bg-steel-gradient flex items-center justify-center dark:border dark:border-steel-600 border border-steel-200 shadow-steel group-hover:border-accent-500 transition-colors">
              <img src="/img/logo.png" alt="logo" />
            </div>
          )}
          {hero ? (
            <div className="flex items-center gap-2">
              <span className="font-display text-lg font-800 uppercase tracking-wide text-white">JS Logistics</span>
              <span className="hidden xs:inline-flex items-center rounded-full border border-sky-400/30 bg-sky-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-sky-300">B2B</span>
            </div>
          ) : (
            <div>
              <span className="font-display font-800 text-lg dark:text-white text-steel-700 tracking-wide">JS</span>
              <span className="font-display font-400 text-lg dark:text-silver-400 text-steel-500 tracking-wider"> LOGISTICS</span>
            </div>
          )}
        </div>

        {/* Desktop nav links */}
        <div className={hero
          ? 'hidden lg:flex items-center gap-8 text-xs font-semibold tracking-wider'
          : 'hidden lg:flex items-center gap-1'}>
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={hero
                ? `transition-colors hover:text-white ${activo(to) ? 'text-white' : 'text-slate-300'}`
                : `px-4 py-2 text-sm font-body font-600 rounded-lg transition-all duration-200 ${
                    activo(to)
                      ? 'text-accent-400 dark:bg-accent-500/10 bg-accent-50'
                      : 'dark:text-silver-400 dark:hover:text-silver-100 dark:hover:bg-steel-800 text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className={`hidden lg:flex items-center ${hero ? 'gap-2' : 'gap-3'}`}>
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className={hero
              ? 'grid h-9 w-9 place-items-center rounded-full text-slate-400 transition-colors hover:bg-white/5 hover:text-white'
              : 'p-2 rounded-lg dark:text-silver-400 dark:hover:text-silver-100 dark:hover:bg-steel-800 text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors'}
            title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            {theme === 'dark' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
              </svg>
            )}
          </button>

          {isAuthenticated ? (
            hero ? (
              <>
                <button onClick={handleLogout}
                  className="rounded-full border border-slate-700/70 px-4 py-2 text-xs font-semibold text-slate-200 transition-colors hover:border-slate-500 hover:text-white">
                  Salir
                </button>
                <Link to={usuario?.rol === 'cliente' ? '/cliente' : '/equipo'}
                  className="rounded-full bg-sky-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-lg shadow-sky-500/20 transition-all hover:bg-sky-400 active:scale-95">
                  {usuario?.rol === 'cliente' ? 'Acceso Clientes' : 'Panel'}
                </Link>
              </>
            ) : (
              <>
                <div className="text-right mr-1">
                  <p className="text-sm font-600 dark:text-silver-200 text-gray-800">{usuario?.nombre}</p>
                  <p className="text-xs dark:text-silver-500 text-gray-500">{usuario?.email}</p>
                </div>
                <button onClick={handleLogout} className="btn-ghost btn-sm">Salir</button>
              </>
            )
          ) : hero ? (
            <>
              <Link to="/login" className="inline-flex min-h-11 items-center justify-center rounded-full border border-slate-700/70 px-5 py-2.5 text-sm font-bold text-slate-200 transition-colors hover:border-slate-500 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-400">
                Iniciar Sesión
              </Link>
              <Link to="/solicitar-envio" className="inline-flex min-h-11 items-center justify-center rounded-full bg-gradient-to-r from-sky-400 via-cyan-400 to-sky-500 px-5 py-2.5 text-sm font-extrabold text-slate-950 shadow-lg shadow-sky-500/25 transition-all hover:shadow-sky-500/40 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-400">
                Solicitar envío
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost min-h-11 text-sm font-bold">Iniciar Sesión</Link>
              <Link to="/solicitar-envio" className="btn-primary min-h-11 text-sm font-extrabold">Solicitar envío</Link>
            </>
          )}
        </div>

        {/* Mobile burger */}
        <button ref={hamburguesaRef} type="button"
          className="lg:hidden boton-menu group relative grid h-11 w-11 shrink-0 cursor-pointer place-items-center rounded-full bg-gradient-to-tr from-sky-500 via-cyan-400 to-indigo-500 p-[1.5px] shadow-lg shadow-sky-500/10 transition-[transform,box-shadow] duration-200 hover:scale-105 hover:shadow-sky-500/30 active:scale-95 focus-visible:outline-none focus-visible:shadow-lg focus-visible:shadow-sky-400/50 motion-reduce:transform-none motion-reduce:transition-none"
          aria-label="Abrir menú" aria-expanded={mobileOpen} aria-controls="menu-movil"
          onClick={() => { setMobilePresent(true); setMobileOpen(true); }}>
          <span className="grid h-full w-full place-items-center rounded-full bg-slate-950/90 backdrop-blur-md transition-colors group-hover:bg-slate-900">
            <Menu className="h-5 w-5 text-white transition-[transform,color] duration-200 group-hover:scale-110 group-hover:text-sky-300 motion-reduce:transform-none" strokeWidth={2.5} aria-hidden="true" />
          </span>
        </button>
      </nav>

      {/* Portal: el header usa backdrop-filter, que atraparía un `fixed` dentro de él */}
      {createPortal(menuMovil, document.body)}
    </header>
  );
};

export default Navbar;
