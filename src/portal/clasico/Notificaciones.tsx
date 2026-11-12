/* Campanita del portal del cliente y avisos automáticos de 10 s:
   propuesta de domicilio, pedido asignado y solicitud rechazada. La campanita vive en la barra; el panel y los
   modales se montan dentro de `.clasico` para conservar el CSS del portal. */
import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react';
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

/** Campanita + panel de notificaciones + avisos automáticos. Se monta una sola vez en la barra. */
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

  // La primera carga no llena la campanita con todo el historial: lo viejo queda leído. Las propuestas siempre quedan
  // sin leer porque piden respuesta, y las asignaciones/rechazos recientes también, por si el cliente estaba desconectado.
  useEffect(() => {
    if (!data || inicializada.current) return;
    inicializada.current = true;
    if (!notificacionesIniciadas()) {
      const recientes = 7 * 24 * 60 * 60 * 1000;
      const pendientes = notificaciones.filter(n =>
        n.clase === 'propuesta' ||
        ((n.clase === 'asignada' || n.clase === 'rechazada') && Date.now() - n.fecha < recientes)
      ).map(n => n.clave);
      inicializarLeidas(notificaciones.filter(n => !pendientes.includes(n.clave)).map(n => n.clave));
    }
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
            const puedeResponder = n.clase === 'propuesta' && n.solicitud.origen === 'portal';
            return <article key={n.clave} className={`notif-item es-${n.clase}`}>
              <span className="notif-ico"><Icono aria-hidden="true" /></span>
              <div className="notif-cuerpo">
                <b>{n.titulo}</b>
                <p>{n.texto}</p>
                {puedeResponder && <RespuestaPropuesta solicitud={n.solicitud} compacta />}
                {!puedeResponder && <button type="button" className="notif-ver" onClick={() => alVer(n)}>Ver seguimiento <ChevronRight aria-hidden="true" /></button>}
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

    {destino && <AvisoCliente solicitudes={solicitudes} destino={destino} />}
  </>;
}

type TipoAviso = 'propuesta' | 'asignada' | 'rechazada';
interface Aviso { tipo: TipoAviso; s: SolicitudCliente; clave: string }

const estadoDeAviso = (tipo: TipoAviso) => tipo === 'propuesta' ? 'cotizada' : tipo;
const claveDeAviso = (tipo: TipoAviso, s: SolicitudCliente) => `${tipo}:${s.id}:${s.actualizado}`;
const fechaDe = (s: SolicitudCliente) => new Date(s.actualizado).getTime() || 0;

/** Cola de avisos automáticos. Solo avisa de solicitudes nacidas en el portal; la landing sigue por WhatsApp.
   Si llegan varias, se muestran de a una y el siguiente espera a que el anterior se cierre o se agoten los 10 s. */
function AvisoCliente({ solicitudes, destino }: { solicitudes?: SolicitudCliente[]; destino: HTMLElement }) {
  const [actual, setActual] = useState<Aviso | null>(null);
  const actualRef = useRef<Aviso | null>(null);
  const previos = useRef<Map<string, string> | null>(null);
  const cola = useRef<Aviso[]>([]);

  const mostrar = (a: Aviso) => {
    if (actualRef.current) {
      if (actualRef.current.s.id === a.s.id) { actualRef.current = a; setActual(a); return; }
      const i = cola.current.findIndex(x => x.s.id === a.s.id);
      if (i >= 0) cola.current[i] = a;
      else cola.current.push(a);
      return;
    }
    actualRef.current = a;
    setActual(a);
  };
  const cerrar = () => {
    const siguiente = cola.current.shift() ?? null;
    actualRef.current = siguiente;
    setActual(siguiente);
  };
  // Cierra solo si ese aviso sigue en pantalla: evita que dos acciones (respuesta + refresco) salten el siguiente de la cola.
  const cerrarDe = (id: string) => { if (actualRef.current?.s.id === id) cerrar(); };

  useEffect(() => {
    if (!solicitudes) return;
    const propias = solicitudes.filter(s => s.origen === 'portal');
    const mapa = new Map(propias.map(s => [s.id, s]));
    const versiones = new Map(propias.map(s => [s.id, `${s.estado}:${s.actualizado}`]));
    if (previos.current === null) { previos.current = versiones; return; } // La primera carga no avisa de lo que ya existía.

    const eventos: Aviso[] = [];
    const agregar = (tipo: TipoAviso, s: SolicitudCliente) => eventos.push({ tipo, s, clave: claveDeAviso(tipo, s) });
    for (const s of propias) {
      const antes = previos.current.get(s.id);
      if (antes === undefined) {
        if (s.estado === 'cotizada') agregar('propuesta', s);
        else if (s.estado === 'asignada') agregar('asignada', s);
        else if (s.estado === 'rechazada') agregar('rechazada', s);
      } else if (antes !== `${s.estado}:${s.actualizado}`) {
        if (s.estado === 'cotizada') agregar('propuesta', s);
        else if (s.estado === 'asignada') agregar('asignada', s);
        else if (s.estado === 'rechazada') agregar('rechazada', s);
      }
    }
    previos.current = versiones;
    eventos.sort((a, b) => fechaDe(a.s) - fechaDe(b.s));
    eventos.forEach(mostrar);

    // Lo que estaba en cola y ya cambió de estado deja de mostrarse.
    cola.current = cola.current.filter(a => mapa.get(a.s.id)?.estado === estadoDeAviso(a.tipo));

    const enPantalla = actualRef.current;
    if (!enPantalla) return;
    const ahora = mapa.get(enPantalla.s.id);
    if (!ahora || ahora.estado !== estadoDeAviso(enPantalla.tipo)) { cerrar(); return; }
    if (ahora.actualizado !== enPantalla.s.actualizado) {
      const actualizado: Aviso = { ...enPantalla, s: ahora, clave: claveDeAviso(enPantalla.tipo, ahora) };
      actualRef.current = actualizado;
      setActual(actualizado);
    }
  }, [solicitudes]);

  if (!actual) return null;
  const alCerrar = () => cerrarDe(actual.s.id);
  return createPortal(
    actual.tipo === 'propuesta'
      ? <ModalPropuesta key={actual.clave} solicitud={actual.s} alCerrar={alCerrar} />
      : <ModalFinal key={actual.clave} solicitud={actual.s} alCerrar={alCerrar} />,
    destino
  );
}

/** Temporizador de 10 s que se detiene para siempre en cuanto la persona interactúa con el aviso. */
function useAvisoTemporizador(alCerrar: () => void) {
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
    return () => { document.body.style.overflow = anterior; };
  }, []);

  return {
    restante, detenido,
    detener: () => setDetenido(true),
    segundos: Math.max(0, Math.ceil((restante / 100) * 10)),
    transcurrido: Math.round(10 - (restante / 100) * 10),
  };
}

function ResumenSolicitud({ s }: { s: SolicitudCliente }) {
  return <dl className="aviso-prop-datos">
    <div><dt>Recoger en</dt><dd>{s.direccionRecogida}</dd></div>
    <div><dt>Entregar a</dt><dd>{s.destinatarioNombre}<br />{s.direccionEntrega}</dd></div>
    <div><dt>Paquetes</dt><dd>{s.paquetes}{s.pesoKg ? ` · ${s.pesoKg} kg` : ''}</dd></div>
    {s.valor != null && <div><dt>Domicilio</dt><dd>{pesos(s.valor)}</dd></div>}
    {s.guia && <div><dt>Guía</dt><dd>{s.guia}</dd></div>}
  </dl>;
}

function PieTemporizador({ restante, detenido, segundos, transcurrido }: {
  restante: number; detenido: boolean; segundos: number; transcurrido: number;
}) {
  return <div className={`aviso-prop-progreso${detenido ? ' detenido' : ''}`}>
    <div className="aviso-prop-barra" role="progressbar" aria-valuemin={0} aria-valuemax={10} aria-valuenow={transcurrido} aria-label="Tiempo antes de cerrar el aviso">
      <i style={{ width: `${restante}%` }} />
    </div>
    <small>{detenido ? 'Tiempo detenido. Responde o cierra el aviso cuando termines.' : `Se cierra en ${segundos} s.`}</small>
  </div>;
}

function MarcoAviso({ id, alCerrar, children }: { id: string; alCerrar: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (d && !d.open) d.showModal();
    return () => { if (d?.open) d.close(); };
  }, []);
  return <dialog ref={ref} className="aviso-prop-dialogo" aria-labelledby={id}
    onCancel={e => { e.preventDefault(); alCerrar(); }}>{children}</dialog>;
}

function ModalPropuesta({ solicitud, alCerrar }: { solicitud: SolicitudCliente; alCerrar: () => void }) {
  const t = useAvisoTemporizador(alCerrar);
  return (
    <MarcoAviso id={`aviso-prop-${solicitud.id}`} alCerrar={alCerrar}>
      <div
        className="aviso-prop"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={`aviso-prop-${solicitud.id}`}
        onPointerDown={t.detener}
        onFocusCapture={t.detener}
        onKeyDown={t.detener}
        onChange={t.detener}
        onWheel={t.detener}
      >
        <button type="button" className="aviso-prop-cerrar" aria-label="Cerrar aviso de propuesta" onClick={alCerrar}>×</button>
        <header className="aviso-prop-cab">
          <span className="aviso-prop-eyebrow">Propuesta de domicilio</span>
          <h2 id={`aviso-prop-${solicitud.id}`}>La oficina respondió tu solicitud</h2>
          <p>Revisa el valor y responde desde aquí. También quedará en tus notificaciones.</p>
        </header>
        <div className="aviso-prop-cuerpo">
          <ResumenSolicitud s={solicitud} />
          <RespuestaPropuesta solicitud={solicitud} onRespondida={alCerrar} />
        </div>
        <PieTemporizador {...t} />
      </div>
    </MarcoAviso>
  );
}

function ModalFinal({ solicitud, alCerrar }: { solicitud: SolicitudCliente; alCerrar: () => void }) {
  const t = useAvisoTemporizador(alCerrar);
  const asignada = solicitud.estado === 'asignada';
  const titulo = asignada ? 'Tu pedido fue aprobado y asignado' : 'No pudimos atender tu solicitud';
  const mensaje = asignada
    ? `Lo llevará ${solicitud.mensajeroNombre || 'un mensajero'}.${solicitud.guia ? ` La guía es ${solicitud.guia}.` : ''}`
    : (solicitud.motivoRechazo || 'La oficina no pudo atender esta solicitud.');
  return (
    <MarcoAviso id={`aviso-final-${solicitud.id}`} alCerrar={alCerrar}>
      <div
        className="aviso-prop"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={`aviso-final-${solicitud.id}`}
        onPointerDown={t.detener}
        onFocusCapture={t.detener}
        onKeyDown={t.detener}
        onChange={t.detener}
        onWheel={t.detener}
      >
        <button type="button" className="aviso-prop-cerrar" aria-label="Cerrar aviso" onClick={alCerrar}>×</button>
        <header className="aviso-prop-cab">
          <span className={`aviso-prop-eyebrow ${asignada ? 'ok' : 'mal'}`}>{asignada ? 'Pedido asignado' : 'Solicitud rechazada'}</span>
          <h2 id={`aviso-final-${solicitud.id}`}>{titulo}</h2>
          <p>{mensaje}</p>
        </header>
        <div className="aviso-prop-cuerpo">
          <ResumenSolicitud s={solicitud} />
          <button type="button" className="btn ok" onClick={alCerrar}>Entendido</button>
        </div>
        <PieTemporizador {...t} />
      </div>
    </MarcoAviso>
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

  if (solicitud.estado !== 'cotizada' || solicitud.origen !== 'portal') return null;

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
