/**
 * Reglas de negocio que ve el cliente, copiadas de js-logistics/app/js/app.js para que los dos portales
 * muestren exactamente lo mismo que la app actual. Cuando el backend devuelva los saldos ya calculados
 * (pendiente en backend/README.md), estas funciones solo quedan para mostrar el detalle.
 */
import type { Movimiento, Pedido, TipoMovimiento } from '../types/dominio';
import { diaDe, ms, pesos } from './formato';

export const MOTIVOS: Record<string, string> = {
  no_contesta: 'No contestan', direccion: 'Dirección errada', rechazo: 'Lo rechazaron',
  reprogramar: 'Reprogramar (sigue en ruta)', otro: 'Otro motivo',
};
export const METODOS: Record<string, string> = {
  efectivo: 'Efectivo', transf_js: 'Transferencia a JS', transf_cliente: 'Transferencia al cliente',
};
export const MOVS: Record<TipoMovimiento, { corto: string; s: 1 | -1; pago?: boolean }> = {
  cargo: { corto: 'Cargo', s: -1 },
  abono: { corto: 'A favor', s: 1 },
  pago_a_cliente: { corto: 'Pago al cliente', s: -1, pago: true },
  pago_de_cliente: { corto: 'Pago del cliente', s: 1, pago: true },
  compra_cliente: { corto: 'Compra por encargo', s: -1 },
  ganancia: { corto: 'Servicio adicional', s: -1 },
};
export const EMPRESA = {
  nombre: 'JS LOGISTICS CALI', lema: '¡SERVIR ES NUESTRA LABOR!', tel: 'TEL: 316 493 3854', ig: 'IG: @JS.LOGISTICS.CALI',
};

export const cerrado = (p: Pedido) => p.estado === 'entregado' || p.estado === 'devuelto';
export const servicio = (p: Pedido) => (p.estado === 'devuelto' && !p.cobrarDev ? 0 : Number(p.valorServicio) || 0);
export const gastoDe = (p: Pedido) => Number(p.gasto) || 0;
export const pagoDomi = (p: Pedido) =>
  !p.domiPagado ? 0 : p.domiPagoValor != null ? Number(p.domiPagoValor) || 0 : servicio(p);
export const metodoTxt = (p: Pedido) =>
  p.estado === 'devuelto'
    ? 'Devolución' + (p.motivoDev ? ' (' + (MOTIVOS[p.motivoDev] || '').toLowerCase() + ')' : '')
    : METODOS[p.metodo] || '';
export const textoDomi = (p: Pedido) =>
  (p.domiPagado ? 'pagó domicilio ' + pesos(pagoDomi(p)) : 'domicilio ' + pesos(servicio(p))) +
  (gastoDe(p) ? ' · flete ' + pesos(gastoDe(p)) : '');

/** Saldo de un pedido: lo cobrado − domicilio − flete + domicilio pagado aparte. + JS le debe al cliente. */
export function saldoPedido(p: Pedido) {
  if (!cerrado(p)) return 0;
  const cob = p.metodo === 'transf_cliente' || p.estado === 'devuelto' ? 0 : Number(p.valorCobrado) || 0;
  return cob - (servicio(p) + gastoDe(p)) + pagoDomi(p);
}
export const signoMov = (m: Movimiento) => (MOVS[m.tipo]?.s || -1) * (Number(m.valor) || 0);
export const esPago = (m: Movimiento) => !!MOVS[m.tipo]?.pago;

export const cambioPendiente = (p: Pedido) => !!p.cambio && !p.cambioRecibido;
export const ultimaActividad = (p: Pedido) => Math.max(ms(p.creado), ms(p.entregado));
/** Un pedido es "del día" si salió o se cerró ese día. */
export const delDia = (p: Pedido, d: string) => !d || diaDe(p.creado) === d || (!!p.entregado && diaDe(p.entregado) === d);

export function saldoCliente(pedidos: Pedido[], movs: Movimiento[]) {
  return pedidos.reduce((a, p) => a + saldoPedido(p), 0) + movs.reduce((a, m) => a + signoMov(m), 0);
}

export const textoSaldo = (s: number) =>
  s > 0 ? 'JS Logistics te debe este valor.' : s < 0 ? 'Este valor queda pendiente por pagar a JS Logistics.' : 'Cuenta a paz y salvo.';

export interface FilaCuenta { fecha: string; det: string; v: number; guia?: string; nom: string }
/** Movimientos de la cuenta: cada pedido cerrado con su efecto, más los movimientos. Más reciente primero. */
export function filasCuenta(pedidos: Pedido[], movs: Movimiento[]): FilaCuenta[] {
  const ps = pedidos.filter(cerrado).map(p => ({
    fecha: p.entregado as string,
    det: `${p.guia} · ${p.destinatario || ''} · ${metodoTxt(p)} · cobró ${pesos(p.valorCobrado)} · ${textoDomi(p)}`,
    v: saldoPedido(p), guia: p.guia,
    nom: p.destinatario || (p.estado === 'devuelto' ? 'Devolución' : ''),
  }));
  const ms_ = movs.map(m => ({
    fecha: m.fecha, det: (MOVS[m.tipo]?.corto || 'Movimiento') + (m.nota ? ' · ' + m.nota : ''), v: signoMov(m),
    nom: (MOVS[m.tipo]?.corto || 'Movimiento') + (m.nota ? ' ' + m.nota : ''),
  }));
  return [...ps, ...ms_].sort((a, b) => ms(b.fecha) - ms(a.fecha));
}

export interface LineaRecibo { t: string; v: number; f: number; pedido?: Pedido }
export interface Recibo { anterior: number; lineas: LineaRecibo[]; delDia: number; pagos: number; total: number; queda: number }
/** Recibo de cuadre de un día para un cliente (cuadreDia de app.js). null si ese día no hubo nada. */
export function reciboDelDia(dia: string, pedidos: Pedido[], movs: Movimiento[]): Recibo | null {
  let anterior = 0, delDia_ = 0, pagos = 0;
  const lineas: LineaRecibo[] = [];
  for (const p of pedidos) {
    if (!cerrado(p)) continue;
    const d = diaDe(p.entregado as string), s = saldoPedido(p), dev = p.estado === 'devuelto';
    if (d < dia) anterior += s;
    else if (d === dia) {
      lineas.push({ t: (dev ? 'Devolución' : '') + (dev && p.destinatario ? ' · ' : '') + (p.destinatario || (dev ? '' : p.guia)), v: s, f: ms(p.entregado), pedido: p });
      delDia_ += s;
    }
  }
  for (const m of movs) {
    const d = diaDe(m.fecha), s = signoMov(m);
    if (d < dia) anterior += s;
    else if (d === dia) {
      if (esPago(m)) pagos += s;
      else { lineas.push({ t: (MOVS[m.tipo]?.corto || 'Ajuste') + (m.nota ? ': ' + m.nota : ''), v: s, f: ms(m.fecha) }); delDia_ += s; }
    }
  }
  if (!lineas.length && !pagos) return null;
  lineas.sort((a, b) => a.f - b.f);
  return { anterior, lineas, delDia: delDia_, pagos, total: anterior + delDia_, queda: anterior + delDia_ + pagos };
}

/** Entregas por día de los últimos n días, para el gráfico de columnas. */
export function entregasPorDia(pedidos: Pedido[], n: number, hoyD: string, mover: (d: string, k: number) => string) {
  const porDia: Record<string, number> = {};
  for (const p of pedidos) if (p.estado === 'entregado' && p.entregado) { const d = diaDe(p.entregado); porDia[d] = (porDia[d] || 0) + 1; }
  return [...Array(n)].map((_, i) => { const d = mover(hoyD, i - n + 1); return { dia: d, n: porDia[d] || 0, hoy: d === hoyD }; });
}

/** Indicadores del inicio del cliente (pintarInicioCliente). */
export function resumenCliente(pedidos: Pedido[], hoyD: string, desde: string) {
  const cuenta = (e: string, d?: string) =>
    pedidos.filter(p => p.estado === e && p.entregado && (d ? diaDe(p.entregado) === d : diaDe(p.entregado) >= desde)).length;
  const entMes = cuenta('entregado'), devMes = cuenta('devuelto');
  return {
    enRuta: pedidos.filter(p => p.estado === 'pendiente').length,
    salieronHoy: pedidos.filter(p => diaDe(p.creado) === hoyD).length,
    entHoy: cuenta('entregado', hoyD), devHoy: cuenta('devuelto', hoyD),
    entMes, devMes, efectividad: entMes + devMes ? Math.round((entMes * 100) / (entMes + devMes)) : null,
  };
}
