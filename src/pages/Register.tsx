import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Alert, Spinner } from '../components/ui';

const Register: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', company: '', email: '', password: '', confirmPassword: '', phone: '', address: '', nit: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { setError('Las contraseñas no coinciden.'); return; }
    if (form.password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres.'); return; }
    setError(''); setLoading(true);
    try {
      const { confirmPassword, ...payload } = form;
      await register(payload);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="fixed inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 70% 40%, rgba(30,63,116,0.4) 0%, transparent 60%)' }}
      />
      <div className="relative w-full max-w-2xl animate-fade-up">
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-steel-gradient border border-steel-600 items-center justify-center mb-4">
            {/**
             * <svg viewBox="0 0 24 24" className="w-7 h-7 text-accent-400" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" />
              <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
            </svg>
             */}
            <img src="/img/logo.png" alt="" />
          </div>
          <h1 className="font-display font-700 text-2xl text-white">Registro empresarial</h1>
          <p className="text-sm text-silver-500 mt-1">Crea la cuenta de tu empresa en JS Logistics</p>
        </div>

        <div className="card p-8">
          <h2 className="font-display font-700 text-xl dark:text-white text-gray-600  mb-6">Datos de la empresa</h2>
          {error && <div className="mb-5"><Alert type="error" message={error} /></div>}

          <form onSubmit={handleSubmit}>
            {/* Company */}
            <div className="mb-5">
              <h3 className="text-xs font-mono text-accent-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-accent-500/20 inline-flex items-center justify-center text-accent-400">1</span>
                Información de contacto
              </h3>
              <div className="form-grid">
                <div className="form-group">
                  <label className="input-label">Nombre del representante *</label>
                  <input name="name" value={form.name} onChange={handleChange} className="input" placeholder="Carlos Mendoza" required />
                </div>
                <div className="form-group">
                  <label className="input-label">Razón social *</label>
                  <input name="company" value={form.company} onChange={handleChange} className="input" placeholder="Mi Empresa S.A.S" required />
                </div>
                <div className="form-group">
                  <label className="input-label">Teléfono *</label>
                  <input name="phone" value={form.phone} onChange={handleChange} className="input" placeholder="+57 300 000 0000" required />
                </div>
                <div className="form-group">
                  <label className="input-label">NIT</label>
                  <input name="nit" value={form.nit} onChange={handleChange} className="input" placeholder="900.000.000-0" />
                </div>
                <div className="form-group sm:col-span-2">
                  <label className="input-label">Dirección</label>
                  <input name="address" value={form.address} onChange={handleChange} className="input" placeholder="Calle 10 #20-30, Cali, Valle del Cauca" />
                </div>
              </div>
            </div>

            {/* Credentials */}
            <div className="mb-6">
              <h3 className="text-xs font-mono text-accent-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-accent-500/20 inline-flex items-center justify-center text-accent-400">2</span>
                Credenciales de acceso
              </h3>
              <div className="form-grid">
                <div className="form-group sm:col-span-2">
                  <label className="input-label">Correo electrónico *</label>
                  <input name="email" type="email" value={form.email} onChange={handleChange} className="input" placeholder="operaciones@empresa.com" required />
                </div>
                <div className="form-group">
                  <label className="input-label">Contraseña *</label>
                  <input name="password" type="password" value={form.password} onChange={handleChange} className="input" placeholder="Mínimo 6 caracteres" required />
                </div>
                <div className="form-group">
                  <label className="input-label">Confirmar contraseña *</label>
                  <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} className="input" placeholder="Repetir contraseña" required />
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? <Spinner size="sm" /> : 'Registrar empresa'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-silver-500 mt-6">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-accent-400 hover:text-accent-300 font-600">Iniciar sesión</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
