import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  // Menú móvil: bloquea el scroll del body, cierra con Escape y lleva el foco al botón de cerrar.
  const cerrarRef = useRef<HTMLButtonElement>(null);
  const hamburguesaRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!mobileOpen) return;
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMobileOpen(false); };
    document.addEventListener('keydown', onKey);
    cerrarRef.current?.focus();
    const hamburguesa = hamburguesaRef.current;
    return () => {
      document.body.style.overflow = overflowAnterior;
      document.removeEventListener('keydown', onKey);
      hamburguesa?.focus();
    };
  }, [mobileOpen]);

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

  const activo = (to: string) => to.startsWith('/#') ? location.hash === to.slice(1) : location.pathname === to;

  const cerrarMenu = () => setMobileOpen(false);

  const menuMovil = (
    <div id="menu-movil" role="dialog" aria-modal="true" aria-label="Menú de navegación" aria-hidden={!mobileOpen}
      // @ts-expect-error `inert` aún no está en los tipos de React 18: evita el foco en el menú cerrado.
      inert={mobileOpen ? undefined : ''}
      className={`${hero ? 'lg:hidden' : 'md:hidden'} fixed inset-0 z-[60] flex h-dvh w-screen flex-col overflow-y-auto bg-[#070B19]/95 backdrop-blur-xl transition-all duration-300 ease-in-out ${
        mobileOpen ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-4 opacity-0'
      }`}>
      {/* Malla discreta, igual que la portada */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{ backgroundImage: 'linear-gradient(rgba(148,176,207,1) 1px, transparent 1px), linear-gradient(90deg, rgba(148,176,207,1) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#0284c7]/25 blur-[100px]" />

      {/* Cabecera */}
      <div className="relative flex h-16 shrink-0 items-center justify-between px-4"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <Link to="/" onClick={cerrarMenu} className="flex items-center gap-3">
          {/* Badge claro: el isotipo es azul oscuro y el .webp trae el texto en blanco, por eso se recorta. */}
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-white to-sky-100 p-1 shadow-[0_0_14px_2px_rgba(56,189,248,0.35)]">
            <span className="relative block h-full w-full overflow-hidden rounded-lg">
              <img src="/img/icono-96.webp" alt="" width={96} height={96} className="absolute left-[-10%] top-[3%] w-[120%] max-w-none" />
            </span>
          </span>
          <span className="font-display text-lg font-800 uppercase tracking-wide text-white">JS Logistics</span>
        </Link>
        <button ref={cerrarRef} type="button" onClick={cerrarMenu} aria-label="Cerrar menú"
          className="grid min-h-[44px] min-w-[44px] place-items-center rounded-xl text-[#f8fafc] transition-colors hover:bg-white/5 hover:text-sky-400 active:text-sky-400">
          <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      {/* Enlaces */}
      <nav aria-label="Menú móvil" className="relative flex-1 px-6 pt-6">
        <ul>
          {navLinks.map(({ to, label }) => (
            <li key={to}>
              <Link to={to} onClick={cerrarMenu}
                className={`block py-4 font-body text-2xl font-medium transition-colors active:text-sky-400 ${
                  activo(to) ? 'text-sky-400' : 'text-slate-200 hover:text-sky-400'
                }`}>
                {label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="my-4 border-t border-slate-800/80" />

        <div className="flex flex-col gap-3 pb-8" style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom))' }}>
          <button type="button" onClick={toggleTheme}
            className="min-h-[48px] w-full rounded-xl border border-slate-700 bg-slate-900/50 py-3 text-center font-medium text-slate-200 transition-colors hover:border-slate-500">
            {theme === 'dark' ? '☀️ Modo claro' : '🌙 Modo oscuro'}
          </button>
          {isAuthenticated ? (
            <button type="button" onClick={() => { cerrarMenu(); handleLogout(); }}
              className="min-h-[48px] w-full rounded-xl border border-red-400/40 bg-red-500/10 py-3 text-center font-medium text-red-300 transition-colors hover:bg-red-500/20">
              Cerrar sesión
            </button>
          ) : (
            <>
              <Link to="/login" onClick={cerrarMenu}
                className="min-h-[48px] w-full rounded-xl border border-sky-500/50 py-3 text-center font-medium text-sky-400 transition-colors hover:bg-sky-500/10">
                Iniciar Sesión
              </Link>
              <Link to="/register" onClick={cerrarMenu}
                className="min-h-[48px] w-full rounded-xl bg-gradient-to-r from-[#0284c7] to-[#38bdf8] py-3.5 text-center font-bold text-white shadow-lg shadow-sky-500/20 transition hover:brightness-110">
                Registrarse
              </Link>
            </>
          )}
        </div>
      </nav>
    </div>
  );

  return (
    <header className={hero
      ? 'relative z-20 w-full'
      : `fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'dark:bg-steel-950/95 dark:shadow-steel dark:border-b dark:border-steel-800 bg-white/95 shadow-steel-light border-b border-gray-200 backdrop-blur-md'
            : 'bg-transparent'
        }`}>
      <nav className={hero
        ? 'relative z-20 mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8'
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
          : 'hidden md:flex items-center gap-1'}>
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
        <div className={hero ? 'hidden lg:flex items-center gap-2' : 'hidden md:flex items-center gap-3'}>
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
              <Link to="/login" className="rounded-full border border-slate-700/70 px-4 py-2 text-xs font-semibold text-slate-200 transition-colors hover:border-slate-500 hover:text-white">
                Iniciar Sesión
              </Link>
              <Link to="/register" className="rounded-full bg-sky-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-lg shadow-sky-500/20 transition-all hover:bg-sky-400 active:scale-95">
                Registrarse
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost btn-sm">Iniciar Sesión</Link>
              <Link to="/register" className="btn-primary btn-sm">Registrarse</Link>
            </>
          )}
        </div>

        {/* Mobile burger */}
        <button ref={hamburguesaRef} type="button"
          className={hero
            ? 'lg:hidden grid min-h-[44px] min-w-[44px] place-items-center rounded-lg p-2 text-slate-200 transition-colors hover:bg-white/5 hover:text-white'
            : 'md:hidden grid min-h-[44px] min-w-[44px] place-items-center rounded-lg dark:text-silver-400 dark:hover:text-white text-gray-600 hover:text-gray-900'}
          aria-label="Abrir menú" aria-expanded={mobileOpen} aria-controls="menu-movil"
          onClick={() => setMobileOpen(true)}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
        </button>
      </nav>

      {/* Portal: el header usa backdrop-filter, que atraparía un `fixed` dentro de él */}
      {createPortal(menuMovil, document.body)}
    </header>
  );
};

export default Navbar;
