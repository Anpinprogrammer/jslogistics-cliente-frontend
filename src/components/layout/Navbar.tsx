import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
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
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'bg-steel-950/95 shadow-steel backdrop-blur-md border-b border-steel-800' : 'bg-transparent'}`}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-lg bg-steel-gradient flex items-center justify-center border border-steel-600 shadow-steel group-hover:border-accent-500 transition-colors">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-accent-400" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" />
              <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
            </svg>
          </div>
          <div>
            <span className="font-display font-800 text-lg text-white tracking-wide">JS</span>
            <span className="font-display font-400 text-lg text-silver-400 tracking-wider"> LOGISTICS</span>
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
                  ? 'text-accent-400 bg-accent-500/10'
                  : 'text-silver-400 hover:text-silver-100 hover:bg-steel-800'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <div className="text-right mr-1">
                <p className="text-sm font-600 text-silver-200">{user?.name}</p>
                <p className="text-xs text-silver-500">{user?.company}</p>
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
        <button className="md:hidden p-2 text-silver-400 hover:text-white" onClick={() => setMobileOpen(v => !v)}>
          {mobileOpen
            ? <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
            : <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
          }
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-steel-950/98 border-t border-steel-800 px-4 py-4 space-y-1 backdrop-blur-md">
          {navLinks.map(({ to, label }) => (
            <Link key={to} to={to} className="block px-4 py-3 text-sm font-600 text-silver-300 hover:text-white hover:bg-steel-800 rounded-lg">
              {label}
            </Link>
          ))}
          <div className="pt-3 border-t border-steel-800 flex flex-col gap-2">
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
