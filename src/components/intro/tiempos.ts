/*
 * Línea de tiempo y matemáticas de la animación de entrada del login de clientes.
 *
 * Es la misma de la app de oficina (js-logistics/frontend/src/pages/intro/tiempos.ts, que copia el video aprobado
 * de js-logistics/animacion-ingreso/): todo se mide en cuadros a 60 por segundo y termina en el cuadro 240 (4 s).
 * Allá las curvas y los resortes salen del paquete `motion`; aquí se escriben a mano con las mismas fórmulas
 * para no sumar una dependencia al portal.
 */

export const FPS = 60;
/** Cuadro en el que termina todo (4 s). */
export const TOTAL = 240;
/** Los dos mensajeros llegan al logo (0,967 s). */
export const COLISION = 58;
/** Empieza a armarse el contenido de la tarjeta (1,933 s). */
export const T0 = COLISION + 58;

export type Curva = (t: number) => number;

/** Curva cúbica de Bézier como las de CSS y Framer Motion: (x1, y1, x2, y2). */
export function cubicBezier(x1: number, y1: number, x2: number, y2: number): Curva {
  const eje = (t: number, a: number, b: number) => ((1 - 3 * b + 3 * a) * t + (3 * b - 6 * a)) * t * t + 3 * a * t;
  return t => {
    if (t <= 0) return 0;
    if (t >= 1) return 1;
    // Se busca el `u` cuya x es `t` (bisección: 20 pasos dan precisión de sobra para un cuadro).
    let bajo = 0, alto = 1, u = t;
    for (let i = 0; i < 20; i++) {
      u = (bajo + alto) / 2;
      if (eje(u, x1, x2) < t) bajo = u; else alto = u;
    }
    return eje(u, y1, y2);
  };
}

export const rapida = cubicBezier(0.65, 0, 0.25, 1);
export const curvaMensajero = cubicBezier(0.4, 0, 0.7, 0.95);
export const curvaCarga = cubicBezier(0.3, 0, 0.2, 1);
export const easeOut = cubicBezier(0, 0, 0.58, 1);
export const easeInOut = cubicBezier(0.42, 0, 0.58, 1);
export const backOut = cubicBezier(0.33, 1.53, 0.69, 0.99);

/** Lleva el cuadro `c` del tramo [a, b] al rango [x, y], sin salirse de los extremos. */
export function entre(c: number, a: number, b: number, x: number, y: number, curva?: Curva) {
  let t = c <= a ? 0 : c >= b ? 1 : (c - a) / (b - a);
  if (curva) t = curva(t);
  return x + (y - x) * t;
}

/** Avance de 0 a 1 entre los cuadros `a` y `b`. */
export const tramo = (c: number, a: number, b: number, curva: Curva = easeOut) => entre(c, a, b, 0, 1, curva);

/**
 * Resorte (0 → 1) que arranca en el cuadro `inicio`, con masa 1 y sin velocidad inicial: la misma fórmula
 * del `spring` de Framer Motion. Puede pasarse de 1 y volver.
 */
export function resorte(c: number, inicio: number, stiffness: number, damping: number) {
  if (c < inicio) return 0;
  const t = (c - inicio) / FPS;
  const w0 = Math.sqrt(stiffness), z = damping / (2 * w0);
  let v: number;
  if (z < 1) {
    const wd = w0 * Math.sqrt(1 - z * z);
    v = 1 - Math.exp(-z * w0 * t) * (Math.cos(wd * t) + ((z * w0) / wd) * Math.sin(wd * t));
  } else {
    v = 1 - Math.exp(-w0 * t) * (1 + w0 * t);
  }
  // La cola del resorte no se ve, pero deja las piezas a fracciones de píxel de su sitio y eso produce
  // un saltico al entregar el login real. Ahí se da por llegado.
  return t > 0.45 && Math.abs(v - 1) < 0.004 ? 1 : v;
}

/*
 * Números "al azar" fijos, los mismos de la oficina, para que la animación sea siempre igual.
 */
/** Chispas del choque: [ángulo, velocidad], los dos entre 0 y 1. */
export const CHISPAS: [number, number][] = [
  [0.142229, 0.114908], [0.570169, 0.717265], [0.71364, 0.956365], [0.967222, 0.569745], [0.861492, 0.966098],
  [0.50616, 0.405108], [0.697251, 0.535833], [0.137387, 0.481774], [0.522737, 0.102902], [0.945348, 0.206673],
  [0.042943, 0.703806], [0.962642, 0.577132], [0.792382, 0.907331], [0.487577, 0.281462], [0.893975, 0.537032],
  [0.943729, 0.440264], [0.181215, 0.991612], [0.766209, 0.830179], [0.919821, 0.87806], [0.048734, 0.632886],
  [0.981736, 0.229877], [0.55369, 0.409176],
];
/** Temblor de la cámara: [x, y] entre 0 y 1 para los 14 cuadros que siguen al choque. */
export const TEMBLOR: [number, number][] = [
  [0.7885, 0.2153], [0.2255, 0.6756], [0.459, 0.0649], [0.4518, 0.3957], [0.6691, 0.3796], [0.0866, 0.1635],
  [0.3729, 0.923], [0.8901, 0.1254], [0.6774, 0.3074], [0.6418, 0.5984], [0.8689, 0.936], [0.3648, 0.1694],
  [0.6201, 0.4734], [0.9566, 0.2632],
];
