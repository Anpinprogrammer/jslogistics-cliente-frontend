import { Link } from 'react-router-dom';
import { StatCard, Alert } from '../../components/ui';
import { hoy, hora, moverDia, pesos } from '../../lib/formato';
import { cambioPendiente, entregasPorDia, filasCuenta, MOTIVOS, resumenCliente, textoSaldo, ultimaActividad } from '../../lib/negocio';
import type { DatosCliente } from '../useDatosCliente';
import { Columnas, Dona, EstadoBadge, Miniatura, Tarjeta } from './ui';

const ico = (d: string) => <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" dangerouslySetInnerHTML={{ __html: d }} />;

export default function Inicio({ d }: { d: DatosCliente }) {
  const h = hoy(), desde = moverDia(h, -29);
  const r = resumenCliente(d.pedidos, h, desde);
  const dias = entregasPorDia(d.pedidos, 30, h, moverDia), tot30 = dias.reduce((a, x) => a + x.n, 0);
  const cambios = d.pedidos.filter(cambioPendiente);
  const ultimos = [...d.pedidos].sort((a, b) => ultimaActividad(b) - ultimaActividad(a)).slice(0, 6);
  const movs = filasCuenta(d.pedidos, d.movimientos).slice(0, 6);

  return (
    <>
      <div className="mb-8 animate-fade-up">
        <p className="text-xs font-mono text-accent-400 uppercase tracking-widest mb-1">Panel principal</p>
        <h1 className="font-display font-800 text-3xl sm:text-4xl dark:text-white text-gray-700">Hola, {d.cliente?.nombre}</h1>
        <p className="text-silver-500 text-sm mt-1">Así van tus envíos con JS Logistics</p>
      </div>

      {cambios.length > 0 && (
        <div className="mb-6 animate-fade-up">
          <Alert type="error" message={`Tienes ${cambios.length === 1 ? '1 prenda de cambio' : cambios.length + ' prendas de cambio'} por recibir (${cambios.map(p => p.guia).join(', ')}). Cuando te la entreguen, ábrela y confirma que la recibiste.`} />
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-fade-up animate-delay-100">
        <Link to="pedidos?f=ruta"><StatCard label="En ruta ahora" value={r.enRuta} sub={`${r.salieronHoy} salieron hoy`}
          icon={ico('<path d="M1 3h15v13H1z"/><path d="M16 8h4l3 3v5h-7V8z"/>')} /></Link>
        <Link to="pedidos?f=ent"><StatCard label="Entregados hoy" value={r.entHoy} sub={`${r.entMes} en 30 días`}
          icon={ico('<polyline points="20,6 9,17 4,12"/>')} /></Link>
        <Link to="pedidos?f=dev"><StatCard label="Devueltos hoy" value={r.devHoy} sub={`${r.devMes} en 30 días`}
          icon={ico('<path d="M9 14L4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>')} /></Link>
        <Link to="cuenta"><StatCard label="Tu saldo" value={pesos(Math.abs(d.saldo))} sub={textoSaldo(d.saldo).replace('.', '')} accent={d.saldo < 0}
          icon={ico('<path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>')} /></Link>
      </div>

      <div className="grid lg:grid-cols-12 gap-4 mb-4 animate-fade-up animate-delay-200">
        <Tarjeta titulo="Efectividad" sub="Últimos 30 días" className="lg:col-span-4">
          <Dona entregados={r.entMes} devueltos={r.devMes} />
        </Tarjeta>
        <Tarjeta titulo="Tus envíos entregados" sub={`Últimos 30 días · ${tot30} en total`} className="lg:col-span-8">
          <Columnas datos={dias} />
        </Tarjeta>
      </div>

      <div className="grid lg:grid-cols-12 gap-4 animate-fade-up animate-delay-300">
        <Tarjeta titulo="Últimos pedidos" className="lg:col-span-7" accion={<Link to="pedidos" className="btn-ghost btn-sm">Ver todos</Link>}>
          {ultimos.length === 0 ? <p className="text-silver-500 text-sm py-6 text-center">Todavía no tienes envíos.</p> : (
            <div className="divide-y dark:divide-steel-800 divide-gray-100 -mx-2">
              {ultimos.map(p => (
                <Link key={p.guia} to={`pedidos/${p.guia}`} className="flex items-center gap-3 px-2 py-3 rounded-lg dark:hover:bg-steel-800/40 hover:bg-gray-50 transition-colors">
                  <Miniatura src={p.mini} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className="font-mono text-sm dark:text-silver-200 text-gray-700">{p.guia}</span>
                      <EstadoBadge p={p} ruta />
                    </div>
                    <p className="text-xs text-silver-500 truncate">
                      {p.estado === 'entregado' ? `Recibió ${p.destinatario} · ${hora(p.entregado!)}`
                        : p.estado === 'devuelto' ? `${MOTIVOS[p.motivoDev] || 'Devuelto'} · ${hora(p.entregado!)}` : `Salió ${hora(p.creado)}`}
                    </p>
                  </div>
                  <span className="text-sm font-600 dark:text-silver-200 text-gray-700 tabular-nums">{p.estado === 'entregado' ? pesos(p.valorCobrado) : ''}</span>
                </Link>
              ))}
            </div>
          )}
        </Tarjeta>
        <Tarjeta titulo="Últimos movimientos" className="lg:col-span-5" accion={<Link to="cuenta" className="btn-ghost btn-sm">Mi cuenta</Link>}>
          {movs.length === 0 ? <p className="text-silver-500 text-sm py-6 text-center">Sin movimientos.</p> : (
            <div className="divide-y dark:divide-steel-800 divide-gray-100">
              {movs.map((m, i) => (
                <div key={i} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-600 dark:text-silver-200 text-gray-700 truncate">{m.guia ? m.guia + (m.nom ? ' · ' + m.nom : '') : m.nom}</p>
                    <p className="text-xs text-silver-500">{hora(m.fecha)}</p>
                  </div>
                  <span className={`text-sm font-700 tabular-nums ${m.v < 0 ? 'text-danger' : 'text-success'}`}>{pesos(m.v)}</span>
                </div>
              ))}
            </div>
          )}
        </Tarjeta>
      </div>
    </>
  );
}
