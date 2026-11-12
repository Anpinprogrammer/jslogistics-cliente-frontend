/* Campanita del portal del cliente y aviso automático cuando la oficina propone el valor del domicilio.
   La campanita vive en la barra; el panel y el modal se montan dentro de `.clasico` para conservar el CSS del portal. */
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCircle2, ChevronRight, ClipboardList, Clock, Truck, X, XCircle } from 'lucide-react';
import { useResponderSolicitud, useSolicitudesRecientes } from '../../api/cliente';
import { hora, pesos } from '../../lib/formato';
import type { SolicitudCliente } from '../../types/dominio';
import {
  claveNotificacion, inicializarLeidas, marcarLeida, marcarLeidas, notificacionDe, notificacionesIniciadas, useLeidas,
  type Notificacion,
} from './notificacionesCliente';

const iconoDe = (n: Notificacion) =>
  n.clase === 'propuesta' ? Clock : n.clase === 'asignada' ? Truck : n.clase === 'rechazada' ? XCircle : n.clase === 'aceptada' ? CheckCircle2 : ClipboardList;

/** Campanita + panel de notificaciones + aviso automático de propuesta. Se monta una sola vez en la barra. */
export function CampanitaCliente() {
  const nav = useNavigate();
  const { data } = useSolicitudesRecientes();
  const solicitudes = data?.solicitudes;
  const notificaciones = useMemo(() => (solicitudes ?? []).map(notificacionDe).sort((a, b) => b.fecha - a.fecha), [solicitudes]);
  const leidas = useLeidas();
  const [abierta, setAbierta] = useState(false);
  const [destino, setDestino] = useState<HTMLElement | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const inicializada = useRef(false);

  // La primera carga no llena la campanita con el historial: lo viejo queda leído, salvo las propuestas por responder.
  useEffect(() => {
    if (!data || inicializada.current) return;
    inicializada.current = true;
    if (!notificacionesIniciadas()) inicializarLeidas(notificaciones.filter(n => n.clase !== 'propuesta').map(n => n.clave));
  }, [data, notificaciones]);

  // Al abrir el panel se marcan como leídas las notificaciones que ya se están viendo.
  useEffect(() => {
    if (!abierta || !notificaciones.length) return;
    marcarLeidas(notificaciones.map(n => n.clave));
  }, [abierta, notificaciones]);

  useEffect(() => { setDestino(document.querySelector<HTMLElement>('.clasico')); }, []);

  useEffect(() => {
    if (!abierta) return;
    const alTocar = (e: PointerEvent) => {
      const t = e.target as Node | null;
      if (t && (panelRef.current?.contains(t) || btnRef.current?.contains(t))) return;
      setAbierta(false);
    };
    const alTeclear = (e: KeyboardEvent) => { if (e.key === 'Escape') setAbierta(false); };
    document.addEventListener('pointerdown', alTocar);
    document.addEventListener('keydown', alTeclear);
    return () => { document.removeEventListener('pointerdown', alTocar); document.removeEventListener('keydown', alTeclear); };
  }, [abierta]);

  const sinLeer = notificaciones.filter(n => !leidas.has(n.clave)).length;
  const alVer = (n: Notificacion) => {
    setAbierta(false);
    if (n.solicitud.guia) nav(`/cliente/pedidos?ver=${encodeURIComponent(n.solicitud.guia)}`);
    else nav('/cliente/pedidos?v=solicitudes');
  };

  return <>
    <button
      ref={btnRef}
      type="button"
      className={'campana-cliente' + (sinLeer ? ' con-nuevas' : '')}
      aria-label={`Notificaciones${sinLeer ? `: ${sinLeer} sin leer` : ''}`}
      aria-expanded={abierta}
      aria-controls="notif-cliente-panel"
      title="Notificaciones"
      onClick={() => setAbierta(v => !v)}
    >
      <Bell aria-hidden="true" />
      {sinLeer > 0 && <span className="num" aria-hidden="true">{sinLeer > 9 ? '9+' : sinLeer}</span>}
    </button>

    {destino && abierta && createPortal(
      <div className="notif-panel" id="notif-cliente-panel" ref={panelRef} role="dialog" aria-label="Notificaciones">
        <header className="notif-cab">
          <div><b>Notificaciones</b><small>{sinLeer ? `${sinLeer} sin leer` : 'Al día'}</small></div>
          <button type="button" className="notif-cerrar" aria-label="Cerrar notificaciones" onClick={() => setAbierta(false)}><X aria-hidden="true" /></button>
        </header>
        <div className="notif-lista">
          {!data && <div className="notif-vacio">Cargando…</div>}
          {data && !notificaciones.length && <div className="notif-vacio">No tienes novedades por ahora.</div>}
          {notificaciones.map(n => {
            const Icono = iconoDe(n);
            return <article key={n.clave} className={`notif-item es-${n.clase}`}>
              <span className="notif-ico"><Icono aria-hidden="true" /></span>
              <div className="notif-cuerpo">
                <b>{n.titulo}</b>
                <p>{n.texto}</p>
                {n.clase === 'propuesta' && <RespuestaPropuesta solicitud={n.solicitud} compacta />}
                {n.clase !== 'propuesta' && <button type="button" className="notif-ver" onClick={() => alVer(n)}>Ver seguimiento <ChevronRight aria-hidden="true" /></button>}
                <small>{hora(n.solicitud.actualizado)}</small>
              </div>
            </article>;
          })}
        </div>
        <footer className="notif-pie">
          <button type="button" className="btn sec" onClick={() => { setAbierta(false); nav('/cliente/pedidos?v=solicitudes'); }}>
            Ver todas mis solicitudes <ChevronRight aria-hidden="true" />
          </button>
        </footer>
      </div>,
      destino
    )}

    {destino && <AvisoPropuesta solicitudes={solicitudes} destino={destino} />}
  </>;
}

/** Aviso centrado de 10 s cuando llega una propuesta. Si el cliente interactúa, el tiempo se detiene. */
function AvisoPropuesta({ solicitudes, destino }: { solicitudes?: SolicitudCliente[]; destino: HTMLElement }) {
  const [actual, setActual] = useState<SolicitudCliente | null>(null);
  const actualRef = useRef<SolicitudCliente | null>(null);
  const vistas = useRef<Set<string> | null>(null);
  const cola = useRef<SolicitudCliente[]>([]);

  const mostrar = (s: SolicitudCliente) => {
    if (actualRef.current) {
      if (actualRef.current.id !== s.id && !cola.current.some(x => x.id === s.id)) cola.current.push(s);
      return;
    }
    actualRef.current = s;
    setActual(s);
  };
  const cerrar = () => {
    const siguiente = cola.current.shift() ?? null;
    actualRef.current = siguiente;
    setActual(siguiente);
  };

  useEffect(() => {
    if (!solicitudes) return;
    const cotizadas = solicitudes.filter(s => s.estado === 'cotizada');
    const claves = new Set(cotizadas.map(claveNotificacion));
    if (vistas.current === null) { vistas.current = claves; return; } // La primera carga no avisa de propuestas viejas.
    const nuevas = cotizadas.filter(s => !vistas.current!.has(claveNotificacion(s)));
    vistas.current = claves;
    cola.current = cola.current.filter(q => cotizadas.some(c => c.id === q.id));
    nuevas.forEach(mostrar);
    const id = actualRef.current?.id;
    if (!id) return;
    const act = cotizadas.find(s => s.id === id);
    if (!act) { cerrar(); return; }
    if (claveNotificacion(act) !== claveNotificacion(actualRef.current!)) { actualRef.current = act; setActual(act); }
  }, [solicitudes]);

  if (!actual) return null;
  return createPortal(
    <ModalPropuesta key={claveNotificacion(actual)} solicitud={actual} alCerrar={cerrar} />,
    destino
  );
}

function ModalPropuesta({ solicitud, alCerrar }: { solicitud: SolicitudCliente; alCerrar: () => void }) {
  const [restante, setRestante] = useState(100);
  const [detenido, setDetenido] = useState(false);
  const alCerrarRef = useRef(alCerrar);
  alCerrarRef.current = alCerrar;

  useEffect(() => {
    if (detenido) return;
    const inicio = performance.now();
    const id = window.setInterval(() => {
      const pct = Math.max(0, 100 - ((performance.now() - inicio) / 10_000) * 100);
      setRestante(pct);
      if (pct <= 0) { window.clearInterval(id); alCerrarRef.current(); }
    }, 50);
    return () => window.clearInterval(id);
  }, [detenido]);

  useEffect(() => {
    const anterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const tecla = (e: KeyboardEvent) => { if (e.key === 'Escape') alCerrarRef.current(); };
    document.addEventListener('keydown', tecla);
    return () => { document.body.style.overflow = anterior; document.removeEventListener('keydown', tecla); };
  }, []);

  const detener = () => setDetenido(true);
  const segundos = Math.max(0, Math.ceil((restante / 100) * 10));
  const transcurrido = Math.round(10 - (restante / 100) * 10);

  return (
    <div className="aviso-prop-fondo">
      <div
        className="aviso-prop"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={`aviso-prop-${solicitud.id}`}
        onPointerDown={detener}
        onFocusCapture={detener}
        onKeyDown={detener}
        onChange={detener}
        onWheel={detener}
      >
        <button type="button" className="aviso-prop-cerrar" aria-label="Cerrar aviso de propuesta" onClick={alCerrar}>×</button>
        <header className="aviso-prop-cab">
          <span className="aviso-prop-eyebrow">Propuesta de domicilio</span>
          <h2 id={`aviso-prop-${solicitud.id}`}>La oficina respondió tu solicitud</h2>
          <p>Revisa el valor y responde desde aquí. También quedará en tus notificaciones.</p>
        </header>
        <div className="aviso-prop-cuerpo">
          <dl className="aviso-prop-datos">
            <div><dt>Recoger en</dt><dd>{solicitud.direccionRecogida}</dd></div>
            <div><dt>Entregar a</dt><dd>{solicitud.destinatarioNombre}<br />{solicitud.direccionEntrega}</dd></div>
            <div><dt>Paquetes</dt><dd>{solicitud.paquetes}{solicitud.pesoKg ? ` · ${solicitud.pesoKg} kg` : ''}</dd></div>
          </dl>
          <RespuestaPropuesta solicitud={solicitud} onRespondida={alCerrar} />
        </div>
        <div className={`aviso-prop-progreso${detenido ? ' detenido' : ''}`}>
          <div className="aviso-prop-barra" role="progressbar" aria-valuemin={0} aria-valuemax={10} aria-valuenow={transcurrido} aria-label="Tiempo antes de cerrar el aviso">
            <i style={{ width: `${restante}%` }} />
          </div>
          <small>{detenido ? 'Tiempo detenido. Responde o cierra el aviso cuando termines.' : `Se cierra en ${segundos} s.`}</small>
        </div>
      </div>
    </div>
  );
}

/** El cliente acepta o rechaza la propuesta de domicilio. Se usa en la campanita, el aviso y el detalle. */
export function RespuestaPropuesta({ solicitud, compacta = false, onRespondida }: {
  solicitud: SolicitudCliente;
  compacta?: boolean;
  onRespondida?: (s: SolicitudCliente) => void;
}) {
  const responder = useResponderSolicitud();
  const campo = useId();
  const [error, setError] = useState('');
  const [rechazando, setRechazando] = useState(false);
  const [motivo, setMotivo] = useState('');
  const [enviando, setEnviando] = useState<'aceptar' | 'rechazar' | null>(null);

  if (solicitud.estado !== 'cotizada') return null;

  const responderCon = async (aceptar: boolean) => {
    const razon = motivo.trim();
    if (!aceptar && razon && razon.length < 3) { setError('Si escribes una razón, que tenga al menos 3 letras.'); return; }
    setEnviando(aceptar ? 'aceptar' : 'rechazar');
    setError('');
    try {
      const r = await responder.mutateAsync({ id: solicitud.id, aceptar, motivo: aceptar ? undefined : razon || undefined });
      marcarLeida(claveNotificacion(r));
      setRechazando(false);
      setMotivo('');
      onRespondida?.(r);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No pudimos enviar tu respuesta. Intenta de nuevo.');
    } finally {
      setEnviando(null);
    }
  };

  return (
    <div className={`sol-propuesta${compacta ? ' compacta' : ''}`}>
      <div className="sol-propuesta-valor">
        <span>Propuesta de domicilio</span>
        {solicitud.valor != null && <b>{pesos(solicitud.valor)}</b>}
        <small>{compacta ? 'Responde si estás de acuerdo.' : 'Si aceptas, la oficina asigna el mensajero y crea la guía.'}</small>
      </div>
      {!rechazando ? <div className="sol-propuesta-acciones">
        <button type="button" className="btn ok" disabled={!!enviando} onClick={() => responderCon(true)}>{enviando === 'aceptar' ? 'Aceptando…' : 'Aceptar propuesta'}</button>
        <button type="button" className="btn sec" disabled={!!enviando} onClick={() => { setRechazando(true); setError(''); }}>No me sirve</button>
      </div> : <div className="sol-propuesta-rechazo">
        <label htmlFor={campo}>¿Por qué no? (opcional)</label>
        <textarea id={campo} rows={2} maxLength={300} value={motivo} placeholder="Ej: El valor me parece alto" onChange={e => setMotivo(e.target.value)} />
        <div className="sol-propuesta-acciones">
          <button type="button" className="btn peligro" disabled={!!enviando} onClick={() => responderCon(false)}>{enviando === 'rechazar' ? 'Rechazando…' : 'Rechazar propuesta'}</button>
          <button type="button" className="btn sec" disabled={!!enviando} onClick={() => { setRechazando(false); setMotivo(''); setError(''); }}>Volver</button>
        </div>
      </div>}
      {error && <div className="aviso alerta" role="alert">{error}</div>}
    </div>
  );
}
