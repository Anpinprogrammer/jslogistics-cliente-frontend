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

export type EstadoPedido = 'pendiente' | 'entregado' | 'devuelto';
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

export type TipoArchivo = 'salida' | 'entrega' | 'firma';
export interface Archivo {
  tipo: TipoArchivo;
  url: string;
}

export interface Cliente {
  id: string;
  nombre: string;
  telefono: string;
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
