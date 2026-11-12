/**
 * Datos de prueba para mostrar los portales sin backend (VITE_DEMO=true, `npm run dev:demo`).
 * Son inventados: un cliente ("Tienda Luna") con 30 días de envíos, pagos y prendas de cambio.
 * Credenciales: cliente@demo.co / demo1234
 */
import type { Archivo, Cliente, Movimiento, Motivo, PaginaSolicitudes, Pedido, SolicitudCliente, Usuario } from '../types/dominio';
import { filasCuenta, saldoCliente } from '../lib/negocio';
import { ApiError } from '../api/http';

const CLAVE_SESION = 'jsl_demo_sesion';
const CLAVE_CAMBIOS = 'jsl_demo_cambios';
const USUARIO: Usuario = { id: 'u-demo', email: 'cliente@demo.co', nombre: 'Laura Gómez', rol: 'cliente', clienteId: 'c-luna', mensajeroId: null };
const CLIENTE: Cliente = { id: 'c-luna', nombre: 'Tienda Luna', telefono: '3001234567', direccionRecogida: '', tarifa: 8000 };
let clienteDemo = { ...CLIENTE }, usuarioDemo = { ...USUARIO }, claveDemo = 'demo1234';

const leer = (k: string) => { try { return localStorage.getItem(k); } catch { return null; } };
const guardar = (k: string, v: string | null) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch { /* sin almacenamiento */ } };
const espera = <T,>(v: T, msEspera = 250) => new Promise<T>(r => setTimeout(() => r(v), msEspera));

// Generador con semilla: los mismos datos en cada recarga.
let semilla = 7;
const azar = () => { semilla = (semilla * 16807) % 2147483647; return (semilla - 1) / 2147483646; };
const elegir = <T,>(xs: T[]) => xs[Math.floor(azar() * xs.length)];

const NOMBRES = ['Carolina Ríos', 'Andrés Muñoz', 'Valentina Ortiz', 'Julián Castro', 'Paola Herrera', 'Santiago Vélez',
  'Daniela Rojas', 'Camilo Restrepo', 'Natalia Cárdenas', 'Mateo Quintero', 'Sara Londoño', 'Felipe Arango'];
const MOTIVOS_DEV: Motivo[] = ['no_contesta', 'direccion', 'rechazo'];
const HORA = 3600_000, DIA = 24 * HORA;

function generar(): Pedido[] {
  semilla = 7;
  const ahora = Date.now(), lista: Pedido[] = [];
  let n = 1200;
  for (let d = 29; d >= 0; d--) {
    const cuantos = d === 0 ? 6 : 1 + Math.floor(azar() * 4);
    for (let k = 0; k < cuantos; k++) {
      n++;
      const creado = ahora - d * DIA - (9 - k) * HORA + Math.floor(azar() * 40) * 60_000;
      const aCobrar = elegir([0, 45000, 62000, 78000, 89900, 120000, 135000]);
      const base: Pedido = {
        guia: 'JS-' + String(n).padStart(5, '0'), n, estado: 'pendiente', creado: new Date(creado).toISOString(),
        clienteId: CLIENTE.id, clienteNombre: CLIENTE.nombre, valorServicio: CLIENTE.tarifa, aCobrar,
        entregado: null, destinatario: '', valorCobrado: 0, metodo: '', cuentaJs: '', motivoDev: '', notaDev: '',
        cobrarDev: false, cambio: false, cambioRecibido: null, gasto: 0, gastoNota: '', domiPagado: false, domiPagoValor: null,
        intentos: [],
      };
      const r = azar();
      const enRuta = d === 0 && k >= 3;
      // El primero de los de hoy salió de una solicitud y el mensajero todavía no lo recoge.
      if (enRuta && k === 3) { lista.push({ ...base, estado: 'aceptado', aCobrar: 0 }); continue; }
      if (enRuta) { if (k === 5) base.intentos = [{ fecha: new Date(creado + 2 * HORA).toISOString(), motivo: 'no_contesta', nota: 'No abren' }]; lista.push(base); continue; }
      const cierre = new Date(creado + (2 + Math.floor(azar() * 5)) * HORA).toISOString();
      if (r < 0.88) {
        const metodo = aCobrar === 0 ? 'efectivo' : elegir(['efectivo', 'efectivo', 'transf_js', 'transf_cliente'] as const);
        lista.push({ ...base, estado: 'entregado', entregado: cierre, destinatario: elegir(NOMBRES), valorCobrado: aCobrar, metodo,
          cuentaJs: metodo === 'transf_js' ? elegir(['nequi', 'bancolombia'] as const) : '',
          cambio: azar() < 0.08, cambioRecibido: null,
          gasto: azar() < 0.1 ? 6000 : 0, gastoNota: '', domiPagado: aCobrar === 0 });
      } else {
        lista.push({ ...base, estado: 'devuelto', entregado: cierre, metodo: 'devuelto', motivoDev: elegir(MOTIVOS_DEV), cobrarDev: azar() < 0.5,
          notaDev: 'Se intentó dos veces', intentos: [{ fecha: new Date(creado + HORA).toISOString(), motivo: 'no_contesta', nota: '' }] });
      }
    }
  }
  // Los cambios viejos ya se recibieron; los de esta semana siguen pendientes.
  for (const p of lista) if (p.cambio && Date.now() - new Date(p.entregado!).getTime() > 7 * DIA) p.cambioRecibido = new Date(new Date(p.entregado!).getTime() + DIA).toISOString();
  return lista.sort((a, b) => b.n - a.n);
}

/* Solicitudes de ejemplo, una por estado. La aprobada apunta a la guía "aceptado" de hoy. */
const solicitudesNuevas: SolicitudCliente[] = [];
function solicitudesDemo(): SolicitudCliente[] {
  const ahora = Date.now(), f = (h: number) => new Date(ahora - h * HORA).toISOString();
  const aceptado = pedidosActuales().find(p => p.estado === 'aceptado');
  const base = { origen: 'portal' as const, direccionRecogida: 'Cra 24 # 9-30, San Fernando', paquetes: 1, pesoKg: null, destinatarioTelefono: '311 000 0000', motivoRechazo: '', guia: null, pedidoEstado: null };
  return [
    { ...base, id: 'sd1', estado: 'pendiente', destinatarioNombre: 'Carolina Ríos', direccionEntrega: 'Calle 5 # 66-20, El Ingenio', valor: null, creado: f(0.5), actualizado: f(0.5) },
    { ...base, id: 'sd2', estado: 'cotizada', destinatarioNombre: 'Andrés Muñoz', direccionEntrega: 'Jamundí, Cra 10 # 12-04', paquetes: 2, valor: 14000, creado: f(3), actualizado: f(2) },
    { ...base, id: 'sd3', estado: 'asignada', destinatarioNombre: 'Valentina Ortiz', direccionEntrega: 'Av 3N # 44-15, La Flora', valor: CLIENTE.tarifa,
      guia: aceptado?.guia ?? null, pedidoEstado: aceptado ? 'aceptado' : null, creado: f(6), actualizado: f(5) },
    { ...base, id: 'sd4', estado: 'rechazada', destinatarioNombre: 'Julián Castro', direccionEntrega: 'Buenaventura, centro', valor: null,
      motivoRechazo: 'No tenemos cobertura en Buenaventura. Te recomendamos una transportadora nacional.', creado: f(30), actualizado: f(28) },
  ];
}

function generarMovs(): Movimiento[] {
  const ahora = Date.now(), m: Movimiento[] = [];
  const mov = (dias: number, tipo: Movimiento['tipo'], valor: number, nota: string, medio = 'nequi') =>
    m.push({ id: 'm' + m.length, clienteId: CLIENTE.id, tipo, valor, medio, nota, fecha: new Date(ahora - dias * DIA - 2 * HORA).toISOString() });
  mov(28, 'pago_a_cliente', 300000, 'Cuadre semana 1');
  mov(21, 'pago_a_cliente', 420000, 'Cuadre semana 2', 'bancolombia');
  mov(14, 'pago_a_cliente', 380000, 'Cuadre semana 3');
  mov(10, 'cargo', 15000, 'Empaque especial');
  mov(7, 'pago_a_cliente', 400000, 'Cuadre semana 4');
  mov(1, 'pago_a_cliente', 250000, 'Abono parcial', 'efectivo');
  return m.sort((a, b) => +new Date(b.fecha) - +new Date(a.fecha));
}

const svg = (fondo: string, texto: string, extra = '') =>
  'data:image/svg+xml;utf8,' + encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="360" viewBox="0 0 480 360"><rect width="480" height="360" fill="${fondo}"/>${extra}<text x="240" y="330" font-family="sans-serif" font-size="22" fill="#fff" text-anchor="middle">${texto}</text></svg>`);
const CAJA = '<rect x="150" y="90" width="180" height="150" rx="8" fill="#c8a165"/><path d="M150 140h180M240 90v150" stroke="#8a6a3b" stroke-width="6"/>';
const FIRMA = '<path d="M80 220c40-80 70 40 110-30s50 60 90-10 60 40 120-20" stroke="#0f1f3d" stroke-width="5" fill="none"/>';

let pedidosMem: Pedido[] | null = null;
function pedidosActuales() {
  if (!pedidosMem) pedidosMem = generar();
  const confirmados: Record<string, string> = JSON.parse(leer(CLAVE_CAMBIOS) || '{}');
  return pedidosMem.map(p => (confirmados[p.guia] ? { ...p, cambioRecibido: confirmados[p.guia] } : p));
}

export const demo = {
  sesion: () => espera(leer(CLAVE_SESION) ? usuarioDemo : null, 150),
  async ingresar(email: string, clave: string) {
    await espera(null, 400);
    if (email.trim().toLowerCase() !== usuarioDemo.email || clave !== claveDemo)
      throw new ApiError(401, 'CREDENCIALES', 'Correo o contraseña incorrectos. En la demo usa cliente@demo.co / demo1234.');
    guardar(CLAVE_SESION, '1');
    return usuarioDemo;
  },
  salir: async () => { guardar(CLAVE_SESION, null); },
  async cambiarClave(claveActual: string, claveNueva: string) {
    await espera(null, 250);
    if (claveActual !== claveDemo) throw new ApiError(400, 'DATOS_INVALIDOS', 'La contraseña actual no es correcta');
    if (claveNueva.length < 10) throw new ApiError(400, 'DATOS_INVALIDOS', 'La nueva contraseña debe tener al menos 10 caracteres');
    claveDemo = claveNueva;
  },
  async actualizarPerfil(datos: { nombre: string; telefono: string; direccionRecogida: string; email: string; claveActual?: string }) {
    await espera(null, 250);
    if (datos.email !== usuarioDemo.email && datos.claveActual !== claveDemo)
      throw new ApiError(400, 'DATOS_INVALIDOS', 'Escribe tu contraseña actual para cambiar el correo');
    clienteDemo = { ...clienteDemo, nombre: datos.nombre.trim(), telefono: datos.telefono.trim(), direccionRecogida: datos.direccionRecogida.trim() };
    usuarioDemo = { ...usuarioDemo, email: datos.email.trim().toLowerCase() };
    return clienteDemo;
  },
  /** En la demo la solicitud no sale del navegador: se valida lo mínimo, se responde como el backend y aparece en "Mis solicitudes". */
  async nuevaSolicitud(datos: { nombre: string; direccionRecogida: string; destinatarioNombre: string; destinatarioTelefono?: string; direccionEntrega: string; paquetes?: number | string; pesoKg?: number | string | null }) {
    await espera(null, 450);
    if (!datos.nombre.trim() || !datos.direccionRecogida.trim() || !datos.destinatarioNombre.trim() || !datos.direccionEntrega.trim())
      throw new ApiError(400, 'DATOS_INVALIDOS', 'Completa los campos obligatorios');
    const ahora = new Date().toISOString();
    solicitudesNuevas.unshift({ id: 'demo-' + Date.now(), estado: 'pendiente', origen: 'portal', direccionRecogida: datos.direccionRecogida.trim(),
      paquetes: Number(datos.paquetes) || 1, pesoKg: datos.pesoKg ? Number(datos.pesoKg) : null, destinatarioNombre: datos.destinatarioNombre.trim(),
      destinatarioTelefono: datos.destinatarioTelefono?.trim() || '', direccionEntrega: datos.direccionEntrega.trim(), valor: null, motivoRechazo: '',
      guia: null, pedidoEstado: null, creado: ahora, actualizado: ahora });
  },
  pedidos: () => espera(pedidosActuales()),
  solicitudes: (pagina: number, porPagina: number): Promise<PaginaSolicitudes> => {
    const todas = [...solicitudesNuevas, ...solicitudesDemo()], total = todas.length, paginas = Math.max(1, Math.ceil(total / porPagina));
    const actual = Math.min(Math.max(1, pagina), paginas);
    return espera({ solicitudes: todas.slice((actual - 1) * porPagina, actual * porPagina), pagina: actual, porPagina, total, paginas });
  },
  cliente: () => espera(clienteDemo),
  movimientos: () => espera(generarMovs()),
  cuenta: (pagina: number, porPagina: number) => {
    const pedidos = pedidosActuales(), movs = generarMovs();
    const filas = filasCuenta(pedidos, movs);
    const total = filas.length, paginas = Math.max(1, Math.ceil(total / porPagina));
    const actual = Math.min(Math.max(1, pagina), paginas);
    return espera({
      saldo: saldoCliente(pedidos, movs),
      enRuta: pedidos.filter(p => p.estado === 'pendiente').length,
      filas: filas.slice((actual - 1) * porPagina, actual * porPagina),
      pagina: actual, porPagina, total, paginas,
    });
  },
  archivos: (guia: string) => {
    const p = pedidosActuales().find(x => x.guia === guia);
    // Una guía "aceptado" todavía no tiene foto: el mensajero la toma al recogerla.
    const a: Archivo[] = p?.estado === 'aceptado' ? [] : [{ tipo: 'salida', url: svg('#25508e', 'Salida ' + guia, CAJA) }];
    if (p?.estado === 'entregado') a.push({ tipo: 'entrega', url: svg('#16794A', 'Entrega ' + guia, CAJA) }, { tipo: 'firma', url: svg('#f4f6f9', '', FIRMA) });
    if (p?.estado === 'devuelto') a.push({ tipo: 'entrega', url: svg('#C0392B', 'Evidencia ' + guia, CAJA) });
    return espera(a, 350);
  },
  async confirmarCambio(guia: string) {
    const c = JSON.parse(leer(CLAVE_CAMBIOS) || '{}');
    c[guia] = new Date().toISOString();
    guardar(CLAVE_CAMBIOS, JSON.stringify(c));
    await espera(null, 300);
  },
};
