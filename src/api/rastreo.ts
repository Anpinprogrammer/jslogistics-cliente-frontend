import { api, DEMO, ApiError } from './http';
import type { Rastreo, PasoRastreo } from '../types/dominio';

// Los datos de prueba solo se descargan en el modo demo.
const pedidosDemo = () => import('../demo/datos').then(m => m.demo.pedidos());

const HORA = 3_600_000;

/** Rastreo público de una guía (GET /rastreo/:guia). Sin sesión: el backend solo devuelve pasos y fechas. */
export async function rastrearGuia(guia: string): Promise<Rastreo> {
  if (!DEMO) return (await api<{ rastreo: Rastreo }>(`/rastreo/${encodeURIComponent(guia)}`)).rastreo;
  const pedido = (await pedidosDemo()).find(p => p.guia.toUpperCase() === guia.toUpperCase());
  if (!pedido) throw new ApiError(404, 'NO_ENCONTRADO', 'No encontramos esa guía en la demostración. Prueba uno de los ejemplos.');
  // En la demo todas las guías se tratan como pedidas por la página: solicitado y guía generada llegan antes de la recogida.
  const creado = new Date(pedido.creado).getTime();
  const iso = (t: number) => new Date(t).toISOString();
  const enRuta = pedido.estado !== 'aceptado';
  const devuelto = pedido.estado === 'devuelto';
  const cerrado = enRuta && pedido.estado !== 'pendiente';
  const pasos: PasoRastreo[] = [
    { clave: 'solicitado', titulo: 'Solicitado', fecha: iso(creado - 3 * HORA), completado: true },
    { clave: 'guia_generada', titulo: 'Guía generada', fecha: iso(creado - 2 * HORA), completado: true },
    { clave: 'recogido', titulo: 'Recogido', fecha: enRuta ? iso(creado) : null, completado: enRuta },
    { clave: 'en_ruta', titulo: 'En ruta', fecha: enRuta ? iso(creado) : null, completado: enRuta },
    devuelto
      ? { clave: 'devuelto', titulo: 'Novedad con el envío', fecha: pedido.entregado, completado: true }
      : { clave: 'entregado', titulo: 'Entregado', fecha: cerrado ? pedido.entregado : null, completado: cerrado },
  ];
  const estado = devuelto ? 'devuelto' : cerrado ? 'entregado' : enRuta ? 'en_ruta' : 'guia_generada';
  return {
    guia: pedido.guia, estado, estadoTexto: pasos.find(p => p.clave === estado)?.titulo ?? '', pasos, novedad: devuelto,
    whatsapp: devuelto ? 'https://wa.me/573000000000' : null,
  };
}
