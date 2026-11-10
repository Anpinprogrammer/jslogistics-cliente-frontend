import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import "../../pages/landing.css";

export default function LandingFooter() {
  return (
    <footer className="landing-closing relative isolate overflow-hidden border-t py-10">
      <div
        aria-hidden="true"
        className="landing-dot-mesh pointer-events-none absolute inset-0 -z-10"
      />
      <div className="landing-shell">
        <div className="flex flex-col justify-between gap-8 sm:flex-row sm:items-start">
          <div>
            <Link
              to="/"
              className="font-display text-2xl font-bold tracking-wide"
            >
              JS LOGISTICS<span className="landing-accent">.</span>
            </Link>
            <p className="landing-muted mt-2 text-sm">
              Conectamos tu negocio con lo que sigue.
            </p>
          </div>
          <nav
            aria-label="Enlaces del pie de página"
            className="flex flex-wrap gap-x-6 gap-y-4 text-sm"
          >
            <a href="/#nosotros" className="hover:underline">
              Nosotros
            </a>
            <a href="/#servicios" className="hover:underline">
              Servicios
            </a>
            <a href="/#contacto" className="hover:underline">
              Contacto
            </a>
            <Link to="/login" className="landing-text-link">
              Mi portal <ArrowRight size={15} />
            </Link>
          </nav>
        </div>
        <div className="landing-divider landing-muted mt-8 flex flex-col justify-between gap-3 border-t pt-6 text-xs sm:flex-row">
          <p>
            © {new Date().getFullYear()} JS Logistics. Todos los derechos
            reservados.
          </p>
          <p>Cali, Colombia</p>
        </div>
      </div>
    </footer>
  );
}
