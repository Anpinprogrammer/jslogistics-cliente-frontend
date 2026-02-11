import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Alert, Spinner } from '../components/ui';

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from || '/dashboard';

  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 30% 40%, rgba(30,63,116,0.4) 0%, transparent 60%)' }}
      />

      <div className="relative w-full max-w-md animate-fade-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-steel-gradient border border-steel-600 items-center justify-center mb-4">
            {/**
             * <svg viewBox="0 0 24 24" className="w-7 h-7 text-accent-400" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" />
              <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
            </svg>
             */}
            <img src="/img/logo.png" alt="logo" />
          </div>
          <h1 className="font-display font-700 text-2xl text-white">Portal Empresarial</h1>
          <p className="text-sm text-silver-500 mt-1">JS Logistics – Acceso de clientes</p>
        </div>

        <div className="card p-8">
          <h2 className="font-display font-700 text-xl text-white mb-1">Iniciar sesión</h2>
          <p className="text-sm text-silver-500 mb-6">Ingresa con las credenciales de tu empresa</p>

          {/* Demo hint */}
          <div className="bg-steel-800/60 border border-steel-700 rounded-lg p-3 mb-6">
            <p className="text-xs font-mono text-silver-500 mb-1.5">DEMO · Credenciales de prueba:</p>
            <p className="text-xs text-silver-400">carlos@techparts.co · <span className="font-mono">password123</span></p>
          </div>

          {error && <div className="mb-4"><Alert type="error" message={error} /></div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-group">
              <label className="input-label">Correo electrónico</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className="input"
                placeholder="correo@empresa.com"
                required
                autoComplete="email"
              />
            </div>
            <div className="form-group">
              <label className="input-label">Contraseña</label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                className="input"
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? <Spinner size="sm" /> : 'Ingresar al portal'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-silver-500 mt-6">
          ¿Tu empresa aún no tiene acceso?{' '}
          <Link to="/register" className="text-accent-400 hover:text-accent-300 font-600">
            Registrarse
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
