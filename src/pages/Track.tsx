import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ordersAPI } from '../services/api';
import { Order } from '../types';
import { formatDateTime, serviceLabel } from '../utils/format'; //formatCOP, statusLabel 
import { StatusBadge, Spinner, Alert } from '../components/ui';

const Track: React.FC = () => {
  const [params] = useSearchParams();
  const [query, setQuery] = useState(params.get('n') || '');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    const n = params.get('n');
    if (n) handleSearch(n);
    // eslint-disable-next-line
  }, []);

  const handleSearch = async (num?: string) => {
    const trackNum = (num ?? query).trim();
    if (!trackNum) return;
    setError(''); setOrder(null); setLoading(true); setSearched(true);
    try {
      const o = await ordersAPI.track(trackNum);
      setOrder(o);
    } catch (err: any) {
      setError('No se encontró el número de rastreo. Verifica e intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); handleSearch(); };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 10%, rgba(14,165,233,0.08) 0%, transparent 60%)' }} />

      <div className="max-w-3xl mx-auto relative">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 dark:bg-steel-800/60 bg-gray-300 border dark:border-steel-700 border-white rounded-full px-4 py-1.5 mb-5">
            <span className="w-1.5 h-1.5 dark:bg-accent-400 bg-white rounded-full" />
            <span className="text-xs font-mono dark:text-silver-400 text-white tracking-wider">RASTREO PÚBLICO</span>
          </div>
          <h1 className="font-display font-800 text-4xl sm:text-5xl dark:text-white text-gray-500 mb-3">Rastrear envío</h1>
          <p className="text-silver-400">Ingresa el número de rastreo para ver el estado de tu paquete</p>
        </div>

        {/* Search box */}
        <form onSubmit={handleSubmit} className="card p-5 mb-8 flex gap-3">
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="input flex-1 font-mono text-base"
            placeholder="JSL-2026-0001"
          />
          <button type="submit" disabled={loading} className="btn-primary flex-shrink-0 px-8">
            {loading ? <Spinner size="sm" /> : 'Rastrear'}
          </button>
        </form>

        {/* Demo hint */}
        {!searched && (
          <p className="text-center text-xs text-silver-600 font-mono mb-8">
            Prueba con: JSL-2026-0001 · JSL-2026-0008 · JSL-2026-0003
          </p>
        )}

        {error && <div className="mb-6"><Alert type="error" message={error} /></div>}

        {/* Result */}
        {order && (
          <div className="space-y-5 animate-fade-up">
            {/* Header card */}
            <div className="card p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                <div>
                  <p className="text-xs font-mono text-silver-600 mb-1">NÚMERO DE RASTREO</p>
                  <p className="font-mono text-xl text-accent-400 font-700">{order.trackingNumber}</p>
                </div>
                <StatusBadge status={order.status} />
              </div>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-silver-600 mb-0.5">De</p>
                  <p className="font-600 dark:text-silver-200 text-gray-500">{order.senderCompany}</p>
                  <p className="text-silver-400">{order.senderAddress}</p>
                </div>
                <div>
                  <p className="text-silver-600 mb-0.5">Para</p>
                  <p className="font-600 dark:text-silver-200 text-gray-500">{order.recipientName}</p>
                  <p className="text-silver-400">{order.recipientAddress}</p>
                </div>
              </div>
            </div>

            {/* Delivery info */}
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="card p-4 text-center">
                <p className="text-xs font-mono text-silver-600 mb-1.5">SERVICIO</p>
                <p className="font-display font-700 dark:text-white text-gray-400">{serviceLabel[order.serviceType]?.split(' ')[0]}</p>
              </div>
              <div className="card p-4 text-center">
                <p className="text-xs font-mono text-silver-600 mb-1.5">CREADO</p>
                <p className="font-600 dark:text-silver-200 text-gray-400 text-sm">{formatDateTime(order.createdAt)}</p>
              </div>
              <div className="card p-4 text-center">
                <p className="text-xs font-mono text-silver-600 mb-1.5">
                  {order.deliveredAt ? 'ENTREGADO' : 'ENTREGA EST.'}
                </p>
                <p className="font-600 dark:text-silver-200 text-gray-400 text-sm">
                  {formatDateTime(order.deliveredAt || order.estimatedDelivery)}
                </p>
              </div>
            </div>

            {/* Timeline */}
            <div className="card p-6">
              <h3 className="font-display font-600 dark:text-white text-gray-600 mb-6">Seguimiento del envío</h3>
              <div>
                {order.timeline.map((ev, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 flex-shrink-0 ${
                        ev.completed
                          ? idx === order.timeline.findLastIndex(t => t.completed)
                            ? 'bg-accent-500/30 border-accent-500 text-accent-400 shadow-accent'
                            : 'bg-accent-500/20 border-accent-500/60 text-accent-400'
                          : 'dark:bg-steel-800 bg-steel-500 dark:border-steel-700 border-steel-400 text-steel-600'
                      }`}>
                        {ev.completed
                          ? <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20,6 9,17 4,12"/></svg>
                          : <div className="w-2 h-2 rounded-full bg-steel-600" />
                        }
                      </div>
                      {idx < order.timeline.length - 1 && (
                        <div className={`w-px flex-1 my-1 min-h-[28px] ${ev.completed ? 'bg-accent-500/30' : 'bg-steel-800'}`} />
                      )}
                    </div>
                    <div className={`pb-6 ${idx === order.timeline.length - 1 ? 'pb-0' : ''}`}>
                      <p className={`font-600 text-sm ${ev.completed ? 'dark:text-silver-100 text-gray-400' : 'text-steel-600'}`}>
                        {ev.event}
                      </p>
                      <p className={`text-xs mt-0.5 ${ev.completed ? 'text-silver-500' : 'text-steel-700'}`}>{ev.location}</p>
                      {ev.timestamp && (
                        <p className="text-xs text-silver-600 mt-1 font-mono">{formatDateTime(ev.timestamp)}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Track;
