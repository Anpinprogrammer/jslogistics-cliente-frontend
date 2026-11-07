import { useState } from 'react';
import { hoy, hora, pesos } from '../../lib/formato';
import { filasCuenta, reciboDelDia, textoSaldo } from '../../lib/negocio';
import type { DatosCliente } from '../useDatosCliente';
import { Modal, ReciboTicket } from './ui';

export default function Cuenta({ d }: { d: DatosCliente }) {
  const [dia, setDia] = useState(hoy());
  const [ver, setVer] = useState(false);
  const [aviso, setAviso] = useState('');
  const filas = filasCuenta(d.pedidos, d.movimientos);
  const recibo = reciboDelDia(dia, d.pedidos, d.movimientos);
  const s = d.saldo;
  const tono = s > 0 ? 'dark:bg-emerald-900/20 dark:border-emerald-700/40 bg-emerald-50 border-emerald-200'
    : s < 0 ? 'dark:bg-red-900/20 dark:border-red-700/40 bg-red-50 border-red-200' : 'card';

  return (
    <>
      <div className="mb-6 animate-fade-up">
        <p className="text-xs font-mono text-accent-400 uppercase tracking-widest mb-1">Mi cuenta</p>
        <h1 className="font-display font-800 text-3xl sm:text-4xl dark:text-white text-gray-700">{d.cliente?.nombre}</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-6 animate-fade-up animate-delay-100">
        <div className={`rounded-xl border p-6 lg:col-span-2 ${tono}`}>
          <p className="stat-label">Tu saldo</p>
          <p className={`font-display font-800 text-5xl tabular-nums mt-2 ${s > 0 ? 'text-success' : s < 0 ? 'text-danger' : 'dark:text-white text-gray-800'}`}>{pesos(Math.abs(s))}</p>
          <p className="text-sm text-silver-500 mt-2">{textoSaldo(s)}</p>
        </div>
        <div className="card p-6">
          <label htmlFor="diaRecibo" className="input-label">Recibo de cuadre del día</label>
          <input id="diaRecibo" type="date" value={dia} max={hoy()} onChange={e => { setDia(e.target.value || hoy()); setAviso(''); }} className="input mb-3" />
          <button className="btn-primary w-full" onClick={() => (recibo ? setVer(true) : setAviso('No hay entregas ni pagos ese día'))}>Ver recibo</button>
          {aviso && <p className="text-xs text-silver-500 mt-2">{aviso}</p>}
        </div>
      </div>

      <section className="card overflow-hidden animate-fade-up animate-delay-200">
        <div className="p-5 border-b dark:border-steel-800 border-gray-100">
          <h2 className="font-display font-600 text-lg dark:text-white text-gray-700">Movimientos</h2>
        </div>
        {filas.length === 0 ? <p className="p-10 text-center text-silver-500">Sin movimientos.</p> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-xs uppercase tracking-wider text-silver-500 dark:bg-steel-900/80 bg-gray-50">
                <th className="px-5 py-3 font-600">Fecha</th><th className="px-5 py-3 font-600">Detalle</th><th className="px-5 py-3 font-600 text-right">Valor</th>
              </tr></thead>
              <tbody className="divide-y dark:divide-steel-800 divide-gray-100">
                {filas.map((r, i) => (
                  <tr key={i} className="dark:hover:bg-steel-800/30 hover:bg-gray-50">
                    <td className="px-5 py-3 whitespace-nowrap text-silver-500">{hora(r.fecha)}</td>
                    <td className="px-5 py-3 dark:text-silver-200 text-gray-700 min-w-[260px]">{r.det}</td>
                    <td className={`px-5 py-3 text-right font-700 tabular-nums whitespace-nowrap ${r.v < 0 ? 'text-danger' : 'text-success'}`}>{pesos(r.v)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Modal abierto={ver && !!recibo} alCerrar={() => setVer(false)} titulo="Recibo de cuadre">
        {recibo && <ReciboTicket dia={dia} nombre={d.cliente?.nombre || ''} r={recibo} />}
        <p className="text-sm text-silver-500 text-center mt-4">
          {recibo && (recibo.queda > 0 ? 'JS Logistics te debe este valor.' : recibo.queda < 0 ? 'Este valor queda pendiente por pagar a JS Logistics.' : 'Cuadre en cero.')}
        </p>
      </Modal>
    </>
  );
}
