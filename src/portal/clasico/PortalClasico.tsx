/**
 * Vista del cliente de la app actual (pintarCliente, pintarInicioCliente, verPedidoCliente y verRecibo de
 * js-logistics/app/js/app.js), pasada a React sin cambiar lo que se ve: mismo HTML, mismas clases y el mismo
 * estilos.css. Para el dueño que prefiere que sus clientes sigan viendo exactamente lo de siempre.
 */
import { useEffect, useState, type FormEvent } from 'react';
import { Route, Routes, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { AlertTriangle, Bot, Calendar, CheckCircle2, ChevronRight, Eye, EyeOff, FileText, Image as ImageIcon, KeyRound, Lock, Mail, MapPin, Maximize2, Moon, PackageCheck, Phone, Receipt, RotateCcw, Save, Search, Settings, ShieldCheck, Store, Sun, Truck, Undo2, X } from 'lucide-react';
import './clasico.css';
import { useSesion } from '../../auth/AuthProvider';
import { useActualizarPerfilCliente, useConfirmarCambio, useCuentaCliente, useMovimientosCliente, usePaginaPedidos, usePruebas, type FiltroPedidos } from '../../api/cliente';
import { authApi } from '../../api/auth';
import { usePorPagina, usePorPaginaCuenta } from '../../lib/pantalla';
import { diaCorto, diaDe, fechaLarga, hoy, hora, moverDia, pct, pesos, pesosConSigno } from '../../lib/formato';
import {
  cambioPendiente, cerrado, EMPRESA, entregasPorDia, gastoDe, metodoTxt, MOTIVOS, pagoDomi,
  reciboDelDia, resumenCliente, saldoPedido, servicio, textoDomi, textoSaldo, ultimaActividad, type Recibo,
} from '../../lib/negocio';
import { useDatosCliente, type DatosCliente } from '../useDatosCliente';
import { useTheme } from '../../hooks/useTheme';
import { JSBOT_ABRIR } from '../../components/jsbot/JSBot';
import { Icono } from './iconos';
import { Cabecera, Columnas, Dialogo, Dona, EtqCambio, EtqDash, Foto, Paginador } from './piezas';

const VERDE = 'var(--verde)', ROJO = 'var(--rojo)';
const LOGO = '/img/clasico/logo.png';

function useToast() {
  const [txt, setTxt] = useState('');
  useEffect(() => { if (!txt) return; const t = setTimeout(() => setTxt(''), 3200); return () => clearTimeout(t); }, [txt]);
  return { toast: setTxt, nodo: txt ? <div className="toast" role="status">{txt}</div> : null };
}

export default function PortalClasico() {
  const d = useDatosCliente();
  const { usuario, salir } = useSesion();
  const { theme, toggleTheme } = useTheme();
  const nav = useNavigate(), loc = useLocation();
  const [sp, setSp] = useSearchParams();
  const { toast, nodo: toastNodo } = useToast();
  const [menuColapsado, setMenuColapsado] = useState(false);
  const ver = sp.get('ver');
  const abrir = (guia: string) => setSp(prev => { const n = new URLSearchParams(prev); n.set('ver', guia); return n; });
  const cerrar = () => setSp(prev => { const n = new URLSearchParams(prev); n.delete('ver'); return n; }, { replace: true });

  const tab = loc.pathname.endsWith('/pedidos') ? 'pedidos' : loc.pathname.endsWith('/cuenta') ? 'cuenta' : 'inicio';
  const enRuta = d.pedidos.filter(p => p.estado === 'pendiente').length, cambios = d.pedidos.filter(cambioPendiente);
  const items: [string, string, number?][] = [['inicio', 'Inicio'], ['pedidos', 'Mis pedidos', enRuta + cambios.length], ['cuenta', 'Mi cuenta']];
  // En el escritorio el menú va agrupado por sección, como el de la oficina; en el celular se muestran las pestañas de siempre.
  const SECCIONES: [string, string[]][] = [['Principal', ['inicio', 'pedidos']], ['Mi cuenta', ['cuenta']]];
  const ir = (k: string, filtro?: string) => { nav('/cliente' + (k === 'inicio' ? '' : '/' + k) + (filtro ? '?f=' + filtro : '')); scrollTo(0, 0); };
  const boton = ([k, t, n]: [string, string, number?]) => (
    <button key={k} onClick={() => ir(k)} aria-current={tab === k ? 'page' : undefined} aria-label={t} title={t}>
      <Icono n={k} /><span className="t">{t}</span>{n ? <span className="num">{n}</span> : null}
    </button>
  );
  const botones = items.map(boton);
  const grupos = SECCIONES.map(([titulo, claves]) => {
    const xs = items.filter(([k]) => claves.includes(k));
    return xs.length ? <div className="lat-grupo" key={titulo}><span className="lat-titulo">{titulo}</span>{xs.map(boton)}</div> : null;
  });

  const h = new Date().getHours(), nom = usuario?.nombre || '';
  const corto = nom.includes('@') ? nom.split('@')[0] : nom.split(' ')[0];
  const iniciales = nom.replace(/@.*/, '').split(/\s+/).filter(Boolean).slice(0, 2).map(x => x[0]).join('').toUpperCase();

  // La barra del navegador en celular (theme-color) también acompaña al tema del portal.
  useEffect(() => {
    const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (!meta) return;
    const anterior = meta.content;
    meta.content = theme === 'dark' ? '#0f172a' : '#f8fafc';
    return () => { meta.content = anterior; };
  }, [theme]);

  let vista;
  if (d.error) vista = <><h1>Hola</h1><div className="vacio">{d.error.message}</div></>;
  else if (d.cargando) vista = <><h1>Hola</h1><div className="vacio">Cargando…</div></>;
  else if (!d.cliente) vista = <><h1>Hola</h1><div className="vacio">Tu cuenta todavía no está asociada a un cliente. Escríbele a JS Logistics.</div></>;
  else vista = (
    <Routes>
      <Route index element={<Inicio d={d} ir={ir} abrir={abrir} />} />
      <Route path="pedidos" element={<Pedidos d={d} abrir={abrir} />} />
      <Route path="cuenta" element={<Cuenta d={d} toast={toast} />} />
      <Route path="*" element={<Inicio d={d} ir={ir} abrir={abrir} />} />
    </Routes>
  );

  return (
    <div className={'clasico' + (menuColapsado ? ' menu-colapsado' : '')} data-theme={theme}>
      <aside className="lateral">
        <div className="marca-lat">
          <img src={LOGO} alt="" />
          <div className="marca-lat-txt"><b>JS Logistics</b><small>Servir es nuestra labor</small></div>
        </div>
        <nav id="navLateral" aria-label="Menú principal">{grupos}</nav>
        <div className="lat-pie">
          <button type="button" className="plegar" onClick={() => setMenuColapsado(v => !v)}
            aria-label={menuColapsado ? 'Expandir menú' : 'Colapsar menú'}
            title={menuColapsado ? 'Expandir menú' : 'Colapsar menú'}>
            {menuColapsado ? <Icono n="expandir" /> : <><span>Colapsar menú</span><Icono n="contraer" /></>}
          </button>
        </div>
      </aside>
      <header className="barra">
        <div className="marca"><img src={LOGO} alt="" /><span>JS Logistics<small>Servir es nuestra labor</small></span></div>
        <div className="saludo"><b>{h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches'}{corto ? ', ' + corto : ''}</b><span>{fechaLarga(hoy())}</span></div>
        <button type="button" className="jsbot-acceso" onClick={() => window.dispatchEvent(new Event(JSBOT_ABRIR))}
          aria-label="Abrir asistente JSBot" title="Abrir asistente JSBot">
          <Bot aria-hidden="true" /><span>JSBot</span>
          <span className="jsbot-estado" aria-hidden="true" />
        </button>
        <button type="button" className="tema" data-tema={theme} onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}>
          {theme === 'dark' ? <Sun /> : <Moon />}
        </button>
        {nom && <span className="avatar" aria-hidden="true">{iniciales}</span>}
        <button className="salir" aria-label="Cerrar sesión" onClick={() => salir().then(() => nav('/'))}><Icono n="salir" /><span>Salir</span></button>
      </header>
      <main>{vista}</main>
      <nav className="pestanas" aria-label="Secciones">{botones}</nav>
      <Dialogo abierto={!!ver} alCerrar={cerrar} variante="pedido">
        {ver && <VerPedido guia={ver} d={d} alCerrar={cerrar} toast={toast} />}
      </Dialogo>
      {toastNodo}
    </div>
  );
}

/* ---------------------------- Inicio (pintarInicioCliente) ---------------------------- */
function Kpi({ ico, lbl, val, pie, alClic, cls = '' }: { ico: string; lbl: string; val: React.ReactNode; pie: string; alClic: () => void; cls?: string }) {
  return <button className={'kpi ' + cls} onClick={alClic}><span className="lbl"><Icono n={ico} />{lbl}</span><b>{val}</b><small>{pie}</small></button>;
}

function Inicio({ d, ir, abrir }: { d: DatosCliente; ir: (k: string, f?: string) => void; abrir: (g: string) => void }) {
  const h = hoy(), desde = moverDia(h, -29), r = resumenCliente(d.pedidos, h, desde);
  const dias = entregasPorDia(d.pedidos, 30, h, moverDia), tot30 = dias.reduce((a, x) => a + x.n, 0);
  const cambios = d.pedidos.filter(cambioPendiente);
  const ultimos = [...d.pedidos].sort((a, b) => ultimaActividad(b) - ultimaActividad(a)).slice(0, 6);
  const cuenta = useCuentaCliente(1, 6);
  const movs = cuenta.data?.filas ?? [], s = cuenta.data?.saldo ?? 0;
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

const lineaPedido = (p: DatosCliente['pedidos'][number]) =>
  p.estado === 'entregado' ? 'Recibió ' + (p.destinatario || '') + ' · ' + hora(p.entregado!)
  : p.estado === 'devuelto' ? (MOTIVOS[p.motivoDev] || 'Devuelto') + ' · ' + hora(p.entregado!) : 'Salió ' + hora(p.creado);

/* ---------------------------- Mis pedidos ---------------------------- */
function Pedidos({ d, abrir }: { d: DatosCliente; abrir: (g: string) => void }) {
  const [sp, setSp] = useSearchParams();
  const f = (sp.get('f') || 'todos') as FiltroPedidos;
  const [buscar, setBuscarT] = useState(''), [dia, setDiaT] = useState(''), [pagina, setPagina] = useState(1), porPagina = usePorPagina();
  // Cambiar un filtro vuelve a la primera página.
  const setBuscar = (v: string) => { setBuscarT(v); setPagina(1); }, setDia = (v: string) => { setDiaT(v); setPagina(1); };
  const cambios = d.pedidos.filter(cambioPendiente);
  const tabs: [FiltroPedidos, string, number][] = [
    ['todos', 'Todos', d.pedidos.length],
    ['ruta', 'En ruta', d.pedidos.filter(p => p.estado === 'pendiente').length],
    ['ent', 'Entregados', d.pedidos.filter(p => p.estado === 'entregado').length],
    ['dev', 'Devueltos', d.pedidos.filter(p => p.estado === 'devuelto').length],
    ['cambio', 'Cambios por recibir', cambios.length],
  ];
  const consulta = usePaginaPedidos({ filtro: f, buscar, dia, pagina, porPagina });
  const pag = consulta.data, ps = pag?.pedidos ?? [];
  const ir = (n: number) => { setPagina(n); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  return (
    <>
      <h1>Hola, {d.cliente!.nombre}</h1><p className="sub">Tus envíos con JS Logistics y sus pruebas de entrega.</p>
      {cambios.length > 0 && <div className="aviso alerta">Tienes {cambios.length === 1 ? '1 prenda de cambio' : cambios.length + ' prendas de cambio'} por recibir ({cambios.map(p => p.guia).join(', ')}). Cuando te la entreguen, ábrela y confirma que la recibiste.</div>}

      <div className="pedidos-toolbar">
        <div className="buscador">
          <Search aria-hidden="true" />
          <input type="search" placeholder="Buscar por guía, cliente o destinatario…" value={buscar}
            onChange={e => setBuscar(e.target.value)} aria-label="Buscar pedidos" />
        </div>
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
            onClick={() => { setPagina(1); setSp(prev => { const n2 = new URLSearchParams(prev); n2.set('f', k); return n2; }, { replace: true }); }}>
            <span>{t}</span><span className="num">{n}</span>
          </button>
        ))}
      </div>

      {dia && pag && <p className="sub">{pag.total} envío{pag.total === 1 ? '' : 's'} de ese día</p>}
      {consulta.isError ? <div className="vacio">No se pudieron traer tus envíos. Revisa tu conexión e intenta de nuevo.</div>
      : !pag ? <div className="vacio">Cargando envíos…</div>
      : ps.length ? <><div className="lista" style={consulta.isPlaceholderData ? { opacity: .6 } : undefined}>{ps.map((p, i) => {
        const Icono = p.estado === 'entregado' ? PackageCheck : p.estado === 'devuelto' ? Undo2 : Truck;
        const [clase, texto] = p.estado === 'entregado' ? ['ent', 'Entregado'] : p.estado === 'devuelto' ? ['dev', 'Devuelto'] : ['ruta', 'En ruta'];
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
      })}</div>
      <Paginador pagina={pag.pagina} paginas={pag.paginas} total={pag.total} porPagina={pag.porPagina} ir={ir} cargando={consulta.isPlaceholderData} /></>
      : <div className="vacio">No hay envíos aquí.</div>}
    </>
  );
}

/* ---------------------------- Detalle (verPedidoCliente) ---------------------------- */
function VerPedido({ guia, d, alCerrar, toast }: { guia: string; d: DatosCliente; alCerrar: () => void; toast: (t: string) => void }) {
  const p = d.pedidos.find(x => x.guia === guia);
  const pruebas = usePruebas(p ? guia : null);
  const confirmar = useConfirmarCambio();
  const [preguntar, setPreguntar] = useState(false);
  const [visor, setVisor] = useState<{ url: string; titulo: string } | null>(null);

  if (!p) return (
    <>
      <header className="pedido-modal-cab">
        <div className="pedido-modal-titulo"><div className="pedido-modal-linea"><h3>{guia}</h3></div></div>
        <button type="button" className="pedido-modal-cerrar" aria-label="Cerrar" onClick={alCerrar}><X /></button>
      </header>
      <div className="pedido-modal-cuerpo"><div className="vacio">No encontramos este envío.</div></div>
    </>
  );

  const estadoTexto = p.estado === 'entregado' ? 'Entregado' : p.estado === 'devuelto' ? 'Devuelto' : 'En ruta';
  const estadoClase = p.estado === 'entregado' ? 'ent' : p.estado === 'devuelto' ? 'dev' : 'ruta';
  const valorCab = p.estado === 'entregado' ? p.valorCobrado : p.aCobrar;
  const cambioPend = p.cambio && !p.cambioRecibido;
  const cambioOk = p.cambio && !!p.cambioRecibido;

  const pasoFinal = cambioPend
    ? { label: 'Cambio por recibir', fecha: 'Pendiente', Icono: RotateCcw, completado: false, actual: p.estado !== 'pendiente' }
    : cambioOk
    ? { label: 'Cambio recibido', fecha: hora(p.cambioRecibido!), Icono: RotateCcw, completado: true, actual: false }
    : p.estado === 'devuelto'
    ? { label: 'Devuelto', fecha: p.entregado ? hora(p.entregado) : 'Pendiente', Icono: RotateCcw, completado: true, actual: false }
    : p.estado === 'entregado'
    ? { label: 'Entregado', fecha: p.entregado ? hora(p.entregado) : 'Pendiente', Icono: CheckCircle2, completado: true, actual: false }
    : { label: 'Entregado', fecha: 'Pendiente', Icono: CheckCircle2, completado: false, actual: false };
  const pasos = [
    { label: 'Solicitado', fecha: diaCorto(diaDe(p.creado)), Icono: FileText, completado: true, actual: false },
    { label: 'En ruta', fecha: hora(p.creado), Icono: Truck, completado: p.estado !== 'pendiente', actual: p.estado === 'pendiente' },
    pasoFinal,
  ];
  const progreso = p.estado === 'pendiente' && !cambioOk ? '33.333%' : '66.666%';

  const novedades = [
    ...p.intentos.map((i, k) => ({
      obs: `Intento ${k + 1}: ${MOTIVOS[i.motivo] || 'Novedad'}${i.nota ? ' · ' + i.nota : ''}`,
      fecha: hora(i.fecha),
    })),
    ...(p.estado === 'devuelto' ? [{
      obs: `Devuelto${p.motivoDev ? ': ' + (MOTIVOS[p.motivoDev] || '') : ''}${p.notaDev ? ' · ' + p.notaDev : ''}`,
      fecha: p.entregado ? hora(p.entregado) : '',
    }] : []),
  ];

  const nombres: Record<string, string> = {
    salida: 'Foto de salida',
    entrega: p.estado === 'devuelto' ? 'Evidencia de devolución' : 'Prueba de entrega',
    firma: 'Firma de quien recibió',
  };

  return (
    <>
      <header className="pedido-modal-cab">
        <div className="pedido-modal-titulo">
          <div className="pedido-modal-linea">
            <h3>{p.guia}</h3>
            <span className={`etq ${estadoClase}`}>{estadoTexto}</span>
            {p.intentos.length > 0 && <span className="etq sin">{p.intentos.length} intento{p.intentos.length === 1 ? '' : 's'}</span>}
          </div>
          <p>{p.estado === 'entregado' ? 'Valor cobrado' : 'Valor a cobrar'}: <b>{pesos(valorCab)}</b></p>
        </div>
        <button type="button" className="pedido-modal-cerrar" aria-label="Cerrar" onClick={alCerrar}><X /></button>
      </header>

      <div className="pedido-modal-cuerpo">
        <section className="pod-stepper">
          <span className="pod-seccion-titulo">Línea de tiempo del envío</span>
          <div className="pod-stepper-track">
            <span className="pod-stepper-linea" />
            <span className="pod-stepper-progreso" style={{ width: progreso }} />
            {pasos.map(({ label, fecha, Icono, completado, actual }) => (
              <div key={label} className={`pod-paso${completado ? ' completado' : ''}${actual ? ' actual' : ''}`}>
                <span className="pod-dot"><Icono aria-hidden="true" /></span>
                <span className="pod-paso-label">{label}</span>
                <span className="pod-paso-fecha">{fecha}</span>
              </div>
            ))}
          </div>
        </section>

        {novedades.length > 0 && (
          <section className="pod-alerta">
            <span className="pod-alerta-titulo"><AlertTriangle aria-hidden="true" /> Registro de novedades / intentos</span>
            <ul>
              {novedades.map((n, i) => <li key={i}><span>{n.obs}</span><span>{n.fecha}</span></li>)}
            </ul>
          </section>
        )}

        {p.cambio && (cambioOk ? (
          <section className="pod-aviso ok">
            <span className="pod-aviso-titulo"><CheckCircle2 aria-hidden="true" /> Cambio recibido</span>
            <p>Recibiste la prenda de cambio el {hora(p.cambioRecibido!)}.</p>
          </section>
        ) : (
          <section className="pod-aviso cambio">
            <span className="pod-aviso-titulo"><RotateCcw aria-hidden="true" /> {preguntar ? 'Confirmar cambio' : 'Prenda de cambio pendiente'}</span>
            <p>{preguntar ? '¿Confirmas que ya recibiste la prenda de cambio de este envío?' : 'JS Logistics tiene una prenda de cambio de este envío para entregarte.'}</p>
            <div className="pod-aviso-acciones">
              {preguntar ? (
                <>
                  <button type="button" className="btn sec chico" onClick={() => setPreguntar(false)}>Cancelar</button>
                  <button type="button" className="btn ok chico" disabled={confirmar.isPending} onClick={() => confirmar.mutate(guia, {
                    onSuccess: () => toast('¡Gracias! Cambio confirmado'), onError: () => toast('No se pudo confirmar. Revisa la conexión.'),
                    onSettled: () => setPreguntar(false) })}>Sí, la recibí</button>
                </>
              ) : <button type="button" className="btn ok chico" onClick={() => setPreguntar(true)}>Confirmar que recibí el cambio</button>}
            </div>
          </section>
        ))}

        <section className="pod-galeria">
          <span className="pod-seccion-titulo">Pruebas físicas y fotos asociadas ({pruebas.isLoading ? '…' : pruebas.data?.length ?? 0})</span>
          {pruebas.isLoading ? <div className="pod-galeria-vacia"><span className="sub">Cargando fotos…</span></div>
            : pruebas.isError ? <div className="pod-galeria-vacia"><span className="sub">No se pudieron cargar las fotos.</span></div>
            : !pruebas.data?.length ? <div className="pod-galeria-vacia"><ImageIcon aria-hidden="true" /><span className="sub">Aún no hay fotos adjuntas para este pedido.</span></div>
            : <div className="pod-galeria-grid">{pruebas.data.map((a, i) => {
              const titulo = nombres[a.tipo] || `Prueba ${i + 1}`;
              return (
                <button key={`${a.tipo}-${i}`} type="button" className="pod-foto" onClick={() => setVisor({ url: a.url, titulo })} aria-label={`Ampliar ${titulo}`}>
                  <img src={a.url} alt={titulo} loading="lazy" />
                  <span className="pod-foto-velo"><Maximize2 aria-hidden="true" /> Ampliar</span>
                  <span className="pod-foto-pie">{titulo}</span>
                </button>
              );
            })}</div>}
        </section>

        <section className="pod-detalles">
          <span className="pod-seccion-titulo">Detalles del envío</span>
          <dl className="pod-datos">
            <dt>Salió</dt><dd>{hora(p.creado)}</dd>
            {p.aCobrar > 0 && <><dt>Valor a cobrar</dt><dd>{pesos(p.aCobrar)}</dd></>}
            {p.estado === 'entregado' && <><dt>Entregado</dt><dd>{hora(p.entregado!)}</dd><dt>Recibió</dt><dd>{p.destinatario}</dd><dt>Cobrado</dt><dd>{pesos(p.valorCobrado)}</dd><dt>Método</dt><dd>{metodoTxt(p)}</dd></>}
            {p.estado === 'devuelto' && <><dt>Devuelto</dt><dd>{hora(p.entregado!)}</dd><dt>Motivo</dt><dd>{MOTIVOS[p.motivoDev] || ''}</dd></>}
            {cerrado(p) && <>
              <dt>Domicilio</dt><dd>{pesos(servicio(p))}</dd>
              {gastoDe(p) > 0 && <><dt>Flete / gasto del envío</dt><dd>{pesos(gastoDe(p))}{p.gastoNota ? ' · ' + p.gastoNota : ''}</dd></>}
              {p.domiPagado && <><dt>Pagaste aparte</dt><dd>{pesos(pagoDomi(p))}</dd></>}
              <dt>Efecto en tu saldo</dt><dd className={saldoPedido(p) < 0 ? 'neg' : 'pos'}>{pesos(saldoPedido(p))}</dd>
            </>}
          </dl>
        </section>
      </div>

      {visor && (
        <div className="pod-visor" role="dialog" aria-modal="true" aria-label="Foto ampliada" onClick={() => setVisor(null)}>
          <figure onClick={e => e.stopPropagation()}>
            <img src={visor.url} alt={visor.titulo} />
            <figcaption>{visor.titulo}</figcaption>
          </figure>
          <button type="button" className="pod-visor-cerrar" aria-label="Cerrar foto" onClick={() => setVisor(null)}><X /></button>
        </div>
      )}
    </>
  );
}

/* ---------------------------- Mi cuenta ---------------------------- */
function Cuenta({ d, toast }: { d: DatosCliente; toast: (t: string) => void }) {
  const { usuario, refrescar } = useSesion();
  const actualizarPerfil = useActualizarPerfilCliente();
  const [tab, setTab] = useState<'movimientos' | 'configuracion'>('movimientos');
  const [diaRec, setDiaRec] = useState(hoy());
  const [recibo, setRecibo] = useState<Recibo | null>(null);
  const [perfil, setPerfil] = useState({ nombre: d.cliente?.nombre ?? '', email: usuario?.email ?? '', telefono: d.cliente?.telefono ?? '', direccionRecogida: d.cliente?.direccionRecogida ?? '' });
  const [clave, setClave] = useState({ actual: '', nueva: '', confirmar: '' });
  const [claveCorreo, setClaveCorreo] = useState('');
  const [mostrarClave, setMostrarClave] = useState({ actual: false, nueva: false, confirmar: false, email: false });
  const [guardandoClave, setGuardandoClave] = useState(false);
  const [errorPerfil, setErrorPerfil] = useState('');
  const [errorClave, setErrorClave] = useState('');
  useEffect(() => { setPerfil({ nombre: d.cliente?.nombre ?? '', email: usuario?.email ?? '', telefono: d.cliente?.telefono ?? '', direccionRecogida: d.cliente?.direccionRecogida ?? '' }); }, [d.cliente?.nombre, d.cliente?.telefono, d.cliente?.direccionRecogida, usuario?.email]);
  const guardarPerfil = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setErrorPerfil('');
    const nombre = perfil.nombre.trim(), email = perfil.email.trim(), telefono = perfil.telefono.trim(), direccionRecogida = perfil.direccionRecogida.trim();
    if (!nombre || !email) { setErrorPerfil('Nombre y correo son obligatorios.'); return; }
    const cambioCorreo = email.toLowerCase() !== usuario?.email.toLowerCase();
    if (cambioCorreo && !claveCorreo) { setErrorPerfil('Ingresa tu contraseña actual para cambiar el correo.'); return; }
    try {
      await actualizarPerfil.mutateAsync({ nombre, email, telefono, direccionRecogida, ...(cambioCorreo ? { claveActual: claveCorreo } : {}) });
      await refrescar(); toast('Perfil actualizado');
      setClaveCorreo('');
    } catch (error) { setErrorPerfil(error instanceof Error ? error.message : 'No pudimos guardar el perfil.'); }
  };
  const guardarClave = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setErrorClave('');
    if (clave.nueva.length < 10) { setErrorClave('La contraseña nueva debe tener al menos 10 caracteres.'); return; }
    if (clave.nueva !== clave.confirmar) { setErrorClave('Las contraseñas nuevas no coinciden.'); return; }
    setGuardandoClave(true);
    try { await authApi.cambiarClave(clave.actual, clave.nueva); setClave({ actual: '', nueva: '', confirmar: '' }); toast('Contraseña actualizada'); }
    catch (error) { setErrorClave(error instanceof Error ? error.message : 'No pudimos actualizar la contraseña.'); }
    finally { setGuardandoClave(false); }
  };
  const porPaginaMov = usePorPaginaCuenta();
  const [paginaMov, setPaginaMov] = useState(1);
  const cuentaCliente = useCuentaCliente(paginaMov, porPaginaMov);
  const s = cuentaCliente.data?.saldo ?? 0, rows = cuentaCliente.data?.filas ?? [];
  const totalMov = cuentaCliente.data?.total ?? 0, paginasMov = cuentaCliente.data?.paginas ?? 1;
  const irMov = (n: number) => { setPaginaMov(n); document.getElementById('historial-movimientos')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
  const [pedirRecibo, setPedirRecibo] = useState(false);
  const movsRecibo = useMovimientosCliente(pedirRecibo);
  useEffect(() => { setPaginaMov(1); }, [porPaginaMov]);
  useEffect(() => {
    if (!pedirRecibo || !movsRecibo.data) return;
    const r = reciboDelDia(diaRec, d.pedidos, movsRecibo.data);
    r ? setRecibo(r) : toast('No hay entregas ni pagos ese día');
    setPedirRecibo(false);
  }, [pedirRecibo, movsRecibo.data, diaRec, d.pedidos, toast]);
  useEffect(() => {
    if (!pedirRecibo || !movsRecibo.isError) return;
    toast('No se pudieron cargar los movimientos. Revisa la conexión.');
    setPedirRecibo(false);
  }, [pedirRecibo, movsRecibo.isError, toast]);
  const verRecibo = () => {
    if (!movsRecibo.data) { setPedirRecibo(true); return; }
    const r = reciboDelDia(diaRec, d.pedidos, movsRecibo.data);
    r ? setRecibo(r) : toast('No hay entregas ni pagos ese día');
  };
  return (
    <div className="cuenta-pagina">
      <div className="cuenta-intro"><div><h1>Mi cuenta</h1><p className="sub">Consulta tus movimientos y administra los datos de {d.cliente!.nombre}.</p></div></div>
      <div className="cuenta-tabs" role="tablist" aria-label="Secciones de mi cuenta">
        <button type="button" role="tab" id="cuenta-tab-mov" aria-controls="cuenta-panel-mov" aria-selected={tab === 'movimientos'} onClick={() => setTab('movimientos')}><Receipt size={18} /><span>Movimientos <span className="cuenta-tab-extra">& Estado Financiero</span></span></button>
        <button type="button" role="tab" id="cuenta-tab-config" aria-controls="cuenta-panel-config" aria-selected={tab === 'configuracion'} onClick={() => setTab('configuracion')}><Settings size={18} /><span>Configuración <span className="cuenta-tab-extra">de Cuenta</span></span></button>
      </div>
      {tab === 'movimientos' ? <div role="tabpanel" id="cuenta-panel-mov" aria-labelledby="cuenta-tab-mov" className="cuenta-panel cuenta-fin-grid">
        <div className="cuenta-fin-lado">
        <section className="cuenta-saldo" aria-label="Estado financiero actual"><div className="cuenta-saldo-contenido"><span className="cuenta-saldo-label">BALANCE ACTUAL</span><strong>{pesos(Math.abs(s))}</strong><span className="cuenta-saldo-estado">{s === 0 ? 'Cuenta al día' : s > 0 ? 'Saldo a tu favor' : 'Saldo pendiente'}</span><p>{textoSaldo(s)}</p></div><div className="cuenta-saldo-icono"><Receipt size={30} /></div></section>
        <section className="cuenta-bloque"><div className="cuenta-bloque-cab"><div><h2>Recibo de cuadre</h2><p>Consulta el detalle de tus entregas y pagos por día.</p></div></div><div className="cuenta-recibo-form"><div className="campo"><label htmlFor="diaRC">Fecha del recibo</label><input type="date" id="diaRC" value={diaRec} onChange={e => setDiaRec(e.target.value || hoy())} /></div><button type="button" className="btn" onClick={verRecibo} disabled={pedirRecibo && movsRecibo.isFetching}><FileText size={17} /> {pedirRecibo && movsRecibo.isFetching ? 'Cargando…' : 'Ver recibo'}</button></div></section>
        </div>
        <section className="cuenta-bloque" id="historial-movimientos"><div className="cuenta-bloque-cab"><div><h2>Historial de movimientos</h2><p>Registro de pedidos y pagos, ordenado del más reciente al más antiguo.</p></div><span className="cuenta-total">{totalMov} movimientos</span></div>{cuentaCliente.isLoading ? <div className="vacio">Cargando movimientos…</div> : rows.length ? <><div className="cuenta-tabla" style={cuentaCliente.isPlaceholderData ? { opacity: .6 } : undefined}><table><thead><tr><th scope="col">Fecha</th><th scope="col">Detalle</th><th scope="col" className="n">Valor</th></tr></thead><tbody>{rows.map((r, i) => <tr key={`${r.fecha}-${i}`}><td>{hora(r.fecha)}</td><td>{r.det}</td><td className={'n ' + (r.v < 0 ? 'neg' : r.v > 0 ? 'pos' : '')}>{pesosConSigno(r.v)}</td></tr>)}</tbody></table></div><Paginador pagina={cuentaCliente.data?.pagina ?? paginaMov} paginas={paginasMov} total={totalMov} porPagina={porPaginaMov} ir={irMov} cargando={cuentaCliente.isFetching} /></> : <div className="vacio">Aún no hay movimientos en tu cuenta.</div>}</section>
      </div> : <div role="tabpanel" id="cuenta-panel-config" aria-labelledby="cuenta-tab-config" className="cuenta-panel cuenta-config">
        <form className="cuenta-bloque cuenta-form" onSubmit={guardarPerfil}>
          <div className="cuenta-form-cab">
            <span className="cuenta-form-icono"><Store size={21} /></span>
            <div><h2>Información de tu empresa</h2><p>Mantén actualizados tus datos de contacto y recogida.</p></div>
          </div>
          <div className="cuenta-campos">
            <div className="campo"><label htmlFor="cuenta-nombre">Nombre de la tienda</label><div className="cuenta-input"><Store aria-hidden="true" /><input id="cuenta-nombre" required maxLength={120} value={perfil.nombre} onChange={e => setPerfil({ ...perfil, nombre: e.target.value })} /></div></div>
            <div className="campo"><label htmlFor="cuenta-email">Correo electrónico</label><div className="cuenta-input"><Mail aria-hidden="true" /><input id="cuenta-email" type="email" required maxLength={254} value={perfil.email} onChange={e => setPerfil({ ...perfil, email: e.target.value })} /></div></div>
            <div className="campo cuenta-campo-ancho"><label htmlFor="cuenta-telefono">Teléfono / WhatsApp de contacto</label><div className="cuenta-input"><Phone aria-hidden="true" /><input id="cuenta-telefono" type="tel" maxLength={30} value={perfil.telefono} onChange={e => setPerfil({ ...perfil, telefono: e.target.value })} /></div></div>
            <div className="campo cuenta-campo-ancho"><label htmlFor="cuenta-direccion">Dirección habitual de recogida <small>Cali, Valle del Cauca</small></label><div className="cuenta-input cuenta-input-area"><MapPin aria-hidden="true" /><textarea id="cuenta-direccion" rows={2} maxLength={200} value={perfil.direccionRecogida} onChange={e => setPerfil({ ...perfil, direccionRecogida: e.target.value })} placeholder="Ej: Calle 13 # 45-22, Barrio Granada, Bodega 3" /></div></div>
            {perfil.email.trim().toLowerCase() !== usuario?.email.toLowerCase() && <div className="campo cuenta-campo-ancho"><label htmlFor="cuenta-clave-email">Contraseña actual para confirmar el correo</label><div className="cuenta-input cuenta-input-clave"><Lock aria-hidden="true" /><input id="cuenta-clave-email" type={mostrarClave.email ? 'text' : 'password'} autoComplete="current-password" required value={claveCorreo} onChange={e => setClaveCorreo(e.target.value)} /><button type="button" aria-label={mostrarClave.email ? 'Ocultar contraseña para correo' : 'Mostrar contraseña para correo'} aria-pressed={mostrarClave.email} onClick={() => setMostrarClave(v => ({ ...v, email: !v.email }))}>{mostrarClave.email ? <EyeOff /> : <Eye />}</button></div></div>}
          </div>
          {errorPerfil && <p className="cuenta-error" role="alert">{errorPerfil}</p>}
          <div className="cuenta-form-pie"><button className="btn cuenta-guardar" type="submit" disabled={actualizarPerfil.isPending}><Save size={17} /> {actualizarPerfil.isPending ? 'Guardando…' : 'Guardar cambios'}</button></div>
        </form>
        <form className="cuenta-bloque cuenta-form cuenta-form-seguridad" onSubmit={guardarClave}>
          <div className="cuenta-form-cab">
            <span className="cuenta-form-icono"><ShieldCheck size={21} /></span>
            <div><h2>Seguridad de la cuenta</h2><p>Actualiza tu contraseña de acceso a la plataforma.</p></div>
          </div>
          <div className="cuenta-campos cuenta-campos-clave">
            <div className="campo"><label htmlFor="cuenta-clave-actual">Contraseña actual</label><div className="cuenta-input cuenta-input-clave"><Lock aria-hidden="true" /><input id="cuenta-clave-actual" type={mostrarClave.actual ? 'text' : 'password'} autoComplete="current-password" required value={clave.actual} onChange={e => setClave({ ...clave, actual: e.target.value })} placeholder="••••••••••••" /><button type="button" aria-label={mostrarClave.actual ? 'Ocultar contraseña actual' : 'Mostrar contraseña actual'} aria-pressed={mostrarClave.actual} onClick={() => setMostrarClave(v => ({ ...v, actual: !v.actual }))}>{mostrarClave.actual ? <EyeOff /> : <Eye />}</button></div></div>
            <div className="campo"><label htmlFor="cuenta-clave-nueva">Nueva contraseña</label><div className="cuenta-input cuenta-input-clave"><KeyRound aria-hidden="true" /><input id="cuenta-clave-nueva" type={mostrarClave.nueva ? 'text' : 'password'} autoComplete="new-password" required minLength={10} value={clave.nueva} onChange={e => setClave({ ...clave, nueva: e.target.value })} placeholder="••••••••••••" /><button type="button" aria-label={mostrarClave.nueva ? 'Ocultar nueva contraseña' : 'Mostrar nueva contraseña'} aria-pressed={mostrarClave.nueva} onClick={() => setMostrarClave(v => ({ ...v, nueva: !v.nueva }))}>{mostrarClave.nueva ? <EyeOff /> : <Eye />}</button></div></div>
            <div className="campo"><label htmlFor="cuenta-clave-confirmar">Confirmar nueva contraseña</label><div className="cuenta-input cuenta-input-clave"><KeyRound aria-hidden="true" /><input id="cuenta-clave-confirmar" type={mostrarClave.confirmar ? 'text' : 'password'} autoComplete="new-password" required minLength={10} value={clave.confirmar} onChange={e => setClave({ ...clave, confirmar: e.target.value })} placeholder="••••••••••••" /><button type="button" aria-label={mostrarClave.confirmar ? 'Ocultar confirmación de contraseña' : 'Mostrar confirmación de contraseña'} aria-pressed={mostrarClave.confirmar} onClick={() => setMostrarClave(v => ({ ...v, confirmar: !v.confirmar }))}>{mostrarClave.confirmar ? <EyeOff /> : <Eye />}</button></div></div>
          </div>
          <p className="cuenta-ayuda">Usa al menos 10 caracteres para proteger tu cuenta.</p>
          {errorClave && <p className="cuenta-error" role="alert">{errorClave}</p>}
          <div className="cuenta-form-pie"><button className="btn cuenta-guardar" type="submit" disabled={guardandoClave}><Lock size={17} /> {guardandoClave ? 'Actualizando…' : 'Actualizar contraseña'}</button></div>
        </form>
      </div>}
      <Dialogo abierto={!!recibo} alCerrar={() => setRecibo(null)}>
        {recibo && <VerRecibo r={recibo} dia={diaRec} nombre={d.cliente!.nombre} alCerrar={() => setRecibo(null)} toast={toast} />}
      </Dialogo>
    </div>
  );
}

function textoRecibo(r: Recibo, dia: string, nombre: string) {
  const L = [`*${EMPRESA.nombre}*`, `Recibo de cuadre · ${fechaLarga(dia)}`, `Cliente: *${nombre}*`, ''];
  if (r.anterior) L.push(`Saldo anterior: ${pesos(r.anterior)}`);
  r.lineas.forEach(l => L.push(l.pedido ? `• ${l.t} (${l.pedido.guia}) · ${metodoTxt(l.pedido)} · cobró ${pesos(l.pedido.valorCobrado)} · ${textoDomi(l.pedido)} → ${pesos(l.v)}` : `• ${l.t} → ${pesos(l.v)}`));
  L.push('', `*Total: ${pesos(r.total)}*`);
  if (r.pagos) L.push(`Pagado: ${pesos(r.pagos)}`, `*Queda pendiente: ${pesos(r.queda)}*`);
  L.push(r.queda > 0 ? 'JS le debe este valor.' : r.queda < 0 ? 'Este valor queda pendiente por pagar a JS.' : 'Cuadre en cero.', '', EMPRESA.lema, EMPRESA.tel);
  return L.join('\n');
}

function VerRecibo({ r, dia, nombre, alCerrar, toast }: { r: Recibo; dia: string; nombre: string; alCerrar: () => void; toast: (t: string) => void }) {
  return (
    <>
      <Cabecera alCerrar={alCerrar}><h2>Recibo de cuadre</h2></Cabecera>
      <div className="ticket">
        <div className="t-cab"><img src={LOGO} alt="" /><b>{EMPRESA.nombre}</b><span>Recibo de cuadre</span><span>{fechaLarga(dia)}</span></div>
        <div className="t-cli">{nombre}</div>
        {r.anterior !== 0 && <div className="t-l"><span>Saldo anterior</span><span>{pesos(r.anterior)}</span></div>}
        {r.lineas.map((l, i) => <div key={i} className="t-l"><span>{l.t}{l.pedido && <small>{l.pedido.guia} · {metodoTxt(l.pedido)} · cobró {pesos(l.pedido.valorCobrado)} · {textoDomi(l.pedido)}</small>}</span><span>{pesos(l.v)}</span></div>)}
        <div className="t-l t-total"><span>Total</span><span>{pesos(r.total)}</span></div>
        {r.pagos !== 0 && <><div className="t-l"><span>Pagado</span><span>{pesos(r.pagos)}</span></div><div className="t-l t-total"><span>Queda pendiente</span><span>{pesos(r.queda)}</span></div></>}
        <div className="t-pie">{EMPRESA.lema}<br />{EMPRESA.tel}<br />{EMPRESA.ig}</div>
      </div>
      <p className="sub" style={{ marginTop: 12, textAlign: 'center' }}>{r.queda > 0 ? 'Cuenta por pagar: JS le debe entregar este valor al cliente.' : r.queda < 0 ? 'Cuenta por cobrar: el cliente le debe este valor a JS.' : 'Cuadre en cero.'}</p>
      <div className="acciones" style={{ justifyContent: 'center' }}>
        <button className="btn sec" onClick={async () => { try { await navigator.clipboard.writeText(textoRecibo(r, dia, nombre)); toast('Texto copiado. Pégalo en WhatsApp.'); } catch { toast('No se pudo copiar en este navegador'); } }}>Copiar texto</button>
      </div>
    </>
  );
}
