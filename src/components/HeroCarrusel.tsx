import React, { useEffect, useState } from 'react';

/** Fotos del fondo del Hero. Cada una va en public/img/hero/ en dos tamaños WebP, <foto>-1280.webp y <foto>-1920.webp (ver LEEME.md). */
const DIAPOSITIVAS = [
  { foto: 'camiones', alt: 'Camiones de carga circulando por una autopista', fondo: 'radial-gradient(ellipse at 20% 80%, #0284c7 0%, transparent 55%), #0f1f3d' },
  { foto: 'mensajero', alt: 'Furgoneta de reparto de paquetes',     fondo: 'radial-gradient(ellipse at 80% 30%, #25508e 0%, transparent 55%), #0b1530' },
  { foto: 'centro',   alt: 'Centro de distribución con tecnología logística',  fondo: 'radial-gradient(ellipse at 50% 90%, #0ea5e9 0%, transparent 50%), #0f172a' },
  { foto: 'bodega',   alt: 'Terminal de carga nocturna con grúas de contenedores',    fondo: 'radial-gradient(ellipse at 30% 20%, #1e3f74 0%, transparent 55%), #070B19' },
];
const INTERVALO_MS = 5500;

const HeroCarrusel: React.FC = () => {
  const [actual, setActual] = useState(0);
  const [fallidas, setFallidas] = useState<Record<number, boolean>>({});
  // Solo se descargan la foto que se ve y la siguiente; las demás, cuando les va llegando el turno.
  const [vistas, setVistas] = useState<Record<number, boolean>>({ 0: true });
  const [pausado, setPausado] = useState(false);
  const [sinMovimiento, setSinMovimiento] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setSinMovimiento(mq.matches);
    const alCambiar = () => setSinMovimiento(mq.matches);
    mq.addEventListener('change', alCambiar);
    const alOcultar = () => setPausado(document.hidden);
    document.addEventListener('visibilitychange', alOcultar);
    return () => { mq.removeEventListener('change', alCambiar); document.removeEventListener('visibilitychange', alOcultar); };
  }, []);

  // Al abrir la página, la primera foto va sola; la siguiente se pide un poco después, para no competir con ella.
  useEffect(() => {
    setVistas(v => (v[actual] ? v : { ...v, [actual]: true }));
    const siguiente = (actual + 1) % DIAPOSITIVAS.length;
    const t = window.setTimeout(() => setVistas(v => (v[siguiente] ? v : { ...v, [siguiente]: true })), actual === 0 ? 2500 : 0);
    return () => window.clearTimeout(t);
  }, [actual]);

  // `actual` en las dependencias reinicia el temporizador cuando se elige una diapositiva a mano.
  useEffect(() => {
    if (pausado || sinMovimiento) return;
    const t = window.setTimeout(() => setActual(i => (i + 1) % DIAPOSITIVAS.length), INTERVALO_MS);
    return () => window.clearTimeout(t);
  }, [actual, pausado, sinMovimiento]);

  return (
    <>
      {/* Fotos con desvanecimiento de 1 s */}
      <div className="absolute inset-0" aria-hidden="true">
        {DIAPOSITIVAS.map((d, i) => (
          <div key={d.foto}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${i === actual ? 'opacity-100' : 'opacity-0'}`}
            style={{ background: d.fondo }}>
            {vistas[i] && !fallidas[i] && (
              <img src={`/img/hero/${d.foto}-1920.webp`} srcSet={`/img/hero/${d.foto}-1280.webp 1280w, /img/hero/${d.foto}-1920.webp 1920w`} sizes="100vw"
                alt="" decoding="async"
                onError={() => setFallidas(f => ({ ...f, [i]: true }))}
                className={`absolute inset-0 h-full w-full object-cover ${!sinMovimiento && i === actual ? 'hero-zoom' : ''}`} />
            )}
          </div>
        ))}
      </div>

      {/* Capas de legibilidad: azul noche 70–85 %, tinte corporativo y malla */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#070B19]/85 via-[#0f172a]/75 to-[#070B19]/85" aria-hidden="true" />
      <div className="absolute inset-0 bg-[#0284c7]/20 mix-blend-multiply" aria-hidden="true" />
      <div className="absolute inset-0 backdrop-blur-[2px]" aria-hidden="true" />
      <div className="absolute inset-0 opacity-[0.06]" aria-hidden="true"
        style={{
          backgroundImage: 'linear-gradient(rgba(148,176,207,1) 1px, transparent 1px), linear-gradient(90deg, rgba(148,176,207,1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />
      <div className="absolute inset-0" aria-hidden="true"
        style={{ backgroundImage: 'radial-gradient(ellipse at 50% 0%, rgba(56,189,248,0.14) 0%, transparent 60%)' }} />

      {/* Indicadores: barra cian que se expande en la activa */}
      <div className="absolute bottom-24 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2"
        role="tablist" aria-label="Imágenes del carrusel"
        onMouseEnter={() => setPausado(true)} onMouseLeave={() => setPausado(document.hidden)}>
        {DIAPOSITIVAS.map((d, i) => (
          <button key={d.foto} type="button" role="tab" aria-selected={i === actual} aria-label={`Imagen ${i + 1}: ${d.alt}`}
            onClick={() => setActual(i)}
            className={`relative h-1.5 overflow-hidden rounded-full bg-white/25 transition-all duration-500 hover:bg-white/40 ${i === actual ? 'w-12' : 'w-4'}`}>
            {i === actual && (
              <span key={`${actual}-${pausado}`} className={`absolute inset-y-0 left-0 rounded-full bg-[#38bdf8] shadow-[0_0_10px_#38bdf8] ${sinMovimiento ? 'w-full' : 'hero-progreso'}`}
                style={{ animationDuration: `${INTERVALO_MS}ms`, animationPlayState: pausado ? 'paused' : 'running' }} />
            )}
          </button>
        ))}
      </div>
    </>
  );
};

export default HeroCarrusel;
