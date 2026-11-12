/* "Mi cuenta": saldo, historial de movimientos, recibo de cuadre y configuración. Se descarga solo al abrirla. */
import { useEffect, useState, type FormEvent } from 'react';
import { Eye, EyeOff, FileText, Info, KeyRound, Lock, Mail, MapPin, Receipt, Save, Settings, ShieldCheck, Store } from 'lucide-react';
import { useSesion } from '../../auth/AuthProvider';
import { useActualizarPerfilCliente, useCuentaCliente, useMovimientosCliente, usePedidosCliente } from '../../api/cliente';
import { authApi } from '../../api/auth';
import { usePersistedTab } from '../../hooks/usePersistedTab';
import { usePorPaginaCuenta } from '../../lib/pantalla';
import { fechaLarga, hora, hoy, pesos, pesosConSigno } from '../../lib/formato';
import { EMPRESA, metodoTxt, reciboDelDia, textoDomi, textoSaldo, type Recibo } from '../../lib/negocio';
import { SingleDatePicker } from '../../components/ui/SingleDatePicker';
import { WhatsAppIcon } from '../../components/icons/WhatsAppIcon';
import type { DatosCliente } from '../useDatosCliente';
import { Cabecera, Dialogo, LOGO, Paginador } from './piezas';

const SUBTABS = ['movimientos', 'configuracion'] as const;

export default function Cuenta({ d, toast }: { d: DatosCliente; toast: (t: string) => void }) {
  const { usuario, refrescar } = useSesion();
  const actualizarPerfil = useActualizarPerfilCliente();
  // Movimientos o Configuración: se recuerda al recargar (?v=configuracion y sessionStorage).
  const [tab, setTab] = usePersistedTab({ ambito: 'cuenta', valores: SUBTABS, porDefecto: 'movimientos' });
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
  // El historial solo se pide en la sub-pestaña de movimientos.
  const cuentaCliente = useCuentaCliente(paginaMov, porPaginaMov, tab === 'movimientos');
  const s = cuentaCliente.data?.saldo ?? 0, rows = cuentaCliente.data?.filas ?? [];
  const totalMov = cuentaCliente.data?.total ?? 0, paginasMov = cuentaCliente.data?.paginas ?? 1;
  const [movVer, setMovVer] = useState<(typeof rows)[number] | null>(null);
  const irMov = (n: number) => { setPaginaMov(n); document.getElementById('historial-movimientos')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
  const [pedirRecibo, setPedirRecibo] = useState(false);
  const movsRecibo = useMovimientosCliente(pedirRecibo);
  // El recibo necesita la lista completa de pedidos. Si el portal todavía no la trajo, se pide al pedir el recibo.
  const pedidosRecibo = usePedidosCliente(pedirRecibo);
  const listos = d.pedidosListos || !!pedidosRecibo.data;
  const pedidos = d.pedidosListos ? d.pedidos : pedidosRecibo.data ?? [];
  useEffect(() => { setPaginaMov(1); }, [porPaginaMov]);
  useEffect(() => {
    if (!pedirRecibo || !movsRecibo.data || !listos) return;
    const r = reciboDelDia(diaRec, pedidos, movsRecibo.data);
    r ? setRecibo(r) : toast('No hay entregas ni pagos ese día');
    setPedirRecibo(false);
  }, [pedirRecibo, movsRecibo.data, listos, diaRec, pedidos, toast]);
  useEffect(() => {
    if (!pedirRecibo || !(movsRecibo.isError || (!listos && pedidosRecibo.isError))) return;
    toast('No se pudieron cargar los movimientos. Revisa la conexión.');
    setPedirRecibo(false);
  }, [pedirRecibo, movsRecibo.isError, listos, pedidosRecibo.isError, toast]);
  const verRecibo = () => {
    if (!movsRecibo.data || !listos) { setPedirRecibo(true); return; }
    const r = reciboDelDia(diaRec, pedidos, movsRecibo.data);
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
        <section className="cuenta-bloque"><div className="cuenta-bloque-cab"><div><h2>Recibo de cuadre</h2><p>Consulta el detalle de tus entregas y pagos por día.</p></div></div><div className="cuenta-recibo-form"><div className="campo"><label htmlFor="diaRC">Fecha del recibo</label><SingleDatePicker id="diaRC" value={diaRec} onChange={v => setDiaRec(v || hoy())} max={hoy()} /></div><button type="button" className="btn" onClick={verRecibo} disabled={pedirRecibo}><FileText size={17} /> {pedirRecibo ? 'Cargando…' : 'Ver recibo'}</button></div></section>
        </div>
        <section className="cuenta-bloque" id="historial-movimientos"><div className="cuenta-bloque-cab"><div><h2>Historial de movimientos</h2><p>Registro de pedidos y pagos, ordenado del más reciente al más antiguo.</p></div><span className="cuenta-total">{totalMov} movimientos</span></div>{cuentaCliente.isLoading ? <div className="vacio">Cargando movimientos…</div> : rows.length ? <><div className="cuenta-tabla" style={cuentaCliente.isPlaceholderData ? { opacity: .6 } : undefined}><table><thead><tr><th scope="col">Fecha</th><th scope="col" className="mov-det">Detalle</th><th scope="col" className="n">Valor</th><th scope="col" className="mov-info"><span className="mov-sr">Ver detalle</span></th></tr></thead><tbody>{rows.map((r, i) => <tr key={`${r.fecha}-${i}`}><td>{hora(r.fecha)}</td><td className="mov-det">{r.det}</td><td className={'n ' + (r.v < 0 ? 'neg' : r.v > 0 ? 'pos' : '')}>{pesosConSigno(r.v)}</td><td className="mov-info"><button type="button" className="mov-info-btn" onClick={() => setMovVer(r)} aria-label={`Ver detalle del movimiento del ${hora(r.fecha)}`}><Info size={18} aria-hidden="true" /></button></td></tr>)}</tbody></table></div><Paginador pagina={cuentaCliente.data?.pagina ?? paginaMov} paginas={paginasMov} total={totalMov} porPagina={porPaginaMov} ir={irMov} cargando={cuentaCliente.isFetching} /></> : <div className="vacio">Aún no hay movimientos en tu cuenta.</div>}</section>
      </div> : <div role="tabpanel" id="cuenta-panel-config" aria-labelledby="cuenta-tab-config" className="cuenta-panel cuenta-config">
        <form className="cuenta-bloque cuenta-form" onSubmit={guardarPerfil}>
          <div className="cuenta-form-cab">
            <span className="cuenta-form-icono"><Store size={21} /></span>
            <div><h2>Información de tu empresa</h2><p>Mantén actualizados tus datos de contacto y recogida.</p></div>
          </div>
          <div className="cuenta-campos">
            <div className="campo"><label htmlFor="cuenta-nombre">Nombre de la tienda</label><div className="cuenta-input"><Store aria-hidden="true" /><input id="cuenta-nombre" required maxLength={120} value={perfil.nombre} onChange={e => setPerfil({ ...perfil, nombre: e.target.value })} /></div></div>
            <div className="campo"><label htmlFor="cuenta-email">Correo electrónico</label><div className="cuenta-input"><Mail aria-hidden="true" /><input id="cuenta-email" type="email" required maxLength={254} value={perfil.email} onChange={e => setPerfil({ ...perfil, email: e.target.value })} /></div></div>
            <div className="campo cuenta-campo-ancho"><label htmlFor="cuenta-telefono">Teléfono / WhatsApp de contacto</label><div className="cuenta-input"><WhatsAppIcon className="" /><input id="cuenta-telefono" type="tel" maxLength={30} value={perfil.telefono} onChange={e => setPerfil({ ...perfil, telefono: e.target.value })} /></div></div>
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
      <Dialogo abierto={!!movVer} alCerrar={() => setMovVer(null)}>
        {movVer && <>
          <Cabecera alCerrar={() => setMovVer(null)}><h2>Detalle del movimiento</h2></Cabecera>
          <dl className="datos">
            <dt>Fecha y hora</dt><dd>{hora(movVer.fecha)}</dd>
            <dt>Valor</dt><dd className={movVer.v < 0 ? 'neg' : movVer.v > 0 ? 'pos' : ''}>{pesosConSigno(movVer.v)}</dd>
          </dl>
          <p className="sub" style={{ margin: '0 0 6px' }}>Descripción completa</p>
          <div className="mov-detalle">{movVer.det}</div>
          <div className="acciones" style={{ marginTop: 16 }}><button className="btn sec" style={{ flex: 1, minHeight: 44 }} onClick={() => setMovVer(null)}>Cerrar</button></div>
        </>}
      </Dialogo>
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
