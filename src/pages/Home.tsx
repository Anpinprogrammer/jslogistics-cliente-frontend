import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Receipt, LocateFixed, Headset } from 'lucide-react';
import HeroCarrusel from '../components/HeroCarrusel';
import Navbar from '../components/layout/Navbar';

const services = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
        <path d="M1 3h15v13H1z" /><path d="M16 8h4l3 3v5h-7V8z" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
    title: 'Envío Estándar',
    desc: 'Entregas en 3–5 días hábiles. Cobertura nacional completa con trazabilidad en cada punto.',
    tag: 'Nacional',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
    title: 'Express 48h',
    desc: 'Cuando el tiempo es crítico. Recogida el mismo día y entrega garantizada en 48 horas.',
    tag: 'Express',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
        <circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" />
      </svg>
    ),
    title: 'Internacional',
    desc: 'Operaciones de importación y exportación con gestión aduanera y documentación incluida.',
    tag: 'Internacional',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9,22 9,12 15,12 15,22" />
      </svg>
    ),
    title: 'Almacenamiento',
    desc: 'Bodegas climatizadas con gestión de inventario y despacho programado.',
    tag: 'Logística',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
    title: 'Rastreo en Tiempo Real',
    desc: 'Panel de control con actualizaciones de estado y notificaciones para tu empresa y tus clientes.',
    tag: 'Tecnología',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14,2 14,8 20,8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
    title: 'Facturación Integrada',
    desc: 'Estado de cuenta, historial de facturación y gestión de pagos directamente en tu portal.',
    tag: 'Finanzas',
  },
];

const stats = [
  { value: '+12,000', label: 'Entregas' },
  { value: '99.3%', label: 'Tasa de éxito' },
  { value: '+180', label: 'Ciudades' },
  { value: '24/7', label: 'Soporte' },
];

const features = [
  {
    icon: ShieldCheck,
    title: 'Alta Confiabilidad',
    desc: 'Comprometidos con cada entrega desde la recogida hasta la firma de recibido.',
    color: 'text-sky-500 dark:text-sky-400',
  },
  {
    icon: Receipt,
    title: 'Transparencia Financiera',
    desc: 'Estado de cuenta claro: saldos, facturas y pagos en un solo lugar.',
    color: 'text-emerald-500 dark:text-emerald-400',
  },
  {
    icon: LocateFixed,
    title: 'Trazabilidad Total',
    desc: 'Cada paquete con seguimiento en tiempo real visible para ti y tu cliente.',
    color: 'text-indigo-500 dark:text-indigo-400',
  },
  {
    icon: Headset,
    title: 'Soporte Dedicado',
    desc: 'Ejecutivo de cuenta asignado para empresas con operación activa.',
    color: 'text-cyan-500 dark:text-cyan-400',
  },
];

const Home: React.FC = () => {
  const [guia, setGuia] = useState('');
  const navigate = useNavigate();
  const rastrear = (e: React.FormEvent) => {
    e.preventDefault();
    const q = guia.trim();
    navigate(q ? `/track?n=${encodeURIComponent(q)}` : '/track');
  };

  return (
    <div className="overflow-x-hidden bg-slate-50 dark:bg-slate-950">
      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[90vh] lg:min-h-screen w-full flex flex-col justify-between overflow-hidden bg-slate-950 text-white">
        <HeroCarrusel />
        <Navbar hero />

        {/* Gradiente de desvanecimiento hacia los KPIs */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 h-32 bg-gradient-to-b from-transparent via-slate-950/70 to-slate-950 dark:to-slate-950" aria-hidden="true" />

        <div className="relative z-20 w-full flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 max-w-5xl mx-auto py-12">
          <div className="hero-badge-in inline-flex max-w-full items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-slate-700/60 backdrop-blur-md mb-6">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
            <span className="text-[10px] sm:text-xs font-semibold tracking-widest text-slate-300 uppercase">Plataforma Logística Empresarial</span>
          </div>

          <h1 className="w-full max-w-full break-words text-3xl xs:text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase tracking-tight text-white leading-none mb-6 text-balance">
            Logística que{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-300 to-indigo-400">mueve negocios</span>
          </h1>

          <p className="w-full text-sm sm:text-base md:text-lg lg:text-xl text-slate-300 max-w-2xl font-normal leading-relaxed mb-8 text-balance">
            Conectamos empresas colombianas con sus clientes finales a través de una plataforma de envíos confiable, rastreable y financieramente transparente.
          </p>

          {/* Rastreo rápido: lleva la guía a /track, que ya sabe consultarla */}
          <form onSubmit={rastrear} className="w-full max-w-lg lg:max-w-xl xl:max-w-2xl p-1.5 lg:p-2 rounded-2xl xs:rounded-full bg-slate-900/90 border border-slate-700/80 backdrop-blur-xl shadow-2xl flex flex-col xs:flex-row items-stretch xs:items-center gap-2 mb-8 transition-all">
            <label htmlFor="guiaHero" className="sr-only">Número de guía o pedido</label>
            <input
              id="guiaHero"
              type="text"
              value={guia}
              onChange={e => setGuia(e.target.value)}
              placeholder="Ingresa tu número de guía / pedido..."
              className="w-full xs:w-auto xs:flex-1 min-w-0 bg-transparent px-4 lg:px-6 py-2.5 lg:py-3.5 text-xs sm:text-sm lg:text-base text-white placeholder-slate-400 focus:outline-none"
            />
            <button type="submit" className="w-full xs:w-auto justify-center px-5 lg:px-7 py-2.5 lg:py-3.5 rounded-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs sm:text-sm lg:text-base flex items-center gap-2 transition-all shadow-lg shadow-sky-500/20 active:scale-95 whitespace-nowrap">
              Rastrear envío →
            </button>
          </form>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md">
            <Link to="/register"
              className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-white px-6 lg:px-8 py-3 lg:py-4 text-xs sm:text-sm lg:text-base font-bold text-slate-950 shadow-md transition-all hover:bg-slate-100 active:scale-95 whitespace-nowrap">
              Comenzar ahora
            </Link>
            <a href="#servicios"
              className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-slate-900/60 hover:bg-slate-800/80 border border-slate-700/60 px-6 lg:px-8 py-3 lg:py-4 text-xs sm:text-sm lg:text-base font-semibold text-slate-200 hover:text-white backdrop-blur-md transition-all active:scale-95 whitespace-nowrap">
              Ver servicios
            </a>
          </div>
        </div>

        {/* Indicador de scroll */}
        <a href="#resultados" className="relative z-20 mb-8 flex flex-col items-center gap-1 pb-16 opacity-70 hover:opacity-100 transition-opacity cursor-pointer" aria-label="Ver más contenido">
          <svg className="w-4 h-4 animate-bounce text-sky-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M19 9l-7 7-7-7" />
          </svg>
          <span className="text-[9px] font-bold tracking-widest text-slate-400 uppercase">Ver más</span>
        </a>
      </section>

      {/* ── STATS ─────────────────────────────────────────────────────────── */}
      <section id="resultados" className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 sm:-mt-16 mb-16 lg:mb-24">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="relative p-4 sm:p-6 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl shadow-xl dark:shadow-slate-950/80 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white">
                {stat.value}
              </div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── ABOUT ─────────────────────────────────────────────────────────── */}
      <section id="nosotros" className="relative pb-16 lg:pb-24">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 lg:gap-12 items-center">
            {/* Texto de infraestructura: 7 columnas */}
            <div className="lg:col-span-7">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                Quiénes Somos
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight my-4">
                La infraestructura logística que tu empresa <span className="text-sky-500 dark:text-sky-400">necesita</span>
              </h2>
              <div className="space-y-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300 sm:text-base">
                <p>
                  JS Logistics es una empresa de soluciones logísticas B2B especializada en la gestión de envíos entre empresas y sus clientes finales a lo largo del territorio colombiano.
                </p>
                <p>
                  Proveemos a nuestros clientes empresariales un portal digital donde pueden crear pedidos, hacer seguimiento en tiempo real a cada entrega y gestionar su estado financiero con completa transparencia.
                </p>
                <p>
                  Nuestra red de distribución cubre más de 180 municipios y contamos con centros de operaciones en Cali, Bogotá, Medellín y Barranquilla.
                </p>
              </div>
            </div>

            {/* Beneficios en bento 2×2: 5 columnas */}
            <div className="mt-10 lg:col-span-5 lg:mt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-5">
                {features.map(({ icon: Icon, title, desc, color }) => (
                  <div
                    key={title}
                    className="p-6 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 shadow-md hover:shadow-xl dark:shadow-slate-950/60 hover:border-sky-500/40 transition-all duration-300 group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-sky-500/10 dark:bg-sky-500/20 border border-sky-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Icon className={`w-6 h-6 ${color}`} />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SERVICES ──────────────────────────────────────────────────────── */}
      <section id="servicios" className="section bg-slate-50 dark:bg-slate-950 border-y border-slate-200 dark:border-steel-800">
        <div className="container">
          <div className="text-center mb-14">
            <p className="text-xs font-mono text-sky-600 dark:text-accent-400 uppercase tracking-widest mb-3">Lo que hacemos</p>
            <h2 className="font-display font-700 text-4xl sm:text-5xl text-slate-900 dark:text-white mb-4">Nuestros servicios</h2>
            <p className="text-slate-600 dark:text-silver-400 max-w-xl mx-auto">Soluciones logísticas adaptadas al ritmo de tu operación empresarial.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map(({ icon, title, desc, tag }) => (
              <div key={title} className="card-hover p-6 group">
                <div className="flex items-start justify-between mb-5">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-steel-800 border border-slate-200 dark:border-steel-700 flex items-center justify-center text-slate-500 dark:text-silver-400 group-hover:border-accent-500/40 group-hover:text-accent-400 transition-all duration-300">
                    {icon}
                  </div>
                  <span className="text-xs font-mono text-slate-500 dark:text-steel-500 uppercase tracking-wider">{tag}</span>
                </div>
                <h3 className="font-display font-600 text-lg text-slate-900 dark:text-white mb-2">{title}</h3>
                <p className="text-sm text-slate-500 dark:text-silver-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div className="text-center mb-14">
            <p className="text-xs font-mono text-accent-400 uppercase tracking-widest mb-3">Proceso</p>
            <h2 className="font-display font-700 text-4xl sm:text-5xl dark:text-white text-gray-600">¿Cómo funciona?</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 relative">
            {/* Connector line */}
            <div className="hidden lg:block absolute top-10 left-[calc(12.5%+1rem)] right-[calc(12.5%+1rem)] h-px bg-steel-700" />

            {[
              { step: '01', title: 'Registra tu empresa', desc: 'Crea tu cuenta empresarial en minutos y accede al portal.' },
              { step: '02', title: 'Crea el pedido', desc: 'Ingresa los datos del destinatario, tipo de paquete y servicio.' },
              { step: '03', title: 'Nosotros lo gestionamos', desc: 'Recogemos, transportamos y entregamos con seguimiento completo.' },
              { step: '04', title: 'Facturación automática', desc: 'Cada entrega genera un cargo visible en tu estado de cuenta.' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="relative text-center">
                <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-steel-800 border border-steel-700 flex items-center justify-center">
                  <span className="font-display font-800 text-xl text-accent-400">{step}</span>
                </div>
                <p className="font-display font-600 dark:text-white text-gray-600 mb-2">{title}</p>
                <p className="text-sm text-silver-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div className="card relative overflow-hidden p-8 sm:p-14 text-center" style={{ background: 'linear-gradient(135deg, rgba(30,63,116,0.6) 0%, rgba(37,80,142,0.4) 100%)' }}>
            <div className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(14,165,233,0.4) 0%, transparent 70%)',
              }}
            />
            <div className="relative z-10">
              <p className="text-xs font-mono text-accent-400 uppercase tracking-widest mb-3">Únete hoy</p>
              <h2 className="font-display font-800 text-4xl sm:text-6xl text-white mb-5">
                Lista tu empresa.<br />Envía con confianza.
              </h2>
              <p className="dark:text-silver-400 text-gray-600 max-w-lg mx-auto mb-8">
                Accede al portal empresarial, crea tu primer pedido y experimenta la diferencia de una logística transparente.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/register" className="btn-primary btn-lg">Crear cuenta gratis</Link>
                <Link to="/login" className="btn-ghost btn-lg">Ya tengo cuenta</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CONTACT ───────────────────────────────────────────────────────── */}
      <section id="contacto" className="section border-t border-steel-800 bg-steel-900/20">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <p className="text-xs font-mono text-accent-400 uppercase tracking-widest mb-3">Contáctanos</p>
              <h2 className="font-display font-700 text-4xl text-white mb-5">¿Tienes preguntas?</h2>
              <p className="text-silver-400 mb-8">Nuestro equipo comercial está disponible para ayudarte a configurar tu operación logística.</p>
              <div className="space-y-4">
                {[
                  { label: 'Email comercial', value: 'info@jslogistics.co' },
                  { label: 'Línea directa', value: '+57 601 555 0100' },
                  { label: 'WhatsApp', value: '+57 320 000 1234' },
                  { label: 'Horario', value: 'Lunes a Viernes · 7:00 a.m. – 6:00 p.m.' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex gap-4 items-start">
                    <div className="w-1.5 h-1.5 bg-accent-500 rounded-full mt-2 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-silver-500 uppercase tracking-wider">{label}</p>
                      <p className="text-silver-200 font-600">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact form */}
            <div className="card p-6 sm:p-8">
              <h3 className="font-display font-700 text-xl dark:text-white text-gray-600 mb-6">Envíanos un mensaje</h3>
              <form className="space-y-4" onSubmit={e => { e.preventDefault(); alert('Mensaje enviado. Te contactaremos pronto.'); }}>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="input-label">Nombre</label>
                    <input className="input" placeholder="Tu nombre" required />
                  </div>
                  <div className="form-group">
                    <label className="input-label">Empresa</label>
                    <input className="input" placeholder="Razón social" required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="input-label">Email</label>
                  <input type="email" className="input" placeholder="correo@empresa.com" required />
                </div>
                <div className="form-group">
                  <label className="input-label">Mensaje</label>
                  <textarea className="input resize-none" rows={4} placeholder="Cuéntanos sobre tu operación y necesidades..." required />
                </div>
                <button type="submit" className="btn-primary w-full">Enviar mensaje</button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
