/**
 * Vista del cliente de la app actual (pintarCliente, pintarInicioCliente, verPedidoCliente y verRecibo de
 * js-logistics/app/js/app.js), pasada a React sin cambiar lo que se ve: mismo HTML, mismas clases y el mismo
 * estilos.css. Para el dueño que prefiere que sus clientes sigan viendo exactamente lo de siempre.
 */
import { Fragment, useEffect, useState } from 'react';
import { Route, Routes, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';
import './clasico.css';
import { useSesion } from '../../auth/AuthProvider';
import { useConfirmarCambio, usePaginaPedidos, usePruebas, type FiltroPedidos } from '../../api/cliente';
import { usePorPagina } from '../../lib/pantalla';
import { fechaLarga, hoy, hora, moverDia, pct, pesos } from '../../lib/formato';
import {
  cambioPendiente, cerrado, EMPRESA, entregasPorDia, filasCuenta, gastoDe, metodoTxt, MOTIVOS, pagoDomi,
  reciboDelDia, resumenCliente, saldoPedido, servicio, textoDomi, textoSaldo, ultimaActividad, type Recibo,
} from '../../lib/negocio';
import { useDatosCliente, type DatosCliente } from '../useDatosCliente';
import { useTheme } from '../../hooks/useTheme';
import { Icono } from './iconos';
import { Cabecera, Columnas, Dialogo, Dona, EtqCambio, EtqDash, EtqEstado, FiltroDia, Foto, Paginador } from './piezas';

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
      <Dialogo abierto={!!ver} alCerrar={cerrar}>
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
  const movs = filasCuenta(d.pedidos, d.movimientos).slice(0, 6), s = d.saldo;
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
  const consulta = usePaginaPedidos({ filtro: f, buscar, dia, pagina, porPagina });
  const pag = consulta.data, ps = pag?.pedidos ?? [];
  const ir = (n: number) => { setPagina(n); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  return (
    <>
      <h1>Hola, {d.cliente!.nombre}</h1><p className="sub">Tus envíos con JS Logistics y sus pruebas de entrega.</p>
      {cambios.length > 0 && <div className="aviso alerta">Tienes {cambios.length === 1 ? '1 prenda de cambio' : cambios.length + ' prendas de cambio'} por recibir ({cambios.map(p => p.guia).join(', ')}). Cuando te la entreguen, ábrela y confirma que la recibiste.</div>}
      <div className="filtros">{[['todos', 'Todos'], ['ruta', 'En ruta'], ['ent', 'Entregados'], ['dev', 'Devueltos'], ['cambio', 'Cambios por recibir']].map(([k, t]) => (
        <button key={k} aria-pressed={f === k} onClick={() => { setPagina(1); setSp(prev => { const n = new URLSearchParams(prev); n.set('f', k); return n; }, { replace: true }); }}>{t}</button>
      ))}</div>
      <div className="campo"><input type="search" placeholder="Buscar guía o quien recibió" value={buscar} onChange={e => setBuscar(e.target.value)} aria-label="Buscar" /></div>
      <FiltroDia dia={dia} poner={setDia} />
      {dia && pag && <p className="sub">{pag.total} envío{pag.total === 1 ? '' : 's'} de ese día</p>}
      {consulta.isError ? <div className="vacio">No se pudieron traer tus envíos. Revisa tu conexión e intenta de nuevo.</div>
      : !pag ? <div className="vacio">Cargando envíos…</div>
      : ps.length ? <><div className="lista" style={consulta.isPlaceholderData ? { opacity: .6 } : undefined}>{ps.map(p => (
        <button key={p.guia} className="fila" onClick={() => abrir(p.guia)}><Foto src={p.mini} />
          <span className="info"><span className="guia">{p.guia}</span> <EtqEstado p={p} /><EtqCambio p={p} /><p>{lineaPedido(p)}</p></span>
          <span className="n" style={{ textAlign: 'right', fontWeight: 700 }}>{p.estado === 'entregado' ? pesos(p.valorCobrado) : ''}</span></button>
      ))}</div>
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
  const [visor, setVisor] = useState<string | null>(null);
  if (!p) return <><Cabecera alCerrar={alCerrar}><h2>{guia}</h2></Cabecera><div className="vacio">No encontramos este envío.</div></>;
  if (preguntar) return (
    <>
      <Cabecera alCerrar={() => setPreguntar(false)}><h2>Confirmar cambio de {guia}</h2></Cabecera>
      <p className="sub">Confirmas que ya recibiste la prenda de cambio de este envío.</p>
      <div className="acciones">
        <button className="btn sec" onClick={() => setPreguntar(false)}>Cancelar</button>
        <button className="btn ok" disabled={confirmar.isPending} onClick={() => confirmar.mutate(guia, {
          onSuccess: () => toast('¡Gracias! Cambio confirmado'), onError: () => toast('No se pudo confirmar. Revisa la conexión.'),
          onSettled: () => setPreguntar(false) })}>Sí, la recibí</button>
      </div>
    </>
  );
  const nombres = { salida: 'Salida', entrega: p.estado === 'devuelto' ? 'Evidencia' : 'Entrega', firma: 'Firma de quien recibió' };
  return (
    <>
      <Cabecera alCerrar={alCerrar}><div><h2 className="guia">{guia}</h2><EtqEstado p={p} /></div></Cabecera>
      <dl className="datos">
        <dt>Salió</dt><dd>{hora(p.creado)}</dd>
        {p.aCobrar > 0 && <><dt>Valor a cobrar</dt><dd>{pesos(p.aCobrar)}</dd></>}
        {p.intentos.map((i, k) => <Fragment key={k}><dt>Intento {k + 1}</dt><dd>{hora(i.fecha)} · {MOTIVOS[i.motivo] || ''}</dd></Fragment>)}
        {p.estado === 'entregado' && <><dt>Entregado</dt><dd>{hora(p.entregado!)}</dd><dt>Recibió</dt><dd>{p.destinatario}</dd><dt>Cobrado</dt><dd>{pesos(p.valorCobrado)}</dd><dt>Método</dt><dd>{metodoTxt(p)}</dd></>}
        {p.estado === 'devuelto' && <><dt>Devuelto</dt><dd>{hora(p.entregado!)}</dd><dt>Motivo</dt><dd>{MOTIVOS[p.motivoDev] || ''}</dd></>}
        {cerrado(p) && <>
          <dt>Domicilio</dt><dd>{pesos(servicio(p))}</dd>
          {gastoDe(p) > 0 && <><dt>Flete / gasto del envío</dt><dd>{pesos(gastoDe(p))}{p.gastoNota ? ' · ' + p.gastoNota : ''}</dd></>}
          {p.domiPagado && <><dt>Pagaste aparte</dt><dd>{pesos(pagoDomi(p))}</dd></>}
          <dt>Efecto en tu saldo</dt><dd className={saldoPedido(p) < 0 ? 'neg' : 'pos'}>{pesos(saldoPedido(p))}</dd>
        </>}
      </dl>
      {p.cambio && (p.cambioRecibido
        ? <div className="aviso">Recibiste la prenda de cambio el {hora(p.cambioRecibido)}.</div>
        : <div className="aviso alerta">JS Logistics tiene una prenda de cambio de este envío para entregarte.<br /><button className="btn ok chico" onClick={() => setPreguntar(true)}>Confirmar que recibí el cambio</button></div>)}
      <h2>Pruebas</h2>
      <div className="fotos">
        {pruebas.isLoading ? <span className="sub">Cargando fotos…</span>
          : pruebas.isError ? <span className="sub">No se pudieron cargar las fotos.</span>
          : !pruebas.data?.length ? <span className="sub">Sin fotos.</span>
          : pruebas.data.map(a => <figure key={a.tipo}><img src={a.url} alt={nombres[a.tipo]} onClick={() => setVisor(a.url)} /><figcaption>{nombres[a.tipo]}</figcaption></figure>)}
      </div>
      {visor && <div className="visor" onClick={() => setVisor(null)}><img src={visor} alt="" /><button className="cerrar" aria-label="Cerrar">×</button></div>}
    </>
  );
}

/* ---------------------------- Mi cuenta ---------------------------- */
function Cuenta({ d, toast }: { d: DatosCliente; toast: (t: string) => void }) {
  const [diaRec, setDiaRec] = useState(hoy());
  const [recibo, setRecibo] = useState<Recibo | null>(null);
  const s = d.saldo, rows = filasCuenta(d.pedidos, d.movimientos);
  return (
    <>
      <h1>Mi cuenta</h1><p className="sub">{d.cliente!.nombre}</p>
      <div className={'saldo-grande ' + (s < 0 ? 'neg' : s > 0 ? 'pos' : '')}>{pesos(Math.abs(s))}</div>
      <p className="sub">{textoSaldo(s)}</p>
      <div className="linea2" style={{ alignItems: 'end' }}>
        <div className="campo" style={{ maxWidth: 220 }}><label htmlFor="diaRC">Recibo de cuadre del día</label><input type="date" id="diaRC" value={diaRec} onChange={e => setDiaRec(e.target.value || hoy())} /></div>
        <div className="campo"><button className="btn" onClick={() => { const r = reciboDelDia(diaRec, d.pedidos, d.movimientos); r ? setRecibo(r) : toast('No hay entregas ni pagos ese día'); }}>Ver recibo</button></div>
      </div>
      <h2>Movimientos</h2>
      {rows.length ? <div className="tabla-env"><table><thead><tr><th>Fecha</th><th>Detalle</th><th className="n">Valor</th></tr></thead>
        <tbody>{rows.map((r, i) => <tr key={i}><td>{hora(r.fecha)}</td><td>{r.det}</td><td className={'n ' + (r.v < 0 ? 'neg' : 'pos')}>{pesos(r.v)}</td></tr>)}</tbody></table></div>
        : <div className="vacio">Sin movimientos.</div>}
      <Dialogo abierto={!!recibo} alCerrar={() => setRecibo(null)}>
        {recibo && <VerRecibo r={recibo} dia={diaRec} nombre={d.cliente!.nombre} alCerrar={() => setRecibo(null)} toast={toast} />}
      </Dialogo>
    </>
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
