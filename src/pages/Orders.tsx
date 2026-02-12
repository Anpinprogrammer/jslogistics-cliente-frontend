import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ordersAPI } from '../services/api';
import { Order, OrderStatus, CreateOrderPayload } from '../types';
import { formatCOP, formatDate, serviceLabel } from '../utils/format'; //statusLabel
import { StatusBadge, Spinner, EmptyState, Alert, SectionHeader } from '../components/ui';

// ── Orders List ─────────────────────────────────────────────────────────────
export const OrdersList: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersAPI.getAll().then(setOrders).finally(() => setLoading(false));
  }, []);

  const filters: { key: OrderStatus | 'all'; label: string }[] = [
    { key: 'all', label: 'Todos' },
    { key: 'created', label: 'Creados' },
    { key: 'in_transit', label: 'En tránsito' },
    { key: 'out_for_delivery', label: 'En reparto' },
    { key: 'delivered', label: 'Entregados' },
  ];

  const displayed = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <SectionHeader
            title="Mis pedidos"
            subtitle={`${orders.length} pedidos registrados para tu empresa`}
          />
          <Link to="/orders/new" className="btn-primary flex-shrink-0">+ Nuevo pedido</Link>
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {filters.map(({ key, label }) => {
            const count = key === 'all' ? orders.length : orders.filter(o => o.status === key).length;
            return (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-4 py-2 rounded-lg text-sm font-600 transition-all ${
                  filter === key
                    ? 'bg-accent-500/20 text-accent-400 border border-accent-500/40'
                    : 'bg-steel-800/40 dark:text-silver-400 text-white border border-steel-700 hover:border-steel-600 hover:text-silver-200'
                }`}
              >
                {label} <span className="ml-1.5 opacity-60 font-mono text-xs">{count}</span>
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : displayed.length === 0 ? (
          <EmptyState
            message="No hay pedidos"
            sub="Crea tu primer pedido para comenzar"
            action={<Link to="/orders/new" className="btn-primary btn-sm">Crear pedido</Link>}
          />
        ) : (
          <div className="card overflow-hidden">
            {/* Table header */}
            <div className="hidden sm:grid grid-cols-[1fr_1.5fr_1fr_120px_100px_48px] gap-4 px-5 py-3 border-b border-steel-800 bg-steel-900/50">
              {['Rastreo', 'Destinatario', 'Servicio', 'Costo', 'Estado', ''].map(h => (
                <p key={h} className="text-xs font-mono dark:text-silver-600 text-white uppercase tracking-wider">{h}</p>
              ))}
            </div>
            <div className="divide-y divide-steel-800">
              {displayed.map(o => (
                <Link key={o.id} to={`/orders/${o.id}`}
                  className="grid sm:grid-cols-[1fr_1.5fr_1fr_120px_100px_48px] gap-4 px-5 py-4 hover:bg-steel-800/30 transition-colors items-center group">
                  <div>
                    <p className="font-mono text-sm dark:text-silver-200 text-gray-400">{o.trackingNumber}</p>
                    <p className="text-xs text-silver-600">{formatDate(o.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-600 dark:text-silver-200 text-gray-500 truncate">{o.recipientName}</p>
                    <p className="text-xs text-silver-500 truncate">{o.recipientCity}</p>
                  </div>
                  <p className="text-sm text-silver-400 hidden sm:block">{serviceLabel[o.serviceType]?.split(' ')[0]}</p>
                  <p className="text-sm font-600 dark:text-silver-200 text-gray-400 hidden sm:block">{formatCOP(o.shippingCostCOP)}</p>
                  <div className="hidden sm:block"><StatusBadge status={o.status} /></div>
                  <svg className="w-4 h-4 text-steel-600 group-hover:text-accent-400 transition-colors hidden sm:block" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6" /></svg>
                  {/* Mobile summary */}
                  <div className="sm:hidden col-span-full flex items-center justify-between">
                    <StatusBadge status={o.status} />
                    <p className="font-600 dark:text-silver-200 text-gray-400 text-sm">{formatCOP(o.shippingCostCOP)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Order Detail ─────────────────────────────────────────────────────────────
export const OrderDetail: React.FC<{ id: string }> = ({ id }) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    ordersAPI.getById(id)
      .then(setOrder)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (error) return <div className="max-w-2xl mx-auto p-6"><Alert type="error" message={error} /></div>;
  if (!order) return null;

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <Link to="/orders" className="text-sm text-silver-500 hover:text-silver-300 flex items-center gap-1 mb-4">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
            Volver a pedidos
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="font-mono text-lg text-accent-400">{order.trackingNumber}</p>
              <h1 className="font-display font-700 text-3xl dark:text-white text-gray-600">Detalle del pedido</h1>
            </div>
            <StatusBadge status={order.status} />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-5">
          {/* Timeline */}
          <div className="lg:col-span-2 space-y-5">
            <div className="card p-5">
              <h3 className="font-display font-600 dark:text-white text-gray-600 mb-5">Seguimiento</h3>
              <div className="space-y-0">
                {order.timeline.map((event, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 flex-shrink-0 ${
                        event.completed
                          ? 'bg-accent-500/20 border-accent-500 text-accent-400'
                          : 'dark:bg-steel-800 bg-steel-500 dark:border-steel-700 border-steel-400 dark:text-steel-500 text-white'
                      }`}>
                        {event.completed
                          ? <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20,6 9,17 4,12"/></svg>
                          : <span className="text-xs font-mono">{idx + 1}</span>
                        }
                      </div>
                      {idx < order.timeline.length - 1 && (
                        <div className={`w-px flex-1 my-1 min-h-[24px] ${event.completed ? 'bg-accent-500/40' : 'bg-steel-700'}`} />
                      )}
                    </div>
                    <div className={`pb-5 ${idx === order.timeline.length - 1 ? 'pb-0' : ''}`}>
                      <p className={`font-600 text-sm ${event.completed ? 'dark:text-silver-200 text-gray-400' : 'text-silver-600'}`}>{event.event}</p>
                      <p className="text-xs text-silver-600 mt-0.5">{event.location}</p>
                      {event.timestamp && <p className="text-xs text-silver-500 mt-0.5 font-mono">{formatDate(event.timestamp)}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sender / Recipient */}
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="card p-5">
                <p className="text-xs font-mono text-silver-600 uppercase tracking-wider mb-3">Remitente</p>
                <p className="font-600 dark:text-white text-gray-500">{order.senderCompany}</p>
                <p className="text-sm text-silver-400 mt-1">{order.senderContact}</p>
                <p className="text-sm text-silver-500 mt-0.5">{order.senderPhone}</p>
                <p className="text-sm text-silver-500 mt-1 leading-relaxed">{order.senderAddress}</p>
              </div>
              <div className="card p-5">
                <p className="text-xs font-mono text-silver-600 uppercase tracking-wider mb-3">Destinatario</p>
                <p className="font-600 dark:text-white text-gray-500">{order.recipientName}</p>
                <p className="text-sm text-silver-400 mt-1">{order.recipientContact}</p>
                <p className="text-sm text-silver-500 mt-0.5">{order.recipientPhone}</p>
                <p className="text-sm text-silver-500 mt-1 leading-relaxed">{order.recipientAddress}</p>
              </div>
            </div>
          </div>

          {/* Summary sidebar */}
          <div className="space-y-4">
            <div className="card p-5">
              <p className="text-xs font-mono text-silver-600 uppercase tracking-wider mb-4">Resumen financiero</p>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-silver-500">Servicio</span>
                  <span className="dark:text-silver-200 text-gray-400 font-600">{serviceLabel[order.serviceType]?.split(' ')[0]}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-silver-500">Peso</span>
                  <span className="dark:text-silver-200 text-gray-400 font-600">{order.weightKg} kg</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-silver-500">Valor declarado</span>
                  <span className="dark:text-silver-200 text-ragy-400">{formatCOP(order.declaredValueCOP)}</span>
                </div>
                <div className="border-t border-steel-800 pt-3 flex justify-between">
                  <span className="text-silver-400 font-600">Costo de envío</span>
                  <span className="text-accent-400 font-display font-700 text-lg">{formatCOP(order.shippingCostCOP)}</span>
                </div>
              </div>
            </div>

            <div className="card p-5">
              <p className="text-xs font-mono text-silver-600 uppercase tracking-wider mb-4">Detalles del paquete</p>
              <div className="space-y-2 text-sm">
                <p className="text-silver-400">{order.packageDescription}</p>
                <p className="text-silver-500">Dimensiones: {order.dimensionsCm}</p>
                {order.invoiceNumber && (
                  <p className="font-mono text-xs text-silver-600">Factura: {order.invoiceNumber}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Create Order ─────────────────────────────────────────────────────────────
export const CreateOrder: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<CreateOrderPayload>({
    recipientName: '',
    recipientContact: '',
    recipientPhone: '',
    recipientAddress: '',
    recipientCity: '',
    packageDescription: '',
    weightKg: 1,
    dimensionsCm: '',
    declaredValueCOP: 0,
    serviceType: 'standard',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: name === 'weightKg' || name === 'declaredValueCOP' ? parseFloat(value) || 0 : value }));
  };

  const estimatedCost = () => {
    const rates: Record<string, number> = { standard: 8000, express: 15000, 'same-day': 22000, international: 35000 };
    return Math.round((rates[form.serviceType] * form.weightKg + 30000) / 1000) * 1000;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const order = await ordersAPI.create(form);
      navigate(`/orders/${order.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <Link to="/orders" className="text-sm text-silver-500 hover:text-silver-300 flex items-center gap-1 mb-6">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          Volver a pedidos
        </Link>
        <SectionHeader title="Nuevo pedido" subtitle="Completa los datos para registrar el envío" />

        {error && <div className="mb-5"><Alert type="error" message={error} /></div>}

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 space-y-5">
              {/* Recipient */}
              <div className="card p-6">
                <p className="text-xs font-mono text-accent-400 uppercase tracking-widest mb-4">Destinatario final</p>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="input-label">Empresa o nombre *</label>
                    <input name="recipientName" value={form.recipientName} onChange={handleChange} className="input" placeholder="Nombre del destinatario" required />
                  </div>
                  <div className="form-group">
                    <label className="input-label">Persona de contacto *</label>
                    <input name="recipientContact" value={form.recipientContact} onChange={handleChange} className="input" placeholder="Nombre del contacto" required />
                  </div>
                  <div className="form-group">
                    <label className="input-label">Teléfono *</label>
                    <input name="recipientPhone" value={form.recipientPhone} onChange={handleChange} className="input" placeholder="+57 300 000 0000" required />
                  </div>
                  <div className="form-group">
                    <label className="input-label">Ciudad *</label>
                    <input name="recipientCity" value={form.recipientCity} onChange={handleChange} className="input" placeholder="Bogotá" required />
                  </div>
                  <div className="form-group sm:col-span-2">
                    <label className="input-label">Dirección completa *</label>
                    <input name="recipientAddress" value={form.recipientAddress} onChange={handleChange} className="input" placeholder="Calle 10 #20-30, Bogotá D.C." required />
                  </div>
                </div>
              </div>

              {/* Package */}
              <div className="card p-6">
                <p className="text-xs font-mono text-accent-400 uppercase tracking-widest mb-4">Datos del paquete</p>
                <div className="form-grid">
                  <div className="form-group sm:col-span-2">
                    <label className="input-label">Descripción del contenido *</label>
                    <input name="packageDescription" value={form.packageDescription} onChange={handleChange} className="input" placeholder="Ej: Repuestos electrónicos – 3 cajas" required />
                  </div>
                  <div className="form-group">
                    <label className="input-label">Peso en kg *</label>
                    <input name="weightKg" type="number" value={form.weightKg} onChange={handleChange} className="input" min="0.1" step="0.1" required />
                  </div>
                  <div className="form-group">
                    <label className="input-label">Dimensiones (cm)</label>
                    <input name="dimensionsCm" value={form.dimensionsCm} onChange={handleChange} className="input" placeholder="40x30x25" />
                  </div>
                  <div className="form-group">
                    <label className="input-label">Valor declarado (COP)</label>
                    <input name="declaredValueCOP" type="number" value={form.declaredValueCOP || ''} onChange={handleChange} className="input" placeholder="1500000" min="0" />
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar – service selector + cost */}
            <div className="space-y-4">
              <div className="card p-5">
                <p className="text-xs font-mono text-silver-600 uppercase tracking-wider mb-4">Tipo de servicio</p>
                <div className="space-y-2">
                  {(['standard', 'express', 'same-day', 'international'] as const).map(s => (
                    <label key={s} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      form.serviceType === s ? 'border-accent-500/60 bg-accent-500/10' : 'border-steel-700 hover:border-steel-600'
                    }`}>
                      <input type="radio" name="serviceType" value={s} checked={form.serviceType === s} onChange={handleChange} className="mt-0.5 accent-sky-500" />
                      <div>
                        <p className="text-sm font-600 dark:text-silver-200 text-gray-400">{serviceLabel[s]}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="card p-5 border-accent-500/30">
                <p className="text-xs font-mono text-silver-600 uppercase tracking-wider mb-3">Costo estimado</p>
                <p className="font-display font-800 text-3xl text-accent-400">{formatCOP(estimatedCost())}</p>
                <p className="text-xs text-silver-600 mt-2">*Precio final según tarifario vigente</p>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? <Spinner size="sm" /> : 'Confirmar pedido'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
