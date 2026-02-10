import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => (
  <footer className="border-t border-steel-800 bg-steel-950 mt-16">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
        {/* Brand */}
        <div className="lg:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-steel-gradient flex items-center justify-center border border-steel-600">
              <svg viewBox="0 0 24 24" className="w-4 h-4 text-accent-400" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" />
                <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
              </svg>
            </div>
            <span className="font-display font-700 text-white">JS LOGISTICS</span>
          </div>
          <p className="text-sm text-silver-500 leading-relaxed">
            Soluciones de logística empresarial con alta confiabilidad y trazabilidad en tiempo real.
          </p>
        </div>

        {/* Quick links */}
        <div>
          <p className="text-xs font-700 text-silver-400 uppercase tracking-widest mb-4">Empresa</p>
          <ul className="space-y-2.5">
            {['Nosotros', 'Servicios', 'Contacto'].map(l => (
              <li key={l}><a href={`/#${l.toLowerCase()}`} className="text-sm text-silver-500 hover:text-silver-200 transition-colors">{l}</a></li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-700 text-silver-400 uppercase tracking-widest mb-4">Plataforma</p>
          <ul className="space-y-2.5">
            {[
              { to: '/login', label: 'Iniciar Sesión' },
              { to: '/register', label: 'Registrarse' },
              { to: '/track', label: 'Rastrear Envío' },
            ].map(l => (
              <li key={l.to}><Link to={l.to} className="text-sm text-silver-500 hover:text-silver-200 transition-colors">{l.label}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-700 text-silver-400 uppercase tracking-widest mb-4">Contacto</p>
          <ul className="space-y-2.5 text-sm text-silver-500">
            <li>info@jslogistics.co</li>
            <li>+57 601 555 0100</li>
            <li>Cali, Valle del Cauca</li>
            <li className="text-silver-600">Lun–Vie · 7:00–18:00</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-steel-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-silver-600">
        <p>© {new Date().getFullYear()} JS Logistics S.A.S. Todos los derechos reservados.</p>
        <p className="font-mono">NIT 900.000.001-0</p>
      </div>
    </div>
  </footer>
);

export default Footer;
