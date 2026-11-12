/* Notificaciones del portal del cliente: se derivan de sus solicitudes (no hay una tabla de avisos) y el estado de
   "leído" vive en localStorage. La clave incluye estado y `actualizado`, así un cambio nuevo vuelve a avisar aunque
   sea la misma solicitud. */
import { useSyncExternalStore } from 'react';
import { pesos } from '../../lib/formato';
import type { SolicitudCliente } from '../../types/dominio';

const CLAVE = 'jsl_cliente_notif_leidas_v1';
const MAX = 400;
const oyentes = new Set<() => void>();
let cache: Set<string> | null = null;
let crudo: string | null = null;

function leerCrudo(): string | null {
  try { return localStorage.getItem(CLAVE); } catch { return null; }
}

function cargar(): Set<string> {
  const texto = leerCrudo();
  if (cache && texto === crudo) return cache;
  crudo = texto;
  try { cache = new Set<string>(JSON.parse(texto || '[]')); } catch { cache = new Set<string>(); }
  return cache;
}

function publicar(siguiente: Set<string>) {
  cache = siguiente;
  const texto = JSON.stringify([...siguiente].slice(-MAX));
  crudo = texto;
  try { localStorage.setItem(CLAVE, texto); } catch { /* sin almacenamiento */ }
  oyentes.forEach(f => f());
}

/** Claves ya vistas. Se comparte entre la campanita, el aviso y el detalle. */
export function useLeidas() {
  return useSyncExternalStore(
    cb => { oyentes.add(cb); return () => { oyentes.delete(cb); }; },
    cargar,
    () => cache ?? new Set<string>()
  );
}

/** ¿El navegador ya guardó alguna vez el estado de leídas? La primera carga no debe llenar la campanita de avisos viejos. */
export const notificacionesIniciadas = () => leerCrudo() !== null;

export function inicializarLeidas(claves: string[]) {
  if (notificacionesIniciadas()) return;
  publicar(new Set(claves));
}

export function marcarLeida(clave: string) {
  const s = new Set(cargar());
  if (s.has(clave)) return;
  s.add(clave);
  publicar(s);
}

export function marcarLeidas(claves: string[]) {
  const s = new Set(cargar());
  let cambio = false;
  claves.forEach(k => { if (!s.has(k)) { s.add(k); cambio = true; } });
  if (cambio) publicar(s);
}

export type ClaseNotificacion = 'propuesta' | 'aceptada' | 'asignada' | 'rechazada' | 'recibida';

export interface Notificacion {
  clave: string;
  solicitud: SolicitudCliente;
  clase: ClaseNotificacion;
  titulo: string;
  texto: string;
  fecha: number;
}

export const claveNotificacion = (s: Pick<SolicitudCliente, 'id' | 'estado' | 'actualizado'>) =>
  `${s.id}:${s.estado}:${s.actualizado}`;

const fechaDe = (iso: string) => {
  const n = new Date(iso).getTime();
  return Number.isFinite(n) ? n : 0;
};

/** Un aviso por solicitud, con su estado actual. Las propuestas son las únicas que piden una acción. */
export function notificacionDe(s: SolicitudCliente): Notificacion {
  const valor = s.valor != null ? pesos(s.valor) : 'el valor propuesto';
  const base = { clave: claveNotificacion(s), solicitud: s, fecha: fechaDe(s.actualizado) };
  if (s.estado === 'cotizada') return {
    ...base, clase: 'propuesta', titulo: 'Propuesta de domicilio',
    texto: `La oficina propone ${valor} por el domicilio. Acepta o rechaza desde aquí.`,
  };
  if (s.estado === 'confirmada') return {
    ...base, clase: 'aceptada', titulo: 'Aceptaste la propuesta',
    texto: `Domicilio ${valor}. La oficina asignará un mensajero a tu envío.`,
  };
  if (s.estado === 'asignada') return {
    ...base, clase: 'asignada', titulo: 'Tu solicitud tiene mensajero',
    texto: `Ya está aprobada${s.guia ? ` con la guía ${s.guia}` : ''}. Puedes seguirla en “Mis pedidos”.`,
  };
  if (s.estado === 'rechazada') return {
    ...base, clase: 'rechazada', titulo: 'Solicitud rechazada',
    texto: s.motivoRechazo || 'La oficina no pudo atender esta solicitud.',
  };
  return {
    ...base, clase: 'recibida', titulo: 'Solicitud recibida',
    texto: 'La oficina está revisando tu solicitud y te avisará cuando responda.',
  };
}
