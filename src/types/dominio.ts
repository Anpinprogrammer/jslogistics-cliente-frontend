/**
 * Tipos del dominio, sacados de js-logistics/docs/datos.md y de la API del backend (backend/README.md).
 * Dinero en pesos enteros; fechas en ISO 8601 (como las devuelve la API).
 */
export type Rol = 'admin' | 'asistente' | 'mensajero' | 'cliente';

export interface Usuario {
  id: string;
  email: string;
  nombre: string;
  rol: Rol;
  clienteId: string | null;
  mensajeroId: string | null;
}

/** Enlace que llega por correo para activar una cuenta o cambiar la contraseña. */
export interface EnlaceCorreo {
  tipo: 'activacion' | 'clave';
  nombre: string;
  /** Correo tapado por el servidor, por ejemplo c******@js.co. */
  email: string;
  expira: string;
}

/** aceptado: la oficina aprobó tu solicitud y asignó un mensajero, pero todavía no lo recoge; pendiente: en ruta. */
export type EstadoPedido = 'aceptado' | 'pendiente' | 'entregado' | 'devuelto';

/** Estados de una solicitud (GET /solicitudes/mias). cotizada = la oficina propuso un valor y espera tu respuesta. */
export type EstadoSolicitud = 'pendiente' | 'cotizada' | 'confirmada' | 'asignada' | 'rechazada';
/** Una solicitud de envío del cliente, como la responde GET /solicitudes/mias (solo los campos que el cliente puede ver). */
export interface SolicitudCliente {
  id: string;
  estado: EstadoSolicitud;
  origen: 'publico' | 'portal';
  direccionRecogida: string;
  paquetes: number;
  pesoKg: number | null;
  destinatarioNombre: string;
  destinatarioTelefono: string;
  direccionEntrega: string;
  /** Domicilio que propuso o acordó la oficina (null mientras no lo revisa). */
  valor: number | null;
  /** Razón del rechazo (vacía si no se rechazó). */
  motivoRechazo: string;
  /** Guía creada al asignar el mensajero, y su estado. */
  guia: string | null;
  pedidoEstado: EstadoPedido | null;
  creado: string;
  actualizado: string;
}
export interface PaginaSolicitudes {
  solicitudes: SolicitudCliente[];
  pagina: number;
  porPagina: number;
  /** Con sinTotal no se envía. */
  total?: number;
  paginas?: number;
  /** Paginación sin COUNT(*): hay otra página después de esta. */
  hayMas?: boolean;
}
export type MetodoPago = '' | 'efectivo' | 'transf_js' | 'transf_cliente' | 'devuelto';
export type Motivo = 'no_contesta' | 'direccion' | 'rechazo' | 'reprogramar' | 'otro';

export interface Intento {
  fecha: string;
  motivo: Motivo;
  nota: string;
}

export interface Pedido {
  guia: string;
  n: number;
  estado: EstadoPedido;
  creado: string;
  clienteId: string | null;
  clienteNombre?: string | null;
  valorServicio: number;
  aCobrar: number;
  entregado: string | null;
  destinatario: string;
  valorCobrado: number;
  metodo: MetodoPago;
  cuentaJs: '' | 'nequi' | 'bancolombia';
  motivoDev: '' | Motivo;
  notaDev: string;
  cobrarDev: boolean;
  /** Devuelto: dónde quedó el paquete. "por_definir" hasta que el mensajero lo diga; "" = devuelto de antes del cambio. */
  destinoDev?: '' | 'por_definir' | 'cliente' | 'oficina' | 'reintento';
  /** Si este pedido es el reintento de otro (la guía de origen) y los reintentos que tiene él. */
  reintentoDe?: string | null;
  reintentos?: { guia: string; estado: EstadoPedido }[];
  /** Cuándo pediste el reintento (la oficina lo asigna a un mensajero). */
  reintentoPedido?: string | null;
  cambio: boolean;
  cambioRecibido: string | null;
  gasto: number;
  gastoNota: string;
  domiPagado: boolean;
  domiPagoValor: number | null;
  intentos: Intento[];
  /** URL de la miniatura (la sirve el backend desde Storage). */
  mini?: string | null;
}

/** Una página del paginador de pedidos (GET /pedidos?pagina=&porPagina=). */
export interface PaginaPedidos {
  pedidos: Pedido[];
  pagina: number;
  porPagina: number;
  /** Con sinTotal no se envía. */
  total?: number;
  paginas?: number;
  /** Paginación sin COUNT(*): hay otra página después de esta. */
  hayMas?: boolean;
}

export type TipoArchivo = 'salida' | 'entrega' | 'firma';
export interface Archivo {
  tipo: TipoArchivo;
  url: string;
}

export interface Cliente {
  id: string;
  nombre: string;
  telefono: string;
  direccionRecogida: string;
  tarifa: number;
}

export type TipoMovimiento = 'cargo' | 'abono' | 'pago_de_cliente' | 'pago_a_cliente' | 'compra_cliente' | 'ganancia';
export interface Movimiento {
  id: string;
  clienteId: string;
  tipo: TipoMovimiento;
  valor: number;
  medio: string;
  nota: string;
  fecha: string;
}
