/* "Mis solicitudes": los envíos que el cliente pidió desde el portal o la landing y que revisa la oficina.
   Es una sub-pestaña de Mis pedidos y se descarga solo al abrirla. */
import { useEffect, useState } from 'react';
import { ArrowRight, CheckCircle2, ChevronRight, ClipboardCheck, Clock, FileText, Info, MapPin, Search, SlidersHorizontal, Truck, X, XCircle } from 'lucide-react';
import { useMisSolicitudes, useSolicitudesRecientes } from '../../api/cliente';
import { SingleDatePicker } from '../../components/ui/SingleDatePicker';
import { POR_PAGINA, usePorPagina } from '../../lib/pantalla';
import { diaDe, hora, hoy, pesos } from '../../lib/formato';
import { ESTADO_PEDIDO, estadoSolicitud, pasosSolicitud } from '../../lib/negocio';
import type { SolicitudCliente } from '../../types/dominio';
import { HojaFiltros, TEXTOS_SOLICITUDES } from './HojaFiltros';
import { RespuestaPropuesta } from './Notificaciones';
import { Dialogo, PaginadorSinTotal } from './piezas';

/** Los grupos de estado de "Mis solicitudes". "Aprobadas" junta las confirmadas y las ya asignadas a un mensajero. */
type GrupoSolicitud = 'todas' | 'pendientes' | 'por-confirmar' | 'aprobadas' | 'rechazadas';
const GRUPOS_SOLICITUD: [GrupoSolicitud, string][] = [['todas', 'Todas'], ['pendientes', 'Pendientes'], ['por-confirmar', 'Por confirmar'], ['aprobadas', 'Aprobadas por JS'], ['rechazadas', 'Rechazadas']];
const LIMITE_RECIENTES = 50;
const enGrupo = (s: SolicitudCliente, g: GrupoSolicitud) =>
  g === 'todas' || (g === 'pendientes' ? s.estado === 'pendiente' : g === 'por-confirmar' ? s.estado === 'cotizada' : g === 'rechazadas' ? s.estado === 'rechazada' : s.estado === 'confirmada' || s.estado === 'asignada');
const sinTildes = (t: string) => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
/** Filtra por destinatario, teléfono, direcciones o guía, por estado y por el día (hora de Colombia) en que se pidió. */
function filtrarSolicitudes(xs: SolicitudCliente[], texto: string, g: GrupoSolicitud, dia: string) {
  const q = sinTildes(texto.trim());
  return xs.filter(s => enGrupo(s, g) && (!dia || diaDe(s.creado) === dia)
    && (!q || sinTildes([s.destinatarioNombre, s.destinatarioTelefono, s.direccionRecogida, s.direccionEntrega, s.guia ?? ''].join(' ')).includes(q)));
}
/** El valor, pero solo después de `ms` sin cambios: así la búsqueda no se recalcula con cada letra. */
function useRetraso<T>(valor: T, ms: number) {
  const [v, setV] = useState(valor);
  useEffect(() => { const t = setTimeout(() => setV(valor), ms); return () => clearTimeout(t); }, [valor, ms]);
  return v;
}

/** Lista compacta: el seguimiento y las direcciones completas viven en el detalle. */
export default function MisSolicitudes({ abrir }: { abrir: (g: string) => void }) {
  const [pagina, setPagina] = useState(1), porPagina = usePorPagina();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // Filtros: el backend todavía no filtra /solicitudes/mias, así que con un filtro puesto se filtran en el navegador
  // las últimas 50 (la misma consulta de la campanita). Sin filtros se sigue paginando en el servidor.
  const [buscar, setBuscarT] = useState(''), [grupo, setGrupoT] = useState<GrupoSolicitud>('todas'), [dia, setDiaT] = useState(''), [hoja, setHoja] = useState(false);
  const busqueda = useRetraso(buscar, 400);
  const setBuscar = (v: string) => setBuscarT(v);
  const setGrupo = (v: GrupoSolicitud) => { setGrupoT(v); setPagina(1); }, setDia = (v: string) => { setDiaT(v); setPagina(1); };
  useEffect(() => { setPagina(1); }, [busqueda]);
  const filtrando = !!busqueda.trim() || grupo !== 'todas' || !!dia;
  const activos = (grupo !== 'todas' ? 1 : 0) + (dia ? 1 : 0);
  const limpiar = () => { setBuscarT(''); setGrupoT('todas'); setDiaT(''); setPagina(1); };
  const consulta = useMisSolicitudes(pagina, porPagina), recientes = useSolicitudesRecientes();
  const pag = consulta.data, todas = recientes.data?.solicitudes;
  const cargando = filtrando ? !todas : !pag;
  const completo = !!todas && todas.length < LIMITE_RECIENTES;
  const filtradas = filtrando && todas ? filtrarSolicitudes(todas, busqueda, grupo, dia) : [];
  const ss = filtrando ? filtradas.slice((pagina - 1) * porPagina, pagina * porPagina) : pag?.solicitudes ?? [];
  const hayMas = filtrando ? filtradas.length > pagina * porPagina : !!pag?.hayMas;
  const porResponder = (todas ?? ss).filter(s => s.estado === 'cotizada').length;
  const selected = ss.find(s => s.id === selectedId) ?? null;
  const grupos: [GrupoSolicitud, string, number | null][] = GRUPOS_SOLICITUD.map(([k, t]) => [k, t, completo ? todas!.filter(s => enGrupo(s, k)).length : null]);
  useEffect(() => { setPagina(1); }, [porPagina]);
  const ir = (n: number) => { setSelectedId(null); setPagina(n); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const verGuia = (guia: string) => { setSelectedId(null); requestAnimationFrame(() => abrir(guia)); };
  if (consulta.isError && !filtrando) return <div className="vacio">No se pudieron traer tus solicitudes. Revisa tu conexión e intenta de nuevo.</div>;
  if (cargando && !filtrando) return <div className="vacio">Cargando solicitudes…</div>;
  const hayAlguna = filtrando || ss.length > 0;
  return <>
    {hayAlguna && <p className="sub sol-intro">Cuando la oficina aprueba una solicitud y le asigna mensajero, aparece en “Mis pedidos” con su número de guía. Si te propone un domicilio, puedes aceptarlo o rechazarlo aquí mismo.</p>}
    {hayAlguna && <>
      <div className="pedidos-toolbar">
        <div className="buscador">
          <Search aria-hidden="true" />
          <input type="search" placeholder={porPagina === POR_PAGINA.celular ? 'Buscar destinatario…' : 'Buscar destinatario, dirección o guía…'} value={buscar}
            onChange={e => setBuscar(e.target.value)} aria-label="Buscar solicitudes" />
          {buscar && <button type="button" className="buscador-limpiar" onClick={() => setBuscar('')} aria-label="Borrar búsqueda"><X aria-hidden="true" /></button>}
        </div>
        <button type="button" className={'filtros-boton' + (activos ? ' activo' : '')} onClick={() => setHoja(true)}
          aria-haspopup="dialog" aria-label={activos ? `Filtros (${activos} activo${activos === 1 ? '' : 's'})` : 'Filtros'}>
          <SlidersHorizontal aria-hidden="true" /><span>Filtros</span>{activos > 0 && <span className="num" aria-hidden="true">{activos}</span>}
        </button>
        <div className="fechas">
          <div className="fecha-sdp"><SingleDatePicker value={dia} onChange={setDia} max={hoy()} placeholder="Sin fecha" etiqueta="Filtrar por día" /></div>
          <button type="button" className="btn sec chico" aria-pressed={dia === hoy()} onClick={() => setDia(hoy())}>Hoy</button>
          {dia && <button type="button" className="btn sec chico" onClick={() => setDia('')}>Ver todas</button>}
        </div>
      </div>
      <div className="filtros" aria-label="Filtrar solicitudes por estado">
        {grupos.map(([k, t, n]) => (
          <button key={k} type="button" aria-pressed={grupo === k} onClick={() => setGrupo(k)}>
            <span>{t}</span>{n != null && <span className="num">{n}</span>}
          </button>
        ))}
      </div>
      <Dialogo abierto={hoja} alCerrar={() => setHoja(false)} variante="filtros">
        <HojaFiltros estados={grupos} filtro={grupo} sinFiltro="todas" dia={dia} textos={TEXTOS_SOLICITUDES} alCerrar={() => setHoja(false)}
          alAplicar={(k, d2) => { if (k !== grupo) setGrupo(k); if (d2 !== dia) setDia(d2); setHoja(false); }} />
      </Dialogo>
      {filtrando && todas && !completo && <p className="sub">Buscando entre tus últimas {LIMITE_RECIENTES} solicitudes.</p>}
    </>}
    {porResponder > 0 && <div className="sol-aviso sol-aviso-accion" role="status"><b>{porResponder === 1 ? 'Tienes una propuesta por responder.' : `Tienes ${porResponder} propuestas por responder.`}</b> Abre la solicitud para aceptar o rechazar el domicilio.</div>}
    {cargando ? <div className="vacio">Buscando solicitudes…</div> : null}
    {cargando ? null : ss.length ? <>
      <div className="sol-rows-desktop" style={consulta.isPlaceholderData ? { opacity: .6 } : undefined}>
        {ss.map(s => {
          const estado = estadoSolicitud(s);
          const EstadoIcono = s.estado === 'rechazada' ? XCircle : s.estado === 'confirmada' || s.estado === 'asignada' ? CheckCircle2 : Clock;
          return <button key={s.id} type="button" className={`sol-row es-${s.estado}`} onClick={() => setSelectedId(s.id)} aria-label={`Ver seguimiento de solicitud para ${s.destinatarioNombre}: ${estado.texto}`}>
            <span className="sol-row-estado"><span className="sol-row-icono"><EstadoIcono aria-hidden="true" /></span><span className="sol-row-identidad"><span className={`etq ${estado.clase}`}>{estado.texto}</span>{s.guia && <b>{s.guia}</b>}<small>Pedida {hora(s.creado)}</small></span></span>
            <span className="sol-row-ruta"><span className="sol-row-ruta-linea"><span>{s.direccionRecogida}</span><ArrowRight aria-hidden="true" /><strong>{s.destinatarioNombre} · {s.direccionEntrega}</strong></span><small>{s.paquetes} paquete{s.paquetes === 1 ? '' : 's'}{s.pesoKg ? ` · ${s.pesoKg} kg` : ''}</small></span>
            <span className="sol-row-valor"><b>{s.valor != null ? pesos(s.valor) : 'Por definir'}</b><small>Domicilio</small></span>
            <span className="sol-row-accion">Ver seguimiento <ChevronRight aria-hidden="true" /></span>
          </button>;
        })}
      </div>
      <div className="sol-rows-mobile" style={consulta.isPlaceholderData ? { opacity: .6 } : undefined}>
        {ss.map(s => {
          const estado = estadoSolicitud(s);
          return <button key={s.id} type="button" className={`sol-row-movil es-${s.estado}`} onClick={() => setSelectedId(s.id)} aria-label={`Ver seguimiento de solicitud para ${s.destinatarioNombre}: ${estado.texto}`}>
            <span className="sol-movil-info"><span className="sol-movil-nombre"><i aria-hidden="true" /> <b>{s.destinatarioNombre}</b></span><span className="sol-movil-meta"><span>{estado.texto}</span><span aria-hidden="true">·</span><span>{new Date(s.creado).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}</span>{s.guia && <span className="sol-movil-guia">{s.guia}</span>}</span></span>
            <span className="sol-movil-final"><b>{s.valor != null ? pesos(s.valor) : 'Por definir'}</b><small>{s.paquetes} paquete{s.paquetes === 1 ? '' : 's'}</small></span>
            <span className="sol-movil-flecha"><Info aria-hidden="true" /></span>
          </button>;
        })}
      </div>
    </> : <div className="vacio">{filtrando ? <>No encontramos solicitudes con esos filtros. <button type="button" className="btn sec chico" onClick={limpiar}>Limpiar filtros</button></> : pagina > 1 ? 'No hay más solicitudes en esta página.' : 'Todavía no tienes solicitudes. Pide un envío con “Nuevo pedido” y aquí verás si la oficina lo aprueba.'}</div>}
    {!cargando && <PaginadorSinTotal pagina={pagina} hayMas={hayMas} ir={ir} cargando={!filtrando && consulta.isPlaceholderData} etiqueta="Páginas de solicitudes" />}
    <Dialogo abierto={!!selected} alCerrar={() => setSelectedId(null)} variante="solicitud">
      {selected && <DetalleSolicitud sol={selected} alCerrar={() => setSelectedId(null)} verGuia={verGuia} />}
    </Dialogo>
  </>;
}

function DetalleSolicitud({ sol, alCerrar, verGuia }: { sol: SolicitudCliente; alCerrar: () => void; verGuia: (guia: string) => void }) {
  const estado = estadoSolicitud(sol), pasos = pasosSolicitud(sol);
  const progreso = sol.estado === 'pendiente' || sol.estado === 'cotizada' ? '33.333%' : '66.666%';
  return <>
    <header className="sol-modal-cab"><div><span className={`etq ${estado.clase}`}>{estado.texto}</span><p>Solicitada {hora(sol.creado)}</p></div><button type="button" className="pedido-modal-cerrar" onClick={alCerrar} aria-label="Cerrar detalle de solicitud"><X aria-hidden="true" /></button></header>
    <div className="sol-modal-cuerpo">
      <div className="pod-stepper sol-stepper" aria-label="Seguimiento de la solicitud">
        <div className="pod-stepper-track"><span className="pod-stepper-linea" /><span className="pod-stepper-progreso" style={{ width: progreso }} />
          {pasos.map((p, i) => {
            const Ic = i === 0 ? FileText : i === 1 ? ClipboardCheck : p.rechazado ? XCircle : CheckCircle2;
            return <div key={i} className={`pod-paso${p.completado ? ' completado' : ''}${p.actual ? ' actual' : ''}${p.rechazado ? ' rechazado' : ''}`}>
              <span className="pod-dot"><Ic aria-hidden="true" /></span><span className="pod-paso-label">{p.label}</span><span className="pod-paso-fecha">{i === 2 && p.rechazado ? hora(sol.actualizado) : p.detalle}</span>
            </div>;
          })}
        </div>
      </div>
      {sol.estado === 'rechazada' && <div className="sol-rechazo" role="note"><b>Razón del rechazo</b><p>{sol.motivoRechazo || 'La oficina no registró la razón. Escríbenos por WhatsApp.'}</p></div>}
      {sol.estado === 'cotizada' && <RespuestaPropuesta solicitud={sol} />}
      <dl className="sol-datos">
        <div><dt><MapPin size={14} aria-hidden="true" /> Recoger en</dt><dd>{sol.direccionRecogida}</dd></div>
        <div><dt><Truck size={14} aria-hidden="true" /> Entregar a</dt><dd>{sol.destinatarioNombre}{sol.destinatarioTelefono ? ' · ' + sol.destinatarioTelefono : ''}<br />{sol.direccionEntrega}</dd></div>
        <div><dt>Paquetes</dt><dd>{sol.paquetes}{sol.pesoKg ? ` · ${sol.pesoKg} kg` : ''}</dd></div>
        <div><dt>Domicilio</dt><dd>{sol.valor != null ? pesos(sol.valor) : 'Por definir'}</dd></div>
      </dl>
      {sol.guia ? <button type="button" className="btn sol-modal-accion" onClick={() => verGuia(sol.guia!)}>Ver guía {sol.guia}{sol.pedidoEstado ? ` · ${ESTADO_PEDIDO[sol.pedidoEstado].texto}` : ''}<ChevronRight size={17} aria-hidden="true" /></button>
        : <button type="button" className="btn sec sol-modal-accion" onClick={alCerrar}>Cerrar</button>}
    </div>
  </>;
}
