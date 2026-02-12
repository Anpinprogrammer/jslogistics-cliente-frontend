import React, { useEffect, useState } from 'react';
import { financeAPI } from '../services/api';
import { FinanceSummary, Transaction } from '../types';
import { formatCOP, formatDateTime } from '../utils/format';
import { StatCard, Spinner, Alert, SectionHeader } from '../components/ui';

const Finances: React.FC = () => {
  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPayment, setShowPayment] = useState(false);
  const [payForm, setPayForm] = useState({ amount: '', reference: '' });
  const [payLoading, setPayLoading] = useState(false);
  const [payError, setPayError] = useState('');
  const [paySuccess, setPaySuccess] = useState('');

  const fetchData = () => {
    setLoading(true);
    Promise.all([financeAPI.summary(), financeAPI.transactions()])
      .then(([s, t]) => { setSummary(s); setTransactions(t); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(payForm.amount);
    if (!amt || amt <= 0) { setPayError('Ingresa un monto válido.'); return; }
    setPayError(''); setPayLoading(true);
    try {
      await financeAPI.registerPayment(amt, payForm.reference);
      setPaySuccess(`Pago de ${formatCOP(amt)} registrado exitosamente.`);
      setShowPayment(false);
      setPayForm({ amount: '', reference: '' });
      fetchData();
    } catch (err: any) {
      setPayError(err.message);
    } finally {
      setPayLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  );

  const balancePositive = (summary?.balance ?? 0) >= 0;

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <SectionHeader
            title="Estado de cuenta"
            subtitle="Historial financiero de tu empresa con JS Logistics"
          />
          <button onClick={() => setShowPayment(true)} className="btn-primary flex-shrink-0">
            + Registrar pago
          </button>
        </div>

        {paySuccess && (
          <div className="mb-6"><Alert type="success" message={paySuccess} /></div>
        )}

        {/* KPI Row */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className={`card p-5 ${!balancePositive ? 'border-red-700/40' : 'border-emerald-700/40'}`}>
            <p className="stat-label">Saldo neto</p>
            <p className={`stat-value mt-2 ${balancePositive ? 'text-emerald-400' : 'text-red-400'}`}>
              {balancePositive ? '+' : '-'}{formatCOP(Math.abs(summary?.balance ?? 0))}
            </p>
            <p className="text-xs text-silver-500 mt-1">
              {balancePositive ? 'JS Logistics te debe' : 'Tú debes a JS Logistics'}
            </p>
          </div>
          <StatCard label="Total facturado" value={formatCOP(summary?.totalCharged ?? 0)} sub="Por servicios de envío" />
          <StatCard label="Total pagado" value={formatCOP(summary?.totalPaid ?? 0)} sub="Pagos registrados" />
          <StatCard label="Cargos pendientes" value={formatCOP(summary?.pendingCharges ?? 0)} sub="Por pagar" accent={!!(summary?.pendingCharges)} />
        </div>

        {/* Credit info */}
        <div className="card p-5 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-mono text-silver-600 uppercase tracking-wider mb-2">Línea de crédito</p>
              <div className="flex items-baseline gap-3">
                <p className="font-display font-700 text-2xl dark:text-white text-gray-600">{formatCOP(summary?.availableCredit ?? 0)}</p>
                <p className="text-sm text-silver-500">disponible de {formatCOP(summary?.creditLimit ?? 0)}</p>
              </div>
            </div>
            {/* Progress bar */}
            <div className="flex-1 max-w-xs">
              <div className="h-2 bg-steel-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-accent-600 to-accent-400 rounded-full transition-all duration-700"
                  style={{
                    width: `${Math.min(100, ((summary?.availableCredit ?? 0) / (summary?.creditLimit ?? 1)) * 100)}%`
                  }}
                />
              </div>
              <p className="text-xs text-silver-600 mt-1 text-right">
                {Math.round(((summary?.availableCredit ?? 0) / (summary?.creditLimit ?? 1)) * 100)}% disponible
              </p>
            </div>
          </div>
        </div>

        {/* Transactions table */}
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-steel-800 flex items-center justify-between">
            <div>
              <h2 className="font-display font-600 dark:text-white text-gray-600">Historial de movimientos</h2>
              <p className="text-xs text-silver-500 mt-0.5">{transactions.length} transacciones</p>
            </div>
          </div>

          {/* Table header */}
          <div className="hidden sm:grid grid-cols-[2fr_1fr_1fr_100px] gap-4 px-5 py-3 border-b border-steel-800 bg-steel-900/50">
            {['Descripción', 'Fecha', 'Monto', 'Estado'].map(h => (
              <p key={h} className="text-xs font-mono dark:text-silver-600 text-white uppercase tracking-wider">{h}</p>
            ))}
          </div>

          {transactions.length === 0 ? (
            <div className="p-10 text-center text-silver-500">No hay transacciones.</div>
          ) : (
            <div className="divide-y divide-steel-800">
              {transactions.map(tx => (
                <div key={tx.id} className="grid sm:grid-cols-[2fr_1fr_1fr_100px] gap-4 px-5 py-4 items-center hover:bg-steel-800/20 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center ${
                      tx.type === 'payment' ? 'bg-emerald-900/40 text-emerald-400' : 'bg-steel-800 text-silver-400'
                    }`}>
                      {tx.type === 'payment'
                        ? <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="20,6 9,17 4,12"/></svg>
                        : <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                      }
                    </div>
                    <div>
                      <p className="text-sm font-600 dark:text-silver-200 text-gray-500">{tx.description}</p>
                      <p className="text-xs text-silver-600 sm:hidden">{formatDateTime(tx.date)}</p>
                    </div>
                  </div>
                  <p className="text-xs text-silver-500 hidden sm:block">{formatDateTime(tx.date)}</p>
                  <p className={`font-display font-700 text-base ${
                    tx.type === 'payment' ? 'text-emerald-400' : 'dark:text-silver-200 text-gray-400'
                  }`}>
                    {tx.type === 'payment' ? '+' : '-'}{formatCOP(tx.amount)}
                  </p>
                  <span className={`badge ${tx.status === 'paid' ? 'badge-paid' : 'badge-unpaid'} hidden sm:inline-flex`}>
                    {tx.status === 'paid' ? 'Pagado' : 'Pendiente'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Payment modal */}
      {showPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="card w-full max-w-md p-7 animate-fade-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-700 text-xl dark:text-white text-gray-600">Registrar pago</h2>
              <button onClick={() => setShowPayment(false)} className="text-silver-500 hover:text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
            {payError && <div className="mb-4"><Alert type="error" message={payError} /></div>}
            <form onSubmit={handlePayment} className="space-y-4">
              <div className="form-group">
                <label className="input-label">Monto (COP) *</label>
                <input
                  type="number"
                  value={payForm.amount}
                  onChange={e => setPayForm(f => ({ ...f, amount: e.target.value }))}
                  className="input"
                  placeholder="500000"
                  min="1000"
                  required
                />
              </div>
              <div className="form-group">
                <label className="input-label">Referencia de pago</label>
                <input
                  type="text"
                  value={payForm.reference}
                  onChange={e => setPayForm(f => ({ ...f, reference: e.target.value }))}
                  className="input"
                  placeholder="Transferencia PSE / Número de consignación"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowPayment(false)} className="btn-ghost flex-1">Cancelar</button>
                <button type="submit" disabled={payLoading} className="btn-primary flex-1">
                  {payLoading ? <Spinner size="sm" /> : 'Registrar pago'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Finances;
