import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { financeAPI, ordersAPI } from '../services/api';
import { FinanceSummary, Order } from '../types';
import { formatCOP, formatDateTime} from '../utils/format'; // statusLabel, serviceLabel 
import { StatCard, Spinner, StatusBadge } from '../components/ui';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([financeAPI.summary(), ordersAPI.getAll()])
      .then(([s, o]) => { setSummary(s); setOrders(o.slice(0, 5)); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  );

  const balancePositive = (summary?.balance ?? 0) >= 0;

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8 animate-fade-up">
          <p className="text-xs font-mono text-accent-400 uppercase tracking-widest mb-1">Panel principal</p>
          <h1 className="font-display font-800 text-3xl sm:text-4xl text-white">
            Bienvenido, {user?.name?.split(' ')[0]}
          </h1>
          <p className="text-silver-500 text-sm mt-1">{user?.company}</p>
        </div>

        {/* KPI Row */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-fade-up animate-delay-100">
          <StatCard
            label="Saldo neto"
            value={formatCOP(Math.abs(summary?.balance ?? 0))}
            sub={balancePositive ? 'JS Logistics te debe a ti' : 'Deuda con JS Logistics'}
            accent={!balancePositive}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
              </svg>
            }
          />
          <StatCard
            label="Pedidos activos"
            value={summary?.activeOrders ?? 0}
            sub="En proceso ahora"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M1 3h15v13H1z" /><path d="M16 8h4l3 3v5h-7V8z" />
              </svg>
            }
          />
          <StatCard
            label="Entregados"
            value={summary?.deliveredOrders ?? 0}
            sub="Pedidos completados"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <polyline points="20,6 9,17 4,12" />
              </svg>
            }
          />
          <StatCard
            label="Cargos pendientes"
            value={formatCOP(summary?.pendingCharges ?? 0)}
            sub={`Crédito disponible: ${formatCOP(summary?.availableCredit ?? 0)}`}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" />
              </svg>
            }
          />
        </div>

        {/* Balance banner */}
        <div className={`rounded-xl border px-5 py-4 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-up animate-delay-200 ${
          balancePositive
            ? 'bg-emerald-900/20 border-emerald-700/40'
            : 'bg-red-900/20 border-red-700/40'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${balancePositive ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
              <span className="text-xl">{balancePositive ? '✅' : '⚠️'}</span>
            </div>
            <div>
              <p className={`font-display font-600 text-lg ${balancePositive ? 'text-emerald-300' : 'text-red-300'}`}>
                {balancePositive
                  ? `JS Logistics te debe ${formatCOP(summary?.balance ?? 0)}`
                  : `Debes ${formatCOP(Math.abs(summary?.balance ?? 0))} a JS Logistics`
                }
              </p>
              <p className="text-xs text-silver-500">
                {balancePositive
                  ? 'Tienes un crédito a favor. Puede aplicarse a futuros envíos.'
                  : 'Tienes cargos pendientes de pago por servicios de envío.'}
              </p>
            </div>
          </div>
          <Link to="/finances" className="btn-steel btn-sm flex-shrink-0">Ver estado de cuenta</Link>
        </div>

        {/* Quick actions */}
        <div className="grid sm:grid-cols-2 gap-4 mb-8 animate-fade-up animate-delay-200">
          <Link to="/orders/new" className="card-hover p-6 flex items-center gap-4 group">
            <div className="w-12 h-12 rounded-xl bg-accent-500/20 border border-accent-500/30 flex items-center justify-center text-accent-400 group-hover:bg-accent-500/30 transition-colors flex-shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </div>
            <div>
              <p className="font-display font-600 text-white">Crear nuevo pedido</p>
              <p className="text-sm text-silver-500">Registra un envío para tu cliente</p>
            </div>
            <svg className="w-5 h-5 text-steel-500 ml-auto group-hover:text-accent-400 transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>

          <Link to="/track" className="card-hover p-6 flex items-center gap-4 group">
            <div className="w-12 h-12 rounded-xl bg-steel-800 border border-steel-700 flex items-center justify-center text-silver-400 group-hover:border-accent-500/40 group-hover:text-accent-400 transition-colors flex-shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <div>
              <p className="font-display font-600 text-white">Rastrear envío</p>
              <p className="text-sm text-silver-500">Busca por número de rastreo</p>
            </div>
            <svg className="w-5 h-5 text-steel-500 ml-auto group-hover:text-accent-400 transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Recent orders */}
        <div className="card animate-fade-up animate-delay-300">
          <div className="p-5 border-b border-steel-800 flex items-center justify-between">
            <div>
              <h2 className="font-display font-600 text-white">Pedidos recientes</h2>
              <p className="text-xs text-silver-500 mt-0.5">Últimos {orders.length} pedidos</p>
            </div>
            <Link to="/orders" className="btn-ghost btn-sm">Ver todos</Link>
          </div>
          {orders.length === 0 ? (
            <div className="p-10 text-center text-silver-500">No hay pedidos aún.</div>
          ) : (
            <div className="divide-y divide-steel-800">
              {orders.map(o => (
                <Link key={o.id} to={`/orders/${o.id}`} className="flex items-center gap-4 px-5 py-4 hover:bg-steel-800/30 transition-colors group">
                  <div className="hidden sm:flex w-10 h-10 rounded-lg bg-steel-800 items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-silver-500" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path d="M20 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-mono text-sm text-silver-200 truncate">{o.trackingNumber}</p>
                      <StatusBadge status={o.status} />
                    </div>
                    <p className="text-xs text-silver-500 truncate">
                      → {o.recipientName} · {o.recipientCity}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-600 text-silver-200">{formatCOP(o.shippingCostCOP)}</p>
                    <p className="text-xs text-silver-600">{formatDateTime(o.createdAt)}</p>
                  </div>
                  <svg className="w-4 h-4 text-steel-600 group-hover:text-accent-400 transition-colors flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
