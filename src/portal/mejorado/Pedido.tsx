import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Alert, Spinner } from '../../components/ui';
import { useConfirmarCambio, usePruebas } from '../../api/cliente';
import { hora, pesos } from '../../lib/formato';
import { cerrado, gastoDe, metodoTxt, MOTIVOS, pagoDomi, saldoPedido, servicio } from '../../lib/negocio';
import type { DatosCliente } from '../useDatosCliente';
import { EstadoBadge, Modal } from './ui';

export default function Pedido({ d }: { d: DatosCliente }) {
  const { guia = '' } = useParams();
  const p = d.pedidos.find(x => x.guia === guia);
  const pruebas = usePruebas(p ? guia : null);
  const confirmar = useConfirmarCambio();
  const [preguntar, setPreguntar] = useState(false);
  const [foto, setFoto] = useState<string | null>(null);

  if (!p) return (
    <div className="text-center py-20">
      <p className="text-silver-500 mb-4">No encontramos el envío {guia}.</p>
      <Link to=".." relative="path" className="btn-steel btn-sm">Volver a mis pedidos</Link>
    </div>
  );

  const datos: [string, React.ReactNode, string?][] = [
    ['Salió', hora(p.creado)],
    ...(p.aCobrar ? [['Valor a cobrar', pesos(p.aCobrar)] as [string, string]] : []),
    ...p.intentos.map((i, k) => [`Intento ${k + 1}`, `${hora(i.fecha)} · ${MOTIVOS[i.motivo] || ''}`] as [string, string]),
    ...(p.estado === 'entregado' ? [['Entregado', hora(p.entregado!)], ['Recibió', p.destinatario], ['Cobrado', pesos(p.valorCobrado)], ['Método', metodoTxt(p)]] as [string, string][] : []),
    ...(p.estado === 'devuelto' ? [['Devuelto', hora(p.entregado!)], ['Motivo', MOTIVOS[p.motivoDev] || '']] as [string, string][] : []),
    ...(cerrado(p) ? [
      ['Domicilio', pesos(servicio(p))] as [string, string],
      ...(gastoDe(p) ? [['Flete / gasto del envío', pesos(gastoDe(p)) + (p.gastoNota ? ' · ' + p.gastoNota : '')] as [string, string]] : []),
      ...(p.domiPagado ? [['Pagaste aparte', pesos(pagoDomi(p))] as [string, string]] : []),
      ['Efecto en tu saldo', pesos(saldoPedido(p)), saldoPedido(p) < 0 ? 'text-danger' : 'text-success'] as [string, string, string],
    ] : []),
  ];
  const nombres = { salida: 'Salida', entrega: p.estado === 'devuelto' ? 'Evidencia' : 'Entrega', firma: 'Firma de quien recibió' };

  return (
    <>
      <Link to=".." relative="path" className="inline-flex items-center gap-2 text-sm text-silver-500 hover:text-accent-400 mb-6">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" /></svg>Mis pedidos
      </Link>
      <div className="flex items-center gap-3 flex-wrap mb-6 animate-fade-up">
        <h1 className="font-mono font-700 text-2xl sm:text-3xl dark:text-white text-gray-700">{p.guia}</h1>
        <EstadoBadge p={p} />
      </div>

      {p.cambio && (
        <div className="mb-6 animate-fade-up">
          {p.cambioRecibido ? <Alert type="success" message={`Recibiste la prenda de cambio el ${hora(p.cambioRecibido)}.`} /> : (
            <div className="rounded-xl border dark:border-red-700/40 dark:bg-red-900/20 border-red-200 bg-red-50 px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p className="text-sm dark:text-red-300 text-red-700">JS Logistics tiene una prenda de cambio de este envío para entregarte.</p>
              <button className="btn-primary btn-sm" onClick={() => setPreguntar(true)}>Confirmar que recibí el cambio</button>
            </div>
          )}
          {confirmar.isError && <div className="mt-3"><Alert type="error" message={(confirmar.error as Error).message} /></div>}
        </div>
      )}

      <div className="grid lg:grid-cols-5 gap-4 animate-fade-up animate-delay-100">
        <section className="card p-6 lg:col-span-2">
          <h2 className="font-display font-600 text-lg dark:text-white text-gray-700 mb-4">Detalle</h2>
          <dl className="space-y-3">
            {datos.map(([t, v, cls]) => (
              <div key={t} className="flex justify-between gap-4 text-sm">
                <dt className="text-silver-500">{t}</dt>
                <dd className={`font-600 text-right ${cls || 'dark:text-silver-200 text-gray-800'}`}>{v}</dd>
              </div>
            ))}
          </dl>
        </section>
        <section className="card p-6 lg:col-span-3">
          <h2 className="font-display font-600 text-lg dark:text-white text-gray-700 mb-4">Pruebas</h2>
          {pruebas.isLoading ? <div className="py-10 flex justify-center"><Spinner /></div>
            : pruebas.isError ? <p className="text-sm text-silver-500">No se pudieron cargar las fotos.</p>
            : !pruebas.data?.length ? <p className="text-sm text-silver-500">Sin fotos.</p> : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {pruebas.data.map(a => (
                  <figure key={a.tipo}>
                    <button onClick={() => setFoto(a.url)} className="block w-full cursor-zoom-in">
                      <img src={a.url} alt={nombres[a.tipo]} className="w-full aspect-[4/3] object-cover rounded-lg border dark:border-steel-700 border-gray-200 bg-white" />
                    </button>
                    <figcaption className="text-xs text-silver-500 mt-1">{nombres[a.tipo]}</figcaption>
                  </figure>
                ))}
              </div>
            )}
        </section>
      </div>

      <Modal abierto={preguntar} alCerrar={() => setPreguntar(false)} titulo={`Confirmar cambio de ${p.guia}`}>
        <p className="text-sm text-silver-500 mb-5">Confirmas que ya recibiste la prenda de cambio de este envío.</p>
        <div className="flex gap-3 justify-end">
          <button className="btn-steel btn-sm" onClick={() => setPreguntar(false)}>Cancelar</button>
          <button className="btn-primary btn-sm" disabled={confirmar.isPending}
            onClick={() => confirmar.mutate(p.guia, { onSettled: () => setPreguntar(false) })}>
            {confirmar.isPending ? <Spinner size="sm" /> : 'Sí, la recibí'}
          </button>
        </div>
      </Modal>
      {foto && (
        <div className="fixed inset-0 z-[70] bg-black/90 flex items-center justify-center p-3" onClick={() => setFoto(null)}>
          <img src={foto} alt="" className="max-w-full max-h-full object-contain" />
          <button aria-label="Cerrar" className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white text-gray-900 text-xl">×</button>
        </div>
      )}
    </>
  );
}
