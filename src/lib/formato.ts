/** Formatos de la app actual (app.js): pesos, horas y días en hora de Colombia. */
const ZONA = 'America/Bogota';

export const ms = (iso: string | number | null | undefined) =>
  iso == null ? 0 : typeof iso === 'number' ? iso : new Date(iso).getTime();

export const pesos = (n: number) => '$ ' + Math.round(Number(n) || 0).toLocaleString('es-CO');
export const pesosConSigno = (n: number) => '$ ' + (n > 0 ? '+' : '') + Math.round(Number(n) || 0).toLocaleString('es-CO');

/** Día AAAA-MM-DD en hora de Colombia. */
export const diaDe = (f: string | number) => new Date(ms(f)).toLocaleDateString('en-CA', { timeZone: ZONA });
export const hoy = () => diaDe(Date.now());

export const hora = (f: string | number) =>
  new Date(ms(f)).toLocaleString('es-CO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: ZONA });

export const fechaLarga = (d: string) =>
  new Date(d + 'T12:00:00-05:00').toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: ZONA });

export const diaCorto = (d: string) =>
  new Date(d + 'T12:00:00-05:00').toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short', timeZone: ZONA });

export function moverDia(d: string, n: number) {
  const x = new Date((d || hoy()) + 'T12:00:00-05:00');
  x.setUTCDate(x.getUTCDate() + n);
  return diaDe(x.getTime());
}

export const pct = (a: number, b: number) => (b ? Math.round((a * 100) / b) : 0);
