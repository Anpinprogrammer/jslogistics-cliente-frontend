import { api, ApiError, DEMO } from './http';

export interface MensajeChat {
  rol: 'user' | 'assistant';
  contenido: string;
}

export interface DerivacionChat {
  canal: 'whatsapp';
  numero: string | null;
  url: string | null;
}

/** Resumen de una solicitud que armó el asistente: la arma el servidor, y solo se envía al pulsar Confirmar. */
export interface BorradorSolicitud {
  id: string;
  vence: string;
  resumen: {
    recogida: string;
    entrega: string;
    destinatario: string;
    destinatarioTelefono: string | null;
    paquetes: number;
    pesoKg: number | null;
    contacto: string;
    telefonoContacto: string;
  };
}

/** Fotos y firma de un pedido, con enlaces firmados que vencen en pocos minutos. */
export interface EvidenciasPedido {
  guia: string;
  vigenteSegundos: number;
  items: { tipo: 'recogida' | 'entrega' | 'firma'; etiqueta: string; url: string; creado: string }[];
}

export interface RespuestaChat {
  respuesta: string;
  derivar: DerivacionChat | null;
  borrador?: BorradorSolicitud | null;
  archivos?: EvidenciasPedido[] | null;
}

/** Botón Confirmar: crea la solicitud. Repetirlo no crea otra. */
export async function confirmarBorrador(id: string): Promise<void> {
  if (DEMO) { await new Promise(r => setTimeout(r, 300)); return; }
  await api(`/chatbot/borradores/${encodeURIComponent(id)}/confirmar`, { method: 'POST' });
}

export async function cancelarBorrador(id: string): Promise<void> {
  if (DEMO) return;
  await api(`/chatbot/borradores/${encodeURIComponent(id)}/cancelar`, { method: 'POST' });
}

/** Solo se pintan imágenes que vengan por https del almacenamiento del backend. */
export function urlImagenSegura(url: string): string | null {
  if (DEMO && url.startsWith('data:image/svg+xml')) return url; // solo las imágenes inventadas de la vista previa
  try { const u = new URL(url); return u.protocol === 'https:' ? u.href : null; } catch { return null; }
}

/** El endpoint público ignora la cookie; el privado identifica al cliente por su sesión. */
export async function enviarChat(mensajes: MensajeChat[], esCliente: boolean, signal?: AbortSignal): Promise<RespuestaChat> {
  if (DEMO) {
    await new Promise<void>((resolve, reject) => {
      if (signal?.aborted) { reject(new DOMException('Cancelado', 'AbortError')); return; }
      const cancelar = () => { clearTimeout(timer); reject(new DOMException('Cancelado', 'AbortError')); };
      const timer = setTimeout(() => { signal?.removeEventListener('abort', cancelar); resolve(); }, 350);
      signal?.addEventListener('abort', cancelar, { once: true });
    });
    if (esCliente && /env[ií]o|recog/i.test(mensajes.at(-1)?.contenido ?? '')) {
      return {
        respuesta: 'Listo, revisa el resumen y, si está bien, pulsa **Confirmar** para enviarlo a la oficina.', derivar: null,
        borrador: { id: 'demo-borrador', vence: new Date(Date.now() + 30 * 60_000).toISOString(), resumen: { recogida: 'Calle 5 # 10-20, Cali', entrega: 'Carrera 40 # 3-15, Cali', destinatario: 'Laura Gómez', destinatarioTelefono: '3105551234', paquetes: 2, pesoKg: null, contacto: 'Cliente demo', telefonoContacto: '3001234567' } },
      };
    }
    if (esCliente && /foto|firma|prueba/i.test(mensajes.at(-1)?.contenido ?? '')) {
      const img = (t: string) => `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="320" height="240"><rect width="320" height="240" fill="#cbd5e1"/><text x="160" y="125" text-anchor="middle" font-family="sans-serif" font-size="18" fill="#334155">${t}</text></svg>`)}`;
      return {
        respuesta: 'Estas son las evidencias del pedido **JS-00123**.', derivar: null,
        archivos: [{ guia: 'JS-00123', vigenteSegundos: 900, items: [
          { tipo: 'recogida', etiqueta: 'Foto de recogida', url: img('Foto de recogida'), creado: new Date().toISOString() },
          { tipo: 'entrega', etiqueta: 'Foto de entrega', url: img('Foto de entrega'), creado: new Date().toISOString() },
          { tipo: 'firma', etiqueta: 'Firma de quien recibió', url: img('Firma'), creado: new Date().toISOString() },
        ] }],
      };
    }
    return { respuesta: 'Esta vista previa usa datos de demostración. El asistente conectado responde en el sitio publicado.', derivar: null };
  }
  return api<RespuestaChat>(esCliente ? '/chatbot/mensajes' : '/chatbot/publico/mensajes', { method: 'POST', json: { mensajes }, signal });
}

export function enlaceWhatsApp(derivacion: DerivacionChat | null | undefined): string | null {
  if (!derivacion?.url) return null;
  try {
    const url = new URL(derivacion.url);
    return url.protocol === 'https:' && url.hostname === 'wa.me' ? url.href : null;
  } catch { return null; }
}

export function derivacionDeError(error: unknown): DerivacionChat | null {
  if (!(error instanceof ApiError) || !error.detalle || typeof error.detalle !== 'object') return null;
  const derivar = 'derivar' in error.detalle ? error.detalle.derivar : null;
  if (!derivar || typeof derivar !== 'object' || !('canal' in derivar) || derivar.canal !== 'whatsapp') return null;
  const numero = 'numero' in derivar && typeof derivar.numero === 'string' ? derivar.numero : null;
  const url = 'url' in derivar && typeof derivar.url === 'string' ? derivar.url : null;
  return { canal: 'whatsapp', numero, url };
}
