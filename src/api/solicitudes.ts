import { api } from './http';

/** Lo que manda el formulario público "Solicitar envío". Coincide con POST /solicitudes/publico (backend/README.md). */
export interface DatosSolicitud {
  nombre: string;
  telefono: string;
  email: string;
  direccionRecogida: string;
  paquetes: number;
  /** En kilos; vacío si no se sabe. */
  pesoKg: number | null;
  destinatarioNombre: string;
  destinatarioTelefono: string;
  direccionEntrega: string;
  /** Campo trampa para robots: una persona no lo ve y lo deja vacío. */
  sitio: string;
}

export const solicitudesApi = {
  /** Sin sesión. El backend responde siempre `{ solicitud: { recibida: true } }` y no devuelve lo guardado. */
  async enviar(datos: DatosSolicitud): Promise<void> {
    await api('/solicitudes/publico', { method: 'POST', json: datos });
  },
};
