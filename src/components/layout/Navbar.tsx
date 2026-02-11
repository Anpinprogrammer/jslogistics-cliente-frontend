import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../hooks/useTheme';

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
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

  const handleLogout = () => { logout(); navigate('/'); };

  const navLinks = isAuthenticated
    ? [
        { to: '/dashboard', label: 'Panel' },
        { to: '/orders', label: 'Pedidos' },
        { to: '/finances', label: 'Finanzas' },
        { to: '/track', label: 'Rastrear' },
      ]
    : [
        { to: '/#nosotros', label: 'Nosotros' },
        { to: '/#servicios', label: 'Servicios' },
        { to: '/#contacto', label: 'Contacto' },
        { to: '/track', label: 'Rastrear' },
      ];

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'dark:bg-steel-950/95 dark:shadow-steel dark:border-b dark:border-steel-800 bg-white/95 shadow-steel-light border-b border-gray-200 backdrop-blur-md' 
        : 'bg-transparent'
    }`}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-lg bg-steel-gradient dark:bg-steel-gradient flex items-center justify-center dark:border dark:border-steel-600 border border-steel-200 shadow-steel group-hover:border-accent-500 transition-colors">
            {/**
             * <svg viewBox="0 0 24 24" className="w-5 h-5 text-accent-400" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" />
              <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
            </svg>
             */}
            <img src="/img/logo.png" alt="logo" />
            
          </div>
          <div>
            <span className="font-display font-800 text-lg dark:text-white text-steel-700 tracking-wide">JS</span>
            <span className="font-display font-400 text-lg dark:text-silver-400 text-steel-500 tracking-wider"> LOGISTICS</span>
          </div>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`px-4 py-2 text-sm font-body font-600 rounded-lg transition-all duration-200 ${
                location.pathname === to
                  ? 'text-accent-400 dark:bg-accent-500/10 bg-accent-50'
                  : 'dark:text-silver-400 dark:hover:text-silver-100 dark:hover:bg-steel-800 text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-3">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg dark:text-silver-400 dark:hover:text-silver-100 dark:hover:bg-steel-800 text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            {theme === 'dark' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
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
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
              </svg>
            )}
          </button>

          {isAuthenticated ? (
            <>
              <div className="text-right mr-1">
                <p className="text-sm font-600 dark:text-silver-200 text-gray-800">{user?.name}</p>
                <p className="text-xs dark:text-silver-500 text-gray-500">{user?.company}</p>
              </div>
              <button onClick={handleLogout} className="btn-ghost btn-sm">Salir</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost btn-sm">Iniciar Sesión</Link>
              <Link to="/register" className="btn-primary btn-sm">Registrarse</Link>
            </>
          )}
        </div>

        {/* Mobile burger */}
        <button className="md:hidden p-2 dark:text-silver-400 dark:hover:text-white text-gray-600 hover:text-gray-900" onClick={() => setMobileOpen(v => !v)}>
          {mobileOpen
            ? <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
            : <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
          }
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden dark:bg-steel-950/98 dark:border-t dark:border-steel-800 bg-white border-t border-gray-200 px-4 py-4 space-y-1 backdrop-blur-md mx-3 rounded-lg">
          {navLinks.map(({ to, label }) => (
            <Link key={to} to={to} className="block px-4 py-3 text-sm font-600 dark:text-silver-300 dark:hover:text-white dark:hover:bg-steel-800 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
              {label}
            </Link>
          ))}
          <div className="pt-3 dark:border-t dark:border-steel-800 border-t border-gray-200 flex flex-col gap-2">
            <button onClick={toggleTheme} className="btn-ghost w-full text-center">
              {theme === 'dark' ? '☀️ Modo claro' : '🌙 Modo oscuro'}
            </button>
            {isAuthenticated ? (
              <button onClick={handleLogout} className="btn-danger w-full">Cerrar sesión</button>
            ) : (
              <>
                <Link to="/login" className="btn-ghost w-full text-center">Iniciar Sesión</Link>
                <Link to="/register" className="btn-primary w-full text-center">Registrarse</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
