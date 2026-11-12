// Avisos de la landing pública y del portal del cliente, con react-toastify.
// El tema (claro/oscuro) se lee de la clase `dark` de <html> en cada aviso, así siempre coincide con el sitio.
import { toast, type ToastOptions } from 'react-toastify';

const opciones = (): ToastOptions => ({
  position: 'top-right',
  autoClose: 3500,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light',
  className: 'jsl-toast',
});

/** Elige el tipo según cómo empieza el texto (los avisos del portal son frases cortas en español). */
const esFallo = (m: string) => /^(No se pudo|No pudimos|No pudo|Error|Falló)/i.test(m);

export const clientToast = {
  success: (mensaje: string) => toast.success(mensaje, opciones()),
  error: (mensaje: string) => toast.error(mensaje, { ...opciones(), autoClose: 5000 }),
  info: (mensaje: string) => toast.info(mensaje, opciones()),
  warning: (mensaje: string) => toast.warning(mensaje, opciones()),
  /** Para los avisos que ya vienen como texto suelto: los que cuentan un fallo salen en rojo y el resto como éxito. */
  auto: (mensaje: string) => (esFallo(mensaje) ? clientToast.error(mensaje) : clientToast.success(mensaje)),
};
