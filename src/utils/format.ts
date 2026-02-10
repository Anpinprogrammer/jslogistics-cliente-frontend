export const formatCOP = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n);

export const formatDate = (iso: string) =>
  new Intl.DateTimeFormat('es-CO', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(iso));

export const formatDateTime = (iso: string) =>
  new Intl.DateTimeFormat('es-CO', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(iso));

export const statusLabel: Record<string, string> = {
  created:           'Creado',
  picked_up:         'Recogido',
  in_transit:        'En tránsito',
  out_for_delivery:  'En reparto',
  delivered:         'Entregado',
  cancelled:         'Cancelado',
};

export const serviceLabel: Record<string, string> = {
  standard:      'Estándar (5 días)',
  express:       'Express (2 días)',
  'same-day':    'Mismo día',
  international: 'Internacional (10 días)',
};

export const statusIcon: Record<string, string> = {
  created:           '📋',
  picked_up:         '📦',
  in_transit:        '🚚',
  out_for_delivery:  '🛵',
  delivered:         '✅',
  cancelled:         '❌',
};
