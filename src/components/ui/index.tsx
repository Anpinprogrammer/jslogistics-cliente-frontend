import React from 'react';
import { OrderStatus, PaymentStatus } from '../../types';
import { statusLabel } from '../../utils/format';

// ── StatusBadge ──────────────────────────────────────────────────────────────
export const StatusBadge: React.FC<{ status: OrderStatus }> = ({ status }) => (
  <span className={`badge badge-${status}`}>{statusLabel[status] || status}</span>
);

export const PaymentBadge: React.FC<{ status: PaymentStatus }> = ({ status }) => {
  const map: Record<PaymentStatus, { cls: string; label: string }> = {
    paid:     { cls: 'badge-paid',    label: 'Pagado' },
    pending:  { cls: 'badge-pending', label: 'Pendiente' },
    credited: { cls: 'badge-paid',    label: 'Acreditado' },
  };
  const { cls, label } = map[status] || { cls: 'badge-pending', label: status };
  return <span className={`badge ${cls}`}>{label}</span>;
};

// ── StatCard ─────────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
  icon?: React.ReactNode;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, sub, accent, icon }) => (
  <div className={`card p-5 flex flex-col gap-3 ${accent ? 'card-accent' : ''}`}>
    <div className="flex items-start justify-between">
      <p className="stat-label">{label}</p>
      {icon && <div className="text-silver-500">{icon}</div>}
    </div>
    <p className={`stat-value ${accent ? 'text-accent-400' : ''}`}>{value}</p>
    {sub && <p className="text-xs text-silver-500">{sub}</p>}
  </div>
);

// ── SectionHeader ─────────────────────────────────────────────────────────────
export const SectionHeader: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => (
  <div className="mb-10">
    <h2 className="text-3xl sm:text-4xl font-display font-700 dark:text-white text-gray-600 mb-2">{title}</h2>
    {subtitle && <p className="text-silver-400 text-sm max-w-xl">{subtitle}</p>}
    <div className="divider mt-3" />
  </div>
);

// ── Spinner ───────────────────────────────────────────────────────────────────
export const Spinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const s = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' }[size];
  return <div className={`${s} border-2 border-steel-700 border-t-accent-500 rounded-full animate-spin`} />;
};

// ── EmptyState ────────────────────────────────────────────────────────────────
export const EmptyState: React.FC<{ message: string; sub?: string; action?: React.ReactNode }> = ({ message, sub, action }) => (
  <div className="card py-16 flex flex-col items-center gap-4 text-center">
    <div className="w-14 h-14 rounded-xl bg-steel-800 flex items-center justify-center">
      <svg className="w-7 h-7 text-steel-500" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M20 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" />
        <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
      </svg>
    </div>
    <div>
      <p className="font-600 text-silver-300">{message}</p>
      {sub && <p className="text-sm text-silver-500 mt-1">{sub}</p>}
    </div>
    {action && <div className="mt-2">{action}</div>}
  </div>
);

// ── Alert ─────────────────────────────────────────────────────────────────────
export const Alert: React.FC<{ type: 'error' | 'success' | 'info'; message: string }> = ({ type, message }) => {
  const styles = {
    error:   'bg-red-900/20 border-danger/40 text-red-300',
    success: 'bg-emerald-900/20 border-emerald-600/40 text-emerald-300',
    info:    'bg-steel-800/60 border-steel-600 text-silver-300',
  };
  return (
    <div className={`border rounded-lg px-4 py-3 text-sm font-body ${styles[type]}`}>
      {message}
    </div>
  );
};
