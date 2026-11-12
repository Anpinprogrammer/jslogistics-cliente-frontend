/* "Mis pedidos": las guías del cliente, con filtros y páginas que corta el servidor. "Mis solicitudes" y el
   formulario de Nuevo pedido se descargan aparte, solo cuando se abren. */
import { lazy, Suspense, useEffect, useState } from 'react';
import { Calendar, ChevronRight, ClipboardCheck, ClipboardList, PackageCheck, Plus, Search, SlidersHorizontal, Truck, Undo2, X } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useSesion } from '../../auth/AuthProvider';
import { usePaginaPedidos, type FiltroPedidos } from '../../api/cliente';
import { usePersistedTab } from '../../hooks/usePersistedTab';
import { POR_PAGINA, usePorPagina } from '../../lib/pantalla';
import { hoy, pesos } from '../../lib/formato';
import { cambioPendiente, ESTADO_PEDIDO } from '../../lib/negocio';
import type { DatosCliente } from '../useDatosCliente';
import { HojaFiltros } from './HojaFiltros';
import { CargandoVista, Dialogo, EtqCambio, lineaPedido, PaginadorSinTotal } from './piezas';

const MisSolicitudes = lazy(() => import('./MisSolicitudes'));
const NuevoPedido = lazy(() => import('./NuevoPedido'));
const SUBTABS = ['pedidos', 'solicitudes'] as const;
/** Al acercar el puntero o el foco a "Nuevo pedido" se adelanta la descarga del formulario. */
const precargarNuevo = () => { import('./NuevoPedido').catch(() => { /* se reintenta al abrirlo */ }); };

export default function Pedidos({ d, abrir }: { d: DatosCliente; abrir: (g: string) => void }) {
  const [sp, setSp] = useSearchParams();
  const { usuario } = useSesion();
  const [nuevo, setNuevo] = useState(false);
  // Sub-pestañas: los pedidos (guías) y las solicitudes que todavía revisa la oficina. Va en la URL (?v=solicitudes).
  // Se recuerda al recargar (usePersistedTab: la URL y, de respaldo, sessionStorage).
  const [vista, verVista] = usePersistedTab({ ambito: 'pedidos', valores: SUBTABS, porDefecto: 'pedidos' });
  const f = (sp.get('f') || 'todos') as FiltroPedidos;
  const [buscar, setBuscarT] = useState(''), [dia, setDiaT] = useState(''), [pagina, setPagina] = useState(1), porPagina = usePorPagina();
  // Cambiar un filtro o el tamaño de la pantalla vuelve a la primera página.
  const setBuscar = (v: string) => { setBuscarT(v); setPagina(1); }, setDia = (v: string) => { setDiaT(v); setPagina(1); };
  useEffect(() => { setPagina(1); }, [porPagina]);
  const cambios = d.pedidos.filter(cambioPendiente);
  // Los contadores salen de la lista completa, que llega después de la página: mientras tanto no se muestran.
  const contar = (n: number) => (d.pedidosListos ? n : null);
  const tabs: [FiltroPedidos, string, number | null][] = [
    ['todos', 'Todos', contar(d.pedidos.length)],
    ['acep', 'Aceptados', contar(d.pedidos.filter(p => p.estado === 'aceptado').length)],
    ['ruta', 'En ruta', contar(d.pedidos.filter(p => p.estado === 'pendiente').length)],
    ['ent', 'Entregados', contar(d.pedidos.filter(p => p.estado === 'entregado').length)],
    ['dev', 'Devueltos', contar(d.pedidos.filter(p => p.estado === 'devuelto').length)],
    ['cambio', 'Cambios por recibir', contar(cambios.length)],
  ];
  const verFiltro = (k: FiltroPedidos) => { setPagina(1); setSp(prev => { const n2 = new URLSearchParams(prev); n2.set('f', k); return n2; }, { replace: true }); };
  const [hojaFiltros, setHojaFiltros] = useState(false);
  const activos = (f !== 'todos' ? 1 : 0) + (dia ? 1 : 0);
  // La página de guías solo se pide si se está viendo "Mis pedidos" (no detrás de "Mis solicitudes").
  const consulta = usePaginaPedidos({ filtro: f, buscar, dia, pagina, porPagina }, vista === 'pedidos');
  const pag = consulta.data, ps = pag?.pedidos ?? [];
  const ir = (n: number) => { setPagina(n); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  return (
    <>
      <div className="pedidos-cab">
        <div><h1>Hola, {d.cliente!.nombre}</h1><p className="sub">Tus envíos con JS Logistics y sus pruebas de entrega.</p></div>
        <button type="button" className="btn nuevo-pedido" onClick={() => setNuevo(true)} onPointerEnter={precargarNuevo} onFocus={precargarNuevo}><Plus size={18} aria-hidden="true" />Nuevo pedido</button>
      </div>
      <Dialogo abierto={nuevo} alCerrar={() => setNuevo(false)} variante="nuevo">
        <Suspense fallback={<CargandoVista modal />}><NuevoPedido cliente={d.cliente} email={usuario?.email ?? ''} alCerrar={() => setNuevo(false)} /></Suspense>
      </Dialogo>
      <div className="cuenta-tabs pedidos-tabs" role="tablist" aria-label="Pedidos y solicitudes">
        <button type="button" role="tab" id="ped-tab-pedidos" aria-controls="ped-panel" aria-selected={vista === 'pedidos'} tabIndex={vista === 'pedidos' ? 0 : -1}
          onClick={() => verVista('pedidos')} onKeyDown={e => { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { verVista('solicitudes'); (e.currentTarget.nextElementSibling as HTMLElement | null)?.focus(); } }}><Truck size={18} aria-hidden="true" /><span>Mis pedidos</span></button>
        <button type="button" role="tab" id="ped-tab-solicitudes" aria-controls="ped-panel" aria-selected={vista === 'solicitudes'} tabIndex={vista === 'solicitudes' ? 0 : -1}
          onClick={() => verVista('solicitudes')} onKeyDown={e => { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { verVista('pedidos'); (e.currentTarget.previousElementSibling as HTMLElement | null)?.focus(); } }}><ClipboardList size={18} aria-hidden="true" /><span>Mis solicitudes</span></button>
      </div>
      <div id="ped-panel" role="tabpanel" aria-labelledby={vista === 'pedidos' ? 'ped-tab-pedidos' : 'ped-tab-solicitudes'}>
      {vista === 'solicitudes' ? <Suspense fallback={<CargandoVista />}><MisSolicitudes abrir={abrir} /></Suspense> : <>
      {cambios.length > 0 && <div className="aviso alerta">Tienes {cambios.length === 1 ? '1 prenda de cambio' : cambios.length + ' prendas de cambio'} por recibir ({cambios.map(p => p.guia).join(', ')}). Cuando te la entreguen, ábrela y confirma que la recibiste.</div>}

      <div className="pedidos-toolbar">
        <div className="buscador">
          <Search aria-hidden="true" />
          <input type="search" placeholder={porPagina === POR_PAGINA.celular ? 'Buscar guía o nombre…' : 'Buscar por guía, cliente o destinatario…'} value={buscar}
            onChange={e => setBuscar(e.target.value)} aria-label="Buscar pedidos" />
          {buscar && <button type="button" className="buscador-limpiar" onClick={() => setBuscar('')} aria-label="Borrar búsqueda"><X aria-hidden="true" /></button>}
        </div>
        {/* En el celular el estado y la fecha van en una hoja inferior para dejar libre la pantalla. */}
        <button type="button" className={'filtros-boton' + (activos ? ' activo' : '')} onClick={() => setHojaFiltros(true)}
          aria-haspopup="dialog" aria-label={activos ? `Filtros (${activos} activo${activos === 1 ? '' : 's'})` : 'Filtros'}>
          <SlidersHorizontal aria-hidden="true" /><span>Filtros</span>{activos > 0 && <span className="num" aria-hidden="true">{activos}</span>}
        </button>
        <div className="fechas">
          <label className="fecha">
            <Calendar aria-hidden="true" />
            <input type="date" value={dia} max={hoy()} onChange={e => setDia(e.target.value)} aria-label="Filtrar por día" />
          </label>
          <button type="button" className="btn sec chico" aria-pressed={dia === hoy()} onClick={() => setDia(hoy())}>Hoy</button>
          {dia && <button type="button" className="btn sec chico" onClick={() => setDia('')}>Ver todos</button>}
        </div>
      </div>

      <div className="filtros" aria-label="Filtrar pedidos por estado">
        {tabs.map(([k, t, n]) => (
          <button key={k} type="button" aria-pressed={f === k}
            onClick={() => verFiltro(k)}>
            <span>{t}</span>{n != null && <span className="num">{n}</span>}
          </button>
        ))}
      </div>

      <Dialogo abierto={hojaFiltros} alCerrar={() => setHojaFiltros(false)} variante="filtros">
        <HojaFiltros estados={tabs} filtro={f} sinFiltro="todos" dia={dia} alCerrar={() => setHojaFiltros(false)}
          alAplicar={(k, d2) => { if (k !== f) verFiltro(k); if (d2 !== dia) setDia(d2); setHojaFiltros(false); }} />
      </Dialogo>

      {dia && pag && <p className="sub">Mostrando envíos de ese día · Página {pag.pagina}.</p>}
      {consulta.isError ? <div className="vacio">No se pudieron traer tus envíos. Revisa tu conexión e intenta de nuevo.</div>
      : !pag ? <div className="vacio">Cargando envíos…</div>
      : <>
        {ps.length ? <div className="lista" style={consulta.isPlaceholderData ? { opacity: .6 } : undefined}>{ps.map((p, i) => {
          const Icono = p.estado === 'entregado' ? PackageCheck : p.estado === 'devuelto' ? Undo2 : p.estado === 'aceptado' ? ClipboardCheck : Truck;
          const { clase, texto } = ESTADO_PEDIDO[p.estado];
          const valor = p.estado === 'entregado' ? p.valorCobrado : p.aCobrar;
          return (
            <button key={p.guia} type="button" className={`pedido-card pedido-entra es-${p.estado}`} style={{ animationDelay: `${i * 40}ms` }}
              onClick={() => abrir(p.guia)} aria-label={`Ver pedido ${p.guia}: ${texto}`}>
              <span className="pedido-icono"><Icono aria-hidden="true" /></span>
              <span className="pedido-info">
                <span className="pedido-linea">
                  <span className="guia">{p.guia}</span>
                  <span className={`etq ${clase}`}>{texto}</span>
                  {p.intentos.length > 0 && <span className="etq gris">{p.intentos.length} intento{p.intentos.length === 1 ? '' : 's'}</span>}
                  <EtqCambio p={p} />
                </span>
                <span className="pedido-desc">{lineaPedido(p)}</span>
              </span>
              <span className="pedido-cobro">
                <span className="pedido-valor"><b>{valor > 0 ? pesos(valor) : '—'}</b><small>Cobro al cliente</small></span>
                <span className="pedido-flecha"><ChevronRight aria-hidden="true" /></span>
              </span>
            </button>
          );
        })}</div> : <div className="vacio">{pagina > 1 ? 'No hay envíos en esta página.' : 'No hay envíos aquí.'}</div>}
        <PaginadorSinTotal pagina={pag.pagina ?? pagina} hayMas={!!pag.hayMas} ir={ir} cargando={consulta.isPlaceholderData} etiqueta="Páginas de envíos" />
      </>}
      </>}
      </div>
    </>
  );
}
