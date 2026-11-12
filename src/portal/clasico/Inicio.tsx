/* Inicio del portal (pintarInicioCliente de la app actual). Es la única pestaña que necesita la lista completa de pedidos. */
import type { ReactNode } from 'react';
import { useCuentaCliente } from '../../api/cliente';
import { hora, hoy, moverDia, pct, pesos } from '../../lib/formato';
import { cambioPendiente, entregasPorDia, resumenCliente, ultimaActividad } from '../../lib/negocio';
import type { DatosCliente } from '../useDatosCliente';
import { Icono } from './iconos';
import { CargandoVista, Columnas, Dona, EtqDash, Foto, lineaPedido } from './piezas';

const VERDE = 'var(--verde)', ROJO = 'var(--rojo)';

function Kpi({ ico, lbl, val, pie, alClic, cls = '' }: { ico: string; lbl: string; val: ReactNode; pie: string; alClic: () => void; cls?: string }) {
  return <button className={'kpi ' + cls} onClick={alClic}><span className="lbl"><Icono n={ico} />{lbl}</span><b>{val}</b><small>{pie}</small></button>;
}

export default function Inicio({ d, ir, abrir }: { d: DatosCliente; ir: (k: string, f?: string) => void; abrir: (g: string) => void }) {
  const h = hoy(), desde = moverDia(h, -29), r = resumenCliente(d.pedidos, h, desde);
  const dias = entregasPorDia(d.pedidos, 30, h, moverDia), tot30 = dias.reduce((a, x) => a + x.n, 0);
  const cambios = d.pedidos.filter(cambioPendiente);
  const ultimos = [...d.pedidos].sort((a, b) => ultimaActividad(b) - ultimaActividad(a)).slice(0, 6);
  const cuenta = useCuentaCliente(1, 6);
  const movs = cuenta.data?.filas ?? [], s = cuenta.data?.saldo ?? 0;
  if (d.errorPedidos && !d.pedidosListos) return <><h1>Hola, {d.cliente!.nombre}</h1><div className="vacio">No se pudieron traer tus envíos. Revisa tu conexión e intenta de nuevo.</div></>;
  if (!d.pedidosListos) return <CargandoVista />;
  return (
    <>
      <div className="dash-cab"><div><h1>Hola, {d.cliente!.nombre}</h1><p className="sub">Así van tus envíos con JS Logistics</p></div></div>
      {cambios.length > 0 && <div className="aviso alerta">Tienes {cambios.length === 1 ? '1 prenda de cambio' : cambios.length + ' prendas de cambio'} por recibir ({cambios.map(p => p.guia).join(', ')}). Cuando te la entreguen, ábrela y confirma que la recibiste.</div>}
      <div className="kpis">
        <Kpi ico="ruta" lbl="En ruta ahora" val={r.enRuta} pie={`${r.salieronHoy} salieron hoy`} alClic={() => ir('pedidos', 'ruta')} />
        <Kpi ico="ok" lbl="Entregados hoy" val={r.entHoy} pie={`${r.entMes} en 30 días`} alClic={() => ir('pedidos', 'ent')} />
        <Kpi ico="dev" lbl="Devueltos hoy" val={r.devHoy} pie={`${r.devMes} en 30 días`} alClic={() => ir('pedidos', 'dev')} />
        <Kpi ico="plata" lbl="Tu saldo" val={pesos(Math.abs(s))} cls="oscuro" alClic={() => ir('cuenta')}
          pie={s > 0 ? 'JS Logistics te debe este valor' : s < 0 ? 'Pendiente por pagar a JS Logistics' : 'Cuenta a paz y salvo'} />
      </div>
      <div className="dash">
        <section className="tarjeta c4"><h3>Efectividad <small>Últimos 30 días</small></h3>
          <Dona segs={[{ t: 'Entregados', n: r.entMes, c: VERDE }, { t: 'Devueltos', n: r.devMes, c: ROJO }]}
            centro={r.entMes + r.devMes ? pct(r.entMes, r.entMes + r.devMes) + '%' : '—'} sub="entregado" /></section>
        <section className="tarjeta c8"><h3>Tus envíos entregados <small>Últimos 30 días · {tot30} en total</small></h3><Columnas datos={dias} /></section>
      </div>
      <div className="dash">
        <section className="tarjeta c6"><h3>Últimos pedidos <button className="btn sec chico" onClick={() => ir('pedidos', 'todos')}>Ver todos</button></h3>
          {ultimos.length ? <div className="mini-lista">{ultimos.map(p => (
            <button key={p.guia} onClick={() => abrir(p.guia)}><Foto src={p.mini} />
              <span className="info"><span className="guia">{p.guia}</span> <EtqDash p={p} /><p>{lineaPedido(p)}</p></span>
              <span className="val">{p.estado === 'entregado' ? pesos(p.valorCobrado) : ''}</span></button>
          ))}</div> : <div className="vacio">Todavía no tienes envíos.</div>}
        </section>
        <section className="tarjeta c6"><h3>Últimos movimientos <button className="btn sec chico" onClick={() => ir('cuenta')}>Mi cuenta</button></h3>
          {movs.length ? <div className="mini-lista">{movs.map((m, i) => (
            <div key={i}><span className="info"><b style={{ fontWeight: 600, fontSize: '.88rem' }}>{m.guia ? m.guia + (m.nom ? ' · ' + m.nom : '') : m.nom || m.det}</b><p>{hora(m.fecha)}</p></span>
              <span className={'val ' + (m.v < 0 ? 'neg' : 'pos')}>{pesos(m.v)}</span></div>
          ))}</div> : <div className="vacio">Sin movimientos.</div>}
        </section>
      </div>
    </>
  );
}
