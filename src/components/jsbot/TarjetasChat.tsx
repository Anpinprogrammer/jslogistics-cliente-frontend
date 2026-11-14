import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Check, Loader2, PackageCheck } from 'lucide-react';
import { ApiError } from '../../api/http';
import { cancelarBorrador, confirmarBorrador, urlImagenSegura, type BorradorSolicitud, type EvidenciasPedido } from '../../api/chatbot';
import { clientToast } from '../../utils/clientToast';

type Estado = 'pendiente' | 'enviando' | 'confirmado' | 'cancelado';

/** Resumen de una solicitud que armó el asistente. Nada se envía hasta que la persona pulsa Confirmar. */
export function TarjetaBorrador({ borrador, activa }: { borrador: BorradorSolicitud; activa: boolean }) {
  const qc = useQueryClient();
  const [estado, setEstado] = useState<Estado>('pendiente');
  const [error, setError] = useState('');
  const r = borrador.resumen;
  const filas: [string, string][] = [
    ['Recoger en', r.recogida],
    ['Entregar en', r.entrega],
    ['Recibe', r.destinatario + (r.destinatarioTelefono ? ` · ${r.destinatarioTelefono}` : '')],
    ['Paquetes', String(r.paquetes) + (r.pesoKg ? ` · ${r.pesoKg} kg` : '')],
    ['Contacto', `${r.contacto} · ${r.telefonoContacto}`],
  ];
  const confirmar = async () => {
    setEstado('enviando'); setError('');
    try {
      await confirmarBorrador(borrador.id);
      setEstado('confirmado');
      void qc.invalidateQueries({ queryKey: ['cliente', 'solicitudes'] });
      clientToast.success('Solicitud enviada. La oficina te responde con el valor del domicilio.');
    } catch (e) {
      setEstado('pendiente');
      setError(e instanceof ApiError || e instanceof Error ? e.message : 'No pudimos enviar la solicitud. Intenta de nuevo.');
    }
  };
  const cancelar = async () => {
    setEstado('cancelado');
    try { await cancelarBorrador(borrador.id); } catch { /* si falla, igual vence solo */ }
  };
  return (
    <section aria-label="Resumen de la solicitud de envío" className="mt-2 w-full max-w-full rounded-2xl border border-sky-200 bg-white p-3 text-xs dark:border-sky-900/60 dark:bg-slate-900">
      <h4 className="mb-2 flex items-center gap-1.5 font-bold text-slate-900 dark:text-white"><PackageCheck size={14} className="text-sky-600" aria-hidden="true" /> Solicitud de envío</h4>
      <dl className="space-y-1.5">
        {filas.map(([k, v]) => <div key={k} className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-2"><dt className="text-slate-500 dark:text-slate-400">{k}</dt><dd className="min-w-0 font-medium [overflow-wrap:anywhere]">{v}</dd></div>)}
      </dl>
      {error && <p role="alert" className="mt-2 rounded-lg bg-rose-50 p-2 text-rose-800 dark:bg-rose-950/40 dark:text-rose-200">{error}</p>}
      {estado === 'confirmado' && <p role="status" className="mt-3 flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-300"><Check size={14} aria-hidden="true" /> Enviada a la oficina</p>}
      {estado === 'cancelado' && <p role="status" className="mt-3 text-slate-500 dark:text-slate-400">Cancelaste esta solicitud.</p>}
      {(estado === 'pendiente' || estado === 'enviando') && (
        <div className="mt-3 flex gap-2">
          <button type="button" onClick={() => void confirmar()} disabled={estado === 'enviando' || !activa}
            className="flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-xl bg-sky-500 px-3 font-bold text-slate-950 hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50">
            {estado === 'enviando' ? <Loader2 size={14} className="animate-spin" aria-hidden="true" /> : <Check size={14} aria-hidden="true" />} Confirmar
          </button>
          <button type="button" onClick={() => void cancelar()} disabled={estado === 'enviando'}
            className="min-h-10 rounded-xl border border-slate-300 px-3 font-semibold text-slate-700 hover:border-slate-400 disabled:opacity-50 dark:border-slate-600 dark:text-slate-200">
            Cancelar
          </button>
        </div>
      )}
      {!activa && estado === 'pendiente' && <p className="mt-2 text-slate-500 dark:text-slate-400">Este resumen es de una conversación anterior. Pídele al asistente que lo arme de nuevo.</p>}
    </section>
  );
}

/** Fotos de recogida, de entrega y firma. Los enlaces vencen pronto: el aviso lo dice. */
export function TarjetaEvidencias({ evidencias }: { evidencias: EvidenciasPedido }) {
  const items = evidencias.items.flatMap(i => { const url = urlImagenSegura(i.url); return url ? [{ ...i, url }] : []; });
  if (!items.length) return null;
  return (
    <section aria-label={`Evidencias del pedido ${evidencias.guia}`} className="mt-2 w-full max-w-full rounded-2xl border border-slate-200 bg-white p-3 text-xs dark:border-slate-700 dark:bg-slate-900">
      <h4 className="mb-2 font-bold text-slate-900 dark:text-white">Evidencias de {evidencias.guia}</h4>
      <ul className="grid grid-cols-1 gap-2 min-[360px]:grid-cols-2">
        {items.map(i => (
          <li key={i.tipo} className="min-w-0">
            <a href={i.url} target="_blank" rel="noopener noreferrer" className="block">
              <img src={i.url} alt={`${i.etiqueta} del pedido ${evidencias.guia}`} loading="lazy" referrerPolicy="no-referrer"
                className={`aspect-[4/3] w-full rounded-lg border border-slate-200 object-cover dark:border-slate-700 ${i.tipo === 'firma' ? 'bg-white object-contain' : ''}`} />
            </a>
            <p className="mt-1 font-medium">{i.etiqueta}</p>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-[10px] text-slate-500 dark:text-slate-400">Toca una imagen para verla grande. Los enlaces duran unos {Math.round(evidencias.vigenteSegundos / 60)} minutos: si no cargan, pídelas de nuevo.</p>
    </section>
  );
}
