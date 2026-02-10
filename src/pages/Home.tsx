import React from 'react';
import { Link } from 'react-router-dom';

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
  { value: '+12,000', label: 'Entregas mensuales' },
  { value: '99.3%', label: 'Tasa de éxito' },
  { value: '+180', label: 'Ciudades cubiertas' },
  { value: '24/7', label: 'Soporte operativo' },
];

const Home: React.FC = () => {
  return (
    <div className="overflow-x-hidden">
      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-hero-mesh opacity-80" />
        <div className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(ellipse at 50% 0%, rgba(14,165,233,0.1) 0%, transparent 60%)',
          }}
        />
        {/* Animated grid */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(rgba(148,176,207,1) 1px, transparent 1px), linear-gradient(90deg, rgba(148,176,207,1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-accent-500/10 border border-accent-500/30 rounded-full px-4 py-1.5 mb-8 animate-fade-up">
            <span className="w-1.5 h-1.5 bg-accent-400 rounded-full animate-pulse-slow" />
            <span className="text-xs font-mono text-accent-400 tracking-wider">PLATAFORMA LOGÍSTICA EMPRESARIAL</span>
          </div>

          <h1 className="font-display font-800 text-5xl sm:text-7xl lg:text-8xl text-white leading-[0.95] tracking-tight mb-6 animate-fade-up animate-delay-100">
            LOGÍSTICA QUE
            <br />
            <span className="text-transparent bg-clip-text"
              style={{ backgroundImage: 'linear-gradient(90deg, #38bdf8, #5487c0, #88aed8)' }}>
              MUEVE NEGOCIOS
            </span>
          </h1>

          <p className="text-silver-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-up animate-delay-200">
            Conectamos empresas colombianas con sus clientes finales a través de una plataforma de envíos confiable, rastreable y financieramente transparente.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up animate-delay-300">
            <Link to="/register" className="btn-primary btn-lg w-full sm:w-auto">
              Comenzar ahora
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <Link to="/track" className="btn-ghost btn-lg w-full sm:w-auto">Rastrear envío</Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-silver-600 animate-bounce">
          <span className="text-xs font-mono tracking-widest">VER MAS</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* ── STATS ─────────────────────────────────────────────────────────── */}
      <section className="py-16 px-4 border-y border-steel-800 bg-steel-900/30">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="font-display font-800 text-3xl sm:text-4xl text-accent-400 mb-1">{value}</p>
              <p className="text-xs font-mono text-silver-500 uppercase tracking-widest">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── ABOUT ─────────────────────────────────────────────────────────── */}
      <section id="nosotros" className="section">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-xs font-mono text-accent-400 uppercase tracking-widest mb-3">Quiénes somos</p>
              <h2 className="font-display font-700 text-4xl sm:text-5xl text-white leading-tight mb-6">
                La infraestructura logística que tu empresa necesita
              </h2>
              <div className="divider mb-6" />
              <div className="space-y-4 text-silver-400 leading-relaxed">
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

            {/* Feature grid */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: '🎯', title: 'Alta confiabilidad', desc: 'Comprometidos con cada entrega desde la recogida hasta la firma de recibido.' },
                { icon: '📊', title: 'Transparencia financiera', desc: 'Estado de cuenta claro: saldos, facturas y pagos en un solo lugar.' },
                { icon: '🔍', title: 'Trazabilidad total', desc: 'Cada paquete con seguimiento en tiempo real visible para ti y tu cliente.' },
                { icon: '🤝', title: 'Soporte dedicado', desc: 'Ejecutivo de cuenta asignado para empresas con operación activa.' },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="card p-5">
                  <div className="text-2xl mb-3">{icon}</div>
                  <p className="font-display font-600 text-white text-sm mb-1">{title}</p>
                  <p className="text-xs text-silver-500 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── SERVICES ──────────────────────────────────────────────────────── */}
      <section id="servicios" className="section bg-steel-900/20 border-y border-steel-800">
        <div className="container">
          <div className="text-center mb-14">
            <p className="text-xs font-mono text-accent-400 uppercase tracking-widest mb-3">Lo que hacemos</p>
            <h2 className="font-display font-700 text-4xl sm:text-5xl text-white mb-4">Nuestros servicios</h2>
            <p className="text-silver-400 max-w-xl mx-auto">Soluciones logísticas adaptadas al ritmo de tu operación empresarial.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map(({ icon, title, desc, tag }) => (
              <div key={title} className="card-hover p-6 group">
                <div className="flex items-start justify-between mb-5">
                  <div className="w-12 h-12 rounded-xl bg-steel-800 border border-steel-700 flex items-center justify-center text-silver-400 group-hover:border-accent-500/40 group-hover:text-accent-400 transition-all duration-300">
                    {icon}
                  </div>
                  <span className="text-xs font-mono text-steel-500 uppercase tracking-wider">{tag}</span>
                </div>
                <h3 className="font-display font-600 text-lg text-white mb-2">{title}</h3>
                <p className="text-sm text-silver-500 leading-relaxed">{desc}</p>
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
            <h2 className="font-display font-700 text-4xl sm:text-5xl text-white">¿Cómo funciona?</h2>
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
                <p className="font-display font-600 text-white mb-2">{title}</p>
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
              <p className="text-silver-400 max-w-lg mx-auto mb-8">
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
              <h3 className="font-display font-700 text-xl text-white mb-6">Envíanos un mensaje</h3>
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
