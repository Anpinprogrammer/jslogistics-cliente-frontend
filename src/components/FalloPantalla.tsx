import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props { children: ReactNode }
interface Estado { fallo: boolean }

/** Si una página falla al dibujarse (un navegador viejo, un archivo de un despliegue anterior), se muestra este aviso
 *  en lugar de dejar la pantalla en blanco. App.tsx lo monta con `key` de la sección (`/track`, `/cliente`…), así al cambiar de página se reinicia sin volver a montar el portal en cada pestaña. */
export default class FalloPantalla extends Component<Props, Estado> {
  state: Estado = { fallo: false };

  static getDerivedStateFromError(): Estado { return { fallo: true }; }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('La página falló al mostrarse:', error, info.componentStack);
  }

  render() {
    if (!this.state.fallo) return this.props.children;
    return (
      <div role="alert" className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-4 text-center text-slate-900 dark:bg-slate-950 dark:text-white">
        <p className="text-xl font-black">No pudimos mostrar esta página</p>
        <p className="max-w-sm text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          Vuelve a cargarla. Si sigue igual, actualiza tu navegador o escríbenos por WhatsApp y te ayudamos.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button type="button" onClick={() => window.location.reload()} className="min-h-11 rounded-xl bg-sky-400 px-5 text-sm font-extrabold text-slate-950 transition-colors hover:bg-sky-300">Volver a cargar</button>
          <a href="/" className="flex min-h-11 items-center justify-center rounded-xl border border-slate-300 px-5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900">Ir al inicio</a>
        </div>
      </div>
    );
  }
}
