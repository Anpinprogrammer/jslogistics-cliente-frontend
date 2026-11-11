import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowDown,
  ArrowRight,
  Check,
  CheckCheck,
  ChevronRight,
  CircleCheck,
  ClipboardList,
  Mail,
  MapPin,
  Package,
  Receipt,
  Route,
  Search,
  ShieldCheck,
  Truck,
} from "lucide-react";
import HeroCarrusel from "../components/HeroCarrusel";
import Navbar from "../components/layout/Navbar";
import LandingFooter from "../components/layout/LandingFooter";
import "./landing.css";
import { AnimatedCounter } from "../components/ui/AnimatedCounter";

function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Solo se oculta tras instalar el observador: sin JS el contenido sigue legible.
    el.dataset.reveal = "pending";
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.dataset.reveal = "visible";
          observer.disconnect();
        }
      },
      { threshold: 0.08 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={`landing-reveal ${className}`}
      style={{ "--reveal-delay": `${delay}ms` } as CSSProperties}
    >
      {children}
    </div>
  );
}

const services = [
  {
    icon: Truck,
    number: "01",
    title: "Envíos para tu empresa",
    text: "Coordina tus pedidos y consulta el estado de cada entrega desde tu portal.",
    tag: "Distribución",
    className: "lg:col-span-2",
  },
  {
    icon: Search,
    number: "02",
    title: "Seguimiento de pedidos",
    text: "Una guía, un estado claro. Consulta el recorrido de tu envío sin perderte entre mensajes.",
    tag: "Trazabilidad",
    className: "",
  },
  {
    icon: Receipt,
    number: "03",
    title: "Cuentas claras",
    text: "Revisa tus movimientos y el detalle de tu operación en un mismo lugar.",
    tag: "Control financiero",
    className: "",
  },
  {
    icon: ClipboardList,
    number: "04",
    title: "Tu operación, organizada",
    text: "Centraliza la información de tus destinatarios y pedidos para trabajar con más orden.",
    tag: "Portal empresarial",
    className: "lg:col-span-2",
  },
];
const steps = [
  {
    icon: ClipboardList,
    title: "Registra tu empresa",
    text: "Crea tu cuenta y da el primer paso para organizar tus envíos.",
  },
  {
    icon: Package,
    title: "Crea tu pedido",
    text: "Ingresa los datos de recogida, entrega y destinatario.",
  },
  {
    icon: Truck,
    title: "Sigue la entrega",
    text: "Consulta las novedades de tu pedido durante su recorrido.",
  },
  {
    icon: CheckCheck,
    title: "Mantén el control",
    text: "Revisa tus pedidos y movimientos desde tu portal.",
  },
];

export default function Home() {
  const [guia, setGuia] = useState("");
  const navigate = useNavigate();
  return (
    <div className="landing">
      <Navbar hero />
      <section className="landing-hero relative isolate flex min-h-dvh w-full flex-col overflow-hidden bg-slate-950 pt-16 lg:pt-20">
        <HeroCarrusel />
        <div
          aria-hidden="true"
          className="landing-hero-fade pointer-events-none absolute inset-x-0 bottom-0 z-10 h-28 sm:h-36"
        />
        <div className="landing-shell relative z-20 flex flex-1 flex-col items-center justify-center gap-6 py-6 lg:grid lg:grid-cols-12 lg:gap-x-12 lg:gap-y-6 lg:py-8 lg:content-center">
          <div className="w-full min-w-0 shrink-0 lg:col-span-7 lg:col-start-1 lg:row-start-1">
            <div className="landing-enter mb-4 inline-flex items-center gap-2.5 rounded-full border border-sky-400/30 bg-sky-400/10 px-3 py-2 text-[10px] font-bold uppercase tracking-[.16em] text-sky-200 sm:text-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-300" /> Desde
              Cali. Conectados contigo.
            </div>
            <h1
              className="landing-enter text-3xl font-black uppercase tracking-tight leading-none text-white sm:text-5xl lg:text-6xl xl:text-7xl"
              style={{ animationDelay: "80ms" }}
            >
              Tu negocio avanza.
              <br />
              <span className="text-sky-300">
                Nosotros lo
                <br className="hidden xl:block" /> movemos
              </span>
            </h1>
            <p
              className="landing-enter mt-4 max-w-lg text-sm leading-relaxed text-slate-300 sm:text-base lg:mt-6 lg:text-lg"
              style={{ animationDelay: "160ms" }}
            >
              Detrás de cada envío hay una promesa. Conecta tu empresa con sus
              clientes y mantén el control de tus pedidos, de principio a fin.
            </p>
          </div>
          <div
            className="landing-enter w-full min-w-0 max-w-md shrink-0 lg:col-span-5 lg:col-start-8 lg:row-start-1 lg:row-span-2 lg:max-w-lg lg:self-center"
            style={{ animationDelay: "320ms" }}
          >
            {/* Un solo formulario (sin ids ni formularios repetidos): en celular es una barra de una línea
                con la lupa dentro; desde lg es la tarjeta con encabezado y botón con texto. */}
            <div className="landing-tracking relative z-20 w-full lg:rounded-3xl lg:border lg:border-slate-800/90 lg:bg-slate-900/90 lg:p-7 lg:shadow-2xl lg:backdrop-blur-2xl">
              <div className="mb-4 hidden lg:block">
                <h2 className="mb-1 text-2xl font-bold text-white">
                  ¿Dónde va tu envío?
                </h2>
                <p className="text-xs leading-relaxed text-slate-400">
                  Ingresa tu número de guía para conocer el estado en tiempo
                  real.
                </p>
              </div>
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  const q = guia.trim();
                  navigate(q ? `/track?n=${encodeURIComponent(q)}` : "/track");
                }}
              >
                <label htmlFor="guiaHero" className="sr-only">
                  Número de guía o pedido
                </label>
                <div className="relative">
                  <Package
                    size={19}
                    className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-slate-400 lg:left-3 lg:top-[23px]"
                  />
                  <input
                    id="guiaHero"
                    value={guia}
                    onChange={(e) => setGuia(e.target.value)}
                    placeholder="Número de guía"
                    enterKeyHint="search"
                    autoComplete="off"
                    className="w-full min-w-0 rounded-2xl border border-slate-700/80 bg-slate-900/90 py-3.5 pl-11 pr-14 text-sm font-medium text-white shadow-xl backdrop-blur-md transition-all placeholder:text-slate-400 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400 lg:rounded-xl lg:border-slate-800 lg:bg-slate-950 lg:py-3 lg:pl-10 lg:pr-4 lg:shadow-none lg:placeholder:text-slate-500"
                  />
                  <button
                    type="submit"
                    aria-label="Rastrear envío"
                    className="absolute right-1.5 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-xl bg-sky-400 text-slate-950 shadow-md shadow-sky-500/20 transition-all hover:bg-sky-300 active:scale-95 lg:static lg:mt-3 lg:flex lg:h-auto lg:min-h-[44px] lg:w-full lg:translate-y-0 lg:items-center lg:justify-center lg:gap-2 lg:py-3 lg:text-sm lg:font-bold"
                  >
                    <span className="hidden lg:inline">Rastrear mi envío</span>
                    <Search size={18} />
                  </button>
                </div>
              </form>
              <p className="mt-3 text-center text-[11px] text-slate-400 lg:mt-4 lg:border-t lg:border-slate-800 lg:pt-4 lg:text-left lg:text-xs">
                ¿Ya eres cliente?{" "}
                <Link
                  to="/login"
                  className="font-bold text-sky-300 hover:underline lg:font-semibold lg:text-sky-200 lg:underline lg:decoration-sky-300/30 lg:underline-offset-4"
                >
                  Ingresa a tu portal →
                </Link>
              </p>
            </div>
          </div>
          <div className="w-full min-w-0 shrink-0 lg:col-span-7 lg:col-start-1 lg:row-start-2">
            <div
              className="landing-enter flex w-full flex-col gap-3 lg:flex-row"
              style={{ animationDelay: "240ms" }}
            >
              <Link
                to="/register"
                className="flex w-full min-h-[44px] items-center justify-center gap-2 rounded-2xl bg-sky-400 px-5 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-sky-500/20 transition-all hover:bg-sky-300 active:scale-95 lg:w-auto"
              >
                Quiero enviar <ArrowRight size={18} />
              </Link>
              <a
                href="#nosotros"
                className="flex w-full min-h-[44px] items-center justify-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/60 px-5 py-3 text-xs font-semibold text-slate-300 transition-colors hover:bg-slate-800 lg:w-auto"
              >
                Conoce JS Logistics <ArrowDown size={16} />
              </a>
            </div>
            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-xs text-slate-300">
              <span className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-sky-300" /> Atención a
                empresas
              </span>
              <span className="flex items-center gap-2">
                <MapPin size={16} className="text-sky-300" /> Cali, Colombia
              </span>
            </div>
          </div>
        </div>
        <div
          role="region"
          aria-label="JS Logistics en cifras"
          className="relative z-20 w-full shrink-0 border-t border-slate-800/80 bg-slate-950/90 py-4 backdrop-blur-md lg:py-5"
        >
          <div className="landing-shell">
            <div className="grid grid-cols-2 items-stretch gap-x-4 md:grid-cols-4 lg:gap-x-8">
              {[
                {
                  end: 15000,
                  suffix: "+",
                  label: "Envíos mensuales",
                  color: "text-sky-400",
                },
                {
                  end: 99.4,
                  decimals: 1,
                  suffix: "%",
                  label: "Entregas a tiempo",
                  color: "text-emerald-400",
                },
                {
                  end: 180,
                  suffix: "+",
                  label: "Municipios cubiertos",
                  color: "text-indigo-400",
                },
                {
                  end: 15,
                  prefix: "< ",
                  suffix: " min",
                  label: "Respuesta en soporte",
                  color: "text-cyan-400",
                },
              ].map(({ label, color, ...counter }, i) => (
                <div
                  key={label}
                  className={`flex min-w-0 flex-col items-center justify-center p-2 text-center ${i % 2 === 1 ? "border-l border-slate-800/60" : ""} ${i >= 2 ? "border-t border-slate-800/60 md:border-t-0" : ""} ${i === 2 ? "md:border-l md:border-slate-800/60" : ""}`}
                >
                  <div className="text-xl font-black tracking-tight text-white sm:text-2xl lg:text-3xl">
                    <AnimatedCounter {...counter} />
                  </div>
                  <span
                    className={`mt-0.5 text-[10px] font-semibold uppercase tracking-wider sm:text-xs ${color}`}
                  >
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        aria-label="Tu operación de un vistazo"
        className="landing-highlights relative z-30 border-t border-slate-200 py-12 dark:border-slate-800/80 lg:py-16"
      >
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-1/2 border-t border-slate-200 dark:border-slate-800/80"
        />
        <div className="landing-shell relative grid grid-cols-2 gap-3 md:grid-cols-4 sm:gap-4">
          {[
            { icon: Package, title: "Pedidos", text: "En un mismo lugar" },
            { icon: Route, title: "Seguimiento", text: "Consulta cada estado" },
            {
              icon: Receipt,
              title: "Movimientos",
              text: "Información organizada",
            },
            { icon: MapPin, title: "Cali", text: "Nuestra ciudad de origen" },
          ].map(({ icon: Icon, title, text }, i) => (
            <Reveal key={title} delay={i * 60}>
              <div className="landing-surface h-full rounded-2xl border p-4 shadow-lg sm:p-6">
                <Icon size={22} className="landing-accent mb-3" />
                <h2 className="break-words text-xl font-bold sm:text-2xl">
                  {title}
                </h2>
                <p className="landing-muted mt-1 text-xs leading-relaxed">
                  {text}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
      <section
        id="nosotros"
        className="landing-section landing-about relative isolate overflow-hidden"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-20 top-1/4 -z-10 h-96 w-96 rounded-full bg-sky-500/10 blur-3xl dark:bg-sky-500/15"
        />
        <div className="landing-shell grid grid-cols-1 gap-y-8 lg:grid-cols-2 lg:gap-x-20 lg:gap-y-0">
          <Reveal className="min-w-0 lg:col-start-2 lg:row-start-1 lg:self-end">
            <p className="landing-eyebrow">01 / Somos JS Logistics</p>
            <h2 className="landing-heading mt-4">
              La logística se trata de{" "}
              <span className="landing-accent">conectar personas.</span>
            </h2>
          </Reveal>
          {/* En celular la foto va entre el título y el texto; desde lg queda a la izquierda, ocupando las dos filas. */}
          <Reveal className="relative min-w-0 lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:self-center">
            <div className="relative overflow-hidden rounded-[1.75rem] bg-slate-900">
              <img
                src="/img/hero/mensajero-1280.webp"
                alt="Vehículo de reparto en una operación logística"
                loading="lazy"
                width={1280}
                height={960}
                className="aspect-square w-full object-cover min-[400px]:aspect-[5/4] sm:aspect-[4/3]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />
              {/* Antes de lg el texto de la foto sube para dejarle el borde inferior a la tarjeta blanca. */}
              <div
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-3/5 bg-gradient-to-b from-slate-950/80 to-transparent lg:hidden"
              />
              <div className="absolute inset-x-5 top-5 flex items-start justify-between gap-4 text-white sm:inset-x-8 sm:top-8 lg:bottom-8 lg:top-auto lg:items-end">
                <div>
                  <p className="mb-2 text-[10px] uppercase tracking-[.14em] text-sky-200 sm:tracking-[.2em]">
                    El origen de cada recorrido
                  </p>
                  <p className="font-display text-2xl font-bold sm:text-4xl">
                    Cali, Valle del Cauca.
                  </p>
                </div>
                <MapPin size={32} className="h-7 w-7 shrink-0 text-sky-300 sm:h-8 sm:w-8" />
              </div>
            </div>
            <div className="landing-surface landing-about-badge absolute inset-x-4 bottom-4 flex items-center gap-3 rounded-2xl border p-3.5 shadow-lg sm:inset-x-6 sm:bottom-6 sm:gap-4 sm:p-4 lg:relative lg:inset-x-auto lg:bottom-auto lg:mx-8 lg:-mt-5 lg:p-5">
              <span className="landing-icon">
                <ShieldCheck size={24} />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold leading-snug sm:text-base">
                  Tu empresa tiene quién la mueva.
                </p>
                <p className="landing-muted mt-0.5 text-xs sm:mt-1 sm:text-sm">
                  Una relación cercana, en cada entrega.
                </p>
              </div>
            </div>
          </Reveal>
          <Reveal delay={100} className="min-w-0 lg:col-start-2 lg:row-start-2 lg:self-start">
            <p className="landing-muted text-base leading-relaxed sm:text-lg lg:mt-6">
              Tus clientes esperan más que un paquete. Esperan que cumplas.
              Acompañamos a las empresas en la gestión de sus envíos, con
              información organizada y una atención cercana.
            </p>
            <div className="mt-8 space-y-5">
              {[
                {
                  icon: Route,
                  title: "Visibilidad en cada paso",
                  text: "Consulta el estado de tus pedidos desde un mismo lugar.",
                },
                {
                  icon: Receipt,
                  title: "Información que te da control",
                  text: "Pedidos y movimientos claros para tu operación.",
                },
              ].map(({ icon: Icon, title, text }) => (
                <div key={title} className="flex items-start gap-4">
                  <span className="landing-icon shrink-0">
                    <Icon size={21} />
                  </span>
                  <div>
                    <h3 className="text-base font-bold">{title}</h3>
                    <p className="landing-muted mt-1 text-sm leading-relaxed">
                      {text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <a href="#servicios" className="landing-text-link mt-8">
              Así podemos ayudarte <ArrowRight size={17} />
            </a>
          </Reveal>
        </div>
      </section>

      <section
        id="servicios"
        className="landing-section landing-services relative isolate overflow-hidden border-y"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 bottom-1/4 -z-10 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl dark:bg-indigo-500/15"
        />
        <div className="landing-shell">
          <Reveal className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div className="max-w-xl">
              <p className="landing-eyebrow">02 / Soluciones que conectan</p>
              <h2 className="landing-heading mt-4">
                Menos fricción.
                <br />
                <span className="landing-accent">Más movimiento.</span>
              </h2>
            </div>
            <p className="landing-muted max-w-sm text-base leading-relaxed">
              Del primer pedido al cierre de cuentas. Herramientas para que te
              concentres en hacer crecer tu negocio.
            </p>
          </Reveal>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
            {services.map(
              ({ icon: Icon, number, title, text, tag, className }, i) => (
                <Reveal key={number} delay={(i % 2) * 80} className={className}>
                  <article className="landing-service landing-surface group relative h-full overflow-hidden rounded-3xl border p-6 sm:p-8">
                    <div className="flex items-start justify-between gap-4">
                      <span className="landing-icon">
                        <Icon size={25} />
                      </span>
                      <span className="landing-muted font-mono text-xs">
                        /{number}
                      </span>
                    </div>
                    <div className="mt-9 max-w-md">
                      <p className="landing-accent mb-3 text-[10px] font-bold uppercase tracking-[.18em]">
                        {tag}
                      </p>
                      <h3 className="text-2xl font-bold sm:text-3xl">
                        {title}
                      </h3>
                      <p className="landing-muted mt-3 text-sm leading-relaxed sm:text-base">
                        {text}
                      </p>
                    </div>
                    <div aria-hidden="true" className="landing-service-line" />
                  </article>
                </Reveal>
              ),
            )}
          </div>
        </div>
      </section>

      <section
        id="plataforma"
        className="landing-section landing-platform relative isolate overflow-hidden border-b"
      >
        <div className="landing-shell grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-16">
          <Reveal className="min-w-0 lg:col-span-5">
            <p className="landing-eyebrow">03 / Tu centro de operaciones</p>
            <h2 className="landing-heading mt-4">
              Todo conectado.
              <br />
              <span className="landing-accent">Todo más claro.</span>
            </h2>
            <p className="landing-muted mt-6 text-base leading-relaxed">
              Tu portal reúne la información que necesitas para gestionar tu
              día. Menos búsquedas entre conversaciones. Más claridad para tomar
              decisiones.
            </p>
            <ul className="my-7 space-y-3">
              {[
                "Consulta tus pedidos y sus estados",
                "Revisa el detalle de cada entrega",
                "Mantén tus movimientos a la vista",
              ].map((text) => (
                <li key={text} className="flex items-center gap-3 text-sm">
                  <Check size={17} className="landing-accent shrink-0" />
                  {text}
                </li>
              ))}
            </ul>
            <Link to="/login" className="landing-text-link">
              Ir a mi portal <ArrowRight size={17} />
            </Link>
          </Reveal>
          <Reveal delay={120} className="min-w-0 lg:col-span-7">
            <div className="landing-dashboard landing-surface overflow-hidden rounded-2xl border shadow-xl sm:rounded-3xl">
              <div className="landing-divider flex items-center justify-between gap-3 border-b px-4 py-4 sm:px-6">
                <span className="flex items-center gap-2 text-sm font-bold">
                  <Package size={19} className="landing-accent" /> JS / Portal
                </span>
                <span className="landing-muted rounded-full border px-2 py-1 text-[10px]">
                  Vista ilustrativa
                </span>
              </div>
              <div className="p-4 sm:p-7">
                <div className="mb-6 flex items-start justify-between gap-3">
                  <div>
                    <p className="landing-muted text-xs">
                      Tu operación, en un solo lugar
                    </p>
                    <h3 className="mt-1 text-2xl font-bold sm:text-3xl">
                      Cada pedido cuenta.
                    </h3>
                  </div>
                  <span className="landing-icon hidden sm:flex">
                    <Route size={22} />
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 sm:gap-4">
                  {[
                    { value: "08", text: "En camino" },
                    { value: "24", text: "Entregados" },
                    { value: "32", text: "Pedidos" },
                  ].map((stat) => (
                    <div
                      key={stat.text}
                      className="landing-section-alt rounded-xl border p-3 sm:p-4"
                    >
                      <p className="text-2xl font-bold sm:text-3xl">
                        {stat.value}
                      </p>
                      <p className="landing-muted mt-1 text-[10px] sm:text-xs">
                        {stat.text}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex items-center justify-between">
                  <h4 className="text-sm font-bold">Últimos movimientos</h4>
                  <span className="landing-muted text-[10px]">
                    Datos de ejemplo
                  </span>
                </div>
                <div className="mt-2">
                  {[
                    { city: "Cali", state: "En camino", icon: Truck },
                    { city: "Palmira", state: "Entregado", icon: CircleCheck },
                    { city: "Yumbo", state: "Entregado", icon: CircleCheck },
                  ].map(({ city, state, icon: Icon }, i) => (
                    <div
                      key={city}
                      className="landing-divider flex items-center justify-between gap-2 border-b py-4 last:border-0"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="landing-icon !h-9 !w-9 !rounded-lg">
                          <Icon size={16} />
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-bold sm:text-sm">
                            Pedido #00{103 + i}
                          </p>
                          <p className="landing-muted text-xs">{city}</p>
                        </div>
                      </div>
                      <span
                        className={`rounded-full px-2 py-1 text-[10px] font-semibold sm:px-3 sm:text-xs ${i === 0 ? "bg-sky-500/10 text-sky-700 dark:text-sky-300" : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"}`}
                      >
                        {state}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section
        id="proceso"
        className="landing-section landing-process relative isolate overflow-hidden border-y"
      >
        <div className="landing-shell">
          <Reveal className="mx-auto mb-10 max-w-xl text-center">
            <span className="mb-3 inline-block rounded-full border border-sky-500/20 bg-sky-500/10 px-3.5 py-1 text-[10px] font-bold uppercase tracking-widest text-sky-700 dark:text-sky-400 sm:text-xs">
              04 / Así de sencillo
            </span>
            <h2 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Del clic a la entrega
            </h2>
            <p className="mt-2 text-xs font-medium text-slate-600 dark:text-slate-400 sm:text-sm">
              Un recorrido claro para ti y para tu negocio.
            </p>
          </Reveal>
          <div className="relative mx-auto max-w-2xl lg:max-w-none">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute bottom-7 left-7 top-7 z-0 border-l-2 border-dashed border-sky-300 dark:border-slate-800 sm:bottom-8 sm:left-8 sm:top-8 lg:hidden"
            />
            <div
              aria-hidden="true"
              className="landing-process-line pointer-events-none absolute left-8 right-8 top-8 hidden h-px lg:block"
            />
            <ol className="relative z-10 space-y-8 lg:grid lg:grid-cols-4 lg:gap-8 lg:space-y-0">
              {steps.map(({ icon: Icon, title, text }, i) => (
                <li key={title} className="min-w-0">
                  <Reveal delay={i * 90}>
                    <div className="group flex items-start gap-4 sm:gap-6 lg:flex-col lg:gap-5">
                      <div className="relative shrink-0">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-sky-500/30 bg-white shadow-md transition-colors group-hover:border-sky-500 dark:border-slate-800 dark:bg-slate-900 sm:h-16 sm:w-16">
                          <Icon
                            className="h-6 w-6 text-sky-600 dark:text-sky-400 sm:h-7 sm:w-7"
                            aria-hidden="true"
                          />
                        </div>
                      </div>
                      <div className="min-w-0 flex-1 pt-1 lg:w-full">
                        <div className="flex items-start gap-2">
                          <span
                            aria-hidden="true"
                            className="shrink-0 text-2xl font-black leading-none text-sky-700 dark:text-sky-400/20"
                          >
                            #0{i + 1}
                          </span>
                          <h3 className="text-base font-bold leading-snug text-slate-900 dark:text-white sm:text-lg">
                            {title}
                          </h3>
                        </div>
                        <p className="mt-1 w-full text-xs font-normal leading-relaxed text-slate-600 dark:text-slate-400 sm:text-sm">
                          {text}
                        </p>
                      </div>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section
        id="contacto"
        className="landing-section landing-closing relative isolate overflow-hidden border-t"
      >
        <div
          aria-hidden="true"
          className="landing-dot-mesh pointer-events-none absolute inset-0 -z-10"
        />
        <div className="landing-shell">
          <Reveal>
            <div className="landing-contact relative overflow-hidden rounded-3xl p-6 sm:p-10 lg:p-16">
              <div aria-hidden="true" className="landing-contact-orbit" />
              <div className="relative grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-end">
                <div className="lg:col-span-7">
                  <p className="text-xs font-bold uppercase tracking-[.18em] text-sky-200">
                    El siguiente paso es tuyo
                  </p>
                  <h2 className="mt-5 font-display text-4xl font-bold leading-[1.05] text-white sm:text-6xl lg:text-7xl">
                    Hagamos que
                    <br />
                    las cosas pasen.
                  </h2>
                  <p className="mt-6 max-w-lg text-base leading-relaxed text-slate-300">
                    Cuéntanos qué mueve tu negocio. Conversemos sobre tus envíos
                    y la forma de acompañar tu operación.
                  </p>
                  <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <Link
                      to="/register"
                      className="landing-button landing-button-primary"
                    >
                      Crear mi cuenta <ArrowRight size={18} />
                    </Link>
                    <a
                      href="mailto:info@jslogistics.co?subject=Quiero%20enviar%20con%20JS%20Logistics"
                      className="landing-button border border-white/25 text-white hover:bg-white/10"
                    >
                      Hablemos <Mail size={17} />
                    </a>
                  </div>
                </div>
                <div className="min-w-0 border-t border-white/20 pt-7 lg:col-span-5 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
                  <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-sky-200">
                    <Mail size={24} />
                  </span>
                  <p className="text-xs text-slate-300">Escríbenos a</p>
                  <a
                    href="mailto:info@jslogistics.co"
                    className="mt-2 inline-flex max-w-full items-center gap-2 break-all text-lg font-bold text-white underline-offset-4 hover:underline sm:text-xl"
                  >
                    info@jslogistics.co{" "}
                    <ChevronRight size={18} className="shrink-0" />
                  </a>
                  <p className="mt-4 text-xs leading-relaxed text-slate-300">
                    El enlace abre tu aplicación de correo para que puedas
                    enviarnos tu consulta.
                  </p>
                  <p className="mt-6 flex items-center gap-2 text-sm text-slate-300">
                    <MapPin size={16} /> Cali, Valle del Cauca
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
      <LandingFooter />
    </div>
  );
}
