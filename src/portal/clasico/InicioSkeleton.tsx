/** Estructura del Inicio mientras llegan sus datos o se descarga la pestaña. */
const ALTURAS = [35, 60, 45, 80, 55, 70, 40, 65, 90, 50, 75, 60, 30, 55, 70, 45, 85, 60, 40, 75, 55, 90, 65, 45, 80, 60, 35, 70, 50, 85];

function Linea({ clase = '' }: { clase?: string }) {
  return <span className={`esq-linea ini-esq-linea ${clase}`} />;
}

function Filas({ pedidos = false }: { pedidos?: boolean }) {
  return <div className="mini-lista">{Array.from({ length: 6 }, (_, i) => (
    <div key={i}>
      {pedidos && <span className="esq-linea ini-esq-foto" />}
      <div className="info ini-esq-info"><Linea /><Linea clase="ini-esq-corta" /></div>
      <Linea clase="ini-esq-importe" />
    </div>
  ))}</div>;
}

export function InicioSkeleton() {
  return <div className="inicio-esqueleto" role="status" aria-busy="true" aria-label="Cargando inicio del portal">
    <div aria-hidden="true">
      <div className="dash-cab"><div className="ini-esq-cab"><Linea clase="ini-esq-titulo" /><Linea /></div></div>
      <div className="kpis">{[0, 1, 2, 3].map(i => (
        <div className="kpi ini-esq-kpi" key={i}><Linea /><Linea clase="ini-esq-valor" /><Linea clase="ini-esq-corta" /></div>
      ))}</div>
      <div className="dash">
        <section className="tarjeta c4"><div className="ini-esq-encabezado"><Linea /></div>
          <div className="dona"><div className="dona-svg ini-esq-dona"><Linea clase="ini-esq-corta" /></div>
            <div className="ini-esq-leyenda"><Linea /><Linea /></div>
          </div>
        </section>
        <section className="tarjeta c8"><div className="ini-esq-encabezado"><Linea /></div>
          <div className="colbar">{ALTURAS.map((altura, i) => <div className="cb" key={i}><span className="esq-linea ini-esq-barra" style={{ height: `${altura}%` }} /></div>)}</div>
          <div className="ini-esq-eje"><Linea clase="ini-esq-corta" /><Linea clase="ini-esq-corta" /></div>
        </section>
      </div>
      <div className="dash">
        <section className="tarjeta c6"><div className="ini-esq-encabezado"><Linea /></div><Filas pedidos /></section>
        <section className="tarjeta c6"><div className="ini-esq-encabezado"><Linea /></div><Filas /></section>
      </div>
    </div>
  </div>;
}
