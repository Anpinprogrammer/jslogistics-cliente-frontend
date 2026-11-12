/**
 * "Nuevo pedido" desde Mis pedidos: los mismos campos de /register (Solicitar envío), con los datos del cliente ya
 * puestos. Se pueden cambiar para este pedido (por ejemplo, si la recogida es en otra dirección) sin tocar la ficha.
 * La solicitud llega a la oficina; si acepta con el domicilio de siempre, asigna al mensajero de una vez.
 */
import { useState, type FormEvent, type ReactNode } from 'react';
import { CheckCircle2, Mail, MapPin, Package, Phone, Scale, Send, Store, User, X } from 'lucide-react';
import { useNuevaSolicitud } from '../../api/cliente';
import { ApiError } from '../../api/http';
import type { Cliente } from '../../types/dominio';
import { pesos } from '../../lib/formato';
import { clientToast } from '../../utils/clientToast';

const VACIO = { nombre: '', telefono: '', email: '', direccionRecogida: '', paquetes: '1', pesoKg: '', destinatarioNombre: '', destinatarioTelefono: '', direccionEntrega: '' };
type Formulario = typeof VACIO;

const inicial = (c: Cliente | undefined, email: string): Formulario =>
  ({ ...VACIO, nombre: c?.nombre ?? '', telefono: c?.telefono ?? '', email, direccionRecogida: c?.direccionRecogida ?? '' });

/** Las mismas reglas de Register.tsx; el servidor vuelve a validar todo. */
function errores(f: Formulario) {
  const e: Record<string, string> = {};
  if (!f.nombre.trim()) e.nombre = 'Escribe el nombre de quien entrega el paquete.';
  if (!f.telefono.trim()) e.telefono = 'Escribe un teléfono de contacto.';
  else if (f.telefono.replace(/\D/g, '').length < 7) e.telefono = 'Escribe un teléfono válido.';
  if (f.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) e.email = 'Escribe un correo válido o déjalo vacío.';
  if (!f.direccionRecogida.trim()) e.direccionRecogida = 'Escribe la dirección de recogida.';
  const paquetes = Number(f.paquetes);
  if (!Number.isInteger(paquetes) || paquetes < 1 || paquetes > 100) e.paquetes = 'Escribe cuántos paquetes son (entre 1 y 100).';
  if (f.pesoKg.trim() !== '') {
    const peso = Number(f.pesoKg.replace(',', '.'));
    if (!Number.isFinite(peso) || peso <= 0) e.pesoKg = 'El peso debe ser mayor que 0, o déjalo vacío.';
  }
  if (!f.destinatarioNombre.trim()) e.destinatarioNombre = 'Escribe el nombre de quien recibe.';
  if (!f.direccionEntrega.trim()) e.direccionEntrega = 'Escribe la dirección de entrega.';
  return e;
}

function Campo({ id, etiqueta, nota, error, ancho, area, icono, children }: { id: string; etiqueta: string; nota?: string; error?: string; ancho?: boolean; area?: boolean; icono: ReactNode; children: ReactNode }) {
  return (
    <div className={'campo' + (ancho ? ' cuenta-campo-ancho' : '')}>
      <label htmlFor={id}>{etiqueta}{nota && <small>{nota}</small>}</label>
      <div className={'cuenta-input' + (area ? ' cuenta-input-area' : '')}>{icono}{children}</div>
      {error && <p className="nuevo-error" id={id + '-error'}>{error}</p>}
    </div>
  );
}

export default function NuevoPedido({ cliente, email, alCerrar }: { cliente: Cliente | undefined; email: string; alCerrar: () => void }) {
  const [f, setF] = useState<Formulario>(() => inicial(cliente, email));
  const [campos, setCampos] = useState<Record<string, string>>({});
  const [enviada, setEnviada] = useState(false);
  const enviar = useNuevaSolicitud();
  const tarifa = cliente?.tarifa ?? 0;
  const cambioRecogida = !!cliente && f.direccionRecogida.trim() !== (cliente.direccionRecogida || '').trim();

  const poner = (k: keyof Formulario) => (e: { target: { value: string } }) => {
    const v = e.target.value;
    setF(a => ({ ...a, [k]: v }));
    if (campos[k]) setCampos(a => { const n = { ...a }; delete n[k]; return n; });
  };
  const props = (k: keyof Formulario) => ({
    id: 'np-' + k, value: f[k], onChange: poner(k), disabled: enviar.isPending,
    'aria-invalid': campos[k] ? true : undefined, 'aria-describedby': campos[k] ? `np-${k}-error` : undefined,
  });

  const mandar = async (e: FormEvent) => {
    e.preventDefault();
    const errs = errores(f);
    setCampos(errs);
    if (Object.keys(errs).length) {
      document.getElementById('np-' + Object.keys(errs)[0])?.focus();
      return;
    }
    try {
      await enviar.mutateAsync({
        nombre: f.nombre.trim(), telefono: f.telefono.trim(), email: f.email.trim(), direccionRecogida: f.direccionRecogida.trim(),
        paquetes: Number(f.paquetes), pesoKg: f.pesoKg.trim() === '' ? null : Number(f.pesoKg.replace(',', '.')),
        destinatarioNombre: f.destinatarioNombre.trim(), destinatarioTelefono: f.destinatarioTelefono.trim(), direccionEntrega: f.direccionEntrega.trim(),
      });
      setEnviada(true);
      clientToast.success('Recibimos tu solicitud de envío. Te contactamos pronto.');
    } catch (err) {
      if (err instanceof ApiError && err.campos?.length) setCampos(Object.fromEntries(err.campos.map(c => [c.campo, c.mensaje])));
      clientToast.error(err instanceof Error ? err.message : 'No pudimos enviar la solicitud. Intenta de nuevo.');
    }
  };

  const cab = (
    <header className="pedido-modal-cab">
      <div className="pedido-modal-titulo">
        <div className="pedido-modal-linea"><h3>Nuevo pedido</h3></div>
        <p>La oficina revisa tu solicitud y asigna al mensajero.</p>
      </div>
      <button type="button" className="pedido-modal-cerrar" aria-label="Cerrar" onClick={alCerrar}><X /></button>
    </header>
  );

  if (enviada) return (
    <>
      {cab}
      <div className="pedido-modal-cuerpo">
        <div className="nuevo-listo" role="status">
          <span className="nuevo-listo-ico"><CheckCircle2 aria-hidden="true" /></span>
          <p className="nuevo-listo-titulo">¡Recibimos tu solicitud!</p>
          <p>
            La oficina la revisa en un momento. {tarifa > 0
              ? <>Si el domicilio es tu valor de siempre (<span className="nuevo-valor">{pesos(tarifa)}</span>), asignamos al mensajero de una vez. Si para este pedido es otro valor, te escribimos por WhatsApp al <b>{f.telefono.trim()}</b> para que lo confirmes.</>
              : <>Te escribimos por WhatsApp al <b>{f.telefono.trim()}</b> con el valor del domicilio y, cuando nos confirmes, asignamos al mensajero.</>}
          </p>
          <p className="nuevo-nota">El pedido aparece en tu lista cuando la oficina le asigna un mensajero.</p>
        </div>
        <div className="nuevo-pie">
          <button type="button" className="btn sec" onClick={() => { setF(inicial(cliente, email)); setCampos({}); setEnviada(false); }}>Hacer otro pedido</button>
          <button type="button" className="btn" onClick={alCerrar}>Listo</button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {cab}
      <form className="pedido-modal-cuerpo cuenta-form nuevo-form" onSubmit={mandar} noValidate>

        <section aria-labelledby="np-t1">
          <span className="pod-seccion-titulo" id="np-t1">Recogida</span>
          <p className="nuevo-ayuda">Vienen de tu cuenta. Si para este pedido la recogida es en otro lugar o con otra persona, cámbialo aquí: tu ficha no cambia.</p>
          <div className="cuenta-campos">
            <Campo id="np-nombre" etiqueta="Nombre de quien entrega *" error={campos.nombre} icono={<Store aria-hidden="true" />}>
              <input {...props('nombre')} maxLength={120} autoComplete="organization" />
            </Campo>
            <Campo id="np-telefono" etiqueta="Teléfono / WhatsApp *" error={campos.telefono} icono={<Phone aria-hidden="true" />}>
              <input {...props('telefono')} type="tel" inputMode="tel" maxLength={30} autoComplete="tel" />
            </Campo>
            <Campo id="np-email" etiqueta="Correo" nota="Opcional" error={campos.email} ancho icono={<Mail aria-hidden="true" />}>
              <input {...props('email')} type="email" maxLength={254} autoComplete="email" />
            </Campo>
            <Campo id="np-direccionRecogida" etiqueta="Dirección de recogida *" nota={cambioRecogida ? 'Distinta a la de tu cuenta' : 'Cali, Valle del Cauca'} error={campos.direccionRecogida} ancho area icono={<MapPin aria-hidden="true" />}>
              <textarea {...props('direccionRecogida')} rows={2} maxLength={200} placeholder="Ej: Calle 13 # 45-22, Barrio Granada, Bodega 3" />
            </Campo>
          </div>
        </section>

        <section aria-labelledby="np-t2">
          <span className="pod-seccion-titulo" id="np-t2">Los paquetes</span>
          <div className="cuenta-campos">
            <Campo id="np-paquetes" etiqueta="Cantidad de paquetes *" error={campos.paquetes} icono={<Package aria-hidden="true" />}>
              <input {...props('paquetes')} type="number" inputMode="numeric" min={1} max={100} step={1} />
            </Campo>
            <Campo id="np-pesoKg" etiqueta="Peso aproximado (kg)" nota="Opcional" error={campos.pesoKg} icono={<Scale aria-hidden="true" />}>
              <input {...props('pesoKg')} inputMode="decimal" placeholder="Ej: 2,5" />
            </Campo>
          </div>
        </section>

        <section aria-labelledby="np-t3">
          <span className="pod-seccion-titulo" id="np-t3">Quién recibe</span>
          <div className="cuenta-campos">
            <Campo id="np-destinatarioNombre" etiqueta="Nombre de quien recibe *" error={campos.destinatarioNombre} icono={<User aria-hidden="true" />}>
              <input {...props('destinatarioNombre')} maxLength={120} placeholder="Pedro Ruiz" />
            </Campo>
            <Campo id="np-destinatarioTelefono" etiqueta="Teléfono de quien recibe" nota="Opcional" error={campos.destinatarioTelefono} icono={<Phone aria-hidden="true" />}>
              <input {...props('destinatarioTelefono')} type="tel" inputMode="tel" maxLength={30} />
            </Campo>
            <Campo id="np-direccionEntrega" etiqueta="Dirección de entrega *" error={campos.direccionEntrega} ancho area icono={<MapPin aria-hidden="true" />}>
              <textarea {...props('direccionEntrega')} rows={2} maxLength={200} placeholder="Ej: Calle 70 # 1-10, Barrio Calima" />
            </Campo>
          </div>
        </section>

        <p className="nuevo-domicilio">
          {tarifa > 0
            ? <>Tu domicilio de siempre es <b className="nuevo-valor">{pesos(tarifa)}</b>. Si para este pedido es otro valor, la oficina te escribe por WhatsApp antes de enviarlo.</>
            : <>La oficina te escribe por WhatsApp con el valor del domicilio antes de enviarlo.</>}
        </p>
        <div className="nuevo-pie">
          <button type="button" className="btn sec" onClick={alCerrar} disabled={enviar.isPending}>Cancelar</button>
          <button type="submit" className="btn" disabled={enviar.isPending}><Send size={17} aria-hidden="true" />{enviar.isPending ? 'Enviando…' : 'Enviar solicitud'}</button>
        </div>
      </form>
    </>
  );
}
