/*
 * Animación de entrada del login de clientes: qué se ve en cada cuadro.
 *
 * Es la misma idea de la entrada del login de oficina (js-logistics/frontend/src/pages/intro/), adaptada al portal:
 * un mensajero de luz sale de la sede de Cali (el pin del mapa) y otro llega desde la esquina, chocan en el logo,
 * nace la marca, se dibuja la tarjeta y el botón empieza como una barra "CARGANDO PORTAL".
 *
 * El fondo (malla, luces y mapa del mundo) no se toca: está quieto desde el primer cuadro, igual que siempre.
 * El formulario, el badge y el botón son los reales; aquí solo se les pone el estilo del cuadro actual.
 * Lo decorativo va en capas aparte, con `aria-hidden` y sin recibir clics. Al terminar no queda nada de esto.
 *
 * Rendimiento: solo se animan `transform`, `opacity` y `clip-path` (y SVG). Las luces desenfocadas solo cambian de
 * opacidad, con `will-change: opacity`. Si en un celular de gama baja hay tirones, lo primero que se quita es el
 * `blur` de las letras del título.
 */
import type { CSSProperties, ReactNode, Ref } from 'react';
import type { IntroMarco } from '../acceso';
import type { Medidas } from './medidas';
import { MARCA_BLANCA } from './useIntroLogin';
import {
  CHISPAS, COLISION, T0, TEMBLOR, curvaCarga, curvaMensajero, easeInOut, easeOut, entre, rapida, resorte, tramo,
} from './tiempos';

export type RefsIntro = {
  raiz: Ref<HTMLDivElement>; sede: Ref<HTMLDivElement>; contenido: Ref<HTMLDivElement>; tarjeta: Ref<HTMLDivElement>;
  insignia: Ref<HTMLDivElement>; placa: Ref<HTMLSpanElement>; titulo: Ref<HTMLHeadingElement>; boton: Ref<HTMLButtonElement>;
};

export type EscenaIntro = {
  marco: IntroMarco;
  boton: { ref: Ref<HTMLButtonElement>; style?: CSSProperties };
  /** "Iniciar sesión" y su descripción. */
  encabezado: CSSProperties;
  /** La caja de credenciales de prueba (solo en modo demo). */
  demo: CSSProperties;
  /** Correo y contraseña: estilo del bloque (etiqueta y campo) y la luz que lo recorre. */
  campos: { estilo: CSSProperties; escaner: ReactNode }[];
  /** La barra "CARGANDO PORTAL" que se vuelve el botón. Va justo antes del botón real. */
  barra: ReactNode;
  enlace: CSSProperties;
};

const CAPA: CSSProperties = { position: 'absolute', inset: 0, pointerEvents: 'none' };
const MONO = 'ui-monospace, SFMono-Regular, Menlo, monospace';
const OCULTO: CSSProperties = { opacity: 0 };
const SIN_VIDRIO: CSSProperties = { background: 'transparent', boxShadow: 'none', backdropFilter: 'none', WebkitBackdropFilter: 'none' };
/** El botón real sigue ahí para el teclado y los lectores de pantalla; solo no se ve mientras la barra carga. */
const BOTON_TAPADO: CSSProperties = { clipPath: 'inset(50%)' };

/** Antes de medir el login (un solo render, que no llega a pintarse) el contenido va oculto. El fondo no. */
function sinMedir(refs: RefsIntro): EscenaIntro {
  return {
    marco: {
      raiz: refs.raiz, sede: refs.sede, detras: null, frente: null,
      contenido: { ref: refs.contenido, style: OCULTO },
      insignia: refs.insignia, halo: OCULTO, placa: { ref: refs.placa, style: OCULTO }, icono: OCULTO,
      titulo: { ref: refs.titulo, style: { position: 'relative', color: 'transparent' } }, letras: null, subtitulo: OCULTO,
      tarjeta: { ref: refs.tarjeta }, borde: OCULTO, haloTarjeta: OCULTO, vidrio: null, cuerpo: SIN_VIDRIO, pie: OCULTO,
    },
    boton: { ref: refs.boton, style: BOTON_TAPADO },
    encabezado: OCULTO, demo: OCULTO,
    campos: [{ estilo: OCULTO, escaner: null }, { estilo: OCULTO, escaner: null }],
    barra: null,
    enlace: OCULTO,
  };
}

/** Bloque que sube con resorte desde `y` px y aparece. Ya en su sitio no lleva estilo, para que se pinte igual que en reposo. */
function sube(c: number, inicio: number, y: number, s = 240, d = 20): CSSProperties {
  const p = resorte(c, inicio, s, d);
  return p === 1 ? {} : { opacity: Math.min(1, Math.max(0, p)), transform: `translateY(${(1 - p) * y}px)` };
}

/** Arma todo lo que la animación le pone al login en el cuadro `c`. */
export function escenaIntro(c: number, m: Medidas | null, refs: RefsIntro, titulo: string): EscenaIntro {
  if (!m) return sinMedir(refs);

  const bcx = m.insignia.x + m.insignia.w / 2, bcy = m.insignia.y + m.insignia.h / 2;

  // Cámara (solo sobre el contenido, el fondo queda quieto): entra un poco cerca y se aleja; temblor corto en el choque.
  const zoom = entre(c, 0, 80, 1.12, 1, rapida);
  const temblor = entre(c, COLISION, COLISION + 14, 1, 0);
  const azar = TEMBLOR[Math.floor(c) - COLISION];
  const sx = azar ? (azar[0] - 0.5) * 10 * temblor : 0, sy = azar ? (azar[1] - 0.5) * 10 * temblor : 0;
  const camara = zoom === 1 && sx === 0 && sy === 0 ? '' : `translate(${sx}px, ${sy}px) scale(${zoom})`;
  const origen = `${bcx - m.contenido.x}px ${bcy - m.contenido.y}px`;

  // Onda del choque: un anillo que se abre desde el logo (no cambia el fondo, solo pasa por encima).
  const onda = entre(c, COLISION, COLISION + 70, 0, Math.hypot(m.W, m.H) * 1.1, easeOut);
  const ondaOp = entre(c, COLISION, COLISION + 70, 1, 0);

  // Tarjeta.
  const relleno = tramo(c, COLISION + 34, COLISION + 80, rapida);
  const escala = 0.965 + 0.035 * resorte(c, COLISION + 34, 160, 20);
  // Cuando al resorte le falta menos de medio píxel se deja quieta: mover la tarjeta obliga a rehacer su desenfoque.
  const esc = Math.abs(escala - 1) < 0.0008 ? 1 : escala;
  const vidrioVisible = c >= COLISION + 34;

  // Badge.
  const placa = resorte(c, COLISION + 38, 280, 16);
  const icono = tramo(c, COLISION + 44, COLISION + 60);

  // Contenido.
  const sub = tramo(c, T0 + 22, T0 + 46);
  const enlace = tramo(c, T0 + 92, T0 + 110);
  const pie = tramo(c, T0 + 96, T0 + 114);

  return {
    marco: {
      raiz: refs.raiz,
      sede: refs.sede,
      contenido: { ref: refs.contenido, style: camara ? { transform: camara, transformOrigin: origen } : undefined },
      detras: (
        <>
          <Despacho c={c} m={m} />
          {c >= COLISION && ondaOp > 0 && (
            <div style={{
              position: 'absolute', left: bcx - onda, top: bcy - onda, width: onda * 2, height: onda * 2, borderRadius: '50%',
              border: '2px solid rgba(125,211,252,.9)', opacity: ondaOp, pointerEvents: 'none',
              boxShadow: '0 0 40px 6px rgba(56,189,248,.45), inset 0 0 40px 6px rgba(56,189,248,.25)',
            }} />
          )}
          <Telemetria c={c} m={m} />
          <Mensajeros c={c} m={m} />
          <Chispas c={c} cx={bcx} cy={bcy} />
        </>
      ),
      frente: (
        <>
          <MarcaBlanca c={c} m={m} cx={bcx} cy={bcy} camara={camara} />
          {/* Destello del choque */}
          {c >= COLISION - 2 && c < COLISION + 26 && (() => {
            const p = tramo(c, COLISION - 2, COLISION + 26);
            const r = 40 + p * (m.chico ? 320 : 520);
            return <div style={{
              position: 'absolute', left: bcx - r, top: bcy - r, width: r * 2, height: r * 2, borderRadius: '50%', pointerEvents: 'none',
              background: 'radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(186,230,253,.85) 18%, rgba(56,189,248,.35) 40%, transparent 70%)',
              opacity: 1 - p, mixBlendMode: 'screen',
            }} />;
          })()}
        </>
      ),

      insignia: refs.insignia,
      halo: placa < 1 ? { opacity: Math.max(0, placa) } : {},
      placa: {
        ref: refs.placa,
        style: placa === 1 ? undefined : { transform: `scale(${placa}) rotate(${(1 - placa) * -18}deg)`, opacity: Math.min(1, placa * 2) },
      },
      icono: icono < 1 ? { opacity: icono } : {},
      titulo: { ref: refs.titulo, style: { position: 'relative', color: 'transparent' } },
      // Título letra por letra, cada una en el sitio exacto que ocupa en el texto real.
      letras: (
        <span aria-hidden style={{ ...CAPA, color: '#fff', textAlign: 'left' }}>
          {m.letras.map((l, i) => {
            const p = resorte(c, T0 + 6 + i * 2.2, 320, 19);
            const borroso = Math.max(0, 1 - p) * 10;
            return (
              <span key={i} style={{
                position: 'absolute', left: l.x, top: l.y, width: l.w, whiteSpace: 'pre', opacity: Math.min(1, p * 1.4),
                transform: p === 1 ? undefined : `translateY(${(1 - p) * 30}px) rotate(${(1 - p) * (i % 2 ? 8 : -8)}deg)`,
                filter: borroso > 0.01 ? `blur(${borroso}px)` : undefined,
              }}>{titulo[i]}</span>
            );
          })}
        </span>
      ),
      subtitulo: sub < 1 ? { opacity: sub, transform: `translateY(${(1 - sub) * 10}px)` } : {},

      tarjeta: { ref: refs.tarjeta, style: esc !== 1 ? { transform: `scale(${esc})` } : undefined },
      borde: { opacity: entre(c, COLISION + 40, COLISION + 70, 0, 0.7), willChange: 'opacity' },
      haloTarjeta: { opacity: entre(c, COLISION + 40, COLISION + 100, 0, 1), willChange: 'opacity' },
      vidrio: (
        <>
          {/* Cuerpo de vidrio: se llena desde arriba, como tinta */}
          {vidrioVisible && (
            <div aria-hidden style={{
              ...CAPA, borderRadius: '1.5rem', background: 'rgba(15,23,42,.6)',
              boxShadow: `0 24px 80px -20px rgba(2,132,199,${0.45 * relleno}), 0 10px 30px rgba(0,0,0,${0.5 * relleno})`,
              backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
              clipPath: `circle(${relleno * 170}% at 50% 0%)`,
            }} />
          )}
          <Trazo c={c} m={m} />
        </>
      ),
      cuerpo: SIN_VIDRIO,
      pie: pie < 1 ? { opacity: pie } : {},
    },

    boton: { ref: refs.boton, style: BOTON_TAPADO },
    encabezado: sube(c, T0 + 18, 18),
    demo: sube(c, T0 + 24, 22),

    campos: [0, 1].map(i => {
      const barrido = tramo(c, T0 + 38 + i * 9, T0 + 70 + i * 9, easeInOut);
      return {
        estilo: sube(c, T0 + 30 + i * 9, 26),
        // Luz que recorre el campo, como un escáner de guía.
        escaner: barrido > 0 && barrido < 1 ? (
          <span aria-hidden style={{ ...CAPA, borderRadius: 12, boxShadow: `0 0 24px -6px rgba(56,189,248,${Math.sin(barrido * Math.PI) * 0.9})` }}>
            <span style={{ position: 'absolute', inset: 1, borderRadius: 11, overflow: 'hidden' }}>
              <span style={{
                position: 'absolute', top: 0, bottom: 0, width: '35%', left: `${-35 + barrido * 135}%`,
                background: 'linear-gradient(90deg, transparent, rgba(56,189,248,.22), transparent)',
                borderTop: '1px solid rgba(125,211,252,.9)', borderBottom: '1px solid rgba(125,211,252,.4)',
              }} />
            </span>
          </span>
        ) : null,
      };
    }),

    barra: <Barra c={c} m={m} />,
    enlace: enlace < 1 ? { opacity: enlace } : {},
  };
}

/* ---------------- Acto 1: la sede despacha y dos mensajeros de luz llegan al portal ---------------- */

/** El pin de Cali "despacha": dos anillos salen de la sede cuando arranca el primer mensajero. */
function Despacho({ c, m }: { c: number; m: Medidas }) {
  if (!m.sede || c > 40) return null;
  const { x, y } = m.sede;
  return (
    <svg width={m.W} height={m.H} style={{ ...CAPA, overflow: 'visible' }}>
      {[0, 10].map(k => {
        const p = tramo(c, k, k + 30);
        if (p <= 0 || p >= 1) return null;
        return <circle key={k} cx={x} cy={y} r={4 + p * 34} stroke="#7dd3fc" strokeWidth={1.6} fill="none" opacity={1 - p} />;
      })}
    </svg>
  );
}

function Mensajeros({ c, m }: { c: number; m: Medidas }) {
  if (c > COLISION + 4) return null;
  return (
    <svg width={m.W} height={m.H} style={{ ...CAPA, overflow: 'visible' }}>
      <defs>
        <filter id="loginIntroBrillo" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      {m.rutas.map((ruta, i) => {
        const { d, largo } = ruta;
        const inicio = 3 + i * 3;
        const p = entre(c, inicio, COLISION, 0, 1, curvaMensajero);
        const recorrido = p * largo;
        const estela = Math.min(recorrido, largo * 0.38);
        const punta = ruta.punto(recorrido), cola = ruta.punto(recorrido - estela);
        const nace = entre(c, inicio, inicio + 8, 0, 1);
        return (
          <g key={i}>
            {/* Ruta completa apenas sugerida */}
            <path d={d} stroke="rgba(56,189,248,.12)" strokeWidth={1.2} strokeDasharray="4 10" fill="none" />
            {/* Estela del mensajero */}
            <linearGradient id={`loginIntroEstela${i}`} gradientUnits="userSpaceOnUse" x1={cola.x} y1={cola.y} x2={punta.x} y2={punta.y}>
              <stop offset="0" stopColor="#0284c7" stopOpacity="0" />
              <stop offset=".7" stopColor="#38bdf8" stopOpacity=".9" />
              <stop offset="1" stopColor="#e0f2fe" />
            </linearGradient>
            <path d={d} fill="none" stroke={`url(#loginIntroEstela${i})`} strokeWidth={3} strokeLinecap="round"
              strokeDasharray={`${estela} ${largo * 2}`} strokeDashoffset={-(recorrido - estela)} filter="url(#loginIntroBrillo)" />
            {/* Paradas de entrega: se encienden cuando el mensajero pasa */}
            {[0.3, 0.62].map((q, k) => {
              if (p < q) return null;
              const pt = ruta.punto(q * largo);
              const desde = entre(p, q, Math.min(1, q + 0.25), 0, 1);
              return (
                <g key={k}>
                  <circle cx={pt.x} cy={pt.y} r={4} fill="#38bdf8" opacity={1 - desde * 0.4} />
                  <circle cx={pt.x} cy={pt.y} r={4 + desde * 22} stroke="#7dd3fc" strokeWidth={1.5} fill="none" opacity={1 - desde} />
                </g>
              );
            })}
            {/* Cabeza del mensajero */}
            <circle cx={punta.x} cy={punta.y} r={16 * nace} fill="rgba(56,189,248,.25)" filter="url(#loginIntroBrillo)" />
            <circle cx={punta.x} cy={punta.y} r={5 * nace} fill="#ffffff" filter="url(#loginIntroBrillo)" />
          </g>
        );
      })}
    </svg>
  );
}

const TELEMETRIA = ['CALI · 3.4516° N · 76.5320° W', 'ABRIENDO EL PORTAL DE CLIENTES…'];

function Telemetria({ c, m }: { c: number; m: Medidas }) {
  const op = c < COLISION ? entre(c, 6, 14, 0, 1) : entre(c, COLISION, COLISION + 16, 1, 0);
  if (op <= 0) return null;
  return (
    <div style={{
      position: 'absolute', left: m.chico ? 20 : 40, top: m.H - (m.chico ? 64 : 76), opacity: op, pointerEvents: 'none',
      fontFamily: MONO, fontSize: m.chico ? 10 : 12, letterSpacing: '0.18em', color: 'rgba(125,211,252,.75)', lineHeight: 1.8,
      whiteSpace: 'nowrap',
    }}>
      {TELEMETRIA.map((texto, i) => {
        const k = Math.floor(entre(c, 8 + i * 14, 30 + i * 14, 0, texto.length));
        return <div key={i}>{texto.slice(0, k)}{k < texto.length && k > 0 ? '▍' : ''}</div>;
      })}
    </div>
  );
}

/* ---------------- Choque: chispas ---------------- */

function Chispas({ c, cx, cy }: { c: number; cx: number; cy: number }) {
  if (c < COLISION || c > COLISION + 46) return null;
  const p = entre(c, COLISION, COLISION + 46, 0, 1, easeOut);
  return (
    <svg style={{ ...CAPA, width: '100%', height: '100%', overflow: 'visible' }}>
      {CHISPAS.map(([a, v], i) => {
        const ang = a * Math.PI * 2;
        const d = (90 + v * 260) * p;
        const x = cx + Math.cos(ang) * d, y = cy + Math.sin(ang) * d;
        const cola = 18 * (1 - p);
        return (
          <line key={i} x1={x} y1={y} x2={x - Math.cos(ang) * cola} y2={y - Math.sin(ang) * cola}
            stroke={i % 3 === 0 ? '#ffffff' : '#7dd3fc'} strokeWidth={2} strokeLinecap="round" opacity={1 - p} />
        );
      })}
    </svg>
  );
}

/* ---------------- Acto 2: la tarjeta se dibuja ---------------- */

/** Trazo de luz que dibuja el borde de la tarjeta, en los dos sentidos. */
function Trazo({ c, m }: { c: number; m: Medidas }) {
  const trazoOp = entre(c, COLISION + 46, COLISION + 72, 1, 0);
  if (trazoOp <= 0 || c < COLISION + 6) return null;
  const w = m.tarjeta.w + 2, h = m.tarjeta.h + 2, { d, largo } = m.borde;
  const trazo = tramo(c, COLISION + 6, COLISION + 46, rapida);
  const cabeza = m.borde.punto(trazo * largo);
  return (
    <svg aria-hidden width={w} height={h} style={{ position: 'absolute', left: -1, top: -1, overflow: 'visible', opacity: trazoOp, pointerEvents: 'none' }}>
      <defs>
        <filter id="loginIntroBorde" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      {[1, -1].map(s => (
        <g key={s} transform={s === -1 ? `translate(${w} 0) scale(-1 1)` : undefined}>
          <path d={d} fill="none" stroke="#7dd3fc" strokeWidth={2} strokeLinecap="round"
            strokeDasharray={`${trazo * largo} ${largo * 2}`} filter="url(#loginIntroBorde)" />
          {trazo < 1 && <circle cx={cabeza.x} cy={cabeza.y} r={4} fill="#fff" filter="url(#loginIntroBorde)" />}
        </g>
      ))}
    </svg>
  );
}

/* ---------------- La marca nace en el punto del choque ---------------- */

/** Marca blanca grande que nace del destello y se encoge hasta meterse en el badge. */
function MarcaBlanca({ c, m, cx, cy, camara }: { c: number; m: Medidas; cx: number; cy: number; camara: string }) {
  if (c < COLISION) return null;
  const lado = m.insignia.w;
  const nace = resorte(c, COLISION, 340, 17);
  const encoge = resorte(c, COLISION + 36, 200, 20);
  const grande = lado * (m.chico ? 2.1 : 2.3);
  const final = lado - m.relleno * 2;
  const tam = Math.max(0, grande * nace * (1 - encoge) + final * encoge);
  const op = Math.min(1, nace * 1.5) * (1 - tramo(c, COLISION + 44, COLISION + 60));
  if (op <= 0) return null;
  const tajos = tramo(c, COLISION + 4, COLISION + 30, easeInOut);
  const mascara = `url(${MARCA_BLANCA})`;
  return (
    <div style={{
      position: 'absolute', left: cx - tam / 2, top: cy - tam / 2, width: tam, height: tam, opacity: op, pointerEvents: 'none',
      filter: `drop-shadow(0 0 ${18 * (1 - encoge)}px rgba(125,211,252,.9))`, transform: camara || undefined,
    }}>
      <img src={MARCA_BLANCA} alt="" style={{ display: 'block', width: '100%', height: '100%', maxWidth: 'none' }} />
      {/* Tres tajos de luz, como las rayas del logo */}
      {tajos > 0 && tajos < 1 && (
        <div style={{ ...CAPA, overflow: 'hidden', WebkitMaskImage: mascara, WebkitMaskSize: '100% 100%', maskImage: mascara, maskSize: '100% 100%' }}>
          {[0, 1, 2].map(k => (
            <div key={k} style={{
              position: 'absolute', top: '-50%', height: '200%', width: '9%', left: `${-30 + tajos * 160 - k * 14}%`,
              background: 'linear-gradient(90deg, transparent, #38bdf8, transparent)', transform: 'rotate(35deg)',
            }} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------- Acto 3: el botón empieza como barra de carga ---------------- */

/** La barra se llena y, al completarse, se abre hasta ser el botón "Ingresar al portal". Tapa al botón real mientras tanto. */
function Barra({ c, m }: { c: number; m: Medidas }) {
  const { x, y, w, h } = m.boton;
  const aparece = tramo(c, T0 + 30, T0 + 40);
  if (aparece <= 0) return null;
  const carga = tramo(c, T0 + 34, T0 + 82, curvaCarga);
  const abre = resorte(c, T0 + 82, 300, 19);
  const alto = Math.max(4, 4 + (h - 4) * abre);
  const texto = tramo(c, T0 + 88, T0 + 102);
  const brillo = tramo(c, T0 + 98, T0 + 124, easeInOut);
  const rotulo: CSSProperties = {
    position: 'absolute', top: h / 2 - 22, fontFamily: MONO, fontSize: 11, lineHeight: 'normal',
    letterSpacing: '0.12em', color: 'rgba(125,211,252,.85)', opacity: Math.max(0, 1 - abre * 2.5), whiteSpace: 'pre',
  };
  return (
    <div aria-hidden style={{ position: 'absolute', left: x, top: y, width: w, height: h, margin: 0, opacity: aparece, pointerEvents: 'none' }}>
      {/* Riel de la barra */}
      {abre < 0.6 && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: h / 2 - 2, height: 4, borderRadius: 2, background: 'rgba(56,189,248,.14)', opacity: 1 - abre }} />
      )}
      {abre < 0.4 && <div style={{ ...rotulo, right: 0 }}>{Math.round(carga * 100).toString().padStart(3, ' ')}%</div>}
      {abre < 0.4 && <div style={{ ...rotulo, left: 0 }}>{carga < 1 ? 'CARGANDO PORTAL' : 'LISTO'}</div>}
      <div style={{
        position: 'absolute', left: 0, top: (h - alto) / 2, height: alto, width: `${carga * 100}%`,
        borderRadius: 2 + 10 * Math.min(1, abre), overflow: 'hidden',
        background: 'linear-gradient(to right, #0284c7, #38bdf8)',
        boxShadow: abre > 0.05 ? `0 8px 24px -8px rgba(56,189,248,${0.6 * Math.min(1, abre)})` : '0 0 14px 2px rgba(56,189,248,.7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontWeight: 700, fontSize: 16, lineHeight: 1.5, whiteSpace: 'nowrap',
      }}>
        {brillo > 0 && brillo < 1 && (
          <span style={{ position: 'absolute', inset: 0, transform: `translateX(${-100 + brillo * 200}%)`, background: 'linear-gradient(to right, transparent, rgba(255,255,255,.35), transparent)' }} />
        )}
        <span style={{ opacity: texto, transform: `translateY(${(1 - texto) * 8}px)` }}>
          Ingresar al portal{' '}
          <span style={{ display: 'inline-block', transform: `translateX(${(1 - texto) * -10}px)` }}>→</span>
        </span>
      </div>
      {/* Punta brillante de la barra */}
      {carga > 0 && abre < 0.2 && (
        <div style={{ position: 'absolute', left: `calc(${carga * 100}% - 6px)`, top: h / 2 - 6, width: 12, height: 12, borderRadius: '50%', background: '#fff', boxShadow: '0 0 16px 6px rgba(56,189,248,.9)', opacity: 1 - abre * 5 }} />
      )}
    </div>
  );
}
