/* Detalle de un envío (verPedidoCliente de la app actual). Se descarga y se monta solo al abrir un pedido. */
import { useState } from 'react';
import { AlertTriangle, CheckCircle2, ClipboardCheck, Image as ImageIcon, Maximize2, RotateCcw, Truck, X } from 'lucide-react';
import { useConfirmarCambio, usePedidoDetalle, usePedirReintento, usePruebas } from '../../api/cliente';
import { diaCorto, diaDe, hora, pesos } from '../../lib/formato';
import { cadenaGuias, cerrado, ESTADO_PEDIDO, gastoDe, metodoTxt, MOTIVOS, pagoDomi, saldoPedido, servicio } from '../../lib/negocio';
import type { DatosCliente } from '../useDatosCliente';
import { CargandoVista } from './piezas';

export default function VerPedido({ guia, d, alCerrar, alVer, toast }: { guia: string; d: DatosCliente; alCerrar: () => void; alVer: (g: string) => void; toast: (t: string) => void }) {
  const enLista = d.pedidos.find(x => x.guia === guia);
  const detalle = usePedidoDetalle(guia, enLista);
  const p = enLista ?? detalle.data ?? undefined;
  const pruebas = usePruebas(p ? guia : null);
  const confirmar = useConfirmarCambio();
  const [preguntar, setPreguntar] = useState(false);
  const pedirReintento = usePedirReintento();
  const [preguntarReintento, setPreguntarReintento] = useState(false);
  const [visor, setVisor] = useState<{ url: string; titulo: string } | null>(null);

  if (!p && detalle.isLoading) return <CargandoVista modal />;
  if (!p) return (
    <>
      <header className="pedido-modal-cab">
        <div className="pedido-modal-titulo"><div className="pedido-modal-linea"><h3>{guia}</h3></div></div>
        <button type="button" className="pedido-modal-cerrar" aria-label="Cerrar" onClick={alCerrar}><X /></button>
      </header>
      <div className="pedido-modal-cuerpo"><div className="vacio">{detalle.isError ? 'No se pudo traer este envío. Revisa tu conexión e intenta de nuevo.' : 'No encontramos este envío.'}</div></div>
    </>
  );

  const { texto: estadoTexto, clase: estadoClase } = ESTADO_PEDIDO[p.estado];
  const valorCab = p.estado === 'entregado' ? p.valorCobrado : p.aCobrar;
  const cambioPend = p.cambio && !p.cambioRecibido;
  const cambioOk = p.cambio && !!p.cambioRecibido;
  // Si la guía vino sola (la lista completa aún no llega), la cadena se arma con lo que se sabe de ella.
  const cadena = cadenaGuias(enLista ? d.pedidos : [...d.pedidos, p], guia);

  const pasoFinal = cambioPend
    ? { label: 'Cambio por recibir', fecha: 'Pendiente', Icono: RotateCcw, completado: false, actual: cerrado(p) }
    : cambioOk
    ? { label: 'Cambio recibido', fecha: hora(p.cambioRecibido!), Icono: RotateCcw, completado: true, actual: false }
    : p.estado === 'devuelto'
    ? { label: 'Devuelto', fecha: p.entregado ? hora(p.entregado) : 'Pendiente', Icono: RotateCcw, completado: true, actual: false }
    : p.estado === 'entregado'
    ? { label: 'Entregado', fecha: p.entregado ? hora(p.entregado) : 'Pendiente', Icono: CheckCircle2, completado: true, actual: false }
    : { label: 'Entregado', fecha: 'Pendiente', Icono: CheckCircle2, completado: false, actual: false };
  const pasos = [
    // Aceptado: la oficina aprobó y asignó mensajero. Pasa a "En ruta" cuando el mensajero lo recoge con la foto.
    { label: 'Aceptado', fecha: p.estado === 'aceptado' ? 'Por recoger' : diaCorto(diaDe(p.creado)), Icono: ClipboardCheck, completado: true, actual: p.estado === 'aceptado' },
    { label: 'En ruta', fecha: p.estado === 'aceptado' ? 'Pendiente' : hora(p.creado), Icono: Truck, completado: cerrado(p), actual: p.estado === 'pendiente' },
    pasoFinal,
  ];
  const progreso = p.estado === 'aceptado' ? '0%' : p.estado === 'pendiente' && !cambioOk ? '33.333%' : '66.666%';

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

        {p.estado === 'devuelto' && (
          p.reintentos?.length ? (
            <section className="pod-aviso ok">
              <span className="pod-aviso-titulo"><RotateCcw aria-hidden="true" /> Reintento en camino</span>
              <p>Este pedido se volvió a intentar con la guía <button type="button" className="enlace-guia" onClick={() => alVer(p.reintentos![p.reintentos!.length - 1].guia)}>{p.reintentos[p.reintentos.length - 1].guia}</button>.</p>
            </section>
          ) : p.reintentoPedido ? (
            <section className="pod-aviso">
              <span className="pod-aviso-titulo"><RotateCcw aria-hidden="true" /> Pediste el reintento</span>
              <p>Lo pediste el {hora(p.reintentoPedido)}, y JS Logistics lo va a asignar a un mensajero. Verás aquí la guía nueva.</p>
            </section>
          ) : p.destinoDev === 'por_definir' ? (
            <section className="pod-aviso">
              <span className="pod-aviso-titulo"><RotateCcw aria-hidden="true" /> Estamos confirmando tu paquete</span>
              <p>El mensajero todavía no nos dice dónde quedó el paquete de esta devolución. Cuando lo haga podrás pedir un reintento desde aquí.</p>
            </section>
          ) : (
            <section className="pod-aviso">
              <span className="pod-aviso-titulo"><RotateCcw aria-hidden="true" /> {preguntarReintento ? 'Confirmar reintento' : '¿Quieres que lo intentemos de nuevo?'}</span>
              <p>{preguntarReintento
                ? `El reintento tiene un cobro igual al del domicilio (${pesos(p.valorServicio)}). La devolución de este pedido se cobra como siempre. ¿Pedimos el reintento?`
                : `Este pedido se devolvió${p.destinoDev === 'oficina' ? ' y está en la oficina de JS Logistics' : p.destinoDev === 'cliente' ? ' y el paquete quedó contigo' : ''}. Puedes pedir un reintento de entrega.`}</p>
              <div className="pod-aviso-acciones">
                {preguntarReintento ? (
                  <>
                    <button type="button" className="btn sec chico" onClick={() => setPreguntarReintento(false)}>Cancelar</button>
                    <button type="button" className="btn ok chico" disabled={pedirReintento.isPending} onClick={() => pedirReintento.mutate(guia, {
                      onSuccess: () => toast('Listo, pedimos el reintento. JS Logistics lo asigna a un mensajero.'), onError: () => toast('No se pudo pedir el reintento. Revisa la conexión.'),
                      onSettled: () => setPreguntarReintento(false) })}>Sí, pedir reintento</button>
                  </>
                ) : <button type="button" className="btn ok chico" onClick={() => setPreguntarReintento(true)}>Reintentar entrega</button>}
              </div>
            </section>
          )
        )}

        {cadena.length > 1 && (
          <section className="pod-cadena">
            <span className="pod-seccion-titulo">Guías de esta entrega</span>
            <ol>{cadena.map(g => { const x = d.pedidos.find(q => q.guia === g); return (
              <li key={g} className={g === guia ? 'actual' : ''}>
                {g === guia ? <b>{g}</b> : <button type="button" className="enlace-guia" onClick={() => alVer(g)}>{g}</button>}
                {x && <><span className={`etq ${ESTADO_PEDIDO[x.estado].clase}`}>{ESTADO_PEDIDO[x.estado].texto}</span><span className="sub">{hora(x.creado)}</span></>}
              </li>); })}</ol>
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
            {p.estado === 'aceptado' ? <><dt>Estado</dt><dd>Aceptado: el mensajero pasa a recogerlo</dd></> : <><dt>Salió</dt><dd>{hora(p.creado)}</dd></>}
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
