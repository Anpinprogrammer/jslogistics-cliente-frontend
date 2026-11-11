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

export interface RespuestaChat {
  respuesta: string;
  derivar: DerivacionChat | null;
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
