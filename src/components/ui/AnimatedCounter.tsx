import { useEffect, useState } from "react";

export interface CounterProps {
  end: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
}

const format = (value: number, decimals: number) =>
  value.toLocaleString("es-CO", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

export function AnimatedCounter({
  end,
  duration = 2000,
  decimals = 0,
  prefix = "",
  suffix = "",
}: CounterProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame: number | undefined;
    let startTime: number | null = null;
    const cancel = () => {
      if (frame !== undefined) cancelAnimationFrame(frame);
    };
    const animate = (timestamp: number) => {
      if (startTime === null) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount((1 - (1 - progress) ** 2) * end);
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    const start = () => {
      cancel();
      startTime = null;
      if (motion.matches || duration <= 0) {
        setCount(end);
        return;
      }
      setCount(0);
      frame = requestAnimationFrame(animate);
    };
    start();
    motion.addEventListener("change", start);
    return () => {
      cancel();
      motion.removeEventListener("change", start);
    };
  }, [end, duration]);

  // El lector de pantalla recibe solo el valor final, sin anuncios en cada cuadro.
  return (
    <span className="inline-grid tabular-nums">
      <span className="invisible col-start-1 row-start-1" aria-hidden="true">
        {prefix}
        {format(end, decimals)}
        {suffix}
      </span>
      <span className="col-start-1 row-start-1" aria-hidden="true">
        {prefix}
        {format(count, decimals)}
        {suffix}
      </span>
      <span className="sr-only">
        {prefix}
        {format(end, decimals)}
        {suffix}
      </span>
    </span>
  );
}
